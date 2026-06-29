import {
  IsString,
  IsOptional,
  IsEnum,
  MaxLength,
  Matches,
} from 'class-validator';
import { CareerStatus } from '../../entities/career-directory.entity';

const CODE_PATTERN = /^[A-Z0-9]{1,4}$/;

export class CreateCareerDirectoryDto {
  @IsString()
  @Matches(CODE_PATTERN, {
    message: 'code must be a valid alphanumeric string (1-4 characters)',
  })
  code!: string;

  @IsString()
  @MaxLength(30)
  name!: string;

  @IsOptional()
  // có thể truyền id hoặc code
  parentId?: string | number;

  @IsEnum(CareerStatus)
  status!: CareerStatus;
}