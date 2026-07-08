import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Account } from '../entities/account.entity';
import { SearchUserDto } from '../dto/user/search-user.dto';

@Injectable()
export class UserRepository {
    constructor(
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,

        private readonly dataSource: DataSource,
    ) { }

    async createFullUser(userData: Partial<User>, accountData: Partial<Account>) {
        return await this.dataSource.transaction(async (manager) => {
            const user = manager.create(User, userData);
            const savedUser = await manager.save(user);

            const account = manager.create(Account, {
                ...accountData,
                userId: savedUser.id,
            });

            const savedAccount = await manager.save(account);

            return {
                user: savedUser,
                account: savedAccount,
            };
        });
    }

    async getAll(page = 1, limit = 10) {
        const [users, total] = await this.userRepo.findAndCount({
            relations: ['accounts', 'accounts.role'],
            order: { id: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        });

        const data = users.map((user) => {
            const account = user.accounts?.[0];

            return {
                id: user.id,
                fullName: user.fullName,
                email: user.email,
                username: account?.username,
                role: account?.role?.name,
                position: user.position,
                avatarUrl: user.avatarUrl,
                avatarPublicId: user.avatarPublicId,
                dob: user.dob,
                isActive: user.isActive,
                status: user.isActive ? 'Active' : 'Inactive',
            };
        });

        return {
            data, total, page, lastPage: Math.ceil(total / limit),
        }
    }

    async findById(id: number) {
        return await this.userRepo.findOne({
            where: { id },
            relations: {
                accounts: {
                    role: true,
                },
            },
        });
    }

    async findByEmail(email: string) {
        return await this.userRepo.findOne({
            where: { email },
        });
    }

    async search(query: SearchUserDto) {
        try {
            const page = Number(query.page) > 0 ? Number(query.page) : 1;
            const limit = Number(query.limit) > 0 ? Number(query.limit) : 10;
            const skip = (page - 1) * limit;

            const qb = this.userRepo
                .createQueryBuilder('user')
                .leftJoinAndSelect('user.accounts', 'account')
                .leftJoinAndSelect('account.role', 'role');

            if (query.fullName) {
                qb.andWhere('user.fullName ILIKE :fullName', {
                    fullName: `%${query.fullName}%`,
                });
            }

            if (query.email) {
                qb.andWhere('user.email ILIKE :email', {
                    email: `%${query.email}%`,
                });
            }

            if (query.username) {
                qb.andWhere('account.username ILIKE :username', {
                    username: `%${query.username}%`,
                });
            }

            if (query.position) {
                qb.andWhere('user.position ILIKE :position', {
                    position: `%${query.position}%`,
                });
            }

            if (query.roleId !== undefined && query.roleId !== null) {
                const roleId = Number(query.roleId);
                if (!isNaN(roleId)) {
                    qb.andWhere('role.id = :roleId', { roleId });
                }
            }

            if (query.isActive !== undefined) {
                const isActive =
                    typeof query.isActive === 'string'
                        ? query.isActive === 'true'
                        : query.isActive;

                qb.andWhere('user.isActive = :isActive', { isActive });
            }

            qb.orderBy('user.id', 'DESC');

            qb.skip(skip).take(limit);

            const [users, total] = await qb.getManyAndCount();

            const data = users.map(user => {
                const acc = user.accounts?.[0];

                return {
                    id: user.id,
                    fullName: user.fullName,
                    username: acc?.username ?? '',
                    email: user.email,
                    role: acc?.role?.name ?? '',
                    position: user.position ?? '',
                    avatarUrl: user.avatarUrl ?? '',
                    avatarPublicId: user.avatarPublicId ?? '',
                    dob: user.dob,
                    isActive: user.isActive,
                    status: user.isActive ? 'Active' : 'Inactive',
                };
            });

            return {
                data,
                meta: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit),
                },
            };
        } catch (error) {
            console.error('SEARCH ERROR DETAIL:', error);
            throw error;
        }
    }

    async update(id: number, data: Partial<User>) {
        await this.userRepo.update(id, data);
        return await this.findById(id);
    }

    async delete(id: number) {
        return await this.userRepo.delete(id);
    }

    async findAllForExport() {
        return this.userRepo
            .createQueryBuilder('user')
            .leftJoinAndSelect('user.accounts', 'account')
            .leftJoinAndSelect('account.role', 'role')
            .getMany();
    }

    async save(user: User) {
        return this.userRepo.save(user);
    }
}