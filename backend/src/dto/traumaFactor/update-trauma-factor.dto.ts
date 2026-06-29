import { IsEnum, IsOptional, Length } from 'class-validator';
import { TraumaFactorStatus } from '../../entities/trauma-factor.entity';

export class UpdateTraumaFactorDto {
  @IsOptional()
  @Length(1, 20)
  code?: string;

  @IsOptional()
  @Length(1, 255)
  name?: string;

  @IsOptional()
  @IsEnum(TraumaFactorStatus)
  status?: TraumaFactorStatus;
}