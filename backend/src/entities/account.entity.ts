import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Role } from './role.entity';
import { Business } from './business.entity';

@Entity('accounts')
export class Account {
  [x: string]: any;
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  username!: string;

  @Column({ select: false })
  password!: string;

  @Column()
  roleId!: number;

  @Column({ nullable: true })
  userId?: number;

  @Column({ nullable: true })
  businessId?: number;

  @Column({ nullable: true })
  refreshToken?: string;

  @Column({ default: true })
  isActive!: boolean;

  @ManyToOne(() => User, (user) => user.accounts, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @ManyToOne(() => Business, (business) => business.accounts, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'businessId' })
  business!: Business;

  @ManyToOne(() => Role, (role) => role.accounts)
  @JoinColumn({ name: 'roleId' })
  role!: Role;
}