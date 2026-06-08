"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { mockLoginAPI, TIMERS } from "@/src/mocks";
import TextInput from "@/components/form/TextInput";
import PasswordInput from "@/components/form/PasswordInput";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";

type FormErrors = {
    account?: string;
    password?: string;
};

export default function LoginPage() {
    const [account, setAccount] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [errors, setErrors] = useState<FormErrors>({});
    const [alert, setAlert] = useState<{ type: "error" | "success"; message: string } | null>(null);
    const [loading, setLoading] = useState(false);

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
            setAlert({
                type: "error",
                message: "Vui lòng nhập đầy đủ thông tin",
            });
            return;
        }

        setLoading(true);
        try {
            // Mock API call
            const isValid = await mockLoginAPI(account, password);

            // Mock validation
            if (isValid) {
                setAlert({
                    type: "success",
                    message: "Đăng nhập thành công!",
                });
                // Clear form
                setAccount("");
                setPassword("");
            } else {
                setAlert({
                    type: "error",
                    message: "Tài khoản hoặc mật khẩu không đúng. Vui lòng nhập lại",
                });
            }
        } catch (error) {
            setAlert({
                type: "error",
                message: "Có lỗi xảy ra. Vui lòng thử lại sau",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="shadow-lg p-8 flex flex-col justify-center items-center rounded-2xl w-full max-w-md">
                {/* logo */}
                <div className="h-20 w-20">
                    <Image src="/quochuy.png" alt="quochuy" width={80} height={80} />
                </div>

                {/* title */}
                <div className="flex flex-col items-center font-bold py-3 text-2xl">
                    <h1 className="text-center">Phần Mềm Quản Lý - Tạo Lập Cơ Sở Dữ Liệu</h1>
                    <h1>An Toàn Vệ Sinh Lao Động</h1>
                </div>

                {/* alerts */}
                <div className="w-full mb-4">{alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}</div>

                {/* form login */}
                <form onSubmit={handleLogin} className="flex flex-col gap-4 w-full">
                    <h2 className="text-primary font-bold text-xl">ĐĂNG NHẬP</h2>

                    <TextInput
                        label="Tài khoản"
                        placeholder="Nhập tài khoản"
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
                        label="Mật khẩu"
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

                    <div className="flex justify-between items-center">
                        <div className="flex gap-2 items-center">
                            <input type="checkbox" id="rememberMe" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="cursor-pointer" />
                            <label htmlFor="rememberMe" className="text-sm cursor-pointer">
                                Nhớ đăng nhập
                            </label>
                        </div>

                        <Link className="text-primary font-medium text-sm hover:underline" href={"/forgot-password"}>
                            Quên mật khẩu?
                        </Link>
                    </div>

                    {/* buttons */}
                    <div className="flex flex-col gap-2 py-3">
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
