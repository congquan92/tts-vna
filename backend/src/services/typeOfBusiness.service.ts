import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { TypeOfBusinessRepository } from '../repositories/typeOfBusiness.repository';
import { CreateTypeOfBusinessDto } from '../dto/createTypeOfBusiness.dto';
import { UpdateTypeOfBusinessDto } from '../dto/updateTypeOfBusiness.dto';
import { TypeOfBusiness } from '../entities/typeOfBusiness.entity';
import { TypeOfBusinessResponseDto } from '../dto/typeOfBusinessResponse.dto';
import { BusinessStatus } from '../entities/typeOfBusiness.entity';

@Injectable()
export class TypeOfBusinessService {
  constructor(
    private readonly typeOfBusinessRepository: TypeOfBusinessRepository,
  ) {}

  private toResponse(entity: TypeOfBusiness): TypeOfBusinessResponseDto {
    const { id, code, name, status } = entity;
    return { id, code, name, status };
  }

  async create(
    createDto: CreateTypeOfBusinessDto,
  ): Promise<TypeOfBusinessResponseDto> {
    const existing = await this.typeOfBusinessRepository.findOneByCode(
      createDto.code,
    );
    if (existing) {
      throw new ConflictException('Mã loại hình kinh doanh đã tồn tại');
    }
    const created =
      await this.typeOfBusinessRepository.createTypeOfBusiness(createDto);
    return this.toResponse(created);
  }

  async findAll(): Promise<TypeOfBusinessResponseDto[]> {
    const items = await this.typeOfBusinessRepository.findAll();
    return items.map((i) => this.toResponse(i));
  }

  async findByName(name: string): Promise<TypeOfBusinessResponseDto[]> {
    const items = await this.typeOfBusinessRepository.findByName(name);
    return items.map((i) => this.toResponse(i));
  }

  async findByStatus(status: string): Promise<TypeOfBusinessResponseDto[]> {
    // ensure status is a valid enum value
    if (!Object.values(BusinessStatus).includes(status as BusinessStatus)) {
      return [];
    }
    const items = await this.typeOfBusinessRepository.findByStatus(
      status as BusinessStatus,
    );
    return items.map((i) => this.toResponse(i));
  }

  async findByCode(code: string): Promise<TypeOfBusinessResponseDto | null> {
    const item = await this.typeOfBusinessRepository.findOneByCode(code);
    if (!item) return null;
    return this.toResponse(item);
  }

  async findOne(id: number): Promise<TypeOfBusinessResponseDto> {
    const item = await this.typeOfBusinessRepository.findOneById(id);
    if (!item) {
      throw new NotFoundException('Loại hình kinh doanh không tồn tại');
    }
    return this.toResponse(item);
  }

  async update(
    id: number,
    updateDto: UpdateTypeOfBusinessDto,
  ): Promise<TypeOfBusinessResponseDto> {
    const item = await this.findOne(id);

    if (updateDto.code && updateDto.code !== item.code) {
      const existing = await this.typeOfBusinessRepository.findOneByCode(
        updateDto.code,
      );
      if (existing && existing.id !== id) {
        throw new ConflictException('Mã loại hình kinh doanh đã được sử dụng');
      }
    }

    // fetch raw entity to apply updates
    const raw = await this.typeOfBusinessRepository.findOneById(id);

    if (!raw) {
      throw new NotFoundException('Loại hình kinh doanh không tồn tại');
    }

    Object.assign(raw, updateDto);

    const updated =
      await this.typeOfBusinessRepository.updateTypeOfBusiness(raw);

    return this.toResponse(updated);
  }

  async remove(id: number): Promise<{ message: string }> {
    await this.findOne(id);
    await this.typeOfBusinessRepository.deleteTypeOfBusiness(id);
    return { message: 'Xóa loại hình kinh doanh thành công' };
  }
}
