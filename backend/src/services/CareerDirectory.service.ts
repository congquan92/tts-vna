import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CareerDirectoryRepository } from '../repositories/careerDirectory.repository';
import { CreateCareerDirectoryDto } from '../dto/careerDirectory/createCareerDirectory.dto';
import { UpdateCareerDirectoryDto } from '../dto/careerDirectory/updateCareertory.dto';
import { CareerDirectoryListDto } from '../dto/careerDirectory/careerDirectoryList.dto';
import { CareerDirectoryResponseDto } from '../dto/careerDirectory/careerDirectoryResponse.dto';
import { CareerDirectory } from '../entities/career-directory.entity';
import { SearchCareerDirectoryDto } from '../dto/careerDirectory/searchCareerDirectory.dto';

@Injectable()
export class CareerDirectoryService {
  constructor(private readonly repo: CareerDirectoryRepository) {}

  // ================= CREATE =================
  async create(dto: CreateCareerDirectoryDto): Promise<CareerDirectoryResponseDto> {
    const level = this.calculateLevel(dto.code);

    // check trùng code
    const existing = await this.repo.findByCode(dto.code);
    if (existing) {
      throw new ConflictException(`Mã nghề '${dto.code}' đã tồn tại`);
    }

    const parentId = await this.resolveParent(dto.parentId, level);

    const payload: Partial<CareerDirectory> = {
      code: dto.code,
      name: dto.name,
      status: dto.status,
      level,
      parentId,
    };

    const created = await this.repo.createAndSave(payload);

    return this.toResponseDto(created);
  }

  // ================= GET ALL =================
  async findAll(): Promise<CareerDirectoryListDto[]> {
    const items = await this.repo.findAll();

    return items.map((i) => ({
      id: i.id,
      code: i.code,
      name: i.name,
      level: i.level,
    }));
  }

  // ================= GET ONE =================
  async findOne(idOrCode: string): Promise<CareerDirectoryResponseDto> {
    const item = await this.repo.findByIdOrCode(idOrCode);

    if (!item) {
      throw new NotFoundException('Không tìm thấy nghề');
    }

    return this.toResponseDto(item);
  }

  // ================= UPDATE =================
  async update(
    idOrCode: string,
    dto: UpdateCareerDirectoryDto,
  ): Promise<CareerDirectoryResponseDto> {
    const item = await this.repo.findByIdOrCode(idOrCode);

    if (!item) {
      throw new NotFoundException('Không tìm thấy nghề');
    }

    // update name
    if (dto.name !== undefined) {
      item.name = dto.name;
    }

    // update code
    if (dto.code && dto.code !== item.code) {
      const existing = await this.repo.findByCode(dto.code);

      if (existing && existing.id !== item.id) {
        throw new ConflictException(`Mã nghề '${dto.code}' đã bị trùng`);
      }

      item.code = dto.code;
      item.level = this.calculateLevel(dto.code);
    }

    // update parent
    if (dto.parentId !== undefined) {
      item.parentId = await this.resolveParent(
        dto.parentId,
        item.level,
      );
    }

    // update status (cascade)
    if (dto.status && dto.status !== item.status) {
      item.status = dto.status;
      await this.repo.updateStatusWithChildren(item, dto.status);
    }

    const saved = await this.repo.createAndSave(item);

    return this.toResponseDto(saved);
  }

  // ================= DELETE =================
  async remove(idOrCode: string): Promise<void> {
    const item = await this.repo.findByIdOrCode(idOrCode);

    if (!item) {
      throw new NotFoundException('Không tìm thấy nghề');
    }

    await this.repo.delete(item.id);
  }

  // ================= FILTER =================
  async findByLevel(level: number): Promise<CareerDirectoryResponseDto[]> {
    const items = await this.repo.findByLevel(level);
    return items.map(this.toResponseDto);
  }

  async findByLevelNot(level: number): Promise<CareerDirectoryResponseDto[]> {
    const items = await this.repo.findByLevelNot(level);
    return items.map(this.toResponseDto);
  }

  async searchCareerDirectories(query: SearchCareerDirectoryDto) {
    return this.repo.search(query);
  }

  // ================= PRIVATE =================

  private calculateLevel(code: string): number {
    const trimmed = code.trim();

    if (trimmed.length >= 1 && trimmed.length <= 4) {
      return trimmed.length;
    }

    throw new BadRequestException(
      'code không hợp lệ (1-4 ký tự)',
    );
  }

  private async resolveParent(
    parentInput: string | number | undefined,
    level: number,
  ): Promise<number | undefined> {
    if (
      parentInput === undefined ||
      parentInput === null ||
      parentInput === '' ||
      parentInput === 0 ||
      parentInput === '0'
    ) {
      return undefined;
    }

    const parent = await this.repo.findByIdOrCode(String(parentInput));

    if (!parent) {
      throw new BadRequestException('parentId không tồn tại');
    }

    if (level - parent.level !== 1 || level <= parent.level) {
      throw new BadRequestException(
        'cấp nghề không hợp lệ so với cấp cha',
      );
    }

    return parent.id;
  }

  private toResponseDto(item: CareerDirectory): CareerDirectoryResponseDto {
    return {
      id: item.id,
      code: item.code,
      name: item.name,
      parentId: item.parentId,
      status: item.status,
    };
  }
}