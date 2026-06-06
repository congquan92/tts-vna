import { IsString, IsEmail, MinLength, IsNotEmpty, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ 
    description: 'Tên đăng nhập (username)', 
    example: 'nguyenvana123',
    minLength: 3 
  })
  @IsNotEmpty({ message: 'Tên đăng nhập không được để trống' })
  @IsString()
  username!: string;

  @ApiProperty({ 
    description: 'Mật khẩu tài khoản', 
    example: 'password123',
    minLength: 6,
    format: 'password' 
  })
  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
  password!: string;

  @ApiProperty({ 
    description: 'Họ và tên người dùng', 
    example: 'Nguyễn Văn A' 
  })
  @IsNotEmpty({ message: 'Họ tên không được để trống' })
  @IsString()
  fullName!: string;

  @ApiProperty({ 
    description: 'Địa chỉ email hợp lệ', 
    example: 'nguyenvana@gmail.com' 
  })
  @IsNotEmpty({ message: 'Email không được để trống' })
  @IsEmail({}, { message: 'Email không đúng định dạng' })
  email!: string;

  @ApiProperty({ 
    description: 'Vai trò của người dùng', 
    example: 'User',
    enum: ['Admin', 'User', 'Moderator'] // dropdown chọn vai trò hợp lệ
  })
  @IsNotEmpty({ message: 'Vai trò không được để trống' })
  @IsIn(['Admin', 'User', 'Moderator'], { message: 'Vai trò không hợp lệ' })
  role!: string;
}