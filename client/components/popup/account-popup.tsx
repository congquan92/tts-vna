"use client";

import React, { useState } from "react";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { User, Key, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import ChangePasswordPopup from "@/components/popup/change-password-popup";
import Link from "next/link";

interface AccountPopupProps {
    anchorEl: null | HTMLElement;
    open: boolean;
    onClose: () => void;
}

export default function AccountPopup({ anchorEl, open, onClose }: AccountPopupProps) {
    const router = useRouter();

    const [isChangePwdOpen, setIsChangePwdOpen] = useState(false);

    const handleLogout = () => {
        onClose();
        localStorage.removeItem("auth_token");
        router.push("/login");
    };

    const handleOpenChangePwd = () => {
        onClose();
        setIsChangePwdOpen(true);
    };

    return (
        <>
            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={onClose}
                anchorOrigin={{ vertical: "top", horizontal: "left" }}
                transformOrigin={{ vertical: "bottom", horizontal: "left" }}
                sx={{
                    "& .MuiPaper-root": {
                        mt: -2,
                        minWidth: 220,
                        boxShadow: "0px 4px 20px rgba(0,0,0,0.15)",
                        borderRadius: "8px",
                    },
                }}
            >
                <MenuItem onClick={onClose} sx={{ py: 1.5, fontSize: "14px", fontWeight: 700, color: "#111827" }}>
                    <Link href="/accounts" className="flex items-center">
                        <User size={18} className="text-gray-500 mr-2" /> Thông tin tài khoản
                    </Link>
                </MenuItem>

                {/* Gắn sự kiện mở modal vào nút này */}
                <MenuItem onClick={handleOpenChangePwd} sx={{ py: 1.5, fontSize: "14px", fontWeight: 700, color: "#111827" }}>
                    <Key size={18} className="text-gray-500 mr-2" /> Đổi mật khẩu
                </MenuItem>

                <MenuItem onClick={handleLogout} sx={{ py: 1.5, fontSize: "14px", fontWeight: 700, color: "#111827" }}>
                    <LogOut size={18} className="text-red-600 mr-2" /> Đăng xuất
                </MenuItem>
            </Menu>

            {/* Gọi Component Modal Đổi Mật Khẩu ra đây */}
            <ChangePasswordPopup isOpen={isChangePwdOpen} onClose={() => setIsChangePwdOpen(false)} />
        </>
    );
}
