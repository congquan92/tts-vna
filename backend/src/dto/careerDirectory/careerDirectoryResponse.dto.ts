import { CareerStatus } from '../../entities/career-directory.entity';

export class CareerDirectoryResponseDto {
  id!: number;
  code!: string;
  name!: string;
  parentId?: number;
  status!: CareerStatus;
}