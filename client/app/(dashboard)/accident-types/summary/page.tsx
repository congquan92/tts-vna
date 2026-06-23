"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ReportApi } from "@/api/report";
import type { Report } from "@/types/report";
import { toast } from "sonner";
import ReportDetailView from "../_components/ReportDetailView";

export default function AccidentSummaryPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [loading, setLoading] = useState(true);
    const [aggregatedReport, setAggregatedReport] = useState<Report | null>(null);

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

                const res = await ReportApi.getAll(
                    1,
                    99999,
                    selectedYear,
                    "đã tiếp nhận",
                    undefined,
                    undefined,
                    provParam,
                    wardParam
                );

                let list = res.data || [];
                if (period) {
                    list = list.filter((r) => r.reportPeriod === period);
                }

                if (list.length === 0) {
                    toast.info("Không có báo cáo nào ở trạng thái 'Đã tiếp nhận' để tổng hợp.");
                    setAggregatedReport(null);
                    return;
                }

                const aggregated: Report = {
                    id: 0,
                    status: "đã tiếp nhận",
                    year: selectedYear,
                    reportPeriod: period || "Tổng hợp",
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    companyInfo: {
                        businessName: "BÁO CÁO TỔNG HỢP CÁC DOANH NGHIỆP",
                        totalNumberOfEmployees: 0,
                        totalNumberOfFemaleEmployees: 0,
                        totalSalary: 0,
                    },
                    laborAccidentReport: {
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
                    },
                    laborAccidentSupportReport: {
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
                    }
                };

                list.forEach((r) => {
                    if (aggregated.companyInfo) {
                        aggregated.companyInfo.totalNumberOfEmployees = (aggregated.companyInfo.totalNumberOfEmployees || 0) + (r.companyInfo?.totalNumberOfEmployees || 0);
                        aggregated.companyInfo.totalNumberOfFemaleEmployees = (aggregated.companyInfo.totalNumberOfFemaleEmployees || 0) + (r.companyInfo?.totalNumberOfFemaleEmployees || 0);
                        aggregated.companyInfo.totalSalary = (aggregated.companyInfo.totalSalary || 0) + Number(r.companyInfo?.totalSalary || 0);
                    }

                    if (aggregated.laborAccidentReport && r.laborAccidentReport) {
                        const a = aggregated.laborAccidentReport;
                        const b = r.laborAccidentReport;
                        a.totalAccidentCases = (a.totalAccidentCases || 0) + (b.totalAccidentCases || 0);
                        a.totalCasesWithDeath = (a.totalCasesWithDeath || 0) + (b.totalCasesWithDeath || 0);
                        a.totalCasesWithTwoOrMoreVictims = (a.totalCasesWithTwoOrMoreVictims || 0) + (b.totalCasesWithTwoOrMoreVictims || 0);
                        a.totalVictims = (a.totalVictims || 0) + (b.totalVictims || 0);
                        a.totalFemaleVictims = (a.totalFemaleVictims || 0) + (b.totalFemaleVictims || 0);
                        a.totalDeaths = (a.totalDeaths || 0) + (b.totalDeaths || 0);
                        a.totalSeriouslyInjured = (a.totalSeriouslyInjured || 0) + (b.totalSeriouslyInjured || 0);
                        a.unmanagedVictims = (a.unmanagedVictims || 0) + (b.unmanagedVictims || 0);
                        a.unmanagedFemaleVictims = (a.unmanagedFemaleVictims || 0) + (b.unmanagedFemaleVictims || 0);
                        a.unmanagedDeaths = (a.unmanagedDeaths || 0) + (b.unmanagedDeaths || 0);
                        a.unmanagedSeriouslyInjured = (a.unmanagedSeriouslyInjured || 0) + (b.unmanagedSeriouslyInjured || 0);
                        a.medicalCost = (a.medicalCost || 0) + (b.medicalCost || 0);
                        a.salaryDuringTreatment = (a.salaryDuringTreatment || 0) + (b.salaryDuringTreatment || 0);
                        a.compensationCost = (a.compensationCost || 0) + (b.compensationCost || 0);
                        a.totalCost = (a.totalCost || 0) + (b.totalCost || 0);
                        a.totalSickDays = (a.totalSickDays || 0) + (b.totalSickDays || 0);
                        a.propertyDamage = (a.propertyDamage || 0) + (b.propertyDamage || 0);
                        if (b.accidentDetails) {
                            a.accidentDetails = [...(a.accidentDetails || []), ...b.accidentDetails];
                        }
                    }

                    if (aggregated.laborAccidentSupportReport && r.laborAccidentSupportReport) {
                        const a = aggregated.laborAccidentSupportReport;
                        const b = r.laborAccidentSupportReport;
                        a.totalAccidentCases = (a.totalAccidentCases || 0) + (b.totalAccidentCases || 0);
                        a.totalCasesWithDeath = (a.totalCasesWithDeath || 0) + (b.totalCasesWithDeath || 0);
                        a.totalCasesWithTwoOrMoreVictims = (a.totalCasesWithTwoOrMoreVictims || 0) + (b.totalCasesWithTwoOrMoreVictims || 0);
                        a.totalVictims = (a.totalVictims || 0) + (b.totalVictims || 0);
                        a.totalFemaleVictims = (a.totalFemaleVictims || 0) + (b.totalFemaleVictims || 0);
                        a.totalDeaths = (a.totalDeaths || 0) + (b.totalDeaths || 0);
                        a.totalSeriouslyInjured = (a.totalSeriouslyInjured || 0) + (b.totalSeriouslyInjured || 0);
                        a.unmanagedVictims = (a.unmanagedVictims || 0) + (b.unmanagedVictims || 0);
                        a.unmanagedFemaleVictims = (a.unmanagedFemaleVictims || 0) + (b.unmanagedFemaleVictims || 0);
                        a.unmanagedDeaths = (a.unmanagedDeaths || 0) + (b.unmanagedDeaths || 0);
                        a.unmanagedSeriouslyInjured = (a.unmanagedSeriouslyInjured || 0) + (b.unmanagedSeriouslyInjured || 0);
                        a.medicalCost = (a.medicalCost || 0) + (b.medicalCost || 0);
                        a.salaryDuringTreatment = (a.salaryDuringTreatment || 0) + (b.salaryDuringTreatment || 0);
                        a.compensationCost = (a.compensationCost || 0) + (b.compensationCost || 0);
                        a.totalCost = (a.totalCost || 0) + (b.totalCost || 0);
                        a.totalSickDays = (a.totalSickDays || 0) + (b.totalSickDays || 0);
                        a.propertyDamage = (a.propertyDamage || 0) + (b.propertyDamage || 0);
                    }
                });

                setAggregatedReport(aggregated);
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

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center bg-[#F4F6F8]">
                <div className="text-center">
                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <span className="text-gray-500 text-sm">Đang tải và tổng hợp báo cáo...</span>
                </div>
            </div>
        );
    }

    if (!aggregatedReport) {
        return (
            <div className="h-screen flex flex-col items-center justify-center bg-[#F4F6F8] gap-4">
                <span className="text-gray-500 text-sm">Không có dữ liệu báo cáo ở trạng thái 'Đã tiếp nhận' để tổng hợp.</span>
                <button
                    onClick={handleBack}
                    className="px-4 py-2 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary-hover transition-colors"
                >
                    Trở về
                </button>
            </div>
        );
    }

    return (
        <ReportDetailView report={aggregatedReport} onBack={handleBack} />
    );
}
