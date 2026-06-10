"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { AuthApi } from "@/api/auth";
import type { User } from "@/types/auth";
import { useRouter } from "next/navigation";

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (username: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const refreshProfile = useCallback(async () => {
        try {
            const userData = await AuthApi.getProfile();
            setUser(userData);
        } catch (error) {
            console.error("Failed to fetch profile:", error);
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const token = localStorage.getItem("auth_token");

        const timer = setTimeout(() => {
            if (token) {
                refreshProfile();
            } else {
                setLoading(false);
            }
        }, 0);

        return () => clearTimeout(timer);
    }, [refreshProfile]);

    const login = async (username: string, password: string) => {
        const res = await AuthApi.login(username, password);
        localStorage.setItem("auth_token", res.accessToken);
        await refreshProfile();
        router.push("/accounts"); // Hoặc trang dashboard bất kỳ
    };

    const logout = async () => {
        try {
            // Có thể gọi API logout ở đây nếu cần xóa cookie/revoke token ở backend
            // await AuthApi.logout();
        } finally {
            localStorage.removeItem("auth_token");
            setUser(null);
            router.push("/login");
        }
    };

    return <AuthContext.Provider value={{ user, loading, login, logout, refreshProfile }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
