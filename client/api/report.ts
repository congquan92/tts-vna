import { axiosInstance } from "@/lib/axios";
import type { CreateReportPayload, UpdateReportPayload, Report, ReportListResponse } from "@/types/report";

export const ReportApi = {
    create: async (payload: CreateReportPayload): Promise<Report> => {
        const res = await axiosInstance.post<Report>("/reports", payload);
        return res.data;
    },

    getAll: async (
        page?: number,
        limit?: number,
        year?: number,
        status?: string,
        businessName?: string,
        taxCode?: string,
        province?: string,
        ward?: string
    ): Promise<ReportListResponse> => {
        const res = await axiosInstance.get<ReportListResponse>("/reports", {
            params: { page, limit, year, status, businessName, taxCode, province, ward },
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

    submit: async (id: number): Promise<Report> => {
        const res = await axiosInstance.patch<Report>(`/reports/${id}/submit`);
        return res.data;
    },

    approve: async (id: number): Promise<Report> => {
        const res = await axiosInstance.patch<Report>(`/reports/${id}/approve`);
        return res.data;
    },

    reject: async (id: number, reason: string): Promise<Report> => {
        const res = await axiosInstance.patch<Report>(`/reports/${id}/reject`, { reason });
        return res.data;
    },

    reopen: async (id: number): Promise<Report> => {
        const res = await axiosInstance.patch<Report>(`/reports/${id}/reopen`);
        return res.data;
    },

    exportDocx: async (payload: any): Promise<Blob> => {
        const res = await axiosInstance.post("/reports/summary/export-docx", payload, {
            responseType: "blob",
        });
        return res.data;
    },

    exportReportDocx: async (id: number): Promise<Blob> => {
        const res = await axiosInstance.get(`/reports/${id}/export-docx`, {
            responseType: "blob",
        });
        return res.data;
    },
};
