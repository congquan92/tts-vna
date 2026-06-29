import {
  IsString,
  IsOptional,
  IsEnum,
  MaxLength,
  Matches,
} from 'class-validator';
import { TypeOfInjuryStatus } from '../../entities/type-of-injury.entity';

const CODE_PATTERN = /^[A-Z0-9]{1,4}$/;

export class CreateTypeOfInjuryDto {
  @IsString()
  @Matches(CODE_PATTERN, {
    message: 'code must be a valid alphanumeric string (1-4 characters)',
  })
  code!: string;

  @IsString()
  @MaxLength(100)
  name!: string;

  @IsOptional()
  // có thể là id hoặc code (service sẽ xử lý)
  parentId?: string | number;

  @IsEnum(TypeOfInjuryStatus)
  status!: TypeOfInjuryStatus;

  @IsOptional()
  @IsString()
  description?: string;
}
