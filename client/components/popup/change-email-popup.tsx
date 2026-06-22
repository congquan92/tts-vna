"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, Typography, Box } from "@mui/material";
import { AuthApi } from "@/api/auth";
import axios, { AxiosError } from "axios";
import Button from "@/components/ui/Button";
import { InputField } from "@/components/form/InputField";
import { toast } from "sonner";
import LoadingOverlay from "@/components/LoadingOverlay";

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
    const [cooldown, setCooldown] = useState(60);
    const [otpTimeLeft, setOtpTimeLeft] = useState(300);
    const [loading, setLoading] = useState(false);
    const [hasSentOtp, setHasSentOtp] = useState(false);

    // Gửi OTP khi mở popup (hoặc khi người dùng yêu cầu gửi lại)
    const handleSendOtp = useCallback(async () => {
        setLoading(true);
        try {
            await AuthApi.requestChangeEmail();
            setCooldown(60);
            setOtpTimeLeft(300);
            setHasSentOtp(true);
            toast.success("Mã OTP đã được gửi tới email của bạn");
        } catch (error: unknown) {
            let errorMessage = "Không thể gửi mã OTP, vui lòng thử lại sau";
            if (axios.isAxiosError(error) && error.response?.data?.message) {
                errorMessage = error.response.data.message;
            }
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
                setCooldown(60);
                setOtpTimeLeft(300);
                setHasSentOtp(false);
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [open]);

    // Đếm ngược thời gian gửi lại mã OTP (cooldown) và thời gian hết hạn OTP (otpTimeLeft)
    useEffect(() => {
        if (step === 1 && open) {
            const timer = setInterval(() => {
                setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
                setOtpTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [step, open]);

    const handleConfirmOtp = async () => {
        if (!otp) {
            toast.error("Vui lòng nhập mã OTP");
            return;
        }
        if (otpTimeLeft === 0) {
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
            toast.success("Xác thực mã OTP thành công");
            setStep(2); // Chuyển sang form email mới
        } catch (error: unknown) {
            let errorMessage = "Mã OTP không chính xác, vui lòng kiểm tra lại";
            if (axios.isAxiosError(error) && error.response?.data?.message) {
                const msg = error.response.data.message;
                if (msg.includes("OTP")) {
                    errorMessage = "Mã OTP không chính xác, vui lòng kiểm tra lại";
                } else {
                    errorMessage = msg;
                }
            }
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

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(newEmail)) {
            toast.error("Email không hợp lệ, vui lòng kiểm tra lại dữ liệu");
            return;
        }

        if (currentEmail && newEmail.trim().toLowerCase() === currentEmail.trim().toLowerCase()) {
            toast.error("Email mới không được trùng với email hiện tại, vui lòng kiểm tra lại dữ liệu");
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
            let errorMessage = "Có lỗi xảy ra, vui lòng kiểm tra lại";
            if (axios.isAxiosError(error) && error.response?.data?.message) {
                const msg = error.response.data.message;
                if (msg.includes("OTP")) {
                    errorMessage = "Mã OTP không chính xác, vui lòng kiểm tra lại";
                } else if (msg.includes("trùng")) {
                    errorMessage = "Email mới không được trùng với email hiện tại, vui lòng kiểm tra lại dữ liệu";
                } else if (msg.includes("tồn tại")) {
                    errorMessage = "Email mới đã tồn tại trên hệ thống, vui lòng kiểm tra lại dữ liệu";
                } else if (msg.includes("hợp lệ")) {
                    errorMessage = "Email không hợp lệ, vui lòng kiểm tra lại dữ liệu";
                } else {
                    errorMessage = msg;
                }
            }
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
            <LoadingOverlay isLoading={loading} />
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
                            <Typography variant="body1" color={otpTimeLeft > 0 ? "#2962ff" : "error"} sx={{ mb: 1, fontWeight: "500" }}>
                                {otpTimeLeft > 0 ? `${Math.floor(otpTimeLeft / 60)}:${otpTimeLeft % 60 < 10 ? `0${otpTimeLeft % 60}` : otpTimeLeft % 60}` : "Hết hạn"}
                            </Typography>
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{
                                    cursor: cooldown === 0 ? "pointer" : "default",
                                    opacity: cooldown === 0 ? 1 : 0.6,
                                    "&:hover": { color: cooldown === 0 ? "#2962ff" : "text.secondary" },
                                }}
                                onClick={() => cooldown === 0 && handleSendOtp()}
                            >
                                {cooldown === 0 ? <span className="text-[#2962ff] font-bold hover:underline">Gửi lại mã OTP</span> : `Chưa nhận được mã? Gửi lại sau ${cooldown}s`}
                            </Typography>
                        </Box>

                        <Button onClick={handleConfirmOtp} disabled={!otp} className="w-full">
                            Tiếp tục
                        </Button>
                    </Box>
                ) : (
                    /* ----- FORM 2: NHẬP EMAIL MỚI ----- */
                    <Box className="flex flex-col gap-4 rounded-none">
                        <div>Vui lòng nhập địa chỉ email mới</div>

                        <InputField label="Email" type="email" placeholder="Nhập email mới" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />

                        <Box className="flex flex-col gap-3 mt-2">
                            <Button onClick={handleSaveEmail} disabled={!newEmail} className="w-full">
                                Lưu thay đổi
                            </Button>
                        </Box>
                    </Box>
                )}

                {/* NÚT HỦY  */}
                <Button variant="outline" onClick={handleClose} className="w-full border-none text-gray-500 hover:text-gray-700 mt-2">
                    <strong>Hủy bỏ</strong>
                </Button>
            </DialogContent>
        </Dialog>
    );
}
