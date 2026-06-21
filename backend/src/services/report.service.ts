import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DeepPartial } from 'typeorm';
import { ReportRepository } from '../repositories/report.repository';
import { CreateReportDto } from '../dto/report/create-report.dto';
import { UpdateReportDto } from '../dto/report/update-report.dto';
import { Report } from '../entities/report.entity';
import { ReportStatus } from '../common/enums/report-status.enum';
import { validateLaborAccidentReport } from '../common/validators/labor-accident-report.validator';
import { validateLaborAccidentSupportReport } from '../common/validators/labor-accident-support-report.validator';

@Injectable()
export class ReportService {
  constructor(
    private readonly reportRepository: ReportRepository,
  ) {}

  async createReport(dto: CreateReportDto) {
    const reportData: DeepPartial<Report> = {};

    if (dto.companyInfo) {
      reportData.companyInfo = dto.companyInfo;
    }

    if (dto.laborAccidentReport) {
      validateLaborAccidentReport(dto.laborAccidentReport);
      reportData.laborAccidentReport = dto.laborAccidentReport;
    }

    if (dto.laborAccidentSupportReport) {
      validateLaborAccidentSupportReport(dto.laborAccidentSupportReport);
      reportData.laborAccidentSupportReport = dto.laborAccidentSupportReport;
    }

    if (dto.year !== undefined) {
      reportData.year = dto.year;
    }

    if (dto.reportPeriod !== undefined) {
      reportData.reportPeriod = dto.reportPeriod;
    }

    reportData.status = dto.status ?? ReportStatus.REPORTING;

    const report = await this.reportRepository.create(reportData);

    return {
      message: 'Tạo báo cáo thành công',
      data: report,
    };
  }

  async getAllReports(page = 1, limit = 10, filters?: { businessId?: number; year?: number; status?: string; businessName?: string; taxCode?: string; province?: string; ward?: string }) {
    const safePage = Math.max(Number(page) || 1, 1);
    const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 100);

    return this.reportRepository.findAll(safePage, safeLimit, filters);
  }

  async getReportById(id: number) {
    const report = await this.reportRepository.findById(id);

    if (!report) {
      throw new NotFoundException('Không tìm thấy báo cáo');
    }

    return report;
  }

  async updateReport(id: number, dto: UpdateReportDto) {
    const report = await this.reportRepository.findById(id);

    if (!report) {
      throw new NotFoundException('Không tìm thấy báo cáo');
    }

    const updateData: DeepPartial<Report> = { id: report.id };

    if (dto.year !== undefined) {
      updateData.year = dto.year;
    }

    if (dto.reportPeriod !== undefined) {
      updateData.reportPeriod = dto.reportPeriod;
    }

    if (dto.status !== undefined) {
      updateData.status = dto.status;
    }

    if (dto.companyInfo !== undefined) {
      updateData.companyInfo = {
        ...report.companyInfo,
        ...dto.companyInfo,
      };
    }

    if (dto.laborAccidentReport !== undefined) {
      const mergedLaborAccidentReport = {
        ...report.laborAccidentReport,
        ...dto.laborAccidentReport,
        accidentDetails:
          dto.laborAccidentReport.accidentDetails ??
          report.laborAccidentReport?.accidentDetails,
      };

      validateLaborAccidentReport(mergedLaborAccidentReport);
      updateData.laborAccidentReport = mergedLaborAccidentReport;
    }

    if (dto.laborAccidentSupportReport !== undefined) {
      const mergedSupportReport = {
        ...report.laborAccidentSupportReport,
        ...dto.laborAccidentSupportReport,
      };

      validateLaborAccidentSupportReport(mergedSupportReport);
      updateData.laborAccidentSupportReport = mergedSupportReport;
    }

    const updated = await this.reportRepository.save(
      updateData as Report,
    );

    return {
      message: 'Cập nhật báo cáo thành công',
      data: updated,
    };
  }

  async deleteReport(id: number) {
    const result = await this.reportRepository.delete(id);

    if (!result.affected) {
      throw new NotFoundException('Không tìm thấy báo cáo');
    }

    return {
      message: 'Xóa báo cáo thành công',
    };
  }
}
