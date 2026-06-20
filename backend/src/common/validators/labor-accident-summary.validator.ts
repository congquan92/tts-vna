import {
  ReportValidationError,
  throwIfValidationErrors,
} from './report-validation.exception';

export interface LaborAccidentSummaryData {
  totalAccidentCases?: number;
  totalCasesWithDeath?: number;
  totalCasesWithTwoOrMoreVictims?: number;
  totalVictims?: number;
  totalFemaleVictims?: number;
  totalDeaths?: number;
  totalSeriouslyInjured?: number;
  unmanagedVictims?: number;
  unmanagedFemaleVictims?: number;
  unmanagedDeaths?: number;
  unmanagedSeriouslyInjured?: number;
  medicalCost?: number;
  salaryDuringTreatment?: number;
  compensationCost?: number;
  totalCost?: number;
  totalSickDays?: number;
  propertyDamage?: number;
}

function fieldPath(prefix: string, field: string): string {
  return prefix ? `${prefix}.${field}` : field;
}

/**
 * Ràng buộc nội bộ trong cùng một báo cáo (LaborAccidentReport, SupportReport, AccidentDetail).
 */
export function validateLaborAccidentSummaryFields(
  data: LaborAccidentSummaryData,
  prefix = '',
): ReportValidationError[] {
  const errors: ReportValidationError[] = [];

  const totalCases = data.totalAccidentCases;
  const casesWithDeath = data.totalCasesWithDeath;
  const twoOrMoreVictims = data.totalCasesWithTwoOrMoreVictims;
  const totalVictims = data.totalVictims;
  const totalFemaleVictims = data.totalFemaleVictims;
  const totalDeaths = data.totalDeaths;
  const totalSeriouslyInjured = data.totalSeriouslyInjured;
  const unmanagedVictims = data.unmanagedVictims;
  const unmanagedFemaleVictims = data.unmanagedFemaleVictims;
  const unmanagedDeaths = data.unmanagedDeaths;
  const unmanagedSeriouslyInjured = data.unmanagedSeriouslyInjured;
  const medicalCost = data.medicalCost;
  const salaryDuringTreatment = data.salaryDuringTreatment;
  const compensationCost = data.compensationCost;
  const totalCost = data.totalCost;

  // 1. Tổng số vụ = vụ có người chết + vụ có 2 người bị nạn trở lên
  if (
    totalCases != null &&
    casesWithDeath != null &&
    twoOrMoreVictims != null &&
    totalCases !== casesWithDeath + twoOrMoreVictims
  ) {
    errors.push({
      field: fieldPath(prefix, 'totalAccidentCases'),
      code: 'TOTAL_CASES_SUM_MISMATCH',
      message:
        'Tổng số vụ phải bằng tổng số vụ có người chết + tổng số vụ có 2 người bị nạn trở lên',
      expected: casesWithDeath + twoOrMoreVictims,
      actual: totalCases,
    });
  }

  // 2. Tổng chi phí = chi phí y tế + lương điều trị + bồi thường
  if (
    totalCost != null &&
    (medicalCost != null ||
      salaryDuringTreatment != null ||
      compensationCost != null)
  ) {
    const expectedTotal =
      Number(medicalCost ?? 0) +
      Number(salaryDuringTreatment ?? 0) +
      Number(compensationCost ?? 0);

    if (Math.abs(Number(totalCost) - expectedTotal) > 0.01) {
      errors.push({
        field: fieldPath(prefix, 'totalCost'),
        code: 'TOTAL_COST_SUM_MISMATCH',
        message:
          'Tổng tiền chi phí phải bằng chi phí y tế + chi trả lương điều trị + chi phí bồi thường trợ cấp',
        expected: expectedTotal,
        actual: Number(totalCost),
      });
    }
  }

  // 3. Tổng số người bị nạn >= số người bị nạn không quản lý
  if (
    totalVictims != null &&
    unmanagedVictims != null &&
    totalVictims < unmanagedVictims
  ) {
    errors.push({
      field: fieldPath(prefix, 'totalVictims'),
      code: 'VICTIMS_LESS_THAN_UNMANAGED',
      message:
        'Tổng số người bị nạn phải lớn hơn hoặc bằng số người bị nạn không quản lý',
      expected: `>= ${unmanagedVictims}`,
      actual: totalVictims,
    });
  }

  // 4. Tổng số lao động nữ bị nạn >= lao động nữ bị nạn không quản lý
  if (
    totalFemaleVictims != null &&
    unmanagedFemaleVictims != null &&
    totalFemaleVictims < unmanagedFemaleVictims
  ) {
    errors.push({
      field: fieldPath(prefix, 'totalFemaleVictims'),
      code: 'FEMALE_VICTIMS_LESS_THAN_UNMANAGED',
      message:
        'Tổng số lao động nữ bị nạn phải lớn hơn hoặc bằng lao động nữ bị nạn không quản lý',
      expected: `>= ${unmanagedFemaleVictims}`,
      actual: totalFemaleVictims,
    });
  }

  // 5. Tổng số người chết >= số người chết không quản lý
  if (
    totalDeaths != null &&
    unmanagedDeaths != null &&
    totalDeaths < unmanagedDeaths
  ) {
    errors.push({
      field: fieldPath(prefix, 'totalDeaths'),
      code: 'DEATHS_LESS_THAN_UNMANAGED',
      message:
        'Tổng số người chết phải lớn hơn hoặc bằng số người chết không quản lý',
      expected: `>= ${unmanagedDeaths}`,
      actual: totalDeaths,
    });
  }

  // 6. Tổng số người bị thương nặng >= số người bị thương nặng không quản lý
  if (
    totalSeriouslyInjured != null &&
    unmanagedSeriouslyInjured != null &&
    totalSeriouslyInjured < unmanagedSeriouslyInjured
  ) {
    errors.push({
      field: fieldPath(prefix, 'totalSeriouslyInjured'),
      code: 'SERIOUSLY_INJURED_LESS_THAN_UNMANAGED',
      message:
        'Tổng số người bị thương nặng phải lớn hơn hoặc bằng số người bị thương nặng không quản lý',
      expected: `>= ${unmanagedSeriouslyInjured}`,
      actual: totalSeriouslyInjured,
    });
  }

  return errors;
}

export function assertLaborAccidentSummaryFields(
  data: LaborAccidentSummaryData,
  prefix = '',
) {
  throwIfValidationErrors(validateLaborAccidentSummaryFields(data, prefix));
}
