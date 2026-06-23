"use client";

import { useAuth } from "@/contexts/AuthContext";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useCallback } from "react";
import Sidebar from "@/components/Sidebar";
import React, { Suspense } from "react";
import { toast } from "sonner";
import LoadingOverlay from "@/components/LoadingOverlay";
import { usePermission } from "@/hooks/usePermission";
import { Permission } from "@/types/permission";

const ROUTE_PERMISSIONS: Record<string, string> = {
    "/accounts-managements": Permission.USER_VIEW,
    "/business-types": Permission.BUSINESS_VIEW,
    "/business-industries": Permission.BUSINESS_VIEW,
    "/business-managements": Permission.BUSINESS_VIEW,
    "/reports": Permission.REPORT_SO_VIEW,
    "/category": Permission.REPORT_SO_VIEW,
    "/accident-types": Permission.REPORT_SO_VIEW,
    "/company-accidents": Permission.REPORT_DN_VIEW,
    "/company-info": Permission.BUSINESS_VIEW,
};

export default function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    const { user, loading } = useAuth();
    const { hasPermission } = usePermission();
    const router = useRouter();
    const pathname = usePathname();

    const checkPermissionForPath = useCallback((path: string): boolean => {
        const matchingRoute = Object.keys(ROUTE_PERMISSIONS).find(
            (route) => path === route || path.startsWith(route + "/")
        );
        if (!matchingRoute) return true;
        
        const requiredPerm = ROUTE_PERMISSIONS[matchingRoute];
        return hasPermission(requiredPerm);
    }, [hasPermission]);

    const isAuthorized = (() => {
        if (loading) return false;
        if (!user) return false;

        const isSharedPath = pathname === "/accounts" || pathname.startsWith("/accounts/");
        if (isSharedPath) return true;

        if (!checkPermissionForPath(pathname)) return false;

        const orgType = user.orgType;
        const DONGHIEP_PATHS = ["/company-info", "/company-accidents"];
        if (orgType === "DOANH_NGHIEP") {
            return DONGHIEP_PATHS.some(
                (path) => pathname === path || pathname.startsWith(path + "/")
            );
        } else {
            const isDongHiepPath = DONGHIEP_PATHS.some(
                (path) => pathname === path || pathname.startsWith(path + "/")
            );
            return !isDongHiepPath;
        }
    })();

    useEffect(() => {
        if (loading) return;

        if (!user) {
            router.push("/login");
            return;
        }

        const isSharedPath = pathname === "/accounts" || pathname.startsWith("/accounts/");
        if (isSharedPath) return;

        if (!checkPermissionForPath(pathname)) {
            toast.error("Bạn không có quyền truy cập trang này.");
            if (user.orgType === "DOANH_NGHIEP") {
                router.replace("/company-info");
            } else {
                router.replace("/accounts-managements");
            }
            return;
        }

        const orgType = user.orgType;
        const DONGHIEP_PATHS = ["/company-info", "/company-accidents"];
        if (orgType === "DOANH_NGHIEP") {
            const allowed = DONGHIEP_PATHS.some(
                (path) => pathname === path || pathname.startsWith(path + "/")
            );

            if (!allowed) {
                toast.error("Bạn không có quyền truy cập trang này.");
                router.replace("/company-info");
            }
        } else {
            const isDongHiepPath = DONGHIEP_PATHS.some(
                (path) => pathname === path || pathname.startsWith(path + "/")
            );

            if (isDongHiepPath) {
                toast.error("Bạn không có quyền truy cập trang này.");
                router.replace("/accounts-managements");
            }
        }
    }, [user, loading, pathname, router, checkPermissionForPath]);

    if (loading || !isAuthorized) {
        return <LoadingOverlay isLoading={true} />;
    }

    return (
        <div className="flex">
            {/* sidebar */}
            <Suspense fallback={<div>Đang tải menu...</div>}>
                <Sidebar />
            </Suspense>

            {/* pages */}
            <div className="flex-1 px-2">{children}</div>
        </div>
    );
}
