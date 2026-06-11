import { ApiProperty } from '@nestjs/swagger';
import { BusinessStatus } from '../entities/typeOfBusiness.entity';

export class TypeOfBusinessResponseDto {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  code!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ enum: BusinessStatus })
  status!: BusinessStatus;
}
