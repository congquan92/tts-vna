import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Query,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { Permission } from '../common/enums/permission.enum';
import { TypeOfBusinessService } from '../services/typeOfBusiness.service';
import { CreateTypeOfBusinessDto } from '../dto/typeOfBusiness/createTypeOfBusiness.dto';
import { UpdateTypeOfBusinessDto } from '../dto/typeOfBusiness/updateTypeOfBusiness.dto';

@ApiTags('TypeOfBusiness')
@Controller('TypeOfBusiness')
export class TypeOfBusinessController {
  constructor(private readonly typeOfBusinessService: TypeOfBusinessService) { }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(Permission.BUSINESS_CREATE)
  @Post()
  @ApiOperation({ summary: 'Tạo loại hình kinh doanh mới' })
  @ApiResponse({ status: 201, description: 'Tạo thành công' })
  @ApiResponse({ status: 404, description: 'Type of business not found' })
  async create(@Body() createDto: CreateTypeOfBusinessDto) {
    return await this.typeOfBusinessService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách loại hình kinh doanh' })
  @ApiResponse({ status: 200, description: 'Trả về danh sách' })
  async findAll() {
    return await this.typeOfBusinessService.findAll();
  }

  @Get('code/:code')
  @ApiOperation({ summary: 'Tìm loại hình theo mã code (tìm gần đúng)' })
  async findByCode(@Param('code') code: string) {
    return await this.typeOfBusinessService.findByCode(code);
  }

  @Get('name')
  @ApiOperation({ summary: 'Tìm loại hình theo tên (tìm gần đúng)' })
  async findByName(@Query('name') name: string) {
    return await this.typeOfBusinessService.findByName(name || '');
  }

  @Get('status/:status')
  @ApiOperation({ summary: 'Tìm loại hình theo trạng thái' })
  async findByStatus(@Param('status') status: string) {
    return await this.typeOfBusinessService.findByStatus(status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin loại hình kinh doanh theo ID' })
  @ApiResponse({ status: 200, description: 'Trả về chi tiết loại hình' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.typeOfBusinessService.findOne(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(Permission.BUSINESS_UPDATE)
  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật loại hình kinh doanh' })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateTypeOfBusinessDto,
  ) {
    return await this.typeOfBusinessService.update(id, updateDto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(Permission.BUSINESS_DELETE)
  @Delete(':id')
  @ApiOperation({ summary: 'Xóa loại hình kinh doanh' })
  @ApiResponse({ status: 200, description: 'Xóa thành công' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.typeOfBusinessService.remove(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(Permission.BUSINESS_TOGGLE_STATUS)
  @Patch(':id/toggle-status')
  @ApiOperation({
    summary: 'Bật/Tắt trạng thái loại hình kinh doanh',
    description: 'Đổi trạng thái status của loại hình kinh doanh (true/false)',
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'ID của loại hình kinh doanh',
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
          status: 'active',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy loại hình kinh doanh',
  })
  toggleStatus(@Param('id') id: string) {
    return this.typeOfBusinessService.toggleTypeOfBusinessStatus(Number(id));
  }
}
