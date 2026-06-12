import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
} from 'typeorm';
import { Account } from './account.entity';
import { RolePermission } from './role-permission.entity';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  name!: string;
  // ADMIN_SO, STAFF_SO, MANAGER_SO, ADMIN_DN...

  @Column({ type: 'enum', enum: ['SO', 'DOANH_NGHIEP'] })
  orgType!: 'SO' | 'DOANH_NGHIEP';

  @OneToMany(() => Account, (account) => account.role)
  accounts!: Account[];

  @OneToMany(() => RolePermission, (rp) => rp.role)
  rolePermissions!: RolePermission[];
}