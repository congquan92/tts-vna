import { IsString, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

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
    example: 'password123',
    required: true,
    format: 'password' 
  })
  @IsNotEmpty({ message: 'Vui lòng nhập đầy đủ thông tin' })
  @IsString()
  @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
  password!: string;
}