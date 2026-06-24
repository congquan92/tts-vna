import { Controller, Get, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ReportHistoryService } from '../services/reportHistory.service';
import { ApiTags, ApiOperation, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('Report History')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('report-histories')
export class ReportHistoryController {
  constructor(
    private readonly historyService: ReportHistoryService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Lấy toàn bộ lịch sử báo cáo' })
  async getAll() {
    return this.historyService.getAll();
  }

  @Get(':reportId')
  @ApiOperation({ summary: 'Lấy lịch sử theo reportId' })
  @ApiParam({ name: 'reportId', example: 1 })
  async getByReportId(
    @Param('reportId', ParseIntPipe) reportId: number,
  ) {
    return this.historyService.getByReportId(reportId);
  }
}