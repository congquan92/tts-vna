import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RolePermission } from '../entities/role-permission.entity';
import { Repository } from 'typeorm';

@Injectable()
export class RolePermissionRepository {
  constructor(
    @InjectRepository(RolePermission)
    private readonly rolePermRepo: Repository<RolePermission>,
  ) {}

  async deleteByRole(roleId: number) {
    return this.rolePermRepo.delete({ roleId });
  }

  async saveMany(data: Partial<RolePermission>[]) {
    return this.rolePermRepo.save(data);
  }
}