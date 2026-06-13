import { axiosInstance } from "@/lib/axios";
import type { BusinessFile } from "@/types/businessFile";

export const BusinessFileApi = {
    upload: async (businessId: number, file: File): Promise<BusinessFile> => {
        const formData = new FormData();
        formData.append("file", file);
        const res = await axiosInstance.post<BusinessFile>(`/business-files/${businessId}/upload`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return res.data;
    },

    getFiles: async (businessId: number): Promise<BusinessFile[]> => {
        const res = await axiosInstance.get<BusinessFile[]>(`/business-files/${businessId}`);
        return res.data;
    },

    deleteFile: async (fileId: number): Promise<any> => {
        const res = await axiosInstance.delete(`/business-files/${fileId}`);
        return res.data;
    },
};
