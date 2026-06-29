import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class CreateRoleDto {
    @ApiProperty({
        example: 'MANAGER_SO',
    })
    @IsString()
    @IsNotEmpty({ message: 'Mã vai trò không được để trống' })
    name!: string; // code

    @ApiProperty({
        example: 'Quản lý sở',
    })
    @IsString()
    @IsNotEmpty({ message: 'Tên hiển thị không được để trống' })
    displayName!: string; // UI label

    @ApiProperty({
        enum: ['SO', 'DOANH_NGHIEP'],
    })
    @IsEnum(['SO', 'DOANH_NGHIEP'])
    orgType!: 'SO' | 'DOANH_NGHIEP';
}