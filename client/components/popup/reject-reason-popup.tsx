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
        <div className="fixed inset-0 bg-black/40  z-[9999] flex items-center justify-center p-4">
            <div className="bg-white rounded-sm shadow-2xl w-full max-w-[480px] overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header bar */}
                <div className="bg-blue-600 px-6 py-4">
                    <h1 className="text-white text-base font-bold text-center">Từ chối báo cáo</h1>
                </div>
                {/* Content */}
                <div className="px-6 pt-6 pb-4 bg-white">
                    <div className="relative mt-2">
                        <label className="absolute -top-2 left-3 bg-white px-1.5 text-xs text-gray-400 font-medium select-none">
                            Lý do <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Nhập lý do từ chối cụ thể."
                            rows={3}
                            className="w-full bg-white border border-gray-200 rounded-lg p-3 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-800 resize-none transition-shadow"
                        />
                    </div>
                </div>
                {/* Footer */}
                <div className="px-6 pb-6 bg-white flex items-center justify-end gap-3">
                    <Button variant="outline" type="button" size="sm" onClick={onClose} className="border-none text-sm font-semibold text-gray-500 hover:text-gray-700 hover:bg-gray-50 px-5 py-2  transition-colors cursor-pointer">
                        Huỷ bỏ
                    </Button>
                    <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        disabled={processing || !reason.trim()}
                        onClick={handleSubmit}
                        className="text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed  px-7 py-2 shadow-md shadow-blue-500/20 transition-all cursor-pointer"
                    >
                        Gửi
                    </Button>
                </div>
            </div>
        </div>
    );
}
