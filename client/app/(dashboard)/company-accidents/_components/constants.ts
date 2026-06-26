import type { LaborAccidentReport, LaborAccidentSupportReport } from "@/types/report";

export const CAUSES = [
    "Không có thiết bị an toàn hoặc thiết bị không đảm bảo an toàn",
    "Không có phương tiện bảo vệ cá nhân hoặc phương tiện bảo vệ cá nhân không tốt",
    "Tổ chức lao động không hợp lý",
    "Chưa huấn luyện hoặc huấn luyện an toàn vệ sinh lao động chưa đầy đủ",
    "Không có quy trình an toàn hoặc biện pháp làm việc an toàn",
    "Điều kiện làm việc không tốt",
    "Quy phạm nội quy, quy trình, quy chuẩn, biện pháp làm việc an toàn",
    "Không sử dụng phương tiện bảo vệ cá nhân",
    "Khách quan khó tránh/ Nguyên nhân chưa kể đến",
];

export const FACTORS = ["Thiết bị nâng", "Ngã từ trên cao", "Vật rơi trúng", "Điện giật", "Mắc kẹt vào máy móc", "Bỏng (nhiệt, hóa chất)", "Tai nạn giao thông lao động", "Sập giàn giáo, đất đá", "Khác"];

export const OCCUPATIONS = ["Nhà lãnh đạo cơ quan Đảng Cộng sản Việt Nam cấp Trung ương", "Kỹ sư cơ khí", "Công nhân xây dựng", "Nhân viên văn phòng", "Lao động vận hành máy móc", "Lao động thủ công đơn giản", "Khác"];

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
    accidentDetails: [],
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
    propertyDamage: 0,
});
