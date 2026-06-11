"use client";

import TextInput from "@/components/form/TextInput";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";
import Link from "next/link";
import { useState, useEffect } from "react";
import { AuthApi } from "@/api/auth";
import { toast } from "sonner";

type Step = "email" | "otp" | "newPassword";
type FormErrors = {
    email?: string;
    otp?: string;
    newPassword?: string;
    confirmPassword?: string;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const OTP_CONSTRAINTS = {
    LENGTH: 6,
};
const PASSWORD_CONSTRAINTS = {
    MIN_LENGTH: 6,
};
const TIMERS = {
    RESEND_OTP: 60,
    LOGIN_SUCCESS_DELAY: 1500,
    OTP_VERIFY_DELAY: 1000,
};

export default function ForgotPasswordPage() {
    const [step, setStep] = useState<Step>("email");
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errors, setErrors] = useState<FormErrors>({});
    // const [alert, setAlert] = useState<{ type: "error" | "success"; message: string } | null>(null);
    const [loading, setLoading] = useState(false);
    const [resendTimer, setResendTimer] = useState(0);

    // Countdown timer effect for resending OTP
    useEffect(() => {
        if (step !== "otp" || resendTimer === 0) return;

        const interval = setInterval(() => {
            setResendTimer((prev) => (prev <= 1 ? 0 : prev - 1));
        }, 1000);

        return () => clearInterval(interval);
    }, [step, resendTimer]);

    const validateEmail = () => {
        const newErrors: FormErrors = {};

        if (!email.trim()) {
            newErrors.email = "Vui lòng nhập email";
        } else if (!EMAIL_REGEX.test(email)) {
            newErrors.email = "Vui lòng nhập đúng định dạng email";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateOTP = () => {
        const newErrors: FormErrors = {};

        if (!otp.trim()) {
            newErrors.otp = "Vui lòng nhập mã OTP";
        } else if (otp.length !== OTP_CONSTRAINTS.LENGTH) {
            newErrors.otp = `Mã OTP phải có ${OTP_CONSTRAINTS.LENGTH} chữ số`;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateNewPassword = () => {
        const newErrors: FormErrors = {};

        if (!newPassword.trim()) {
            newErrors.newPassword = "Vui lòng nhập mật khẩu mới";
        } else if (newPassword.length < PASSWORD_CONSTRAINTS.MIN_LENGTH) {
            newErrors.newPassword = `Mật khẩu phải có ít nhất ${PASSWORD_CONSTRAINTS.MIN_LENGTH} ký tự`;
        }

        if (!confirmPassword.trim()) {
            newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu";
        } else if (newPassword !== confirmPassword) {
            newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSendEmail = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateEmail()) {
            // setAlert({
            //     type: "error",
            //     message: "Vui lòng nhập đúng định dạng email",
            // });
            toast.error("Vui lòng nhập đúng định dạng email");
            return;
        }

        setLoading(true);
        try {
            await AuthApi.forgotPassword({ email });
            // setAlert({
            //     type: "success",
            //     message: "Gửi email thành công! Vui lòng kiểm tra email để nhận mã OTP",
            // });
            toast.success("Gửi email thành công! Vui lòng kiểm tra email để nhận mã OTP");
            setTimeout(() => {
                setStep("otp");
                setResendTimer(TIMERS.RESEND_OTP);
                // setAlert(null);
            }, TIMERS.LOGIN_SUCCESS_DELAY);
        } catch (error: any) {
            // setAlert({
            //     type: "error",
            //     message: error.response?.data?.message || "Email chưa đăng ký trong hệ thống hoặc có lỗi xảy ra",
            // });
            toast.error(error.response?.data?.message || "Email chưa đăng ký trong hệ thống hoặc có lỗi xảy ra");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateOTP()) {
            // setAlert({
            //     type: "error",
            //     message: "Vui lòng nhập đầy đủ thông tin",
            // });
            toast.error("Vui lòng nhập đầy đủ thông tin");
            return;
        }

        setLoading(true);
        try {
            await AuthApi.verifyOtp(email, otp);
            // setAlert({
            //     type: "success",
            //     message: "Xác nhận OTP thành công!",
            // });
            toast.success("Xác nhận OTP thành công!");
            setTimeout(() => {
                setStep("newPassword");
                // setAlert(null);
            }, TIMERS.OTP_VERIFY_DELAY);
        } catch (error: any) {
            // setAlert({
            // //     type: "error",
            // //     message: error.response?.data?.message || "Mã OTP không chính xác hoặc đã hết hạn",
            // });
            toast.error(error.response?.data?.message || "Mã OTP không chính xác hoặc đã hết hạn");
        } finally {
            setLoading(false);
        }
    };

    const handleResendOTP = async () => {
        if (resendTimer > 0) return;

        setLoading(true);
        try {
            await AuthApi.forgotPassword({ email });
            // setAlert({
            //     type: "success",
            //     message: "Gửi lại mã OTP thành công! Vui lòng kiểm tra email",
            // });
            toast.success("Gửi lại mã OTP thành công! Vui lòng kiểm tra email");
            setOtp("");
            setResendTimer(TIMERS.RESEND_OTP);
        } catch (error: any) {
            // setAlert({
            //     type: "error",
            //     message: error.response?.data?.message || "Không thể gửi lại mã OTP. Vui lòng thử lại sau",
            // });
            toast.error(error.response?.data?.message || "Không thể gửi lại mã OTP. Vui lòng thử lại sau");
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateNewPassword()) {
            // setAlert({
            //     type: "error",
            //     message: "Vui lòng nhập đầy đủ thông tin hợp lệ",
            // });
            toast.error("Vui lòng nhập đầy đủ thông tin hợp lệ");
            return;
        }

        setLoading(true);
        try {
            await AuthApi.resetPassword({
                email,
                otp,
                newPassword,
                confirmNewPassword: confirmPassword,
            });

            // setAlert({
            //     type: "success",
            //     message: "Đặt lại mật khẩu thành công! Vui lòng đăng nhập với mật khẩu mới",
            // });
            toast.success("Đặt lại mật khẩu thành công! Vui lòng đăng nhập với mật khẩu mới");

            setTimeout(() => {
                window.location.href = "/login";
            }, 2000);
        } catch (error: any) {
            // setAlert({
            //     type: "error",
            //     message: error.response?.data?.message || "Có lỗi xảy ra. Vui lòng thử lại sau",
            // });
            toast.error(error.response?.data?.message || "Có lỗi xảy ra. Vui lòng thử lại sau");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="shadow-lg p-8 flex flex-col justify-center items-center rounded-2xl w-full max-w-md">
                {/* logo */}
                <div className="h-20 w-20">
                    <img className="h-full w-full" src="/quochuy.png" alt="quochuy" />
                </div>

                {/* title */}
                <h1 className="font-bold py-3 text-xl text-primary">QUÊN MẬT KHẨU</h1>

                {/* alerts */}
                {/* <div className="w-full mb-4">{alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}</div> */}

                {/* Step 1: Email */}
                {step === "email" && (
                    <>
                        <p className="text-sm text-gray-600 text-center mb-4">Vui lòng nhập email đã đăng ký tài khoản</p>
                        <form onSubmit={handleSendEmail} className="flex flex-col gap-4 w-full">
                            <TextInput
                                label="Email"
                                placeholder="Nhập email"
                                required={true}
                                type="email"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    if (errors.email) {
                                        setErrors({ ...errors, email: undefined });
                                    }
                                }}
                                error={errors.email}
                            />

                            <div className="flex flex-col gap-2">
                                <Button variant="primary" type="submit" loading={loading}>
                                    Gửi mã OTP
                                </Button>

                                <p className="text-sm text-center">
                                    Bạn đã có tài khoản?{" "}
                                    <Link href="/login" className="text-primary font-medium hover:underline">
                                        Đăng nhập
                                    </Link>
                                </p>
                            </div>
                        </form>
                    </>
                )}
                {/* Step 2: OTP */}
                {step === "otp" && (
                    <>
                        <p className="text-sm text-gray-600 text-center mb-1">Nhập mã OTP 6 chữ số được gửi tới email</p>
                        <p className="text-sm font-semibold text-gray-800 text-center mb-4">{email}</p>
                        <form onSubmit={handleVerifyOTP} className="flex flex-col gap-4 w-full">
                            <TextInput
                                label="Mã OTP"
                                placeholder="Nhập 6 chữ số"
                                required={true}
                                value={otp}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                                    setOtp(value);
                                    if (errors.otp) {
                                        setErrors({ ...errors, otp: undefined });
                                    }
                                }}
                                error={errors.otp}
                            />

                            <div className="flex flex-col justify-center items-center text-xs text-gray-500 text-center">
                                <p>Mã xác thực có hiệu lực trong 5 phút.</p>

                                <div className="mt-1">
                                    {resendTimer > 0 ? (
                                        <p>
                                            Chưa nhận được mã? Gửi lại trong <span className="text-primary font-medium">{formatTime(resendTimer)}</span>
                                        </p>
                                    ) : (
                                        <p>
                                            Chưa nhận được mã?{" "}
                                            <button type="button" onClick={handleResendOTP} disabled={loading} className="text-primary font-medium hover:underline cursor-pointer">
                                                Gửi lại
                                            </button>
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <Button variant="primary" type="submit" loading={loading}>
                                    Xác nhận
                                </Button>
                            </div>

                            <p className="text-sm text-center">
                                Bạn đã có tài khoản?{" "}
                                <Link href="/login" className="text-primary font-medium hover:underline">
                                    Đăng nhập
                                </Link>
                            </p>
                        </form>
                    </>
                )}

                {/* Step 3: New Password */}
                {step === "newPassword" && (
                    <>
                        <p className="text-sm text-gray-600 text-center mb-4">Nhập mật khẩu mới cho tài khoản của bạn</p>
                        <form onSubmit={handleResetPassword} className="flex flex-col gap-4 w-full">
                            <TextInput
                                label="Mật khẩu mới"
                                placeholder="Nhập mật khẩu mới"
                                required={true}
                                type="password"
                                value={newPassword}
                                onChange={(e) => {
                                    setNewPassword(e.target.value);
                                    if (errors.newPassword) {
                                        setErrors({ ...errors, newPassword: undefined });
                                    }
                                }}
                                error={errors.newPassword}
                            />

                            <TextInput
                                label="Xác nhận mật khẩu"
                                placeholder="Nhập lại mật khẩu"
                                required={true}
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => {
                                    setConfirmPassword(e.target.value);
                                    if (errors.confirmPassword) {
                                        setErrors({ ...errors, confirmPassword: undefined });
                                    }
                                }}
                                error={errors.confirmPassword}
                            />

                            <div className="flex flex-col gap-2">
                                <Button variant="primary" type="submit" loading={loading}>
                                    Cập nhật mật khẩu
                                </Button>

                                <p className="text-sm text-center">
                                    Bạn đã có tài khoản?{" "}
                                    <Link href="/login" className="text-primary font-medium hover:underline">
                                        Đăng nhập
                                    </Link>
                                </p>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}
