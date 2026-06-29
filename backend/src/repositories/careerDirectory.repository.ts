import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CareerDirectory,
  CareerStatus,
} from '../entities/career-directory.entity';
import { SearchCareerDirectoryDto } from '../dto/careerDirectory/searchCareerDirectory.dto';

@Injectable()
export class CareerDirectoryRepository {
  constructor(
    @InjectRepository(CareerDirectory)
    private readonly repo: Repository<CareerDirectory>,
  ) {}

  createAndSave(data: Partial<CareerDirectory>): Promise<CareerDirectory> {
    const e = this.repo.create(data as CareerDirectory);
    return this.repo.save(e) as Promise<CareerDirectory>;
  }

  async findAll(): Promise<CareerDirectory[]> {
    return this.repo.find({
      order: {
        id: 'DESC',
      },
    });
  }

  findById(id: number) {
    return this.repo.findOne({ where: { id } });
  }

  findByCode(code: string) {
    return this.repo.findOne({ where: { code } });
  }

  findByIdOrCode(idOrCode: string) {
    if (/^\d+$/.test(idOrCode)) return this.findById(Number(idOrCode));
    return this.findByCode(idOrCode);
  }

  findByLevel(level: number): Promise<CareerDirectory[]> {
    return this.repo.find({ where: { level } });
  }

  findByLevelNot(level: number): Promise<CareerDirectory[]> {
    return this.repo
      .createQueryBuilder('career')
      .where('career.level != :level', { level })
      .getMany();
  }

  /**
   * Tìm tất cả children của một parent
   */
  findChildrenByParentId(parentId: number): Promise<CareerDirectory[]> {
    return this.repo.find({ where: { parentId } });
  }

  /**
   * Cập nhật status cho một item và tất cả children nếu là cha
   */
  async updateStatusWithChildren(
    parentItem: CareerDirectory,
    newStatus: CareerStatus,
  ): Promise<void> {
    // Nếu là cha
    if (parentItem.parentId === null || parentItem.parentId === undefined) {
      const children = await this.findChildrenByParentId(parentItem.id);

      if (children.length > 0) {
        children.forEach((child) => {
          child.status = newStatus;
        });

        await this.repo.save(children);
      }
    }
  }

  async search(query: SearchCareerDirectoryDto) {
    const page = Math.max(Number(query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 100);
    const skip = (page - 1) * limit;

    const qb = this.repo.createQueryBuilder('career');

    if (query.code) {
      qb.andWhere('career.code ILIKE :code', {
        code: `%${query.code}%`,
      });
    }

    if (query.name) {
      qb.andWhere('career.name ILIKE :name', {
        name: `%${query.name}%`,
      });
    }

    if (query.level !== undefined && query.level !== null) {
      const level = Number(query.level);
      if (!isNaN(level)) {
        qb.andWhere('career.level = :level', { level });
      }
    }

    qb.orderBy('career.id', 'DESC').skip(skip).take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async delete(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}