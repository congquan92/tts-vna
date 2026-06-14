import { IsString, MaxLength, IsEnum, IsOptional, IsNumber } from 'class-validator';
import { BusinessStatus } from '../../entities/BusinessIndustry.entity';

export class UpdateBusinessIndustryDto {
  @IsString()
  @IsOptional()
  @MaxLength(20)
  code?: string;

  @IsString()
  @IsOptional()
  @MaxLength(30)
  name?: string;

  @IsOptional()
  parentId?: string | number;

  @IsEnum(BusinessStatus)
  @IsOptional()
  status?: BusinessStatus;
}
