"use client";

import { useState, useEffect } from "react";
import { InputField } from "@/components/form/InputField";
import { BusinessStatus } from "@/types/typeOfBusiness";
import type { TypeOfBusiness } from "@/types/typeOfBusiness";

type BusinessTypePopupProps = {
    isOpen: boolean;
    editingItem: TypeOfBusiness | null;
    onClose: () => void;
    onSave: (payload: { code: string; name: string; status: BusinessStatus }) => Promise<void>;
};

export default function BusinessTypePopup({ isOpen, editingItem, onClose, onSave }: BusinessTypePopupProps) {
    const [code, setCode] = useState("");
    const [name, setName] = useState("");
    const [status, setStatus] = useState("true"); // "true" -> ACTIVE, "false" -> INACTIVE
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (editingItem) {
                setCode(editingItem.code);
                setName(editingItem.name);
                setStatus(editingItem.status === BusinessStatus.ACTIVE ? "true" : "false");
            } else {
                setCode("");
                setName("");
                setStatus("true");
            }
            setErrors({});
        }
    }, [isOpen, editingItem]);

    if (!isOpen) return null;

    const validate = () => {
        const nextErrors: Record<string, string> = {};
        if (!code.trim()) {
            nextErrors.code = "Mã loại hình là bắt buộc";
        }
        if (!name.trim()) {
            nextErrors.name = "Tên loại hình là bắt buộc";
        }
        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validate()) return;
        setSubmitting(true);
        try {
            const statusVal = status === "true" ? BusinessStatus.ACTIVE : BusinessStatus.INACTIVE;
            await onSave({ code: code.trim(), name: name.trim(), status: statusVal });
            onClose();
        } catch (error) {
            console.error("Error saving business type:", error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4 py-8">
            <div className="w-full max-w-[420px] rounded-xl bg-white shadow-2xl overflow-hidden animate-[fadeInScale_0.25s_ease-out]">
                {/* Header */}
                <div className="bg-blue-600 px-6 py-3.5 text-center">
                    <h2 className="text-white text-[16px] font-bold tracking-wide">
                        {editingItem ? "Chỉnh sửa loại hình kinh doanh" : "Thêm mới loại hình kinh doanh"}
                    </h2>
                </div>

                {/* Form Fields */}
                <div className="px-6 py-6 space-y-6">
                    <InputField 
                        name="code"
                        label="Mã loại hình *" 
                        value={code} 
                        placeholder="Nhập mã loại hình" 
                        onChange={(e) => setCode(e.target.value)}
                        error={errors.code}
                    />

                    <InputField 
                        name="name"
                        label="Tên loại hình kinh doanh *" 
                        value={name} 
                        placeholder="Nhập tên loại hình kinh doanh" 
                        onChange={(e) => setName(e.target.value)}
                        error={errors.name}
                    />

                    <InputField
                        name="status"
                        label="Trạng thái"
                        value={status}
                        isSelect
                        placeholder="Chọn trạng thái"
                        options={[
                            { label: "Sử dụng", value: "true" },
                            { label: "Ngừng sử dụng", value: "false" },
                        ]}
                        onChange={(e) => setStatus(e.target.value)}
                        disabled={!editingItem}
                    />
                </div>

                {/* Footer Buttons */}
                <div className="px-6 pb-6 pt-2 flex justify-end items-center gap-4">
                    <button 
                        type="button" 
                        onClick={onClose} 
                        className="px-4 py-2 text-[14px] font-semibold text-gray-500 hover:bg-gray-50 rounded-md transition-colors cursor-pointer" 
                        disabled={submitting}
                    >
                        Huỷ bỏ
                    </button>
                    <button 
                        type="button" 
                        onClick={handleSave} 
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg text-[14px] font-bold hover:bg-blue-700 transition-colors flex items-center justify-center cursor-pointer min-w-[80px]" 
                        disabled={submitting}
                    >
                        {submitting ? "Đang lưu..." : "Lưu"}
                    </button>
                </div>
            </div>
        </div>
    );
}
