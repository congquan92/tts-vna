import {
  LaborAccidentSummaryData,
  validateLaborAccidentSummaryFields,
} from './labor-accident-summary.validator';
import {
  ReportValidationError,
  throwIfValidationErrors,
} from './report-validation.exception';

/** Tổng các chi tiết phải BẰNG báo cáo cha */
export const LABOR_ACCIDENT_DETAIL_SUM_FIELDS = [
  'totalVictims',
  'totalFemaleVictims',
  'totalDeaths',
  'totalSeriouslyInjured',
  'unmanagedVictims',
  'unmanagedFemaleVictims',
  'unmanagedDeaths',
  'unmanagedSeriouslyInjured',
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
  totalAccidentCases: 'Tổng số vụ (số lượng chi tiết)',
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
  salaryDuringTreatment: 'Chi phí trả lương trong thời gian điều trị',
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

  // totalAccidentCases = số lượng bản ghi AccidentDetail
  if (
    report.totalAccidentCases != null &&
    report.totalAccidentCases !== details.length
  ) {
    errors.push({
      field: 'laborAccidentReport.totalAccidentCases',
      code: 'DETAIL_COUNT_MISMATCH',
      message:
        'Tổng số vụ phải bằng số lượng chi tiết tai nạn (accidentDetails)',
      expected: details.length,
      actual: report.totalAccidentCases,
    });
  }

  for (const field of LABOR_ACCIDENT_DETAIL_SUM_FIELDS) {
    const parentValue = report[field];

    if (parentValue == null) {
      continue;
    }

    const childrenSum = sumDetailField(details, field);
    const isMoneyField = [
      'medicalCost',
      'salaryDuringTreatment',
      'compensationCost',
      'totalCost',
      'propertyDamage',
    ].includes(field);

    const isMismatch = isMoneyField
      ? Math.abs(childrenSum - Number(parentValue)) > 0.01
      : childrenSum !== Number(parentValue);

    if (isMismatch) {
      errors.push({
        field: `laborAccidentReport.${field}`,
        code: 'DETAIL_SUM_MISMATCH',
        message: `${FIELD_LABELS[field]}: Tổng các chi tiết phải bằng báo cáo tổng`,
        expected: Number(parentValue),
        actual: childrenSum,
      });
    }
  }

  throwIfValidationErrors(errors);
}
