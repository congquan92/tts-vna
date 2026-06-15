import {
    IsString,
    IsNotEmpty,
    IsEmail,
    IsOptional,
    IsInt,
    IsDateString,
    MaxLength,
    Matches,
} from 'class-validator';
import {
    ApiProperty,
    ApiPropertyOptional,
    PartialType,
} from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateBusinessDto {

    @ApiProperty({
        example: '0312345678',
        description: 'Mã số thuế doanh nghiệp',
    })
    @IsNotEmpty({
        message: 'Mã số thuế không được để trống',
    })
    @Matches(/^(\d{10})$|^(\d{10}-\d{3})$/, {
        message: 'Mã số thuế không hợp lệ',
    })
    taxCode!: string;

    @ApiProperty({
        example: 'Công ty TNHH ABC',
        description: 'Tên doanh nghiệp',
    })
    @IsString()
    @IsNotEmpty({
        message: 'Tên doanh nghiệp không được để trống',
    })
    @MaxLength(255, {
        message: 'Tên doanh nghiệp tối đa 255 ký tự',
    })
    businessName!: string;

    @ApiPropertyOptional({
        example: 'ABC Company Limited',
        description: 'Tên tiếng nước ngoài',
    })
    @IsOptional()
    @IsString()
    @MaxLength(255, {
        message: 'Tên tiếng nước ngoài tối đa 255 ký tự',
    })
    foreignName?: string;

    @ApiProperty({
        example: 1,
        description: 'ID loại hình kinh doanh',
    })
    @Type(() => Number)
    @IsInt({
        message: 'Loại hình kinh doanh không hợp lệ',
    })
    typeOfBusinessId!: number;

    @ApiProperty({
        example: 10,
        description: 'ID ngành nghề kinh doanh',
    })
    @Type(() => Number)
    @IsInt({
        message: 'Ngành nghề kinh doanh không hợp lệ',
    })
    businessIndustryId!: number;

    @ApiPropertyOptional({
        example: '2025-01-01',
        description: 'Ngày cấp giấy phép kinh doanh',
    })
    @IsOptional()
    @IsDateString({}, {
        message: 'Ngày cấp giấy phép kinh doanh không hợp lệ',
    })
    businessLicenseDate?: Date;

    @ApiProperty({
        example: 'TP. Hồ Chí Minh',
    })
    @IsString()
    @IsNotEmpty({
        message: 'Tỉnh/Thành phố đăng ký không được để trống',
    })
    registeredProvince!: string;

    @ApiProperty({
        example: 'Phường Hiệp Bình',
    })
    @IsString()
    @IsNotEmpty({
        message: 'Phường/Xã đăng ký không được để trống',
    })
    registeredWard!: string;

    @ApiProperty({
        example: '123 Quốc lộ 13',
    })
    @IsString()
    @IsNotEmpty({
        message: 'Địa chỉ đăng ký không được để trống',
    })
    @MaxLength(500, {
        message: 'Địa chỉ đăng ký tối đa 500 ký tự',
    })
    registeredAddress!: string;

    @ApiProperty({
        example: 'abc@gmail.com',
    })
    @IsNotEmpty({
        message: 'Email không được để trống',
    })
    @IsEmail({}, {
        message: 'Email không hợp lệ',
    })
    email!: string;

    @ApiPropertyOptional({
        example: '02812345678',
    })
    @IsOptional()
    @Matches(/^[0-9]{8,15}$/, {
        message: 'Số điện thoại cơ quan không hợp lệ',
    })
    officePhone?: string;

    @ApiPropertyOptional({
        example: 'TP. Hồ Chí Minh',
    })
    @IsOptional()
    @IsString()
    operatingProvince?: string;

    @ApiPropertyOptional({
        example: 'Phường Linh Đông',
    })
    @IsOptional()
    @IsString()
    operatingWard?: string;

    @ApiPropertyOptional({
        example: 'Khu công nghiệp ABC',
    })
    @IsOptional()
    @IsString()
    @MaxLength(500, {
        message: 'Địa điểm kinh doanh tối đa 500 ký tự',
    })
    businessLocation?: string;

    @ApiPropertyOptional({
        example: 'Nguyễn Văn A',
        description: 'Người đại diện pháp luật',
    })
    @IsOptional()
    @IsString()
    @MaxLength(255, {
        message: 'Tên người đại diện tối đa 255 ký tự',
    })
    legalRepresentative?: string;

    @ApiPropertyOptional({
        example: '0909123456',
    })
    @IsOptional()
    @Matches(/^[0-9]{10,11}$/, {
        message: 'Số điện thoại người đại diện không hợp lệ',
    })
    representativePhone?: string;
}

export class UpdateBusinessDto extends PartialType(CreateBusinessDto) {
    @IsOptional()
    taxCode?: never;
}