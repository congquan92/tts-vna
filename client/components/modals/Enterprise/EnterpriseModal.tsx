"use client";

import { useRef, useState, useEffect } from "react";
import EnterpriseStepOne from "./EnterpriseStepOne";
import EnterpriseStepConfirm from "./EnterpriseStepConfirm";
import AccountInfoPopup from "../AccountInfoPopup";
import type { EnterpriseFormData, EnterpriseFormErrors, EnterpriseFormMode, AttachmentGroup, UploadedFile } from "./EnterpriseStepOne";
import { BusinessApi } from "@/api/business";
import type { Business } from "@/types/business";
import { toast as sonnerToast } from "sonner";
import { ChevronRight, Check } from "lucide-react";

type Props = {
    isOpen: boolean;
    onClose: () => void;
    onSave: (form: EnterpriseFormData, attachments: AttachmentGroup[]) => void;
    mode?: EnterpriseFormMode;
    initialData?: Business | null;
    userRole?: string;
};

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

// Vietnamese tax code regex: 10 digits OR 10 digits + dash + 3 digits
const TAX_CODE_REGEX = /^(\d{10})$|^(\d{10}-\d{3})$/;

// Helper to format file size
function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Generate mock account info
function generateAccountInfo(taxCode: string) {
    return {
        accountNumber: taxCode.replace(/-/g, "") || "0000000000",
        password: "12345678",
    };
}

// Convert Business to EnterpriseFormData
function enterpriseToForm(enterprise: Business): EnterpriseFormData {
    return {
        companyName: enterprise.businessName,
        taxCode: enterprise.taxCode,
        businessType: enterprise.typeOfBusinessId?.toString() || "",
        industry: enterprise.businessIndustryId?.toString() || "",
        gpkdDate: enterprise.businessLicenseDate ? new Date(enterprise.businessLicenseDate).toISOString().split('T')[0] : "",
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

export default function EnterpriseModal({ isOpen, onClose, onSave, mode = "create", initialData = null, userRole = "" }: Props) {
    const [currentStep, setCurrentStep] = useState(1);
    const [form, setForm] = useState<EnterpriseFormData>({ ...emptyForm });
    const [errors, setErrors] = useState<EnterpriseFormErrors>({ ...emptyErrors });
    const [attachmentGroups, setAttachmentGroups] = useState<AttachmentGroup[]>(defaultAttachmentGroups.map((g) => ({ ...g, files: [] })));
    const nextFileIdRef = useRef(1);

    // Account info popup state (only for create mode)
    const [showAccountPopup, setShowAccountPopup] = useState(false);
    const [accountInfo, setAccountInfo] = useState({ accountNumber: "", password: "" });

    // Toast state
    const [toast, setToast] = useState<{ show: boolean; type: "success" | "error"; message: string }>({
        show: false,
        type: "success",
        message: "",
    });

    // Load initial data when provided (edit/view modes)
    useEffect(() => {
        if (initialData && (mode === "edit" || mode === "view")) {
            setForm(enterpriseToForm(initialData));
            // In a real app, we might need to fetch attachments for the business
            setAttachmentGroups(defaultAttachmentGroups.map((g) => ({ ...g, files: [] })));
        } else if (mode === "create") {
            setForm({ ...emptyForm });
            setAttachmentGroups(defaultAttachmentGroups.map((g) => ({ ...g, files: [] })));
        }
        setErrors({ ...emptyErrors });
        setCurrentStep(1);
    }, [initialData, mode]);

    if (!isOpen) return null;

    const showToast = (type: "success" | "error", message: string) => {
        setToast({ show: true, type, message });
        setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 3000);
    };

    const handleChange = (field: keyof EnterpriseFormData, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        // Clear error on change
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

        // Tax code validation (only in create mode)
        if (mode === "create") {
            if (!form.taxCode.trim()) {
                next.taxCode = "Mã số thuế là bắt buộc";
                valid = false;
            } else if (!TAX_CODE_REGEX.test(form.taxCode.trim())) {
                next.taxCode = "Mã số thuế không hợp lệ. Định dạng: 10 chữ số hoặc 10 chữ số-3 chữ số (VD: 0123456789 hoặc 0123456789-001)";
                valid = false;
            }
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
        try {
            const payload = {
                taxCode: form.taxCode,
                businessName: form.companyName,
                foreignName: form.foreignName,
                typeOfBusinessId: Number(form.businessType),
                businessIndustryId: Number(form.industry),
                businessLicenseDate: form.gpkdDate || undefined,
                registeredProvince: form.gpkdProvince,
                registeredWard: form.gpkdWard,
                registeredAddress: form.address,
                email: form.email,
                officePhone: form.phone,
                operatingProvince: form.businessProvince,
                operatingWard: form.businessWard,
                businessLocation: form.businessAddress,
                legalRepresentative: form.representative,
                representativePhone: form.representativePhone,
            };

            if (mode === "create") {
                await BusinessApi.create(payload);
                // Generate account info and show popup
                const info = generateAccountInfo(form.taxCode);
                setAccountInfo(info);
                showToast("success", "Khai báo thành công");
                setShowAccountPopup(true);
            } else if (mode === "edit" && initialData) {
                await BusinessApi.update(initialData.id, payload);
                showToast("success", "Cập nhật doanh nghiệp thành công");
                setTimeout(() => {
                    resetAndClose();
                }, 1500);
            }
            onSave(form, attachmentGroups);
        } catch (error) {
            console.error("Error saving business:", error);
            showToast("error", "Có lỗi xảy ra khi lưu thông tin");
        }
    };

    const resetAndClose = () => {
        setForm({ ...emptyForm });
        setErrors({ ...emptyErrors });
        setAttachmentGroups(defaultAttachmentGroups.map((g) => ({ ...g, files: [] })));
        setCurrentStep(1);
        nextFileIdRef.current = 1;
        onClose();
    };

    const handleCloseAccountPopup = () => {
        setShowAccountPopup(false);
        resetAndClose();
    };

    const handleCancel = () => {
        resetAndClose();
    };

    const handleAddFiles = (groupIndex: number, files: FileList) => {
        const newFiles: UploadedFile[] = Array.from(files).map((file) => {
            const id = nextFileIdRef.current++;
            return {
                id,
                name: file.name,
                size: formatFileSize(file.size),
                file,
                url: URL.createObjectURL(file),
            };
        });
        setAttachmentGroups((prev) => prev.map((group, idx) => (idx === groupIndex ? { ...group, files: [...group.files, ...newFiles] } : group)));
    };

    const handleRemoveFile = (groupIndex: number, fileId: number) => {
        setAttachmentGroups((prev) => prev.map((group, idx) => (idx === groupIndex ? { ...group, files: group.files.filter((f) => f.id !== fileId) } : group)));
    };

    const isViewMode = mode === "view";

    const pageTitle = mode === "create" ? "Thêm mới doanh nghiệp" : mode === "edit" ? "Chỉnh sửa doanh nghiệp" : "Chi tiết doanh nghiệp";

    const steps = [
        { number: 1, label: "Thông tin doanh nghiệp" },
        { number: 2, label: mode === "edit" ? "Xác nhận cập nhật" : "Xác nhận đăng ký" },
    ];

    return (
        <>
            {/* Inline Page View */}
            <div className="h-screen flex flex-col py-2">
                {/* Top Bar */}
                <div className="shrink-0 bg-white px-5 py-3 rounded-lg border border-gray-100 shadow-sm flex items-center justify-between">
                    <h1 className="text-base font-bold text-gray-800">{pageTitle}</h1>
                    <button type="button" onClick={handleCancel} className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-gray-300 text-gray-600 rounded hover:bg-gray-50 transition-colors">
                        <i className="fa-solid fa-arrow-left text-xs" />
                        <span>Quay lại danh sách</span>
                    </button>
                </div>

                {/* Main content */}
                <div className="bg-white rounded-lg border border-gray-100 shadow-sm flex flex-col flex-1 min-h-0 overflow-hidden mt-2">
                    {/* Stepper (hidden in view mode) */}
                    {!isViewMode && (
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
                    )}

                    {/* Content - Scrollable */}
                    <div className="flex-1 overflow-y-auto px-8 py-6 min-h-0 bg-[#F4F6F8]">
                        {isViewMode ? (
                            <EnterpriseStepConfirm form={form} attachmentGroups={attachmentGroups} />
                        ) : (
                            <>
                                {currentStep === 1 && (
                                    <EnterpriseStepOne form={form} errors={errors} attachmentGroups={attachmentGroups} onChange={handleChange} onAddFiles={handleAddFiles} onRemoveFile={handleRemoveFile} mode={mode} userRole={userRole} />
                                )}
                                {currentStep === 2 && <EnterpriseStepConfirm form={form} attachmentGroups={attachmentGroups} />}
                            </>
                        )}
                    </div>

                    {/* Footer buttons */}
                    <div className="shrink-0 px-8 py-4 border-t border-gray-100 flex items-center justify-end gap-3 bg-white">
                        {isViewMode && (
                            <button type="button" onClick={handleCancel} className="px-5 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors">
                                Quay lại
                            </button>
                        )}
                        {!isViewMode && currentStep === 1 && (
                            <>
                                <button type="button" onClick={handleCancel} className="px-5 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors">
                                    Hủy bỏ
                                </button>
                                <button type="button" onClick={handleNext} className="px-5 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2">
                                    <ChevronRight size={14} />
                                    Tiếp tục
                                </button>
                            </>
                        )}
                        {!isViewMode && currentStep === 2 && (
                            <>
                                <button type="button" onClick={handleBack} className="px-5 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors">
                                    Trở về
                                </button>
                                <button type="button" onClick={handleConfirm} className="px-5 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2">
                                    <Check size={14} />
                                    Xác nhận
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Toast Notification */}
            {toast.show && (
                <div className="fixed top-4 right-4 z-[80] animate-[slideInRight_0.3s_ease-out]">
                    <div className={`rounded-lg px-5 py-3 flex items-center gap-3 shadow-lg ${toast.type === "success" ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}>
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${toast.type === "success" ? "bg-green-500" : "bg-red-500"}`}>
                            <i className={`fa-solid ${toast.type === "success" ? "fa-check" : "fa-xmark"} text-white text-[10px]`} />
                        </div>
                        <span className={`text-sm font-medium ${toast.type === "success" ? "text-green-800" : "text-red-800"}`}>{toast.message}</span>
                        <button type="button" onClick={() => setToast((prev) => ({ ...prev, show: false }))} className={`${toast.type === "success" ? "text-green-600 hover:text-green-800" : "text-red-600 hover:text-red-800"} transition-colors ml-2`}>
                            <i className="fa-solid fa-xmark text-sm" />
                        </button>
                    </div>
                </div>
            )}

            {/* Account Info Popup (create mode only) */}
            {mode === "create" && <AccountInfoPopup isOpen={showAccountPopup} onClose={handleCloseAccountPopup} accountNumber={accountInfo.accountNumber} password={accountInfo.password} />}
        </>
    );
}
