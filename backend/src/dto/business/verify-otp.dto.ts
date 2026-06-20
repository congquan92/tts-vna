import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsNumber, IsString, Length } from 'class-validator';

export class VerifyOtpDto {
    @ApiProperty({
        example: 'abc@gmail.com',
        description: 'Email dùng để xác thực OTP',
    })
    @IsNotEmpty()
    @IsEmail()
    email!: string;

    @ApiProperty({
        example: '123456',
        description: 'Mã OTP 6 chữ số',
    })
    @IsNotEmpty()
    @IsString()
    @Length(6, 6)
    otp!: string;
}