import { Injectable, NotFoundException } from '@nestjs/common';
import { TraumaFactorRepository } from '../repositories/trauma-factor.repository';
import { CreateTraumaFactorDto } from '../dto/traumaFactor/create-trauma-factor.dto';
import { UpdateTraumaFactorDto } from '../dto/traumaFactor/update-trauma-factor.dto';
import { TraumaFactor } from '../entities/trauma-factor.entity';

@Injectable()
export class TraumaFactorService {
  constructor(private readonly repo: TraumaFactorRepository) {}

  // CREATE
  async create(dto: CreateTraumaFactorDto): Promise<TraumaFactor> {
    const entity = this.repo.create(dto);
    return await this.repo.save(entity);
  }

  // UPDATE
  async update(id: number, dto: UpdateTraumaFactorDto): Promise<TraumaFactor> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException('Không tìm thấy yếu tố');

    Object.assign(entity, dto);
    return await this.repo.save(entity);
  }

  // DELETE
  async delete(id: number): Promise<void> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException('Không tìm thấy yếu tố');

    await this.repo.remove(entity);
  }

  // FIND ALL
  async findAll(): Promise<TraumaFactor[]> {
    return await this.repo.find();
  }

  // SEARCH
  async search(query: {
    code?: string;
    name?: string;
    status?: string;
  }): Promise<TraumaFactor[]> {
    const qb = this.repo.createQueryBuilder('tf');

    if (query.code) {
      qb.andWhere('tf.code LIKE :code', { code: `%${query.code}%` });
    }

    if (query.name) {
      qb.andWhere('tf.name LIKE :name', { name: `%${query.name}%` });
    }

    if (query.status) {
      qb.andWhere('tf.status = :status', { status: query.status });
    }

    return qb.getMany();
  }
}