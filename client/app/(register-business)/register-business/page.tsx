"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import EnterpriseStepOne from "@/components/modals/Enterprise/EnterpriseStepOne";
import EnterpriseStepConfirm from "@/components/modals/Enterprise/EnterpriseStepConfirm";
import type { EnterpriseFormData, EnterpriseFormErrors, AttachmentGroup, UploadedFile } from "@/components/modals/Enterprise/EnterpriseStepOne";
import { BusinessApi } from "@/api/business";
import { BusinessFileApi } from "@/api/businessFile";
import { toast } from "sonner";
import { ChevronRight, Check, ArrowLeft } from "lucide-react";
import { getErrorMessage } from "@/utils/error-handle";
import LoadingOverlay from "@/components/LoadingOverlay";
import AccountInfoPopup from "@/components/popup/account-info-popup";
import OtpVerificationPopup from "@/components/popup/otp-verification-popup";

const emptyForm: EnterpriseFormData = {
    companyName: "",
    taxCode: "",
    businessType: "",
    industry: "",
    gpkdDate: "",
    gpkdProvince: "Thành phố Hồ Chí Minh",
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

const PHONE_REGEX = /^[0-9]{8,15}$/;
const MOBILE_REGEX = /^[0-9]{10,11}$/;

export default function RegisterBusinessPage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [form, setForm] = useState<EnterpriseFormData>({ ...emptyForm });
    const [errors, setErrors] = useState<EnterpriseFormErrors>({ ...emptyErrors });
    const [attachmentGroups, setAttachmentGroups] = useState<AttachmentGroup[]>(defaultAttachmentGroups.map((g) => ({ ...g, files: [] })));
    const nextFileIdRef = useRef(1);

    const [showOtpPopup, setShowOtpPopup] = useState(false);
    const [showAccountPopup, setShowAccountPopup] = useState(false);
    const [accountInfo, setAccountInfo] = useState({ accountNumber: "", password: "" });
    const [submitting, setSubmitting] = useState(false);
    const [verifiedEmail, setVerifiedEmail] = useState("");

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
        } else {
            const digitCount = form.taxCode.replace(/\D/g, "").length;
            const onlyDigitsAndDash = /^[0-9]+(-[0-9]+)?$/.test(form.taxCode.trim());
            if (!onlyDigitsAndDash || digitCount < 10 || digitCount > 15 || form.taxCode.startsWith("-")) {
                next.taxCode = "Mã số thuế phải từ 10 đến 15 số (không cho nhập âm)";
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
        if (form.foreignName.trim() && form.foreignName.trim().length > 255) {
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

        if (form.phone.trim() && !PHONE_REGEX.test(form.phone.trim())) {
            next.phone = "Số điện thoại cơ quan không hợp lệ (8-15 chữ số)";
            valid = false;
        }

        if (form.representativePhone.trim() && !MOBILE_REGEX.test(form.representativePhone.trim())) {
            next.representativePhone = "SĐT không hợp lệ (10-11 chữ số)";
            valid = false;
        }

        setErrors(next);
        return valid;
    };

    const handleNext = async () => {
        if (validate()) {
            if (form.email.trim() === verifiedEmail) {
                setCurrentStep(2);
                return;
            }
            setSubmitting(true);
            try {
                await BusinessApi.requestOtp(form.email, form.companyName, form.taxCode);
                toast.success("Mã xác thực OTP đã được gửi về email của bạn");
                setShowOtpPopup(true);
            } catch (error: unknown) {
                console.error("Error requesting OTP:", error);
                toast.error(getErrorMessage(error, "Không thể gửi mã OTP. Vui lòng kiểm tra lại thông tin."));
            } finally {
                setSubmitting(false);
            }
        }
    };

    const handleBack = () => {
        setCurrentStep(1);
    };

    // Step 2: Trigger final registration directly (OTP already verified in Step 1)
    const handleConfirmClick = async () => {
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

            const res = await BusinessApi.register(payload) as unknown as {
                data?: {
                    business: { id: number };
                    account?: { username?: string; password?: string };
                };
            };
            const business = res?.data?.business;
            const account = res?.data?.account;

            if (!business) {
                throw new Error("Không có thông tin doanh nghiệp được trả về");
            }

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

            toast.success("Đăng ký tài khoản doanh nghiệp thành công!");

            if (account) {
                setAccountInfo({
                    accountNumber: account.username || "",
                    password: account.password || "",
                });
                setShowAccountPopup(true);
            } else {
                router.push("/login");
            }
        } catch (error: unknown) {
            console.error("Error creating business:", error);
            toast.error(getErrorMessage(error, "Không thể đăng ký doanh nghiệp. Vui lòng kiểm tra lại thông tin."));
        } finally {
            setSubmitting(false);
        }
    };

    // Step 1: Handle verifying the OTP to move to Step 2
    const handleVerifyOtp = async (otp: string): Promise<boolean> => {
        try {
            // 1. Verify OTP first
            const verifyRes = await BusinessApi.verifyOtp(form.email, otp);
            if (!verifyRes.success) {
                return false;
            }

            // 2. OTP is valid, save verified state and move to Step 2
            setVerifiedEmail(form.email.trim());
            setShowOtpPopup(false);
            setCurrentStep(2);
            toast.success("Xác thực email thành công!");
            return true;
        } catch (error: unknown) {
            console.error("Error verifying OTP:", error);
            // Propagate error to verify popup
            throw error;
        }
    };

    // Handle resending the OTP code
    const handleResendOtp = async () => {
        try {
            await BusinessApi.requestOtp(form.email, form.companyName, form.taxCode);
            toast.success("Đã gửi lại mã OTP mới về email của bạn");
        } catch (error: unknown) {
            console.error("Error resending OTP:", error);
            toast.error(getErrorMessage(error, "Không thể gửi lại mã OTP"));
            throw error;
        }
    };

    const handleCloseAccountPopup = () => {
        setShowAccountPopup(false);
        router.push("/login");
    };

    const handleCancel = () => {
        router.push("/login");
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
            if (f.url) URL.revokeObjectURL(f.url);
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
        <div className="h-screen flex flex-col bg-[#F4F6F8]">
            <LoadingOverlay isLoading={submitting} />
            
            {/* Header bar */}
            <header className="bg-white border-b border-gray-200 px-8 py-3 flex items-center justify-between shrink-0 shadow-sm z-10">
                <div className="flex items-center gap-3">
                    <Image src="/quochuy.png" alt="Logo" width={40} height={40} className="object-contain w-auto h-10" />
                    <div>
                        <h1 className="text-[17px] font-bold text-gray-900 leading-tight">HỆ THỐNG QUẢN LÝ VNA</h1>
                        <p className="text-xs text-gray-500 font-medium">Đăng ký tài khoản doanh nghiệp mới</p>
                    </div>
                </div>
                <button 
                    type="button"
                    onClick={handleCancel} 
                    className="flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
                >
                    <ArrowLeft size={16} />
                    Quay lại đăng nhập
                </button>
            </header>

            {/* Main content - Scrollable */}
            <div className="flex-1 overflow-y-auto px-8 py-6 min-h-0">
                <div className="max-w-6xl mx-auto flex flex-col min-h-full">
                    {/* Stepper & Form Container */}
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col flex-1 min-h-0 overflow-hidden">
                        {/* Stepper */}
                        <div className="shrink-0 px-8 pt-6 pb-4 border-b border-gray-100 bg-white">
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
                                    mode="create" 
                                />
                            )}
                            {currentStep === 2 && (
                                <EnterpriseStepConfirm 
                                    form={form} 
                                    attachmentGroups={attachmentGroups} 
                                />
                            )}
                        </div>

                        {/* Footer buttons */}
                        <div className="shrink-0 px-8 py-4 border-t border-gray-200 flex items-center justify-end gap-3 bg-white">
                            {currentStep === 1 && (
                                <>
                                    <button type="button" onClick={handleCancel} className="px-5 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors cursor-pointer font-medium">
                                        Hủy bỏ
                                    </button>
                                    <button type="button" onClick={handleNext} className="px-5 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2 cursor-pointer font-semibold shadow-sm">
                                        <ChevronRight size={14} />
                                        Tiếp tục
                                    </button>
                                </>
                            )}
                            {currentStep === 2 && (
                                <>
                                    <button type="button" onClick={handleBack} className="px-5 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors cursor-pointer font-medium">
                                        Trở về
                                    </button>
                                    <button type="button" onClick={handleConfirmClick} className="px-5 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2 cursor-pointer font-semibold shadow-sm">
                                        <Check size={14} />
                                        Xác nhận đăng ký
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Email OTP Verification Modal */}
            <OtpVerificationPopup 
                isOpen={showOtpPopup} 
                onClose={() => setShowOtpPopup(false)} 
                email={form.email} 
                onVerify={handleVerifyOtp} 
                onResend={handleResendOtp} 
            />

            {/* Credentials Account Info Modal */}
            <AccountInfoPopup isOpen={showAccountPopup} onClose={handleCloseAccountPopup} accountNumber={accountInfo.accountNumber} password={accountInfo.password} />
        </div>
    );
}
