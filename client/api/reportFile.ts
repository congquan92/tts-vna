import { axiosInstance } from "@/lib/axios";
import type { ReportFile, ReportFileType } from "@/types/reportFile";

export const ReportFileApi = {
    upload: async (reportId: number, file: File, fileType: ReportFileType): Promise<ReportFile> => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("fileType", fileType);
        const res = await axiosInstance.post<ReportFile>(`/report-files/${reportId}/upload`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return res.data;
    },

    getFiles: async (reportId: number): Promise<ReportFile[]> => {
        const res = await axiosInstance.get<ReportFile[]>(`/report-files/${reportId}`);
        return res.data;
    },

    deleteFile: async (fileId: number): Promise<{ message: string }> => {
        const res = await axiosInstance.delete<{ message: string }>(`/report-files/${fileId}`);
        return res.data;
    },
};
