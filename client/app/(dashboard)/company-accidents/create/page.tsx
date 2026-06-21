"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import TopHero from "@/components/TopHero";
import { BusinessApi } from "@/api/business";
import { ReportApi } from "@/api/report";
import type { Report } from "@/types/report";
import { ChevronRight, Save, Printer, Send } from "lucide-react";
import ReportForm from "../_components/ReportForm";
import Button from "@/components/ui/Button";

export default function CreateReportPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [reports, setReports] = useState<Report[]>([]);

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

    // Fetch reports to pass for duplicate validation
    useEffect(() => {
        const fetchReports = async () => {
            try {
                const res = await ReportApi.getAll(1, 100);
                setReports(res.data || []);
            } catch (error) {
                console.error("Error fetching reports", error);
            }
        };
        fetchReports();
    }, []);

    const handleFormClose = useCallback(() => {
        router.push("/company-accidents");
    }, [router]);

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
                                value={formTriggers?.year ?? new Date().getFullYear()}
                                onChange={(e) => formTriggers?.setYear(Number(e.target.value))}
                                className="w-16 border border-gray-200 rounded-lg px-2 py-1 text-xs text-center font-semibold outline-none focus:border-primary"
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

            <ReportForm mode="create" report={null} businessProfile={businessProfile} existingReports={reports} onSaveSuccess={() => {}} onClose={handleFormClose} registerTriggers={setFormTriggers} />
        </main>
    );
}
