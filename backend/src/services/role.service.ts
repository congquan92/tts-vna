import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { RoleRepository } from '../repositories/role.repository';
import { PermissionRepository } from '../repositories/permission.repository';
import { RolePermissionRepository } from '../repositories/rolePermission.repository';
import { CreateRoleDto } from '../dto/role/create-role.dto';
import { UpdateRoleDto } from '../dto/role/update-role.dto';
import { AccountRepository } from '../repositories/account.repository';
import { SearchRoleDto } from '../dto/role/search-role.dto';

@Injectable()
export class RoleService {
    constructor(
        private readonly roleRepository: RoleRepository,
        private readonly permissionRepository: PermissionRepository,
        private readonly rolePermissionRepository: RolePermissionRepository,
        private readonly accountRepository: AccountRepository,
    ) { }

    async findAll(dto: SearchRoleDto) {
        return this.roleRepository.search(dto);
    }

    async getPermissionTree() {
        const permissions =
            await this.permissionRepository.findAll();

        const groups = {};

        permissions.forEach((perm) => {
            const group = perm.code.split('_')[0];

            if (!groups[group]) {
                groups[group] = {
                    code: group,
                    children: [],
                };
            }

            groups[group].children.push({
                id: perm.id,
                code: perm.code,
                description: perm.description,
            });
        });

        return Object.values(groups);
    }

    async getRolePermissions(roleId: number) {
        const role = await this.roleRepository.findById(roleId);

        if (!role) {
            throw new NotFoundException('Không tìm thấy vai trò');
        }

        return {
            roleId: role.id,
            permissions: role.rolePermissions.map(rp => ({
                id: rp.permission.id,
                code: rp.permission.code,
                description: rp.permission.description,
            })),
        };
    }

    async updatePermissions(
        roleId: number,
        permissionIds: number[],
    ) {
        const role =
            await this.roleRepository.findById(roleId);

        if (!role) {
            throw new NotFoundException(
                'Không tìm thấy vai trò',
            );
        }

        await this.rolePermissionRepository.deleteByRole(
            roleId,
        );

        const data = permissionIds.map(permissionId => ({
            roleId,
            permissionId,
        }));

        await this.rolePermissionRepository.saveMany(data);

        return {
            message: 'Cập nhật quyền thành công',
        };
    }

    async create(dto: CreateRoleDto) {
        const exists =
            await this.roleRepository.findRoleByName(
                dto.name,
            );

        if (exists) {
            throw new BadRequestException(
                'Vai trò đã tồn tại',
            );
        }

        return this.roleRepository.create(dto);
    }

    async update(
        id: number,
        dto: UpdateRoleDto,
    ) {
        const role =
            await this.roleRepository.findById(id);

        if (!role) {
            throw new NotFoundException(
                'Không tìm thấy vai trò',
            );
        }

        return this.roleRepository.update(
            id,
            dto,
        );
    }

    async delete(id: number) {
        const role =
            await this.roleRepository.findById(id);

        if (!role) {
            throw new NotFoundException(
                'Không tìm thấy vai trò',
            );
        }

        const total =
            await this.accountRepository.countAccount(
                id,
            );

        if (total > 0) {
            throw new BadRequestException(
                'Vai trò đang được sử dụng',
            );
        }

        await this.roleRepository.delete(id);

        return {
            message: 'Xóa vai trò thành công',
        };
    }
}