import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { TraumaFactorRepository } from '../repositories/trauma-factor.repository';
import { CreateTraumaFactorDto } from '../dto/traumaFactor/create-trauma-factor.dto';
import { UpdateTraumaFactorDto } from '../dto/traumaFactor/update-trauma-factor.dto';
import { TraumaFactor } from '../entities/trauma-factor.entity';

@Injectable()
export class TraumaFactorService {
  constructor(private readonly repo: TraumaFactorRepository) {}

  // CREATE
  async create(dto: CreateTraumaFactorDto): Promise<TraumaFactor> {
    try {
      // check trùng code
      const existed = await this.repo.findOne({
        where: { code: dto.code },
      });

      if (existed) {
        throw new BadRequestException('Mã bị trùng');
      }

      const entity = this.repo.create(dto);
      return await this.repo.save(entity);
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Lỗi hệ thống');
    }
  }

  // UPDATE
  async update(id: number, dto: UpdateTraumaFactorDto): Promise<TraumaFactor> {
    try {
      const entity = await this.repo.findOne({ where: { id } });

      if (!entity) {
        throw new NotFoundException('Không tìm thấy yếu tố');
      }

      // nếu có update code thì check trùng
      if (dto.code) {
        const existed = await this.repo.findOne({
          where: { code: dto.code },
        });

        if (existed && existed.id !== id) {
          throw new BadRequestException('Mã bị trùng');
        }
      }

      Object.assign(entity, dto);

      return await this.repo.save(entity);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Lỗi hệ thống');
    }
  }

  // DELETE
  async delete(id: number): Promise<void> {
    try {
      const entity = await this.repo.findOne({ where: { id } });

      if (!entity) {
        throw new NotFoundException('Không tìm thấy yếu tố');
      }

      await this.repo.remove(entity);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Lỗi hệ thống');
    }
  }

  // FIND ALL
  async findAll(): Promise<TraumaFactor[]> {
    try {
      return await this.repo.find();
    } catch {
      throw new InternalServerErrorException('Lỗi hệ thống');
    }
  }

  // SEARCH
  async search(query: {
    code?: string;
    name?: string;
    status?: string;
  }): Promise<TraumaFactor[]> {
    try {
      const qb = this.repo.createQueryBuilder('tf');

      if (query.code) {
        qb.andWhere('tf.code LIKE :code', {
          code: `%${query.code}%`,
        });
      }

      if (query.name) {
        qb.andWhere('tf.name LIKE :name', {
          name: `%${query.name}%`,
        });
      }

      if (query.status) {
        qb.andWhere('tf.status = :status', {
          status: query.status,
        });
      }

      return await qb.getMany();
    } catch {
      throw new InternalServerErrorException('Lỗi hệ thống');
    }
  }
}