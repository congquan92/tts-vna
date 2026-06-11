import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { BusinessIndustryRepository } from '../repositories/businessIndustry.repository';
import { CreateBusinessIndustryDto } from '../dto/createBusinessIndustry.dto';
import { UpdateBusinessIndustryDto } from '../dto/updateBusinessIndustry.dto';
import { BusinessIndustryListDto } from '../dto/businessIndustryList.dto';
import { BusinessIndustryResponseDto } from '../dto/businessIndustryResponse.dto';
import { BusinessIndustry } from '../entities/BusinessIndustry.entity';

@Injectable()
export class BusinessIndustryService {
  constructor(private readonly repo: BusinessIndustryRepository) {}

  async create(dto: CreateBusinessIndustryDto): Promise<BusinessIndustryResponseDto> {
    const level = this.calculateLevel(dto.code);

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
    return items.map((i) => ({ code: i.code, name: i.name, level: i.level }));
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

    // Kiểm tra nếu status thay đổi
    const statusChanged = dto.status && dto.status !== item.status;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    item.name = dto.name;
    item.status = dto.status;

    // Nếu status thay đổi và là cha, cập nhật tất cả children
    if (statusChanged) {
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
  // - Cấp 1: code là một chữ cái từ A đến U (ví dụ: "A", "B", ..., "U")
  // - Cấp 2: code là hai chữ số từ 01 đến 99 (ví dụ: "01", "02", ..., "99")
  // - Cấp 3-5: code là chuỗi gồm 3-5 chữ số (ví dụ: "123", "1234", "12345")
  private calculateLevel(code: string): number {
    const trimmed = code.trim();

    if (trimmed.length === 1 && /^[A-U]$/.test(trimmed)) {
      return 1;
    }

    if (trimmed.length === 2 && /^(?:0[1-9]|[1-9][0-9])$/.test(trimmed)) {
      return 2;
    }

    if ([3, 4, 5].includes(trimmed.length) && /^[0-9]+$/.test(trimmed)) {
      return trimmed.length;
    }

    throw new BadRequestException(
      'code không hợp lệ. Quy tắc: cấp 1=A-U, cấp 2=01-99, cấp 3-5=3-5 chữ số',
    );
  }
}
