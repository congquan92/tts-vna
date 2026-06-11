import {
  IsString,
  IsOptional,
  IsEnum,
  IsInt,
  MaxLength,
  Matches,
} from 'class-validator';
import { BusinessStatus } from '../entities/BusinessIndustry.entity';

const CODE_PATTERN =
  /^(?:[A-U]|(?:0[1-9]|[1-9][0-9])|[0-9]{3}|[0-9]{4}|[0-9]{5})$/;

export class CreateBusinessIndustryDto {
  @IsString()
  @Matches(CODE_PATTERN, {
    message:
      'code must be a valid business industry code: level 1 A-U, level 2 01-99, level 3-5 digits',
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
