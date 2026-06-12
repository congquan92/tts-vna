import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BusinessFile } from '../entities/business-file.entity';

@Injectable()
export class BusinessFileRepository {
  constructor(
    @InjectRepository(BusinessFile)
    private readonly repo: Repository<BusinessFile>,
  ) {}

  async save(file: Partial<BusinessFile>) {
    return this.repo.save(file);
  }

  async findByBusinessId(businessId: number) {
    return this.repo.find({
      where: { businessId },
      order: { id: 'DESC' },
    });
  }

  async findById(id: number) {
    return this.repo.findOne({ where: { id } });
  }

  async delete(id: number) {
    return this.repo.delete(id);
  }
}