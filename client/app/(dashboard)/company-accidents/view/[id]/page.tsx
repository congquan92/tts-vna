"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { ReportApi } from "@/api/report";
import type { Report } from "@/types/report";
import TopHero from "@/components/TopHero";
import ReportForm from "../../_components/ReportForm";
import Button from "@/components/ui/Button";
import { ChevronRight, Printer } from "lucide-react";

export default function ViewReportPage() {
    const router = useRouter();
    const params = useParams();
    const reportId = params?.id ? Number(params.id) : null;

    const [report, setReport] = useState<Report | null>(null);
    const [loading, setLoading] = useState(true);

    // Active triggers for header buttons
    const [formTriggers, setFormTriggers] = useState<{
        save: () => void;
        continue: () => void;
        cancel: () => void;
        setYear: (y: number) => void;
        year: number;
        selectedSection: string;
        print: () => void;
    } | null>(null);

    useEffect(() => {
        const fetchReport = async () => {
            if (reportId) {
                setLoading(true);
                try {
                    const data = await ReportApi.getById(reportId);
                    setReport(data);
                } catch (e) {
                    console.error("Failed to load report", e);
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchReport();
    }, [reportId]);

    const handleBack = useCallback(() => {
        router.push("/company-accidents");
    }, [router]);

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center bg-[#F4F6F8]">
                <div className="text-center">
                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <span className="text-gray-500 text-sm">Đang tải báo cáo...</span>
                </div>
            </div>
        );
    }

    if (!report) {
        return (
            <div className="h-screen flex flex-col items-center justify-center bg-[#F4F6F8] gap-4">
                <span className="text-gray-500 text-sm">Không tìm thấy báo cáo hoặc có lỗi xảy ra.</span>
                <button onClick={handleBack} className="px-4 py-2 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary-hover transition-colors">
                    Trở về
                </button>
            </div>
        );
    }

    // Fallback profile details resolved from report's companyInfo
    const businessProfile = {
        name: report.companyInfo?.business?.businessName || report.companyInfo?.businessName || "N/A",
        taxCode: report.companyInfo?.business?.taxCode || "N/A",
        businessType: (report.companyInfo?.business as any)?.typeOfBusiness?.name || "Doanh nghiệp tư nhân",
        industry: (report.companyInfo?.business as any)?.businessIndustry?.name || "Chưa xác định",
    };

    const isOverview = formTriggers?.selectedSection === "Xem tổng quan báo cáo tai nạn lao động";

    return (
        <main className="h-screen flex flex-col py-2">
            <div className="shrink-0 print:hidden">
                <TopHero
                    lable="Báo cáo định kỳ Tai nạn lao động"
                    component={
                        <div className="flex gap-2 items-center">
                            <Button variant="outline" size="sm" onClick={handleBack} className="border-none bg-transparent hover:bg-gray-100 text-gray-500 hover:text-gray-700 text-xs font-semibold px-3 py-1.5">
                                Huỷ bỏ
                            </Button>

                            {isOverview ? (
                                <Button variant="outline" size="sm" onClick={() => formTriggers?.print()} className="gap-1.5 border-gray-200 text-blue-600 hover:bg-gray-50 text-xs font-semibold px-3 py-1.5">
                                    <Printer className="size-3.5" />
                                    <span>In báo cáo</span>
                                </Button>
                            ) : (
                                <Button variant="outline" size="sm" onClick={() => formTriggers?.continue()} className="gap-1 border-gray-200 text-blue-600 hover:bg-gray-50 text-xs font-semibold px-3 py-1.5">
                                    <span>Tiếp tục</span>
                                    <ChevronRight className="size-3" />
                                </Button>
                            )}
                        </div>
                    }
                />
            </div>

            <ReportForm mode="view" report={report} businessProfile={businessProfile} existingReports={[]} onSaveSuccess={() => {}} onClose={handleBack} registerTriggers={setFormTriggers} />
        </main>
    );
}
