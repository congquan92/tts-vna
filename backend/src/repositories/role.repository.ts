import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Role } from "../entities/role.entity";
import { SearchRoleDto } from "../dto/role/search-role.dto";

@Injectable()
export class RoleRepository {
    constructor(
        @InjectRepository(Role)
        private readonly roleRepository: Repository<Role>,
    ) { }

    async findRoleById(roleId: number) {
        return await this.roleRepository.findOne({
            where: { id: roleId },
        });
    }

    async findRoleByName(name: string) {
        return this.roleRepository.findOne({
            where: { name },
        });
    }

    async findById(id: number) {
        return this.roleRepository.findOne({
            where: { id },
            relations: {
                rolePermissions: {
                    permission: true,
                },
            },
        });
    }

    async create(data: Partial<Role>) {
        return this.roleRepository.save(data);
    }

    async update(id: number, data: Partial<Role>) {
        await this.roleRepository.update(id, data);

        return this.findById(id);
    }

    async delete(id: number) {
        return this.roleRepository.delete(id);
    }

    async search(dto: SearchRoleDto) {
        const query = this.roleRepository.createQueryBuilder('role');

        if (dto.name) {
            query.andWhere(
                'role.name ILIKE :name',
                { name: `%${dto.name}%` },
            );
        }

        if (dto.displayName) {
            query.andWhere(
                'role.displayName ILIKE :displayName',
                { displayName: dto.displayName },
            );
        }

        query.orderBy('role.id', 'ASC');

        return query.getMany();
    }
}