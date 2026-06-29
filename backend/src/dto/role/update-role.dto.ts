import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateRoleDto {
    @ApiPropertyOptional({
        example: 'Chuyên viên',
    })
    @IsOptional()
    @IsString()
    displayName?: string;

    @ApiPropertyOptional({
        enum: ['SO', 'DOANH_NGHIEP'],
    })
    @IsOptional()
    @IsEnum(['SO', 'DOANH_NGHIEP'])
    orgType?: 'SO' | 'DOANH_NGHIEP';
}