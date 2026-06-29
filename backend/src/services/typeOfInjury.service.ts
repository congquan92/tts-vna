import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { TypeOfInjuryRepository } from '../repositories/typeOfInjury.repository';
import { CreateTypeOfInjuryDto } from '../dto/type-of-injury/createTypeOfInjury.dto';
import { UpdateTypeOfInjuryDto } from '../dto/type-of-injury/updateTypeOfInjury.dto';
import { TypeOfInjuryListDto } from '../dto/type-of-injury/typeOfInjuryList.dto';
import { TypeOfInjuryResponseDto } from '../dto/type-of-injury/typeOfInjuryResponse.dto';
import { TypeOfInjury } from '../entities/type-of-injury.entity';
import { SearchTypeOfInjuryDto } from '../dto/type-of-injury/searchTypeOfInjury.dto';

@Injectable()
export class TypeOfInjuryService {
  constructor(private readonly repo: TypeOfInjuryRepository) {}

  async create(
    dto: CreateTypeOfInjuryDto,
  ): Promise<TypeOfInjuryResponseDto> {
    const level = this.calculateLevel(dto.code);

    // ❗ check trùng code
    const existing = await this.repo.findByCode(dto.code);
    if (existing) {
      throw new ConflictException('mã bị trùng');
    }

    // resolve parent
    let parentId: number | undefined;
    if (
      dto.parentId !== undefined &&
      dto.parentId !== null &&
      dto.parentId !== ''
    ) {
      const parent = await this.repo.findByIdOrCode(String(dto.parentId));
      if (!parent) {
        throw new BadRequestException(
          'parentId không tồn tại',
        );
      }

      // check level hợp lệ
      if (level - parent.level !== 1 || level <= parent.level) {
        throw new BadRequestException('cấp con không hợp lệ so với cấp cha');
      }

      parentId = parent.id;
    }

    const payload: Partial<TypeOfInjury> = {
      code: dto.code,
      name: dto.name,
      status: dto.status,
      level,
      parentId,
      description: dto.description,
    };

    const created = await this.repo.createAndSave(payload);

    return {
      id: created.id,
      code: created.code,
      name: created.name,
      parentId: created.parentId,
      status: created.status,
      level: created.level,
    };
  }

  async findAll(): Promise<TypeOfInjuryListDto[]> {
    const items = await this.repo.findAll();
    return items.map((i) => ({
      id: i.id,
      code: i.code,
      name: i.name,
      level: i.level,
      parentId: i.parentId,
      status: i.status,
    }));
  }

  async findOne(
    idOrCode: string,
  ): Promise<TypeOfInjuryResponseDto | null> {
    const item = await this.repo.findByIdOrCode(idOrCode);
    if (!item) return null;

    return {
      id: item.id,
      code: item.code,
      name: item.name,
      parentId: item.parentId,
      status: item.status,
      level: item.level,
    };
  }

  async update(
    idOrCode: string,
    dto: UpdateTypeOfInjuryDto,
  ): Promise<TypeOfInjuryResponseDto> {
    const item = await this.repo.findByIdOrCode(idOrCode);
    if (!item) throw new NotFoundException('TypeOfInjury not found');

    if (dto.name) {
      item.name = dto.name;
    }

    // ❗ update code + check trùng
    if (dto.code && dto.code !== item.code) {
      const existing = await this.repo.findByCode(dto.code);
      if (existing && existing.id !== item.id) {
        throw new ConflictException('mã bị trùng');
      }

      item.code = dto.code;
      item.level = this.calculateLevel(dto.code);
    }

    // update parent
    if (dto.parentId !== undefined) {
      if (
        dto.parentId === null ||
        dto.parentId === 0 ||
        dto.parentId === '0' ||
        dto.parentId === ''
      ) {
        item.parentId = undefined;
      } else {
        const parent = await this.repo.findByIdOrCode(
          String(dto.parentId),
        );
        if (!parent) {
          throw new BadRequestException(
            'parentId không tồn tại',
          );
        }
        item.parentId = parent.id;
      }
    }

    // update status + children
    if (dto.status && dto.status !== item.status) {
      item.status = dto.status;
      await this.repo.updateStatusWithChildren(item, dto.status);
    }

    if (dto.description !== undefined) {
      item.description = dto.description;
    }

    const saved = await this.repo.createAndSave(item);

    return {
      id: saved.id,
      code: saved.code,
      name: saved.name,
      parentId: saved.parentId,
      status: saved.status,
      level: saved.level,
    };
  }

  async findByLevel(
    level: number,
  ): Promise<TypeOfInjuryResponseDto[]> {
    const items = await this.repo.findByLevel(level);
    return items.map((item) => ({
      id: item.id,
      code: item.code,
      name: item.name,
      parentId: item.parentId,
      status: item.status,
      level: item.level,
    }));
  }

  async findByLevelNot(
    level: number,
  ): Promise<TypeOfInjuryResponseDto[]> {
    const items = await this.repo.findByLevelNot(level);
    return items.map((item) => ({
      id: item.id,
      code: item.code,
      name: item.name,
      parentId: item.parentId,
      status: item.status,
      level: item.level,
    }));
  }

  // 🔥 giữ nguyên rule từ bạn
  private calculateLevel(code: string): number {
    const trimmed = code.trim();

    if (trimmed.length >= 1 && trimmed.length <= 4) {
      return trimmed.length;
    }

    throw new BadRequestException(
      'code không hợp lệ. Độ dài từ 1 đến 4 ký tự',
    );
  }

  async searchTypeOfInjuries(query: SearchTypeOfInjuryDto) {
    return this.repo.search(query);
  }

  async remove(idOrCode: string): Promise<void> {
    const item = await this.repo.findByIdOrCode(idOrCode);
    if (!item) throw new NotFoundException('TypeOfInjury not found');

    await this.repo.delete(item.id);
  }
}
