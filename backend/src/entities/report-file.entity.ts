import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Report } from './report.entity';

export enum ReportFileType {
  ATTACHMENT = 'attachment',
  OTHER = 'other',
}

@Entity('report_files')
export class ReportFile {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  reportId!: number;

  @ManyToOne(() => Report, (report) => report.files, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'reportId' })
  report!: Report;

  @Column({ length: 255 })
  fileName!: string;

  @Column({ length: 500 })
  storedFileName!: string;

  @Column({ length: 1000 })
  filePath!: string;

  @Column({
    type: 'enum',
    enum: ReportFileType,
    default: ReportFileType.ATTACHMENT,
  })
  fileType!: ReportFileType;

  @Column({ nullable: true })
  fileSize?: number;

  @Column({ nullable: true, length: 100 })
  mimeType?: string;

  @CreateDateColumn()
  createdAt!: Date;
}
