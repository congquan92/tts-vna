import { axiosInstance } from "@/lib/axios";
import type { BusinessIndustry, CreateBusinessIndustryPayload, UpdateBusinessIndustryPayload, SearchBusinessIndustryParams, BusinessIndustryListResponse } from "@/types/businessIndustry";

export const BusinessIndustryApi = {
    create: async (payload: CreateBusinessIndustryPayload): Promise<BusinessIndustry> => {
        const res = await axiosInstance.post<BusinessIndustry>("/businessIndustries", payload);
        return res.data;
    },

    update: async (idOrCode: string | number, payload: UpdateBusinessIndustryPayload): Promise<BusinessIndustry> => {
        const res = await axiosInstance.patch<BusinessIndustry>(`/businessIndustries/${idOrCode}`, payload);
        return res.data;
    },

    findAll: async (): Promise<BusinessIndustry[]> => {
        const res = await axiosInstance.get<BusinessIndustry[]>("/businessIndustries");
        return res.data;
    },

    findNotLevel4: async (): Promise<BusinessIndustry[]> => {
        const res = await axiosInstance.get<BusinessIndustry[]>("/businessIndustries/level/not-4");
        return res.data;
    },

    findLevel4: async (): Promise<BusinessIndustry[]> => {
        const res = await axiosInstance.get<BusinessIndustry[]>("/businessIndustries/level/4");
        return res.data;
    },

    search: async (params: SearchBusinessIndustryParams): Promise<BusinessIndustryListResponse> => {
        const res = await axiosInstance.get<BusinessIndustryListResponse>("/businessIndustries/search", {
            params,
        });
        return res.data;
    },

    getByIdOrCode: async (idOrCode: string | number): Promise<BusinessIndustry> => {
        const res = await axiosInstance.get<BusinessIndustry>(`/businessIndustries/${idOrCode}`);
        return res.data;
    },

    delete: async (idOrCode: string | number): Promise<void> => {
        await axiosInstance.delete(`/businessIndustries/${idOrCode}`);
    },
};
