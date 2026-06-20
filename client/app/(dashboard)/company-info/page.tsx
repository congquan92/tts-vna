"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import EnterpriseStepOne from "@/components/modals/Enterprise/EnterpriseStepOne";
import EnterpriseStepConfirm from "@/components/modals/Enterprise/EnterpriseStepConfirm";
import ChangeEmailPopup from "@/components/popup/change-email-popup";
import type { EnterpriseFormData, EnterpriseFormErrors, AttachmentGroup, UploadedFile } from "@/components/modals/Enterprise/EnterpriseStepOne";
import { BusinessApi } from "@/api/business";
import { BusinessFileApi } from "@/api/businessFile";
import type { Business } from "@/types/business";
import { toast } from "sonner";
import { ChevronRight, Check } from "lucide-react";
import { getErrorMessage } from "@/utils/error-handle";
import LoadingOverlay from "@/components/LoadingOverlay";
import TopHero from "@/components/TopHero";
import Button from "@/components/ui/Button";

const emptyForm: EnterpriseFormData = {
    companyName: "",
    taxCode: "",
    businessType: "",
    industry: "",
    gpkdDate: "",
    gpkdProvince: "",
    gpkdWard: "",
    address: "",
    foreignName: "",
    email: "",
    phone: "",
    businessProvince: "",
    businessWard: "",
    businessAddress: "",
    representative: "",
    representativePhone: "",
};

const emptyErrors: EnterpriseFormErrors = {
    companyName: "",
    taxCode: "",
    businessType: "",
    industry: "",
    gpkdProvince: "",
    gpkdWard: "",
    address: "",
    foreignName: "",
    email: "",
    gpkdDate: "",
    phone: "",
    businessProvince: "",
    businessWard: "",
    businessAddress: "",
    representative: "",
    representativePhone: "",
};

const defaultAttachmentGroups: AttachmentGroup[] = [
    { groupName: "Giấy phép kinh doanh", files: [] },
    { groupName: "Giấy tờ khác", files: [] },
];

function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDateToYYYYMMDD(dateString?: string | Date) {
    if (!dateString) return "";
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return "";
        return date.toISOString().split("T")[0];
    } catch {
        return "";
    }
}

function enterpriseToForm(enterprise: Business): EnterpriseFormData {
    return {
        companyName: enterprise.businessName,
        taxCode: enterprise.taxCode,
        businessType: enterprise.typeOfBusinessId?.toString() || "",
        industry: enterprise.businessIndustryId?.toString() || "",
        gpkdDate: formatDateToYYYYMMDD(enterprise.businessLicenseDate),
        gpkdProvince: enterprise.registeredProvince,
        gpkdWard: enterprise.registeredWard,
        address: enterprise.registeredAddress,
        foreignName: enterprise.foreignName || "",
        email: enterprise.email,
        phone: enterprise.officePhone || "",
        businessProvince: enterprise.operatingProvince || "",
        businessWard: enterprise.operatingWard || "",
        businessAddress: enterprise.businessLocation || "",
        representative: enterprise.legalRepresentative || "",
        representativePhone: enterprise.representativePhone || "",
    };
}

const PHONE_REGEX = /^[0-9]{8,15}$/;
const MOBILE_REGEX = /^[0-9]{10,11}$/;

export default function CompanyInfoPage() {
    const { user, loading: authLoading, refreshProfile } = useAuth();
    const router = useRouter();
    const [business, setBusiness] = useState<Business | null>(null);
    const [currentStep, setCurrentStep] = useState(1);
    const [form, setForm] = useState<EnterpriseFormData>({ ...emptyForm });
    const [errors, setErrors] = useState<EnterpriseFormErrors>({ ...emptyErrors });
    const [attachmentGroups, setAttachmentGroups] = useState<AttachmentGroup[]>(defaultAttachmentGroups.map((g) => ({ ...g, files: [] })));
    const [deletedFileIds, setDeletedFileIds] = useState<number[]>([]);
    const nextFileIdRef = useRef(1);

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [isChangeEmailOpen, setIsChangeEmailOpen] = useState(false);

    const fetchBusiness = useCallback(async () => {
        if (!user || !user.profileId) return;
        setLoading(true);
        try {
            const id = user.profileId;
            // Fetch business and its files
            const [data, files] = await Promise.all([BusinessApi.getById(id), BusinessFileApi.getFiles(id)]);

            setBusiness(data);
            setForm(enterpriseToForm(data));

            // Map files to groups correctly by fileType
            if (files.length > 0) {
                const TYPE_TO_GROUP: Record<string, string> = {
                    business_license: "Giấy phép kinh doanh",
                    other: "Giấy tờ khác",
                };

                setAttachmentGroups(
                    defaultAttachmentGroups.map((group) => {
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
                        return { ...group, files: [] };
                    }),
                );
            } else {
                setAttachmentGroups(defaultAttachmentGroups.map((g) => ({ ...g, files: [] })));
            }
            setDeletedFileIds([]);
        } catch (error) {
            console.error("Error loading business:", error);
            toast.error("Không thể tải thông tin doanh nghiệp");
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (!authLoading) {
            if (!user || user.orgType !== "DOANH_NGHIEP" || !user.profileId) {
                toast.error("Bạn không có quyền truy cập trang này");
                router.push("/");
                return;
            }
            const timer = setTimeout(() => {
                fetchBusiness();
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [authLoading, user, router, fetchBusiness]);

    const handleChange = (field: keyof EnterpriseFormData, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        if (field in errors) {
            setErrors((prev) => ({ ...prev, [field]: "" }));
        }
    };

    const validate = (): boolean => {
        const next: EnterpriseFormErrors = { ...emptyErrors };
        let valid = true;

        // --- Section: Thông tin doanh nghiệp ---
        if (!form.companyName.trim()) {
            next.companyName = "Tên doanh nghiệp là bắt buộc";
            valid = false;
        }

        if (!form.businessType) {
            next.businessType = "Loại hình kinh doanh là bắt buộc";
            valid = false;
        }
        if (!form.industry) {
            next.industry = "Ngành nghề là bắt buộc";
            valid = false;
        }
        if (!form.gpkdProvince) {
            next.gpkdProvince = "Tỉnh/TP ĐKKD là bắt buộc";
            valid = false;
        }
        if (!form.gpkdWard) {
            next.gpkdWard = "Phường/Xã ĐKKD là bắt buộc";
            valid = false;
        }
        if (!form.address.trim()) {
            next.address = "Địa chỉ ĐKKD là bắt buộc";
            valid = false;
        }

        if (!form.gpkdDate) {
            next.gpkdDate = "Ngày cấp GPKD là bắt buộc";
            valid = false;
        } else {
            const selectedDate = new Date(form.gpkdDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (selectedDate > today) {
                next.gpkdDate = "Ngày cấp GPKD không được là ngày trong tương lai";
                valid = false;
            }
        }

        // --- Section: Thông tin liên hệ ---
        if (!form.email.trim()) {
            next.email = "Email là bắt buộc";
            valid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
            next.email = "Email không hợp lệ";
            valid = false;
        }

        if (form.phone.trim() && !PHONE_REGEX.test(form.phone.trim())) {
            next.phone = "Số điện thoại cơ quan không hợp lệ (8-15 chữ số)";
            valid = false;
        }

        if (form.foreignName.trim() && form.foreignName.trim().length > 255) {
            next.foreignName = "Tên tiếng nước ngoài tối đa 255 ký tự";
            valid = false;
        }

        if (form.representativePhone.trim() && !MOBILE_REGEX.test(form.representativePhone.trim())) {
            next.representativePhone = "SĐT không hợp lệ (10-11 chữ số)";
            valid = false;
        }

        setErrors(next);
        return valid;
    };

    const handleNext = () => {
        if (validate()) {
            setCurrentStep(2);
        }
    };

    const handleBack = () => {
        setCurrentStep(1);
    };

    const handleConfirm = async () => {
        if (!business) return;
        setSubmitting(true);
        try {
            const payload = {
                businessName: form.companyName,
                foreignName: form.foreignName.trim() || undefined,
                typeOfBusinessId: Number(form.businessType),
                businessIndustryId: Number(form.industry),
                businessLicenseDate: form.gpkdDate || undefined,
                registeredProvince: form.gpkdProvince,
                registeredWard: form.gpkdWard,
                registeredAddress: form.address,
                email: form.email,
                officePhone: form.phone.trim() || undefined,
                operatingProvince: form.businessProvince.trim() || undefined,
                operatingWard: form.businessWard.trim() || undefined,
                businessLocation: form.businessAddress.trim() || undefined,
                legalRepresentative: form.representative.trim() || undefined,
                representativePhone: form.representativePhone.trim() || undefined,
            };

            await BusinessApi.update(business.id, payload);

            // 1. Delete removed files from backend
            if (deletedFileIds.length > 0) {
                await Promise.all(deletedFileIds.map((id) => BusinessFileApi.deleteFile(id)));
            }

            // 2. Upload new files
            const uploadPromises: Promise<unknown>[] = [];
            const GROUP_TO_TYPE: Record<string, string> = {
                "Giấy phép kinh doanh": "business_license",
                "Giấy tờ khác": "other",
            };

            attachmentGroups.forEach((group) => {
                group.files.forEach((uploadedFile) => {
                    // Only upload if it's a new file (has the 'file' blob)
                    if (uploadedFile.file) {
                        const fileType = GROUP_TO_TYPE[group.groupName] || "other";
                        uploadPromises.push(BusinessFileApi.upload(business.id, uploadedFile.file, fileType));
                    }
                });
            });

            if (uploadPromises.length > 0) {
                await Promise.all(uploadPromises);
            }

            toast.success("Cập nhật thông tin doanh nghiệp thành công");
            await refreshProfile();
            setCurrentStep(1);
            await fetchBusiness();
        } catch (error) {
            console.error("Error saving business:", error);
            toast.error(getErrorMessage(error, "Có lỗi xảy ra khi lưu thông tin"));
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = () => {
        if (business) {
            setForm(enterpriseToForm(business));
            setErrors({ ...emptyErrors });
            toast.info("Đã khôi phục thông tin ban đầu");
        }
    };

    const handleAddFiles = (groupIndex: number, files: FileList) => {
        if (files.length === 0) return;

        const file = files[0];
        const isImage = file.type.startsWith("image/");
        const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
        if (!isImage && !isPdf) {
            toast.error("Chỉ chấp nhận file hình ảnh hoặc PDF");
            return;
        }

        // Clean up old object URLs for this group
        const currentGroup = attachmentGroups[groupIndex];
        currentGroup.files.forEach((f) => {
            if (f.url) {
                if (f.url.startsWith("blob:")) {
                    URL.revokeObjectURL(f.url);
                } else {
                    // Existing backend file - track for deletion
                    setDeletedFileIds((prev) => [...prev, f.id]);
                }
            }
        });

        const id = nextFileIdRef.current++;
        const newFile: UploadedFile = {
            id,
            name: file.name,
            size: formatFileSize(file.size),
            file,
            url: URL.createObjectURL(file),
        };

        setAttachmentGroups((prev) => prev.map((group, idx) => (idx === groupIndex ? { ...group, files: [newFile] } : group)));
    };

    const handleRemoveFile = (groupIndex: number, fileId: number) => {
        // Clean up object URL and track for deletion
        const group = attachmentGroups[groupIndex];
        const fileToRemove = group.files.find((f) => f.id === fileId);

        if (fileToRemove) {
            if (fileToRemove.url?.startsWith("blob:")) {
                URL.revokeObjectURL(fileToRemove.url);
            } else {
                // Existing file from backend - track ID to delete on save
                setDeletedFileIds((prev) => [...prev, fileId]);
            }
        }

        setAttachmentGroups((prev) => prev.map((group, idx) => (idx === groupIndex ? { ...group, files: group.files.filter((f) => f.id !== fileId) } : group)));
    };

    const steps = [
        { number: 1, label: "Thông tin doanh nghiệp" },
        { number: 2, label: "Xác nhận cập nhật" },
    ];

    if (authLoading || loading) {
        return (
            <div className="h-screen flex items-center justify-center bg-[#F4F6F8]">
                <div className="text-center">
                    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <span className="text-gray-500 text-sm">Đang tải thông tin doanh nghiệp...</span>
                </div>
            </div>
        );
    }

    if (!business) {
        return (
            <div className="h-screen flex items-center justify-center bg-[#F4F6F8]">
                <span className="text-red-500 text-sm">Không tìm thấy thông tin doanh nghiệp.</span>
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col">
            <LoadingOverlay isLoading={submitting} />
            {/* Top Hero */}
            <div className="shrink-0">
                <TopHero
                    lable="Thông tin doanh nghiệp"
                    component={
                        <div className="flex gap-3 items-center">
                            {currentStep === 1 && (
                                <>
                                    <Button type="button" variant="outline" size="sm" onClick={handleCancel} className="flex gap-2 items-center text-sm font-semibold border-none cursor-pointer">
                                        <span className="text-gray-500 font-semibold">Huỷ Bỏ</span>
                                    </Button>
                                    <Button type="button" variant="primary" size="sm" onClick={handleNext} className="flex gap-2 items-center text-sm font-semibold cursor-pointer">
                                        <ChevronRight size={14} />
                                        <span>Tiếp tục</span>
                                    </Button>
                                </>
                            )}
                            {currentStep === 2 && (
                                <>
                                    <Button type="button" variant="outline" size="sm" onClick={handleBack} className="flex gap-2 items-center text-sm font-semibold border-none cursor-pointer">
                                        <span className="text-gray-500 font-semibold">Trở về</span>
                                    </Button>
                                    <Button type="button" variant="primary" size="sm" onClick={handleConfirm} className="flex gap-2 items-center text-sm font-semibold cursor-pointer">
                                        <Check size={14} />
                                        <span>Xác nhận</span>
                                    </Button>
                                </>
                            )}
                        </div>
                    }
                />
            </div>
            {/* Main content */}
            <div className="bg-white rounded-lg border border-gray-100 shadow-sm flex flex-col flex-1 min-h-0 overflow-hidden mt-2">
                {/* Stepper */}
                <div className="shrink-0 px-8 pt-6 pb-4 border-b border-gray-100">
                    <div className="flex items-center justify-center gap-0">
                        {steps.map((step, idx) => (
                            <div key={step.number} className="flex items-center">
                                <div className="flex items-center gap-2">
                                    <div
                                        className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 transition-colors ${
                                            currentStep > step.number ? "bg-blue-500 text-white" : currentStep === step.number ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-500"
                                        }`}
                                    >
                                        {currentStep > step.number ? <Check size={14} /> : step.number}
                                    </div>
                                    <span className={`text-sm whitespace-nowrap ${currentStep >= step.number ? "text-gray-800 font-medium" : "text-gray-400"}`}>{step.label}</span>
                                </div>

                                {idx < steps.length - 1 && <div className={`w-32 h-0.5 mx-4 transition-colors ${currentStep > step.number ? "bg-blue-500" : "bg-gray-200"}`} />}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Content - Scrollable */}
                <div className="flex-1 overflow-y-auto px-8 py-6 min-h-0 bg-[#F4F6F8]">
                    {currentStep === 1 && (
                        <EnterpriseStepOne
                            form={form}
                            errors={errors}
                            attachmentGroups={attachmentGroups}
                            onChange={handleChange}
                            onAddFiles={handleAddFiles}
                            onRemoveFile={handleRemoveFile}
                            mode="edit"
                            disableEmail={true}
                            onEmailChangeClick={() => setIsChangeEmailOpen(true)}
                        />
                    )}
                    {currentStep === 2 && <EnterpriseStepConfirm form={form} attachmentGroups={attachmentGroups} />}
                </div>
            </div>
            <ChangeEmailPopup
                open={isChangeEmailOpen}
                onClose={() => {
                    setIsChangeEmailOpen(false);
                    fetchBusiness();
                }}
                currentEmail={business.email}
            />
        </div>
    );
}
