import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Put,
    Query,
    UseGuards,
} from '@nestjs/common';

import {
    ApiBearerAuth,
    ApiOperation,
    ApiTags,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';

import { RequirePermissions } from '../common/decorators/permissions.decorator';

import { Permission } from '../common/enums/permission.enum';

import { RoleService } from '../services/role.service';
import { UpdateRolePermissionsDto } from '../dto/role/update-role-permissions.dto';
import { CreateRoleDto } from '../dto/role/create-role.dto';
import { UpdateRoleDto } from '../dto/role/update-role.dto';
import { SearchRoleDto } from '../dto/role/search-role.dto';

@ApiTags('Roles')
@ApiBearerAuth()
@Controller('roles')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class RoleController {
    constructor(
        private readonly roleService: RoleService,
    ) { }

    @Post()
    @RequirePermissions(Permission.ROLE_CREATE)
    @ApiOperation({
        summary: 'Thêm vai trò',
    })
    create(
        @Body()
        dto: CreateRoleDto,
    ) {
        return this.roleService.create(dto);
    }

    @Put(':id')
    @RequirePermissions(Permission.ROLE_UPDATE)
    @ApiOperation({
        summary: 'Cập nhật vai trò',
    })
    update(
        @Param('id') id: number,
        @Body()
        dto: UpdateRoleDto,
    ) {
        return this.roleService.update(
            Number(id),
            dto,
        );
    }

    @Delete(':id')
    @RequirePermissions(Permission.ROLE_DELETE)
    @ApiOperation({
        summary: 'Xóa vai trò',
    })
    delete(
        @Param('id') id: number,
    ) {
        return this.roleService.delete(
            Number(id),
        );
    }

    @Get()
    @ApiOperation({ summary: 'Danh sách vai trò' })
    @RequirePermissions(Permission.ROLE_VIEW)
    findAll(@Query() dto: SearchRoleDto) {
        return this.roleService.findAll(dto);
    }

    @Get(':id/permissions')
    @ApiOperation({
        summary: 'Chi tiết quyền vai trò',
    })
    @RequirePermissions(Permission.ROLE_VIEW)
    getPermissions(
        @Param('id') id: number,
    ) {
        return this.roleService.getRolePermissions(
            Number(id),
        );
    }

    @Put(':id/permissions')
    @ApiOperation({
        summary: 'Cập nhật quyền vai trò',
    })
    @RequirePermissions(Permission.ROLE_UPDATE)
    updatePermissions(
        @Param('id') id: number,
        @Body()
        dto: UpdateRolePermissionsDto,
    ) {
        return this.roleService.updatePermissions(
            Number(id),
            dto.permissionIds,
        );
    }
}