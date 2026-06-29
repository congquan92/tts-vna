import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Enum cho trạng thái yếu tố chấn thương
 */
export enum TraumaFactorStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

/**
 * Entity TraumaFactor - Yếu tố gây chấn thương
 *
 * Thiết kế:
 * - Code unique (không trùng)
 * - Enum cho trạng thái
 * - Có timestamps
 * - Dễ mở rộng thêm field sau này
 */
@Entity('trauma_factors')
export class TraumaFactor {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    unique: true,
    nullable: false,
    length: 20,
  })
  code!: string; // Mã yếu tố (VD: "TF001", không trùng)

  @Column({
    nullable: false,
    length: 255,
  })
  name!: string; // Yếu tố gây chấn thương

  @Column({
    type: 'enum',
    enum: TraumaFactorStatus,
    default: TraumaFactorStatus.ACTIVE,
  })
  status!: TraumaFactorStatus; // Trạng thái

  @CreateDateColumn()
  createdAt!: Date; // Thời gian tạo

  @UpdateDateColumn()
  updatedAt!: Date; // Thời gian cập nhật

  // Có thể mở rộng sau:
  // @Column({ nullable: true, type: 'text' })
  // description?: string;
}