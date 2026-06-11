import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Enum cho trạng thái loại hình kinh doanh
 */
export enum BusinessStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

/**
 * Entity TypeOfBusiness - Loại hình kinh doanh
 *
 * Thiết kế dễ mở rộng:
 * - Sử dụng Enum cho status (dễ thêm trạng thái mới)
 * - Timestamps tự động (createdAt, updatedAt)
 * - Cấu trúc cơ bản cho phép thêm các trường mới sau này
 */
@Entity('types_of_business')
export class TypeOfBusiness {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    unique: true,
    nullable: false,
    length: 20,
  })
  code!: string; // Mã loại hình (VD: "TYPE001", không được trùng)

  @Column({
    nullable: false,
    length: 50,
  })
  name!: string; // Tên loại hình (không được trống, tối đa 50 ký tự)

  @Column({
    type: 'enum',
    enum: BusinessStatus,
    default: BusinessStatus.ACTIVE,
  })
  status!: BusinessStatus; // Trạng thái: active hoặc inactive

  @CreateDateColumn()
  createdAt!: Date; // Thời gian tạo (tự động)

  @UpdateDateColumn()
  updatedAt!: Date; // Thời gian cập nhật cuối cùng (tự động)

  // Các trường dưới đây có thể được thêm sau này nếu cần:
  // @Column({ nullable: true, type: 'text' })
  // description?: string; // Mô tả loại hình
  //
  // @Column({ nullable: true })
  // createdBy?: number; // ID người tạo
  //
  // @ManyToOne(() => User)
  // @JoinColumn({ name: 'createdBy' })
  // creator?: User;
}
