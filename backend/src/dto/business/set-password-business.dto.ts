import { IsNotEmpty } from 'class-validator';

export class SetPasswordBusinessDto {
  @IsNotEmpty({message: "Vui lòng nhập mật khẩu"})
  password!: string;
}