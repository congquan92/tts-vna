"use client";

import React from "react";
import { Printer } from "lucide-react";
import TopHero from "@/components/TopHero";
import Button from "@/components/ui/Button";
import type { Report } from "@/types/report";

// Static definitions matching company-accidents constants
const CAUSES_STATIC = [
    { code: "1", name: "Không có thiết bị an toàn hoặc thiết bị không đảm bảo an toàn" },
    { code: "2", name: "Không có phương tiện bảo vệ cá nhân hoặc phương tiện bảo vệ cá nhân không tốt" },
    { code: "3", name: "Tổ chức lao động không hợp lý" },
    { code: "4", name: "Chưa huấn luyện hoặc huấn luyện an toàn vệ sinh lao động chưa đầy đủ" },
    { code: "5", name: "Không có quy trình an toàn hoặc biện pháp làm việc an toàn" },
    { code: "6", name: "Điều kiện làm việc không tốt" },
    { code: "7", name: "Quy phạm nội quy, quy trình, quy chuẩn, biện pháp làm việc an toàn" },
    { code: "8", name: "Không sử dụng phương tiện bảo vệ cá nhân" },
    { code: "9", name: "Khách quan khó tránh/ Nguyên nhân chưa kể đến" },
];

const FACTORS_STATIC = [{ code: "101", name: "Thiết bị nâng" }];

const OCCUPATIONS_STATIC = [
    { code: "102", name: "Nhà lãnh đạo cơ quan Đảng Cộng sản Việt Nam cấp Trung ương" },
    { code: "103", name: "Công nhân" },
];

// Helper to format number
const formatNumber = (val: number | string | undefined | null): string => {
    if (val === undefined || val === null || val === "") return "0";
    const num = Number(val);
    if (isNaN(num)) return "0";
    return num.toLocaleString("vi-VN");
};

const getCauseStats = (details: any[], causeName: string) => {
    const stats = {
        cases: 0,
        deathCases: 0,
        twoVictimsCases: 0,
        victims: 0,
        unmanagedVictims: 0,
        femaleVictims: 0,
        unmanagedFemale: 0,
        deaths: 0,
        unmanagedDeaths: 0,
        serious: 0,
        unmanagedSerious: 0,
    };
    (details || []).forEach((d) => {
        if (d.accidentCause === causeName) {
            stats.cases += Number(d.totalAccidentCases || 0);
            stats.deathCases += Number(d.totalCasesWithDeath || 0);
            stats.twoVictimsCases += Number(d.totalCasesWithTwoOrMoreVictims || 0);
            stats.victims += Number(d.totalVictims || 0);
            stats.unmanagedVictims += Number(d.unmanagedVictims || 0);
            stats.femaleVictims += Number(d.totalFemaleVictims || 0);
            stats.unmanagedFemale += Number(d.unmanagedFemaleVictims || 0);
            stats.deaths += Number(d.totalDeaths || 0);
            stats.unmanagedDeaths += Number(d.unmanagedDeaths || 0);
            stats.serious += Number(d.totalSeriouslyInjured || 0);
            stats.unmanagedSerious += Number(d.unmanagedSeriouslyInjured || 0);
        }
    });
    return stats;
};

const getFactorStats = (details: any[], factorName: string) => {
    const stats = {
        cases: 0,
        deathCases: 0,
        twoVictimsCases: 0,
        victims: 0,
        unmanagedVictims: 0,
        femaleVictims: 0,
        unmanagedFemale: 0,
        deaths: 0,
        unmanagedDeaths: 0,
        serious: 0,
        unmanagedSerious: 0,
    };
    (details || []).forEach((d) => {
        if (d.injuryFactor === factorName) {
            stats.cases += Number(d.totalAccidentCases || 0);
            stats.deathCases += Number(d.totalCasesWithDeath || 0);
            stats.twoVictimsCases += Number(d.totalCasesWithTwoOrMoreVictims || 0);
            stats.victims += Number(d.totalVictims || 0);
            stats.unmanagedVictims += Number(d.unmanagedVictims || 0);
            stats.femaleVictims += Number(d.totalFemaleVictims || 0);
            stats.unmanagedFemale += Number(d.unmanagedFemaleVictims || 0);
            stats.deaths += Number(d.totalDeaths || 0);
            stats.unmanagedDeaths += Number(d.unmanagedDeaths || 0);
            stats.serious += Number(d.totalSeriouslyInjured || 0);
            stats.unmanagedSerious += Number(d.unmanagedSeriouslyInjured || 0);
        }
    });
    return stats;
};

const getOccupationStats = (details: any[], occName: string) => {
    const stats = {
        cases: 0,
        deathCases: 0,
        twoVictimsCases: 0,
        victims: 0,
        unmanagedVictims: 0,
        femaleVictims: 0,
        unmanagedFemale: 0,
        deaths: 0,
        unmanagedDeaths: 0,
        serious: 0,
        unmanagedSerious: 0,
    };
    (details || []).forEach((d) => {
        if (d.occupationCategory === occName) {
            stats.cases += Number(d.totalAccidentCases || 0);
            stats.deathCases += Number(d.totalCasesWithDeath || 0);
            stats.twoVictimsCases += Number(d.totalCasesWithTwoOrMoreVictims || 0);
            stats.victims += Number(d.totalVictims || 0);
            stats.unmanagedVictims += Number(d.unmanagedVictims || 0);
            stats.femaleVictims += Number(d.totalFemaleVictims || 0);
            stats.unmanagedFemale += Number(d.unmanagedFemaleVictims || 0);
            stats.deaths += Number(d.totalDeaths || 0);
            stats.unmanagedDeaths += Number(d.unmanagedDeaths || 0);
            stats.serious += Number(d.totalSeriouslyInjured || 0);
            stats.unmanagedSerious += Number(d.unmanagedSeriouslyInjured || 0);
        }
    });
    return stats;
};

interface ReportDetailViewProps {
    report: Report;
    onBack: () => void;
}

export default function ReportDetailView({ report, onBack }: ReportDetailViewProps) {
    const laborReport = report.laborAccidentReport || {};
    const supportReport = report.laborAccidentSupportReport || {};
    const details = laborReport.accidentDetails || [];

    const laborStats = {
        cases: Number(laborReport.totalAccidentCases || 0),
        deathCases: Number(laborReport.totalCasesWithDeath || 0),
        twoVictimsCases: Number(laborReport.totalCasesWithTwoOrMoreVictims || 0),
        victims: Number(laborReport.totalVictims || 0),
        unmanagedVictims: Number(laborReport.unmanagedVictims || 0),
        femaleVictims: Number(laborReport.totalFemaleVictims || 0),
        unmanagedFemale: Number(laborReport.unmanagedFemaleVictims || 0),
        deaths: Number(laborReport.totalDeaths || 0),
        unmanagedDeaths: Number(laborReport.unmanagedDeaths || 0),
        serious: Number(laborReport.totalSeriouslyInjured || 0),
        unmanagedSerious: Number(laborReport.unmanagedSeriouslyInjured || 0),
    };

    const supportStats = {
        cases: Number(supportReport.totalAccidentCases || 0),
        deathCases: Number(supportReport.totalCasesWithDeath || 0),
        twoVictimsCases: Number(supportReport.totalCasesWithTwoOrMoreVictims || 0),
        victims: Number(supportReport.totalVictims || 0),
        unmanagedVictims: Number(supportReport.unmanagedVictims || 0),
        femaleVictims: Number(supportReport.totalFemaleVictims || 0),
        unmanagedFemale: Number(supportReport.unmanagedFemaleVictims || 0),
        deaths: Number(supportReport.totalDeaths || 0),
        unmanagedDeaths: Number(supportReport.unmanagedDeaths || 0),
        serious: Number(supportReport.totalSeriouslyInjured || 0),
        unmanagedSerious: Number(supportReport.unmanagedSeriouslyInjured || 0),
    };

    const totalStats = {
        cases: laborStats.cases + supportStats.cases,
        deathCases: laborStats.deathCases + supportStats.deathCases,
        twoVictimsCases: laborStats.twoVictimsCases + supportStats.twoVictimsCases,
        victims: laborStats.victims + supportStats.victims,
        unmanagedVictims: laborStats.unmanagedVictims + supportStats.unmanagedVictims,
        femaleVictims: laborStats.femaleVictims + supportStats.femaleVictims,
        unmanagedFemale: laborStats.unmanagedFemale + supportStats.unmanagedFemale,
        deaths: laborStats.deaths + supportStats.deaths,
        unmanagedDeaths: laborStats.unmanagedDeaths + supportStats.unmanagedDeaths,
        serious: laborStats.serious + supportStats.serious,
        unmanagedSerious: laborStats.unmanagedSerious + supportStats.unmanagedSerious,
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="flex flex-col flex-1 h-full min-h-0 bg-[#F4F6F8]">
            {/* Print Isolator CSS */}
            <style jsx global>{`
                @media print {
                    body * {
                        visibility: hidden !important;
                    }
                    #print-report-a4,
                    #print-report-a4 * {
                        visibility: visible !important;
                    }
                    #print-report-a4 {
                        position: absolute !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 100% !important;
                        padding: 0 !important;
                        margin: 0 !important;
                        background: white !important;
                    }
                }
            `}</style>

            {/* Header bar */}
            <div className="shrink-0 print:hidden py-1">
                <TopHero
                    lable="Báo cáo định kỳ Tai nạn lao động"
                    component={
                        <div className="flex gap-2 items-center">
                            <Button variant="outline" size="sm" onClick={onBack} className="border-none bg-transparent hover:bg-gray-100 text-gray-500 hover:text-gray-700 text-xs font-semibold px-4 py-1.5">
                                Huỷ bỏ
                            </Button>
                            <Button variant="outline" size="sm" onClick={handlePrint} className="gap-1.5 border-gray-200 text-blue-600 hover:bg-gray-50 text-xs font-semibold px-4 py-1.5">
                                <Printer className="size-3.5" />
                                <span>In báo cáo</span>
                            </Button>
                        </div>
                    }
                />
            </div>

            {/* Document details box */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 min-h-0">
                <div id="print-report-a4" className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm max-w-5xl mx-auto space-y-6">
                    {/* Title header */}
                    <div className="text-center pb-2 border-b border-gray-150">
                        <h2 className="text-sm font-bold text-gray-900 uppercase">
                            Báo cáo tổng hợp tình hình tai nạn lao động - Kỳ báo cáo: {report.reportPeriod} năm {report.year}
                        </h2>
                    </div>

                    {/* Stamped PDF Alert */}
                    <div className="bg-gray-50 border border-gray-200 rounded px-4 py-3 text-xs print:hidden">
                        <p className="text-xs font-semibold text-gray-700">
                            <span className="text-red-500 font-bold mr-1">**</span>
                            Vui lòng đính kèm báo cáo TNLĐ có dấu mộc công ty:{" "}
                            <a href="#" className="text-blue-600 underline font-bold hover:text-blue-800 ml-1">
                                baocaoTNLĐ.pdf
                            </a>
                        </p>
                    </div>

                    {/* TABLE I: Statistics Classification details */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse border border-gray-250 text-[10px]">
                            <thead>
                                <tr className="bg-[#F4F6F8] font-bold text-gray-700">
                                    <th rowSpan={3} className="border border-gray-250 p-2 text-left align-middle w-[30%]">
                                        Tên chỉ tiêu thống kê
                                    </th>
                                    <th rowSpan={3} className="border border-gray-250 p-2 text-center align-middle w-[6%]">
                                        Mã số
                                    </th>
                                    <th colSpan={11} className="border border-gray-250 p-2 text-center align-middle">
                                        Phân loại TNLĐ theo mức độ thương tật
                                    </th>
                                </tr>
                                <tr className="bg-[#F4F6F8] font-bold text-gray-700">
                                    <th colSpan={3} className="border border-gray-250 p-2 text-center align-middle">
                                        Số vụ (Vụ)
                                    </th>
                                    <th colSpan={8} className="border border-gray-250 p-2 text-center align-middle">
                                        Số người bị nạn (Người)
                                    </th>
                                </tr>
                                <tr className="bg-[#F4F6F8] font-bold text-gray-600 text-[8.5px]">
                                    <th className="border border-gray-250 p-1.5 text-center">Tổng số</th>
                                    <th className="border border-gray-250 p-1.5 text-center">Số vụ có người chết</th>
                                    <th className="border border-gray-250 p-1.5 text-center">Số vụ có từ 2 người bị nạn trở lên</th>
                                    <th className="border border-gray-250 p-1.5 text-center">Tổng số</th>
                                    <th className="border border-gray-250 p-1.5 text-center">NN không thuộc quyền quản lý</th>
                                    <th className="border border-gray-250 p-1.5 text-center">Tổng số</th>
                                    <th className="border border-gray-250 p-1.5 text-center">NN không thuộc quyền quản lý</th>
                                    <th className="border border-gray-250 p-1.5 text-center">Tổng số</th>
                                    <th className="border border-gray-250 p-1.5 text-center">NN không thuộc quyền quản lý</th>
                                    <th className="border border-gray-250 p-1.5 text-center">Tổng số</th>
                                    <th className="border border-gray-250 p-1.5 text-center">NN không thuộc quyền quản lý</th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* Row 1: Tai nạn lao động */}
                                <tr className="bg-gray-50/70 font-bold text-gray-800">
                                    <td className="border border-gray-250 p-2">1. Tai nạn lao động</td>
                                    <td className="border border-gray-250 p-2 text-center"></td>
                                    <td className="border border-gray-250 p-2 text-center"></td>
                                    <td className="border border-gray-250 p-2 text-center"></td>
                                    <td className="border border-gray-250 p-2 text-center"></td>
                                    <td className="border border-gray-250 p-2 text-center"></td>
                                    <td className="border border-gray-250 p-2 text-center"></td>
                                    <td className="border border-gray-250 p-2 text-center"></td>
                                    <td className="border border-gray-250 p-2 text-center"></td>
                                    <td className="border border-gray-250 p-2 text-center"></td>
                                    <td className="border border-gray-250 p-2 text-center"></td>
                                    <td className="border border-gray-250 p-2 text-center"></td>
                                    <td className="border border-gray-250 p-2 text-center"></td>
                                </tr>
                                <tr className="font-semibold text-gray-800">
                                    <td className="border border-gray-250 p-2 pl-4">Tai nạn lao động</td>
                                    <td className="border border-gray-250 p-2 text-center"></td>
                                    <td className="border border-gray-250 p-2 text-center">{laborStats.cases}</td>
                                    <td className="border border-gray-250 p-2 text-center">{laborStats.deathCases}</td>
                                    <td className="border border-gray-250 p-2 text-center">{laborStats.twoVictimsCases}</td>
                                    <td className="border border-gray-250 p-2 text-center">{laborStats.victims}</td>
                                    <td className="border border-gray-250 p-2 text-center">{laborStats.unmanagedVictims}</td>
                                    <td className="border border-gray-250 p-2 text-center">{laborStats.femaleVictims}</td>
                                    <td className="border border-gray-250 p-2 text-center">{laborStats.unmanagedFemale}</td>
                                    <td className="border border-gray-250 p-2 text-center">{laborStats.deaths}</td>
                                    <td className="border border-gray-250 p-2 text-center">{laborStats.unmanagedDeaths}</td>
                                    <td className="border border-gray-250 p-2 text-center">{laborStats.serious}</td>
                                    <td className="border border-gray-250 p-2 text-center">{laborStats.unmanagedSerious}</td>
                                </tr>

                                {/* 1.1 Phân theo nguyên nhân */}
                                <tr className="bg-gray-50/50 font-bold text-gray-700">
                                    <td className="border border-gray-250 p-2 pl-4">1.1 Phân theo nguyên nhân xảy ra TNLĐ</td>
                                    <td className="border border-gray-250 p-2 text-center"></td>
                                    <td colSpan={11} className="border border-gray-250 p-2"></td>
                                </tr>
                                <tr className="bg-gray-50/30 font-semibold text-gray-600">
                                    <td className="border border-gray-250 p-2 pl-6">a. Do người sử dụng lao động</td>
                                    <td className="border border-gray-250 p-2 text-center"></td>
                                    <td colSpan={11} className="border border-gray-250 p-2"></td>
                                </tr>

                                {CAUSES_STATIC.slice(0, 6).map((c) => {
                                    const s = getCauseStats(details, c.name);
                                    return (
                                        <tr key={c.code} className="text-gray-700">
                                            <td className="border border-gray-250 p-2 pl-8">{c.name}</td>
                                            <td className="border border-gray-250 p-2 text-center">{c.code}</td>
                                            <td className="border border-gray-250 p-2 text-center">{s.cases}</td>
                                            <td className="border border-gray-250 p-2 text-center">{s.deathCases}</td>
                                            <td className="border border-gray-250 p-2 text-center">{s.twoVictimsCases}</td>
                                            <td className="border border-gray-250 p-2 text-center">{s.victims}</td>
                                            <td className="border border-gray-250 p-2 text-center">{s.unmanagedVictims}</td>
                                            <td className="border border-gray-250 p-2 text-center">{s.femaleVictims}</td>
                                            <td className="border border-gray-250 p-2 text-center">{s.unmanagedFemale}</td>
                                            <td className="border border-gray-250 p-2 text-center">{s.deaths}</td>
                                            <td className="border border-gray-250 p-2 text-center">{s.unmanagedDeaths}</td>
                                            <td className="border border-gray-250 p-2 text-center">{s.serious}</td>
                                            <td className="border border-gray-250 p-2 text-center">{s.unmanagedSerious}</td>
                                        </tr>
                                    );
                                })}

                                <tr className="bg-gray-50/30 font-semibold text-gray-600">
                                    <td className="border border-gray-250 p-2 pl-6">b. Do người lao động</td>
                                    <td className="border border-gray-250 p-2 text-center"></td>
                                    <td colSpan={11} className="border border-gray-250 p-2"></td>
                                </tr>

                                {CAUSES_STATIC.slice(6).map((c) => {
                                    const s = getCauseStats(details, c.name);
                                    return (
                                        <tr key={c.code} className="text-gray-700">
                                            <td className="border border-gray-250 p-2 pl-8">{c.name}</td>
                                            <td className="border border-gray-250 p-2 text-center">{c.code}</td>
                                            <td className="border border-gray-250 p-2 text-center">{s.cases}</td>
                                            <td className="border border-gray-250 p-2 text-center">{s.deathCases}</td>
                                            <td className="border border-gray-250 p-2 text-center">{s.twoVictimsCases}</td>
                                            <td className="border border-gray-250 p-2 text-center">{s.victims}</td>
                                            <td className="border border-gray-250 p-2 text-center">{s.unmanagedVictims}</td>
                                            <td className="border border-gray-250 p-2 text-center">{s.femaleVictims}</td>
                                            <td className="border border-gray-250 p-2 text-center">{s.unmanagedFemale}</td>
                                            <td className="border border-gray-250 p-2 text-center">{s.deaths}</td>
                                            <td className="border border-gray-250 p-2 text-center">{s.unmanagedDeaths}</td>
                                            <td className="border border-gray-250 p-2 text-center">{s.serious}</td>
                                            <td className="border border-gray-250 p-2 text-center">{s.unmanagedSerious}</td>
                                        </tr>
                                    );
                                })}

                                {/* 1.2 Phân theo yếu tố gây chấn thương */}
                                <tr className="bg-gray-50/50 font-bold text-gray-700">
                                    <td className="border border-gray-250 p-2 pl-4">1.2. Phân theo yếu tố gây chấn thương</td>
                                    <td className="border border-gray-250 p-2 text-center"></td>
                                    <td colSpan={11} className="border border-gray-250 p-2"></td>
                                </tr>
                                {FACTORS_STATIC.map((f) => {
                                    const s = getFactorStats(details, f.name);
                                    return (
                                        <tr key={f.code} className="text-gray-700">
                                            <td className="border border-gray-250 p-2 pl-6">{f.name}</td>
                                            <td className="border border-gray-250 p-2 text-center">{f.code}</td>
                                            <td className="border border-gray-250 p-2 text-center">{s.cases}</td>
                                            <td className="border border-gray-250 p-2 text-center">{s.deathCases}</td>
                                            <td className="border border-gray-250 p-2 text-center">{s.twoVictimsCases}</td>
                                            <td className="border border-gray-250 p-2 text-center">{s.victims}</td>
                                            <td className="border border-gray-250 p-2 text-center">{s.unmanagedVictims}</td>
                                            <td className="border border-gray-250 p-2 text-center">{s.femaleVictims}</td>
                                            <td className="border border-gray-250 p-2 text-center">{s.unmanagedFemale}</td>
                                            <td className="border border-gray-250 p-2 text-center">{s.deaths}</td>
                                            <td className="border border-gray-250 p-2 text-center">{s.unmanagedDeaths}</td>
                                            <td className="border border-gray-250 p-2 text-center">{s.serious}</td>
                                            <td className="border border-gray-250 p-2 text-center">{s.unmanagedSerious}</td>
                                        </tr>
                                    );
                                })}

                                {/* 1.3 Phân theo nghề nghiệp */}
                                <tr className="bg-gray-50/50 font-bold text-gray-700">
                                    <td className="border border-gray-250 p-2 pl-4">1.3 Phân theo nghề nghiệp</td>
                                    <td className="border border-gray-250 p-2 text-center"></td>
                                    <td colSpan={11} className="border border-gray-250 p-2"></td>
                                </tr>
                                {OCCUPATIONS_STATIC.map((occ) => {
                                    const s = getOccupationStats(details, occ.name);
                                    return (
                                        <tr key={occ.code} className="text-gray-700">
                                            <td className="border border-gray-250 p-2 pl-6">{occ.name}</td>
                                            <td className="border border-gray-250 p-2 text-center">{occ.code}</td>
                                            <td className="border border-gray-250 p-2 text-center">{s.cases}</td>
                                            <td className="border border-gray-250 p-2 text-center">{s.deathCases}</td>
                                            <td className="border border-gray-250 p-2 text-center">{s.twoVictimsCases}</td>
                                            <td className="border border-gray-250 p-2 text-center">{s.victims}</td>
                                            <td className="border border-gray-250 p-2 text-center">{s.unmanagedVictims}</td>
                                            <td className="border border-gray-250 p-2 text-center">{s.femaleVictims}</td>
                                            <td className="border border-gray-250 p-2 text-center">{s.unmanagedFemale}</td>
                                            <td className="border border-gray-250 p-2 text-center">{s.deaths}</td>
                                            <td className="border border-gray-250 p-2 text-center">{s.unmanagedDeaths}</td>
                                            <td className="border border-gray-250 p-2 text-center">{s.serious}</td>
                                            <td className="border border-gray-250 p-2 text-center">{s.unmanagedSerious}</td>
                                        </tr>
                                    );
                                })}

                                {/* 2. Tai nạn được hưởng trợ cấp */}
                                <tr className="bg-gray-50/70 font-bold text-gray-800">
                                    <td className="border border-gray-250 p-2">2. Tai nạn được hưởng trợ cấp theo quy định tại Khoản 2 Điều 39 Luật ATVSLĐ</td>
                                    <td className="border border-gray-250 p-2 text-center">10</td>
                                    <td className="border border-gray-250 p-2 text-center">{supportStats.cases}</td>
                                    <td className="border border-gray-250 p-2 text-center">{supportStats.deathCases}</td>
                                    <td className="border border-gray-250 p-2 text-center">{supportStats.twoVictimsCases}</td>
                                    <td className="border border-gray-250 p-2 text-center">{supportStats.victims}</td>
                                    <td className="border border-gray-250 p-2 text-center">{supportStats.unmanagedVictims}</td>
                                    <td className="border border-gray-250 p-2 text-center">{supportStats.femaleVictims}</td>
                                    <td className="border border-gray-250 p-2 text-center">{supportStats.unmanagedFemale}</td>
                                    <td className="border border-gray-250 p-2 text-center">{supportStats.deaths}</td>
                                    <td className="border border-gray-250 p-2 text-center">{supportStats.unmanagedDeaths}</td>
                                    <td className="border border-gray-250 p-2 text-center">{supportStats.serious}</td>
                                    <td className="border border-gray-250 p-2 text-center">{supportStats.unmanagedSerious}</td>
                                </tr>

                                {/* 3. Tổng số */}
                                <tr className="bg-gray-100 font-bold text-gray-900">
                                    <td className="border border-gray-250 p-2">3. Tổng số</td>
                                    <td className="border border-gray-250 p-2 text-center"></td>
                                    <td colSpan={11} className="border border-gray-250 p-2"></td>
                                </tr>
                                <tr className="bg-gray-100 font-bold text-gray-900">
                                    <td className="border border-gray-250 p-2 pl-4">Tổng số (3=1+2)</td>
                                    <td className="border border-gray-250 p-2 text-center"></td>
                                    <td className="border border-gray-250 p-2 text-center">{totalStats.cases}</td>
                                    <td className="border border-gray-250 p-2 text-center">{totalStats.deathCases}</td>
                                    <td className="border border-gray-250 p-2 text-center">{totalStats.twoVictimsCases}</td>
                                    <td className="border border-gray-250 p-2 text-center">{totalStats.victims}</td>
                                    <td className="border border-gray-250 p-2 text-center">{totalStats.unmanagedVictims}</td>
                                    <td className="border border-gray-250 p-2 text-center">{totalStats.femaleVictims}</td>
                                    <td className="border border-gray-250 p-2 text-center">{totalStats.unmanagedFemale}</td>
                                    <td className="border border-gray-250 p-2 text-center">{totalStats.deaths}</td>
                                    <td className="border border-gray-250 p-2 text-center">{totalStats.unmanagedDeaths}</td>
                                    <td className="border border-gray-250 p-2 text-center">{totalStats.serious}</td>
                                    <td className="border border-gray-250 p-2 text-center">{totalStats.unmanagedSerious}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* TABLE II: Damages */}
                    <div className="space-y-3 pt-2">
                        <div className="border-b border-gray-150 pb-1">
                            <h3 className="text-xs font-bold text-gray-800 uppercase">II. Thiệt hại do tai nạn lao động</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-center border-collapse border border-gray-250 text-[10px]">
                                <thead>
                                    <tr className="bg-[#F4F6F8] font-bold text-gray-700">
                                        <th rowSpan={2} className="border border-gray-250 p-2 text-left align-middle w-[35%]">
                                            Tổng số ngày nghỉ vì tai nạn lao động (kể cả ngày nghỉ chế độ)
                                        </th>
                                        <th colSpan={4} className="border border-gray-250 p-2 text-center align-middle">
                                            Tổng số tiền chi phí (1.000đ)
                                        </th>
                                        <th rowSpan={2} className="border border-gray-250 p-2 text-center align-middle w-[25%]">
                                            Thiệt hại tài sản (1.000đ)
                                        </th>
                                    </tr>
                                    <tr className="bg-[#F4F6F8] font-bold text-gray-650 text-[8.5px]">
                                        <th className="border border-gray-250 p-1.5 text-center">Tổng số</th>
                                        <th className="border border-gray-250 p-1.5 text-center">Y tế</th>
                                        <th className="border border-gray-250 p-1.5 text-center">Trả lương trong thời gian điều trị</th>
                                        <th className="border border-gray-250 p-1.5 text-center">Bồi thường trợ cấp</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="font-semibold text-gray-800">
                                        <td className="border border-gray-250 p-2.5 text-center">{(laborReport.totalSickDays || 0) + (supportReport.totalSickDays || 0)}</td>
                                        <td className="border border-gray-250 p-2.5 text-center">
                                            {formatNumber(
                                                Number(laborReport.medicalCost || 0) +
                                                Number(laborReport.salaryDuringTreatment || 0) +
                                                Number(laborReport.compensationCost || 0) +
                                                Number(supportReport.medicalCost || 0) +
                                                Number(supportReport.salaryDuringTreatment || 0) +
                                                Number(supportReport.compensationCost || 0)
                                            )}
                                        </td>
                                        <td className="border border-gray-250 p-2.5 text-center">{formatNumber((laborReport.medicalCost || 0) + (supportReport.medicalCost || 0))}</td>
                                        <td className="border border-gray-250 p-2.5 text-center">{formatNumber((laborReport.salaryDuringTreatment || 0) + (supportReport.salaryDuringTreatment || 0))}</td>
                                        <td className="border border-gray-250 p-2.5 text-center">{formatNumber((laborReport.compensationCost || 0) + (supportReport.compensationCost || 0))}</td>
                                        <td className="border border-gray-250 p-2.5 text-center">{formatNumber((laborReport.propertyDamage || 0) + (supportReport.propertyDamage || 0))}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
