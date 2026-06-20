import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../entities/role.entity';
import { Permission } from '../entities/permission.entity';
import { RolePermission } from '../entities/role-permission.entity';
import { TypeOfBusiness } from '../entities/typeOfBusiness.entity';
import { BusinessIndustry, BusinessStatus } from '../entities/BusinessIndustry.entity';
import { Permission as PermissionEnum } from '../common/enums/permission.enum';

@Injectable()
export class SeedService implements OnModuleInit {
    constructor(
        @InjectRepository(Role) private roleRepo: Repository<Role>,
        @InjectRepository(Permission) private permRepo: Repository<Permission>,
        @InjectRepository(RolePermission) private rolePermRepo: Repository<RolePermission>,
        @InjectRepository(TypeOfBusiness) private typeRepo: Repository<TypeOfBusiness>,
        @InjectRepository(BusinessIndustry) private industryRepo: Repository<BusinessIndustry>,
    ) { }

    async onModuleInit() {
        await this.seedPermissions();
        await this.seedRoles();
        await this.seedRolePermissions();
        await this.seedTypeOfBusiness();
        await this.seedBusinessIndustries();
    }

    private async seedPermissions() {
        const permissions = Object.values(PermissionEnum);
        for (const code of permissions) {
            const exists = await this.permRepo.findOne({ where: { code } });
            if (!exists) {
                await this.permRepo.save({ code });
            }
        }
    }

    private async seedRoles() {
        const roles = [
            { name: 'ADMIN_SO', orgType: 'SO' },
            { name: 'MANAGER_SO', orgType: 'SO' },
            { name: 'CHUYENVIEN_SO', orgType: 'SO' },
            { name: 'CEO_DN', orgType: 'DOANH_NGHIEP' },
            // { name: 'MANAGER_DN', orgType: 'DOANH_NGHIEP' },
            // { name: 'USER_DN', orgType: 'DOANH_NGHIEP' },
        ];

        for (const roleData of roles) {
            const exists = await this.roleRepo.findOne({ where: { name: roleData.name } });
            if (!exists) {
                await this.roleRepo.save(roleData as unknown as Partial<Role>);
            }
        }
    }

    private async seedRolePermissions() {
        // 1. Lấy tất cả Roles và Permissions từ DB để lấy ID
        const roles = await this.roleRepo.find();
        const perms = await this.permRepo.find();

        const getRole = (name: string) => roles.find(r => r.name === name);
        const getPerm = (code: string) => perms.find(p => p.code === code);

        // 2. Định nghĩa cấu trúc quyền (Mapping)
        const mappings = [
            // ADMIN_SO - full quyền
            {
                role: 'ADMIN_SO',
                perms: perms.map(p => p.code),
            },

            // MANAGER_SO - quản lý + xem + report sở
            {
                role: 'MANAGER_SO',
                perms: [
                    'USER_VIEW',
                    'USER_CREATE',
                    'USER_UPDATE',
                    'USER_TOGGLE_STATUS',
                    'USER_RESET_PASSWORD',

                    'BUSINESS_VIEW',

                    'REPORT_SO_VIEW',
                ],
            },

            // CHUYENVIEN_SO - chỉ xem
            {
                role: 'CHUYENVIEN_SO',
                perms: [
                    'USER_VIEW',
                    'BUSINESS_VIEW',
                    'REPORT_SO_VIEW',
                ],
            },

            // CEO_DN - doanh nghiệp (full nghiệp vụ DN)
            {
                role: 'CEO_DN',
                perms: [
                    // BUSINESS
                    'BUSINESS_VIEW',
                    'BUSINESS_CREATE',
                    'BUSINESS_UPDATE',
                    'BUSINESS_UPLOAD_FILE',
                    'BUSINESS_TOGGLE_STATUS',
                    'BUSINESS_RESET_PASSWORD',

                    // REPORT DOANH NGHIỆP
                    'REPORT_DN_VIEW',
                    'REPORT_DN_CREATE',
                    'REPORT_DN_UPDATE',
                    'REPORT_DN_EXPORT',
                ],
            },
        ];

        // 3. Thực hiện lưu vào bảng role_permissions
        for (const map of mappings) {
            const role = getRole(map.role);
            if (!role) continue;

            for (const pCode of map.perms) {
                const perm = getPerm(pCode);
                if (!perm) continue;

                const exists = await this.rolePermRepo.findOne({
                    where: { roleId: role.id, permissionId: perm.id }
                });

                if (!exists) {
                    await this.rolePermRepo.save({ roleId: role.id, permissionId: perm.id });
                }
            }
        }
    }

    private async seedTypeOfBusiness() {
        const data = [
            { code: 'TNHH', name: 'Công ty TNHH', status: BusinessStatus.ACTIVE },
            { code: 'CP', name: 'Công ty Cổ phần', status: BusinessStatus.ACTIVE },
            { code: 'DNTN', name: 'Doanh nghiệp tư nhân', status: BusinessStatus.ACTIVE },
            { code: 'HKD', name: 'Hộ kinh doanh', status: BusinessStatus.ACTIVE },
        ];

        for (const item of data) {
            const exists = await this.typeRepo.findOne({
                where: { code: item.code },
            });

            if (!exists) {
                await this.typeRepo.save(item);
            }
        }
    }

    private async seedBusinessIndustries() {
        // LEVEL 1
        const level1 = [
            { code: 'A', name: 'Nông nghiệp', level: 1 },
            { code: 'B', name: 'Công nghiệp', level: 1 },
            { code: 'C', name: 'Xây dựng', level: 1 },
        ];

        for (const item of level1) {
            const exists = await this.industryRepo.findOne({
                where: { code: item.code },
            });

            if (!exists) {
                await this.industryRepo.save({
                    ...item,
                    status: BusinessStatus.ACTIVE,
                });
            }
        }

        const parents = await this.industryRepo.find({
            where: { level: 1 },
        });

        const getParent = (code: string) =>
            parents.find((p) => p.code === code);

        // LEVEL 2
        const level2 = [
            { code: 'A1', name: 'Trồng trọt', parent: 'A', level: 2 },
            { code: 'A2', name: 'Chăn nuôi', parent: 'A', level: 2 },
            { code: 'B1', name: 'Sản xuất', parent: 'B', level: 2 },
            { code: 'C1', name: 'Xây dựng dân dụng', parent: 'C', level: 2 },
        ];

        for (const item of level2) {
            const exists = await this.industryRepo.findOne({
                where: { code: item.code },
            });

            if (!exists) {
                const parent = getParent(item.parent);

                await this.industryRepo.save({
                    code: item.code,
                    name: item.name,
                    parentId: parent?.id,
                    level: item.level,
                    status: BusinessStatus.ACTIVE,
                });
            }
        }
    }
}