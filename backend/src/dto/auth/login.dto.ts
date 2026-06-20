import { IsString, IsNotEmpty, MinLength, IsIn, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: 'Tên đăng nhập hoặc Email của tài khoản',
    example: 'admin',
    required: true
  })
  @IsNotEmpty({ message: 'Vui lòng nhập đầy đủ thông tin' })
  @IsString()
  username!: string;

  @ApiProperty({
    description: 'Mật khẩu tài khoản (ít nhất 6 ký tự)',
    example: '123456',
    required: true,
    format: 'password'
  })
  @IsNotEmpty({ message: 'Vui lòng nhập đầy đủ thông tin' })
  @IsString()
  @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
  password!: string;

  @ApiPropertyOptional({
    description: 'ID doanh nghiệp (Chỉ bắt buộc nếu tài khoản thuộc Doanh nghiệp)',
    example: 1,
    required: false
  })
  @IsOptional()
  @IsNumber({}, { message: 'ID doanh nghiệp phải là một số' })
  businessId?: number;
}