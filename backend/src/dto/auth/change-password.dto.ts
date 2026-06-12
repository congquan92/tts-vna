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
    description: 'Mật khẩu mới (ít nhất 6 ký tự, bao gồm chữ và số)', 
    example: 'new_password_456',
    minLength: 6,
    required: true 
  })
  @IsNotEmpty({ message: 'Mật khẩu mới không được để trống' })
  @IsString()
  @MinLength(6, { message: 'Mật khẩu mới phải có ít nhất 6 ký tự' })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{6,}$/, {
    message: 'Mật khẩu mới phải chứa ít nhất một chữ cái và một số',
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