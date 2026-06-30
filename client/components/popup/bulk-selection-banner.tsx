"use client";

import Button from "@/components/ui/Button";
import { X, RotateCcw, Check, CheckCheck } from "lucide-react";

interface BulkSelectionBannerProps {
    selectedCount: number;
    processing: boolean;
    canApprove?: boolean;
    canReject?: boolean;
    onReject: () => void;
    onApprove: () => void;
    onClear: () => void;
}

export default function BulkSelectionBanner({ selectedCount, processing, canApprove = true, canReject = true, onReject, onApprove, onClear }: BulkSelectionBannerProps) {
    if (selectedCount === 0) return null;

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white rounded-lg shadow-xl border border-gray-100 flex items-center h-12 overflow-hidden z-[9999] transition-all duration-300 animate-in slide-in-from-bottom duration-300">
            {/* Count Block */}
            <div className="bg-blue-600 text-white font-bold px-4 h-full flex items-center justify-center min-w-[40px] text-sm select-none">{selectedCount}</div>

            {/* Label */}
            <div className="px-4 text-xs font-semibold text-gray-700 select-none whitespace-nowrap">dữ liệu được chọn</div>

            {/* Actions & Close */}
            <div className="pr-3 pl-1 flex items-center gap-2">
                <Button
                    type="button"
                    variant="outline"
                    disabled={processing || !canReject}
                    onClick={onReject}
                    className="h-8 border rounded-lg px-3 flex items-center gap-1.5 text-xs font-bold transition-all duration-200
        border-blue-600 text-blue-600 hover:bg-blue-50
        disabled:border-gray-300 disabled:text-gray-300 disabled:hover:bg-transparent disabled:cursor-not-allowed disabled:opacity-40"
                >
                    <RotateCcw className="size-4" />
                    Từ chối
                </Button>

                <Button
                    type="button"
                    disabled={processing || !canApprove}
                    onClick={onApprove}
                    className="h-8 rounded-lg px-3 flex items-center gap-1.5 text-xs font-bold transition-all duration-200
        bg-blue-600 hover:bg-blue-700 text-white
        disabled:bg-gray-300 disabled:text-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                    <CheckCheck className="size-4" />
                    Tiếp nhận
                </Button>

                <Button type="button" variant="outline" onClick={onClear} className="text-gray-400 hover:text-gray-600 transition-colors p-1 cursor-pointer border-none">
                    <X className="size-4" />
                </Button>
            </div>
        </div>
    );
}
