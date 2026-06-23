"use client";

import React from "react";
import { X, Save, Send, ChevronDown } from "lucide-react";
import Button from "@/components/ui/Button";

interface FormSelectProps {
    label: string;
    value: string;
    onChange: (val: string) => void;
    options: string[];
    disabled?: boolean;
    required?: boolean;
}

const FormSelect: React.FC<FormSelectProps> = ({ label, value, onChange, options, disabled = false, required = false }) => {
    return (
        <div className="relative">
            <label className="absolute left-2.5 top-0 -translate-y-1/2 bg-white px-1 text-[10px] text-gray-400 font-semibold tracking-wide z-10">
                {label}
                {required && <span className="text-red-500 ml-0.5">*</span>}
            </label>
            <select
                disabled={disabled}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded px-3 py-2.5 text-xs outline-none focus:border-primary font-semibold text-gray-800 appearance-none pr-10 cursor-pointer disabled:bg-gray-50/50 disabled:text-gray-500 disabled:cursor-not-allowed"
            >
                {options.map((opt) => (
                    <option key={opt} value={opt}>
                        {opt}
                    </option>
                ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 size-4 pointer-events-none" />
        </div>
    );
};

interface SaveReportPopupProps {
    isOpen: boolean;
    onClose: () => void;
    onSaveDraft: () => void;
    onSendReport: () => void;
    period: string;
    setPeriod: (val: string) => void;
}

export default function SaveReportPopup({ isOpen, onClose, onSaveDraft, onSendReport, period, setPeriod }: SaveReportPopupProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-999 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Blue header bar */}
                <div className="bg-blue-600 px-6 py-3.5 text-center flex items-center justify-between">
                    <h3 className="text-white text-sm font-bold uppercase tracking-wide">Xác nhận lưu báo cáo</h3>
                    <button type="button" onClick={onClose} className="text-white/80 hover:text-white">
                        <X size={18} />
                    </button>
                </div>
                {/* Content */}
                <div className="px-6 py-6 space-y-4">
                    <div className="relative">
                        <FormSelect label="Kỳ báo cáo" value={period} onChange={setPeriod} options={["6 tháng", "Cả năm"]} disabled={true} />
                    </div>
                </div>
                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 flex items-center justify-end gap-3 border-t border-gray-100">
                    <Button variant="outline" size="sm" onClick={onClose} className="border-none bg-transparent hover:bg-gray-100 text-gray-600 hover:text-gray-800 text-xs font-semibold px-4 py-2">
                        Hủy
                    </Button>
                    <Button variant="outline" size="sm" onClick={onSaveDraft} className="gap-1.5 border-gray-300 text-gray-700 hover:bg-gray-50 text-xs font-bold px-4 py-2 shadow-sm">
                        <Save size={14} />
                        <span>Lưu</span>
                    </Button>
                    <Button variant="primary" size="sm" onClick={onSendReport} className="gap-1.5 text-xs font-bold px-4 py-2 shadow-sm">
                        <Send size={14} />
                        <span>Gửi báo cáo</span>
                    </Button>
                </div>
            </div>
        </div>
    );
}
