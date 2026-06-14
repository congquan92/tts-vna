"use client";

import { useRef, useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import EnterpriseStepConfirm from "@/components/modals/Enterprise/EnterpriseStepConfirm";
import type { EnterpriseFormData, AttachmentGroup } from "@/components/modals/Enterprise/EnterpriseStepOne";
import { BusinessApi } from "@/api/business";
import type { Business } from "@/types/business";
import { toast } from "sonner";

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

const defaultAttachmentGroups: AttachmentGroup[] = [
    { groupName: "Giấy phép kinh doanh", files: [] },
    { groupName: "Giấy tờ khác", files: [] },
];

function formatDateToDDMMYYYY(dateString?: string | Date) {
    if (!dateString) return "";
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return "";
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    } catch {
        return "";
    }
}

function enterpriseToForm(enterprise: Business): EnterpriseFormData {
    return {
        companyName: enterprise.businessName,
        taxCode: enterprise.taxCode,
        businessType: enterprise.businessType || enterprise.typeOfBusinessId?.toString() || "",
        industry: enterprise.industry || enterprise.businessIndustryId?.toString() || "",
        gpkdDate: formatDateToDDMMYYYY(enterprise.businessLicenseDate),
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

export default function ViewBusinessPage() {
    const router = useRouter();
    const params = useParams();
    const [form, setForm] = useState<EnterpriseFormData>({ ...emptyForm });
    const [attachmentGroups] = useState<AttachmentGroup[]>(
        defaultAttachmentGroups.map((g) => ({ ...g, files: [] }))
    );

    const [loading, setLoading] = useState(true);

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

    const handleCancel = () => {
        router.push("/business-managements");
    };

    if (loading) {
        return <div className="p-10 text-center text-sm text-gray-500">Đang tải thông tin doanh nghiệp...</div>;
    }

    return (
        <div className="h-screen flex flex-col py-2">
            {/* Top Bar */}
            <div className="shrink-0 bg-white px-5 py-3 rounded-lg border border-gray-100 shadow-sm flex items-center justify-between">
                <h1 className="text-base font-bold text-gray-800">Chi tiết doanh nghiệp</h1>
                <button
                    type="button"
                    onClick={handleCancel}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-gray-300 text-gray-600 rounded hover:bg-gray-50 transition-colors cursor-pointer"
                >
                    <i className="fa-solid fa-arrow-left text-xs" />
                    <span>Quay lại danh sách</span>
                </button>
            </div>

            {/* Main content */}
            <div className="bg-white rounded-lg border border-gray-100 shadow-sm flex flex-col flex-1 min-h-0 overflow-hidden mt-2">
                {/* Content - Scrollable */}
                <div className="flex-1 overflow-y-auto px-8 py-6 min-h-0">
                    <EnterpriseStepConfirm form={form} attachmentGroups={attachmentGroups} />
                </div>

                {/* Footer buttons */}
                <div className="shrink-0 px-8 py-4 border-t border-gray-100 flex items-center justify-end gap-3 bg-white">
                    <button
                        type="button"
                        onClick={handleCancel}
                        className="px-5 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors cursor-pointer"
                    >
                        Quay lại
                    </button>
                </div>
            </div>
        </div>
    );
}
