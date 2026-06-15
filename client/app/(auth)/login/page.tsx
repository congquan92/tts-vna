"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import TextInput from "@/components/form/TextInput";
import PasswordInput from "@/components/form/PasswordInput";
import Button from "@/components/ui/Button";
// import Alert from "@/components/ui/Alert";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

type FormErrors = {
    account?: string;
    password?: string;
};

export default function LoginPage() {
    const { login } = useAuth();
    const router = useRouter();
    const [account, setAccount] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [errors, setErrors] = useState<FormErrors>({});
    const [loading, setLoading] = useState(false);

    // Load saved credentials on mount
    useEffect(() => {
        const savedAccount = localStorage.getItem("remembered_account");
        const savedPassword = localStorage.getItem("remembered_password");

        const timer = setTimeout(() => {
            if (savedAccount) {
                setAccount(savedAccount);
                setRememberMe(true);
            }
            if (savedPassword) {
                setPassword(savedPassword);
            }
        }, 0);

        return () => clearTimeout(timer);
    }, []);

    const validateForm = () => {
        const newErrors: FormErrors = {};

        if (!account.trim()) {
            newErrors.account = "Vui lòng nhập tài khoản";
        }
        if (!password.trim()) {
            newErrors.password = "Vui lòng nhập mật khẩu";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error("Vui lòng nhập đầy đủ thông tin");
            return;
        }

        setLoading(true);
        try {
            await login(account, password);

            // Xử lý Ghi nhớ đăng nhập
            if (rememberMe) {
                localStorage.setItem("remembered_account", account);
                localStorage.setItem("remembered_password", password);
            } else {
                localStorage.removeItem("remembered_account");
                localStorage.removeItem("remembered_password");
            }

            toast.success("Đăng nhập thành công!");
            // Redirect is handled inside login function in AuthContext
        } catch (error: unknown) {
            const axiosError = error as { response?: { data?: { message?: string } } };
            toast.error(axiosError.response?.data?.message || "Tài khoản hoặc mật khẩu không đúng. Vui lòng nhập lại");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-white">
            <div className="flex w-full max-w-[550px] flex-col items-center justify-center rounded-lg shadow-lg p-5">
                {/* Logo  */}
                <div className="mb-6 h-32 w-32">
                    <Image src="/quochuy.png" alt="quochuy" width={128} height={128} className="object-contain w-auto h-auto" />
                </div>

                {/* Title */}
                <div className="mb-10 flex flex-col items-center text-center text-[22px] font-bold leading-snug text-black">
                    <h1>Phần Mềm Quản Lý - Tạo Lập Cơ Sở Dữ Liệu</h1>
                    <h1>An Toàn Vệ Sinh Lao Động</h1>
                </div>

                {/* Alerts */}
                {/* <div className="mb-4 w-full">{alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}</div> */}

                {/* Form login */}
                <form onSubmit={handleLogin} className="flex w-full flex-col gap-5">
                    {/* ĐĂNG NHẬP text màu xanh */}
                    <h2 className="text-xl font-bold text-blue-600">ĐĂNG NHẬP</h2>

                    {/* Đổi label có dấu * giống design */}
                    <TextInput
                        label="Tên tài khoản *"
                        placeholder="Nhập tên tài khoản"
                        required={true}
                        value={account}
                        onChange={(e) => {
                            setAccount(e.target.value);
                            if (errors.account) {
                                setErrors({ ...errors, account: undefined });
                            }
                        }}
                        error={errors.account}
                    />

                    <PasswordInput
                        label="Mật khẩu *"
                        required={true}
                        value={password}
                        onChange={(e) => {
                            setPassword(e.target.value);
                            if (errors.password) {
                                setErrors({ ...errors, password: undefined });
                            }
                        }}
                        error={errors.password}
                    />

                    <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2">
                            <input type="checkbox" id="rememberMe" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="h-4 w-4 cursor-pointer accent-blue-600 rounded border-gray-300" />
                            <label htmlFor="rememberMe" className="cursor-pointer text-[15px] text-gray-700">
                                Nhớ đăng nhập
                            </label>
                        </div>

                        {/* Bỏ dấu "?" ở chữ Quên mật khẩu */}
                        <Link className="text-[15px] font-medium text-blue-600 hover:underline" href={"/forgot-password"}>
                            Quên mật khẩu
                        </Link>
                    </div>

                    {/* Buttons */}
                    <div className="mt-4 flex flex-col gap-4 mb-4">
                        <Button variant="primary" type="submit" loading={loading}>
                            Đăng nhập
                        </Button>

                        <Button variant="outline" type="button" disabled={loading}>
                            Đăng ký tài khoản doanh nghiệp
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
