import { IsString, MaxLength, IsEnum, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { BusinessStatus } from '../../entities/typeOfBusiness.entity';

export class UpdateTypeOfBusinessDto {
  @ApiPropertyOptional({
    description: 'Mã loại hình kinh doanh',
    example: 'TYPE001',
    maxLength: 20,
  })
  @IsString()
  @IsOptional()
  @MaxLength(20, { message: 'mã quá dài' })
  code?: string;

  @ApiPropertyOptional({
    description: 'Tên loại hình kinh doanh',
    example: 'Sản xuất',
    maxLength: 50,
  })
  @IsString()
  @IsOptional()
  @MaxLength(50, { message: 'tên quá dài' })
  name?: string;

  @ApiPropertyOptional({
    description: 'Trạng thái loại hình',
    enum: BusinessStatus,
    example: BusinessStatus.ACTIVE,
  })
  @IsEnum(BusinessStatus, { message: 'trạng thái không hợp lệ' })
  @IsOptional()
  status?: BusinessStatus;
}
