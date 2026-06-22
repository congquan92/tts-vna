import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
  IsEnum,
} from 'class-validator';
import { ReportStatus } from '../../common/enums/report-status.enum';

export class CompanyInfoDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  businessId?: number;

  @ApiPropertyOptional({ example: 'Công ty TNHH ABC' })
  @IsOptional()
  @IsString()
  businessName?: string;

  @ApiPropertyOptional({ example: 100 })
  @IsOptional()
  @IsInt()
  totalNumberOfEmployees?: number;

  @ApiPropertyOptional({ example: 40 })
  @IsOptional()
  @IsInt()
  totalNumberOfFemaleEmployees?: number;

  @ApiPropertyOptional({ example: 500000000 })
  @IsOptional()
  @IsNumber()
  totalSalary?: number;
}

export class AccidentDetailDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  id?: number;

  @ApiPropertyOptional({ example: 'Thiếu an toàn lao động' })
  @IsOptional()
  @IsString()
  accidentCause?: string;

  @ApiPropertyOptional({ example: 'Máy móc, thiết bị' })
  @IsOptional()
  @IsString()
  injuryFactor?: string;

  @ApiPropertyOptional({ example: 'Công nhân sản xuất' })
  @IsOptional()
  @IsString()
  occupationCategory?: string;

  @ApiPropertyOptional({ example: 5 })
  @IsOptional()
  @IsInt()
  totalAccidentCases?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  totalCasesWithDeath?: number;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsInt()
  totalCasesWithTwoOrMoreVictims?: number;

  @ApiPropertyOptional({ example: 6 })
  @IsOptional()
  @IsInt()
  totalVictims?: number;

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @IsInt()
  totalFemaleVictims?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  totalDeaths?: number;

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @IsInt()
  totalSeriouslyInjured?: number;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsInt()
  unmanagedVictims?: number;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsInt()
  unmanagedFemaleVictims?: number;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsInt()
  unmanagedDeaths?: number;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsInt()
  unmanagedSeriouslyInjured?: number;

  @ApiPropertyOptional({ example: 10000000 })
  @IsOptional()
  @IsNumber()
  medicalCost?: number;

  @ApiPropertyOptional({ example: 5000000 })
  @IsOptional()
  @IsNumber()
  salaryDuringTreatment?: number;

  @ApiPropertyOptional({ example: 3000000 })
  @IsOptional()
  @IsNumber()
  compensationCost?: number;

  @ApiPropertyOptional({ example: 30 })
  @IsOptional()
  @IsInt()
  totalSickDays?: number;

  @ApiPropertyOptional({ example: 2000000 })
  @IsOptional()
  @IsNumber()
  propertyDamage?: number;

  @ApiPropertyOptional({ example: 18000000 })
  @IsOptional()
  @IsNumber()
  totalCost?: number;
}

export class LaborAccidentReportDto {
  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @IsInt()
  totalAccidentCases?: number;

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @IsInt()
  totalCasesWithDeath?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  totalCasesWithTwoOrMoreVictims?: number;

  @ApiPropertyOptional({ example: 12 })
  @IsOptional()
  @IsInt()
  totalVictims?: number;

  @ApiPropertyOptional({ example: 4 })
  @IsOptional()
  @IsInt()
  totalFemaleVictims?: number;

  @ApiPropertyOptional({ example: 3 })
  @IsOptional()
  @IsInt()
  totalDeaths?: number;

  @ApiPropertyOptional({ example: 5 })
  @IsOptional()
  @IsInt()
  totalSeriouslyInjured?: number;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsInt()
  unmanagedVictims?: number;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsInt()
  unmanagedFemaleVictims?: number;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsInt()
  unmanagedDeaths?: number;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsInt()
  unmanagedSeriouslyInjured?: number;

  @ApiPropertyOptional({ example: 50000000 })
  @IsOptional()
  @IsNumber()
  medicalCost?: number;

  @ApiPropertyOptional({ example: 20000000 })
  @IsOptional()
  @IsNumber()
  salaryDuringTreatment?: number;

  @ApiPropertyOptional({ example: 10000000 })
  @IsOptional()
  @IsNumber()
  compensationCost?: number;

  @ApiPropertyOptional({ example: 80000000 })
  @IsOptional()
  @IsNumber()
  totalCost?: number;

  @ApiPropertyOptional({ example: 120 })
  @IsOptional()
  @IsInt()
  totalSickDays?: number;

  @ApiPropertyOptional({ example: 5000000 })
  @IsOptional()
  @IsNumber()
  propertyDamage?: number;

  @ApiPropertyOptional({ type: [AccidentDetailDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AccidentDetailDto)
  accidentDetails?: AccidentDetailDto[];
}

export class LaborAccidentSupportReportDto {
  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @IsInt()
  totalAccidentCases?: number;

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @IsInt()
  totalCasesWithDeath?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  totalCasesWithTwoOrMoreVictims?: number;

  @ApiPropertyOptional({ example: 12 })
  @IsOptional()
  @IsInt()
  totalVictims?: number;

  @ApiPropertyOptional({ example: 4 })
  @IsOptional()
  @IsInt()
  totalFemaleVictims?: number;

  @ApiPropertyOptional({ example: 3 })
  @IsOptional()
  @IsInt()
  totalDeaths?: number;

  @ApiPropertyOptional({ example: 5 })
  @IsOptional()
  @IsInt()
  totalSeriouslyInjured?: number;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsInt()
  unmanagedVictims?: number;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsInt()
  unmanagedFemaleVictims?: number;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsInt()
  unmanagedDeaths?: number;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsInt()
  unmanagedSeriouslyInjured?: number;

  @ApiPropertyOptional({ example: 50000000 })
  @IsOptional()
  @IsNumber()
  medicalCost?: number;

  @ApiPropertyOptional({ example: 20000000 })
  @IsOptional()
  @IsNumber()
  salaryDuringTreatment?: number;

  @ApiPropertyOptional({ example: 10000000 })
  @IsOptional()
  @IsNumber()
  compensationCost?: number;

  @ApiPropertyOptional({ example: 80000000 })
  @IsOptional()
  @IsNumber()
  totalCost?: number;

  @ApiPropertyOptional({ example: 120 })
  @IsOptional()
  @IsInt()
  totalSickDays?: number;

  @ApiPropertyOptional({ example: 5000000 })
  @IsOptional()
  @IsNumber()
  propertyDamage?: number;
}

export class CreateReportDto {
  @ApiPropertyOptional({ example: 2022 })
  @IsOptional()
  @IsInt()
  year?: number;

  @ApiPropertyOptional({ example: '6 tháng' })
  @IsOptional()
  @IsString()
  reportPeriod?: string;

  @ApiPropertyOptional({ enum: ReportStatus, example: ReportStatus.REPORTING })
  @IsOptional()
  @IsEnum(ReportStatus)
  status?: ReportStatus;

  @ApiPropertyOptional({ type: CompanyInfoDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => CompanyInfoDto)
  companyInfo?: CompanyInfoDto;

  @ApiPropertyOptional({ type: LaborAccidentReportDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => LaborAccidentReportDto)
  laborAccidentReport?: LaborAccidentReportDto;

  @ApiPropertyOptional({ type: LaborAccidentSupportReportDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => LaborAccidentSupportReportDto)
  laborAccidentSupportReport?: LaborAccidentSupportReportDto;
}
