"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ChevronDown } from "lucide-react";
import TopHero from "@/components/TopHero";
import Button from "@/components/ui/Button";
import { ReportApi } from "@/api/report";
import type { Report } from "@/types/report";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import ReportListTable from "./_components/ReportListTable";
import ReportFilterBar, { Province } from "./_components/ReportFilterBar";
import BulkSelectionBanner from "@/components/popup/bulk-selection-banner";
import RejectReasonPopup from "@/components/popup/reject-reason-popup";

export default function AccidentTypesPage() {
    const router = useRouter();

    // List state
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedYear, setSelectedYear] = useState<number | "">("");
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    // Rejection modal & processing state
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [processing, setProcessing] = useState(false);

    // Location dropdown lists & selections
    const [provinces, setProvinces] = useState<Province[]>([]);
    const [selectedProvince, setSelectedProvince] = useState<string>("Tất cả");
    const [selectedWard, setSelectedWard] = useState<string>("Tất cả");

    // Inline table search inputs
    const [searchBusinessName, setSearchBusinessName] = useState("");
    const [searchTaxCode, setSearchTaxCode] = useState("");
    const [searchPeriod, setSearchPeriod] = useState("");
    const [searchStatus, setSearchStatus] = useState("");

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalReports, setTotalReports] = useState(0);

    // Fetch address list
    useEffect(() => {
        const fetchAddressData = async () => {
            try {
                const res = await fetch("/address.json");
                const data = await res.json();
                setProvinces(data || []);
            } catch (error) {
                console.error("Failed to load address.json", error);
            }
        };
        fetchAddressData();
    }, []);

    // Get wards list for selected province
    const activeWards = React.useMemo(() => {
        const prov = provinces.find((p) => p.name === selectedProvince || p.short_name === selectedProvince);
        return prov ? prov.wards : [];
    }, [provinces, selectedProvince]);

    // Fetch reports based on page, size, filters
    const fetchReports = useCallback(async () => {
        setLoading(true);
        try {
            const provParam = selectedProvince && selectedProvince !== "Tất cả" ? selectedProvince : undefined;
            const wardParam = selectedWard && selectedWard !== "Tất cả" ? selectedWard : undefined;

            const res = await ReportApi.getAll(currentPage, pageSize, selectedYear || undefined, searchStatus || undefined, searchBusinessName || undefined, searchTaxCode || undefined, provParam, wardParam);

            // Filter additionally by period locally if required, since NestJS doesn't filter period in the database.
            let list = res.data || [];
            if (searchPeriod) {
                list = list.filter((r) => r.reportPeriod === searchPeriod);
            }

            setReports(list);
            setTotalReports(res.total || 0);
        } catch (error) {
            console.error("Error fetching reports", error);
            toast.error("Không thể tải danh sách báo cáo");
        } finally {
            setLoading(false);
        }
    }, [currentPage, pageSize, selectedYear, searchStatus, searchBusinessName, searchTaxCode, selectedProvince, selectedWard, searchPeriod]);

    // Trigger report list loading
    useEffect(() => {
        let isMounted = true;
        Promise.resolve().then(() => {
            if (isMounted) {
                fetchReports();
            }
        });
        return () => {
            isMounted = false;
        };
    }, [fetchReports]);

    // Explicit Action Handlers to update states and reset selection/pagination properly
    const handleProvinceChange = (prov: string) => {
        setSelectedProvince(prov);
        setSelectedWard("Tất cả");
        setSelectedIds([]);
        setCurrentPage(1);
    };

    const handleWardChange = (ward: string) => {
        setSelectedWard(ward);
        setSelectedIds([]);
        setCurrentPage(1);
    };

    const handleYearChange = (year: number | "") => {
        setSelectedYear(year);
        setSelectedIds([]);
        setCurrentPage(1);
    };

    const handleSearchBusinessNameChange = (name: string) => {
        setSearchBusinessName(name);
        setSelectedIds([]);
        setCurrentPage(1);
    };

    const handleSearchTaxCodeChange = (taxCode: string) => {
        setSearchTaxCode(taxCode);
        setSelectedIds([]);
        setCurrentPage(1);
    };

    const handleSearchPeriodChange = (period: string) => {
        setSearchPeriod(period);
        setSelectedIds([]);
        setCurrentPage(1);
    };

    const handleSearchStatusChange = (status: string) => {
        setSearchStatus(status);
        setSelectedIds([]);
        setCurrentPage(1);
    };

    const handlePageSizeChange = (size: number) => {
        setPageSize(size);
        setSelectedIds([]);
        setCurrentPage(1);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        setSelectedIds([]);
    };

    const handleSelectAll = (checked: boolean) => {
        setSelectedIds(checked ? reports.map((r) => r.id) : []);
    };

    const handleSelectOne = (id: number) => {
        setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    };

    const handleApproveSelected = async () => {
        if (selectedIds.length === 0) return;

        const pendingSelected = reports.filter((r) => selectedIds.includes(r.id) && r.status === "chờ tiếp nhận");
        if (pendingSelected.length === 0) {
            toast.error("Không có báo cáo nào ở trạng thái 'Chờ tiếp nhận' được chọn!");
            return;
        }

        const confirmApprove = window.confirm(`Bạn có chắc chắn muốn TIẾP NHẬN ${pendingSelected.length} báo cáo đã chọn?`);
        if (!confirmApprove) return;

        setProcessing(true);
        let successCount = 0;
        let failCount = 0;
        for (const rep of pendingSelected) {
            try {
                await ReportApi.approve(rep.id);
                successCount++;
            } catch (error) {
                console.error(`Failed to approve report ${rep.id}:`, error);
                failCount++;
            }
        }

        if (successCount > 0) {
            toast.success(`Đã tiếp nhận thành công ${successCount} báo cáo`);
        }
        if (failCount > 0) {
            toast.error(`Tiếp nhận thất bại ${failCount} báo cáo`);
        }

        setSelectedIds([]);
        fetchReports();
        setProcessing(false);
    };

    const handleRejectSelectedSubmit = async (reason: string) => {
        if (selectedIds.length === 0 || !reason.trim()) {
            toast.error("Vui lòng nhập lý do từ chối");
            return;
        }

        const pendingSelected = reports.filter((r) => selectedIds.includes(r.id) && r.status === "chờ tiếp nhận");
        if (pendingSelected.length === 0) {
            toast.error("Không có báo cáo nào ở trạng thái 'Chờ tiếp nhận' được chọn!");
            return;
        }

        setProcessing(true);
        let successCount = 0;
        let failCount = 0;
        for (const rep of pendingSelected) {
            try {
                await ReportApi.reject(rep.id, reason);
                successCount++;
            } catch (error) {
                console.error(`Failed to reject report ${rep.id}:`, error);
                failCount++;
            }
        }

        if (successCount > 0) {
            toast.success(`Đã từ chối thành công ${successCount} báo cáo`);
        }
        if (failCount > 0) {
            toast.error(`Từ chối thất bại ${failCount} báo cáo`);
        }

        setShowRejectModal(false);
        setSelectedIds([]);
        fetchReports();
        setProcessing(false);
    };

    const handleViewSummaryReport = () => {
        const params = new URLSearchParams();
        if (selectedYear) params.append("year", selectedYear.toString());
        if (selectedProvince && selectedProvince !== "Tất cả") params.append("province", selectedProvince);
        if (selectedWard && selectedWard !== "Tất cả") params.append("ward", selectedWard);
        if (searchPeriod) params.append("period", searchPeriod);

        router.push(`/accident-types/summary?${params.toString()}`);
    };

    return (
        <main className="h-screen flex flex-col py-2">
            {/* Top title & search filters */}
            <div className="shrink-0">
                <TopHero
                    lable="Báo cáo định kỳ Tai nạn lao động"
                    component={
                        <div className="flex gap-2 items-center">
                            {/* Year Select Filter */}
                            <div className="relative">
                                <select
                                    value={selectedYear}
                                    onChange={(e) => handleYearChange(e.target.value === "" ? "" : Number(e.target.value))}
                                    className="appearance-none bg-white border border-gray-200 rounded-lg px-3 py-1.5 pr-8 text-xs font-semibold outline-none focus:border-primary cursor-pointer bg-no-repeat"
                                >
                                    <option value="">Tất cả các năm</option>
                                    {[2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027].map((y) => (
                                        <option key={y} value={y}>
                                            {y}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none size-3.5" />
                            </div>

                            <Button variant="outline" size="sm" onClick={handleViewSummaryReport} className="flex items-center gap-2 text-xs font-semibold">
                                <span>Báo cáo tổng hợp</span>
                            </Button>
                        </div>
                    }
                />
            </div>

            {/* Region select boxes */}
            <ReportFilterBar selectedProvince={selectedProvince} setSelectedProvince={handleProvinceChange} selectedWard={selectedWard} setSelectedWard={handleWardChange} provinces={provinces} activeWards={activeWards} />

            {/* Reports table */}
            <ReportListTable
                reports={reports}
                loading={loading}
                searchBusinessName={searchBusinessName}
                setSearchBusinessName={handleSearchBusinessNameChange}
                searchTaxCode={searchTaxCode}
                setSearchTaxCode={handleSearchTaxCodeChange}
                searchPeriod={searchPeriod}
                setSearchPeriod={handleSearchPeriodChange}
                searchStatus={searchStatus}
                setSearchStatus={handleSearchStatusChange}
                currentPage={currentPage}
                setCurrentPage={handlePageChange}
                pageSize={pageSize}
                setPageSize={handlePageSizeChange}
                totalReports={totalReports}
                selectedIds={selectedIds}
                onSelectAll={handleSelectAll}
                onSelectOne={handleSelectOne}
            />

            <BulkSelectionBanner
                selectedCount={selectedIds.length}
                processing={processing}
                onReject={() => {
                    const pendingSelected = reports.filter((r) => selectedIds.includes(r.id) && r.status === "chờ tiếp nhận");
                    if (pendingSelected.length === 0) {
                        toast.error("Không có báo cáo nào ở trạng thái 'Chờ tiếp nhận' được chọn!");
                        return;
                    }
                    setShowRejectModal(true);
                }}
                onApprove={handleApproveSelected}
                onClear={() => setSelectedIds([])}
            />

            <RejectReasonPopup isOpen={showRejectModal} onClose={() => setShowRejectModal(false)} onSubmit={handleRejectSelectedSubmit} processing={processing} />
        </main>
    );
}
