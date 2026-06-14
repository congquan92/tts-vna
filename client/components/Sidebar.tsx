"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, MouseEvent } from "react";
import Image from "next/image";

// Import đồ chơi của MUI
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Collapse from "@mui/material/Collapse";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import { menuData } from "@/components/data-sidebar";
import { Menu as MenuIcon, ChevronDown, ChevronRight, ChevronUp } from "lucide-react";
import AccountPopup from "@/components/popup/account-popup";

import { useAuth } from "@/contexts/AuthContext";

export default function SidebarMUI() {
    const { user } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Helper for avatar URL
    const getAvatarUrl = (url?: string) => {
        if (!url || !mounted) return "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y";
        if (url.startsWith("http")) return url;
        const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "";
        return `${apiUrl}/${url.replace(/^\//, "")}`;
    };

    // State cho MUI Menu (Popup user)
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const isMenuOpen = Boolean(anchorEl);

    const activeMenu = pathname;

    const sidebarMenus = menuData.map((menu) => {
        if (!menu.items) return menu;
        const menuStateFromUrl = searchParams.get(menu.id);
        return {
            ...menu,
            isOpen: menuStateFromUrl === null ? menu.isOpen : menuStateFromUrl === "true",
        };
    });

    const handleToggleMenu = (menuId: string) => {
        const params = new URLSearchParams(searchParams.toString());
        const currentMenu = sidebarMenus.find((m) => m.id === menuId);

        if (!currentMenu || !currentMenu.items) return;

        const nextIsOpen = !currentMenu.isOpen;
        params.set(menuId, String(nextIsOpen));

        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    };

    const getMenuPath = (path: string) => {
        const queryString = searchParams.toString();
        return queryString ? `${path}?${queryString}` : path;
    };

    const handleProfileClick = (event: MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleProfileClose = () => {
        setAnchorEl(null);
    };

    return (
        <Box
            sx={{
                width: 300,
                bgcolor: "#1b2b65",
                color: "white",
                height: "100vh",
                display: "flex",
                flexDirection: "column",
                borderRight: "1px solid #2a3c7d",
            }}
        >
            {/* --- Header --- */}
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: 2, borderBottom: "1px solid #2a3c7d" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, marginRight: 1 }}>
                    <Box sx={{ position: "relative", width: 40, height: 40 }}>
                        <Image src="/quochuy.png" alt="Logo" fill className="object-contain" sizes="40px" />
                    </Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                        Uỷ ban nhân dân tỉnh ABC
                    </Typography>
                </Box>
                <MenuIcon size={24} className="opacity-80 cursor-pointer hover:opacity-100 transition-opacity" />
            </Box>

            {/* --- Body (Menu List) --- */}
            <List sx={{ flex: 1, overflowY: "auto", pt: 2, pb: 2, px: 0 }} className="custom-scrollbar">
                {sidebarMenus.map((menu) => {
                    const isParentActive = menu.items?.some((item) => item.path === activeMenu);
                    const isSingleActive = !menu.items && activeMenu === menu.path;

                    return (
                        <Box key={menu.id}>
                            {/* Link đơn hoặc Menu Cha */}
                            <ListItemButton
                                component={menu.items ? "div" : Link}
                                href={menu.items ? undefined : getMenuPath(menu.path!)}
                                onClick={() => (menu.items ? handleToggleMenu(menu.id) : null)}
                                sx={{
                                    px: 3,
                                    py: 1.5,
                                    bgcolor: isSingleActive || isParentActive ? "rgba(255, 255, 255, 0.05)" : "transparent",
                                    "&:hover": { bgcolor: "rgba(255, 255, 255, 0.1)" },
                                }}
                            >
                                <ListItemIcon sx={{ color: "white", minWidth: 40 }}>{menu.icon}</ListItemIcon>
                                <ListItemText primary={<Typography sx={{ fontSize: "14px", fontWeight: isSingleActive || isParentActive ? 600 : 400 }}>{menu.label}</Typography>} />
                                {menu.items && <Box sx={{ display: "flex", alignItems: "center", transition: "transform 0.2s" }}>{menu.isOpen ? <ChevronDown size={16} /> : <ChevronUp size={16} />}</Box>}
                            </ListItemButton>

                            {/* Menu Con (Collapse) */}
                            {menu.items && (
                                <Collapse in={menu.isOpen} timeout="auto" unmountOnExit>
                                    <List component="div" disablePadding sx={{ py: 0 }}>
                                        {menu.items.map((item) => {
                                            const isChildActive = activeMenu === item.path;
                                            return (
                                                <ListItemButton
                                                    key={item.id}
                                                    component={Link}
                                                    href={getMenuPath(item.path)}
                                                    sx={{
                                                        pl: 7,
                                                        py: 1.2,
                                                        color: isChildActive ? "white" : "#d1d5db",
                                                        "&:hover": { color: "white", bgcolor: "rgba(255, 255, 255, 0.05)" },
                                                    }}
                                                >
                                                    <ListItemIcon sx={{ minWidth: 24, color: "inherit" }}>
                                                        <Box sx={{ width: 4, height: 4, bgcolor: "currentColor", borderRadius: "50%" }} />
                                                    </ListItemIcon>
                                                    <ListItemText primary={<Typography sx={{ fontSize: "13px", fontWeight: isChildActive ? 500 : 400 }}>{item.label}</Typography>} />
                                                </ListItemButton>
                                            );
                                        })}
                                    </List>
                                </Collapse>
                            )}
                        </Box>
                    );
                })}
            </List>

            {/* (Profile & Popup)*/}
            <Box sx={{ px: 2, pb: 2 }}>
                {/* Profile Item */}
                <Box sx={{ borderTop: "1px solid rgba(255,255,255,0.7)", borderBottom: "1px solid rgba(255,255,255,0.7)", py: 0.5 }}>
                    <ListItemButton
                        onClick={handleProfileClick}
                        sx={{
                            borderRadius: 1,
                            px: 1,
                            "&:hover": { bgcolor: "rgba(255, 255, 255, 0.1)" },
                        }}
                    >
                        <ListItemIcon sx={{ minWidth: 52 }}>
                            <Avatar src={getAvatarUrl(user?.avatarUrl)} alt="Avatar" sx={{ width: 44, height: 44 }} />
                        </ListItemIcon>

                        <ListItemText primary={<Typography sx={{ fontSize: "16px", fontWeight: 400, color: "white" }}>{mounted ? (user?.fullName || "Người dùng") : "Người dùng"}</Typography>} />

                        <ChevronRight size={22} strokeWidth={2.5} className="text-white" />
                    </ListItemButton>
                </Box>

                {/* Account Popup */}
                <AccountPopup anchorEl={anchorEl} open={isMenuOpen} onClose={handleProfileClose} />
            </Box>
        </Box>
    );
}
