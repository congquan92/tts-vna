import { ReactNode } from "react";
import { BookOpen, Home, Settings, ShieldHalf, Users, UserCog, BarChart } from "lucide-react";

export type SidebarMenuItem = {
    id: string;
    label: string;
    icon: ReactNode; // Đổi sang ReactNode để nhận Lucide Icon
    path?: string;
    isOpen?: boolean;
    items?: { id: string; label: string; path: string }[];
};

export const menuData: SidebarMenuItem[] = [
    { id: "guide", label: "Hướng dẫn sử dụng", icon: <BookOpen size={20} className="opacity-90" />, path: "/guide" },
    { id: "home", label: "Trang chủ", icon: <Home size={20} className="opacity-90" />, path: "/" },
    {
        id: "system",
        label: "Hệ thống",
        icon: <Settings size={20} className="opacity-90" />,
        isOpen: true,
        items: [
            { id: "users", label: "Quản lý người dùng", path: "/users" },
            { id: "roles", label: "Vai trò người dùng", path: "/roles" },
            { id: "receive", label: "Tiếp nhận", path: "/receive" },
        ],
    },
    {
        id: "admin",
        label: "Quản trị phần mềm",
        icon: <ShieldHalf size={20} className="opacity-90" />,
        isOpen: false,
        items: [{ id: "settings", label: "Cài đặt chung", path: "/settings" }],
    },
    {
        id: "teacher-standards",
        label: "Chuẩn nghề nghiệp giáo viên",
        icon: <Users size={20} className="opacity-90" />,
        isOpen: false,
        items: [{ id: "list-1", label: "Danh sách chuẩn", path: "/teacher-standards" }],
    },
    {
        id: "ht-hp-standards",
        label: "Chuẩn nghề nghiệp HT - HP",
        icon: <UserCog size={20} className="opacity-90" />,
        isOpen: false,
        items: [{ id: "list-2", label: "Danh sách chuẩn", path: "/ht-hp-standards" }],
    },
    { id: "reports", label: "Báo cáo thống kê", icon: <BarChart size={20} className="opacity-90" />, path: "/reports" },
];
