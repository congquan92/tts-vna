import type { ReportFile } from "./reportFile";

export interface CompanyInfo {
    businessId?: number;
    businessName?: string;
    totalNumberOfEmployees?: number;
    totalNumberOfFemaleEmployees?: number;
    totalSalary?: number;
    business?: {
        businessName?: string;
        taxCode?: string;
    };
}

export interface AccidentDetail {
    id?: number;
    accidentCause?: string;
    injuryFactor?: string;
    occupationCategory?: string;
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
    totalSickDays?: number;
    propertyDamage?: number;
    totalCost?: number;
}

export interface LaborAccidentReport {
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
    accidentDetails?: AccidentDetail[];
}

export interface LaborAccidentSupportReport {
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

export interface CreateReportPayload {
    year?: number;
    reportPeriod?: string;
    status?: string;
    companyInfo?: CompanyInfo;
    laborAccidentReport?: LaborAccidentReport;
    laborAccidentSupportReport?: LaborAccidentSupportReport;
}

export interface UpdateReportPayload extends Partial<CreateReportPayload> {}

export interface Report {
    id: number;
    status: string;
    rejectReason?: string;
    year?: number;
    reportPeriod?: string;
    companyInfo?: CompanyInfo;
    laborAccidentReport?: LaborAccidentReport;
    laborAccidentSupportReport?: LaborAccidentSupportReport;
    files?: ReportFile[];
    createdAt: string;
    updatedAt: string;
}

export interface ReportListResponse {
    data: Report[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
