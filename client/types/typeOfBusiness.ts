export enum BusinessStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
}

export interface TypeOfBusiness {
    id: number;
    code: string;
    name: string;
    status: BusinessStatus;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateTypeOfBusinessPayload {
    code: string;
    name: string;
    status?: BusinessStatus;
}

export interface UpdateTypeOfBusinessPayload extends Partial<CreateTypeOfBusinessPayload> { }
