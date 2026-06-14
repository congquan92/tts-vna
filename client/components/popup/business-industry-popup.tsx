"use client";

import { useState, useEffect } from "react";
import { InputField } from "@/components/form/InputField";
import { BusinessStatus } from "@/types/businessIndustry";
import type { BusinessIndustry } from "@/types/businessIndustry";
import { BusinessIndustryApi } from "@/api/businessIndustry";
import { Save } from "lucide-react";

type BusinessIndustryPopupProps = {
    isOpen: boolean;
    editingItem: BusinessIndustry | null;
    onClose: () => void;
    onSave: (payload: { code: string; name: string; parentId?: number | string; status: BusinessStatus }) => Promise<void>;
};

export default function BusinessIndustryPopup({ isOpen, editingItem, onClose, onSave }: BusinessIndustryPopupProps) {
    const [code, setCode] = useState("");
    const [name, setName] = useState("");
    const [parentId, setParentId] = useState("");
    const [status, setStatus] = useState<BusinessStatus>(BusinessStatus.ACTIVE);
    const [parentOptions, setParentOptions] = useState<{ label: string; value: string }[]>([]);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);

    // Fetch parent options (not level 4)
    useEffect(() => {
        const fetchParents = async () => {
            try {
                const list = await BusinessIndustryApi.findNotLevel4();
                // Filter out current editing item to prevent self-parenting
                const filtered = list.filter((item) => !editingItem || item.id !== editingItem.id);
                const options = filtered.map((item) => ({
                    label: `${item.code} - ${item.name}`,
                    value: String(item.id),
                }));
                setParentOptions(options);
            } catch (error) {
                console.error("Error loading parent industries:", error);
            }
        };

        if (isOpen) {
            fetchParents();
        }
    }, [isOpen, editingItem]);

    useEffect(() => {
        if (isOpen) {
            if (editingItem) {
                setCode(editingItem.code);
                setName(editingItem.name);
                setParentId(editingItem.parentId ? String(editingItem.parentId) : "");
                setStatus(editingItem.status);
            } else {
                setCode("");
                setName("");
                setParentId("");
                setStatus(BusinessStatus.ACTIVE);
            }
            setErrors({});
        }
    }, [isOpen, editingItem]);

    if (!isOpen) return null;

    const validate = () => {
        const nextErrors: Record<string, string> = {};
        if (!code.trim()) {
            nextErrors.code = "Mã ngành là bắt buộc";
        }
        if (!name.trim()) {
            nextErrors.name = "Tên ngành là bắt buộc";
        }
        if (!status) {
            nextErrors.status = "Trạng thái là bắt buộc";
        }
        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validate()) return;
        setSubmitting(true);
        try {
            await onSave({
                code: code.trim(),
                name: name.trim(),
                parentId: parentId || undefined,
                status: status,
            });
            onClose();
        } catch (error) {
            console.error("Error saving business industry:", error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4 py-8">
            <div className="w-full max-w-[520px] rounded-xl bg-white shadow-2xl overflow-hidden animate-[fadeInScale_0.25s_ease-out]">
                {/* Header */}
                <div className="bg-blue-600 px-6 py-3.5 text-center">
                    <h2 className="text-white text-[16px] font-bold tracking-wide">{editingItem ? "Cập nhật nghề kinh doanh" : "Thêm mới ngành nghề kinh doanh"}</h2>
                </div>

                {/* Form Fields */}
                <div className="px-6 py-6 space-y-6">
                    <InputField name="code" label="Mã ngành *" value={code} placeholder="Nhập mã ngành" onChange={(e) => setCode(e.target.value)} error={errors.code} />

                    <InputField name="name" label="Tên ngành *" value={name} placeholder="Nhập tên ngành" onChange={(e) => setName(e.target.value)} error={errors.name} />

                    <InputField name="parentId" label="Nhóm ngành cha" value={parentId} isSelect isSearchable placeholder="Chọn nhóm ngành cha" options={parentOptions} onChange={(e) => setParentId(e.target.value)} />

                    <InputField
                        name="status"
                        label="Trạng thái *"
                        value={status}
                        isSelect
                        placeholder="Chọn trạng thái"
                        options={[
                            { label: "Sử dụng", value: BusinessStatus.ACTIVE },
                            { label: "Ngừng sử dụng", value: BusinessStatus.INACTIVE },
                        ]}
                        onChange={(e) => setStatus(e.target.value)}
                        error={errors.status}
                    />
                </div>

                {/* Footer Buttons */}
                <div className="px-6 pb-6 pt-2 flex justify-end items-center gap-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-[14px] font-semibold text-gray-500 hover:bg-gray-50 rounded-md transition-colors cursor-pointer" disabled={submitting}>
                        Huỷ bỏ
                    </button>
                    <button
                        type="button"
                        onClick={handleSave}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg text-[14px] font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer min-w-[80px]"
                        disabled={submitting}
                    >
                        <Save className="size-4 shrink-0" />
                        <span>{submitting ? "Đang lưu..." : "Lưu"}</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
