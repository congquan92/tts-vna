"use client";

import React from "react";
import { Eye, Pencil, ChevronLeft, ChevronRight, FileText } from "lucide-react";
import type { Report } from "@/types/report";
import Button from "@/components/ui/Button";

const GRID_STYLE = { gridTemplateColumns: "100px 2fr 1.2fr 1fr 1.2fr" };

interface ReportTableProps {
    reports: Report[];
    loading: boolean;
    selectedYear: number;
    businessProfile: { name: string; taxCode: string } | null;
    currentPage: number;
    pageSize: number;
    totalReports: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (pageSize: number) => void;
    onView: (report: Report) => void;
    onEdit: (report: Report) => void;
}

export default function ReportTable({ reports, loading, selectedYear, businessProfile, currentPage, pageSize, totalReports, onPageChange, onPageSizeChange, onView, onEdit }: ReportTableProps) {
    const totalPages = Math.max(1, Math.ceil(totalReports / pageSize));

    return (
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm flex flex-col flex-1 min-h-0 overflow-hidden mt-2">
            {/* Table Header */}
            <div className="shrink-0 border-b border-gray-200">
                <div className="grid gap-3 text-xs font-semibold text-gray-700 py-3 px-4 bg-[#F4F6F8]" style={GRID_STYLE}>
                    <div className="flex justify-center">Thao tác</div>
                    <div>Tên doanh nghiệp</div>
                    <div>Mã số thuế</div>
                    <div>Kỳ báo cáo</div>
                    <div>Trạng thái</div>
                </div>
            </div>

            {/* Table Body */}
            <div className="flex-1 overflow-y-auto min-h-0">
                {loading ? (
                    <div className="text-center py-10 text-gray-500 text-sm">Đang tải...</div>
                ) : (
                    <>
                        {reports.map((item) => (
                            <div key={item.id} className="grid gap-3 border-b border-gray-100 hover:bg-blue-50/20 transition-colors text-xs text-gray-700 items-center px-4 py-3" style={GRID_STYLE}>
                                <div className="flex items-center justify-center gap-3">
                                    <button type="button" onClick={() => onView(item)} className="text-gray-400 hover:text-primary transition-colors cursor-pointer" title="Xem chi tiết">
                                        <Eye size={16} />
                                    </button>

                                    {item.status === "đang báo cáo" ? (
                                        <button type="button" onClick={() => onEdit(item)} className="text-gray-400 hover:text-primary transition-colors cursor-pointer" title="Chỉnh sửa">
                                            <Pencil size={16} />
                                        </button>
                                    ) : (
                                        <div className="w-4" /> // Placeholder to keep spacing
                                    )}
                                </div>

                                <div className="font-semibold text-gray-800 truncate">{item.companyInfo?.businessName || businessProfile?.name || "N/A"}</div>
                                <div className="font-medium text-gray-650 tabular-nums">{item.companyInfo?.businessName ? (item.companyInfo.businessId ? businessProfile?.taxCode : "") : businessProfile?.taxCode || "N/A"}</div>
                                <div className="font-medium text-gray-650">{item.reportPeriod || "N/A"}</div>
                                <div className="flex items-center gap-2">
                                    {item.status === "đang báo cáo" ? (
                                        <>
                                            <span className="w-2.5 h-2.5 rounded-full bg-gray-400 inline-block" />
                                            <span className="text-gray-500 font-semibold">Đang báo cáo</span>
                                        </>
                                    ) : (
                                        <>
                                            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
                                            <span className="text-blue-600 font-semibold">Đã tiếp nhận</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                        {reports.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                                <FileText className="size-10 mb-2 opacity-50" />
                                <span className="text-sm font-semibold">Không tìm thấy báo cáo nào trong năm {selectedYear}</span>
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
                            onPageSizeChange(Number(e.target.value));
                        }}
                        className="border border-gray-300 rounded px-2 py-1 text-xs outline-none cursor-pointer bg-white hover:border-gray-400 transition-colors font-semibold"
                    >
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                    </select>
                </div>
                <span className="tabular-nums font-semibold">
                    {totalReports === 0 ? "0" : `${(currentPage - 1) * pageSize + 1} - ${Math.min(currentPage * pageSize, totalReports)}`} of {totalReports}
                </span>
                <div className="flex items-center gap-1">
                    <button
                        type="button"
                        disabled={currentPage <= 1}
                        onClick={() => onPageChange(currentPage - 1)}
                        className="w-7 h-7 flex items-center justify-center rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <button
                        type="button"
                        disabled={currentPage >= totalPages}
                        onClick={() => onPageChange(currentPage + 1)}
                        className="w-7 h-7 flex items-center justify-center rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}
