import type { LaborAccidentReport, LaborAccidentSupportReport } from "@/types/report";

export const CAUSES = [
    "Không có thiết bị an toàn hoặc thiết bị không đảm bảo an toàn",
    "Thiếu thiết bị che chắn an toàn",
    "Thiếu thiết bị bảo hộ cá nhân",
    "Quy trình làm việc không an toàn",
    "Vi phạm kỷ luật lao động",
    "Thiết bị, máy móc bị lỗi",
    "Điều kiện ánh sáng, thông gió kém",
    "Khác"
];

export const FACTORS = [
    "Thiết bị nâng",
    "Ngã từ trên cao",
    "Vật rơi trúng",
    "Điện giật",
    "Mắc kẹt vào máy móc",
    "Bỏng (nhiệt, hóa chất)",
    "Tai nạn giao thông lao động",
    "Sập giàn giáo, đất đá",
    "Khác"
];

export const OCCUPATIONS = [
    "Nhà lãnh đạo cơ quan Đảng Cộng sản Việt Nam cấp Trung ương",
    "Kỹ sư cơ khí",
    "Công nhân xây dựng",
    "Nhân viên văn phòng",
    "Lao động vận hành máy móc",
    "Lao động thủ công đơn giản",
    "Khác"
];

export const initialLaborReport = (): LaborAccidentReport => ({
    totalAccidentCases: 0,
    totalCasesWithDeath: 0,
    totalCasesWithTwoOrMoreVictims: 0,
    totalVictims: 0,
    totalFemaleVictims: 0,
    totalDeaths: 0,
    totalSeriouslyInjured: 0,
    unmanagedVictims: 0,
    unmanagedFemaleVictims: 0,
    unmanagedDeaths: 0,
    unmanagedSeriouslyInjured: 0,
    medicalCost: 0,
    salaryDuringTreatment: 0,
    compensationCost: 0,
    totalCost: 0,
    totalSickDays: 0,
    propertyDamage: 0,
    accidentDetails: []
});

export const initialSupportReport = (): LaborAccidentSupportReport => ({
    totalAccidentCases: 0,
    totalCasesWithDeath: 0,
    totalCasesWithTwoOrMoreVictims: 0,
    totalVictims: 0,
    totalFemaleVictims: 0,
    totalDeaths: 0,
    totalSeriouslyInjured: 0,
    unmanagedVictims: 0,
    unmanagedFemaleVictims: 0,
    unmanagedDeaths: 0,
    unmanagedSeriouslyInjured: 0,
    medicalCost: 0,
    salaryDuringTreatment: 0,
    compensationCost: 0,
    totalCost: 0,
    totalSickDays: 0,
    propertyDamage: 0
});
