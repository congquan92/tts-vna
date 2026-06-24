import { Injectable } from '@nestjs/common';
import { ReportHistoryRepository } from '../repositories/reportHistory.repository';

@Injectable()
export class ReportHistoryService {
  constructor(
    private readonly historyRepo: ReportHistoryRepository,
  ) {}

  async getAll() {
    return this.historyRepo.findAll();
  }

  async getByReportId(reportId: number) {
    return this.historyRepo.findByReportId(reportId);
  }
}