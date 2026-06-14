"use client";

import React from "react";

type AccountInfoPopupProps = {
    isOpen: boolean;
    onClose: () => void;
    accountNumber: string;
    password?: string;
};

export default function AccountInfoPopup({ isOpen, onClose, accountNumber, password }: AccountInfoPopupProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/30 px-4 py-8">
            <div className="w-full max-w-[400px] rounded-xl bg-white shadow-2xl overflow-hidden animate-[fadeInScale_0.25s_ease-out]">
                {/* Header */}
                <div className="bg-[#2f65ff] px-6 py-3.5 text-center">
                    <h2 className="text-white text-[17px] font-bold tracking-wide">Thông tin tài khoản</h2>
                </div>

                {/* Content */}
                <div className="px-6 py-6 space-y-4">
                    <ul className="space-y-3">
                        <li className="flex items-baseline gap-2">
                            <span className="text-sm text-gray-600">•</span>
                            <span className="text-sm text-gray-700">
                                Tài khoản: <strong className="text-black font-bold ml-1">{accountNumber}</strong>
                            </span>
                        </li>
                        <li className="flex items-baseline gap-2">
                            <span className="text-sm text-gray-600">•</span>
                            <span className="text-sm text-gray-700">
                                Mật khẩu: <strong className="text-black font-bold ml-1">{password}</strong>
                            </span>
                        </li>
                    </ul>
                </div>

                {/* Footer Buttons */}
                <div className="px-6 pb-5 flex justify-end items-center">
                    <button 
                        type="button" 
                        onClick={onClose} 
                        className="text-[14px] font-semibold text-[#2f65ff] hover:text-blue-800 transition-colors cursor-pointer"
                    >
                        Huỷ bỏ
                    </button>
                </div>
            </div>
        </div>
    );
}
