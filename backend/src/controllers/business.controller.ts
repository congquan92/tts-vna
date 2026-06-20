import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { BusinessService } from "../services/business.service";
import { BadRequestException, Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, Req, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { CreateBusinessDto, UpdateBusinessDto } from "../dto/business/business.dto";
import { SetPasswordBusinessDto } from "../dto/business/set-password-business.dto";
import { SearchBusinessDto } from "../dto/business/search-business.dto";
import { PermissionsGuard } from "../common/guards/permissions.guard";
import { RequirePermissions } from "../common/decorators/permissions.decorator";
import { Permission } from "../common/enums/permission.enum";
import { RequestOtpDto } from "../dto/business/request-otp.dto";
import { VerifyOtpDto } from "../dto/business/verify-otp.dto";

@ApiTags('Business Management')
@ApiBearerAuth()
@Controller('business')
export class BusinessController {
    constructor(
        private readonly businessService: BusinessService,
    ) { }

    // Thêm mới doanh nghiệp
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @RequirePermissions(Permission.BUSINESS_CREATE)
    @Post()
    @ApiOperation({
        summary: 'Thêm mới doanh nghiệp',
    })
    @ApiResponse({
        status: 201,
        description: 'Thêm doanh nghiệp thành công',
    })
    createBusiness(
        @Body()
        dto: CreateBusinessDto,
    ) {
        return this.businessService.createBusiness(dto);
    }

    // Lấy danh sách doanh nghiệp
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @RequirePermissions(Permission.BUSINESS_VIEW)
    @Get()
    @ApiOperation({ summary: 'Lấy danh sách doanh nghiệp (có phân trang)' })
    @ApiQuery({ name: 'page', required: false, example: 1 })
    @ApiQuery({ name: 'limit', required: false, example: 10 })
    @ApiResponse({ status: 200, description: 'Danh sách doanh nghiệp' })
    getAllBusinesses(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        return this.businessService.getAllBusinesses(
            Number(page),
            Number(limit),
        );
    }

    // Tìm kiếm doanh nghiệp
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @RequirePermissions(Permission.BUSINESS_VIEW)
    @Get('search')
    @ApiOperation({
        summary: 'Tìm kiếm doanh nghiệp (có phân trang + filter)',
    })
    @ApiQuery({ name: 'businessName', required: false })
    @ApiQuery({ name: 'taxCode', required: false })
    @ApiQuery({ name: 'typeOfBusinessId', required: false, type: Number })
    @ApiQuery({ name: 'businessIndustryId', required: false, type: Number })
    @ApiQuery({ name: 'registeredWard', required: false })
    @ApiQuery({ name: 'status', required: false, type: Boolean })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiResponse({
        status: 200,
        description: 'Danh sách doanh nghiệp',
    })
    async search(@Query() query: SearchBusinessDto) {
        return this.businessService.search(query);
    }

    // Yêu cầu gửi mã otp về email doanh nghiệp
    @Post('request-otp')
    @ApiOperation({
        summary: 'Gửi OTP xác thực email đăng ký doanh nghiệp',
    })
    @ApiBody({
        schema: {
            example: {
                email: 'abc@gmail.com',
                busniessName: 'Công ty ABC',
            },
        },
    })
    @ApiResponse({
        status: 200,
        schema: {
            example: {
                message: 'OTP đã được gửi về email đăng ký',
            },
        },
    })
    async requestOtp(@Body() dto: RequestOtpDto) {
        return this.businessService.requestOtpToRegisterBusiness(dto.email, dto.businessName);
    }

    // Xác thực mã otp
    @Post('verify-otp')
    @ApiOperation({
        summary: 'Xác thực OTP đăng ký doanh nghiệp',
    })
    @ApiBody({
        schema: {
            example: {
                email: 'abc@gmail.com',
                otp: '123456',
            },
        },
    })
    @ApiResponse({
        status: 200,
        schema: {
            example: {
                success: true,
                message: 'Xác thực OTP thành công',
                verifiedEmail: 'abc@gmail.com',
            },
        },
    })
    @ApiResponse({
        status: 400,
        description: 'OTP không hợp lệ hoặc hết hạn',
    })
    @ApiResponse({
        status: 403,
        description: 'Vượt quá số lần nhập OTP',
    })
    async verifyOtp(@Body() dto: VerifyOtpDto) {
        return this.businessService.verifyOtpRegisterBusiness(dto.email, dto.otp);
    }

    // Cập nhật thông tinh doanh nghiệp
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @RequirePermissions(Permission.BUSINESS_UPDATE)
    @Patch(':id')
    @ApiOperation({
        summary: 'Cập nhật thông tin doanh nghiệp',
    })
    @ApiParam({
        name: 'id',
        example: 1,
    })
    @ApiResponse({
        status: 200,
        description: 'Cập nhật doanh nghiệp thành công',
    })
    updateBusiness(
        @Param('id', ParseIntPipe)
        id: number,

        @Body()
        dto: UpdateBusinessDto,
    ) {
        return this.businessService.updateBusiness(
            id,
            dto,
        );
    }

    // Lấy chi tiết doanh nghiệp
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @RequirePermissions(Permission.BUSINESS_VIEW)
    @Get(':id')
    @ApiOperation({ summary: 'Lấy chi tiết doanh nghiêp theo ID' })
    @ApiParam({ name: 'id', example: 1, description: 'ID doanh nghiêp' })
    @ApiResponse({ status: 200, description: 'Chi tiết doanh nghiêp' })
    @ApiResponse({ status: 404, description: 'Không tìm thấy doanh nghiêp' })
    getDetailBusinessById(@Param('id', ParseIntPipe) id: number) {
        return this.businessService.getBusinessDetailById(id);
    }

    // Xóa doanh nghiệp
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @RequirePermissions(Permission.BUSINESS_DELETE)
    @Delete(':id')
    @ApiOperation({
        summary: 'Xóa doanh nghiệp',
    })
    @ApiParam({
        name: 'id',
        type: Number,
    })
    @ApiResponse({
        status: 200,
        description: 'Xóa doanh nghiệp thành công',
    })
    @ApiResponse({
        status: 404,
        description: 'Không tìm thấy doanh nghiệp',
    })
    async deleteBusiness(@Param('id', ParseIntPipe) id: number,) {
        const data = await this.businessService.deleteBusiness(id);

        return {
            message: 'Xóa doanh nghiệp thành công',
            data,
        };
    }

    // Xác nhận thông tin doanh nghiệp sau khi thêm mới/sửa
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @RequirePermissions(Permission.BUSINESS_UPDATE)
    @Patch(':id/confirm')
    @ApiOperation({
        summary: 'Xác nhận doanh nghiệp',
    })
    @ApiParam({
        name: 'id',
        example: 1,
    })
    @ApiResponse({
        status: 200,
        description: 'Xác nhận doanh nghiệp thành công',
    })
    @ApiResponse({
        status: 404,
        description: 'Không tìm thấy doanh nghiệp',
    })
    confirmBusiness(
        @Param('id', ParseIntPipe)
        id: number,
    ) {
        return this.businessService.confirmBusiness(id);
    }

    // Bật/Tắt trạng thái doanh nghiệp
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @RequirePermissions(Permission.BUSINESS_TOGGLE_STATUS)
    @Patch(':id/toggle-status')
    @ApiOperation({
        summary: 'Bật/Tắt trạng thái doanh nghiệp',
        description: 'Đổi trạng thái status của doanh nghiệp (true/false)',
    })
    @ApiParam({
        name: 'id',
        required: true,
        description: 'ID của doanh nghiệp',
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
        description: 'Không tìm thấy doanh nghiệp',
    })
    toggleStatus(@Param('id', ParseIntPipe) id: number) {
        return this.businessService.toggleBusinessStatus(id);
    }

    // Khởi tạo mật khẩu doanh nghiệp
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @RequirePermissions(Permission.BUSINESS_RESET_PASSWORD)
    @Post(':id/set-password')
    @ApiOperation({
        summary: 'Khởi tạo mật khẩu doanh nghiệp',
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
        description: 'Không tìm thấy doanh nghiệp',
    })
    async setPassword(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: SetPasswordBusinessDto,
    ) {
        return this.businessService.setPassword(id, dto.password);
    }
}