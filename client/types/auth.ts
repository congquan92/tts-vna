export interface User {
    id: number;
    fullName: string;
    email: string;
    avatarUrl?: string;
    gender?: string;
    province?: string;
    isActive?: boolean;
    dob?: string | Date;
    position?: string;
    ward?: string;
    address?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface Account {
    id: number;
    username: string;
    role: 'Admin' | 'User' | 'Moderator';
    userId: number;
}

export interface LoginResponse {
    accessToken: string;
}

export interface RegisterPayload {
    username: string;
    password: string;
    fullName: string;
    email: string;
    role: string;
}

export interface RegisterResponse {
    user: User;
    account: Account;
}

export interface ForgotPasswordPayload {
    email: string;
    otp?: string;
    newPassword?: string;
    confirmNewPassword?: string;
}

export interface ChangePasswordPayload {
    oldPass: string;
    newPass: string;
    confirmPass: string;
}

export interface ChangeEmailPayload {
    newEmail: string;
    otp: string;
}

export interface UpdateProfilePayload {
    fullName?: string;
    email?: string;
    avatarUrl?: string;
    gender?: string;
    province?: string;
    isActive?: boolean;
    dob?: string | Date;
    position?: string;
    ward?: string;
    address?: string;
}
