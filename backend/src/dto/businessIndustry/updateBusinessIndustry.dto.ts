import { IsString, MaxLength, IsEnum } from 'class-validator';
import { BusinessStatus } from '../../entities/BusinessIndustry.entity';

export class UpdateBusinessIndustryDto {
  @IsString()
  @MaxLength(30)
  name!: string;

  @IsEnum(BusinessStatus)
  status!: BusinessStatus;
}
