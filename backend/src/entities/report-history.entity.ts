import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    Index,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { ReportStatus } from '../common/enums/report-status.enum';
import { Report } from './report.entity';

@Entity('report_histories')
@Index(['reportId'])
export class ReportHistory {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    reportId!: number;

    @ManyToOne(() => Report, (report) => report.histories, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'reportId' })
    report!: Report;

    @Column({ type: 'enum', enum: ReportStatus })
    status!: ReportStatus;

    @Column({ type: 'text', nullable: true })
    reason?: string | null;

    //=== NGƯỜI THỰC HIỆN ===//
    @Column()
    actorId!: number;

    @Column({
        type: 'enum',
        enum: ['SO', 'DOANH_NGHIEP'],
    })
    actorType!: string;

    @Column()
    actorName!: string;

    @CreateDateColumn()
    createdAt!: Date;
}