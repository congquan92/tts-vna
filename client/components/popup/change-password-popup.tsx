"use client";

import React, { useState, useEffect } from "react";
import PasswordInput from "@/components/form/PasswordInput";
import { AuthApi } from "@/api/auth";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";

interface ChangePasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function ChangePasswordPopup({ isOpen, onClose }: ChangePasswordModalProps) {
    const [formData, setFormData] = useState({
        oldPass: "",
        newPass: "",
        confirmPass: "",
    });
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);

    // Reset form data when modal closes
    useEffect(() => {
        if (!isOpen) {
            setFormData({ oldPass: "", newPass: "", confirmPass: "" });
            setAlert(null);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleFieldChange = (field: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({ ...prev, [field]: e.target.value }));
        if (alert) setAlert(null); // Clear alert when user starts typing
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        // Basic validation
        if (!formData.oldPass.trim() || !formData.newPass.trim() || !formData.confirmPass.trim()) {
            setAlert({ type: "error", message: "Vui lòng nhập đầy đủ các trường thông tin" });
            return;
        }

        if (formData.newPass !== formData.confirmPass) {
            setAlert({ type: "error", message: "Mật khẩu mới và xác nhận mật khẩu không khớp" });
            return;
        }

        if (formData.newPass.length < 6) {
            setAlert({ type: "error", message: "Mật khẩu mới phải có ít nhất 6 ký tự" });
            return;
        }

        setLoading(true);
        setAlert(null);

        try {
            const response = await AuthApi.changePassword({
                oldPass: formData.oldPass,
                newPass: formData.newPass,
                confirmPass: formData.confirmPass,
            });

            setAlert({ type: "success", message: response.message || "Đổi mật khẩu thành công!" });

            // Auto close after success
            setTimeout(() => {
                onClose();
            }, 2000);
        } catch (error: any) {
            console.error("Error changing password:", error);
            setAlert({
                type: "error",
                message: error.response?.data?.message || "Mật khẩu cũ không chính xác hoặc có lỗi xảy ra",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[9999] bg-black/40 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-[420px] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="bg-[#2f6ced] py-4 text-center">
                    <h2 className="text-white font-bold text-lg tracking-wide">ĐỔI MẬT KHẨU</h2>
                </div>

                {/* Form Body */}
                <div className="p-6 flex flex-col gap-5">
                    {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

                    <form onSubmit={handleSave} className="flex flex-col gap-6 text-black">
                        <PasswordInput label="Mật khẩu cũ" required value={formData.oldPass} onChange={handleFieldChange("oldPass")} disabled={loading} />
                        <PasswordInput label="Mật khẩu mới" required value={formData.newPass} onChange={handleFieldChange("newPass")} disabled={loading} />
                        <PasswordInput label="Nhập lại mật khẩu mới" required value={formData.confirmPass} onChange={handleFieldChange("confirmPass")} disabled={loading} />

                        {/* Footer Buttons */}
                        <div className="flex justify-end gap-3 items-center mt-2">
                            <button type="button" onClick={onClose} disabled={loading} className="text-gray-500 font-semibold text-[15px] hover:bg-gray-100 px-5 py-2.5 rounded-lg transition-colors disabled:opacity-50">
                                Huỷ bỏ
                            </button>
                            <Button variant="primary" type="submit" loading={loading} className="bg-[#2f6ced] text-white font-semibold text-[15px] px-10 py-2.5 rounded-lg hover:bg-blue-700 transition-colors shadow-md h-auto">
                                Lưu
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
