"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ChevronDown } from "lucide-react";
import TopHero from "@/components/TopHero";
import Button from "@/components/ui/Button";
import DeleteSelectionBanner from "@/components/DeleteSelectionBanner";
import { ReportApi } from "@/api/report";
import type { Report } from "@/types/report";
import { toast } from "sonner";

import ReportDetailView from "./_components/ReportDetailView";
import ReportListTable from "./_components/ReportListTable";
import ReportFilterBar, { Province } from "./_components/ReportFilterBar";

export default function AccidentTypesPage() {
    // List state
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedYear, setSelectedYear] = useState<number>(2022); // Default to 2022 as in Image 1
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    // Location dropdown lists & selections
    const [provinces, setProvinces] = useState<Province[]>([]);
    const [selectedProvince, setSelectedProvince] = useState<string>("Thành phố Hồ Chí Minh"); // Default to Hồ Chí Minh
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

    // Summary report state
    const [viewingSummaryReport, setViewingSummaryReport] = useState<Report | null>(null);



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

            const res = await ReportApi.getAll(
                currentPage,
                pageSize,
                selectedYear,
                searchStatus || undefined,
                searchBusinessName || undefined,
                searchTaxCode || undefined,
                provParam,
                wardParam
            );

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

    const handleYearChange = (year: number) => {
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

    const handleDeleteSelected = async () => {
        if (selectedIds.length === 0) return;
        const confirmDelete = window.confirm(`Bạn có chắc chắn muốn xóa ${selectedIds.length} báo cáo tai nạn lao động đã chọn?`);
        if (!confirmDelete) return;

        let successCount = 0;
        let failCount = 0;
        for (const id of selectedIds) {
            try {
                await ReportApi.delete(id);
                successCount++;
            } catch {
                failCount++;
            }
        }

        if (successCount > 0) {
            toast.success(`Đã xóa thành công ${successCount} báo cáo`);
        }
        if (failCount > 0) {
            toast.error(`Không thể xóa ${failCount} báo cáo`);
        }

        setSelectedIds([]);
        fetchReports();
    };

    const handleViewSummaryReport = async () => {
        setLoading(true);
        try {
            const provParam = selectedProvince && selectedProvince !== "Tất cả" ? selectedProvince : undefined;
            const wardParam = selectedWard && selectedWard !== "Tất cả" ? selectedWard : undefined;

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
            if (searchPeriod) {
                list = list.filter((r) => r.reportPeriod === searchPeriod);
            }

            if (list.length === 0) {
                toast.info("Không có báo cáo nào ở trạng thái 'Đã tiếp nhận' để tổng hợp.");
                return;
            }

            const aggregated: Report = {
                id: 0,
                status: "đã tiếp nhận",
                year: selectedYear,
                reportPeriod: searchPeriod || "Tổng hợp",
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

            setViewingSummaryReport(aggregated);
        } catch (e) {
            console.error("Failed to compile summary report", e);
            toast.error("Không thể tải dữ liệu để tổng hợp báo cáo.");
        } finally {
            setLoading(false);
        }
    };

    if (viewingSummaryReport) {
        return <ReportDetailView report={viewingSummaryReport} onBack={() => setViewingSummaryReport(null)} />;
    }

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
                                    onChange={(e) => handleYearChange(Number(e.target.value))}
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

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleViewSummaryReport}
                                className="flex items-center gap-2 text-xs font-semibold"
                            >
                                <span>Báo cáo tổng hợp</span>
                            </Button>
                        </div>
                    }
                />
            </div>

            {/* Region select boxes */}
            <ReportFilterBar
                selectedProvince={selectedProvince}
                setSelectedProvince={handleProvinceChange}
                selectedWard={selectedWard}
                setSelectedWard={handleWardChange}
                provinces={provinces}
                activeWards={activeWards}
            />

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

            {/* Bulk Selection delete banner */}
            <DeleteSelectionBanner
                selectedCount={selectedIds.length}
                onDelete={handleDeleteSelected}
                onClear={() => setSelectedIds([])}
            />
        </main>
    );
}
