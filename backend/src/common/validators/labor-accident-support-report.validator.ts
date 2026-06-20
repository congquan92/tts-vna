import { LaborAccidentSummaryData } from './labor-accident-summary.validator';
import { assertLaborAccidentSummaryFields } from './labor-accident-summary.validator';

export function validateLaborAccidentSupportReport(
  report: LaborAccidentSummaryData,
) {
  assertLaborAccidentSummaryFields(report, 'laborAccidentSupportReport');
}
