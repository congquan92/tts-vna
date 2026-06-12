import { IsString, IsEmail, IsNotEmpty, ValidateIf, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ForgotPasswordDto {
  @ApiProperty({ 
    description: 'Email cần khôi phục mật khẩu', 
    example: 'nguyenvana@gmail.com',
    required: true 
  })
  @IsNotEmpty({ message: 'Email không được để trống' })
  @IsEmail({}, { message: 'Email không đúng định dạng' })
  email!: string;

  @ApiPropertyOptional({ 
    description: 'Mã OTP nhận được qua email (Bắt buộc nếu muốn đổi mật khẩu)', 
    example: '123456' 
  })
  @ValidateIf(o => o.newPassword || o.confirmNewPassword)
  @IsNotEmpty({ message: 'Mã OTP không được để trống' })
  @IsString()
  otp?: string;

  @ApiPropertyOptional({ 
    description: 'Mật khẩu mới (Tối thiểu 6 ký tự)', 
    example: 'newPassword789' 
  })
  @ValidateIf(o => o.otp)
  @IsNotEmpty({ message: 'Mật khẩu mới không được để trống' })
  @MinLength(6, { message: 'Mật khẩu mới phải có ít nhất 6 ký tự' })
  newPassword?: string;

  @ApiPropertyOptional({ 
    description: 'Xác nhận mật khẩu mới', 
    example: 'newPassword789' 
  })
  @ValidateIf(o => o.otp)
  @IsNotEmpty({ message: 'Xác nhận mật khẩu mới không được để trống' })
  @MinLength(6, { message: 'Xác nhận mật khẩu mới phải có ít nhất 6 ký tự' })
  confirmNewPassword?: string;
}