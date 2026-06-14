"use client";

import { useState, useEffect } from "react";
import type { User } from "@/types/auth";
import InputLegend from "@/components/InputLegend";
import SelectLegend from "@/components/SelectLegend";
import { Save } from "lucide-react";

type UserModalProps = {
    isOpen: boolean;
    editingItem: User | null;
    onClose: () => void;
    onSave: (payload: any) => Promise<void>;
};

export default function UserModal({ isOpen, editingItem, onClose, onSave }: UserModalProps) {
    const [form, setForm] = useState({
        username: "",
        fullName: "",
        email: "",
        roleId: "",
        position: "",
        isActive: "true",
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (editingItem) {
                setForm({
                    username: editingItem.account?.username || "",
                    fullName: editingItem.fullName || "",
                    email: editingItem.email || "",
                    roleId: editingItem.account?.role?.id?.toString() || "",
                    position: editingItem.position || "",
                    isActive: editingItem.isActive ? "true" : "false",
                });
            } else {
                setForm({
                    username: "",
                    fullName: "",
                    email: "",
                    roleId: "",
                    position: "",
                    isActive: "true",
                });
            }
            setErrors({});
        }
    }, [editingItem, isOpen]);

    if (!isOpen) return null;

    const handleChange = (field: string, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }));
        }
    };

    const validate = () => {
        const nextErrors: Record<string, string> = {};
        if (!form.username.trim()) nextErrors.username = "Tên đăng nhập là bắt buộc";
        if (!form.fullName.trim()) nextErrors.fullName = "Họ và tên là bắt buộc";
        if (!form.email.trim()) {
            nextErrors.email = "Email là bắt buộc";
        } else if (!/\S+@\S+\.\S+/.test(form.email)) {
            nextErrors.email = "Email không hợp lệ";
        }
        if (!form.roleId) nextErrors.roleId = "Vai trò là bắt buộc";

        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validate()) return;

        setSubmitting(true);
        try {
            const payload: any = {
                username: form.username,
                fullName: form.fullName,
                email: form.email,
                roleId: Number(form.roleId),
                position: form.position || undefined,
                isActive: form.isActive === "true",
            };

            await onSave(payload);
            onClose();
        } catch (error) {
            console.error("Lỗi khi lưu người dùng:", error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-8">
            <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden animate-[fadeInScale_0.25s_ease-out]">
                <div className="bg-primary px-6 py-4">
                    <h2 className="text-white text-base font-semibold">
                        {editingItem ? "Cập nhật thông tin người dùng" : "Thêm mới người dùng"}
                    </h2>
                </div>

                <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
                    <div className="grid grid-cols-1 gap-4">
                        <InputLegend
                            label="Tên đăng nhập"
                            require={true}
                            input={{
                                type: "text",
                                placeholder: "Nhập tên đăng nhập",
                                value: form.username,
                                onChange: (e) => handleChange("username", e.target.value),
                                disabled: !!editingItem,
                            }}
                            errorMess={errors.username}
                        />

                        <InputLegend
                            label="Họ và tên"
                            require={true}
                            input={{
                                type: "text",
                                placeholder: "Nhập họ và tên",
                                value: form.fullName,
                                onChange: (e) => handleChange("fullName", e.target.value),
                            }}
                            errorMess={errors.fullName}
                        />

                        <InputLegend
                            label="Email"
                            require={true}
                            input={{
                                type: "email",
                                placeholder: "Nhập email",
                                value: form.email,
                                onChange: (e) => handleChange("email", e.target.value),
                            }}
                            errorMess={errors.email}
                        />

                        <SelectLegend
                            label="Vai trò"
                            require={true}
                            select={{
                                value: form.roleId,
                                onChange: (e) => handleChange("roleId", e.target.value),
                            }}
                            errorMess={errors.roleId}
                        >
                            <option value="">Chọn vai trò</option>
                            <option value="1">ADMIN_SO (Quản trị viên Sở)</option>
                            <option value="2">MANAGER_SO (Lãnh đạo Sở)</option>
                            <option value="3">CHUYENVIEN_SO (Chuyên viên)</option>
                            <option value="4">CEO_DN (Giám đốc Doanh nghiệp)</option>
                            <option value="5">MANAGER_DN (Quản lý Doanh nghiệp)</option>
                            <option value="6">USER_DN (Nhân viên Doanh nghiệp)</option>
                        </SelectLegend>

                        <InputLegend
                            label="Chức danh"
                            input={{
                                type: "text",
                                placeholder: "Nhập chức danh",
                                value: form.position,
                                onChange: (e) => handleChange("position", e.target.value),
                            }}
                        />

                        <SelectLegend
                            label="Trạng thái"
                            select={{
                                value: form.isActive,
                                onChange: (e) => handleChange("isActive", e.target.value),
                            }}
                        >
                            <option value="true">Sử dụng (Bật)</option>
                            <option value="false">Ngừng sử dụng (Tắt)</option>
                        </SelectLegend>
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
                        <Save className="size-4" />
                        {submitting ? "Đang lưu..." : "Lưu"}
                    </button>
                </div>
            </div>
        </div>
    );
}
