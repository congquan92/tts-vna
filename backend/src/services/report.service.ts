import { Injectable, NotFoundException } from '@nestjs/common';
import { DeepPartial } from 'typeorm';
import { ReportRepository } from '../repositories/report.repository';
import { CreateReportDto } from '../dto/report/create-report.dto';
import { UpdateReportDto } from '../dto/report/update-report.dto';
import { Report } from '../entities/report.entity';
import { CompanyInfo } from '../entities/company-info.entity';
import { LaborAccidentReport } from '../entities/labor-accident-report.entity';
import { LaborAccidentSupportReport } from '../entities/labor-accident-support-report.entity';
import { AccidentDetail } from '../entities/accident-detail.entity';
import { ReportStatus } from '../common/enums/report-status.enum';
import { ReportingPeriod } from '../common/enums/reporting-period.enum';
import { validateLaborAccidentReport } from '../common/validators/labor-accident-report.validator';
import { validateLaborAccidentSupportReport } from '../common/validators/labor-accident-support-report.validator';
import * as fs from 'fs';
import * as path from 'path';
import { BusinessRepository } from '../repositories/business.repository';

type CompanyYearReportItem = {
  reportId: number;
  businessName: string | null;
  taxCode: string | null;
  reportPeriod: ReportingPeriod | null;
  status: ReportStatus;
};

@Injectable()
export class ReportService {
  constructor(
    private readonly reportRepository: ReportRepository,
    private readonly businessRepository: BusinessRepository,
  ) { }

  async createReport(dto: CreateReportDto) {
    const reportData: DeepPartial<Report> = {};

    reportData.year = dto.year ?? new Date().getFullYear();
    reportData.reportPeriod =
      dto.reportPeriod ?? ReportingPeriod.ONE_YEAR;

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

  async getReportsByCompanyAndYear(
    companyId: number,
    year: number,
    page = 1,
    limit = 10,
  ) {
    const safePage = Math.max(Number(page) || 1, 1);
    const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 100);

    const result = await this.reportRepository.findByCompanyAndYear(
      companyId,
      year,
      safePage,
      safeLimit,
    );

    return {
      ...result,
      data: result.data.map(
        (report): CompanyYearReportItem => ({
          reportId: report.id,
          businessName: report.companyInfo?.business?.businessName ?? null,
          taxCode: report.companyInfo?.business?.taxCode ?? null,
          reportPeriod: (report.reportPeriod as ReportingPeriod) ?? null,
          status: report.status,
        }),
      ),
    };
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

    if (dto.year !== undefined) {
      report.year = dto.year;
    }

    if (dto.reportPeriod !== undefined) {
      report.reportPeriod = dto.reportPeriod;
    }

    if (dto.status !== undefined) {
      report.status = dto.status as any;
    }

    if (dto.companyInfo !== undefined) {
      if (!report.companyInfo) {
        report.companyInfo = new CompanyInfo();
      }
      Object.assign(report.companyInfo, dto.companyInfo);
    }

    if (dto.laborAccidentReport !== undefined) {
      if (!report.laborAccidentReport) {
        report.laborAccidentReport = new LaborAccidentReport();
      }

      const oldDetails = report.laborAccidentReport.accidentDetails || [];
      const reportId = report.laborAccidentReport.id;
      if (reportId && oldDetails.length > 0) {
        await this.reportRepository.manager.delete(AccidentDetail, { laborAccidentReportId: reportId });
      }

      Object.assign(report.laborAccidentReport, dto.laborAccidentReport);

      if (dto.laborAccidentReport.accidentDetails !== undefined) {
        report.laborAccidentReport.accidentDetails = dto.laborAccidentReport.accidentDetails.map(d => {
          const detail = new AccidentDetail();
          Object.assign(detail, d);
          return detail;
        });
      }
      validateLaborAccidentReport(report.laborAccidentReport);
    }

    if (dto.laborAccidentSupportReport !== undefined) {
      if (!report.laborAccidentSupportReport) {
        report.laborAccidentSupportReport = new LaborAccidentSupportReport();
      }
      Object.assign(report.laborAccidentSupportReport, dto.laborAccidentSupportReport);
      validateLaborAccidentSupportReport(report.laborAccidentSupportReport);
    }

    const updated = await this.reportRepository.save(report);

    return {
      message: 'Cập nhật báo cáo thành công',
      data: updated,
    };
  }

  async submitReport(id: number, req: any) {
    console.log(req.user);

    return this.reportRepository.updateStatus(id, ReportStatus.PENDING,
      {
        id:
          req.user.accountType === 'BUSINESS'
            ? req.user.businessId
            : req.user.userId,
        type: req.user.orgType,
        name: req.user.displayName,
      },);
  }

  async approveReport(id: number, req: any) {
    return this.reportRepository.updateStatus(id, ReportStatus.RECEIVED, {
      id:
        req.user.accountType === 'BUSINESS'
          ? req.user.businessId
          : req.user.userId,
      type: req.user.orgType,
      name: req.user.displayName,
    },);
  }

  async rejectReport(id: number, reason: string, req: any) {
    return this.reportRepository.updateStatus(
      id,
      ReportStatus.REJECTED,
      {
        id:
          req.user.accountType === 'BUSINESS'
            ? req.user.businessId
            : req.user.userId,
        type: req.user.orgType,
        name: req.user.displayName,
      },
      reason,
    );
  }

  async reopenReport(id: number, req: any) {
    return this.reportRepository.updateStatus(id, ReportStatus.REPORTING, {
      id:
        req.user.accountType === 'BUSINESS'
          ? req.user.businessId
          : req.user.userId,
      type: req.user.orgType,
      name: req.user.displayName,
    },);
  }

  async exportSummaryDocx(data: any): Promise<Buffer> {
    const { execSync } = require('child_process');
    
    const findFile = (filename: string) => {
      let p = path.resolve(process.cwd(), filename);
      if (fs.existsSync(p)) return p;
      p = path.resolve(process.cwd(), '..', filename);
      if (fs.existsSync(p)) return p;
      p = path.resolve(__dirname, '..', '..', '..', filename);
      if (fs.existsSync(p)) return p;
      p = path.resolve(__dirname, '..', '..', '..', '..', filename);
      if (fs.existsSync(p)) return p;
      return path.resolve(process.cwd(), '..', filename); // default fallback
    };

    const templatePath = findFile('BC tình hình TNLĐ - PHỤ LỤC XII.docx');
    const scriptPath = findFile('generate_docx.py');
    
    const tempJsonPath = path.join(path.dirname(templatePath), `temp_${Date.now()}.json`);
    const tempDocxPath = path.join(path.dirname(templatePath), `temp_out_${Date.now()}.docx`);

    try {
      fs.writeFileSync(tempJsonPath, JSON.stringify(data, null, 2), 'utf8');

      const command = `python "${scriptPath}" "${templatePath}" "${tempDocxPath}" "${tempJsonPath}"`;
      execSync(command, { encoding: 'utf8' });

      const buffer = fs.readFileSync(tempDocxPath);
      return buffer;
    } finally {
      if (fs.existsSync(tempJsonPath)) {
        try { fs.unlinkSync(tempJsonPath); } catch (e) {}
      }
      if (fs.existsSync(tempDocxPath)) {
        try { fs.unlinkSync(tempDocxPath); } catch (e) {}
      }
    }
  }

  async exportReportDocx(id: number): Promise<Buffer> {
    const report = await this.reportRepository.manager.getRepository(Report).findOne({
      where: { id },
      relations: {
        companyInfo: {
          business: {
            typeOfBusiness: true,
            businessIndustry: true,
          },
        },
        laborAccidentReport: { accidentDetails: true },
        laborAccidentSupportReport: true,
      },
    });

    if (!report) {
      throw new NotFoundException('Không tìm thấy báo cáo');
    }

    const OCCUPATIONS = ["Nhà lãnh đạo cơ quan Đảng Cộng sản Việt Nam cấp Trung ương", "Kỹ sư cơ khí", "Công nhân xây dựng", "Nhân viên văn phòng", "Lao động vận hành máy móc", "Lao động thủ công đơn giản", "Khác"];
    const CAUSES = [
      "Không có thiết bị an toàn hoặc thiết bị không đảm bảo an toàn",
      "Không có phương tiện bảo vệ cá nhân hoặc phương tiện bảo vệ cá nhân không tốt",
      "Tổ chức lao động không hợp lý",
      "Chưa huấn luyện hoặc huấn luyện an toàn vệ sinh lao động chưa đầy đủ",
      "Không có quy trình an toàn hoặc biện pháp làm việc an toàn",
      "Điều kiện làm việc không tốt",
      "Quy phạm nội quy, quy trình, quy chuẩn, biện pháp làm việc an toàn",
      "Không sử dụng phương tiện bảo vệ cá nhân",
      "Khách quan khó tránh/ Nguyên nhân chưa kể đến",
    ];
    const FACTORS = ["Thiết bị nâng", "Ngã từ trên cao", "Vật rơi trúng", "Điện giật", "Mắc kẹt vào máy móc", "Bỏng (nhiệt, hóa chất)", "Tai nạn giao thông lao động", "Sập giàn giáo, đất đá", "Khác"];

    const details = report.laborAccidentReport?.accidentDetails || [];

    const groupDetails = (field: 'occupationCategory' | 'accidentCause' | 'injuryFactor', allowedList: string[]) => {
      return allowedList.map((name, idx) => {
        const row = {
          name,
          code: String(idx + 1),
          cases: 0,
          deathCases: 0,
          twoVictimsCases: 0,
          victims: 0,
          femaleVictims: 0,
          deaths: 0,
          serious: 0,
          unmanagedVictims: 0,
          unmanagedFemaleVictims: 0,
          unmanagedDeaths: 0,
          unmanagedSeriouslyInjured: 0,
        };

        details.forEach((d) => {
          const val = d[field];
          if (val === name) {
            row.cases += Number(d.totalAccidentCases || 0);
            row.deathCases += Number(d.totalCasesWithDeath || 0);
            row.twoVictimsCases += Number(d.totalCasesWithTwoOrMoreVictims || 0);
            row.victims += Number(d.totalVictims || 0);
            row.femaleVictims += Number(d.totalFemaleVictims || 0);
            row.deaths += Number(d.totalDeaths || 0);
            row.serious += Number(d.totalSeriouslyInjured || 0);
            row.unmanagedVictims += Number(d.unmanagedVictims || 0);
            row.unmanagedFemaleVictims += Number(d.unmanagedFemaleVictims || 0);
            row.unmanagedDeaths += Number(d.unmanagedDeaths || 0);
            row.unmanagedSeriouslyInjured += Number(d.unmanagedSeriouslyInjured || 0);
          }
        });
        return row;
      });
    };

    const occupations = groupDetails('occupationCategory', OCCUPATIONS);
    const causes = groupDetails('accidentCause', CAUSES);
    const factors = groupDetails('injuryFactor', FACTORS);

    const labor = report.laborAccidentReport || {};
    const support = report.laborAccidentSupportReport || {};

    const fillGrandTotal = (obj: any) => ({
      cases: Number(obj.totalAccidentCases || 0),
      deathCases: Number(obj.totalCasesWithDeath || 0),
      twoVictimsCases: Number(obj.totalCasesWithTwoOrMoreVictims || 0),
      victims: Number(obj.totalVictims || 0),
      femaleVictims: Number(obj.totalFemaleVictims || 0),
      deaths: Number(obj.totalDeaths || 0),
      serious: Number(obj.totalSeriouslyInjured || 0),
      sickDays: Number(obj.totalSickDays || 0),
      totalCost: Number(obj.totalCost || 0),
      medicalCost: Number(obj.medicalCost || 0),
      salaryCost: Number(obj.salaryDuringTreatment || 0),
      compensationCost: Number(obj.compensationCost || 0),
      propertyDamage: Number(obj.propertyDamage || 0),
      unmanagedVictims: Number(obj.unmanagedVictims || 0),
      unmanagedFemaleVictims: Number(obj.unmanagedFemaleVictims || 0),
      unmanagedDeaths: Number(obj.unmanagedDeaths || 0),
      unmanagedSeriouslyInjured: Number(obj.unmanagedSeriouslyInjured || 0),
    });

    const laborGrandTotal = fillGrandTotal(labor);
    const supportGrandTotal = fillGrandTotal(support);

    const table2GrandTotal = {
      cases: laborGrandTotal.cases + supportGrandTotal.cases,
      deathCases: laborGrandTotal.deathCases + supportGrandTotal.deathCases,
      twoVictimsCases: laborGrandTotal.twoVictimsCases + supportGrandTotal.twoVictimsCases,
      victims: laborGrandTotal.victims + supportGrandTotal.victims,
      femaleVictims: laborGrandTotal.femaleVictims + supportGrandTotal.femaleVictims,
      deaths: laborGrandTotal.deaths + supportGrandTotal.deaths,
      serious: laborGrandTotal.serious + supportGrandTotal.serious,
      sickDays: laborGrandTotal.sickDays + supportGrandTotal.sickDays,
      totalCost: laborGrandTotal.totalCost + supportGrandTotal.totalCost,
      medicalCost: laborGrandTotal.medicalCost + supportGrandTotal.medicalCost,
      salaryCost: laborGrandTotal.salaryCost + supportGrandTotal.salaryCost,
      compensationCost: laborGrandTotal.compensationCost + supportGrandTotal.compensationCost,
      propertyDamage: laborGrandTotal.propertyDamage + supportGrandTotal.propertyDamage,
      unmanagedVictims: laborGrandTotal.unmanagedVictims + supportGrandTotal.unmanagedVictims,
      unmanagedFemaleVictims: laborGrandTotal.unmanagedFemaleVictims + supportGrandTotal.unmanagedFemaleVictims,
      unmanagedDeaths: laborGrandTotal.unmanagedDeaths + supportGrandTotal.unmanagedDeaths,
      unmanagedSeriouslyInjured: laborGrandTotal.unmanagedSeriouslyInjured + supportGrandTotal.unmanagedSeriouslyInjured,
    };

    const business = report.companyInfo?.business;
    const payload = {
      year: report.year,
      period: report.reportPeriod || 'Cả năm',
      province: business?.registeredProvince || '',
      ward: business?.registeredWard || '',
      businessName: report.companyInfo?.businessName || business?.businessName || '',
      taxCode: business?.taxCode || '',
      typeOfBusiness: business?.typeOfBusiness?.name || '',
      typeOfBusinessCode: business?.typeOfBusiness?.code || '',
      businessIndustry: business?.businessIndustry?.name || '',
      businessIndustryCode: business?.businessIndustry?.code || '',
      registeredAddress: business?.registeredAddress || '',
      districtCode: '',
      totals: {
        totalEmployees: Number(report.companyInfo?.totalNumberOfEmployees || 0),
        femaleEmployees: Number(report.companyInfo?.totalNumberOfFemaleEmployees || 0),
        totalSalary: Number(report.companyInfo?.totalSalary || 0),
      },
      table2GrandTotal,
      laborGrandTotal,
      supportGrandTotal,
      causes,
      factors,
      occupations,
    };

    return this.exportSummaryDocx(payload);
  }
}
