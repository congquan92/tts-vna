"use client";

import { useState } from "react";
import type { EnterpriseFormData, AttachmentGroup, UploadedFile } from "./EnterpriseStepOne";

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

export default function EnterpriseStepConfirm({ form, attachmentGroups }: Props) {
    const [previewFile, setPreviewFile] = useState<UploadedFile | null>(null);

    // Build address string
    const gpkdAddress = [form.address, form.gpkdWard, form.gpkdProvince].filter(Boolean).join(", ");
    const businessAddr = [form.businessAddress, form.businessWard, form.businessProvince].filter(Boolean).join(", ");

    const handlePreview = (file: UploadedFile) => {
        if (file.file?.type.startsWith("image/") && file.url) {
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
            <div className="space-y-6">
                {/* Section: Thông tin về hồ sơ */}
                <div>
                    <h3 className="text-sm font-bold text-gray-800 mb-4">Thông tin về hồ sơ</h3>
                    <div className="space-y-0">
                        <InfoRow label="Mã số thuế :" value={form.taxCode} />
                        <InfoRow label="Tên doanh nghiệp :" value={form.companyName} />
                        <InfoRow label="Tên viết bằng tiếng nước ngoài :" value={form.foreignName} />
                        <InfoRow label="Ngày cấp GPKD:" value={form.gpkdDate} />
                        <InfoRow label="Email:" value={form.email} />
                        <InfoRow label="Loại hình kinh doanh:" value={form.businessType} />
                        <InfoRow label="Ngành nghề kinh doanh" value={form.industry} />
                        <InfoRow label="Địa chỉ đăng kí giấy phép kinh doanh :" value={gpkdAddress} />
                        <InfoRow label="Địa điểm kinh doanh :" value={businessAddr} />
                        <InfoRow label="Người đứng đầu doanh nghiệp" value={form.representative} />
                        <InfoRow label="SĐT người đứng đầu" value={form.representativePhone} />
                    </div>
                </div>

                {/* Section: File đính kèm */}
                <div>
                    <div className="border-t border-gray-200 pt-4">
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                            {/* Table header */}
                            <div className="grid grid-cols-[40px_1fr_1fr_100px] bg-gray-50 text-xs font-medium text-gray-500 border-b border-gray-200">
                                <div className="px-3 py-2.5 text-center">STT</div>
                                <div className="px-4 py-2.5">Tên file</div>
                                <div className="px-4 py-2.5">Thông tin file</div>
                                <div className="px-4 py-2.5 text-center">Thao tác</div>
                            </div>

                            {/* Render each attachment group */}
                            {attachmentGroups.map((group, groupIdx) => (
                                <div key={group.groupName}>
                                    {/* Group header row */}
                                    <div className="grid grid-cols-[40px_1fr_1fr_100px] bg-primary/5 border-b border-gray-200">
                                        <div className="px-3 py-2.5 text-center text-xs font-semibold text-gray-600">{groupIdx + 1}</div>
                                        <div className="px-4 py-2.5 text-sm font-semibold text-gray-800 col-span-3">{group.groupName}</div>
                                    </div>

                                    {/* Files */}
                                    {group.files.length === 0 ? (
                                        <div className="px-4 py-4 text-center text-sm text-gray-400 italic border-b border-gray-100">Chưa có file nào</div>
                                    ) : (
                                        group.files.map((file, fileIdx) => (
                                            <div key={file.id} className="grid grid-cols-[40px_1fr_1fr_100px] text-sm text-gray-700 border-b border-gray-100 last:border-b-0">
                                                <div className="px-3 py-2.5 text-center text-xs text-gray-400">
                                                    {groupIdx + 1}.{fileIdx + 1}
                                                </div>
                                                <div className="px-4 py-2.5 flex items-center gap-2">
                                                    <i className="fa-solid fa-file-lines text-primary/60 text-xs" />
                                                    <span className="truncate">{file.name}</span>
                                                </div>
                                                <div className="px-4 py-2.5 text-gray-500">{file.size}</div>
                                                <div className="px-4 py-2.5 flex items-center justify-center">
                                                    <button type="button" onClick={() => handlePreview(file)} className="text-gray-400 hover:text-primary transition-colors" title="Xem">
                                                        <i className="fa-solid fa-eye text-xs" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* File Preview Modal - Images only */}
            {previewFile && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded-xl shadow-2xl w-[600px] max-h-[80vh] flex flex-col overflow-hidden">
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
                                        <img src={previewFile.url} alt={previewFile.name} className="max-w-full max-h-[400px] object-contain" />
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
