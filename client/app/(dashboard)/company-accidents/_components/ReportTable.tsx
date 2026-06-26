"use client";

import React from "react";
import { Eye, Pencil, Plus, FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Report } from "@/types/report";

const GRID_STYLE = { gridTemplateColumns: "120px 2fr 1.2fr 1fr 1.2fr" };

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

export default function ReportTable({ reports, loading, selectedYear, businessProfile, onView, onEdit }: ReportTableProps) {
    const router = useRouter();

    const tableRows = React.useMemo(() => {
        const periods = ["6 tháng", "Cả năm"];
        return periods.map((period) => {
            const existing = reports.find((r) => r.reportPeriod === period && r.year === selectedYear);
            if (existing) return existing;

            return {
                id: period === "6 tháng" ? -6 : -12,
                status: "chờ báo cáo",
                year: selectedYear,
                reportPeriod: period,
                companyInfo: {
                    businessName: businessProfile?.name || "N/A",
                },
            } as any as Report;
        });
    }, [reports, selectedYear, businessProfile]);

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
                        {tableRows.map((item) => {
                            const isPlaceholder = item.id < 0;
                            return (
                                <div key={item.id} className="grid gap-3 border-b border-gray-100 hover:bg-blue-50/20 transition-colors text-xs text-gray-700 items-center px-4 py-3" style={GRID_STYLE}>
                                    <div className="flex items-center justify-center gap-3">
                                        {/* 1. View icon */}
                                        {isPlaceholder ? (
                                            <button type="button" className="text-gray-200 cursor-not-allowed" title="Báo cáo chưa được khai báo" disabled>
                                                <Eye size={16} />
                                            </button>
                                        ) : (
                                            <button type="button" onClick={() => onView(item)} className="text-gray-400 hover:text-primary transition-colors cursor-pointer" title="Xem chi tiết">
                                                <Eye size={16} />
                                            </button>
                                        )}

                                        {/* Edit / Declare icon */}
                                        {isPlaceholder ? (
                                            <button
                                                type="button"
                                                onClick={() => router.push(`/company-accidents/create?year=${selectedYear}&period=${item.reportPeriod}`)}
                                                className="text-gray-400 hover:text-primary transition-colors cursor-pointer"
                                                title="Khai báo mới"
                                            >
                                                <Pencil size={16} />
                                            </button>
                                        ) : (item.status === "đang báo cáo" || item.status === "đã từ chối") ? (
                                            <button type="button" onClick={() => onEdit(item)} className="text-gray-400 hover:text-primary transition-colors cursor-pointer" title="Chỉnh sửa">
                                                <Pencil size={16} />
                                            </button>
                                        ) : (
                                            <button type="button" className="text-gray-200 cursor-not-allowed" title="Báo cáo đã gửi không thể chỉnh sửa" disabled>
                                                <Pencil size={16} />
                                            </button>
                                        )}
                                    </div>

                                    <div className="font-semibold text-gray-800 truncate">{item.companyInfo?.businessName || businessProfile?.name || "N/A"}</div>
                                    <div className="font-medium text-gray-650 tabular-nums">{businessProfile?.taxCode || "N/A"}</div>
                                    <div className="font-medium text-gray-650">{item.reportPeriod || "N/A"}</div>
                                    <div className="flex items-center gap-2">
                                        {item.status === "đang báo cáo" ? (
                                            <>
                                                <span className="w-2.5 h-2.5 rounded-full bg-orange-400 inline-block" />
                                                <span className="text-orange-600 font-semibold">Đang báo cáo</span>
                                            </>
                                        ) : item.status === "chờ tiếp nhận" ? (
                                            <>
                                                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 inline-block" />
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
                                                {(item as any).rejectReason && (
                                                    <span className="text-[10px] text-red-500 italic max-w-[200px] truncate" title={(item as any).rejectReason}>
                                                        Lý do: {(item as any).rejectReason}
                                                    </span>
                                                )}
                                            </div>
                                        ) : (
                                            <>
                                                <span className="w-2.5 h-2.5 rounded-full bg-gray-400 inline-block" />
                                                <span className="text-gray-500 font-semibold">Chờ báo cáo</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </>
                )}
            </div>
        </div>
    );
}
