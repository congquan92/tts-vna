"use client";

import React from "react";
import clsx from "clsx";

interface ConfirmPopupProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: "primary" | "warning" | "danger";
}

export default function ConfirmPopup({
    isOpen,
    onClose,
    onConfirm,
    title = "Cảnh báo",
    message,
    confirmText = "Đồng ý",
    cancelText = "Huỷ bỏ",
    variant = "warning"
}: ConfirmPopupProps) {
    if (!isOpen) return null;

    const headerBg = clsx("px-6 py-3.5 text-center", {
        "bg-[#2f6ced]": variant === "primary",
        "bg-amber-500": variant === "warning",
        "bg-red-600": variant === "danger",
    });

    const confirmBtnBg = clsx("px-5 py-2 text-xs font-bold text-white rounded shadow-sm transition-colors cursor-pointer", {
        "bg-[#2f6ced] hover:bg-blue-700": variant === "primary",
        "bg-amber-500 hover:bg-amber-600": variant === "warning",
        "bg-red-600 hover:bg-red-700": variant === "danger",
    });

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-999 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header bar */}
                <div className={headerBg}>
                    <h3 className="text-white text-base font-bold">{title}</h3>
                </div>
                {/* Content */}
                <div className="px-6 py-8 text-center bg-white">
                    <p className="text-sm font-semibold text-gray-700">{message}</p>
                </div>
                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 flex items-center justify-end gap-3 border-t border-gray-100">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors cursor-pointer"
                    >
                        {cancelText}
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        className={confirmBtnBg}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
