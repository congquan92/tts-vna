import { IsOptional, IsString, IsNumber, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

export class SearchUserDto {
  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  position?: string;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  roleId?: number;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  page?: number;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  limit?: number;
}