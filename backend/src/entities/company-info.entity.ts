import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Report } from './report.entity';
import { Business } from './business.entity';

@Entity('company_infos')
export class CompanyInfo {
  @PrimaryGeneratedColumn()
  id!: number;

  /**
   * =========================
   * RELATION: Report (1-1)
   * =========================
   */
  @Column({ nullable: true })
  reportId?: number;

  @OneToOne(() => Report, (report) => report.companyInfo, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'reportId' })
  report?: Report;

  /**
   * =========================
   * RELATION: Business (QUAN TRỌNG)
   * =========================
   */
  @Column({ nullable: true })
  businessId?: number;

  @ManyToOne(() => Business, { nullable: true })
  @JoinColumn({ name: 'businessId' })
  business?: Business;

  /**
   * =========================
   * SNAPSHOT (OPTIONAL)
   * =========================
   *dùng nếu muốn lưu lại tên tại thời điểm submit
   */
  @Column({ nullable: true })
  businessName?: string;

  @Column({ nullable: true })
  totalNumberOfEmployees?: number;

  @Column({ nullable: true })
  totalNumberOfFemaleEmployees?: number;

  @Column({ type: 'decimal', nullable: true })
  totalSalary?: number;
}