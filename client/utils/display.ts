/**
 * Danh sách các tùy chọn vai trò chuẩn của hệ thống
 */
export const ROLE_OPTIONS = [
    { label: "Quản trị viên Sở", value: "1" },
    { label: "Lãnh đạo Sở", value: "2" },
    { label: "Chuyên viên", value: "3" },
    // { label: "Giám đốc Doanh nghiệp", value: "4" },
    // { label: "Quản lý Doanh nghiệp", value: "5" },
    // { label: "Nhân viên Doanh nghiệp", value: "6" },
];

/**
 * Chuyển đổi mã vai trò sang tên hiển thị tiếng Việt
 */
export const getRoleDisplayName = (roleName?: string) => {
    if (!roleName) return "-";
    switch (roleName) {
        case "ADMIN_SO":
            return "Quản trị viên Sở";
        case "MANAGER_SO":
            return "Lãnh đạo Sở";
        case "CHUYENVIEN_SO":
            return "Chuyên viên";
        // case "CEO_DN":
        //     return "Giám đốc Doanh nghiệp";
        // case "MANAGER_DN":
        //     return "Quản lý Doanh nghiệp";
        // case "USER_DN":
        //     return "Nhân viên Doanh nghiệp";
        default:
            return roleName;
    }
};
