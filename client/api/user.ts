import { axiosInstance } from "@/lib/axios";
import type { User } from "@/types/auth";
import type { CreateUserPayload, UpdateUserPayload, SearchUserParams, UserListResponse } from "@/types/user";

export interface ImportUsersResponse {
    message: string;
    data: {
        total: number;
        success: number;
        failed: number;
        errors: {
            row: number;
            data: Record<string, unknown>;
            errors: string[];
        }[];
        rows?: {
            row: number;
            fullName: string;
            username: string;
            email: string;
            role: string;
            position: string;
            isActive: boolean;
        }[];
    };
}

export const UserApi = {
    create: async (payload: CreateUserPayload): Promise<{ message: string; data: User }> => {
        const res = await axiosInstance.post<{ message: string; data: User }>("/users", payload);
        return res.data;
    },

    getAll: async (page?: number, limit?: number): Promise<UserListResponse> => {
        const res = await axiosInstance.get<UserListResponse>("/users", {
            params: { page, limit },
        });
        return res.data;
    },

    search: async (params: SearchUserParams): Promise<UserListResponse> => {
        const res = await axiosInstance.get<UserListResponse>("/users/search", {
            params,
        });
        return res.data;
    },

    importUsers: async (fileOrRows: File | unknown[], preview?: boolean): Promise<ImportUsersResponse> => {
        if (Array.isArray(fileOrRows)) {
            const res = await axiosInstance.post<ImportUsersResponse>("/users/import", { rows: fileOrRows }, {
                params: { preview },
            });
            return res.data;
        } else {
            const formData = new FormData();
            formData.append("file", fileOrRows);
            const res = await axiosInstance.post<ImportUsersResponse>("/users/import", formData, {
                params: { preview },
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            return res.data;
        }
    },

    exportUsers: async (): Promise<Blob> => {
        const res = await axiosInstance.get("/users/export", {
            responseType: "blob",
        });
        return res.data;
    },

    getById: async (id: number): Promise<User> => {
        const res = await axiosInstance.get<User>(`/users/${id}`);
        return res.data;
    },

    update: async (id: number, payload: UpdateUserPayload): Promise<{ message: string; data: User }> => {
        const res = await axiosInstance.put<{ message: string; data: User }>(`/users/${id}`, payload);
        return res.data;
    },

    delete: async (id: number): Promise<{ message: string; data: unknown }> => {
        const res = await axiosInstance.delete<{ message: string; data: unknown }>(`/users/${id}`);
        return res.data;
    },

    setPassword: async (id: number, password: string): Promise<{ message: string }> => {
        const res = await axiosInstance.post<{ message: string }>(`/users/${id}/set-password`, { password });
        return res.data;
    },

    toggleStatus: async (id: number): Promise<{ message: string; data: { id: number; isActive: boolean } }> => {
        const res = await axiosInstance.patch<{ message: string; data: { id: number; isActive: boolean } }>(`/users/${id}/toggle-status`);
        return res.data;
    },
};
