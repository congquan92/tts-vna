import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { User } from '../entities/user.entity';
import { Account } from '../entities/account.entity';
import { Otp } from '../entities/otp.entity';
import { RolePermission } from '../entities/role-permission.entity';
import { Role } from '../entities/role.entity';
import { Business } from '../entities/business.entity';

@Injectable()
export class AuthRepository {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Business)
        private readonly businessRepository: Repository<Business>,
        @InjectRepository(Account)
        private readonly accountRepository: Repository<Account>,
        @InjectRepository(Otp)
        private readonly otpRepository: Repository<Otp>,
        @InjectRepository(Role)
        private roleRepository: Repository<Role>,
        private readonly dataSource: DataSource,
    ) { }

    async createFullUser(userData: Partial<User>, accountData: { username: string, password: string, roleId: number }): Promise<{ user: User, account: Account }> {
        return await this.dataSource.transaction(async (manager) => {
            const user = manager.create(User, userData);
            const savedUser = await manager.save(user);
            const account = manager.create(Account, {
                ...accountData,
                userId: savedUser.id
            });
            const savedAccount = await manager.save(account);

            return { user: savedUser, account: savedAccount };
        });
    }

    async findUserById(id: number): Promise<User | null> {
        return await this.userRepository.findOne({ where: { id } });
    }

    async findBusinessById(id: number): Promise<Business | null> {
        return await this.businessRepository.findOne({ where: { id } });
    }

    async findUserByEmail(email: string): Promise<User | null> {
        return await this.userRepository.findOneBy({ email });
    }

    async updateUser(user: User): Promise<User> {
        return await this.userRepository.save(user);
    }

    async findAccountById(id: number): Promise<Account | null> {
        return this.accountRepository
            .createQueryBuilder('account')
            .addSelect('account.password')
            .leftJoinAndSelect('account.role', 'role')
            .leftJoinAndSelect('account.user', 'user')
            .leftJoinAndSelect('account.business', 'business')
            .where('account.id = :id', { id })
            .getOne();
    }

    async updateAccount(account: Account): Promise<Account> {
        return await this.accountRepository.save(account);
    }

    async saveOtp(accountId: number, otp: string, expiresAt: Date): Promise<Otp> {
        let otpRecord = await this.otpRepository.findOneBy({ accountId });
        if (otpRecord) {
            otpRecord.otp = otp;
            otpRecord.expiresAt = expiresAt;
            otpRecord.attemptCount = 0;
        } else {
            otpRecord = this.otpRepository.create({ accountId, otp, expiresAt, attemptCount: 0, });
        }
        return await this.otpRepository.save(otpRecord);
    }

    async findOtp(accountId: number): Promise<Otp | null> {
        return await this.otpRepository.findOneBy({ accountId });
    }

    async updateOtp(email: string, data: Partial<Otp>): Promise<void> {
        await this.otpRepository.update(
            { email } as any,
            data,
        );
    }

    async deleteOtp(accountId: number): Promise<void> {
        await this.otpRepository.delete({ accountId });
    }

    async findOtpByEmail(email: string): Promise<Otp | null> {
        return await this.otpRepository
            .createQueryBuilder('otp')
            .leftJoin('otp.account', 'account')
            .leftJoin('account.user', 'user')
            .leftJoin('account.business', 'business')
            .where('user.email = :email OR business.email = :email', { email })
            .getOne();
    }

    async findRegisterOtpByEmail(email: string): Promise<Otp | null> {
        return await this.otpRepository
            .createQueryBuilder('otp')
            .where('otp.email = :email', { email })
            .getOne();
    }

    async findAccountByUsername(username: string) {
        return this.accountRepository
            .createQueryBuilder('account')
            .addSelect('account.password')
            .leftJoinAndSelect('account.role', 'role')
            .leftJoinAndSelect('account.user', 'user')
            .leftJoinAndSelect('account.business', 'business')
            .where('account.username = :username', { username })
            .getOne();
    }

    async findAccountByEmail(email: string): Promise<Account | null> {
        return await this.accountRepository
            .createQueryBuilder('account')
            .leftJoinAndSelect('account.user', 'user')
            .leftJoinAndSelect('account.business', 'business')
            .leftJoinAndSelect('account.role', 'role')
            .where('user.email = :email', { email })
            .orWhere('business.email = :email', { email })
            .getOne();
    }

    async updateUserEmail(userId: number, newEmail: string): Promise<User> {
        const user = await this.userRepository.findOneBy({ id: userId });
        if (!user) throw new Error('User not found');

        user.email = newEmail;
        return await this.userRepository.save(user);
    }

    async updateBusinessEmail(businessId: number, newEmail: string): Promise<Business> {
        const business = await this.businessRepository.findOneBy({ id: businessId });
        if (!business) throw new Error('Business not found');

        business.email = newEmail;
        return await this.businessRepository.save(business);
    }

    async saveOtpByEmail(
        email: string,
        otp: string,
        expiresAt: Date,
    ): Promise<Otp> {
        let otpRecord = await this.otpRepository.findOne({
            where: { email },
        });

        if (otpRecord) {
            otpRecord.otp = otp;
            otpRecord.expiresAt = expiresAt;
            otpRecord.attemptCount = 0;
        } else {
            otpRecord = this.otpRepository.create({
                email,
                otp,
                expiresAt,
                attemptCount: 0,
            });
        }

        return this.otpRepository.save(otpRecord);
    }

    async deleteOtpByEmail(email: string): Promise<void> {
        const user = await this.userRepository.findOneBy({ email });
        if (!user) return;
        await this.otpRepository.delete({ accountId: user.id });
    }

    async updateRefreshToken(userId: number, refreshToken: string): Promise<void> {
        await this.accountRepository.update(
            { userId },
            { refreshToken } as any,
        );
    }

    async updateLastLogin(userId: number): Promise<void> {
        await this.userRepository.update(userId, { lastLoginAt: new Date() });
    }

    // Lưu avatarPublicId để sau này xóa ảnh trên Cloud
    async updateAvatar(userId: number, avatarUrl: string, avatarPublicId: string): Promise<void> {
        await this.userRepository.update(userId, { avatarUrl, avatarPublicId });
    }

    async findPermissionsByRole(roleId: number): Promise<string[]> {
        const result = await this.dataSource
            .getRepository(RolePermission)
            .createQueryBuilder('rp')
            .leftJoin('rp.permission', 'p')
            .where('rp.roleId = :roleId', { roleId })
            .select('p.code', 'code')
            .getRawMany();

        return result.map(row => row.code);
    }

    async findRoleById(id: number): Promise<Role | null> {
        return await this.roleRepository.findOne({
            where: { id },
        });
    }
}