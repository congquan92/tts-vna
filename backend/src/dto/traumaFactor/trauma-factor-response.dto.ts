import { TraumaFactorStatus } from '../../entities/trauma-factor.entity';

export class TraumaFactorResponseDto {
  id!: number;
  code!: string;
  name!: string;
  status!: TraumaFactorStatus;
  createdAt!: Date;
  updatedAt!: Date;
}