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
        case "CEO_DN":
            return "Giám đốc Doanh nghiệp";
        case "MANAGER_DN":
            return "Quản lý Doanh nghiệp";
        case "USER_DN":
            return "Nhân viên Doanh nghiệp";
        default:
            return roleName;
    }
};
