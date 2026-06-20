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
  createReport(@Body() dto: CreateReportDto) {
    return this.reportService.createReport(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách báo cáo (có phân trang)' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiResponse({ status: 200, description: 'Danh sách báo cáo' })
  getAllReports(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.reportService.getAllReports(
      Number(page),
      Number(limit),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết báo cáo theo ID' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiResponse({ status: 200, description: 'Chi tiết báo cáo' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy báo cáo' })
  getReportById(@Param('id', ParseIntPipe) id: number) {
    return this.reportService.getReportById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật báo cáo' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiResponse({ status: 200, description: 'Cập nhật báo cáo thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy báo cáo' })
  updateReport(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateReportDto,
  ) {
    return this.reportService.updateReport(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa báo cáo' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiResponse({ status: 200, description: 'Xóa báo cáo thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy báo cáo' })
  deleteReport(@Param('id', ParseIntPipe) id: number) {
    return this.reportService.deleteReport(id);
  }
}
