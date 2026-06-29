import { IsString, MaxLength, IsEnum, IsOptional } from 'class-validator';
import { TypeOfInjuryStatus } from '../../entities/type-of-injury.entity';

export class UpdateTypeOfInjuryDto {
  @IsString()
  @IsOptional()
  @MaxLength(20)
  code?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  name?: string;

  @IsOptional()
  parentId?: string | number;

  @IsEnum(TypeOfInjuryStatus)
  @IsOptional()
  status?: TypeOfInjuryStatus;

  @IsOptional()
  @IsString()
  description?: string;
}
