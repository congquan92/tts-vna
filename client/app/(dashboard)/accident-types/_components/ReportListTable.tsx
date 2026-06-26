"use client";

import React from "react";
import Link from "next/link";
import { Eye, ChevronLeft, ChevronRight, FileText, ChevronDown } from "lucide-react";
import type { Report } from "@/types/report";

interface ReportListTableProps {
    reports: Report[];
    loading: boolean;
    searchBusinessName: string;
    setSearchBusinessName: (val: string) => void;
    searchTaxCode: string;
    setSearchTaxCode: (val: string) => void;
    searchPeriod: string;
    setSearchPeriod: (val: string) => void;
    searchStatus: string;
    setSearchStatus: (val: string) => void;
    currentPage: number;
    setCurrentPage: (val: number) => void;
    pageSize: number;
    setPageSize: (val: number) => void;
    totalReports: number;

    // Selection props
    selectedIds: number[];
    onSelectAll: (checked: boolean) => void;
    onSelectOne: (id: number) => void;
}

const GRID_STYLE = { gridTemplateColumns: "40px 80px 2fr 1.2fr 1fr 1.2fr" };

export default function ReportListTable({
    reports,
    loading,
    searchBusinessName,
    setSearchBusinessName,
    searchTaxCode,
    setSearchTaxCode,
    searchPeriod,
    setSearchPeriod,
    searchStatus,
    setSearchStatus,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalReports,
    selectedIds,
    onSelectAll,
    onSelectOne,
}: ReportListTableProps) {
    const totalPages = Math.max(1, Math.ceil(totalReports / pageSize));
    const allSelected = reports.length > 0 && reports.every((r) => selectedIds.includes(r.id));

    return (
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm flex flex-col flex-1 min-h-0 overflow-hidden mt-3">
            {/* Table Headers */}
            <div className="shrink-0 border-b border-gray-200">
                <div className="grid gap-3 text-xs font-semibold text-gray-700 py-3 px-4 bg-[#F4F6F8]" style={GRID_STYLE}>
                    <div />
                    <div className="flex justify-center items-center">Thao tác</div>
                    <div className="flex items-center">Tên doanh nghiệp</div>
                    <div className="flex items-center">Mã số thuế</div>
                    <div className="flex items-center">Kỳ báo cáo</div>
                    <div className="flex items-center">Trạng thái</div>
                </div>

                {/* Inline search header filters */}
                <div className="grid pb-3 px-4 bg-[#F4F6F8] gap-3 items-center" style={GRID_STYLE}>
                    <div className="flex items-center justify-center">
                        <input type="checkbox" className="w-3.5 h-3.5 accent-primary cursor-pointer rounded border-gray-300" checked={allSelected} onChange={(e) => onSelectAll(e.target.checked)} />
                    </div>
                    <div />
                    <div>
                        <input
                            type="text"
                            value={searchBusinessName}
                            onChange={(e) => {
                                setSearchBusinessName(e.target.value);
                                setCurrentPage(1);
                            }}
                            placeholder="Tìm kiếm tên doanh nghiệp..."
                            className="w-full bg-white border border-gray-200 rounded px-2.5 py-1.5 text-xs outline-none focus:border-primary transition-colors font-medium text-gray-800"
                        />
                    </div>
                    <div>
                        <input
                            type="text"
                            value={searchTaxCode}
                            onChange={(e) => {
                                setSearchTaxCode(e.target.value);
                                setCurrentPage(1);
                            }}
                            placeholder="Tìm kiếm mã số thuế..."
                            className="w-full bg-white border border-gray-200 rounded px-2.5 py-1.5 text-xs outline-none focus:border-primary transition-colors font-medium text-gray-800"
                        />
                    </div>
                    <div>
                        <select
                            value={searchPeriod}
                            onChange={(e) => {
                                setSearchPeriod(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full bg-white border border-gray-200 rounded px-2 py-1.5 text-xs outline-none focus:border-primary transition-colors font-medium text-gray-800"
                        >
                            <option value="">Tất cả</option>
                            <option value="6 tháng">6 tháng</option>
                            <option value="Cả năm">Cả năm</option>
                        </select>
                    </div>
                    <div className="relative w-full">
                        <select
                            value={searchStatus}
                            onChange={(e) => {
                                setSearchStatus(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full appearance-none bg-white border border-gray-200 rounded px-2 py-1.5 pr-8 text-xs outline-none focus:border-primary transition-colors font-medium text-gray-800 cursor-pointer"
                        >
                            <option value="">Tất cả</option>
                            <option value="đang báo cáo">Đang báo cáo</option>
                            <option value="chờ tiếp nhận">Chờ tiếp nhận</option>
                            <option value="đã tiếp nhận">Đã tiếp nhận</option>
                            <option value="đã từ chối">Đã từ chối</option>
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none size-3.5" />
                    </div>
                </div>
            </div>

            {/* Table Body */}
            <div className="flex-1 overflow-y-auto min-h-0">
                {loading ? (
                    <div className="text-center py-12 text-gray-400 text-xs font-semibold">Đang tải danh sách báo cáo...</div>
                ) : (
                    <>
                        {reports.map((item) => (
                            <div key={item.id} className="grid gap-3 border-b border-gray-100 hover:bg-blue-50/20 transition-colors text-xs text-gray-700 items-center px-4 py-2.5" style={GRID_STYLE}>
                                {/* Checkbox */}
                                <div className="flex justify-center items-center">
                                    <input type="checkbox" className="w-3.5 h-3.5 accent-primary cursor-pointer rounded border-gray-300" checked={selectedIds.includes(item.id)} onChange={() => onSelectOne(item.id)} />
                                </div>

                                {/* Action View button */}
                                <div className="flex items-center justify-center">
                                    <Link href={`/accident-types/view/${item.id}`} className="text-gray-400 hover:text-primary transition-colors cursor-pointer p-1 rounded hover:bg-gray-100 flex items-center justify-center" title="Xem chi tiết">
                                        <Eye size={16} />
                                    </Link>
                                </div>

                                {/* Business details */}
                                <div className="font-semibold text-gray-800 truncate">{item.companyInfo?.business?.businessName || item.companyInfo?.businessName || "N/A"}</div>
                                <div className="font-medium text-gray-600 tabular-nums">{item.companyInfo?.business?.taxCode || "N/A"}</div>
                                <div className="font-medium text-gray-600">{item.reportPeriod || "N/A"}</div>
                                <div className="flex items-center gap-2">
                                    {item.status === "đang báo cáo" ? (
                                        <>
                                            <span className="w-2.5 h-2.5 rounded-full bg-orange-400 inline-block" />
                                            <span className="text-orange-600 font-semibold">Đang báo cáo</span>
                                        </>
                                    ) : item.status === "chờ tiếp nhận" ? (
                                        <>
                                            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 inline-block animate-pulse" />
                                            <span className="text-yellow-600 font-semibold">Chờ tiếp nhận</span>
                                        </>
                                    ) : item.status === "đã tiếp nhận" ? (
                                        <>
                                            <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" />
                                            <span className="text-green-600 font-semibold">Đã tiếp nhận</span>
                                        </>
                                    ) : item.status === "đã từ chối" ? (
                                        <div className="flex flex-col gap-0.5">
                                            <div className="flex items-center gap-2">
                                                <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
                                                <span className="text-red-600 font-semibold">Đã từ chối</span>
                                            </div>
                                            {item.rejectReason && (
                                                <span className="text-[10px] text-red-500 italic max-w-[200px] truncate" title={item.rejectReason}>
                                                    Lý do: {item.rejectReason}
                                                </span>
                                            )}
                                        </div>
                                    ) : (
                                        <>
                                            <span className="w-2.5 h-2.5 rounded-full bg-gray-400 inline-block" />
                                            <span className="text-gray-500 font-semibold">Không xác định</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}

                        {reports.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                                <FileText className="size-10 mb-2 opacity-50" />
                                <span className="text-sm font-semibold">Không tìm thấy báo cáo nào</span>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Footer Pagination */}
            <div className="shrink-0 flex items-center justify-end gap-4 px-5 py-3 border-t border-gray-200 text-xs text-gray-500 bg-white">
                <div className="flex items-center gap-1.5">
                    <select
                        value={pageSize}
                        onChange={(e) => {
                            setPageSize(Number(e.target.value));
                            setCurrentPage(1);
                        }}
                        className="border border-gray-300 rounded px-2 py-1 text-xs outline-none cursor-pointer bg-white hover:border-gray-400 transition-colors font-semibold"
                    >
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                    </select>
                </div>
                <span className="tabular-nums font-semibold">{totalReports === 0 ? "0" : `${(currentPage - 1) * pageSize + 1} - ${Math.min(currentPage * pageSize, totalReports)} of ${totalReports}`}</span>
                <div className="flex items-center gap-1">
                    <button
                        type="button"
                        disabled={currentPage <= 1}
                        onClick={() => setCurrentPage(currentPage - 1)}
                        className="w-7 h-7 flex items-center justify-center rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <button
                        type="button"
                        disabled={currentPage >= totalPages}
                        onClick={() => setCurrentPage(currentPage + 1)}
                        className="w-7 h-7 flex items-center justify-center rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}
