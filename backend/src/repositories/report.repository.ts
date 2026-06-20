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

  async create(data: DeepPartial<Report>): Promise<Report> {
    const report = this.reportRepository.create(data);
    return this.reportRepository.save(report);
  }

  async findAll(page = 1, limit = 10) {
    const [reports, total] = await this.reportRepository.findAndCount({
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
