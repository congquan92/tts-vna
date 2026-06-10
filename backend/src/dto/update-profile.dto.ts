import { IsString, IsOptional, IsEmail, IsBoolean, IsDate, IsUrl } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdateProfileDto {
  @ApiPropertyOptional({ description: 'Họ và tên đầy đủ', example: 'Nguyễn Văn A' })
  @IsOptional() @IsString() fullName?: string;

  @ApiPropertyOptional({ description: 'Địa chỉ email mới', example: 'nguyenvana@gmail.com' })
  @IsOptional() @IsEmail() email?: string;

  @ApiPropertyOptional({ description: 'Link ảnh đại diện', example: '/uploads/avatars/123.png' })
  @IsOptional() @IsString() avatarUrl?: string;

  @ApiPropertyOptional({ description: 'Giới tính', example: 'Nam', enum: ['Nam', 'Nữ'] })
  @IsOptional() @IsString() gender?: string;

  @ApiPropertyOptional({ description: 'Tỉnh/Thành phố', example: 'TP.HCM' })
  @IsOptional() @IsString() province?: string;
  
  @ApiPropertyOptional({ description: 'Trạng thái hoạt động', example: true })
  @IsOptional() @IsBoolean() isActive?: boolean;

  @ApiPropertyOptional({ description: 'Ngày tháng năm sinh', example: '2000-01-01', type: 'string', format: 'date' })
  @IsOptional() 
  @Type(() => Date) 
  @IsDate()
  dob?: Date; 

  @ApiPropertyOptional({ description: 'Chức vụ/Vị trí công việc', example: 'Developer' })
  @IsOptional() @IsString() position?: string;

  @ApiPropertyOptional({ description: 'Phường/Xã', example: 'Phường 1' })
  @IsOptional() @IsString() ward?: string;

  @ApiPropertyOptional({ description: 'Địa chỉ chi tiết', example: '123 Đường ABC' })
  @IsOptional() @IsString() address?: string;
}