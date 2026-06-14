import React from "react";
import { Trash2, X } from "lucide-react";

interface SelectionBannerProps {
    selectedCount: number;
    onDelete: () => void;
    onClear: () => void;
}

const DeleteSelectionBanner = ({ selectedCount, onDelete, onClear }: SelectionBannerProps) => {
    if (selectedCount === 0) return null;

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white rounded-lg shadow-xl border border-gray-100 flex items-center h-12 overflow-hidden z-50 transition-all duration-300">
            <div className="bg-blue-600 text-white font-bold px-4 h-full flex items-center justify-center min-w-[40px]">{selectedCount}</div>
            <div className="px-4 text-xs font-semibold text-gray-700 select-none">dữ liệu được chọn</div>
            <div className="pr-3 flex items-center gap-3">
                <button type="button" onClick={onDelete} className="bg-red-600 hover:bg-red-700 text-white rounded px-3 py-1.5 flex items-center gap-1.5 font-semibold text-xs cursor-pointer transition-colors">
                    <Trash2 className="size-3.5" />
                    <span>Xoá</span>
                </button>
                <button type="button" onClick={onClear} className="text-gray-400 hover:text-gray-600 transition-colors p-1 cursor-pointer">
                    <X className="size-4" />
                </button>
            </div>
        </div>
    );
};

export default DeleteSelectionBanner;
