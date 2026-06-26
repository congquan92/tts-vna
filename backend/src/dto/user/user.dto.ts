import { IsString, IsEmail, IsNotEmpty, IsOptional, IsBoolean, MinLength, Matches, IsDateString, IsInt, Min, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export enum OrgType {
  SO = 'SO',
  DOANH_NGHIEP = 'DOANH_NGHIEP',
}

export class CreateUserDto {
  @ApiProperty({ description: 'Tên đăng nhập', example: 'admin123456' })
  @IsString()
  @IsNotEmpty({ message: 'Vui lòng nhập tên đăng nhập' })
  @Matches(/^(?=.{8,20}$)[a-zA-Z0-9](?:[a-zA-Z0-9]|[._](?![._]))*[a-zA-Z0-9]$/, {
    message: 'Tên đăng nhập 8-20 ký tự, không bắt đầu/kết thúc bằng . hoặc _'
  })
  username!: string;

  @ApiPropertyOptional({ description: 'Mật khẩu' })
  @IsOptional()
  @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
  password?: string;

  @ApiProperty({ description: 'Họ và tên' })
  @IsString()
  @IsNotEmpty({ message: 'Vui lòng nhập họ và tên' })
  fullName!: string;

  @ApiProperty({ description: 'Email' })
  @IsEmail({}, { message: 'Email không đúng định dạng' })
  @IsNotEmpty({ message: 'Vui lòng nhập email' })
  email!: string;

  @ApiPropertyOptional({
    description: 'ID vai trò của người dùng (1: Quản trị viên, 2: Chuyên viên)',
    example: 2
  })
  @IsOptional()
  @IsInt({ message: 'Vai trò phải là số nguyên' })
  @Min(1, { message: 'Vai trò không hợp lệ' })
  roleId!: number;

  @ApiPropertyOptional() @IsOptional() @IsString() position?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() dob?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() gender?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() province?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() ward?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() address?: string;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  isActive: boolean = true;

  @ApiPropertyOptional({
    description: 'Loại tổ chức (SO hoặc DOANH_NGHIEP) - Hệ thống tự gán',
    enum: OrgType
  })
  @IsOptional()
  @IsEnum(OrgType)
  orgType?: string;
}

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiPropertyOptional({ description: 'Không được cập nhật username' })
  username?: never;
}