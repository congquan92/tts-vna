import { IsString, IsNotEmpty, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiProperty({ 
    description: 'Mật khẩu cũ của tài khoản hiện tại', 
    example: 'old_password_123',
    required: true 
  })
  @IsNotEmpty({ message: 'Mật khẩu cũ không được để trống' })
  @IsString()
  oldPass!: string;

  @ApiProperty({ 
    description: 'Mật khẩu mới (ít nhất 8 ký tự, bao gồm ít nhất một chữ hoa)', 
    example: 'NewPassword123',
    minLength: 8,
    required: true 
  })
  @IsNotEmpty({ message: 'Mật khẩu mới không được để trống' })
  @IsString()
  @MinLength(8, { message: 'Mật khẩu mới phải có ít nhất 8 ký tự' })
  @Matches(/[A-Z]/, {
    message: 'Mật khẩu mới phải chứa ít nhất một chữ cái viết hoa',
  })
  newPass!: string;

  @ApiProperty({ 
    description: 'Nhập lại mật khẩu mới để xác nhận', 
    example: 'new_password_456',
    required: true 
  })
  @IsNotEmpty({ message: 'Vui lòng xác nhận mật khẩu' })
  @IsString()
  confirmPass!: string;
}