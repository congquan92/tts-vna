export interface BusinessFile {
    id: number;
    businessId: number;
    fileName: string;
    filePath: string;
    fileType: string;
    fileSize: number;
    mimeType?: string;
    createdAt: string;
    updatedAt: string;
}
