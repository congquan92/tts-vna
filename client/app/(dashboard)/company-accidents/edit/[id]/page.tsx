"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import TopHero from "@/components/TopHero";
import { BusinessApi } from "@/api/business";
import { ReportApi } from "@/api/report";
import type { Report } from "@/types/report";
import { ChevronRight, Save, Printer, Send } from "lucide-react";
import ReportForm from "../../_components/ReportForm";
import Button from "@/components/ui/Button";

export default function EditReportPage() {
    const router = useRouter();
    const params = useParams();
    const reportId = params?.id ? Number(params.id) : null;

    const { user } = useAuth();
    const [report, setReport] = useState<Report | null>(null);
    const [reports, setReports] = useState<Report[]>([]);
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

    // Business profile pre-populated state
    const [businessProfile, setBusinessProfile] = useState<{
        name: string;
        taxCode: string;
        businessType?: string;
        industry?: string;
    } | null>(null);

    // Fetch logged-in business profile details
    useEffect(() => {
        const fetchBusiness = async () => {
            if (user?.profileId) {
                try {
                    const data = (await BusinessApi.getById(user.profileId)) as any;
                    setBusinessProfile({
                        name: data.businessName || "",
                        taxCode: data.taxCode || "",
                        businessType: data.typeOfBusiness?.name || "",
                        industry: data.businessIndustry?.name || "",
                    });
                } catch (e) {
                    console.error("Failed to load business profile details", e);
                }
            }
        };
        fetchBusiness();
    }, [user]);

    // Fetch report by ID and other reports for validation
    useEffect(() => {
        const fetchData = async () => {
            if (reportId) {
                setLoading(true);
                try {
                    const [reportData, allReports] = await Promise.all([ReportApi.getById(reportId), ReportApi.getAll(1, 100)]);
                    setReport(reportData);
                    setReports(allReports.data || []);
                } catch (e) {
                    console.error("Failed to load report data", e);
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchData();
    }, [reportId]);

    const handleFormClose = useCallback(() => {
        router.push("/company-accidents");
    }, [router]);

    const isOverview = formTriggers?.selectedSection === "Xem tổng quan báo cáo tai nạn lao động";

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center bg-[#F4F6F8]">
                <div className="text-center">
                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <span className="text-gray-500 text-sm">Đang tải dữ liệu báo cáo...</span>
                </div>
            </div>
        );
    }

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
                                value={formTriggers?.year ?? new Date().getFullYear()}
                                disabled={true}
                                className="w-16 border border-gray-200 rounded-lg px-2 py-1 text-xs text-center font-semibold outline-none focus:border-primary bg-gray-100 cursor-not-allowed"
                            />

                            <Button variant="outline" size="sm" onClick={() => formTriggers?.cancel()} className="border-none bg-transparent hover:bg-gray-100 text-gray-500 hover:text-gray-700 text-xs font-semibold px-3 py-1.5">
                                Huỷ bỏ
                            </Button>

                            {isOverview ? (
                                <>
                                    <Button variant="outline" size="sm" onClick={() => formTriggers?.print()} className="gap-1.5 border-gray-200 text-blue-600 hover:bg-gray-50 text-xs font-semibold px-3 py-1.5">
                                        <Printer className="size-3.5" />
                                        <span>In báo cáo</span>
                                    </Button>

                                    <Button variant="primary" size="sm" onClick={() => formTriggers?.save()} className="gap-1.5 text-xs font-semibold px-3 py-1.5 shadow-sm">
                                        <Send className="size-3.5" />
                                        <span>Gửi báo cáo</span>
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Button variant="outline" size="sm" onClick={() => formTriggers?.continue()} className="gap-1 border-gray-200 text-blue-600 hover:bg-gray-50 text-xs font-semibold px-3 py-1.5">
                                        <span>Tiếp tục</span>
                                        <ChevronRight className="size-3" />
                                    </Button>

                                    <Button variant="primary" size="sm" onClick={() => formTriggers?.save()} className="gap-1.5 text-xs font-semibold px-3 py-1.5 shadow-sm">
                                        <Save className="size-3.5" />
                                        <span>Lưu</span>
                                    </Button>
                                </>
                            )}
                        </div>
                    }
                />
            </div>

            {/* Status Banner */}
            {report && (
                <div className="mx-6 mt-3 shrink-0 print:hidden">
                    {report.status === "đã tiếp nhận" && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-between text-xs text-blue-800 shadow-sm">
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                                <span className="font-semibold">Trạng thái: Đã tiếp nhận</span>
                            </div>
                            <span className="text-[11px] text-blue-600 font-medium">Báo cáo này đã được Sở tiếp nhận thành công.</span>
                        </div>
                    )}
                    {report.status === "đã từ chối" && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-xs text-red-800 space-y-1 shadow-sm">
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                                <span className="font-semibold">Trạng thái: Đã từ chối</span>
                            </div>
                            {report.rejectReason && (
                                <p className="text-[11px] text-red-650 font-medium">Lý do từ chối: <span className="font-semibold italic">{report.rejectReason}</span></p>
                            )}
                        </div>
                    )}
                    {report.status === "chờ tiếp nhận" && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-center justify-between text-xs text-yellow-800 shadow-sm">
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 animate-pulse" />
                                <span className="font-semibold">Trạng thái: Chờ tiếp nhận</span>
                            </div>
                            <span className="text-[11px] text-yellow-600 font-medium">Báo cáo đang chờ Sở duyệt hoặc từ chối.</span>
                        </div>
                    )}
                    {report.status === "đang báo cáo" && (
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 flex items-center justify-between text-xs text-orange-800 shadow-sm">
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-orange-400" />
                                <span className="font-semibold">Trạng thái: Đang báo cáo</span>
                            </div>
                            <span className="text-[11px] text-orange-650 font-medium">Bản báo cáo của doanh nghiệp chưa gửi đi.</span>
                        </div>
                    )}
                </div>
            )}

            <ReportForm mode="edit" report={report} businessProfile={businessProfile} existingReports={reports} onSaveSuccess={() => {}} onClose={handleFormClose} registerTriggers={setFormTriggers} />
        </main>
    );
}
