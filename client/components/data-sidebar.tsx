import { ReactNode } from "react";
import { Settings } from "lucide-react";

export type SidebarMenuItem = {
    id: string;
    label: string;
    icon: ReactNode; // Đổi sang ReactNode để nhận Lucide Icon
    path?: string;
    isOpen?: boolean;
    items?: { id: string; label: string; path: string }[];
};

export const menuData: SidebarMenuItem[] = [
    {
        id: "system",
        label: "Quản trị phần mềm",
        icon: <Settings size={20} className="opacity-90" />,
        isOpen: true,
        items: [
            { id: "users", label: "Quản lý người dùng", path: "/accounts-managements" },
            { id: "roles", label: "Quản lý doanh nghiệp", path: "/business-managements" },
            { id: "reports", label: "Kỳ báo cáo", path: "/reports" },
        ],
    },
    {
        id: "accidents",
        label: "Tai nạn lao động",
        icon: <Settings size={20} className="opacity-90" />,
        isOpen: true,
        items: [
            { id: "category", label: "Danh mục chung", path: "/category" },
            { id: "accident-types", label: "TNLĐ theo HĐLĐ", path: "/accident-types" },
        ],
    },
];
