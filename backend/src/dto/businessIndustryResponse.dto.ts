import { BusinessStatus } from '../entities/BusinessIndustry.entity';

export class BusinessIndustryResponseDto {
  id!: number;
  code!: string;
  name!: string;
  parentId?: number;
  status!: BusinessStatus;
}
