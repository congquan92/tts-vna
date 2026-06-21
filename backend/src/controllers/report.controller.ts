import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
  Req,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ReportService } from '../services/report.service';
import { CreateReportDto } from '../dto/report/create-report.dto';
import { UpdateReportDto } from '../dto/report/update-report.dto';

@ApiTags('Report Management')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo báo cáo mới' })
  @ApiResponse({ status: 201, description: 'Tạo báo cáo thành công' })
  createReport(@Req() req, @Body() dto: CreateReportDto) {
    if (req.user.orgType === 'DOANH_NGHIEP') {
      if (!dto.companyInfo) {
        dto.companyInfo = {};
      }
      dto.companyInfo.businessId = req.user.businessId;
    }
    return this.reportService.createReport(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách báo cáo (có phân trang)' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'year', required: false, example: 2022 })
  @ApiQuery({ name: 'status', required: false, example: 'đang báo cáo' })
  @ApiResponse({ status: 200, description: 'Danh sách báo cáo' })
  getAllReports(
    @Req() req,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('year') year?: string,
    @Query('status') status?: string,
  ) {
    const filters: any = {};
    if (req.user.orgType === 'DOANH_NGHIEP') {
      filters.businessId = req.user.businessId;
    }
    if (year) {
      filters.year = Number(year);
    }
    if (status) {
      filters.status = status;
    }
    return this.reportService.getAllReports(
      Number(page),
      Number(limit),
      filters,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết báo cáo theo ID' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiResponse({ status: 200, description: 'Chi tiết báo cáo' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy báo cáo' })
  async getReportById(@Req() req, @Param('id', ParseIntPipe) id: number) {
    const report = await this.reportService.getReportById(id);
    if (req.user.orgType === 'DOANH_NGHIEP' && report.companyInfo?.businessId !== req.user.businessId) {
      throw new NotFoundException('Không tìm thấy báo cáo hoặc bạn không có quyền xem báo cáo này');
    }
    return report;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật báo cáo' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiResponse({ status: 200, description: 'Cập nhật báo cáo thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy báo cáo' })
  async updateReport(
    @Req() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateReportDto,
  ) {
    if (req.user.orgType === 'DOANH_NGHIEP') {
      const report = await this.reportService.getReportById(id);
      if (report.companyInfo?.businessId !== req.user.businessId) {
        throw new NotFoundException('Không tìm thấy báo cáo hoặc bạn không có quyền sửa báo cáo này');
      }
      if (dto.companyInfo) {
        dto.companyInfo.businessId = req.user.businessId;
      }
    }
    return this.reportService.updateReport(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa báo cáo' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiResponse({ status: 200, description: 'Xóa báo cáo thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy báo cáo' })
  async deleteReport(@Req() req, @Param('id', ParseIntPipe) id: number) {
    if (req.user.orgType === 'DOANH_NGHIEP') {
      const report = await this.reportService.getReportById(id);
      if (report.companyInfo?.businessId !== req.user.businessId) {
        throw new NotFoundException('Không tìm thấy báo cáo hoặc bạn không có quyền xóa báo cáo này');
      }
    }
    return this.reportService.deleteReport(id);
  }
}
