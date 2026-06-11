import {
  IsString,
  MaxLength,
  IsNotEmpty,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { BusinessStatus } from '../entities/typeOfBusiness.entity';

export class CreateTypeOfBusinessDto {
  @ApiProperty({
    description: 'Mã loại hình kinh doanh',
    example: 'TYPE001',
    maxLength: 20,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20, { message: 'mã quá dài' })
  code!: string;

  @ApiProperty({
    description: 'Tên loại hình kinh doanh',
    example: 'Sản xuất',
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50, { message: 'tên quá dài' })
  name!: string;

  @ApiProperty({
    description: 'Trạng thái loại hình',
    enum: BusinessStatus,
    example: BusinessStatus.ACTIVE,
    required: false,
  })
  @IsEnum(BusinessStatus, { message: 'trạng thái không hợp lệ' })
  @IsOptional()
  status?: BusinessStatus;
}
