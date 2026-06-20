import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Post,
    Put,
    Query,
    UploadedFile,
    UseInterceptors,
    UseGuards,
    Res,
    Patch,
    Req
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';

import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiConsumes,
    ApiBody,
    ApiQuery,
    ApiParam,
} from '@nestjs/swagger';

import type { Response } from 'express';

import { UserService } from '../services/user.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CreateUserDto, UpdateUserDto } from '../dto/user/user.dto';
import { SearchUserDto } from '../dto/user/search-user.dto';
import { SetPasswordDto } from '../dto/user/set-password.dto';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { Permission } from '../common/enums/permission.enum';
import multer from 'multer';

@ApiTags('User Management')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('users')
export class UserController {
    constructor(
        private readonly userService: UserService,
    ) { }

    // Thêm mới người dùng
    @RequirePermissions(Permission.USER_CREATE)
    @Post()
    @ApiOperation({
        summary: 'Tạo người dùng mới',
    })
    @ApiResponse({
        status: 201,
        description: 'Tạo người dùng thành công',
    })
    @ApiResponse({
        status: 409,
        description: 'Username hoặc Email đã tồn tại',
    })
    @ApiResponse({
        status: 404,
        description: 'Vai trò không tồn tại',
    })
    async create(
        @Body() dto: CreateUserDto,
    ) {
        const data = await this.userService.createUser(dto);

        return {
            message: "Thêm mới người dùng thành công",
            data,
        };
    }

    // Lấy danh sách người dùng
    @RequirePermissions(Permission.USER_VIEW)
    @Get()
    @ApiOperation({ summary: 'Lấy danh sách người dùng (có phân trang)' })
    @ApiQuery({ name: 'page', required: false, example: 1 })
    @ApiQuery({ name: 'limit', required: false, example: 10 })
    @ApiResponse({ status: 200, description: 'Danh sách người dùng' })
    getAllUsers(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        return this.userService.getAllUsers(
            Number(page),
            Number(limit),
        );
    }

    // Tìm kiếm người dùng
    @RequirePermissions(Permission.USER_VIEW)
    @Get('search')
    @ApiOperation({
        summary: 'Tìm kiếm người dùng (có phân trang)',
    })
    @ApiQuery({
        name: 'keyword',
        required: false,
    })
    @ApiQuery({
        name: 'roleId',
        required: false,
        type: Number,
    })
    @ApiQuery({
        name: 'isActive',
        required: false,
        type: Boolean,
    })
    @ApiResponse({
        status: 200,
        description: 'Danh sách người dùng',
    })
    async search(@Query() query: SearchUserDto) {
        return this.userService.searchUsers(query);
    }

    // Import danh sách người dùng
    @RequirePermissions(Permission.USER_IMPORT)
    @Post('import')
    @ApiOperation({
        summary: 'Import người dùng từ Excel',
    })
    @ApiConsumes('multipart/form-data')
    @ApiQuery({
        name: 'preview',
        required: false,
        type: Boolean,
        description: 'true = preview, false = import thật',
    })
    @ApiBody({
        schema: {
            type: 'object',
            required: ['file'],
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    })
    @UseInterceptors(
        FileInterceptor('file', {
            storage: multer.memoryStorage(),
        }),
    )
    async import(
        @UploadedFile() file: Express.Multer.File,
        @Query('preview') preview: string,
        @Body() body?: { rows?: any[] },
    ) {
        const isPreview = preview === 'true';
        const rows = body?.rows;

        const data = await this.userService.importFromExcel(
            file,
            isPreview,
            rows,
        );

        return {
            message: isPreview
                ? 'Preview dữ liệu import'
                : 'Import danh sách người dùng thành công',
            data,
        };
    }

    // Export danh sách người dùng
    @RequirePermissions(Permission.USER_EXPORT)
    @Get('export')
    @ApiOperation({ summary: 'Export Excel' })
    async export(@Res() res: Response) {
        const buffer = await this.userService.exportUsers();

        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        );

        res.setHeader(
            'Content-Disposition',
            'attachment; filename=users.xlsx',
        );

        return res.end(buffer);
    }

    // Lấy chi tiết người dùng
    @RequirePermissions(Permission.USER_VIEW)
    @Get(':id')
    @ApiOperation({ summary: 'Lấy chi tiết người dùng theo ID' })
    @ApiParam({ name: 'id', example: 1, description: 'ID người dùng' })
    @ApiResponse({ status: 200, description: 'Chi tiết người dùng' })
    @ApiResponse({ status: 404, description: 'Không tìm thấy người dùng' })
    getDetailUserById(@Param('id') id: string) {
        return this.userService.getUserDetailById(Number(id));
    }

    // Cập nhật thông tin người dùng
    @RequirePermissions(Permission.USER_UPDATE)
    @Put(':id')
    @ApiOperation({
        summary: 'Cập nhật người dùng',
    })
    @ApiParam({
        name: 'id',
        type: Number,
    })
    @ApiResponse({
        status: 200,
        description: 'Cập nhật thành công',
    })
    @ApiResponse({
        status: 404,
        description: 'Không tìm thấy người dùng',
    })
    @ApiResponse({
        status: 409,
        description: 'Email đã tồn tại',
    })
    async update(
        @Param('id', ParseIntPipe)
        id: number,

        @Body()
        dto: UpdateUserDto,
    ) {
        const data = await this.userService.updateUser(
            id,
            dto,
        );

        return {
            message: 'Cập nhập thông tin người dùng thành công',
            data,
        };
    }

    // Xóa người dùng
    @RequirePermissions(Permission.USER_DELETE)
    @Delete(':id')
    @ApiOperation({
        summary: 'Xóa người dùng',
    })
    @ApiParam({
        name: 'id',
        type: Number,
    })
    @ApiResponse({
        status: 200,
        description: 'Xóa thành công',
    })
    @ApiResponse({
        status: 404,
        description: 'Không tìm thấy người dùng',
    })
    async deleteUser(
        @Param('id') id: number,
        @Req() req,
    ) {
        const currentAccountId = req.user.accountId;

        return this.userService.deleteUser(id, currentAccountId);
    }

    // Khởi tạo mật khẩu người dùng
    @RequirePermissions(Permission.USER_RESET_PASSWORD)
    @Post(':id/set-password')
    @ApiOperation({
        summary: 'Khởi tạo mật khẩu người dùng',
    })
    @ApiParam({
        name: 'id',
        type: Number,
    })
    @ApiResponse({
        status: 200,
        description: 'Tạo mật khẩu thành công',
    })
    @ApiResponse({
        status: 400,
        description: 'Mật khẩu không hợp lệ',
    })
    @ApiResponse({
        status: 404,
        description: 'Không tìm thấy người dùng',
    })
    async setPassword(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: SetPasswordDto,
    ) {
        return this.userService.setPassword(id, dto.password);
    }

    // Bật/Tắt trạng thái
    @RequirePermissions(Permission.USER_TOGGLE_STATUS)
    @Patch(':id/toggle-status')
    @ApiOperation({
        summary: 'Bật/Tắt trạng thái user',
        description: 'Đổi trạng thái isActive của user (true/false)',
    })
    @ApiParam({
        name: 'id',
        required: true,
        description: 'ID của user',
        example: 1,
    })
    @ApiResponse({
        status: 200,
        description: 'Toggle trạng thái thành công',
        schema: {
            example: {
                message: 'Cập nhật trạng thái thành công',
                data: {
                    id: 1,
                    isActive: false,
                },
            },
        },
    })
    @ApiResponse({
        status: 404,
        description: 'Không tìm thấy user',
    })
    async toggleUserStatus(
        @Param('id') userId: number,
        @Req() req,
    ) {
        const currentAccountId = req.user.accountId;

        return this.userService.toggleUserStatus(userId, currentAccountId);
    }
}