"use client";

import { AlertTriangle } from "lucide-react";

type Props = {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isLoading?: boolean;
    isDangerous?: boolean;
};

export default function ConfirmationModal({ isOpen, onClose, onConfirm, title, message, confirmText = "Xác nhận", cancelText = "Hủy", isLoading = false, isDangerous = false }: Props) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50">
            <div className="w-[400px] bg-white rounded-xl shadow-2xl overflow-hidden animate-[fadeInScale_0.2s_ease-out]">
                {/* Content */}
                <div className="px-6 pt-8 pb-6 text-center">
                    <div className={`mx-auto w-14 h-14 rounded-full flex items-center justify-center mb-4 ${isDangerous ? "bg-red-50" : "bg-blue-50"}`}>
                        <AlertTriangle className={isDangerous ? "text-red-500" : "text-blue-500"} size={28} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2">{title}</h3>
                    <p className="text-sm text-gray-500 whitespace-pre-line leading-relaxed">{message}</p>
                </div>

                {/* Footer */}
                <div className="px-6 pb-6 flex justify-center gap-3">
                    <button type="button" disabled={isLoading} onClick={onClose} className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50">
                        {cancelText}
                    </button>
                    <button
                        type="button"
                        disabled={isLoading}
                        onClick={onConfirm}
                        className={`flex-1 px-4 py-2.5 text-sm font-semibold text-white rounded-lg transition-all flex items-center justify-center gap-2 ${
                            isDangerous ? "bg-red-500 hover:bg-red-600 shadow-red-100" : "bg-primary hover:opacity-90 shadow-primary/10"
                        } shadow-lg disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        {isLoading && <i className="fa-solid fa-spinner fa-spin text-xs" />}
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
