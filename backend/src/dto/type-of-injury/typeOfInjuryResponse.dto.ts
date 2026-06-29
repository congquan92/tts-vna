import { TypeOfInjuryStatus } from '../../entities/type-of-injury.entity';

export class TypeOfInjuryResponseDto {
  id!: number;
  code!: string;
  name!: string;
  parentId?: number;
  level!: number;
  status!: TypeOfInjuryStatus;
  description?: string;
}
