import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  OneToMany,
  JoinColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { Report } from './report.entity';
import { AccidentDetail } from './accident-detail.entity';

@Entity('labor_accident_reports')
export class LaborAccidentReport {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ nullable: true })
  reportId?: number;

  @OneToOne(() => Report, (report) => report.laborAccidentReport, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'reportId' })
  report?: Report;

  /**
   * =========================
   * MỤC 1: Tổng số tai nạn lao động và số nạn nhân
   * =========================
   */
  @Column({ nullable: true })
  totalAccidentCases?: number;

  @Column({ nullable: true })
  totalCasesWithDeath?: number;

  @Column({ nullable: true })
  totalCasesWithTwoOrMoreVictims?: number;

  @Column({ nullable: true })
  totalVictims?: number;

  @Column({ nullable: true })
  totalFemaleVictims?: number;

  @Column({ nullable: true })
  totalDeaths?: number;

  @Column({ nullable: true })
  totalSeriouslyInjured?: number;

  @Column({ nullable: true })
  unmanagedVictims?: number;

  @Column({ nullable: true })
  unmanagedFemaleVictims?: number;

  @Column({ nullable: true })
  unmanagedDeaths?: number;

  @Column({ nullable: true })
  unmanagedSeriouslyInjured?: number;

  /**
   * =========================
   * MỤC 2: Thiệt hại do tai nạn lao động
   * (tiền lưu dạng số, hiển thị định dạng 1.000 ở frontend)
   * =========================
   */
  @Column({ type: 'decimal', nullable: true })
  medicalCost?: number;

  @Column({ type: 'decimal', nullable: true })
  salaryDuringTreatment?: number;

  @Column({ type: 'decimal', nullable: true })
  compensationCost?: number;

  @Column({ type: 'decimal', nullable: true })
  totalCost?: number;

  @Column({ nullable: true })
  totalSickDays?: number;

  @Column({ type: 'decimal', nullable: true })
  propertyDamage?: number;

  @BeforeInsert()
  @BeforeUpdate()
  computeTotalCost() {
    const medical = Number(this.medicalCost ?? 0);
    const salary = Number(this.salaryDuringTreatment ?? 0);
    const compensation = Number(this.compensationCost ?? 0);

    if (
      this.medicalCost != null ||
      this.salaryDuringTreatment != null ||
      this.compensationCost != null
    ) {
      this.totalCost = medical + salary + compensation;
    }
  }

  @OneToMany(
    () => AccidentDetail,
    (accidentDetail) => accidentDetail.laborAccidentReport,
    {
      cascade: true,
    },
  )
  accidentDetails?: AccidentDetail[];
}
