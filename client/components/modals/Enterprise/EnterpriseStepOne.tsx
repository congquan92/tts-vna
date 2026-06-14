"use client";

import { useRef, useState, useEffect } from "react";
import InputLegend from "@/components/InputLegend";
import SelectLegend from "@/components/SelectLegend";
import FormField from "@/components/form/FormField";
import { TypeOfBusinessApi } from "@/api/typeOfBusiness";
import { BusinessIndustryApi } from "@/api/businessIndustry";
import type { TypeOfBusiness } from "@/types/typeOfBusiness";
import type { BusinessIndustry } from "@/types/businessIndustry";
import { Eye, Upload, Trash2, Calendar } from "lucide-react";

export type EnterpriseFormMode = "create" | "edit" | "view";

export type EnterpriseFormData = {
    companyName: string;
    taxCode: string;
    businessType: string;
    industry: string;
    gpkdDate: string;
    gpkdProvince: string;
    gpkdWard: string;
    address: string;
    foreignName: string;
    email: string;
    phone: string;
    businessProvince: string;
    businessWard: string;
    businessAddress: string;
    representative: string;
    representativePhone: string;
};

export type EnterpriseFormErrors = {
    companyName: string;
    taxCode: string;
    businessType: string;
    industry: string;
    gpkdProvince: string;
    gpkdWard: string;
    email: string;
};

export type UploadedFile = {
    id: number;
    name: string;
    size: string;
    file?: File;
    url?: string;
};

export type AttachmentGroup = {
    groupName: string;
    files: UploadedFile[];
};

type Props = {
    form: EnterpriseFormData;
    errors: EnterpriseFormErrors;
    attachmentGroups: AttachmentGroup[];
    onChange: (field: keyof EnterpriseFormData, value: string) => void;
    onAddFiles: (groupIndex: number, files: FileList) => void;
    onRemoveFile: (groupIndex: number, fileId: number) => void;
    mode?: EnterpriseFormMode;
    userRole?: string;
};

export default function EnterpriseStepOne({ form, errors, attachmentGroups, onChange, onAddFiles, onRemoveFile, mode = "create", userRole = "" }: Props) {
    const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const [previewFile, setPreviewFile] = useState<UploadedFile | null>(null);
    const [businessTypes, setBusinessTypes] = useState<TypeOfBusiness[]>([]);
    const [industries, setIndustries] = useState<BusinessIndustry[]>([]);

    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const [types, inds] = await Promise.all([
                    TypeOfBusinessApi.findAll(),
                    BusinessIndustryApi.findLevel4(),
                ]);
                setBusinessTypes(types.filter(t => t.status));
                setIndustries(inds);
            } catch (error) {
                console.error("Error fetching options:", error);
            }
        };
        fetchOptions();
    }, []);

    const isViewMode = mode === "view";
    const isEditMode = mode === "edit";

    // In edit mode, tax code is always read-only
    const isTaxCodeDisabled = isViewMode || isEditMode;

    // In edit mode, email is only editable when userRole === 'SỞ'
    const isEmailDisabled = isViewMode || (isEditMode && userRole !== "SỞ");

    const handleUploadClick = (groupIndex: number) => {
        if (isViewMode) return;
        fileInputRefs.current[groupIndex]?.click();
    };

    const handleFileChange = (groupIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            onAddFiles(groupIndex, e.target.files);
            // Reset input so same file can be selected again
            e.target.value = "";
        }
    };

    const handlePreview = (file: UploadedFile) => {
        // If it's an image, show in modal preview
        if (file.file?.type.startsWith("image/") && file.url) {
            setPreviewFile(file);
        } else if (file.url) {
            // For non-image files, open in a new browser tab
            window.open(file.url, "_blank");
        }
    };

    const closePreview = () => {
        setPreviewFile(null);
    };

    // Handle tax code input - only allow digits and dash
    const handleTaxCodeChange = (value: string) => {
        if (isTaxCodeDisabled) return;
        const cleaned = value.replace(/[^0-9-]/g, "");
        onChange("taxCode", cleaned);
    };

    // Handle GPKD date input - auto format as dd/mm/yyyy
    const handleGpkdDateChange = (value: string) => {
        // Remove non-digit and non-slash characters
        let cleaned = value.replace(/[^0-9/]/g, "");
        // Auto-insert slashes
        const digits = cleaned.replace(/\//g, "");
        if (digits.length <= 2) {
            cleaned = digits;
        } else if (digits.length <= 4) {
            cleaned = digits.slice(0, 2) + "/" + digits.slice(2);
        } else {
            cleaned = digits.slice(0, 2) + "/" + digits.slice(2, 4) + "/" + digits.slice(4, 8);
        }
        onChange("gpkdDate", cleaned);
    };

    const sectionTitle = mode === "create" ? "Thêm mới doanh nghiệp" : mode === "edit" ? "Chỉnh sửa doanh nghiệp" : "Chi tiết doanh nghiệp";

    return (
        <>
            <div className="space-y-4">
                {/* Section: Thông tin doanh nghiệp (Card 1) */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                    <h3 className="text-[17px] font-bold text-gray-950 mb-4">{sectionTitle}</h3>
                    <div className="grid grid-cols-3 gap-4">
                        <InputLegend
                            label="Tên doanh nghiệp"
                            require
                            input={{
                                type: "text",
                                placeholder: "Nhập tên doanh nghiệp",
                                value: form.companyName,
                                onChange: (e) => onChange("companyName", (e.target as HTMLInputElement).value),
                                disabled: isViewMode,
                            }}
                            errorMess={errors.companyName}
                        />
                        <InputLegend
                            label="Mã số thuế"
                            require
                            input={{
                                type: "text",
                                placeholder: "VD: 0123456789 hoặc 0123456789-001",
                                value: form.taxCode,
                                onChange: (e) => handleTaxCodeChange((e.target as HTMLInputElement).value),
                                maxLength: 14,
                                disabled: isTaxCodeDisabled,
                            }}
                            errorMess={errors.taxCode}
                        />
                        <SelectLegend
                            label="Loại hình kinh doanh"
                            require
                            select={{
                                value: form.businessType,
                                onChange: (e) => onChange("businessType", (e.target as HTMLSelectElement).value),
                                disabled: isViewMode,
                            }}
                            errorMess={errors.businessType}
                        >
                            <option value="">Chọn loại hình</option>
                            {businessTypes.map((bt) => (
                                <option key={bt.id} value={bt.id?.toString() || ""}>
                                    {bt.code} - {bt.name}
                                </option>
                            ))}
                        </SelectLegend>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mt-4">
                        <SelectLegend
                            label="Ngành nghề kinh doanh chính"
                            require
                            select={{
                                value: form.industry,
                                onChange: (e) => onChange("industry", (e.target as HTMLSelectElement).value),
                                disabled: isViewMode,
                            }}
                            errorMess={errors.industry}
                        >
                            <option value="">Chọn ngành nghề</option>
                            {industries.map((ind) => (
                                <option key={ind.id} value={ind.id?.toString() || ""}>
                                    {ind.code} - {ind.name}
                                </option>
                            ))}
                        </SelectLegend>
                        
                        <FormField label="Ngày cấp GPKD">
                            <div className="relative flex items-center w-full">
                                <input
                                    type="text"
                                    placeholder="dd/mm/yyyy"
                                    value={form.gpkdDate}
                                    onChange={(e) => handleGpkdDateChange(e.target.value)}
                                    maxLength={10}
                                    disabled={isViewMode}
                                    className="outline-none px-2 py-1.5 w-full text-sm bg-transparent disabled:bg-gray-100 disabled:cursor-not-allowed pr-8"
                                />
                                <Calendar className="absolute right-2.5 size-4 text-gray-400 pointer-events-none" />
                            </div>
                        </FormField>

                        <SelectLegend
                            label="Tỉnh/Thành phố ĐKKD"
                            require
                            select={{
                                value: form.gpkdProvince,
                                onChange: (e) => onChange("gpkdProvince", (e.target as HTMLSelectElement).value),
                                disabled: isViewMode,
                            }}
                            errorMess={errors.gpkdProvince}
                        >
                            <option value="">Chọn tỉnh/TP</option>
                            <option value="Thành phố Hồ Chí Minh">Thành phố Hồ Chí Minh</option>
                            <option value="Hà Nội">Hà Nội</option>
                            <option value="Đà Nẵng">Đà Nẵng</option>
                        </SelectLegend>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mt-4">
                        <SelectLegend
                            label="Phường/Xã ĐKKD"
                            require
                            select={{
                                value: form.gpkdWard,
                                onChange: (e) => onChange("gpkdWard", (e.target as HTMLSelectElement).value),
                                disabled: isViewMode,
                            }}
                            errorMess={errors.gpkdWard}
                        >
                            <option value="">Chọn phường/xã</option>
                            <option value="Phường Bình Thọ">Phường Bình Thọ</option>
                            <option value="Phường Tân Định">Phường Tân Định</option>
                            <option value="Phường Hiệp Bình Phước">Phường Hiệp Bình Phước</option>
                            <option value="Phường Linh Trung">Phường Linh Trung</option>
                        </SelectLegend>
                        <div className="col-span-2">
                            <InputLegend
                                label="Địa chỉ"
                                input={{
                                    type: "text",
                                    placeholder: "Nhập địa chỉ",
                                    value: form.address,
                                    onChange: (e) => onChange("address", (e.target as HTMLInputElement).value),
                                    disabled: isViewMode,
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* Section: Thông tin liên hệ & File đính kèm (Card 2) */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                    <div>
                        <h3 className="text-[17px] font-bold text-gray-950 mb-4">Thông tin liên hệ</h3>
                        <div className="grid grid-cols-3 gap-4">
                            <InputLegend
                                label="Tên viết bằng tiếng nước ngoài"
                                input={{
                                    type: "text",
                                    placeholder: "Tên viết bằng tiếng nước ngoài",
                                    value: form.foreignName,
                                    onChange: (e) => onChange("foreignName", (e.target as HTMLInputElement).value),
                                    disabled: isViewMode,
                                }}
                            />
                            <InputLegend
                                label="Email"
                                require
                                input={{
                                    type: "email",
                                    placeholder: "Nhập email",
                                    value: form.email,
                                    onChange: (e) => onChange("email", (e.target as HTMLInputElement).value),
                                    disabled: isEmailDisabled,
                                }}
                                errorMess={errors.email}
                            />
                            <InputLegend
                                label="Số điện thoại cơ quan"
                                input={{
                                    type: "text",
                                    placeholder: "Số điện thoại cơ quan",
                                    value: form.phone,
                                    onChange: (e) => onChange("phone", (e.target as HTMLInputElement).value),
                                    disabled: isViewMode,
                                }}
                            />
                        </div>
                        <div className="grid grid-cols-3 gap-4 mt-4">
                            <SelectLegend
                                label="Tỉnh/TP hoạt động KD"
                                select={{
                                    value: form.businessProvince,
                                    onChange: (e) => onChange("businessProvince", (e.target as HTMLSelectElement).value),
                                    disabled: isViewMode,
                                }}
                            >
                                <option value="">Chọn tỉnh/TP</option>
                                <option value="Thành phố Hồ Chí Minh">Thành phố Hồ Chí Minh</option>
                                <option value="Hà Nội">Hà Nội</option>
                                <option value="Đà Nẵng">Đà Nẵng</option>
                            </SelectLegend>
                            <SelectLegend
                                label="Phường/Xã hoạt động KD"
                                select={{
                                    value: form.businessWard,
                                    onChange: (e) => onChange("businessWard", (e.target as HTMLSelectElement).value),
                                    disabled: isViewMode,
                                }}
                            >
                                <option value="">Chọn phường/xã</option>
                                <option value="Phường Bình Thọ">Phường Bình Thọ</option>
                                <option value="Phường Tân Định">Phường Tân Định</option>
                                <option value="Phường Hiệp Bình Phước">Phường Hiệp Bình Phước</option>
                            </SelectLegend>
                            <InputLegend
                                label="Địa điểm kinh doanh"
                                input={{
                                    type: "text",
                                    placeholder: "Địa điểm kinh doanh",
                                    value: form.businessAddress,
                                    onChange: (e) => onChange("businessAddress", (e.target as HTMLInputElement).value),
                                    disabled: isViewMode,
                                }}
                            />
                        </div>
                        <div className="grid grid-cols-3 gap-4 mt-4">
                            <InputLegend
                                label="Người đứng đầu doanh nghiệp"
                                input={{
                                    type: "text",
                                    placeholder: "Người đứng đầu doanh nghiệp",
                                    value: form.representative,
                                    onChange: (e) => onChange("representative", (e.target as HTMLInputElement).value),
                                    disabled: isViewMode,
                                }}
                            />
                            <InputLegend
                                label="SĐT liên hệ người đứng đầu"
                                input={{
                                    type: "text",
                                    placeholder: "SĐT liên hệ người đứng đầu",
                                    value: form.representativePhone,
                                    onChange: (e) => onChange("representativePhone", (e.target as HTMLInputElement).value),
                                    disabled: isViewMode,
                                }}
                            />
                            <div />
                        </div>
                    </div>

                    {/* Section: File đính kèm */}
                    <div className="mt-6 border-t border-gray-100 pt-6">
                        <h3 className="text-[17px] font-bold text-gray-950 mb-3">File đính kèm</h3>
                        <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                            {/* Table header */}
                            <div className="grid grid-cols-[1.5fr_1.5fr_120px] bg-[#F4F6F8] text-xs font-semibold text-gray-700 border-b border-gray-200 px-4 py-3">
                                <div>Tên file</div>
                                <div>Thông tin file</div>
                                <div className="text-center">Thao tác</div>
                            </div>

                            {/* Render each attachment group as flat rows */}
                            {attachmentGroups.map((group, groupIdx) => {
                                const hasFile = group.files.length > 0;
                                const firstFile = group.files[0];
                                return (
                                    <div key={group.groupName} className="grid grid-cols-[1.5fr_1.5fr_120px] text-xs text-gray-700 border-b border-gray-200 last:border-b-0 hover:bg-gray-50/50 transition-colors px-4 py-3 items-center min-h-[50px]">
                                        <div className="font-semibold text-gray-800">{group.groupName}</div>
                                        <div className="truncate pr-4">
                                            {hasFile ? (
                                                <span className="text-gray-900 font-semibold">{firstFile.name}</span>
                                            ) : (
                                                <span className="text-gray-400 italic">Chưa có file nào</span>
                                            )}
                                        </div>
                                        <div className="flex items-center justify-center gap-4">
                                            {hasFile && (
                                                <button
                                                    type="button"
                                                    onClick={() => handlePreview(firstFile)}
                                                    className="text-gray-400 hover:text-primary transition-colors cursor-pointer"
                                                    title="Xem"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                            )}
                                            {!isViewMode && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleUploadClick(groupIdx)}
                                                    className="text-gray-400 hover:text-primary transition-colors cursor-pointer"
                                                    title="Tải lên"
                                                >
                                                    <Upload size={16} />
                                                </button>
                                            )}
                                            {hasFile && !isViewMode && (
                                                <button
                                                    type="button"
                                                    onClick={() => onRemoveFile(groupIdx, firstFile.id)}
                                                    className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                                                    title="Xóa"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                            {/* Hidden file input */}
                                            <input
                                                ref={(el) => {
                                                    fileInputRefs.current[groupIdx] = el;
                                                }}
                                                type="file"
                                                className="hidden"
                                                onChange={(e) => handleFileChange(groupIdx, e)}
                                                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif"
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* File Preview Modal - Images only */}
            {previewFile && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded-xl shadow-2xl w-[600px] max-h-[80vh] flex flex-col overflow-hidden">
                        {/* Header */}
                        <div className="bg-primary px-5 py-3 flex items-center justify-between">
                            <h3 className="text-white font-semibold text-sm">Xem file</h3>
                            <button type="button" onClick={closePreview} className="text-white/80 hover:text-white transition-colors">
                                <i className="fa-solid fa-xmark text-lg" />
                            </button>
                        </div>
                        {/* Content */}
                        <div className="flex-1 overflow-auto p-6">
                            <div className="flex flex-col items-center gap-4">
                                <div className="text-center">
                                    <p className="font-semibold text-gray-800">{previewFile.name}</p>
                                    <p className="text-sm text-gray-500 mt-1">{previewFile.size}</p>
                                </div>
                                {previewFile.url && (
                                    <div className="mt-2 border border-gray-200 rounded-lg overflow-hidden max-w-full">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={previewFile.url} alt={previewFile.name} className="max-w-full max-h-[400px] object-contain" />
                                    </div>
                                )}
                            </div>
                        </div>
                        {/* Footer */}
                        <div className="px-5 py-3 border-t border-gray-100 flex justify-end">
                            <button type="button" onClick={closePreview} className="px-4 py-2 text-sm text-primary hover:text-primary/80 font-medium transition-colors">
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
