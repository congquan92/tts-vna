import { IsNotEmpty } from 'class-validator';

export class SetPasswordDto {
  @IsNotEmpty({message: "Vui lòng nhập mật khẩu"})
  password!: string;
}