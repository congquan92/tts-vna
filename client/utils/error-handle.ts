export const getErrorMessage = (error: any, defaultMessage: string = "Có lỗi xảy ra"): string => {
    const message = error.response?.data?.message || defaultMessage;
    if (Array.isArray(message)) {
        return message[0];
    }
    return message;
};
