"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { Eye, X } from "lucide-react";
import TopHero from "@/components/TopHero";
import AccountInfoPopup from "@/components/popup/account-info-popup";
import { BusinessApi } from "@/api/business";
import { BusinessFileApi } from "@/api/businessFile";
import { TypeOfBusinessApi } from "@/api/typeOfBusiness";
import { BusinessIndustryApi } from "@/api/businessIndustry";
import type { Business } from "@/types/business";
import type { TypeOfBusiness } from "@/types/typeOfBusiness";
import type { BusinessIndustry } from "@/types/businessIndustry";
import { toast } from "sonner";

interface UploadedFile {
    id: number;
    name: string;
    size: string;
    url?: string;
    mimeType?: string;
    file?: File;
}

interface AttachmentGroup {
    groupName: string;
    files: UploadedFile[];
}

const defaultAttachmentGroups: AttachmentGroup[] = [
    { groupName: "Giấy phép kinh doanh", files: [] },
    { groupName: "Giấy tờ khác", files: [] },
];

function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="grid grid-cols-[280px_1fr] py-2">
            <span className="text-sm font-semibold text-gray-800">{label}</span>
            <span className="text-sm text-gray-700">{value || "—"}</span>
        </div>
    );
}

function formatDate(dateStr?: string | Date) {
    if (!dateStr) return "—";
    try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return "—";
        const d = String(date.getDate()).padStart(2, "0");
        const m = String(date.getMonth() + 1).padStart(2, "0");
        const y = date.getFullYear();
        return `${d}/${m}/${y}`;
    } catch {
        return "—";
    }
}

function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ViewBusinessPage() {
    const router = useRouter();
    const params = useParams();
    const [business, setBusiness] = useState<Business | null>(null);
    const [loading, setLoading] = useState(true);
    const [businessTypes, setBusinessTypes] = useState<TypeOfBusiness[]>([]);
    const [industries, setIndustries] = useState<BusinessIndustry[]>([]);
    const [attachmentGroups, setAttachmentGroups] = useState<AttachmentGroup[]>(defaultAttachmentGroups.map((g) => ({ ...g, files: [] })));
    const [previewFile, setPreviewFile] = useState<UploadedFile | null>(null);

    // Account Popup state
    const [isAccountInfoOpen, setIsAccountInfoOpen] = useState(false);
    const [accountDetails, setAccountDetails] = useState<{ accountNumber: string; password?: string } | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const id = Number(params.id);
                if (isNaN(id)) {
                    toast.error("ID doanh nghiệp không hợp lệ");
                    router.push("/business-managements");
                    return;
                }

                // Fetch business, files, types, and industries
                const [data, files, types, inds] = await Promise.all([BusinessApi.getById(id), BusinessFileApi.getFiles(id), TypeOfBusinessApi.findAll(), BusinessIndustryApi.findLevel4()]);

                setBusiness(data);
                setBusinessTypes(types);
                setIndustries(inds);

                // Set Account details
                const account = (data as any).accounts?.[0];
                setAccountDetails({
                    accountNumber: account?.username || data.taxCode,
                    password: account?.displayPassword,
                });

                // Map files to groups
                if (files.length > 0) {
                    const TYPE_TO_GROUP: Record<string, string> = {
                        business_license: "Giấy phép kinh doanh",
                        other: "Giấy tờ khác",
                    };

                    setAttachmentGroups((prev) =>
                        prev.map((group) => {
                            const matchingFile = files.find((f) => TYPE_TO_GROUP[f.fileType] === group.groupName);
                            if (matchingFile) {
                                return {
                                    ...group,
                                    files: [
                                        {
                                            id: matchingFile.id,
                                            name: matchingFile.fileName,
                                            size: formatFileSize(matchingFile.fileSize),
                                            url: `${process.env.NEXT_PUBLIC_API_URL}${matchingFile.filePath}`,
                                            mimeType: matchingFile.mimeType,
                                        },
                                    ],
                                };
                            }
                            return group;
                        }),
                    );
                }
            } catch (error) {
                console.error("Error loading business detail:", error);
                toast.error("Không thể tải thông tin chi tiết doanh nghiệp");
                router.push("/business-managements");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [params.id, router]);

    const businessTypeLabel = useMemo(() => {
        if (!business) return "—";
        const bt = businessTypes.find((t) => t.id === business.typeOfBusinessId);
        return bt ? `${bt.code} - ${bt.name}` : "—";
    }, [business, businessTypes]);

    const industryLabel = useMemo(() => {
        if (!business) return "—";
        const ind = industries.find((i) => i.id === business.businessIndustryId);
        if (!ind) return "—";
        return `${ind.code ?? ""} - ${ind.name ?? ""}`.trim();
    }, [business, industries]);

    const gpkdAddress = useMemo(() => {
        if (!business) return "—";
        return [business.registeredAddress, business.registeredWard, business.registeredProvince].filter(Boolean).join(", ") || "—";
    }, [business]);

    const businessAddr = useMemo(() => {
        if (!business) return "—";
        return [business.businessLocation, business.operatingWard, business.operatingProvince].filter(Boolean).join(", ") || "—";
    }, [business]);

    const handlePreview = (file: UploadedFile) => {
        const isImage = file.file?.type.startsWith("image/") || file.mimeType?.startsWith("image/") || /\.(jpg|jpeg|png|gif|webp)$/i.test(file.name);
        if (isImage && file.url) {
            setPreviewFile(file);
        } else if (file.url) {
            window.open(file.url, "_blank");
        }
    };

    if (loading) {
        return <div className="p-10 text-center text-sm text-gray-500">Đang tải thông tin doanh nghiệp...</div>;
    }

    if (!business) return null;

    return (
        <div className="h-screen flex flex-col py-2">
            <div className="shrink-0">
                <TopHero lable="Chi tiết doanh nghiệp" />
            </div>

            <div className="bg-white rounded-lg border border-gray-100 shadow-sm flex flex-col flex-1 min-h-0 overflow-hidden mt-2">
                {/* Content - Scrollable */}
                <div className="flex-1 overflow-y-auto px-8 py-6 min-h-0 bg-[#F4F6F8] space-y-4">
                    {/* Section: Thông tin về hồ sơ */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                        <h3 className="text-[17px] font-bold text-gray-950 mb-4">Thông tin về hồ sơ</h3>
                        <div className="divide-y divide-gray-100">
                            <InfoRow label="Mã số thuế :" value={business.taxCode} />
                            <InfoRow label="Tên doanh nghiệp :" value={business.businessName} />
                            <InfoRow label="Tên viết bằng tiếng nước ngoài :" value={business.foreignName || "—"} />
                            <InfoRow label="Ngày cấp GPKD:" value={formatDate(business.businessLicenseDate)} />
                            <InfoRow label="Email:" value={business.email} />
                            <InfoRow label="Loại hình kinh doanh:" value={businessTypeLabel} />
                            <InfoRow label="Ngành nghề kinh doanh:" value={industryLabel} />
                            <InfoRow label="Địa chỉ đăng kí giấy phép kinh doanh :" value={gpkdAddress} />
                            <InfoRow label="Địa điểm kinh doanh :" value={businessAddr} />
                            <InfoRow label="Người đứng đầu doanh nghiệp:" value={business.legalRepresentative || "—"} />
                            <InfoRow label="SĐT người đứng đầu:" value={business.representativePhone || "—"} />

                            {/* Thông tin tài khoản click trigger popup */}
                            <div className="grid grid-cols-[280px_1fr] py-2 items-center">
                                <span className="text-sm font-semibold text-gray-800">Thông tin tài khoản :</span>
                                <button type="button" onClick={() => setIsAccountInfoOpen(true)} className="w-fit text-sm text-[#2f65ff] hover:underline font-semibold flex items-center gap-1.5 cursor-pointer">
                                    Xem tài khoản đăng nhập
                                </button>
                            </div>
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

                {/* Footer buttons */}
                <div className="shrink-0 px-8 py-4 border-t border-gray-100 flex items-center justify-end gap-3 bg-white">
                    <button type="button" onClick={() => router.push("/business-managements")} className="px-5 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors cursor-pointer">
                        Huỷ bỏ
                    </button>
                </div>
            </div>

            {/* Account Info Popup */}
            {accountDetails && <AccountInfoPopup isOpen={isAccountInfoOpen} onClose={() => setIsAccountInfoOpen(false)} accountNumber={accountDetails.accountNumber} password={accountDetails.password} />}

            {/* File Preview Modal - Images only */}
            {previewFile && (
                <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded-xl shadow-2xl w-150 max-h-[80vh] flex flex-col overflow-hidden">
                        <div className="bg-primary px-5 py-3 flex items-center justify-between">
                            <h3 className="text-white font-semibold text-sm">Xem file</h3>
                            <button type="button" onClick={() => setPreviewFile(null)} className="text-white/80 hover:text-white transition-colors cursor-pointer">
                                <X className="size-5" />
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
                            <button type="button" onClick={() => setPreviewFile(null)} className="px-4 py-2 text-sm text-primary hover:text-primary/80 font-medium transition-colors cursor-pointer">
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
