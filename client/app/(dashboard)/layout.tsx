import Sidebar from "@/components/Sidebar";
import React from "react";

export default function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <div className="flex">
            {/* sidebar */}
            <Sidebar />

            {/* pages */}
            <div className="flex-1 px-2">{children}</div>
        </div>
    );
}
