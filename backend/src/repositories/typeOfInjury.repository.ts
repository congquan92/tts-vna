import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  TypeOfInjury,
  TypeOfInjuryStatus,
} from '../entities/type-of-injury.entity';
import { SearchTypeOfInjuryDto } from '../dto/type-of-injury/searchTypeOfInjury.dto';

@Injectable()
export class TypeOfInjuryRepository {
  constructor(
    @InjectRepository(TypeOfInjury)
    private readonly repo: Repository<TypeOfInjury>,
  ) {}

  createAndSave(data: Partial<TypeOfInjury>): Promise<TypeOfInjury> {
    const e = this.repo.create(data as TypeOfInjury);
    return this.repo.save(e) as Promise<TypeOfInjury>;
  }

  async findAll(): Promise<TypeOfInjury[]> {
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

  findByLevel(level: number): Promise<TypeOfInjury[]> {
    return this.repo.find({ where: { level } });
  }

  findByLevelNot(level: number): Promise<TypeOfInjury[]> {
    return this.repo
      .createQueryBuilder('typeOfInjury')
      .where('typeOfInjury.level != :level', { level })
      .getMany();
  }

  /**
   * Tìm tất cả children của một parent
   */
  findChildrenByParentId(parentId: number): Promise<TypeOfInjury[]> {
    return this.repo.find({ where: { parentId } });
  }

  /**
   * Cập nhật status cho một item và tất cả children nếu là cha
   */
  async updateStatusWithChildren(
    parentItem: TypeOfInjury,
    newStatus: TypeOfInjuryStatus,
  ): Promise<void> {
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

  async search(query: SearchTypeOfInjuryDto) {
    const page = Math.max(Number(query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 100);
    const skip = (page - 1) * limit;

    const qb = this.repo.createQueryBuilder('injury');

    if (query.code) {
      qb.andWhere('injury.code ILIKE :code', {
        code: `%${query.code}%`,
      });
    }

    if (query.name) {
      qb.andWhere('injury.name ILIKE :name', {
        name: `%${query.name}%`,
      });
    }

    if (query.level !== undefined && query.level !== null) {
      const level = Number(query.level);
      if (!isNaN(level)) {
        qb.andWhere('injury.level = :level', { level });
      }
    }

    qb.orderBy('injury.id', 'DESC').skip(skip).take(limit);

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
