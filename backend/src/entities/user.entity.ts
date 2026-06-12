import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, OneToMany } from 'typeorm';
import { Account } from './account.entity';
import { Otp } from './otp.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  fullName!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ nullable: true })
  avatarUrl!: string;

  @Column({ type: 'date', nullable: true })
  dob!: Date;

  @Column({ nullable: true })
  gender!: string;

  @Column({ nullable: true })
  position!: string;

  @Column({ default: true })
  isActive!: boolean;

  @Column({ nullable: true })
  province!: string;

  @Column({ nullable: true })
  ward!: string;

  @Column({ nullable: true })
  address!: string;

  @Column({ nullable: true })
  avatarPublicId?: string; // Giúp xóa ảnh cũ trên Cloudinary

  @CreateDateColumn()
  createdAt!: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastLoginAt?: Date; // Theo dõi lần đăng nhập cuối

  @Column({ type: 'enum', enum: ['SO', 'DOANH_NGHIEP'] })
  orgType!: 'SO' | 'DOANH_NGHIEP';

  @OneToMany(() => Account, (account) => account.user)
  accounts!: Account[];

  @OneToMany(() => Otp, (otp) => otp.user)
  otps!: Otp[];
}