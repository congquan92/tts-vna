"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import EnterpriseStepOne from "@/components/modals/Enterprise/EnterpriseStepOne";
import EnterpriseStepConfirm from "@/components/modals/Enterprise/EnterpriseStepConfirm";
import type { EnterpriseFormData, EnterpriseFormErrors, AttachmentGroup, UploadedFile } from "@/components/modals/Enterprise/EnterpriseStepOne";
import { BusinessApi } from "@/api/business";
import { BusinessFileApi } from "@/api/businessFile";
import { toast } from "sonner";
import { ChevronRight, Check } from "lucide-react";
import { getErrorMessage } from "@/utils/error-handle";

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

const TAX_CODE_REGEX = /^(\d{10})$|^(\d{10}-\d{3})$/;

function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// function generateAccountInfo(taxCode: string) {
//     return {
//         accountNumber: taxCode.replace(/-/g, "") || "0000000000",
//         password: "123456",
//     };
// }

const PHONE_REGEX = /^[0-9]{8,15}$/;
const MOBILE_REGEX = /^[0-9]{10,11}$/;

export default function CreateBusinessPage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [form, setForm] = useState<EnterpriseFormData>({ ...emptyForm });
    const [errors, setErrors] = useState<EnterpriseFormErrors>({ ...emptyErrors });
    const [attachmentGroups, setAttachmentGroups] = useState<AttachmentGroup[]>(defaultAttachmentGroups.map((g) => ({ ...g, files: [] })));
    const nextFileIdRef = useRef(1);

    // const [showAccountPopup, setShowAccountPopup] = useState(false);
    // const [accountInfo, setAccountInfo] = useState({ accountNumber: "", password: "" });
    const [submitting, setSubmitting] = useState(false);

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

        if (!form.taxCode.trim()) {
            next.taxCode = "Mã số thuế là bắt buộc";
            valid = false;
        } else if (!TAX_CODE_REGEX.test(form.taxCode.trim())) {
            next.taxCode = "Mã số thuế không hợp lệ. Định dạng: 10 chữ số hoặc 10 chữ số-3 chữ số (VD: 0123456789 hoặc 0123456789-001)";
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
        if (!form.foreignName.trim()) {
            next.foreignName = "Tên viết bằng tiếng nước ngoài là bắt buộc";
            valid = false;
        } else if (form.foreignName.trim().length > 255) {
            next.foreignName = "Tên tiếng nước ngoài tối đa 255 ký tự";
            valid = false;
        }

        if (!form.email.trim()) {
            next.email = "Email là bắt buộc";
            valid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
            next.email = "Email không hợp lệ";
            valid = false;
        }

        if (!form.phone.trim()) {
            next.phone = "Số điện thoại cơ quan là bắt buộc";
            valid = false;
        } else if (!PHONE_REGEX.test(form.phone.trim())) {
            next.phone = "Số điện thoại cơ quan không hợp lệ (8-15 chữ số)";
            valid = false;
        }

        if (!form.businessProvince) {
            next.businessProvince = "Tỉnh/TP hoạt động là bắt buộc";
            valid = false;
        }
        if (!form.businessWard) {
            next.businessWard = "Phường/Xã hoạt động là bắt buộc";
            valid = false;
        }
        if (!form.businessAddress.trim()) {
            next.businessAddress = "Địa điểm kinh doanh là bắt buộc";
            valid = false;
        }

        if (!form.representative.trim()) {
            next.representative = "Người đứng đầu là bắt buộc";
            valid = false;
        }

        if (!form.representativePhone.trim()) {
            next.representativePhone = "SĐT người đứng đầu là bắt buộc";
            valid = false;
        } else if (!MOBILE_REGEX.test(form.representativePhone.trim())) {
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
        setSubmitting(true);
        try {
            const payload = {
                taxCode: form.taxCode,
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
            const res = await BusinessApi.create(payload);
            const business = (res as any).data.business;

            // Upload files
            const uploadPromises: Promise<unknown>[] = [];
            const GROUP_TO_TYPE: Record<string, string> = {
                "Giấy phép kinh doanh": "business_license",
                "Giấy tờ khác": "other",
            };

            attachmentGroups.forEach((group) => {
                group.files.forEach((uploadedFile) => {
                    if (uploadedFile.file) {
                        const fileType = GROUP_TO_TYPE[group.groupName] || "other";
                        uploadPromises.push(BusinessFileApi.upload(business.id, uploadedFile.file, fileType));
                    }
                });
            });

            if (uploadPromises.length > 0) {
                await Promise.all(uploadPromises);
            }

            toast.success("Khai báo thành công");
            router.push("/business-managements");
        } catch (error: any) {
            console.error("Error saving business:", error);
            toast.error(getErrorMessage(error, "Có lỗi xảy ra khi lưu thông tin"));
        } finally {
            setSubmitting(false);
        }
    };

    // const handleCloseAccountPopup = () => {
    //     setShowAccountPopup(false);
    //     router.push("/business-managements");
    // };

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
        { number: 2, label: "Xác nhận đăng ký" },
    ];

    return (
        <div className="h-screen flex flex-col">
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
                    {currentStep === 1 && <EnterpriseStepOne form={form} errors={errors} attachmentGroups={attachmentGroups} onChange={handleChange} onAddFiles={handleAddFiles} onRemoveFile={handleRemoveFile} mode="create" />}
                    {currentStep === 2 && <EnterpriseStepConfirm form={form} attachmentGroups={attachmentGroups} />}
                </div>

                {/* Footer buttons */}
                <div className="shrink-0 px-8 py-4 border-t border-gray-100 flex items-center justify-end gap-3 bg-white">
                    {currentStep === 1 && (
                        <>
                            <button type="button" onClick={handleCancel} className="px-5 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors cursor-pointer">
                                Hủy bỏ
                            </button>
                            <button type="button" onClick={handleNext} className="px-5 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2 cursor-pointer">
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
                            <button type="button" onClick={handleConfirm} className="px-5 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2 cursor-pointer" disabled={submitting}>
                                <Check size={14} />
                                {submitting ? "Đang xử lý..." : "Xác nhận"}
                            </button>
                        </>
                    )}
                </div>
                {/* <AccountInfoPopup isOpen={showAccountPopup} onClose={handleCloseAccountPopup} accountNumber={accountInfo.accountNumber} password={accountInfo.password} /> */}
            </div>
        </div>
    );
}
