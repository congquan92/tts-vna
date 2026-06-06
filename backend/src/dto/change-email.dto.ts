import { IsEmail, IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangeEmailDto {
  @ApiProperty({ example: 'nguyenvanb@gmail.com', description: 'Email mới muốn cập nhật' })
  @IsNotEmpty({ message: 'Email mới không được để trống' })
  @IsEmail({}, { message: 'Email mới không đúng định dạng' })
  newEmail!: string;

  @ApiProperty({ example: '123456', description: 'Mã OTP nhận được từ email hiện tại' })
  @IsNotEmpty({ message: 'Mã OTP không được để trống' })
  @IsString({ message: 'Mã OTP phải là chuỗi' })
  @MinLength(6, { message: 'Mã OTP phải có 6 ký tự' })
  @MaxLength(6, { message: 'Mã OTP phải có 6 ký tự' })
  otp!: string;
}