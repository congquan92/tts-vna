export type ReportFileType = "attachment" | "other";

export interface ReportFile {
    id: number;
    reportId: number;
    fileName: string;
    storedFileName: string;
    filePath: string;
    fileType: ReportFileType;
    fileSize?: number;
    mimeType?: string;
    createdAt: string;
}
