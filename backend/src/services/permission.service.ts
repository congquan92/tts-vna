import { Injectable } from '@nestjs/common';
import { PermissionRepository } from '../repositories/permission.repository';
import { SearchPermissionDto } from '../dto/permission/search-permission.dto';

@Injectable()
export class PermissionService {
    constructor(
        private readonly permissionRepository: PermissionRepository,
    ) {}

    async findAll() {
        return this.permissionRepository.findAll();
    }

    async search(query: SearchPermissionDto) {
        const permissions =
            await this.permissionRepository.search(query);

        const groups = {};

        permissions.forEach((permission) => {
            const group = permission.code.split('_')[0];

            if (!groups[group]) {
                groups[group] = {
                    group,
                    permissions: [],
                };
            }

            groups[group].permissions.push({
                id: permission.id,
                code: permission.code,
                description: permission.description,
            });
        });

        return Object.values(groups);
    }
}