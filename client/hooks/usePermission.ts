import { useAuth } from "@/contexts/AuthContext";

export function usePermission() {
    const { user } = useAuth();

    const hasPermission = (requiredPermission: string): boolean => {
        if (!user) return false;

        // Bypass for ADMIN_SO or if permission list contains "*"
        if (user.role === "ADMIN_SO" || user.permissions?.includes("*")) {
            return true;
        }

        return user.permissions?.includes(requiredPermission) || false;
    };

    const hasAnyPermission = (requiredPermissions: string[]): boolean => {
        if (!user) return false;
        if (user.role === "ADMIN_SO" || user.permissions?.includes("*")) {
            return true;
        }
        return requiredPermissions.some((perm) => user.permissions?.includes(perm));
    };

    const hasAllPermissions = (requiredPermissions: string[]): boolean => {
        if (!user) return false;
        if (user.role === "ADMIN_SO" || user.permissions?.includes("*")) {
            return true;
        }
        return requiredPermissions.every((perm) => user.permissions?.includes(perm));
    };

    return {
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
        user,
        role: user?.role,
        orgType: user?.orgType,
    };
}
