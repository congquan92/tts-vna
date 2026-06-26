"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { ReportApi } from "@/api/report";
import type { Report } from "@/types/report";
import TopHero from "@/components/TopHero";
import ReportForm from "../../../company-accidents/_components/ReportForm";
import Button from "@/components/ui/Button";
import { ChevronRight, Printer, FileDown } from "lucide-react";
import { toast } from "sonner";

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

    const fetchReport = useCallback(async () => {
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
    }, [reportId]);

    useEffect(() => {
        Promise.resolve().then(() => {
            fetchReport();
        });
    }, [fetchReport]);

    const handleBack = useCallback(() => {
        router.push("/accident-types");
    }, [router]);

    const handleExportReportDocx = async () => {
        if (!reportId) return;
        try {
            toast.loading("Đang xuất báo cáo ra file Word...", { id: "export-report-docx" });
            const blob = await ReportApi.exportReportDocx(reportId);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `BC_TNLĐ_PHỤ_LỤC_XII_${report?.companyInfo?.businessName || "DoanhNghiep"}_${report?.year || ""}.docx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            toast.success("Xuất file Word thành công!", { id: "export-report-docx" });
        } catch (e) {
            console.error("Failed to export report to DOCX", e);
            toast.error("Không thể xuất file Word. Vui lòng thử lại sau.", { id: "export-report-docx" });
        }
    };

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
        businessType: (report.companyInfo?.business as { typeOfBusiness?: { name?: string } })?.typeOfBusiness?.name || "Doanh nghiệp tư nhân",
        industry: (report.companyInfo?.business as { businessIndustry?: { name?: string } })?.businessIndustry?.name || "Chưa xác định",
    };

    const isOverview = formTriggers?.selectedSection === "Xem tổng quan báo cáo tai nạn lao động";

    return (
        <main className="h-screen flex flex-col py-2">
            <div className="shrink-0 print:hidden">
                <TopHero
                    lable="Báo cáo định kỳ Tai nạn lao động"
                    component={
                        <div className="flex gap-2 items-center">
                            {/* Year input display */}
                            <input
                                type="number"
                                value={formTriggers?.year ?? report.year}
                                disabled={true}
                                className="w-16 border border-gray-200 rounded-lg px-2 py-1 text-xs text-center font-semibold outline-none focus:border-primary bg-gray-100 cursor-not-allowed"
                            />

                            <Button variant="outline" size="sm" onClick={handleBack} className="border-none bg-transparent hover:bg-gray-100 text-gray-500 hover:text-gray-700 text-xs font-semibold px-3 py-1.5">
                                Trở về
                            </Button>

                            {isOverview ? (
                                <Button variant="outline" size="sm" onClick={handleExportReportDocx} className="gap-1.5 border-gray-200 text-blue-600 hover:bg-gray-50 text-xs font-semibold px-3 py-1.5">
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

            {/* Status Banner */}
            <div className="mx-6 mt-3 shrink-0 print:hidden">
                {report.status === "đã tiếp nhận" && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center justify-between text-xs text-green-800 shadow-sm">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500" />
                            <span className="font-semibold">Trạng thái: Đã tiếp nhận</span>
                        </div>
                        <span className="text-[11px] text-green-600 font-medium">Báo cáo này đã được Sở tiếp nhận thành công.</span>
                    </div>
                )}
                {report.status === "đã từ chối" && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-xs text-red-800 space-y-1 shadow-sm">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-red-500" />
                            <span className="font-semibold">Trạng thái: Đã từ chối</span>
                        </div>
                        {report.rejectReason && (
                            <p className="text-[11px] text-red-600 font-medium">
                                Lý do từ chối: <span className="font-semibold italic">{report.rejectReason}</span>
                            </p>
                        )}
                    </div>
                )}
                {report.status === "chờ tiếp nhận" && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-center justify-between text-xs text-yellow-800 shadow-sm">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                            <span className="font-semibold">Trạng thái: Chờ tiếp nhận</span>
                        </div>
                        <span className="text-[11px] text-yellow-600 font-medium">Báo cáo đang chờ Sở duyệt hoặc từ chối.</span>
                    </div>
                )}
                {report.status === "đang báo cáo" && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 flex items-center justify-between text-xs text-orange-850 shadow-sm">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-orange-400" />
                            <span className="font-semibold">Trạng thái: Đang báo cáo</span>
                        </div>
                        <span className="text-[11px] text-orange-700 font-medium">Bản báo cáo của doanh nghiệp chưa gửi đi.</span>
                    </div>
                )}
            </div>

            <ReportForm mode="view" report={report} businessProfile={businessProfile} existingReports={[]} onSaveSuccess={() => {}} onClose={handleBack} registerTriggers={setFormTriggers} />
        </main>
    );
}
