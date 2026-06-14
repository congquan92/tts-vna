"use client";

import type { TypeOfBusiness } from "@/types/typeOfBusiness";
import InputLegend from "@/components/InputLegend";
import SelectLegend from "@/components/SelectLegend";

type BusinessTypeModalProps = {
    isOpen: boolean;
    editingItem: TypeOfBusiness | null;
    form: { code: string; name: string; status: string };
    errors: { code: string; name: string };
    onClose: () => void;
    onSave: () => void;
    onChange: (field: string, value: string) => void;
};

export default function BusinessTypeModal({ isOpen, editingItem, form, errors, onClose, onSave, onChange }: BusinessTypeModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-8">
            <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl overflow-hidden">
                <div className="bg-primary px-6 py-4">
                    <h2 className="text-white text-base font-semibold">{editingItem ? "Cập nhật loại hình kinh doanh" : "Thêm mới loại hình kinh doanh"}</h2>
                </div>

                <div className="px-6 py-5 space-y-4">
                    <div className="grid grid-cols-1 gap-5">
                        <InputLegend
                            label="Mã loại hình"
                            require={true}
                            input={{
                                type: "text",
                                placeholder: "Nhập mã loại hình",
                                value: form.code,
                                onChange: (e) => onChange("code", (e.target as HTMLInputElement).value),
                            }}
                            errorMess={errors.code}
                        />

                        <InputLegend
                            label="Tên loại hình kinh doanh"
                            require={true}
                            input={{
                                type: "text",
                                placeholder: "Nhập tên loại hình",
                                value: form.name,
                                onChange: (e) => onChange("name", (e.target as HTMLInputElement).value),
                            }}
                            errorMess={errors.name}
                        />

                        <SelectLegend
                            label="Trạng thái"
                            select={{
                                value: form.status,
                                onChange: (e) => onChange("status", (e.target as HTMLSelectElement).value),
                            }}
                        >
                            <option value="true">Sử dụng</option>
                            <option value="false">Ngừng sử dụng</option>
                        </SelectLegend>
                    </div>
                </div>

                <div className="px-6 pb-5 flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors">
                        Hủy bỏ
                    </button>
                    <button type="button" onClick={onSave} className="px-5 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-[#4a22b8] transition-colors flex items-center gap-2">
                        <i className="fa-solid fa-floppy-disk text-xs" />
                        Lưu
                    </button>
                </div>
            </div>
        </div>
    );
}
