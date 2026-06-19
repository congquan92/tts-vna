"use client";

import { useState } from "react";
import type { User } from "@/types/auth";
import { Save, Eye, EyeOff } from "lucide-react";
import LoadingOverlay from "@/components/LoadingOverlay";

type CreatePasswordModalProps = {
    isOpen: boolean;
    user: User | null;
    onClose: () => void;
    onSave: (password: string) => Promise<void>;
};

export default function CreatePasswordModal({ isOpen, user, onClose, onSave }: CreatePasswordModalProps) {
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

    if (isOpen !== prevIsOpen) {
        setPrevIsOpen(isOpen);
        if (isOpen) {
            setPassword("");
            setShowPassword(false);
        }
    }

    if (!isOpen || !user) return null;

    const handleSave = async () => {
        setSubmitting(true);
        try {
            await onSave(password);
            onClose();
        } catch (error) {
            console.error("Lỗi khi đổi mật khẩu:", error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            <LoadingOverlay isLoading={submitting} />
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4 py-8">
                <div className="w-full max-w-100 rounded-xl bg-white shadow-2xl overflow-hidden animate-[fadeInScale_0.25s_ease-out]">
                    {/* Header */}
                    <div className="bg-[#2f65ff] px-6 py-3 text-center">
                        <h2 className="text-white text-[17px] font-semibold tracking-wide">Xác nhận</h2>
                    </div>

                    <div className="px-6 py-6 space-y-4">
                        {/* Text miêu tả */}
                        <p className="text-[15px] text-gray-800">
                            Khởi tạo mật khẩu cho tài khoản <strong className="font-bold text-black">{user.account?.username || (user as unknown as { username?: string }).username}</strong>
                        </p>

                        {/* Ô nhập mật khẩu */}
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Nhập mật khẩu mới mong muốn"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-3 pr-10 py-2.5 text-[15px] border border-gray-200 rounded-md focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors placeholder:text-gray-400"
                            />
                            <button
                                type="button"
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                            </button>
                        </div>
                    </div>

                    {/* Footer Buttons */}
                    <div className="px-5 pb-5 pt-2 flex justify-end items-center gap-6">
                        <button type="button" onClick={onClose} className="text-[14px] font-semibold text-[#2f65ff] hover:text-blue-800 transition-colors">
                            Huỷ bỏ
                        </button>
                        <button type="button" onClick={handleSave} className="px-5 py-2 bg-[#2f65ff] text-white rounded-lg text-[14px] font-medium hover:bg-blue-700 transition-colors flex items-center gap-2">
                            <Save className="size-4" />
                            Lưu
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
