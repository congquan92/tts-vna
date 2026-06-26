"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { ReportApi } from "@/api/report";
import type { ReportHistory } from "@/types/report";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface ProcessingHistoryPopupProps {
    isOpen: boolean;
    onClose: () => void;
    reportId: number | null;
}

export default function ProcessingHistoryPopup({ isOpen, onClose, reportId }: ProcessingHistoryPopupProps) {
    const { user } = useAuth();
    const [histories, setHistories] = useState<ReportHistory[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && reportId && reportId > 0) {
            const fetchHistory = async () => {
                setLoading(true);
                try {
                    const data = await ReportApi.getHistory(reportId);
                    setHistories(data || []);
                } catch (err) {
                    console.error("Failed to fetch report history", err);
                    toast.error("Không thể tải tiến độ xử lý");
                } finally {
                    setLoading(false);
                }
            };
            fetchHistory();
        }
        return () => {
            setHistories([]);
        };
    }, [isOpen, reportId]);

    if (!isOpen) return null;

    const formatDateTime = (dateStr: string) => {
        try {
            const date = new Date(dateStr);
            const day = String(date.getDate()).padStart(2, "0");
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const year = date.getFullYear();
            const hours = String(date.getHours()).padStart(2, "0");
            const minutes = String(date.getMinutes()).padStart(2, "0");
            return `${day}/${month}/${year} ${hours}:${minutes}`;
        } catch {
            return dateStr;
        }
    };

    const getDisplayName = (item: ReportHistory) => {
        if (user?.orgType === "DOANH_NGHIEP") {
            if (item.actorType === "DOANH_NGHIEP") {
                return "Bạn";
            }
            if (item.actorType === "SO") {
                return "Sở";
            }
        }
        return item.actorName;
    };

    const getActionText = (status: string, actorType: string) => {
        if (status === "đang báo cáo") {
            return actorType === "SO" ? "đã mở lại báo cáo" : "đã lập báo cáo";
        }
        if (status === "chờ tiếp nhận") {
            return "đã gửi báo cáo";
        }
        if (status === "đã tiếp nhận") {
            return actorType === "SO" && user?.orgType === "DOANH_NGHIEP" ? "đã duyệt báo cáo" : "đã tiếp nhận báo cáo";
        }
        if (status === "đã từ chối") {
            return actorType === "SO" && user?.orgType === "DOANH_NGHIEP" ? "đã từ chối báo cáo" : "từ chối báo cáo";
        }
        return `đã chuyển trạng thái sang ${status}`;
    };

    return (
        <div className="fixed inset-0 bg-black/40  z-9999 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-120 overflow-hidden animate-in fade-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
                {/* Header bar */}
                <div className="bg-blue-600 px-6 py-4 relative">
                    <h1 className="text-white text-base font-bold text-center">Tiến độ xử lý</h1>
                    <button type="button" onClick={onClose} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white transition-colors cursor-pointer p-1">
                        <X size={18} />
                    </button>
                </div>

                {/* Content */}
                <div className="px-6 py-6 bg-white max-h-100 overflow-y-auto">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-10 space-y-2">
                            <span className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                            <span className="text-xs text-gray-500 font-semibold">Đang tải tiến độ...</span>
                        </div>
                    ) : histories.length === 0 ? (
                        <div className="text-center py-10 text-xs text-gray-500 font-semibold select-none">Chưa có thông tin tiến độ xử lý</div>
                    ) : (
                        <div className="space-y-0 pl-1">
                            {histories.map((item, index) => {
                                const isLast = index === histories.length - 1;
                                return (
                                    <div key={item.id} className="relative flex gap-4 pb-6 last:pb-2">
                                        {/* Line & Circle */}
                                        <div className="flex flex-col items-center shrink-0 relative">
                                            <div className="w-3.5 h-3.5 rounded-full border border-gray-300 bg-white z-10 shrink-0 mt-1" />
                                            {!isLast && <div className="absolute top-4 bottom-0 w-px bg-gray-200" />}
                                        </div>

                                        {/* Text Content */}
                                        <div className="flex-1 min-w-0">
                                            {/* Date time */}
                                            <p className="text-xs text-gray-400 font-semibold mb-0.5">{formatDateTime(item.createdAt)}</p>
                                            {/* Actor & Action */}
                                            <p className="text-sm text-gray-800">
                                                <span className="font-bold text-gray-900">{getDisplayName(item)}</span> <span className="text-gray-500">{getActionText(item.status, item.actorType)}</span>
                                            </p>
                                            {/* Rejection Reason */}
                                            {item.status === "đã từ chối" && item.reason && (
                                                <p className="text-sm mt-1">
                                                    <span className="text-red-500 font-semibold">Lý do:</span> <span className="text-gray-700 font-medium">{item.reason}</span>
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
