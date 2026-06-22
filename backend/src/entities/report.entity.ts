import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  OneToMany,
} from 'typeorm';
import { CompanyInfo } from './company-info.entity';
import { LaborAccidentReport } from './labor-accident-report.entity';
import { LaborAccidentSupportReport } from './labor-accident-support-report.entity';
import { ReportFile } from './report-file.entity';
import { ReportStatus } from '../common/enums/report-status.enum';

@Entity('reports')
export class Report {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    type: 'enum',
    enum: ReportStatus,
    default: ReportStatus.REPORTING,
  })
  status!: ReportStatus;

  @Column({ nullable: true })
  year?: number;

  @Column({ nullable: true })
  reportPeriod?: string;

  @OneToOne(() => CompanyInfo, (companyInfo) => companyInfo.report, {
    cascade: true,
    nullable: true,
  })
  companyInfo?: CompanyInfo;

  @OneToOne(
    () => LaborAccidentReport,
    (laborAccidentReport) => laborAccidentReport.report,
    {
      cascade: true,
      nullable: true,
    },
  )
  laborAccidentReport?: LaborAccidentReport;

  @OneToOne(
    () => LaborAccidentSupportReport,
    (supportReport) => supportReport.report,
    {
      cascade: true,
      nullable: true,
    },
  )
  laborAccidentSupportReport?: LaborAccidentSupportReport;

  @OneToMany(() => ReportFile, (file) => file.report, {
    cascade: true,
  })
  files?: ReportFile[];
}