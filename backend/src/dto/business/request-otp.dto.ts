import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, Matches } from 'class-validator';

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

    @ApiProperty({
        example: '0312345678',
        description: 'Mã số thuế doanh nghiệp',
    })
    @IsNotEmpty({
        message: 'Mã số thuế không được để trống',
    })
    @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
    @IsString()
    @Matches(/^\d{10,15}$/, {
        message:
            'Mã số thuế chỉ được chứa chữ số, không được âm và phải có từ 10 đến 15 chữ số',
    })
    taxCode!: string;
}