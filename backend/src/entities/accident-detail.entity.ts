import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { LaborAccidentReport } from './labor-accident-report.entity';

@Entity('accident_details')
export class AccidentDetail {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ nullable: true })
  laborAccidentReportId?: number;

  @ManyToOne(
    () => LaborAccidentReport,
    (laborAccidentReport) => laborAccidentReport.accidentDetails,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'laborAccidentReportId' })
  laborAccidentReport?: LaborAccidentReport;

  /**
   * =========================
   * MỤC 1: Phân theo nguyên nhân xảy ra tai nạn
   * =========================
   */
  @Column({ nullable: true })
  accidentCause?: string;

  /**
   * =========================
   * MỤC 2: Phân theo yếu tố gây chấn thương
   * =========================
   */
  @Column({ nullable: true })
  injuryFactor?: string;

  /**
   * =========================
   * MỤC 3: Phân theo nghề nghiệp
   * =========================
   */
  @Column({ nullable: true })
  occupationCategory?: string;

  /**
   * =========================
   * MỤC 4: Chi tiết tai nạn (tổng các dòng = báo cáo tổng)
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
   * MỤC 5: Thiệt hại do tai nạn lao động (tổng các dòng = báo cáo tổng)
   * totalCost = medicalCost + salaryDuringTreatment + compensationCost
   * =========================
   */
  @Column({ type: 'decimal', nullable: true })
  medicalCost?: number;

  @Column({ type: 'decimal', nullable: true })
  salaryDuringTreatment?: number;

  @Column({ type: 'decimal', nullable: true })
  compensationCost?: number;

  @Column({ nullable: true })
  totalSickDays?: number;

  @Column({ type: 'decimal', nullable: true })
  propertyDamage?: number;

  @Column({ type: 'decimal', nullable: true })
  totalCost?: number;

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
}
