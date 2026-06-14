"use client";

import { useState, useEffect, useMemo } from "react";
import type { EnterpriseFormData, AttachmentGroup, UploadedFile } from "./EnterpriseStepOne";
import { Eye } from "lucide-react";
import { TypeOfBusinessApi } from "@/api/typeOfBusiness";
import { BusinessIndustryApi } from "@/api/businessIndustry";
import type { TypeOfBusiness } from "@/types/typeOfBusiness";
import type { BusinessIndustry } from "@/types/businessIndustry";

type Props = {
    form: EnterpriseFormData;
    attachmentGroups: AttachmentGroup[];
};

function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="grid grid-cols-[280px_1fr] py-2">
            <span className="text-sm font-semibold text-gray-800">{label}</span>
            <span className="text-sm text-gray-700">{value || "—"}</span>
        </div>
    );
}

function formatDate(dateStr: string) {
    if (!dateStr) return "—";
    // Check if it's in YYYY-MM-DD format (typical for <input type="date">)
    if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
        const [y, m, d] = dateStr.split("-");
        return `${d}/${m}/${y}`;
    }
    return dateStr;
}

export default function EnterpriseStepConfirm({ form, attachmentGroups }: Props) {
    const [previewFile, setPreviewFile] = useState<UploadedFile | null>(null);
    const [businessTypes, setBusinessTypes] = useState<TypeOfBusiness[]>([]);
    const [industries, setIndustries] = useState<BusinessIndustry[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [types, inds] = await Promise.all([TypeOfBusinessApi.findAll(), BusinessIndustryApi.findAll()]);
                setBusinessTypes(types);
                setIndustries(inds);
            } catch (error) {
                console.error("Error fetching display data:", error);
            }
        };
        fetchData();
    }, []);

    const businessTypeLabel = useMemo(() => {
        const bt = businessTypes.find((t) => t.id?.toString() === form.businessType);
        return bt ? `${bt.code} - ${bt.name}` : form.businessType;
    }, [form.businessType, businessTypes]);

    const industryLabel = useMemo(() => {
        const ind = industries.find((i) => i.id?.toString() === form.industry);
        return ind ? `${ind.code} - ${ind.name}` : form.industry;
    }, [form.industry, industries]);

    // Build address string
    const gpkdAddress = [form.address, form.gpkdWard, form.gpkdProvince].filter(Boolean).join(", ");
    const businessAddr = [form.businessAddress, form.businessWard, form.businessProvince].filter(Boolean).join(", ");

    const handlePreview = (file: UploadedFile) => {
        // If it's an image, show in modal preview
        const isImage = file.file?.type.startsWith("image/") || file.mimeType?.startsWith("image/") || /\.(jpg|jpeg|png|gif|webp)$/i.test(file.name);
        if (isImage && file.url) {
            setPreviewFile(file);
        } else if (file.url) {
            window.open(file.url, "_blank");
        }
    };

    const closePreview = () => {
        setPreviewFile(null);
    };

    return (
        <>
            <div className="space-y-4">
                {/* Section: Thông tin về hồ sơ */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                    <h3 className="text-[17px] font-bold text-gray-950 mb-4">Thông tin về hồ sơ</h3>
                    <div className="divide-y divide-gray-100">
                        <InfoRow label="Mã số thuế :" value={form.taxCode} />
                        <InfoRow label="Tên doanh nghiệp :" value={form.companyName} />
                        <InfoRow label="Tên viết bằng tiếng nước ngoài :" value={form.foreignName} />
                        <InfoRow label="Ngày cấp GPKD:" value={formatDate(form.gpkdDate)} />
                        <InfoRow label="Email:" value={form.email} />
                        <InfoRow label="Loại hình kinh doanh:" value={businessTypeLabel} />
                        <InfoRow label="Ngành nghề kinh doanh:" value={industryLabel} />
                        <InfoRow label="Địa chỉ đăng kí giấy phép kinh doanh :" value={gpkdAddress} />
                        <InfoRow label="Địa điểm kinh doanh :" value={businessAddr} />
                        <InfoRow label="Người đứng đầu doanh nghiệp:" value={form.representative} />
                        <InfoRow label="SĐT người đứng đầu:" value={form.representativePhone} />
                    </div>
                </div>

                {/* Section: File đính kèm */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                    <h3 className="text-[17px] font-bold text-gray-950 mb-4">File đính kèm</h3>
                    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                        {/* Table header */}
                        <div className="grid grid-cols-[1.5fr_1.5fr_100px] bg-[#F4F6F8] text-xs font-semibold text-gray-700 border-b border-gray-200 px-4 py-3">
                            <div>Tên file</div>
                            <div>Thông tin file</div>
                            <div className="text-center">Thao tác</div>
                        </div>

                        {/* Render each attachment group as flat rows */}
                        {attachmentGroups.map((group) => {
                            const hasFile = group.files.length > 0;
                            const firstFile = group.files[0];
                            return (
                                <div key={group.groupName} className="grid grid-cols-[1.5fr_1.5fr_100px] text-xs text-gray-700 border-b border-gray-200 last:border-b-0 hover:bg-gray-50/50 transition-colors px-4 py-3 items-center min-h-12.5">
                                    <div className="font-semibold text-gray-800">{group.groupName}</div>
                                    <div className="truncate pr-4">{hasFile ? <span className="text-gray-900 font-semibold">{firstFile.name}</span> : <span className="text-gray-400 italic">Chưa có file nào</span>}</div>
                                    <div className="flex items-center justify-center">
                                        {hasFile ? (
                                            <button type="button" onClick={() => handlePreview(firstFile)} className="text-gray-400 hover:text-primary transition-colors cursor-pointer" title="Xem">
                                                <Eye size={16} />
                                            </button>
                                        ) : (
                                            <span className="text-gray-300">—</span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* File Preview Modal - Images only */}
            {previewFile && (
                <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded-xl shadow-2xl w-150 max-h-[80vh] flex flex-col overflow-hidden">
                        <div className="bg-primary px-5 py-3 flex items-center justify-between">
                            <h3 className="text-white font-semibold text-sm">Xem file</h3>
                            <button type="button" onClick={closePreview} className="text-white/80 hover:text-white transition-colors">
                                <i className="fa-solid fa-xmark text-lg" />
                            </button>
                        </div>
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
