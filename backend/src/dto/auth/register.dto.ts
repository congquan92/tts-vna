import { IsString, IsEmail, MinLength, IsNotEmpty, IsInt, Min, IsIn, Matches } from 'class-validator';
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
    example: 'Password123',
    minLength: 8,
    format: 'password'
  })
  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  @MinLength(8, { message: 'Mật khẩu phải có ít nhất 8 ký tự' })
  @Matches(/[A-Z]/, { message: 'Mật khẩu phải chứa ít nhất một chữ cái viết hoa' })
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
    description: 'ID vai trò của người dùng (1: Quản trị viên, 2: Chuyên viên)',
    example: 2
  })
  @IsNotEmpty({ message: 'Vai trò không được để trống' })
  @IsInt({ message: 'Vai trò phải là số nguyên' })
  @Min(1, { message: 'Vai trò không hợp lệ' })
  roleId!: number;

  @ApiProperty({
    description: 'Loại tổ chức (SO hoặc DOANH_NGHIEP)',
    example: 'SO'
  })
  @IsNotEmpty({ message: 'Loại tổ chức không được để trống' })
  @IsIn(['SO', 'DOANH_NGHIEP'], { message: 'Loại tổ chức phải là SO hoặc DOANH_NGHIEP' })
  orgType!: 'SO' | 'DOANH_NGHIEP';
}