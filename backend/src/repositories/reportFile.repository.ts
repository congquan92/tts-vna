import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReportFile } from '../entities/report-file.entity';

@Injectable()
export class ReportFileRepository {
  constructor(
    @InjectRepository(ReportFile)
    private readonly repo: Repository<ReportFile>,
  ) {}

  async save(file: Partial<ReportFile>) {
    return this.repo.save(file);
  }

  async findByReportId(reportId: number) {
    return this.repo.find({
      where: { reportId },
      order: { id: 'DESC' },
    });
  }

  async findById(id: number) {
    return this.repo.findOne({ where: { id } });
  }

  async delete(id: number) {
    return this.repo.delete(id);
  }
}
