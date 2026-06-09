import Sidebar from "@/components/Sidebar";
import React, { Suspense } from "react";

export default function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
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
