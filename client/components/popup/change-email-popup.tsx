"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, Typography, Box } from "@mui/material";
import { AuthApi } from "@/api/auth";
import { AxiosError } from "axios";
import Button from "@/components/ui/Button";
import { InputField } from "@/components/form/InputField";
import { toast } from "sonner";

interface ChangeEmailPopupProps {
    open: boolean;
    onClose: () => void;
    currentEmail?: string;
}

export default function ChangeEmailPopup({ open, onClose, currentEmail }: ChangeEmailPopupProps) {
    // step 1: Nhập OTP | step 2: Nhập Email mới
    const [step, setStep] = useState(1);
    const [otp, setOtp] = useState("");
    const [newEmail, setNewEmail] = useState("");
    const [timeLeft, setTimeLeft] = useState(60);
    const [loading, setLoading] = useState(false);
    const [hasSentOtp, setHasSentOtp] = useState(false);

    // Gửi OTP khi mở popup (hoặc khi người dùng yêu cầu gửi lại)
    const handleSendOtp = useCallback(async () => {
        setLoading(true);
        try {
            await AuthApi.requestChangeEmail();
            setTimeLeft(60);
            setHasSentOtp(true);
            toast.success("Mã OTP đã được gửi tới email của bạn");
        } catch (error: unknown) {
            console.error("Error sending OTP:", error);
            const axiosError = error as AxiosError<{ message: string }>;
            const errorMessage = axiosError.response?.data?.message || "Không thể gửi mã OTP, vui lòng thử lại sau";
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (open && step === 1 && !hasSentOtp) {
            const timer = setTimeout(() => {
                handleSendOtp();
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [open, step, hasSentOtp, handleSendOtp]);

    // Reset state when dialog closes
    useEffect(() => {
        if (!open) {
            const timer = setTimeout(() => {
                setStep(1);
                setOtp("");
                setNewEmail("");
                setTimeLeft(60);
                setHasSentOtp(false);
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [open]);

    // Đếm ngược thời gian gửi mã OTP
    useEffect(() => {
        if (step === 1 && timeLeft > 0 && open) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [timeLeft, step, open]);

    const handleConfirmOtp = async () => {
        if (!otp) {
            toast.error("Vui lòng nhập mã OTP");
            return;
        }
        if (timeLeft === 0) {
            toast.error("Mã OTP đã hết hạn, vui lòng gửi lại mã mới");
            return;
        }

        if (!currentEmail) {
            toast.error("Không xác định được email hiện tại");
            return;
        }

        setLoading(true);
        try {
            await AuthApi.verifyOtp(currentEmail, otp);
            setStep(2); // Chuyển sang form email mới
        } catch (error: unknown) {
            console.error("Error verifying OTP:", error);
            const axiosError = error as AxiosError<{ message: string }>;
            const errorMessage = axiosError.response?.data?.message || "Mã OTP không đúng hoặc đã hết hạn";
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveEmail = async () => {
        if (!newEmail) {
            toast.error("Vui lòng nhập email mới");
            return;
        }

        setLoading(true);
        try {
            await AuthApi.verifyAndChangeEmail({ newEmail, otp });
            toast.success("Đổi email thành công");

            // Tự động đóng sau khi thành công
            setTimeout(() => {
                handleClose();
            }, 1500);
        } catch (error: unknown) {
            console.error("Error changing email:", error);
            const axiosError = error as AxiosError<{ message: string }>;
            const errorMessage = axiosError.response?.data?.message || "Mã OTP không đúng hoặc email đã tồn tại";
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            slotProps={{
                paper: {
                    style: {
                        borderRadius: 16,
                        padding: "20px 10px",
                        width: "420px",
                        textAlign: "center",
                        boxShadow: "0px 10px 30px rgba(0,0,0,0.1)",
                    },
                },
            }}
        >
            <Typography
                variant="h6"
                sx={{
                    color: "#2962ff",
                    fontWeight: 700,
                    textTransform: "uppercase",
                }}
            >
                Thay đổi Email
            </Typography>

            <DialogContent sx={{ p: 1, overflow: "hidden" }}>
                {step === 1 ? (
                    /* ----- FORM 1: XÁC NHẬN OTP ----- */
                    <Box className="flex flex-col gap-2 rounded-none">
                        <Box className="mb-2">
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                Chúng tôi đã gửi mã xác minh qua địa chỉ email cũ
                            </Typography>
                            <Typography variant="body2" color="text.primary" sx={{ fontWeight: "700", mb: 2 }}>
                                {currentEmail || "Đang xác định email..."}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Bạn vui lòng kiểm tra và điền mã xác thực
                            </Typography>
                        </Box>

                        <InputField label="OTP*" value={otp} placeholder="Nhập mã xác thực" onChange={(e) => setOtp(e.target.value)} />

                        <Box>
                            <Typography variant="body1" color="#2962ff" sx={{ mb: 1, fontWeight: "500" }}>
                                {timeLeft > 0 ? `00:${timeLeft < 10 ? `0${timeLeft}` : timeLeft}` : "Hết hạn"}
                            </Typography>
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{
                                    cursor: timeLeft === 0 ? "pointer" : "default",
                                    opacity: timeLeft === 0 ? 1 : 0.6,
                                    "&:hover": { color: timeLeft === 0 ? "#2962ff" : "text.secondary" },
                                }}
                                onClick={() => timeLeft === 0 && handleSendOtp()}
                            >
                                Chưa nhận được mã? {timeLeft === 0 ? "Gửi lại" : `Gửi lại sau ${timeLeft}s`}
                            </Typography>
                        </Box>

                        <Button onClick={handleConfirmOtp} disabled={loading || !otp} loading={loading} className="w-full">
                            Tiếp tục
                        </Button>
                    </Box>
                ) : (
                    /* ----- FORM 2: NHẬP EMAIL MỚI ----- */
                    <Box className="flex flex-col gap-4 rounded-none">
                        <div>Vui lòng nhập địa chỉ email mới</div>

                        <InputField label="Email" type="email" placeholder="Nhập email mới" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} disabled={loading} />

                        <Box className="flex flex-col gap-3 mt-2">
                            <Button onClick={handleSaveEmail} disabled={loading || !newEmail} loading={loading} className="w-full">
                                Lưu thay đổi
                            </Button>
                        </Box>
                    </Box>
                )}

                {/* NÚT HỦY  */}
                <Button variant="outline" onClick={handleClose} disabled={loading} className="w-full border-none text-gray-500 hover:text-gray-700 mt-2">
                    <strong>Hủy bỏ</strong>
                </Button>
            </DialogContent>
        </Dialog>
    );
}
