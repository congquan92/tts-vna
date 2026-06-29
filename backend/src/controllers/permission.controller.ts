import {
    Controller,
    Get,
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

import { PermissionService } from '../services/permission.service';
import { SearchPermissionDto } from '../dto/permission/search-permission.dto';

@ApiTags('Permissions')
@ApiBearerAuth()
@Controller('permissions')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PermissionController {
    constructor(
        private readonly permissionService: PermissionService,
    ) {}

    @Get()
    @ApiOperation({
        summary: 'Danh sách quyền',
    })
    @RequirePermissions(Permission.ROLE_VIEW)
    findAll(
        @Query()
        query: SearchPermissionDto,
    ) {
        if (query.code || query.name) {
            return this.permissionService.search(query);
        }

        return this.permissionService.findAll();
    }
}