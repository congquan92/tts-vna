// dto/permission/search-permission.dto.ts

import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class SearchPermissionDto {
  @ApiPropertyOptional({
    example: 'USER_VIEW',
    description: 'Mã quyền',
  })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({
    example: 'Xem danh sách user',
    description: 'Tên quyền',
  })
  @IsOptional()
  @IsString()
  name?: string;
}