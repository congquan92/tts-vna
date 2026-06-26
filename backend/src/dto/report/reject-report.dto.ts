import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RejectReportDto {
  @ApiProperty({
    example: 'Thiếu thông tin người bị tai nạn',
    description: 'Lý do từ chối báo cáo',
  })
  @IsString()
  @IsNotEmpty({
    message: 'Lý do từ chối không được để trống',
  })
  reason!: string;
}