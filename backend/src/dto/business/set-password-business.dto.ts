import { IsNotEmpty, MinLength, Matches } from 'class-validator';

export class SetPasswordBusinessDto {
  @IsNotEmpty({message: "Vui lòng nhập mật khẩu"})
  @MinLength(8, { message: 'Mật khẩu phải có ít nhất 8 ký tự' })
  @Matches(/[A-Z]/, { message: 'Mật khẩu phải chứa ít nhất một chữ cái viết hoa' })
  password!: string;
}