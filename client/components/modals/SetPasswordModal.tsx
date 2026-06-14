"use client";

import { useState, useEffect } from "react";
import type { User } from "@/types/auth";
import InputLegend from "@/components/InputLegend";
import { Key } from "lucide-react";

type SetPasswordModalProps = {
    isOpen: boolean;
    user: User | null;
    onClose: () => void;
    onSave: (password: string) => Promise<void>;
};

export default function SetPasswordModal({ isOpen, user, onClose, onSave }: SetPasswordModalProps) {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setPassword("");
            setConfirmPassword("");
            setErrors({});
        }
    }, [isOpen]);

    if (!isOpen || !user) return null;

    const validate = () => {
        const nextErrors: Record<string, string> = {};
        if (!password) {
            nextErrors.password = "Mật khẩu mới là bắt buộc";
        } else if (password.length < 6) {
            nextErrors.password = "Mật khẩu phải chứa ít nhất 6 ký tự";
        }

        if (!confirmPassword) {
            nextErrors.confirmPassword = "Xác nhận mật khẩu là bắt buộc";
        } else if (password !== confirmPassword) {
            nextErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-8">
            <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl overflow-hidden animate-[fadeInScale_0.25s_ease-out]">
                <div className="bg-primary px-6 py-4">
                    <h2 className="text-white text-base font-semibold">Đặt lại mật khẩu</h2>
                </div>

                <div className="px-6 py-5 space-y-4">
                    <p className="text-sm text-gray-600">
                        Đặt lại mật khẩu cho tài khoản: <strong className="text-gray-900">{user.account?.username}</strong> ({user.fullName})
                    </p>

                    <div className="grid grid-cols-1 gap-4">
                        <InputLegend
                            label="Mật khẩu mới"
                            require={true}
                            input={{
                                type: "password",
                                placeholder: "Nhập mật khẩu mới",
                                value: password,
                                onChange: (e) => setPassword(e.target.value),
                            }}
                            errorMess={errors.password}
                        />

                        <InputLegend
                            label="Xác nhận mật khẩu mới"
                            require={true}
                            input={{
                                type: "password",
                                placeholder: "Xác nhận mật khẩu mới",
                                value: confirmPassword,
                                onChange: (e) => setConfirmPassword(e.target.value),
                            }}
                            errorMess={errors.confirmPassword}
                        />
                    </div>
                </div>

                <div className="px-6 pb-5 flex justify-end gap-3 border-t pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                        disabled={submitting}
                    >
                        Hủy bỏ
                    </button>
                    <button
                        type="button"
                        onClick={handleSave}
                        className="px-5 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-[#4a22b8] transition-colors flex items-center gap-2"
                        disabled={submitting}
                    >
                        <Key className="size-4" />
                        {submitting ? "Đang cập nhật..." : "Cập nhật"}
                    </button>
                </div>
            </div>
        </div>
    );
}
