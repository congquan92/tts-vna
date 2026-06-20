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
    refreshProfile: () => Promise<User | null>;
    updateUser: (userData: User) => void;
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
            localStorage.setItem("user_info", JSON.stringify(userData));
            return userData;
        } catch (error) {
            console.error("Failed to fetch profile:", error);
            setUser(null);
            localStorage.removeItem("user_info");
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const updateUser = useCallback((userData: User) => {
        setUser(userData);
        localStorage.setItem("user_info", JSON.stringify(userData));
    }, []);

    useEffect(() => {
        const token = localStorage.getItem("auth_token");
        const storedUser = localStorage.getItem("user_info");

        const timer = setTimeout(() => {
            if (storedUser) {
                try {
                    setUser(JSON.parse(storedUser));
                } catch (e) {
                    console.error("Failed to parse stored user", e);
                }
            }

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
        localStorage.setItem("refresh_token", res.refreshToken);
        const profile = await refreshProfile();
        if (profile?.orgType === "DOANH_NGHIEP") {
            router.push("/company-info");
        } else {
            router.push("/accounts-managements");
        }
    };

    const logout = async () => {
        try {
            await AuthApi.logout();
        } finally {
            localStorage.removeItem("auth_token");
            localStorage.removeItem("refresh_token");
            localStorage.removeItem("user_info");
            setUser(null);
            router.push("/login");
        }
    };

    return <AuthContext.Provider value={{ user, loading, login, logout, refreshProfile, updateUser }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
