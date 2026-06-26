import { IsEnum, IsNotEmpty, IsOptional, Length } from 'class-validator';
import { TraumaFactorStatus } from '../../entities/trauma-factor.entity';

export class CreateTraumaFactorDto {
  @IsNotEmpty()
  @Length(1, 20)
  code!: string;

  @IsNotEmpty()
  @Length(1, 255)
  name!: string;

  @IsOptional()
  @IsEnum(TraumaFactorStatus)
  status?: TraumaFactorStatus;
}