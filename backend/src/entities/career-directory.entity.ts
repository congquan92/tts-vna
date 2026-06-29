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
export enum CareerStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

/**
 * Entity: CareerDirectory (Danh mục nghề nghiệp dạng cây)
 */
@Entity('career_directories')
export class CareerDirectory {
  @PrimaryGeneratedColumn()
  id!: number;

  @Index({ unique: true })
  @Column({ length: 20 })
  code!: string; // mã nghề (không trùng)

  @Column({ length: 100 })
  name!: string; // tên nghề nghiệp

  /**
   * Quan hệ cha
   */
  @Column({ nullable: true })
  parentId?: number;

  @ManyToOne(() => CareerDirectory, (item) => item.children, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'parentId' })
  parent?: CareerDirectory;

  /**
   * Quan hệ con
   */
  @OneToMany(() => CareerDirectory, (item) => item.parent)
  children!: CareerDirectory[];

  /**
   * Cấp ngành
   */
  @Index()
  @Column({ type: 'int' })
  level!: number;

  /**
   * Trạng thái
   */
  @Column({
    type: 'enum',
    enum: CareerStatus,
    default: CareerStatus.ACTIVE,
  })
  status!: CareerStatus;

  /**
   * Mô tả
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