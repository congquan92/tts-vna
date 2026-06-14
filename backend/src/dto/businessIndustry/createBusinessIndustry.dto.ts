import {
  IsString,
  IsOptional,
  IsEnum,
  IsInt,
  MaxLength,
  Matches,
} from 'class-validator';
import { BusinessStatus } from '../../entities/BusinessIndustry.entity';

const CODE_PATTERN =
  /^[A-Z0-9]{1,5}$/;

export class CreateBusinessIndustryDto {
  @IsString()
  @Matches(CODE_PATTERN, {
    message:
      'code must be a valid alphanumeric string (1-5 characters)',
  })
  code!: string;

  @IsString()
  @MaxLength(30)
  name!: string;

  @IsOptional()
  // Accept numeric id or parent code (string). Service will resolve to numeric id.
  parentId?: string | number;

  @IsEnum(BusinessStatus)
  status!: BusinessStatus;
}
