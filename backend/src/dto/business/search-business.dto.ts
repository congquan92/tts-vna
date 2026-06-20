import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, IsBoolean } from 'class-validator';
import { Type, Transform  } from 'class-transformer';

export class SearchBusinessDto {
    @ApiPropertyOptional({ example: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    page?: number;

    @ApiPropertyOptional({ example: 10 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    limit?: number;

    @ApiPropertyOptional({ example: 'ABC' })
    @IsOptional()
    @IsString()
    businessName?: string;

    @ApiPropertyOptional({ example: '0312345678' })
    @IsOptional()
    @IsString()
    taxCode?: string;

    @ApiPropertyOptional({ example: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    typeOfBusinessId?: number;

    @ApiPropertyOptional({ example: 10 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    businessIndustryId?: number;

    @ApiPropertyOptional({ example: 'Phường Hiệp Bình' })
    @IsOptional()
    @IsString()
    registeredWard?: string;

    @ApiPropertyOptional({ example: true })
    @IsOptional()
    @Transform(({ value }) => {
        if (value === 'true') return true;
        if (value === 'false') return false;
        return value;
    })
    @IsBoolean()
    status?: boolean;
}