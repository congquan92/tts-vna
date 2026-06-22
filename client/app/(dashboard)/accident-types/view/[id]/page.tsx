"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ReportApi } from "@/api/report";
import type { Report } from "@/types/report";
import ReportDetailView from "../../_components/ReportDetailView";

export default function ViewReportPage() {
    const router = useRouter();
    const params = useParams();
    const reportId = params?.id ? Number(params.id) : null;

    const [report, setReport] = useState<Report | null>(null);
    const [loading, setLoading] = useState(true);

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

    const handleBack = () => {
        router.push("/accident-types");
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
                <button
                    onClick={handleBack}
                    className="px-4 py-2 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary-hover transition-colors"
                >
                    Trở về
                </button>
            </div>
        );
    }

    return <ReportDetailView report={report} onBack={handleBack} />;
}
