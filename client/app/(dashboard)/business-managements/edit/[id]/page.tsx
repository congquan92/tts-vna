"use client";

import { useRef, useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import EnterpriseStepOne from "@/components/modals/Enterprise/EnterpriseStepOne";
import EnterpriseStepConfirm from "@/components/modals/Enterprise/EnterpriseStepConfirm";
import type { EnterpriseFormData, EnterpriseFormErrors, AttachmentGroup, UploadedFile } from "@/components/modals/Enterprise/EnterpriseStepOne";
import { BusinessApi } from "@/api/business";
import type { Business } from "@/types/business";
import { toast } from "sonner";
import { ChevronRight, Check } from "lucide-react";

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
    email: "",
};

const defaultAttachmentGroups: AttachmentGroup[] = [
    { groupName: "Giấy phép kinh doanh", files: [] },
    { groupName: "Giấy tờ khác", files: [] },
];

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

export default function EditBusinessPage() {
    const router = useRouter();
    const params = useParams();
    const [business, setBusiness] = useState<Business | null>(null);
    const [currentStep, setCurrentStep] = useState(1);
    const [form, setForm] = useState<EnterpriseFormData>({ ...emptyForm });
    const [errors, setErrors] = useState<EnterpriseFormErrors>({ ...emptyErrors });
    const [attachmentGroups, setAttachmentGroups] = useState<AttachmentGroup[]>(defaultAttachmentGroups.map((g) => ({ ...g, files: [] })));
    const nextFileIdRef = useRef(1);

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchBusiness = async () => {
            try {
                const id = Number(params.id);
                if (isNaN(id)) {
                    toast.error("ID doanh nghiệp không hợp lệ");
                    router.push("/business-managements");
                    return;
                }
                const data = await BusinessApi.getById(id);
                setBusiness(data);
                setForm(enterpriseToForm(data));
            } catch (error) {
                console.error("Error loading business:", error);
                toast.error("Không thể tải thông tin doanh nghiệp");
                router.push("/business-managements");
            } finally {
                setLoading(false);
            }
        };

        fetchBusiness();
    }, [params.id, router]);

    const handleChange = (field: keyof EnterpriseFormData, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        if (field in errors) {
            setErrors((prev) => ({ ...prev, [field]: "" }));
        }
    };

    const validate = (): boolean => {
        const next: EnterpriseFormErrors = { ...emptyErrors };
        let valid = true;

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
        if (!form.email.trim()) {
            next.email = "Email là bắt buộc";
            valid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
            next.email = "Email không hợp lệ";
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
            toast.success("Cập nhật doanh nghiệp thành công");
            router.push("/business-managements");
        } catch (error) {
            console.error("Error saving business:", error);
            toast.error("Có lỗi xảy ra khi lưu thông tin");
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = () => {
        router.push("/business-managements");
    };

    const handleAddFiles = (groupIndex: number, files: FileList) => {
        if (files.length === 0) return;

        // Clean up old object URLs for this group
        const currentGroup = attachmentGroups[groupIndex];
        currentGroup.files.forEach((f) => {
            if (f.url) URL.revokeObjectURL(f.url);
        });

        // Only take the first file
        const file = files[0];
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
        // Clean up object URL
        const group = attachmentGroups[groupIndex];
        const fileToRemove = group.files.find((f) => f.id === fileId);
        if (fileToRemove?.url) URL.revokeObjectURL(fileToRemove.url);

        setAttachmentGroups((prev) => prev.map((group, idx) => (idx === groupIndex ? { ...group, files: group.files.filter((f) => f.id !== fileId) } : group)));
    };

    const steps = [
        { number: 1, label: "Thông tin doanh nghiệp" },
        { number: 2, label: "Xác nhận cập nhật" },
    ];

    if (loading) {
        return <div className="p-10 text-center text-sm text-gray-500">Đang tải thông tin doanh nghiệp...</div>;
    }

    return (
        <div className="h-screen flex flex-col py-2">
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
                                            currentStep > step.number ? "bg-primary text-white" : currentStep === step.number ? "bg-primary text-white" : "bg-gray-200 text-gray-500"
                                        }`}
                                    >
                                        {currentStep > step.number ? <Check size={14} /> : step.number}
                                    </div>
                                    <span className={`text-sm whitespace-nowrap ${currentStep >= step.number ? "text-gray-800 font-medium" : "text-gray-400"}`}>{step.label}</span>
                                </div>

                                {idx < steps.length - 1 && <div className={`w-32 h-0.5 mx-4 transition-colors ${currentStep > step.number ? "bg-primary" : "bg-gray-200"}`} />}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Content - Scrollable */}
                <div className="flex-1 overflow-y-auto px-8 py-6 min-h-0 bg-[#F4F6F8]">
                    {currentStep === 1 && <EnterpriseStepOne form={form} errors={errors} attachmentGroups={attachmentGroups} onChange={handleChange} onAddFiles={handleAddFiles} onRemoveFile={handleRemoveFile} mode="edit" />}
                    {currentStep === 2 && <EnterpriseStepConfirm form={form} attachmentGroups={attachmentGroups} />}
                </div>

                {/* Footer buttons */}
                <div className="shrink-0 px-8 py-4 border-t border-gray-100 flex items-center justify-end gap-3 bg-white">
                    {currentStep === 1 && (
                        <>
                            <button type="button" onClick={handleCancel} className="px-5 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors cursor-pointer">
                                Hủy bỏ
                            </button>
                            <button type="button" onClick={handleNext} className="px-5 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2 cursor-pointer">
                                <ChevronRight size={14} />
                                Tiếp tục
                            </button>
                        </>
                    )}
                    {currentStep === 2 && (
                        <>
                            <button type="button" onClick={handleBack} className="px-5 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors cursor-pointer" disabled={submitting}>
                                Trở về
                            </button>
                            <button type="button" onClick={handleConfirm} className="px-5 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2 cursor-pointer" disabled={submitting}>
                                <Check size={14} />
                                {submitting ? "Đang xử lý..." : "Xác nhận"}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
