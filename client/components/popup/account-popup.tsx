"use client";

import React from "react";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { User, Key, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

interface AccountPopupProps {
    anchorEl: null | HTMLElement;
    open: boolean;
    onClose: () => void;
}

export default function AccountPopup({ anchorEl, open, onClose }: AccountPopupProps) {
    const router = useRouter();

    const handleLogout = () => {
        onClose();
        localStorage.removeItem("auth_token");
        router.push("/login");
    };

    return (
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
                    // padding: "4px 0",
                },
            }}
        >
            <MenuItem onClick={onClose} sx={{ py: 1.5, fontSize: "14px", fontWeight: 700, color: "#111827" }}>
                <User size={18} className="text-gray-500 mr-2" /> Thông tin tài khoản
            </MenuItem>
            <MenuItem onClick={onClose} sx={{ py: 1.5, fontSize: "14px", fontWeight: 700, color: "#111827" }}>
                <Key size={18} className="text-gray-500 mr-2" /> Đổi mật khẩu
            </MenuItem>
            <MenuItem onClick={handleLogout} sx={{ py: 1.5, fontSize: "14px", fontWeight: 700, color: "#111827" }}>
                <LogOut size={18} className="text-red-600 mr-2" /> Đăng xuất
            </MenuItem>
        </Menu>
    );
}
