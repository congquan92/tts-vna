import axios from "axios";

export const getErrorMessage = (error: unknown, defaultMessage: string = "Có lỗi xảy ra"): string => {
    if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || defaultMessage;
        if (Array.isArray(message)) {
            return message[0];
        }
        return message;
    }
    if (error && typeof error === "object" && "response" in error) {
        const errObj = error as { response?: { data?: { message?: string | string[] } } };
        const message = errObj.response?.data?.message || defaultMessage;
        if (Array.isArray(message)) {
            return message[0];
        }
        return message;
    }
    if (error instanceof Error) {
        return error.message;
    }
    return defaultMessage;
};
