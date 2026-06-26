"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Printer, ArrowLeft } from "lucide-react";
import { ReportApi } from "@/api/report";
import { BusinessApi } from "@/api/business";

import { toast } from "sonner";
import TopHero from "@/components/TopHero";
import Button from "@/components/ui/Button";

// Static definitions for classifications matching company-accidents
const CAUSES = [
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

const FACTORS = ["Thiết bị nâng", "Ngã từ trên cao", "Vật rơi trúng", "Điện giật", "Mắc kẹt vào máy móc", "Bỏng (nhiệt, hóa chất)", "Tai nạn giao thông lao động", "Sập giàn giáo, đất đá", "Khác"];

const OCCUPATIONS = ["Nhà lãnh đạo cơ quan Đảng Cộng sản Việt Nam cấp Trung ương", "Kỹ sư cơ khí", "Công nhân xây dựng", "Nhân viên văn phòng", "Lao động vận hành máy móc", "Lao động thủ công đơn giản", "Khác"];

const ESTABLISHMENT_TYPES = [
    { code: "1", name: "Doanh nghiệp nhà nước", keywords: ["nhà nước", "nha nuoc"] },
    { code: "2", name: "Công ty trách nhiệm hữu hạn", keywords: ["trách nhiệm hữu hạn", "tnhh", "trach nhiem huu han"] },
    { code: "3", name: "Công ty cổ phần", keywords: ["cổ phần", "co phan", "cp"] },
    { code: "4", name: "Công ty hợp danh", keywords: ["hợp danh", "hop danh"] },
    { code: "5", name: "Doanh nghiệp tư nhân", keywords: ["tư nhân", "tu nhan", "dntn"] },
    { code: "6", name: "Doanh nghiệp có vốn đầu tư nước ngoài", keywords: ["nước ngoài", "nuoc ngoai", "fdi", "đầu tư nước ngoài"] },
    { code: "7", name: "Đơn vị kinh tế tập thể", keywords: ["tập thể", "tap the"] },
    { code: "8", name: "Đơn vị kinh tế cá thể", keywords: ["cá thể", "ca the", "hộ kinh doanh", "hkd", "cá nhân", "cá thể"] },
    { code: "9", name: "Đơn vị hành chính sự nghiệp, đảng, đoàn thể, hiệp hội", keywords: ["hành chính", "sự nghiệp", "đảng", "đoàn thể", "hiệp hội", "hanh chinh", "su nghiep", "sở", "ủy ban", "uy ban"] },
];

const getCategoryIndex = (typeName: string) => {
    if (!typeName) return 8; // Default to the last category
    const lower = typeName.toLowerCase();

    if (lower.includes("nhà nước") || lower.includes("nha nuoc")) return 0;
    if (lower.includes("nước ngoài") || lower.includes("nuoc ngoai") || lower.includes("fdi") || lower.includes("đầu tư nước ngoài") || lower.includes("von dau tu nuoc ngoai")) return 5;
    if (lower.includes("trách nhiệm hữu hạn") || lower.includes("tnhh") || lower.includes("trach nhiem huu han")) return 1;
    if (lower.includes("cổ phần") || lower.includes("co phan") || lower.includes("cp")) return 2;
    if (lower.includes("hợp danh") || lower.includes("hop danh")) return 3;
    if (lower.includes("tư nhân") || lower.includes("tu nhan") || lower.includes("dntn")) return 4;
    if (lower.includes("tập thể") || lower.includes("tap the")) return 6;
    if (lower.includes("cá thể") || lower.includes("ca the") || lower.includes("hộ kinh doanh") || lower.includes("hkd") || lower.includes("cá nhân")) return 7;

    return 8; // Default to administrative/public sector
};

// Formatter helpers
const formatNumber = (val: number | string | undefined | null): string => {
    if (val === undefined || val === null || val === "") return "0";
    const num = Number(val);
    if (isNaN(num)) return "0";
    return num.toLocaleString("vi-VN");
};

const formatDecimal = (val: number | string | undefined | null): string => {
    if (val === undefined || val === null || val === "") return "0";
    const num = Number(val);
    if (isNaN(num)) return "0";
    return num.toLocaleString("vi-VN", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
};

interface Table2Row {
    name: string;
    code: string;
    cases: number;
    deathCases: number;
    twoVictimsCases: number;
    victims: number;
    femaleVictims: number;
    deaths: number;
    serious: number;
    sickDays: number;
    totalCost: number;
    medicalCost: number;
    salaryCost: number;
    compensationCost: number;
    propertyDamage: number;
    unmanagedVictims: number;
    unmanagedFemaleVictims: number;
    unmanagedDeaths: number;
    unmanagedSeriouslyInjured: number;
    isHeader?: boolean;
}

export default function AccidentSummaryPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [loading, setLoading] = useState(true);

    // Aggregated tables data state
    const [table1Rows, setTable1Rows] = useState<any[]>([]);
    const [table1GrandTotal, setTable1GrandTotal] = useState<any | null>(null);
    const [table2Rows, setTable2Rows] = useState<Table2Row[]>([]);
    const [laborGrandTotal, setLaborGrandTotal] = useState<Table2Row | null>(null);
    const [supportGrandTotal, setSupportGrandTotal] = useState<Table2Row | null>(null);

    // Get search filters from URL parameters
    const yearStr = searchParams?.get("year");
    const province = searchParams?.get("province") || "";
    const ward = searchParams?.get("ward") || "";
    const period = searchParams?.get("period") || "";

    const selectedYear = yearStr ? Number(yearStr) : undefined;

    useEffect(() => {
        const fetchAndAggregate = async () => {
            setLoading(true);
            try {
                const provParam = province && province !== "Tất cả" ? province : undefined;
                const wardParam = ward && ward !== "Tất cả" ? ward : undefined;

                // Load all reports matching geographical and status filters
                const [reportsRes, businessesRes] = await Promise.all([ReportApi.getAll(1, 99999, selectedYear, "đã tiếp nhận", undefined, undefined, provParam, wardParam), BusinessApi.search({ limit: 99999 })]);

                // Filter businesses locally by location to get exact total count matching URL filters
                let filteredBusinesses = businessesRes.data || [];
                if (provParam) {
                    filteredBusinesses = filteredBusinesses.filter((b: any) => b.registeredProvince && b.registeredProvince.toLowerCase().includes(provParam.toLowerCase()));
                }
                if (wardParam) {
                    filteredBusinesses = filteredBusinesses.filter((b: any) => b.registeredWard && b.registeredWard.toLowerCase() === wardParam.toLowerCase());
                }

                // Filter reports locally by period if set
                let filteredReports = reportsRes.data || [];
                if (period) {
                    filteredReports = filteredReports.filter((r) => r.reportPeriod === period);
                }

                // --- 1. AGGREGATE TABLE I: OVERVIEW INFO ---
                const t1Data = ESTABLISHMENT_TYPES.map((type) => ({
                    name: type.name,
                    code: type.code,
                    totalEstablishments: 0,
                    participatingEstablishments: 0,
                    totalWorkforce: 0,
                    reportingWorkforce: 0,
                    femaleWorkforce: 0,
                    totalVictims: 0,
                    totalDeaths: 0,
                    totalSeriouslyInjured: 0,
                    accidentFrequency: 0,
                    deathFrequency: 0,
                }));

                // Count total establishments by type
                filteredBusinesses.forEach((b: any) => {
                    const idx = getCategoryIndex(b.typeOfBusiness);
                    t1Data[idx].totalEstablishments++;
                });

                // Set of unique business IDs that reported
                const reportedBusinessIds = new Set<number>();

                // Aggregate stats from reports
                filteredReports.forEach((r: any) => {
                    let businessTypeName = "";
                    if (r.companyInfo?.business) {
                        businessTypeName = (r.companyInfo.business as any).typeOfBusiness?.name || (r.companyInfo.business as any).businessType || "";
                    }
                    if (!businessTypeName && r.companyInfo?.businessId) {
                        const found = filteredBusinesses.find((b: any) => b.id === r.companyInfo.businessId);
                        if (found) {
                            businessTypeName = (found as any).typeOfBusiness || (found as any).businessType || "";
                        }
                    }

                    const idx = getCategoryIndex(businessTypeName);

                    if (r.companyInfo?.businessId) {
                        reportedBusinessIds.add(r.companyInfo.businessId);
                    }
                    t1Data[idx].participatingEstablishments++;

                    // Workforce stats
                    const emp = Number(r.companyInfo?.totalNumberOfEmployees || 0);
                    const fem = Number(r.companyInfo?.totalNumberOfFemaleEmployees || 0);
                    t1Data[idx].reportingWorkforce += emp;
                    t1Data[idx].totalWorkforce += emp; // fallback to reporting workforce
                    t1Data[idx].femaleWorkforce += fem;

                    // Labor report stats
                    const labor = r.laborAccidentReport || {};
                    const lVictims = Number(labor.totalVictims || 0);
                    const lDeaths = Number(labor.totalDeaths || 0);
                    const lSerious = Number(labor.totalSeriouslyInjured || 0);

                    // Support report stats
                    const support = r.laborAccidentSupportReport || {};
                    const sVictims = Number(support.totalVictims || 0);
                    const sDeaths = Number(support.totalDeaths || 0);
                    const sSerious = Number(support.totalSeriouslyInjured || 0);

                    t1Data[idx].totalVictims += lVictims + sVictims;
                    t1Data[idx].totalDeaths += lDeaths + sDeaths;
                    t1Data[idx].totalSeriouslyInjured += lSerious + sSerious;
                });

                // Compute rates for each row
                t1Data.forEach((row) => {
                    if (row.reportingWorkforce > 0) {
                        row.accidentFrequency = (row.totalVictims / row.reportingWorkforce) * 1000;
                        row.deathFrequency = (row.totalDeaths / row.reportingWorkforce) * 1000;
                    }
                });

                // Compute grand totals for Table I
                const t1GrandTotal = {
                    name: "Tổng số",
                    code: "",
                    totalEstablishments: 0,
                    participatingEstablishments: 0,
                    totalWorkforce: 0,
                    reportingWorkforce: 0,
                    femaleWorkforce: 0,
                    totalVictims: 0,
                    totalDeaths: 0,
                    totalSeriouslyInjured: 0,
                    accidentFrequency: 0,
                    deathFrequency: 0,
                };

                t1Data.forEach((row) => {
                    t1GrandTotal.totalEstablishments += row.totalEstablishments;
                    t1GrandTotal.participatingEstablishments += row.participatingEstablishments;
                    t1GrandTotal.totalWorkforce += row.totalWorkforce;
                    t1GrandTotal.reportingWorkforce += row.reportingWorkforce;
                    t1GrandTotal.femaleWorkforce += row.femaleWorkforce;
                    t1GrandTotal.totalVictims += row.totalVictims;
                    t1GrandTotal.totalDeaths += row.totalDeaths;
                    t1GrandTotal.totalSeriouslyInjured += row.totalSeriouslyInjured;
                });

                if (t1GrandTotal.reportingWorkforce > 0) {
                    t1GrandTotal.accidentFrequency = (t1GrandTotal.totalVictims / t1GrandTotal.reportingWorkforce) * 1000;
                    t1GrandTotal.deathFrequency = (t1GrandTotal.totalDeaths / t1GrandTotal.reportingWorkforce) * 1000;
                }

                setTable1Rows(t1Data);
                setTable1GrandTotal(t1GrandTotal);

                // --- 2. AGGREGATE TABLE II: CLASSIFICATION OF ACCIDENTS ---
                // --- 2. AGGREGATE TABLE II: CLASSIFICATION OF ACCIDENTS ---
                // Grand total row for table II
                const t2GrandTotal: Table2Row = {
                    name: "Tổng số",
                    code: "",
                    cases: 0,
                    deathCases: 0,
                    twoVictimsCases: 0,
                    victims: 0,
                    femaleVictims: 0,
                    deaths: 0,
                    serious: 0,
                    sickDays: 0,
                    totalCost: 0,
                    medicalCost: 0,
                    salaryCost: 0,
                    compensationCost: 0,
                    propertyDamage: 0,
                    unmanagedVictims: 0,
                    unmanagedFemaleVictims: 0,
                    unmanagedDeaths: 0,
                    unmanagedSeriouslyInjured: 0,
                };

                const lGrandTotal: Table2Row = {
                    name: "1. Tai nạn lao động",
                    code: "",
                    cases: 0,
                    deathCases: 0,
                    twoVictimsCases: 0,
                    victims: 0,
                    femaleVictims: 0,
                    deaths: 0,
                    serious: 0,
                    sickDays: 0,
                    totalCost: 0,
                    medicalCost: 0,
                    salaryCost: 0,
                    compensationCost: 0,
                    propertyDamage: 0,
                    unmanagedVictims: 0,
                    unmanagedFemaleVictims: 0,
                    unmanagedDeaths: 0,
                    unmanagedSeriouslyInjured: 0,
                };

                const sGrandTotal: Table2Row = {
                    name: "2. Tai nạn được hưởng trợ cấp theo quy định tại Khoản 2 Điều 39 Luật ATVSLĐ",
                    code: "",
                    cases: 0,
                    deathCases: 0,
                    twoVictimsCases: 0,
                    victims: 0,
                    femaleVictims: 0,
                    deaths: 0,
                    serious: 0,
                    sickDays: 0,
                    totalCost: 0,
                    medicalCost: 0,
                    salaryCost: 0,
                    compensationCost: 0,
                    propertyDamage: 0,
                    unmanagedVictims: 0,
                    unmanagedFemaleVictims: 0,
                    unmanagedDeaths: 0,
                    unmanagedSeriouslyInjured: 0,
                };

                filteredReports.forEach((r: any) => {
                    const labor = r.laborAccidentReport || {};
                    const support = r.laborAccidentSupportReport || {};

                    // Sum labor reports
                    lGrandTotal.cases += Number(labor.totalAccidentCases || 0);
                    lGrandTotal.deathCases += Number(labor.totalCasesWithDeath || 0);
                    lGrandTotal.twoVictimsCases += Number(labor.totalCasesWithTwoOrMoreVictims || 0);
                    lGrandTotal.victims += Number(labor.totalVictims || 0);
                    lGrandTotal.femaleVictims += Number(labor.totalFemaleVictims || 0);
                    lGrandTotal.deaths += Number(labor.totalDeaths || 0);
                    lGrandTotal.serious += Number(labor.totalSeriouslyInjured || 0);
                    lGrandTotal.sickDays += Number(labor.totalSickDays || 0);
                    lGrandTotal.totalCost += Number(labor.totalCost || 0);
                    lGrandTotal.medicalCost += Number(labor.medicalCost || 0);
                    lGrandTotal.salaryCost += Number(labor.salaryDuringTreatment || 0);
                    lGrandTotal.compensationCost += Number(labor.compensationCost || 0);
                    lGrandTotal.propertyDamage += Number(labor.propertyDamage || 0);
                    lGrandTotal.unmanagedVictims += Number(labor.unmanagedVictims || 0);
                    lGrandTotal.unmanagedFemaleVictims += Number(labor.unmanagedFemaleVictims || 0);
                    lGrandTotal.unmanagedDeaths += Number(labor.unmanagedDeaths || 0);
                    lGrandTotal.unmanagedSeriouslyInjured += Number(labor.unmanagedSeriouslyInjured || 0);

                    // Sum support reports
                    sGrandTotal.cases += Number(support.totalAccidentCases || 0);
                    sGrandTotal.deathCases += Number(support.totalCasesWithDeath || 0);
                    sGrandTotal.twoVictimsCases += Number(support.totalCasesWithTwoOrMoreVictims || 0);
                    sGrandTotal.victims += Number(support.totalVictims || 0);
                    sGrandTotal.femaleVictims += Number(support.totalFemaleVictims || 0);
                    sGrandTotal.deaths += Number(support.totalDeaths || 0);
                    sGrandTotal.serious += Number(support.totalSeriouslyInjured || 0);
                    sGrandTotal.sickDays += Number(support.totalSickDays || 0);
                    sGrandTotal.totalCost += Number(support.totalCost || 0);
                    sGrandTotal.medicalCost += Number(support.medicalCost || 0);
                    sGrandTotal.salaryCost += Number(support.salaryDuringTreatment || 0);
                    sGrandTotal.compensationCost += Number(support.compensationCost || 0);
                    sGrandTotal.propertyDamage += Number(support.propertyDamage || 0);
                    sGrandTotal.unmanagedVictims += Number(support.unmanagedVictims || 0);
                    sGrandTotal.unmanagedFemaleVictims += Number(support.unmanagedFemaleVictims || 0);
                    sGrandTotal.unmanagedDeaths += Number(support.unmanagedDeaths || 0);
                    sGrandTotal.unmanagedSeriouslyInjured += Number(support.unmanagedSeriouslyInjured || 0);

                    // Table II Grand Total is the sum of both
                    t2GrandTotal.cases += Number(labor.totalAccidentCases || 0) + Number(support.totalAccidentCases || 0);
                    t2GrandTotal.deathCases += Number(labor.totalCasesWithDeath || 0) + Number(support.totalCasesWithDeath || 0);
                    t2GrandTotal.twoVictimsCases += Number(labor.totalCasesWithTwoOrMoreVictims || 0) + Number(support.totalCasesWithTwoOrMoreVictims || 0);
                    t2GrandTotal.victims += Number(labor.totalVictims || 0) + Number(support.totalVictims || 0);
                    t2GrandTotal.femaleVictims += Number(labor.totalFemaleVictims || 0) + Number(support.totalFemaleVictims || 0);
                    t2GrandTotal.deaths += Number(labor.totalDeaths || 0) + Number(support.totalDeaths || 0);
                    t2GrandTotal.serious += Number(labor.totalSeriouslyInjured || 0) + Number(support.totalSeriouslyInjured || 0);
                    t2GrandTotal.sickDays += Number(labor.totalSickDays || 0) + Number(support.totalSickDays || 0);
                    t2GrandTotal.totalCost += Number(labor.totalCost || 0) + Number(support.totalCost || 0);
                    t2GrandTotal.medicalCost += Number(labor.medicalCost || 0) + Number(support.medicalCost || 0);
                    t2GrandTotal.salaryCost += Number(labor.salaryDuringTreatment || 0) + Number(support.salaryDuringTreatment || 0);
                    t2GrandTotal.compensationCost += Number(labor.compensationCost || 0) + Number(support.compensationCost || 0);
                    t2GrandTotal.propertyDamage += Number(labor.propertyDamage || 0) + Number(support.propertyDamage || 0);
                    t2GrandTotal.unmanagedVictims += Number(labor.unmanagedVictims || 0) + Number(support.unmanagedVictims || 0);
                    t2GrandTotal.unmanagedFemaleVictims += Number(labor.unmanagedFemaleVictims || 0) + Number(support.unmanagedFemaleVictims || 0);
                    t2GrandTotal.unmanagedDeaths += Number(labor.unmanagedDeaths || 0) + Number(support.unmanagedDeaths || 0);
                    t2GrandTotal.unmanagedSeriouslyInjured += Number(labor.unmanagedSeriouslyInjured || 0) + Number(support.unmanagedSeriouslyInjured || 0);
                });

                setLaborGrandTotal(lGrandTotal);
                setSupportGrandTotal(sGrandTotal);

                // Extract all details for grouping
                const allDetails: any[] = [];
                filteredReports.forEach((r: any) => {
                    if (r.laborAccidentReport?.accidentDetails) {
                        allDetails.push(...r.laborAccidentReport.accidentDetails);
                    }
                });

                // 2.1 Group by Occupation (Ngành nghề/Nghề nghiệp)
                const occRows: Table2Row[] = OCCUPATIONS.map((occ, idx) => {
                    const row: Table2Row = {
                        name: occ,
                        code: String(idx + 1),
                        cases: 0,
                        deathCases: 0,
                        twoVictimsCases: 0,
                        victims: 0,
                        femaleVictims: 0,
                        deaths: 0,
                        serious: 0,
                        sickDays: 0,
                        totalCost: 0,
                        medicalCost: 0,
                        salaryCost: 0,
                        compensationCost: 0,
                        propertyDamage: 0,
                        unmanagedVictims: 0,
                        unmanagedFemaleVictims: 0,
                        unmanagedDeaths: 0,
                        unmanagedSeriouslyInjured: 0,
                    };
                    allDetails.forEach((d: any) => {
                        if (d.occupationCategory === occ) {
                            row.cases += Number(d.totalAccidentCases || 0);
                            row.deathCases += Number(d.totalCasesWithDeath || 0);
                            row.twoVictimsCases += Number(d.totalCasesWithTwoOrMoreVictims || 0);
                            row.victims += Number(d.totalVictims || 0);
                            row.femaleVictims += Number(d.totalFemaleVictims || 0);
                            row.deaths += Number(d.totalDeaths || 0);
                            row.serious += Number(d.totalSeriouslyInjured || 0);
                            row.sickDays += Number(d.totalSickDays || 0);
                            row.totalCost += Number(d.totalCost || 0);
                            row.medicalCost += Number(d.medicalCost || 0);
                            row.salaryCost += Number(d.salaryDuringTreatment || 0);
                            row.compensationCost += Number(d.compensationCost || 0);
                            row.propertyDamage += Number(d.propertyDamage || 0);
                            row.unmanagedVictims += Number(d.unmanagedVictims || 0);
                            row.unmanagedFemaleVictims += Number(d.unmanagedFemaleVictims || 0);
                            row.unmanagedDeaths += Number(d.unmanagedDeaths || 0);
                            row.unmanagedSeriouslyInjured += Number(d.unmanagedSeriouslyInjured || 0);
                        }
                    });
                    return row;
                });

                // 2.2 Group by Cause (Nguyên nhân)
                const causeRows: Table2Row[] = CAUSES.map((cause, idx) => {
                    const row: Table2Row = {
                        name: cause,
                        code: String(idx + 1),
                        cases: 0,
                        deathCases: 0,
                        twoVictimsCases: 0,
                        victims: 0,
                        femaleVictims: 0,
                        deaths: 0,
                        serious: 0,
                        sickDays: 0,
                        totalCost: 0,
                        medicalCost: 0,
                        salaryCost: 0,
                        compensationCost: 0,
                        propertyDamage: 0,
                        unmanagedVictims: 0,
                        unmanagedFemaleVictims: 0,
                        unmanagedDeaths: 0,
                        unmanagedSeriouslyInjured: 0,
                    };
                    allDetails.forEach((d: any) => {
                        if (d.accidentCause === cause) {
                            row.cases += Number(d.totalAccidentCases || 0);
                            row.deathCases += Number(d.totalCasesWithDeath || 0);
                            row.twoVictimsCases += Number(d.totalCasesWithTwoOrMoreVictims || 0);
                            row.victims += Number(d.totalVictims || 0);
                            row.femaleVictims += Number(d.totalFemaleVictims || 0);
                            row.deaths += Number(d.totalDeaths || 0);
                            row.serious += Number(d.totalSeriouslyInjured || 0);
                            row.sickDays += Number(d.totalSickDays || 0);
                            row.totalCost += Number(d.totalCost || 0);
                            row.medicalCost += Number(d.medicalCost || 0);
                            row.salaryCost += Number(d.salaryDuringTreatment || 0);
                            row.compensationCost += Number(d.compensationCost || 0);
                            row.propertyDamage += Number(d.propertyDamage || 0);
                            row.unmanagedVictims += Number(d.unmanagedVictims || 0);
                            row.unmanagedFemaleVictims += Number(d.unmanagedFemaleVictims || 0);
                            row.unmanagedDeaths += Number(d.unmanagedDeaths || 0);
                            row.unmanagedSeriouslyInjured += Number(d.unmanagedSeriouslyInjured || 0);
                        }
                    });
                    return row;
                });

                // 2.3 Group by Factor (Yếu tố chấn thương)
                const factorRows: Table2Row[] = FACTORS.map((factor, idx) => {
                    const row: Table2Row = {
                        name: factor,
                        code: String(idx + 1),
                        cases: 0,
                        deathCases: 0,
                        twoVictimsCases: 0,
                        victims: 0,
                        femaleVictims: 0,
                        deaths: 0,
                        serious: 0,
                        sickDays: 0,
                        totalCost: 0,
                        medicalCost: 0,
                        salaryCost: 0,
                        compensationCost: 0,
                        propertyDamage: 0,
                        unmanagedVictims: 0,
                        unmanagedFemaleVictims: 0,
                        unmanagedDeaths: 0,
                        unmanagedSeriouslyInjured: 0,
                    };
                    allDetails.forEach((d: any) => {
                        if (d.injuryFactor === factor) {
                            row.cases += Number(d.totalAccidentCases || 0);
                            row.deathCases += Number(d.totalCasesWithDeath || 0);
                            row.twoVictimsCases += Number(d.totalCasesWithTwoOrMoreVictims || 0);
                            row.victims += Number(d.totalVictims || 0);
                            row.femaleVictims += Number(d.totalFemaleVictims || 0);
                            row.deaths += Number(d.totalDeaths || 0);
                            row.serious += Number(d.totalSeriouslyInjured || 0);
                            row.sickDays += Number(d.totalSickDays || 0);
                            row.totalCost += Number(d.totalCost || 0);
                            row.medicalCost += Number(d.medicalCost || 0);
                            row.salaryCost += Number(d.salaryDuringTreatment || 0);
                            row.compensationCost += Number(d.compensationCost || 0);
                            row.propertyDamage += Number(d.propertyDamage || 0);
                            row.unmanagedVictims += Number(d.unmanagedVictims || 0);
                            row.unmanagedFemaleVictims += Number(d.unmanagedFemaleVictims || 0);
                            row.unmanagedDeaths += Number(d.unmanagedDeaths || 0);
                            row.unmanagedSeriouslyInjured += Number(d.unmanagedSeriouslyInjured || 0);
                        }
                    });
                    return row;
                });

                // Combine everything for Table II representation
                const t2Combined: Table2Row[] = [
                    t2GrandTotal,
                    { name: "Phân theo ngành nghề", code: "", isHeader: true } as Table2Row,
                    ...occRows,
                    { name: "Phân theo nguyên nhân", code: "", isHeader: true } as Table2Row,
                    ...causeRows,
                    { name: "Phân theo yếu tố gây chấn thương", code: "", isHeader: true } as Table2Row,
                    ...factorRows,
                ];

                setTable2Rows(t2Combined);
            } catch (e) {
                console.error("Failed to compile summary report", e);
                toast.error("Không thể tải dữ liệu để tổng hợp báo cáo.");
            } finally {
                setLoading(false);
            }
        };

        fetchAndAggregate();
    }, [selectedYear, province, ward, period]);

    const handleBack = () => {
        router.push("/accident-types");
    };

    const handlePrint = () => {
        window.print();
    };

    const handleExportDocx = async () => {
        try {
            toast.loading("Đang tạo file Word...", { id: "export-docx" });

            const occHeaderIdx = table2Rows.findIndex((r) => r.isHeader && r.name.includes("ngành nghề"));
            const causeHeaderIdx = table2Rows.findIndex((r) => r.isHeader && r.name.includes("nguyên nhân"));
            const factorHeaderIdx = table2Rows.findIndex((r) => r.isHeader && r.name.includes("yếu tố"));

            const occupations = table2Rows.slice(occHeaderIdx + 1, causeHeaderIdx);
            const causes = table2Rows.slice(causeHeaderIdx + 1, factorHeaderIdx);
            const factors = table2Rows.slice(factorHeaderIdx + 1);

            const payload = {
                year: selectedYear,
                period: period || "Cả năm",
                province: province || "Tất cả",
                ward: ward || "Tất cả",
                totals: {
                    totalEmployees: table1GrandTotal?.reportingWorkforce || 0,
                    femaleEmployees: table1GrandTotal?.femaleWorkforce || 0,
                    totalSalary: 0,
                },
                table2GrandTotal: table2Rows[0] || {},
                laborGrandTotal: laborGrandTotal || {},
                supportGrandTotal: supportGrandTotal || {},
                causes,
                factors,
                occupations,
            };

            const blob = await ReportApi.exportDocx(payload);

            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `BC_tinh_hinh_TNLD_PHU_LUC_XII_${selectedYear || ""}.docx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            toast.success("Xuất file Word thành công!", { id: "export-docx" });
        } catch (e) {
            console.error("Export docx failed", e);
            toast.error("Không thể xuất file Word. Vui lòng thử lại sau.", { id: "export-docx" });
        }
    };

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center bg-[#F4F6F8]">
                <div className="text-center">
                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <span className="text-gray-500 text-sm">Đang tải và tổng hợp dữ liệu...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col flex-1 h-screen min-h-0 bg-[#F4F6F8] py-2">
            {/* Custom Print Media Styling */}
            <style jsx global>{`
                @media print {
                    body * {
                        visibility: hidden !important;
                    }
                    #print-section,
                    #print-section * {
                        visibility: visible !important;
                    }
                    #print-section {
                        position: absolute !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 100% !important;
                        padding: 0 !important;
                        margin: 0 !important;
                        background: white !important;
                        box-shadow: none !important;
                        border: none !important;
                    }
                    .no-print {
                        display: none !important;
                    }
                }
            `}</style>

            {/* Header bar */}
            <div className="shrink-0 print:hidden py-1">
                <TopHero
                    lable="Báo cáo tổng hợp"
                    component={
                        <div className="flex gap-2 items-center">
                            <Button variant="outline" size="sm" onClick={handleBack} className="border-none bg-transparent hover:bg-gray-100 text-gray-500 hover:text-gray-700 text-xs font-semibold px-4 py-1.5 flex items-center gap-1">
                                <ArrowLeft className="size-3.5" />
                                <span>Huỷ bỏ</span>
                            </Button>
                            {/* <Button variant="outline" size="sm" onClick={handlePrint} className="gap-1.5 border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-semibold px-4 py-1.5 flex items-center">
                                <Printer className="size-3.5" />
                                <span>In báo cáo</span>
                            </Button> */}
                            <Button variant="primary" size="sm" onClick={handleExportDocx} className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-1.5 flex items-center">
                                <Printer className="size-3.5" />
                                <span>Xuất dữ liệu</span>
                            </Button>
                        </div>
                    }
                />
            </div>

            {/* Content view container */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 min-h-0">
                <div id="print-section" className="bg-white p-6 border border-gray-200 max-w-[95%] mx-auto space-y-8 text-gray-900 rounded-md shadow-sm">
                    {/* Report Header Title */}
                    <div className="text-center space-y-1 pb-4 border-b border-gray-100">
                        <h2 className="text-sm font-bold text-gray-900 uppercase">Báo cáo tổng hợp tình hình tai nạn lao động</h2>
                        {selectedYear && (
                            <p className="text-xs font-semibold text-gray-500">
                                Năm {selectedYear} {period ? ` - Kỳ báo cáo: ${period}` : ""}
                            </p>
                        )}
                        {(province || ward) && (
                            <p className="text-xs font-semibold text-gray-600 no-print">
                                Khu vực: {ward ? `${ward}, ` : ""}
                                {province || "Toàn quốc"}
                            </p>
                        )}
                    </div>

                    {/* SECTION I */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">I. Thông tin tổng quan:</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse border border-gray-300 text-[10px]">
                                <thead>
                                    <tr className="bg-[#F4F6F8] font-bold text-gray-700">
                                        <th rowSpan={3} className="border border-gray-300 p-2 text-left align-middle w-[22%]">
                                            Loại hình cơ sở
                                        </th>
                                        <th rowSpan={3} className="border border-gray-300 p-2 text-center align-middle w-[6%]">
                                            Mã số
                                        </th>
                                        <th colSpan={2} className="border border-gray-300 p-2 text-center align-middle">
                                            Cơ sở
                                        </th>
                                        <th colSpan={3} className="border border-gray-300 p-2 text-center align-middle">
                                            Lực lượng lao động
                                        </th>
                                        <th colSpan={3} className="border border-gray-300 p-2 text-center align-middle">
                                            Tổng số tai nạn lao động
                                        </th>
                                        <th colSpan={2} className="border border-gray-300 p-2 text-center align-middle">
                                            Tần suất tai nạn lao động
                                        </th>
                                        <th rowSpan={3} className="border border-gray-300 p-2 text-center align-middle w-[14%]">
                                            Ghi chú
                                        </th>
                                    </tr>
                                    <tr className="bg-[#F4F6F8] font-bold text-gray-700">
                                        <th rowSpan={2} className="border border-gray-300 p-2 text-center align-middle">
                                            Tổng số
                                        </th>
                                        <th rowSpan={2} className="border border-gray-300 p-2 text-center align-middle">
                                            Số cơ sở tham gia
                                        </th>
                                        <th rowSpan={2} className="border border-gray-300 p-2 text-center align-middle">
                                            Tổng số lao động
                                        </th>
                                        <th rowSpan={2} className="border border-gray-300 p-2 text-center align-middle">
                                            Số LD của cơ sở tham gia báo cáo
                                        </th>
                                        <th rowSpan={2} className="border border-gray-300 p-2 text-center align-middle">
                                            Số lao động nữ
                                        </th>
                                        <th colSpan={3} className="border border-gray-300 p-1.5 text-center align-middle">
                                            Số người bị TNLĐ
                                        </th>
                                        <th rowSpan={2} className="border border-gray-300 p-2 text-center align-middle">
                                            KTNLĐ
                                        </th>
                                        <th rowSpan={2} className="border border-gray-300 p-2 text-center align-middle">
                                            KChết
                                        </th>
                                    </tr>
                                    <tr className="bg-[#F4F6F8] font-bold text-gray-600 text-[8.5px]">
                                        <th className="border border-gray-300 p-1.5 text-center">Tổng số</th>
                                        <th className="border border-gray-300 p-1.5 text-center">Số người chết</th>
                                        <th className="border border-gray-300 p-1.5 text-center">Số người bị thương nặng</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {/* Grand Total Row */}
                                    {table1GrandTotal && (
                                        <tr className="font-bold text-gray-900">
                                            <td className="border border-gray-300 p-2">{table1GrandTotal.name}</td>
                                            <td className="border border-gray-300 p-2 text-center"></td>
                                            <td className="border border-gray-300 p-2 text-center">{formatNumber(table1GrandTotal.totalEstablishments)}</td>
                                            <td className="border border-gray-300 p-2 text-center">{formatNumber(table1GrandTotal.participatingEstablishments)}</td>
                                            <td className="border border-gray-300 p-2 text-center">{formatNumber(table1GrandTotal.totalWorkforce)}</td>
                                            <td className="border border-gray-300 p-2 text-center">{formatNumber(table1GrandTotal.reportingWorkforce)}</td>
                                            <td className="border border-gray-300 p-2 text-center">{formatNumber(table1GrandTotal.femaleWorkforce)}</td>
                                            <td className="border border-gray-300 p-2 text-center">{formatNumber(table1GrandTotal.totalVictims)}</td>
                                            <td className="border border-gray-300 p-2 text-center">{formatNumber(table1GrandTotal.totalDeaths)}</td>
                                            <td className="border border-gray-300 p-2 text-center">{formatNumber(table1GrandTotal.totalSeriouslyInjured)}</td>
                                            <td className="border border-gray-300 p-2 text-center">{formatDecimal(table1GrandTotal.accidentFrequency)}</td>
                                            <td className="border border-gray-300 p-2 text-center">{formatDecimal(table1GrandTotal.deathFrequency)}</td>
                                            <td className="border border-gray-300 p-2 text-center"></td>
                                        </tr>
                                    )}

                                    {/* Sub-rows */}
                                    {table1Rows.map((row, idx) => (
                                        <tr key={idx} className="text-gray-800">
                                            <td className="border border-gray-300 p-2 text-left">{row.name}</td>
                                            <td className="border border-gray-300 p-2 text-center">{row.code}</td>
                                            <td className="border border-gray-300 p-2 text-center">{formatNumber(row.totalEstablishments)}</td>
                                            <td className="border border-gray-300 p-2 text-center">{formatNumber(row.participatingEstablishments)}</td>
                                            <td className="border border-gray-300 p-2 text-center">{formatNumber(row.totalWorkforce)}</td>
                                            <td className="border border-gray-300 p-2 text-center">{formatNumber(row.reportingWorkforce)}</td>
                                            <td className="border border-gray-300 p-2 text-center">{formatNumber(row.femaleWorkforce)}</td>
                                            <td className="border border-gray-300 p-2 text-center">{formatNumber(row.totalVictims)}</td>
                                            <td className="border border-gray-300 p-2 text-center">{formatNumber(row.totalDeaths)}</td>
                                            <td className="border border-gray-300 p-2 text-center">{formatNumber(row.totalSeriouslyInjured)}</td>
                                            <td className="border border-gray-300 p-2 text-center">{formatDecimal(row.accidentFrequency)}</td>
                                            <td className="border border-gray-300 p-2 text-center">{formatDecimal(row.deathFrequency)}</td>
                                            <td className="border border-gray-300 p-2 text-center"></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* SECTION II */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">II. Phân loại TNLĐ:</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse border border-gray-300 text-[10px]">
                                <thead>
                                    <tr className="bg-[#F4F6F8] font-bold text-gray-700">
                                        <th rowSpan={3} className="border border-gray-300 p-2 text-left align-middle w-[30%]">
                                            Tên chỉ tiêu thống kê
                                        </th>
                                        <th rowSpan={3} className="border border-gray-300 p-2 text-center align-middle w-[6%]">
                                            Mã số
                                        </th>
                                        <th colSpan={7} className="border border-gray-300 p-2 text-center align-middle">
                                            Phân loại TNLĐ theo mức độ thương tật
                                        </th>
                                        <th colSpan={6} className="border border-gray-300 p-2 text-center align-middle">
                                            Theo mức độ thương tật
                                        </th>
                                    </tr>
                                    <tr className="bg-[#F4F6F8] font-bold text-gray-700">
                                        <th colSpan={3} className="border border-gray-300 p-2 text-center align-middle">
                                            Số vụ TNLĐ
                                        </th>
                                        <th colSpan={4} className="border border-gray-300 p-2 text-center align-middle">
                                            Số người bị nạn (Người)
                                        </th>
                                        <th rowSpan={2} className="border border-gray-300 p-2 text-center align-middle">
                                            Tổng số ngày nghỉ vì TNLĐ
                                        </th>
                                        <th rowSpan={2} className="border border-gray-300 p-2 text-center align-middle">
                                            Tổng số tiền
                                        </th>
                                        <th colSpan={3} className="border border-gray-300 p-2 text-center align-middle">
                                            Tổng số ngày nghỉ vì TNLĐ
                                        </th>
                                        <th rowSpan={2} className="border border-gray-300 p-2 text-center align-middle">
                                            Thiệt hại tài sản (1.000 đ)
                                        </th>
                                    </tr>
                                    <tr className="bg-[#F4F6F8] font-bold text-gray-650 text-[8.5px]">
                                        <th className="border border-gray-300 p-1.5 text-center">Tổng số</th>
                                        <th className="border border-gray-300 p-1.5 text-center">Số vụ có người chết</th>
                                        <th className="border border-gray-300 p-1.5 text-center">Số vụ có từ 2 người bị nạn trở lên</th>
                                        <th className="border border-gray-300 p-1.5 text-center">Tổng số</th>
                                        <th className="border border-gray-300 p-1.5 text-center">Số LD nữ</th>
                                        <th className="border border-gray-300 p-1.5 text-center">Số người chết</th>
                                        <th className="border border-gray-300 p-1.5 text-center">Số người bị thương nặng</th>
                                        <th className="border border-gray-300 p-1.5 text-center">Y Tế</th>
                                        <th className="border border-gray-300 p-1.5 text-center">Trả lương theo thời gian điều trị</th>
                                        <th className="border border-gray-300 p-1.5 text-center">Bồi thường/ Trợ cấp</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {table2Rows.map((row, idx) => {
                                        if (row.isHeader) {
                                            return (
                                                <tr key={idx} className="bg-gray-50/70 font-bold text-gray-800">
                                                    <td className="border border-gray-300 p-2" colSpan={15}>
                                                        {row.name}
                                                    </td>
                                                </tr>
                                            );
                                        }

                                        const isGrandTotal = idx === 0;

                                        return (
                                            <tr key={idx} className={`text-gray-850 ${isGrandTotal ? "bg-gray-100 font-bold text-gray-900" : "text-gray-800"}`}>
                                                <td className={`border border-gray-300 p-2 ${isGrandTotal ? "text-left" : "text-left pl-4"}`}>{row.name}</td>
                                                <td className="border border-gray-300 p-2 text-center">{row.code}</td>
                                                <td className="border border-gray-300 p-2 text-center">{formatNumber(row.cases)}</td>
                                                <td className="border border-gray-300 p-2 text-center">{formatNumber(row.deathCases)}</td>
                                                <td className="border border-gray-300 p-2 text-center">{formatNumber(row.twoVictimsCases)}</td>
                                                <td className="border border-gray-300 p-2 text-center">{formatNumber(row.victims)}</td>
                                                <td className="border border-gray-300 p-2 text-center">{formatNumber(row.femaleVictims)}</td>
                                                <td className="border border-gray-300 p-2 text-center">{formatNumber(row.deaths)}</td>
                                                <td className="border border-gray-300 p-2 text-center">{formatNumber(row.serious)}</td>
                                                <td className="border border-gray-300 p-2 text-center">{formatNumber(row.sickDays)}</td>
                                                <td className="border border-gray-300 p-2 text-center">{formatNumber(row.totalCost)}</td>
                                                <td className="border border-gray-300 p-2 text-center">{formatNumber(row.medicalCost)}</td>
                                                <td className="border border-gray-300 p-2 text-center">{formatNumber(row.salaryCost)}</td>
                                                <td className="border border-gray-300 p-2 text-center">{formatNumber(row.compensationCost)}</td>
                                                <td className="border border-gray-300 p-2 text-center">{formatNumber(row.propertyDamage)}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
