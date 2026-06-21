import { axiosInstance } from "@/lib/axios";
import type { Business, CreateBusinessPayload, UpdateBusinessPayload, SearchBusinessParams, BusinessListResponse } from "@/types/business";

export const BusinessApi = {
    create: async (payload: CreateBusinessPayload): Promise<Business> => {
        const res = await axiosInstance.post<Business>("/business", payload);
        return res.data;
    },

    getAll: async (page?: number, limit?: number): Promise<BusinessListResponse> => {
        const res = await axiosInstance.get<BusinessListResponse>("/business", {
            params: { page, limit },
        });
        return res.data;
    },

    search: async (params: SearchBusinessParams): Promise<BusinessListResponse> => {
        const res = await axiosInstance.get<BusinessListResponse>("/business/search", {
            params,
        });
        return res.data;
    },

    getById: async (id: number): Promise<Business> => {
        const res = await axiosInstance.get<Business>(`/business/${id}`);
        return res.data;
    },

    update: async (id: number, payload: UpdateBusinessPayload): Promise<Business> => {
        const res = await axiosInstance.patch<Business>(`/business/${id}`, payload);
        return res.data;
    },

    delete: async (id: number): Promise<{ message: string; data: any }> => {
        const res = await axiosInstance.delete<{ message: string; data: any }>(`/business/${id}`);
        return res.data;
    },

    confirm: async (id: number): Promise<Business> => {
        const res = await axiosInstance.patch<Business>(`/business/${id}/confirm`);
        return res.data;
    },

    toggleStatus: async (id: number): Promise<{ message: string; data: { id: number; isActive: boolean } }> => {
        const res = await axiosInstance.patch<{ message: string; data: { id: number; isActive: boolean } }>(`/business/${id}/toggle-status`);
        return res.data;
    },

    setPassword: async (id: number, password: string): Promise<any> => {
        const res = await axiosInstance.post(`/business/${id}/set-password`, { password });
        return res.data;
    },

    requestOtp: async (email: string, businessName: string): Promise<{ message: string }> => {
        const res = await axiosInstance.post<{ message: string }>("/business/request-otp", { email, businessName });
        return res.data;
    },

    verifyOtp: async (email: string, otp: string): Promise<{ success: boolean; message: string; verifiedEmail: string }> => {
        const res = await axiosInstance.post<{ success: boolean; message: string; verifiedEmail: string }>("/business/verify-otp", { email, otp });
        return res.data;
    },
};
