import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReportHistory } from '../entities/report-history.entity';

@Injectable()
export class ReportHistoryRepository {
    constructor(
        @InjectRepository(ReportHistory)
        private readonly reportHistoryRepository: Repository<ReportHistory>,
    ) { }

    async findAll() {
        return this.reportHistoryRepository.find({
            order: {
                createdAt: 'DESC',
            },
        });
    }

    async findByReportId(reportId: number) {
        return this.reportHistoryRepository.find({
            where: { reportId },
            order: {
                createdAt: 'DESC',
            },
        });
    }
}