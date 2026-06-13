export enum BusinessStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
}

export interface BusinessIndustry {
    id: number;
    code: string;
    name: string;
    parentId?: number;
    status: BusinessStatus;
    level?: number;
}

export interface CreateBusinessIndustryPayload {
    code: string;
    name: string;
    parentId?: string | number;
    status: BusinessStatus;
}

export interface UpdateBusinessIndustryPayload extends Partial<CreateBusinessIndustryPayload> { }

export interface SearchBusinessIndustryParams {
    page?: number;
    limit?: number;
    code?: string;
    name?: string;
    level?: number;
}

export interface BusinessIndustryListResponse {
    data: BusinessIndustry[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
