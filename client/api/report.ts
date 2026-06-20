import { axiosInstance } from "@/lib/axios";
import type { CreateReportPayload, UpdateReportPayload, Report, ReportListResponse } from "@/types/report";

export const ReportApi = {
    create: async (payload: CreateReportPayload): Promise<Report> => {
        const res = await axiosInstance.post<Report>("/reports", payload);
        return res.data;
    },

    getAll: async (page?: number, limit?: number): Promise<ReportListResponse> => {
        const res = await axiosInstance.get<ReportListResponse>("/reports", {
            params: { page, limit },
        });
        return res.data;
    },

    getById: async (id: number): Promise<Report> => {
        const res = await axiosInstance.get<Report>(`/reports/${id}`);
        return res.data;
    },

    update: async (id: number, payload: UpdateReportPayload): Promise<Report> => {
        const res = await axiosInstance.patch<Report>(`/reports/${id}`, payload);
        return res.data;
    },

    delete: async (id: number): Promise<{ message: string; data: any }> => {
        const res = await axiosInstance.delete<{ message: string; data: any }>(`/reports/${id}`);
        return res.data;
    },
};
