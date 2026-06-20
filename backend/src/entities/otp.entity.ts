import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Account } from './account.entity';

@Entity('otps')
export class Otp {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  otp!: string;

  @Column()
  expiresAt!: Date;

  @Column({ nullable: true, })
  email!: string;

  @Column({ nullable: true, })
  accountId!: number;

  @Column({ type: 'int', default: 0 })
  attemptCount!: number;

  @ManyToOne(() => Account)
  @JoinColumn({ name: 'accountId' })
  account!: Account;
}