import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class RequestOtpDto {
    @ApiProperty({
        example: 'abc@gmail.com',
        description: 'Email dùng để đăng ký doanh nghiệp',
    })
    @IsNotEmpty({ message: 'Email không được để trống' })
    @IsEmail()
    email!: string;

    @ApiProperty({
        example: 'Công ty ABC',
        description: 'Tên doanh nghiệp đăng ký',
    })
    @IsNotEmpty({ message: 'Tên doanh nghiệp không được để trống' })
    @IsString()
    businessName!: string;
}