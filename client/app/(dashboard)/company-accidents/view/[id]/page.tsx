"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import TopHero from "@/components/TopHero";
import { BusinessApi } from "@/api/business";
import { ReportApi } from "@/api/report";
import type { Report } from "@/types/report";
import { ChevronRight, Printer } from "lucide-react";
import ReportForm from "../../_components/ReportForm";
import Button from "@/components/ui/Button";

export default function ViewReportPage() {
    const router = useRouter();
    const params = useParams();
    const reportId = params?.id ? Number(params.id) : null;

    const { user } = useAuth();
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

    // Fetch report by ID
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

    const handleFormClose = () => {
        router.push("/company-accidents");
    };

    const isOverview = formTriggers?.selectedSection === "Xem tổng quan báo cáo tai nạn lao động";

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

    return (
        <main className="h-screen flex flex-col py-2">
            <div className="shrink-0 print:hidden">
                <TopHero
                    lable="Báo cáo định kỳ Tai nạn lao động"
                    component={
                        <div className="flex gap-2 items-center">
                            {/* Year display */}
                            <input
                                type="number"
                                value={formTriggers?.year ?? new Date().getFullYear()}
                                disabled={true}
                                className="w-16 border border-gray-200 rounded-lg px-2 py-1 text-xs text-center font-semibold outline-none focus:border-primary bg-gray-100 cursor-not-allowed"
                            />

                            <Button variant="outline" size="sm" onClick={() => formTriggers?.cancel()} className="border-none bg-transparent hover:bg-gray-100 text-gray-500 hover:text-gray-700 text-xs font-semibold px-3 py-1.5">
                                Trở về
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

            <ReportForm mode="view" report={report} businessProfile={businessProfile} existingReports={[]} onSaveSuccess={() => {}} onClose={handleFormClose} registerTriggers={setFormTriggers} />
        </main>
    );
}
