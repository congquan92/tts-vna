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
  Res,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import type { Response } from 'express';
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
import { RejectReportDto } from '../dto/report/reject-report.dto';
import { ReportStatus } from '../common/enums/report-status.enum';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { Permission } from '../common/enums/permission.enum';
import { PermissionsGuard } from '../common/guards/permissions.guard';

@ApiTags('Report Management')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('reports')
export class ReportController {
  constructor(private readonly reportService: ReportService) { }

  @Post()
  @RequirePermissions(Permission.REPORT_DN_CREATE)
  createReport(@Req() req, @Body() dto: CreateReportDto) {

    if (req.user.orgType !== 'DOANH_NGHIEP') {
      throw new ForbiddenException(
        'Chỉ doanh nghiệp mới được tạo báo cáo',
      );
    }

    dto.companyInfo ??= {};
    dto.companyInfo.businessId = req.user.businessId;

    return this.reportService.createReport(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách báo cáo (có phân trang)' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'year', required: false, example: 2022 })
  @ApiQuery({ name: 'status', required: false, example: 'đang báo cáo' })
  @ApiQuery({ name: 'businessName', required: false })
  @ApiQuery({ name: 'taxCode', required: false })
  @ApiQuery({ name: 'province', required: false })
  @ApiQuery({ name: 'ward', required: false })
  @ApiResponse({ status: 200, description: 'Danh sách báo cáo' })
  getAllReports(
    @Req() req,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('year') year?: string,
    @Query('status') status?: string,
    @Query('businessName') businessName?: string,
    @Query('taxCode') taxCode?: string,
    @Query('province') province?: string,
    @Query('ward') ward?: string,
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
    if (businessName) {
      filters.businessName = businessName;
    }
    if (taxCode) {
      filters.taxCode = taxCode;
    }
    if (province) {
      filters.province = province;
    }
    if (ward) {
      filters.ward = ward;
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
    if (
      req.user.orgType === 'DOANH_NGHIEP' &&
      report.companyInfo?.businessId !== req.user.businessId
    ) {
      throw new NotFoundException(
        'Không tìm thấy báo cáo hoặc bạn không có quyền xem báo cáo này',
      );
    }
    return report;
  }

  @Get(':id/export-docx')
  @ApiOperation({ summary: 'Xuất chi tiết báo cáo ra file Word (.docx)' })
  @ApiParam({ name: 'id', example: 1 })
  async exportReportDocx(
    @Req() req,
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    const report = await this.reportService.getReportById(id);
    if (
      req.user.orgType === 'DOANH_NGHIEP' &&
      report.companyInfo?.businessId !== req.user.businessId
    ) {
      throw new NotFoundException(
        'Không tìm thấy báo cáo hoặc bạn không có quyền xem báo cáo này',
      );
    }
    const buffer = await this.reportService.exportReportDocx(id);

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=BC_TNLD_${id}.docx`,
    );

    return res.end(buffer);
  }

  @Patch(':id')
  @RequirePermissions(Permission.REPORT_DN_UPDATE)
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
        throw new NotFoundException(
          'Không tìm thấy báo cáo hoặc bạn không có quyền sửa báo cáo này',
        );
      }
      if (dto.companyInfo) {
        dto.companyInfo.businessId = req.user.businessId;
      }
    }
    return this.reportService.updateReport(id, dto);
  }

  @Patch(':id/submit')
  @RequirePermissions(Permission.REPORT_DN_SUBMIT)
  @ApiOperation({ summary: 'Gửi báo cáo' })
  async submitReport(
    @Req() req,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const report = await this.reportService.getReportById(id);

    if (
      req.user.orgType === 'DOANH_NGHIEP' &&
      report.companyInfo?.businessId !== req.user.businessId
    ) {
      throw new NotFoundException('Không tìm thấy báo cáo hoặc bạn không có quyền gửi báo cáo này');
    }

    if (report.status !== ReportStatus.REPORTING) {
      throw new BadRequestException('Chỉ có thể gửi báo cáo đang báo cáo',);
    }

    return this.reportService.submitReport(id, req);
  }

  @Patch(':id/approve')
  @RequirePermissions(Permission.REPORT_SO_APPROVE)
  @ApiOperation({ summary: 'Tiếp nhận báo cáo' })
  async approveReport(@Req() req, @Param('id', ParseIntPipe) id: number,) {
    const report = await this.reportService.getReportById(id);

    if (report.status !== ReportStatus.PENDING) {
      throw new BadRequestException('Chỉ có thể tiếp nhận báo cáo đang chờ tiếp nhận',);
    }

    return this.reportService.approveReport(id, req);
  }

  @Patch(':id/reject')
  @RequirePermissions(Permission.REPORT_SO_REJECT)
  @ApiOperation({ summary: 'Từ chối báo cáo' })
  async rejectReport(@Req() req, @Param('id', ParseIntPipe) id: number, @Body() dto: RejectReportDto) {
    const report = await this.reportService.getReportById(id);

    if (report.status !== ReportStatus.PENDING) {
      throw new BadRequestException('Chỉ có thể từ chối báo cáo đang chờ tiếp nhận',);
    }

    return this.reportService.rejectReport(id, dto.reason, req);
  }

  @Patch(':id/reopen')
  @RequirePermissions(Permission.REPORT_SO_REOPEN)
  @ApiOperation({ summary: 'Cho phép sửa lại báo cáo' })
  async reopenReport(@Req() req, @Param('id', ParseIntPipe) id: number,) {
    const report = await this.reportService.getReportById(id);

    if (report.status !== ReportStatus.REJECTED) {
      throw new BadRequestException('Chỉ có thể mở lại báo cáo đã từ chối',);
    }

    return this.reportService.reopenReport(id, req);
  }

  @Post('summary/export-docx')
  @ApiOperation({ summary: 'Xuất báo cáo tổng hợp tình hình TNLĐ ra file Word (.docx)' })
  async exportSummaryDocx(@Body() body: any, @Res() res: Response) {
    const buffer = await this.reportService.exportSummaryDocx(body);

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=BC_tinh_hinh_TNLD.docx',
    );

    return res.end(buffer);
  }
}
