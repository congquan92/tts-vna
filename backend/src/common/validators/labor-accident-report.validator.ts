import {
  LaborAccidentSummaryData,
  validateLaborAccidentSummaryFields,
} from './labor-accident-summary.validator';
import {
  ReportValidationError,
  throwIfValidationErrors,
} from './report-validation.exception';

/** Các trường số: tổng các chi tiết phải BẰNG báo cáo cha */
export const LABOR_ACCIDENT_DETAIL_EQUAL_FIELDS = [
  'totalAccidentCases',
  'totalCasesWithDeath',
  'totalCasesWithTwoOrMoreVictims',
  'totalVictims',
  'totalFemaleVictims',
  'totalDeaths',
  'totalSeriouslyInjured',
  'unmanagedVictims',
  'unmanagedFemaleVictims',
  'unmanagedDeaths',
  'unmanagedSeriouslyInjured',
] as const satisfies readonly (keyof LaborAccidentSummaryData)[];

/** Các trường tiền: tổng các chi tiết không được VƯỢT QUÁ báo cáo cha */
export const LABOR_ACCIDENT_DETAIL_MAX_FIELDS = [
  'medicalCost',
  'salaryDuringTreatment',
  'compensationCost',
  'totalCost',
  'propertyDamage',
] as const satisfies readonly (keyof LaborAccidentSummaryData)[];

export interface LaborAccidentDetailInput extends LaborAccidentSummaryData {
  accidentCause?: string;
  injuryFactor?: string;
  occupationCategory?: string;
}

export interface LaborAccidentReportInput extends LaborAccidentSummaryData {
  accidentDetails?: LaborAccidentDetailInput[];
}

const FIELD_LABELS: Record<string, string> = {
  totalAccidentCases: 'Tổng số vụ',
  totalCasesWithDeath: 'Tổng số vụ có người chết',
  totalCasesWithTwoOrMoreVictims: 'Tổng số vụ có 2 người bị nạn trở lên',
  totalVictims: 'Tổng số người bị nạn',
  totalFemaleVictims: 'Tổng số lao động nữ bị nạn',
  totalDeaths: 'Tổng số người chết',
  totalSeriouslyInjured: 'Tổng số người bị thương nặng',
  unmanagedVictims: 'Số người bị nạn không quản lý',
  unmanagedFemaleVictims: 'Lao động nữ bị nạn không quản lý',
  unmanagedDeaths: 'Số người chết không quản lý',
  unmanagedSeriouslyInjured: 'Số người bị thương nặng không quản lý',
  medicalCost: 'Chi phí y tế',
  salaryDuringTreatment: 'Chi trả lương trong thời gian điều trị',
  compensationCost: 'Chi phí bồi thường trợ cấp',
  totalCost: 'Tổng tiền chi phí',
  propertyDamage: 'Thiệt hại tài sản',
};

function sumDetailField(
  details: LaborAccidentDetailInput[],
  field: keyof LaborAccidentSummaryData,
): number {
  return details.reduce((sum, detail) => sum + Number(detail[field] ?? 0), 0);
}

export function validateLaborAccidentReport(report: LaborAccidentReportInput) {
  const errors: ReportValidationError[] = [
    ...validateLaborAccidentSummaryFields(report, 'laborAccidentReport'),
  ];

  const details = report.accidentDetails ?? [];

  details.forEach((detail, index) => {
    errors.push(
      ...validateLaborAccidentSummaryFields(
        detail,
        `laborAccidentReport.accidentDetails[${index}]`,
      ),
    );
  });

  if (details.length === 0) {
    throwIfValidationErrors(errors);
    return;
  }

  for (const field of LABOR_ACCIDENT_DETAIL_EQUAL_FIELDS) {
    const parentValue = report[field];

    if (parentValue == null) {
      continue;
    }

    const childrenSum = sumDetailField(details, field);

    if (childrenSum !== Number(parentValue)) {
      errors.push({
        field: `laborAccidentReport.${field}`,
        code: 'DETAIL_SUM_MISMATCH',
        message: `${FIELD_LABELS[field]}: Tổng các chi tiết phải bằng báo cáo tổng`,
        expected: Number(parentValue),
        actual: childrenSum,
      });
    }
  }

  for (const field of LABOR_ACCIDENT_DETAIL_MAX_FIELDS) {
    const parentValue = report[field];

    if (parentValue == null) {
      continue;
    }

    const childrenSum = sumDetailField(details, field);

    if (childrenSum > Number(parentValue) + 0.01) {
      errors.push({
        field: `laborAccidentReport.${field}`,
        code: 'DETAIL_COST_EXCEEDS_PARENT',
        message: `${FIELD_LABELS[field]}: Tổng các chi tiết không được vượt quá báo cáo tổng`,
        expected: `<= ${parentValue}`,
        actual: childrenSum,
      });
    }
  }

  throwIfValidationErrors(errors);
}
