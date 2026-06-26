"use client";

import Button from "@/components/ui/Button";
import { useState, useEffect } from "react";

interface RejectReasonPopupProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (reason: string) => void;
    processing: boolean;
}

export default function RejectReasonPopup({ isOpen, onClose, onSubmit, processing }: RejectReasonPopupProps) {
    const [reason, setReason] = useState("");

    // Clear reason when modal opens/closes
    useEffect(() => {
        if (!isOpen) {
            Promise.resolve().then(() => {
                setReason("");
            });
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = () => {
        if (!reason.trim()) return;
        onSubmit(reason);
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-999 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header bar */}
                <div className="bg-blue-600 px-6 py-3.5 ">
                    <h1 className="text-white text-base font-bold text-center">Từ chối các báo cáo đã chọn</h1>
                </div>
                {/* Content */}
                <div className="px-6 py-6 space-y-4 bg-white">
                    <div className="relative">
                        <label className="block text-xs font-bold text-gray-500 mb-1.5">
                            Lý do từ chối <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Nhập lý do từ chối cụ thể."
                            rows={4}
                            className="w-full bg-white border border-gray-250 rounded-lg p-3 text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-semibold text-gray-800 resize-none transition-shadow"
                        />
                    </div>
                </div>
                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 flex items-center justify-end gap-3 border-t border-gray-100">
                    <Button variant="outline" size="sm" type="button" onClick={onClose} className="text-xs border-none font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors cursor-pointer">
                        Hủy
                    </Button>
                    <Button
                        type="button"
                        size="sm"
                        disabled={processing || !reason.trim()}
                        onClick={handleSubmit}
                        className="text-xs font-bold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed rounded shadow-sm transition-colors cursor-pointer"
                    >
                        Xác nhận từ chối
                    </Button>
                </div>
            </div>
        </div>
    );
}
