import { axiosInstance } from "@/lib/axios";
import type { TypeOfBusiness, CreateTypeOfBusinessPayload, UpdateTypeOfBusinessPayload } from "@/types/typeOfBusiness";

export const TypeOfBusinessApi = {
    create: async (payload: CreateTypeOfBusinessPayload): Promise<TypeOfBusiness> => {
        const res = await axiosInstance.post<TypeOfBusiness>("/TypeOfBusiness", payload);
        return res.data;
    },

    findAll: async (): Promise<TypeOfBusiness[]> => {
        const res = await axiosInstance.get<TypeOfBusiness[]>("/TypeOfBusiness");
        return res.data;
    },

    findByCode: async (code: string): Promise<TypeOfBusiness> => {
        const res = await axiosInstance.get<TypeOfBusiness>(`/TypeOfBusiness/code/${code}`);
        return res.data;
    },

    findByName: async (name: string): Promise<TypeOfBusiness[]> => {
        const res = await axiosInstance.get<TypeOfBusiness[]>("/TypeOfBusiness/name", {
            params: { name },
        });
        return res.data;
    },

    findByStatus: async (status: string): Promise<TypeOfBusiness[]> => {
        const res = await axiosInstance.get<TypeOfBusiness[]>(`/TypeOfBusiness/status/${status}`);
        return res.data;
    },

    getById: async (id: number): Promise<TypeOfBusiness> => {
        const res = await axiosInstance.get<TypeOfBusiness>(`/TypeOfBusiness/${id}`);
        return res.data;
    },

    update: async (id: number, payload: UpdateTypeOfBusinessPayload): Promise<TypeOfBusiness> => {
        const res = await axiosInstance.patch<TypeOfBusiness>(`/TypeOfBusiness/${id}`, payload);
        return res.data;
    },

    delete: async (id: number): Promise<any> => {
        const res = await axiosInstance.delete(`/TypeOfBusiness/${id}`);
        return res.data;
    },

    toggleStatus: async (id: number): Promise<{ message: string; data: { id: number; status: boolean } }> => {
        const res = await axiosInstance.patch<{ message: string; data: { id: number; status: boolean } }>(`/TypeOfBusiness/${id}/toggle-status`);
        return res.data;
    },
};
