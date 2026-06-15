import { IsString, IsEmail, IsNotEmpty, ValidateIf, MinLength, Matches } from 'class-validator';
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
    description: 'Mật khẩu mới (Tối thiểu 8 ký tự, 1 chữ hoa)', 
    example: 'NewPassword789' 
  })
  @ValidateIf(o => o.otp)
  @IsNotEmpty({ message: 'Mật khẩu mới không được để trống' })
  @MinLength(8, { message: 'Mật khẩu mới phải có ít nhất 8 ký tự' })
  @Matches(/[A-Z]/, { message: 'Mật khẩu phải chứa ít nhất một chữ cái viết hoa' })
  newPassword?: string;

  @ApiPropertyOptional({ 
    description: 'Xác nhận mật khẩu mới', 
    example: 'NewPassword789' 
  })
  @ValidateIf(o => o.otp)
  @IsNotEmpty({ message: 'Xác nhận mật khẩu mới không được để trống' })
  @MinLength(8, { message: 'Xác nhận mật khẩu mới phải có ít nhất 8 ký tự' })
  confirmNewPassword?: string;
}