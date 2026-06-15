"use client";

import { useState, useEffect } from "react";
import type { User } from "@/types/auth";
import { Save } from "lucide-react"; // Đổi icon thành Save (đĩa mềm)
import { validateStrongPassword } from "@/utils/validation";

type CreatePasswordModalProps = {
    isOpen: boolean;
    user: User | null;
    onClose: () => void;
    onSave: (password: string) => Promise<void>;
};

export default function CreatePasswordModal({ isOpen, user, onClose, onSave }: CreatePasswordModalProps) {
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setPassword("");
            setErrors({});
        }
    }, [isOpen]);

    if (!isOpen || !user) return null;

    const validate = () => {
        const nextErrors: Record<string, string> = {};
        const passwordValidation = validateStrongPassword(password);
        if (!passwordValidation.isValid) {
            nextErrors.password = passwordValidation.message;
        }

        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validate()) return;

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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4 py-8">
            <div className="w-full max-w-[400px] rounded-xl bg-white shadow-2xl overflow-hidden animate-[fadeInScale_0.25s_ease-out]">
                {/* Header */}
                <div className="bg-[#2f65ff] px-6 py-3 text-center">
                    <h2 className="text-white text-[17px] font-semibold tracking-wide">Xác nhận</h2>
                </div>

                <div className="px-6 py-6 space-y-4">
                    {/* Text miêu tả */}
                    <p className="text-[15px] text-gray-800">
                        Khởi tạo mật khẩu cho tài khoản <strong className="font-bold text-black">{user.account?.username || (user as any).username}</strong>
                    </p>

                    {/* Ô nhập mật khẩu */}
                    <div>
                        <input
                            type="password"
                            placeholder="Nhập mật khẩu mới mong muốn"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={`w-full px-3 py-2.5 text-[15px] border rounded-md focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors placeholder:text-gray-400 ${
                                errors.password ? "border-red-500" : "border-gray-200"
                            }`}
                        />
                        {errors.password && <p className="text-red-500 text-xs mt-1.5">{errors.password}</p>}
                    </div>
                </div>

                {/* Footer Buttons */}
                <div className="px-5 pb-5 pt-2 flex justify-end items-center gap-6">
                    <button type="button" onClick={onClose} className="text-[14px] font-semibold text-[#2f65ff] hover:text-blue-800 transition-colors" disabled={submitting}>
                        Huỷ bỏ
                    </button>
                    <button type="button" onClick={handleSave} className="px-5 py-2 bg-[#2f65ff] text-white rounded-lg text-[14px] font-medium hover:bg-blue-700 transition-colors flex items-center gap-2" disabled={submitting}>
                        <Save className="size-4" />
                        {submitting ? "Đang lưu..." : "Lưu"}
                    </button>
                </div>
            </div>
        </div>
    );
}
