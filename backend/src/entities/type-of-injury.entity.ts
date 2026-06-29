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
export enum TypeOfInjuryStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

/**
 * Entity: TypeOfInjury (Danh mục loại tai nạn dạng cây)
 */
@Entity('type_of_injuries')
export class TypeOfInjury {
  @PrimaryGeneratedColumn()
  id!: number;

  @Index({ unique: true })
  @Column({ length: 20 })
  code!: string; // mã (không trùng)

  @Column({ length: 100 })
  name!: string; // tên

  /**
   * Quan hệ cha
   */
  @Column({ nullable: true })
  parentId?: number;

  @ManyToOne(() => TypeOfInjury, (item) => item.children, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'parentId' })
  parent?: TypeOfInjury;

  /**
   * Quan hệ con
   */
  @OneToMany(() => TypeOfInjury, (item) => item.parent)
  children!: TypeOfInjury[];

  /**
   * Cấp
   */
  @Index()
  @Column({ type: 'int' })
  level!: number;

  /**
   * Trạng thái
   */
  @Column({
    type: 'enum',
    enum: TypeOfInjuryStatus,
    default: TypeOfInjuryStatus.ACTIVE,
  })
  status!: TypeOfInjuryStatus;

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