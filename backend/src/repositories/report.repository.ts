import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { Report } from '../entities/report.entity';

@Injectable()
export class ReportRepository {
  constructor(
    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,
  ) {}

  get manager() {
    return this.reportRepository.manager;
  }

  async create(data: DeepPartial<Report>): Promise<Report> {
    const report = this.reportRepository.create(data);
    return this.reportRepository.save(report);
  }

  async findAll(page = 1, limit = 10, filters?: { businessId?: number; year?: number; status?: string; businessName?: string; taxCode?: string; province?: string; ward?: string }) {
    const qb = this.reportRepository.createQueryBuilder('report')
      .leftJoinAndSelect('report.companyInfo', 'companyInfo')
      .leftJoinAndSelect('companyInfo.business', 'business')
      .leftJoinAndSelect('report.laborAccidentReport', 'laborAccidentReport')
      .leftJoinAndSelect('laborAccidentReport.accidentDetails', 'accidentDetails')
      .leftJoinAndSelect('report.laborAccidentSupportReport', 'laborAccidentSupportReport');

    if (filters?.businessId) {
      qb.andWhere('companyInfo.businessId = :businessId', { businessId: filters.businessId });
    }

    if (filters?.year) {
      qb.andWhere('report.year = :year', { year: filters.year });
    }

    if (filters?.status) {
      qb.andWhere('report.status = :status', { status: filters.status });
    }

    if (filters?.businessName) {
      qb.andWhere('business.businessName ILIKE :businessName', { businessName: `%${filters.businessName}%` });
    }

    if (filters?.taxCode) {
      qb.andWhere('business.taxCode ILIKE :taxCode', { taxCode: `%${filters.taxCode}%` });
    }

    if (filters?.province) {
      qb.andWhere('(business.registeredProvince ILIKE :province OR business.operatingProvince ILIKE :province)', { province: `%${filters.province}%` });
    }

    if (filters?.ward) {
      qb.andWhere('(business.registeredWard ILIKE :ward OR business.operatingWard ILIKE :ward)', { ward: `%${filters.ward}%` });
    }

    qb.orderBy('report.id', 'DESC');
    qb.skip((page - 1) * limit);
    qb.take(limit);

    const [reports, total] = await qb.getManyAndCount();

    return {
      data: reports,
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }

  async findByCompanyAndYear(companyId: number, year: number, page = 1, limit = 10) {
    const [reports, total] = await this.reportRepository.findAndCount({
      where: {
        year,
        companyInfo: {
          businessId: companyId,
        },
      },
      relations: {
        companyInfo: { business: true },
        laborAccidentReport: { accidentDetails: true },
        laborAccidentSupportReport: true,
      },
      order: { id: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: reports,
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }

  async findById(id: number): Promise<Report | null> {
    return this.reportRepository.findOne({
      where: { id },
      relations: {
        companyInfo: { business: true },
        laborAccidentReport: { accidentDetails: true },
        laborAccidentSupportReport: true,
      },
    });
  }

  async save(report: DeepPartial<Report>): Promise<Report> {
    return this.reportRepository.save(report);
  }

  async delete(id: number) {
    return this.reportRepository.delete(id);
  }
}
