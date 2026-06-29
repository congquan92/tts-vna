import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Permission } from '../entities/permission.entity';
import { Repository } from 'typeorm';
import { SearchPermissionDto } from '../dto/permission/search-permission.dto';

@Injectable()
export class PermissionRepository {
    constructor(
        @InjectRepository(Permission)
        private readonly permissionRepo: Repository<Permission>,
    ) { }

    async findAll() {
        return this.permissionRepo.find({
            order: {
                id: 'ASC',
            },
        });
    }

    async search(query: SearchPermissionDto) {
        const qb = this.permissionRepo
            .createQueryBuilder('permission');

        if (query.code) {
            qb.andWhere(
                'permission.code ILIKE :code',
                {
                    code: `%${query.code}%`,
                },
            );
        }

        if (query.name) {
            qb.andWhere(
                'permission.description ILIKE :name',
                {
                    name: `%${query.name}%`,
                },
            );
        }

        qb.orderBy('permission.id', 'ASC');

        return qb.getMany();
    }
}