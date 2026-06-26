"use client";

import Button from "@/components/ui/Button";
import { X } from "lucide-react";

interface BulkSelectionBannerProps {
    selectedCount: number;
    processing: boolean;
    onReject: () => void;
    onApprove: () => void;
    onClear: () => void;
}

export default function BulkSelectionBanner({ selectedCount, processing, onReject, onApprove, onClear }: BulkSelectionBannerProps) {
    if (selectedCount === 0) return null;

    return (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-white border border-gray-150 shadow-2xl rounded-sm px-6 py-4 flex items-center gap-6 z-999 animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center gap-2">
                <span className="flex items-center justify-center bg-blue-50 text-blue-600 rounded-full w-5 h-5 text-xs font-bold">{selectedCount}</span>
                <span className="text-xs font-semibold text-gray-600">báo cáo được chọn</span>
            </div>

            <div className="h-4 w-px bg-gray-200" />

            <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled={processing} onClick={onReject} className="border-red-200 text-red-655 hover:bg-red-50 text-xs font-bold px-4 py-2">
                    Từ chối báo cáo
                </Button>
                <Button variant="primary" size="sm" disabled={processing} onClick={onApprove} className="text-xs font-bold px-4 py-2 shadow-sm bg-green-600 hover:bg-green-700 border-green-600">
                    Tiếp nhận báo cáo
                </Button>
            </div>

            <button type="button" onClick={onClear} className="text-xs font-semibold text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
                <X />
            </button>
        </div>
    );
}
