import { ReactNode } from "react";
import { Settings } from "lucide-react";
import { Permission } from "@/types/permission";

export type SidebarMenuItem = {
    id: string;
    label: string;
    icon: ReactNode; // Đổi sang ReactNode để nhận Lucide Icon
    path?: string;
    isOpen?: boolean;
    requiredPermission?: Permission;
    items?: { id: string; label: string; path: string; requiredPermission?: Permission }[];
};

export const menuDataSO: SidebarMenuItem[] = [
    {
        id: "system",
        label: "Quản trị phần mềm",
        icon: <Settings size={20} className="opacity-90" />,
        isOpen: true,
        items: [
            { id: "users", label: "Quản lý người dùng", path: "/accounts-managements", requiredPermission: Permission.USER_VIEW },
            { id: "types-of-business", label: "Loại Hình Kinh Doanh", path: "/business-types", requiredPermission: Permission.BUSINESS_VIEW },
            { id: "industries", label: "Ngành nghề kinh doanh", path: "/business-industries", requiredPermission: Permission.BUSINESS_VIEW },
            { id: "roles", label: "Quản lý doanh nghiệp", path: "/business-managements", requiredPermission: Permission.BUSINESS_VIEW },
            { id: "reports", label: "Kỳ báo cáo", path: "/reports", requiredPermission: Permission.REPORT_SO_VIEW },
        ],
    },
    {
        id: "accidents",
        label: "Tai nạn lao động",
        icon: <Settings size={20} className="opacity-90" />,
        isOpen: true,
        items: [
            { id: "category", label: "Danh mục chung", path: "/category", requiredPermission: Permission.REPORT_SO_VIEW },
            { id: "accident-types", label: "TNLĐ theo HĐLĐ", path: "/accident-types", requiredPermission: Permission.REPORT_SO_VIEW },
        ],
    },
];

export const menuDataDONGHIEP: SidebarMenuItem[] = [
    {
        id: "system",
        label: "Hệ Thống",
        icon: <Settings size={20} className="opacity-90" />,
        isOpen: true,
        items: [{ id: "company-info", label: "Thông tin doanh nghiệp", path: "/company-info", requiredPermission: Permission.BUSINESS_VIEW }],
    },
    {
        id: "accidents",
        label: "Tai nạn lao động",
        icon: <Settings size={20} className="opacity-90" />,
        isOpen: true,
        items: [{ id: "accident-types", label: "TNLĐ theo HĐLĐ", path: "/company-accidents", requiredPermission: Permission.REPORT_DN_VIEW }],
    },
];

