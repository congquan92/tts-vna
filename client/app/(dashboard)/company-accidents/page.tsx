"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import TopHero from "@/components/TopHero";
import Button from "@/components/ui/Button";
import { useAuth } from "@/contexts/AuthContext";
import { ReportApi } from "@/api/report";
import { BusinessApi } from "@/api/business";
import type { Report } from "@/types/report";
import { toast } from "sonner";
import { ChevronDown } from "lucide-react";
import ReportTable from "./_components/ReportTable";

export default function CompanyAccidentsPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalReports, setTotalReports] = useState(0);

    // Business profile pre-populated state
    const [businessProfile, setBusinessProfile] = useState<{
        name: string;
        taxCode: string;
    } | null>(null);

    // Fetch logged-in business profile details
    useEffect(() => {
        const fetchBusiness = async () => {
            if (user?.profileId) {
                try {
                    const data = await BusinessApi.getById(user.profileId);
                    setBusinessProfile({
                        name: data.businessName || "",
                        taxCode: data.taxCode || "",
                    });
                } catch (e) {
                    console.error("Failed to load business profile details", e);
                }
            }
        };
        fetchBusiness();
    }, [user]);

    // Fetch reports listing
    const fetchReports = useCallback(async () => {
        setLoading(true);
        try {
            const res = await ReportApi.getAll(currentPage, pageSize, selectedYear);
            setReports(res.data || []);
            setTotalReports(res.total || 0);
        } catch (error) {
            console.error("Error fetching reports", error);
            toast.error("Không thể tải danh sách báo cáo");
        } finally {
            setLoading(false);
        }
    }, [currentPage, pageSize, selectedYear]);

    useEffect(() => {
        Promise.resolve().then(() => {
            fetchReports();
        });
    }, [fetchReports]);



    const openEdit = (report: Report) => {
        router.push(`/company-accidents/edit/${report.id}`);
    };

    const openView = (report: Report) => {
        router.push(`/company-accidents/view/${report.id}`);
    };

    return (
        <main className="h-screen flex flex-col py-2">
            <div className="shrink-0">
                <TopHero
                    lable="Báo cáo định kỳ Tai nạn lao động"
                    component={
                        <div className="flex gap-2 items-center">
                            {/* Year Select Filter */}
                            <div className="relative">
                                <select
                                    value={selectedYear}
                                    onChange={(e) => {
                                        setSelectedYear(Number(e.target.value));
                                        setCurrentPage(1);
                                    }}
                                    className="appearance-none bg-white border border-gray-200 rounded-lg px-3 py-1.5 pr-8 text-xs font-semibold outline-none focus:border-primary cursor-pointer bg-no-repeat"
                                >
                                    {[2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027].map((y) => (
                                        <option key={y} value={y}>
                                            {y}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none size-3.5" />
                            </div>
                        </div>
                    }
                />
            </div>

            <ReportTable
                reports={reports}
                loading={loading}
                selectedYear={selectedYear}
                businessProfile={businessProfile}
                currentPage={currentPage}
                pageSize={pageSize}
                totalReports={totalReports}
                onPageChange={setCurrentPage}
                onPageSizeChange={(size) => {
                    setPageSize(size);
                    setCurrentPage(1);
                }}
                onView={openView}
                onEdit={openEdit}
            />
        </main>
    );
}
