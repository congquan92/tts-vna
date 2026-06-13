export interface Business {
    id: number;
    taxCode: string;
    businessName: string;
    foreignName?: string;
    typeOfBusinessId: number;
    businessIndustryId: number;
    businessLicenseDate?: string | Date;
    registeredProvince: string;
    registeredWard: string;
    registeredAddress: string;
    email: string;
    officePhone?: string;
    operatingProvince?: string;
    operatingWard?: string;
    businessLocation?: string;
    legalRepresentative?: string;
    representativePhone?: string;
    status: boolean;
    isConfirmed: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateBusinessPayload {
    taxCode: string;
    businessName: string;
    foreignName?: string;
    typeOfBusinessId: number;
    businessIndustryId: number;
    businessLicenseDate?: string | Date;
    registeredProvince: string;
    registeredWard: string;
    registeredAddress: string;
    email: string;
    officePhone?: string;
    operatingProvince?: string;
    operatingWard?: string;
    businessLocation?: string;
    legalRepresentative?: string;
    representativePhone?: string;
}

export interface UpdateBusinessPayload extends Partial<Omit<CreateBusinessPayload, 'taxCode'>> { }

export interface SearchBusinessParams {
    page?: number;
    limit?: number;
    businessName?: string;
    taxCode?: string;
    typeOfBusinessId?: number;
    businessIndustryId?: number;
    registeredWard?: string;
    status?: boolean;
}

export interface BusinessListResponse {
    data: Business[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
