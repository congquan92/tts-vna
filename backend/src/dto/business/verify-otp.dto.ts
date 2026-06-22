import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsNumber, IsString, Length } from 'class-validator';

export class VerifyOtpDto {
    @ApiProperty({
        example: 'abc@gmail.com',
        description: 'Email dùng để xác thực OTP',
    })
    @IsNotEmpty({ message: 'Email không được để trống' })
    @IsEmail({}, { message: 'Email không đúng định dạng' })
    email!: string;

    @ApiProperty({
        example: '123456',
        description: 'Mã OTP 6 chữ số',
    })
    @IsNotEmpty({ message: 'Mã OTP không được để trống' })
    @IsString({ message: 'Mã OTP phải là chuỗi' })
    @Length(6, 6, { message: 'Mã OTP phải có độ dài đúng 6 ký tự' })
    otp!: string;
}