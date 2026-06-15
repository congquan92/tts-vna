"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";

import TextInput from "@/components/form/TextInput";
import PasswordInput from "@/components/form/PasswordInput";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";
import { AuthApi } from "@/api/auth";
import { validateStrongPassword } from "@/utils/validation";
import LoadingOverlay from "@/components/LoadingOverlay";

type FormErrors = {
    username?: string;
    password?: string;
    fullName?: string;
    email?: string;
    role?: string;
};

export default function RegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        username: "",
        password: "",
        fullName: "",
        email: "",
        role: "User", // Default role
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [alert, setAlert] = useState<{ type: "error" | "success"; message: string } | null>(null);
    const [loading, setLoading] = useState(false);

    const validateForm = () => {
        const newErrors: FormErrors = {};

        if (!formData.username.trim()) newErrors.username = "Vui lòng nhập tên đăng nhập";
        
        const passwordValidation = validateStrongPassword(formData.password);
        if (!passwordValidation.isValid) {
            newErrors.password = passwordValidation.message;
        }
        
        if (!formData.fullName.trim()) newErrors.fullName = "Vui lòng nhập họ và tên";
        if (!formData.email.trim()) newErrors.email = "Vui lòng nhập email";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Email không hợp lệ";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            setAlert({
                type: "error",
                message: "Vui lòng điền đầy đủ và chính xác thông tin",
            });
            return;
        }

        setLoading(true);
        try {
            await AuthApi.register(formData);
            setAlert({
                type: "success",
                message: "Đăng ký tài khoản thành công! Đang chuyển hướng đến trang đăng nhập...",
            });

            setTimeout(() => {
                router.push("/login");
            }, 2000);
        } catch (error: any) {
            setAlert({
                type: "error",
                message: error.response?.data?.message || "Đăng ký thất bại. Vui lòng thử lại",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field: keyof typeof formData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field as keyof FormErrors]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-white py-10">
            <LoadingOverlay isLoading={loading} />
            <div className="flex w-full max-w-[550px] flex-col items-center justify-center rounded-lg shadow-lg p-8">
                {/* Logo  */}
                <div className="mb-6 h-24 w-24">
                    <Image src="/quochuy.png" alt="quochuy" width={96} height={96} className="object-contain w-auto h-auto" />
                </div>

                {/* Title */}
                <div className="mb-8 flex flex-col items-center text-center text-[20px] font-bold leading-snug text-black">
                    <h1>ĐĂNG KÝ TÀI KHOẢN</h1>
                </div>

                {/* Alerts */}
                <div className="mb-4 w-full">{alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}</div>

                {/* Form register */}
                <form onSubmit={handleRegister} className="flex w-full flex-col gap-4">
                    <TextInput
                        label="Họ và tên *"
                        placeholder="Nguyễn Văn A"
                        required={true}
                        value={formData.fullName}
                        onChange={(e) => handleChange("fullName", e.target.value)}
                        error={errors.fullName}
                    />

                    <TextInput
                        label="Tên đăng nhập *"
                        placeholder="nguyenvana123"
                        required={true}
                        value={formData.username}
                        onChange={(e) => handleChange("username", e.target.value)}
                        error={errors.username}
                    />

                    <TextInput
                        label="Email *"
                        placeholder="example@gmail.com"
                        required={true}
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        error={errors.email}
                    />

                    <PasswordInput
                        label="Mật khẩu *"
                        required={true}
                        value={formData.password}
                        onChange={(e) => handleChange("password", e.target.value)}
                        error={errors.password}
                    />

                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-gray-700">Vai trò *</label>
                        <select
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={formData.role}
                            onChange={(e) => handleChange("role", e.target.value)}
                            disabled={loading}
                        >
                            <option value="User">Người dùng</option>
                            <option value="Moderator">Người kiểm duyệt</option>
                            <option value="Admin">Quản trị viên</option>
                        </select>
                    </div>

                    {/* Buttons */}
                    <div className="mt-6 flex flex-col gap-4">
                        <Button variant="primary" type="submit" disabled={loading}>
                            Đăng ký
                        </Button>

                        <p className="text-sm text-center">
                            Đã có tài khoản?{" "}
                            <Link href="/login" className="text-blue-600 font-medium hover:underline">
                                Đăng nhập ngay
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}
