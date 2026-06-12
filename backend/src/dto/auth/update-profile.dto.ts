import { IsString, IsNotEmpty, IsOptional, IsEmail, IsEnum, IsInt, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiProperty({ description: 'Họ và tên đầy đủ' })
  @IsNotEmpty({ message: 'Vui lòng nhập họ và tên' })
  @IsString()
  fullName!: string;

 @ApiPropertyOptional({
    description: 'ID vai trò của người dùng (1: ADMIN_SO, 2: MANAGER_SO)',
    example: 2
  })
  @IsOptional()
  @IsInt({ message: 'Vai trò phải là số nguyên' })
  @Min(1, { message: 'Vai trò không hợp lệ' })
  roleId!: number;

  @ApiPropertyOptional({ description: 'Email' })
  @IsOptional()
  @IsEmail({}, { message: 'Email không đúng định dạng' })
  email?: string;

  @ApiPropertyOptional({ description: 'Giới tính', enum: ['Nam', 'Nữ'] })
  @IsOptional()
  gender?: string;

  @ApiPropertyOptional({ description: 'Ngày sinh', example: '10/06/2000 hoặc 2000-06-10' })
  @IsOptional()
  @IsString()
  dob?: string;

  @ApiPropertyOptional({ description: 'Chức vụ' })
  @IsOptional()
  @IsString()
  position?: string;

  @ApiPropertyOptional({ description: 'Tỉnh/Thành phố' })
  @IsOptional()
  @IsString()
  province?: string;

  @ApiPropertyOptional({ description: 'Phường/Xã' })
  @IsOptional()
  @IsString()
  ward?: string;

  @ApiPropertyOptional({ description: 'Địa chỉ chi tiết' })
  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional() avatarUrl?: string;
  @IsOptional() isActive?: boolean;
}