/**
 * Validates a password against strong password criteria.
 * - At least 8 characters
 * - At least one uppercase letter
 */
export const validateStrongPassword = (password: string): { isValid: boolean; message: string } => {
    if (!password) {
        return { isValid: false, message: "Mật khẩu không được để trống" };
    }
    
    if (password.length < 8) {
        return { isValid: false, message: "Mật khẩu phải có ít nhất 8 ký tự" };
    }
    
    if (!/[A-Z]/.test(password)) {
        return { isValid: false, message: "Mật khẩu phải chứa ít nhất một chữ cái viết hoa" };
    }
    
    return { isValid: true, message: "" };
};
