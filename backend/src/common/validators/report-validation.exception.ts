import { BadRequestException } from '@nestjs/common';

export interface ReportValidationError {
  field: string;
  code: string;
  message: string;
  expected?: number | string;
  actual?: number | string;
}

export class ReportValidationException extends BadRequestException {
  constructor(errors: ReportValidationError[]) {
    super({
      statusCode: 400,
      message: 'Dữ liệu báo cáo không hợp lệ',
      errors,
    });
  }
}

export function throwIfValidationErrors(errors: ReportValidationError[]) {
  if (errors.length > 0) {
    throw new ReportValidationException(errors);
  }
}
