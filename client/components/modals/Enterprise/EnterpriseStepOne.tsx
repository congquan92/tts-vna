"use client";

import { useRef, useState, useEffect, useMemo } from "react";
import { InputField } from "@/components/form/InputField";
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
    address: string;
    foreignName: string;
    email: string;
    gpkdDate: string;
    phone: string;
    businessProvince: string;
    businessWard: string;
    businessAddress: string;
    representative: string;
    representativePhone: string;
};

export type UploadedFile = {
    id: number;
    name: string;
    size: string;
    file?: File;
    url?: string;
    mimeType?: string;
};

export type AttachmentGroup = {
    groupName: string;
    files: UploadedFile[];
};

type Ward = {
    ward_code: string;
    name: string;
    province_code: string;
};

type Province = {
    province_code: string;
    name: string;
    short_name: string;
    code: string;
    place_type: string;
    wards: Ward[];
};

type Props = {
    form: EnterpriseFormData;
    errors: EnterpriseFormErrors;
    attachmentGroups: AttachmentGroup[];
    onChange: (field: keyof EnterpriseFormData, value: string) => void;
    onAddFiles: (groupIndex: number, files: FileList) => void;
    onRemoveFile: (groupIndex: number, fileId: number) => void;
    mode?: EnterpriseFormMode;
    disableEmail?: boolean;
    onEmailChangeClick?: () => void;
};

export default function EnterpriseStepOne({
    form,
    errors,
    attachmentGroups,
    onChange,
    onAddFiles,
    onRemoveFile,
    mode = "create",
    disableEmail = false,
    onEmailChangeClick,
}: Props) {
    const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const [previewFile, setPreviewFile] = useState<UploadedFile | null>(null);
    const [businessTypes, setBusinessTypes] = useState<TypeOfBusiness[]>([]);
    const [industries, setIndustries] = useState<BusinessIndustry[]>([]);
    const [provincesData, setProvincesData] = useState<Province[]>([]);

    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const [types, inds, geoRes] = await Promise.all([TypeOfBusinessApi.findAll(), BusinessIndustryApi.findLevel4(), fetch("/address.json")]);
                setBusinessTypes(types.filter((t) => t.status));
                setIndustries(inds);

                const geoData: Province[] = await geoRes.json();
                setProvincesData(geoData);
            } catch (error) {
                console.error("Error fetching options:", error);
            }
        };
        fetchOptions();
    }, []);

    // Derive wards from provincesData and current form state
    const availableGpkdWards = useMemo(() => {
        if (!provincesData.length || !form.gpkdProvince) return [];
        const prov = provincesData.find((p) => p.name === form.gpkdProvince);
        return prov ? prov.wards.map((w) => ({ label: w.name, value: w.name })) : [];
    }, [form.gpkdProvince, provincesData]);

    const availableBusinessWards = useMemo(() => {
        if (!provincesData.length || !form.businessProvince) return [];
        const prov = provincesData.find((p) => p.name === form.businessProvince);
        return prov ? prov.wards.map((w) => ({ label: w.name, value: w.name })) : [];
    }, [form.businessProvince, provincesData]);

    const isViewMode = mode === "view";
    const isEditMode = mode === "edit";

    // In edit mode, tax code is always read-only
    const isTaxCodeDisabled = isViewMode || isEditMode;

    // In edit mode, email is now editable
    const isEmailDisabled = isViewMode;

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
        const isImage = file.file?.type.startsWith("image/") || file.mimeType?.startsWith("image/") || /\.(jpg|jpeg|png|gif|webp)$/i.test(file.name);
        if (isImage && file.url) {
            setPreviewFile(file);
        } else if (file.url) {
            // For non-image files, open in a new browser tab
            window.open(file.url, "_blank");
        }
    };

    const closePreview = () => {
        setPreviewFile(null);
    };

    // Handle province change and reset ward
    const handleProvinceChange = (field: "gpkdProvince" | "businessProvince", value: string) => {
        onChange(field, value);
        if (field === "gpkdProvince") {
            onChange("gpkdWard", "");
        } else {
            onChange("businessWard", "");
        }
    };

    // Handle tax code input - only allow digits and dash, max 15 digits, no leading minus (no negative)
    const handleTaxCodeChange = (value: string) => {
        if (isTaxCodeDisabled) return;
        // Strip any character that is not a digit or dash
        let cleaned = value.replace(/[^0-9-]/g, "");
        // Prevent leading dash (no negative number)
        if (cleaned.startsWith("-")) {
            cleaned = cleaned.substring(1);
        }
        // Limit digit count to 15
        const digitCount = cleaned.replace(/\D/g, "").length;
        if (digitCount <= 15) {
            onChange("taxCode", cleaned);
        }
    };

    const sectionTitle = mode === "create" ? "Thêm mới doanh nghiệp" : mode === "edit" ? "Chỉnh sửa doanh nghiệp" : "Chi tiết doanh nghiệp";

    const today = useMemo(() => new Date().toISOString().split("T")[0], []);

    return (
        <>
            <div className="space-y-4">
                {/* Section: Thông tin doanh nghiệp (Card 1) */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                    <h3 className="text-[17px] font-bold text-gray-950 mb-4">{sectionTitle}</h3>
                    <div className="grid grid-cols-3 gap-4">
                        <InputField label="Tên doanh nghiệp *" value={form.companyName} onChange={(e) => onChange("companyName", e.target.value)} placeholder="Nhập tên doanh nghiệp" disabled={isViewMode} error={errors.companyName} />
                        <InputField label="Mã số thuế *" value={form.taxCode} onChange={(e) => handleTaxCodeChange(e.target.value)} placeholder="Nhập mã số thuế" disabled={isTaxCodeDisabled} error={errors.taxCode} />
                        <InputField
                            label="Loại hình kinh doanh *"
                            isSelect
                            isSearchable
                            value={form.businessType}
                            onChange={(e) => onChange("businessType", e.target.value)}
                            options={businessTypes.map((bt) => ({
                                label: `${bt.code} - ${bt.name}`,
                                value: bt.id?.toString() || "",
                            }))}
                            disabled={isViewMode}
                            error={errors.businessType}
                            placeholder="Chọn loại hình"
                        />
                    </div>

                    <div className="grid grid-cols-3 gap-4 mt-4">
                        <InputField
                            label="Ngành nghề kinh doanh chính *"
                            isSelect
                            isSearchable
                            value={form.industry}
                            onChange={(e) => onChange("industry", e.target.value)}
                            options={industries.map((ind) => ({
                                label: `${ind.code} - ${ind.name}`,
                                value: ind.id?.toString() || "",
                            }))}
                            disabled={isViewMode}
                            error={errors.industry}
                            placeholder="Chọn ngành nghề"
                        />

                        <InputField label="Ngày cấp GPKD *" type="date" value={form.gpkdDate} onChange={(e) => onChange("gpkdDate", e.target.value)} placeholder="Chọn ngày" icon={Calendar} disabled={isViewMode} max={today} error={errors.gpkdDate} />

                        <InputField
                            label="Tỉnh/Thành phố ĐKKD *"
                            isSelect
                            isSearchable
                            value={form.gpkdProvince}
                            onChange={(e) => handleProvinceChange("gpkdProvince", e.target.value)}
                            options={provincesData.map((p) => ({ label: p.name, value: p.name }))}
                            disabled={isViewMode}
                            error={errors.gpkdProvince}
                            placeholder="Chọn tỉnh/TP"
                        />
                    </div>

                    <div className="grid grid-cols-3 gap-4 mt-4">
                        <InputField
                            label="Phường/Xã ĐKKD *"
                            isSelect
                            isSearchable
                            value={form.gpkdWard}
                            onChange={(e) => onChange("gpkdWard", e.target.value)}
                            options={availableGpkdWards}
                            disabled={isViewMode || !form.gpkdProvince}
                            error={errors.gpkdWard}
                            placeholder="Chọn phường/xã"
                        />
                        <div className="col-span-2">
                            <InputField label="Địa chỉ *" value={form.address} onChange={(e) => onChange("address", e.target.value)} placeholder="Nhập địa chỉ" disabled={isViewMode} error={errors.address} />
                        </div>
                    </div>
                </div>

                {/* Section: Thông tin liên hệ & File đính kèm (Card 2) */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                    <div>
                        <h3 className="text-[17px] font-bold text-gray-950 mb-4">Thông tin liên hệ</h3>
                        <div className="grid grid-cols-3 gap-4">
                            <InputField
                                label="Tên viết bằng tiếng nước ngoài"
                                value={form.foreignName}
                                onChange={(e) => onChange("foreignName", e.target.value)}
                                placeholder="Tên viết bằng tiếng nước ngoài"
                                disabled={isViewMode}
                                error={errors.foreignName}
                            />
                            <div className="flex gap-2 items-center">
                                <div className="flex-1">
                                    <InputField
                                        label="Email *"
                                        type="email"
                                        value={form.email}
                                        onChange={(e) => onChange("email", e.target.value)}
                                        placeholder="Nhập email"
                                        disabled={disableEmail || isEmailDisabled}
                                        error={errors.email}
                                    />
                                </div>
                                {disableEmail && onEmailChangeClick && (
                                    <button
                                        type="button"
                                        onClick={onEmailChangeClick}
                                        className="text-sm text-blue-500 font-semibold cursor-pointer hover:underline focus:outline-none shrink-0"
                                    >
                                        Thay đổi
                                    </button>
                                )}
                            </div>
                            <InputField label="Số điện thoại cơ quan" value={form.phone} onChange={(e) => onChange("phone", e.target.value)} placeholder="Số điện thoại cơ quan" disabled={isViewMode} error={errors.phone} />
                        </div>
                        <div className="grid grid-cols-3 gap-4 mt-4">
                            <InputField
                                label="Tỉnh/TP hoạt động KD"
                                isSelect
                                isSearchable
                                value={form.businessProvince}
                                onChange={(e) => handleProvinceChange("businessProvince", e.target.value)}
                                options={provincesData.map((p) => ({ label: p.name, value: p.name }))}
                                disabled={isViewMode}
                                placeholder="Chọn tỉnh/TP"
                                error={errors.businessProvince}
                            />
                            <InputField
                                label="Phường/Xã hoạt động KD"
                                isSelect
                                isSearchable
                                value={form.businessWard}
                                onChange={(e) => onChange("businessWard", e.target.value)}
                                options={availableBusinessWards}
                                disabled={isViewMode || !form.businessProvince}
                                placeholder="Chọn phường/xã"
                                error={errors.businessWard}
                            />
                            <InputField label="Địa điểm kinh doanh" value={form.businessAddress} onChange={(e) => onChange("businessAddress", e.target.value)} placeholder="Địa điểm kinh doanh" disabled={isViewMode} error={errors.businessAddress} />
                        </div>
                        <div className="grid grid-cols-3 gap-4 mt-4">
                            <InputField
                                label="Người đứng đầu doanh nghiệp"
                                value={form.representative}
                                onChange={(e) => onChange("representative", e.target.value)}
                                placeholder="Người đứng đầu doanh nghiệp"
                                disabled={isViewMode}
                                error={errors.representative}
                            />
                            <InputField
                                label="SĐT liên hệ người đứng đầu"
                                value={form.representativePhone}
                                onChange={(e) => onChange("representativePhone", e.target.value)}
                                placeholder="SĐT liên hệ người đứng đầu"
                                disabled={isViewMode}
                                error={errors.representativePhone}
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
                                    <div key={group.groupName} className="grid grid-cols-[1.5fr_1.5fr_120px] text-xs text-gray-700 border-b border-gray-200 last:border-b-0 hover:bg-gray-50/50 transition-colors px-4 py-3 items-center min-h-12.5">
                                        <div className="font-semibold text-gray-800">{group.groupName}</div>
                                        <div className="truncate pr-4">{hasFile ? <span className="text-gray-900 font-semibold">{firstFile.name}</span> : <span className="text-gray-400 italic">Chưa có file nào</span>}</div>
                                        <div className="flex items-center justify-center gap-4">
                                            {hasFile && (
                                                <button type="button" onClick={() => handlePreview(firstFile)} className="text-gray-400 hover:text-primary transition-colors cursor-pointer" title="Xem">
                                                    <Eye size={16} />
                                                </button>
                                            )}
                                            {!isViewMode && (
                                                <button type="button" onClick={() => handleUploadClick(groupIdx)} className="text-gray-400 hover:text-primary transition-colors cursor-pointer" title="Tải lên">
                                                    <Upload size={16} />
                                                </button>
                                            )}
                                            {hasFile && !isViewMode && (
                                                <button type="button" onClick={() => onRemoveFile(groupIdx, firstFile.id)} className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer" title="Xóa">
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
                                                accept=".pdf,image/*"
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
                <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded-xl shadow-2xl w-150 max-h-[80vh] flex flex-col overflow-hidden">
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
                                        <img src={previewFile.url} alt={previewFile.name} className="max-w-full max-h-100 object-contain" />
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
