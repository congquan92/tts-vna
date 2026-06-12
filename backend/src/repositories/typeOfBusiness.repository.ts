import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { TypeOfBusiness, BusinessStatus } from '../entities/typeOfBusiness.entity';

@Injectable()
export class TypeOfBusinessRepository {
  constructor(
    @InjectRepository(TypeOfBusiness)
    private readonly typeOfBusinessRepository: Repository<TypeOfBusiness>,
  ) {}

  async createTypeOfBusiness(
    data: Partial<TypeOfBusiness>,
  ): Promise<TypeOfBusiness> {
    const entity = this.typeOfBusinessRepository.create(data);
    return await this.typeOfBusinessRepository.save(entity);
  }

  async findAll(): Promise<TypeOfBusiness[]> {
    return await this.typeOfBusinessRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOneById(id: number): Promise<TypeOfBusiness | null> {
    return await this.typeOfBusinessRepository.findOneBy({ id });
  }

  async findOneByCode(code: string): Promise<TypeOfBusiness | null> {
    return await this.typeOfBusinessRepository.findOneBy({ code });
  }
  // tìm kiếm gần đúng theo tên, đang sử dụng ILike để hỗ trợ tìm kiếm không phân biệt hoa thường, chỉ kiếm 1 từ trong tên cũng được
  async findByName(name: string): Promise<TypeOfBusiness[]> {
    return await this.typeOfBusinessRepository.find({
      where: { name: ILike(`%${name}%`) },
      order: { createdAt: 'DESC' },
    });
  }

  async findByStatus(status: BusinessStatus): Promise<TypeOfBusiness[]> {
    return await this.typeOfBusinessRepository.find({
      where: { status },
      order: { createdAt: 'DESC' },
    });
  }

  async updateTypeOfBusiness(entity: TypeOfBusiness): Promise<TypeOfBusiness> {
    return await this.typeOfBusinessRepository.save(entity);
  }

  async deleteTypeOfBusiness(id: number): Promise<void> {
    await this.typeOfBusinessRepository.delete({ id });
  }

  async save(typeOfBusiness: TypeOfBusiness){
    return await this.typeOfBusinessRepository.save(typeOfBusiness);
  }
}
