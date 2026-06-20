"use client";

import { useAuth } from "@/contexts/AuthContext";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import React, { Suspense } from "react";
import { toast } from "sonner";
import LoadingOverlay from "@/components/LoadingOverlay";

export default function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const isAuthorized = (() => {
        if (loading) return false;
        if (!user) return false;

        const orgType = user.orgType;
        const isSharedPath = pathname === "/accounts" || pathname.startsWith("/accounts/");
        if (isSharedPath) return true;

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

        const orgType = user.orgType;
        const isSharedPath = pathname === "/accounts" || pathname.startsWith("/accounts/");
        if (isSharedPath) return;

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
    }, [user, loading, pathname, router]);

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
