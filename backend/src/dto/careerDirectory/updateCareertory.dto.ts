import {
  IsString,
  MaxLength,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { CareerStatus } from '../../entities/career-directory.entity';

export class UpdateCareerDirectoryDto {
  @IsString()
  @IsOptional()
  @MaxLength(20)
  code?: string;

  @IsString()
  @MaxLength(30)
  name?: string;

  @IsOptional()
  parentId?: string | number;

  @IsEnum(CareerStatus)
  @IsOptional()
  status?: CareerStatus;
}