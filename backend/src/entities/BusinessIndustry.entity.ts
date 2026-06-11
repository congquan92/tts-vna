import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';

/**
 * Enum trạng thái
 */
export enum BusinessStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

/**
 * Entity: BusinessIndustry (Ngành nghề kinh doanh dạng cây)
 */
@Entity('business_industries')
export class BusinessIndustry {
  @PrimaryGeneratedColumn()
  id!: number;

  @Index({ unique: true })
  @Column({ length: 20 })
  code!: string; // Ví dụ: "122", "1221"

  @Column({ length: 30 })
  name!: string;

  /**
   * Quan hệ cha
   */
  @Column({ nullable: true })
  parentId?: number;

  @ManyToOne(() => BusinessIndustry, (item) => item.children, {
    onDelete: 'RESTRICT', // ❗ không cho xóa nếu có con
  })
  @JoinColumn({ name: 'parentId' })
  parent?: BusinessIndustry;

  /**
   * Quan hệ con
   */
  @OneToMany(() => BusinessIndustry, (item) => item.parent)
  children!: BusinessIndustry[];

  /**
   * Cấp (level)
   * Cấp 1: root
   */
  @Index()
  @Column({ type: 'int' })
  level!: number;

  /**
   * Trạng thái
   */
  @Column({
    type: 'enum',
    enum: BusinessStatus,
    default: BusinessStatus.ACTIVE,
  })
  status!: BusinessStatus;

  /**
   * Optional mở rộng
   */
  @Column({ nullable: true, type: 'text' })
  description?: string;

  /**
   * Timestamps
   */
  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
