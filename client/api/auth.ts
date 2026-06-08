import { axiosInstance } from "@/lib/axios";
import type { LoginResponse, RegisterPayload, RegisterResponse, ForgotPasswordPayload, ChangePasswordPayload, UpdateProfilePayload, ChangeEmailPayload, User } from "@/types/auth";

export const AuthApi = {
    login: async (username: string, password: string): Promise<LoginResponse> => {
        const res = await axiosInstance.post<LoginResponse>("/auth/login", { username, password });
        return res.data;
    },

    register: async (payload: RegisterPayload): Promise<RegisterResponse> => {
        const res = await axiosInstance.post<RegisterResponse>("/auth/register", payload);
        return res.data;
    },

    forgotPassword: async (payload: ForgotPasswordPayload): Promise<{ message: string }> => {
        const res = await axiosInstance.post<{ message: string }>("/auth/forgot-password", payload);
        return res.data;
    },

    verifyOtp: async (email: string, otp: string): Promise<{ message: string }> => {
        const res = await axiosInstance.post<{ message: string }>("/auth/verify-otp", { email, otp });
        return res.data;
    },

    resetPassword: async (payload: ForgotPasswordPayload): Promise<{ message: string }> => {
        const res = await axiosInstance.post<{ message: string }>("/auth/reset-password", payload);
        return res.data;
    },

    getProfile: async (): Promise<User> => {
        const res = await axiosInstance.get<User>("/auth/profile");
        return res.data;
    },

    updateProfile: async (payload: UpdateProfilePayload): Promise<User> => {
        const res = await axiosInstance.patch<User>("/auth/profile", payload);
        return res.data;
    },

    changePassword: async (payload: ChangePasswordPayload): Promise<{ message: string }> => {
        const res = await axiosInstance.post<{ message: string }>("/auth/change-password", payload);
        return res.data;
    },

    requestChangeEmail: async (): Promise<{ message: string }> => {
        const res = await axiosInstance.post<{ message: string }>("/auth/request-change-email");
        return res.data;
    },

    verifyAndChangeEmail: async (payload: ChangeEmailPayload): Promise<{ message: string }> => {
        const res = await axiosInstance.post<{ message: string }>("/auth/verify-and-change-email", payload);
        return res.data;
    },
};
