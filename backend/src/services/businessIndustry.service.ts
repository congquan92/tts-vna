import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { BusinessIndustryRepository } from '../repositories/businessIndustry.repository';
import { CreateBusinessIndustryDto } from '../dto/businessIndustry/createBusinessIndustry.dto';
import { UpdateBusinessIndustryDto } from '../dto/businessIndustry/updateBusinessIndustry.dto';
import { BusinessIndustryListDto } from '../dto/businessIndustry/businessIndustryList.dto';
import { BusinessIndustryResponseDto } from '../dto/businessIndustry/businessIndustryResponse.dto';
import { BusinessIndustry } from '../entities/BusinessIndustry.entity';
import { SearchBusinessIndustryDto } from '../dto/businessIndustry/searchBusinessIndustry.dto';

@Injectable()
export class BusinessIndustryService {
  constructor(private readonly repo: BusinessIndustryRepository) {}

  async create(
    dto: CreateBusinessIndustryDto,
  ): Promise<BusinessIndustryResponseDto> {
    const level = this.calculateLevel(dto.code);

    // Kiểm tra xem mã ngành đã tồn tại chưa
    const existing = await this.repo.findByCode(dto.code);
    if (existing) {
      throw new ConflictException(
        `Mã ngành '${dto.code}' đã tồn tại trong hệ thống`,
      );
    }

    // Resolve parentId if provided (accept id or code)
    let parentId: number | undefined;
    if (
      dto.parentId !== undefined &&
      dto.parentId !== null &&
      dto.parentId !== ''
    ) {
      const parent = await this.repo.findByIdOrCode(String(dto.parentId));
      if (!parent)
        throw new BadRequestException(
          'parentId does not refer to an existing BusinessIndustry',
        );

      // Kiểm tra level con không thấp hơn level cha
      if (level - parent.level !== 1 || level <= parent.level) {
        throw new BadRequestException('cấp con không hợp lệ so với cấp cha');
      }

      parentId = parent.id;
    }

    const payload: Partial<BusinessIndustry> = {
      code: dto.code,
      name: dto.name,
      status: dto.status,
      level,
      parentId,
    };

    const created = await this.repo.createAndSave(payload);
    return {
      id: created.id,
      code: created.code,
      name: created.name,
      parentId: created.parentId,
      status: created.status,
    };
  }

  async findAll(): Promise<BusinessIndustryListDto[]> {
    const items = await this.repo.findAll();
    return items.map((i) => ({
      id: i.id,
      code: i.code,
      name: i.name,
      level: i.level,
    }));
  }

  async findOne(idOrCode: string): Promise<BusinessIndustryResponseDto | null> {
    const item = await this.repo.findByIdOrCode(idOrCode);
    if (!item) return null;
    return {
      id: item.id,
      code: item.code,
      name: item.name,
      parentId: item.parentId,
      status: item.status,
    };
  }
  // Cập nhật một BusinessIndustry, nếu status thay đổi và là cha thì cập nhật tất cả children theo status mới
  async update(
    idOrCode: string,
    dto: UpdateBusinessIndustryDto,
  ): Promise<BusinessIndustryResponseDto> {
    const item = await this.repo.findByIdOrCode(idOrCode);
    if (!item) throw new NotFoundException('BusinessIndustry not found');

    if (dto.name) {
      item.name = dto.name;
    }

    if (dto.code && dto.code !== item.code) {
      // Kiểm tra xem mã mới đã được sử dụng chưa
      const existing = await this.repo.findByCode(dto.code);
      if (existing && existing.id !== item.id) {
        throw new ConflictException(
          `Mã ngành '${dto.code}' đã được sử dụng bởi ngành nghề khác`,
        );
      }
      item.code = dto.code;
      item.level = this.calculateLevel(dto.code);
    }

    if (dto.parentId !== undefined) {
      if (
        dto.parentId === null ||
        dto.parentId === 0 ||
        dto.parentId === '0' ||
        dto.parentId === ''
      ) {
        item.parentId = undefined;
      } else {
        const parent = await this.repo.findByIdOrCode(String(dto.parentId));
        if (!parent)
          throw new BadRequestException(
            'parentId does not refer to an existing BusinessIndustry',
          );
        item.parentId = parent.id;
      }
    }

    // Kiểm tra nếu status thay đổi
    if (dto.status && dto.status !== item.status) {
      item.status = dto.status;
      await this.repo.updateStatusWithChildren(item, dto.status);
    }

    const saved = await this.repo.createAndSave(item);
    return {
      id: saved.id,
      code: saved.code,
      name: saved.name,
      parentId: saved.parentId,
      status: saved.status,
    };
  }

  async findByLevel(level: number): Promise<BusinessIndustryResponseDto[]> {
    const items = await this.repo.findByLevel(level);
    return items.map((item) => ({
      id: item.id,
      code: item.code,
      name: item.name,
      parentId: item.parentId,
      status: item.status,
    }));
  }

  async findByLevelNot(level: number): Promise<BusinessIndustryResponseDto[]> {
    const items = await this.repo.findByLevelNot(level);
    return items.map((item) => ({
      id: item.id,
      code: item.code,
      name: item.name,
      parentId: item.parentId,
      status: item.status,
    }));
  }
  // hàm tính thứ tự cấp (level) dựa trên quy tắc code:
  // - Cấp 1-5: dựa trên độ dài chuỗi code (1-5 ký tự)
  private calculateLevel(code: string): number {
    const trimmed = code.trim();

    if (trimmed.length >= 1 && trimmed.length <= 5) {
      return trimmed.length;
    }

    throw new BadRequestException(
      'code không hợp lệ. Quy tắc: độ dài từ 1 đến 5 ký tự',
    );
  }

  async searchBusinessIndustries(query: SearchBusinessIndustryDto) {
    return this.repo.search(query);
  }

  async remove(idOrCode: string): Promise<void> {
    const item = await this.repo.findByIdOrCode(idOrCode);
    if (!item) throw new NotFoundException('BusinessIndustry not found');
    await this.repo.delete(item.id);
  }
}
