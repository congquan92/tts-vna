import type { Account, User } from "./auth";

export interface CreateUserPayload {
    username: string;
    password?: string;
    fullName: string;
    email: string;
    roleId?: number;
    position?: string;
    dob?: string;
    gender?: string;
    province?: string;
    ward?: string;
    address?: string;
    isActive?: boolean;
    orgType?: string;
    avatarUrl?: string;
    avatarPublicId?: string;
}

export interface UpdateUserPayload extends Partial<CreateUserPayload> { }

export interface SearchUserParams {
    fullName?: string;
    email?: string;
    username?: string;
    position?: string;
    roleId?: number;
    isActive?: boolean;
    page?: number;
    limit?: number;
}

export interface UserListResponse {
    data: User[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
