import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  BusinessIndustry,
  BusinessStatus,
} from '../entities/BusinessIndustry.entity';
import { SearchBusinessIndustryDto } from '../dto/businessIndustry/searchBusinessIndustry.dto';

@Injectable()
export class BusinessIndustryRepository {
  constructor(
    @InjectRepository(BusinessIndustry)
    private readonly repo: Repository<BusinessIndustry>,
  ) { }

  createAndSave(data: Partial<BusinessIndustry>): Promise<BusinessIndustry> {
    const e = this.repo.create(data as BusinessIndustry);
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    return this.repo.save(e) as Promise<BusinessIndustry>;
  }

  findAll(): Promise<BusinessIndustry[]> {
    return this.repo.find();
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

  findByLevel(level: number): Promise<BusinessIndustry[]> {
    return this.repo.find({ where: { level } });
  }

  findByLevelNot(level: number): Promise<BusinessIndustry[]> {
    return this.repo
      .createQueryBuilder('businessIndustry')
      .where('businessIndustry.level != :level', { level })
      .getMany();
  }

  /**
   * Tìm tất cả children của một parent
   */
  findChildrenByParentId(parentId: number): Promise<BusinessIndustry[]> {
    return this.repo.find({ where: { parentId } });
  }

  /**
   * Cập nhật status cho một item và tất cả children nếu là cha
   */
  async updateStatusWithChildren(
    parentItem: BusinessIndustry,
    newStatus: BusinessStatus,
  ): Promise<void> {
    // Nếu là cha (parentId = null), cập nhật tất cả children
    if (parentItem.parentId === null || parentItem.parentId === undefined) {
      const children = await this.findChildrenByParentId(parentItem.id);
      if (children.length > 0) {
        children.forEach((child) => {
          child.status = newStatus;
        });
        await this.repo.save(children);
      }
    }
    // Nếu là con, không cập nhật cha (chỉ cập nhật item hiện tại trong service)
  }

  async search(query: SearchBusinessIndustryDto) {
    const page = Math.max(Number(query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 100);
    const skip = (page - 1) * limit;

    const qb = this.repo.createQueryBuilder('industry');

    if (query.code) {
      qb.andWhere('industry.code ILIKE :code', {
        code: `%${query.code}%`,
      });
    }

    if (query.name) {
      qb.andWhere('industry.name ILIKE :name', {
        name: `%${query.name}%`,
      });
    }

    if (query.level !== undefined && query.level !== null) {
      const level = Number(query.level);
      if (!isNaN(level)) {
        qb.andWhere('industry.level = :level', { level });
      }
    }

    qb.orderBy('industry.id', 'DESC')
      .skip(skip)
      .take(limit);

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
