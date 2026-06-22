"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, Typography, Box } from "@mui/material";
import Button from "@/components/ui/Button";
import { InputField } from "@/components/form/InputField";
import LoadingOverlay from "@/components/LoadingOverlay";
import { toast } from "sonner";
import { getErrorMessage } from "@/utils/error-handle";

type OtpVerificationPopupProps = {
    isOpen: boolean;
    onClose: () => void;
    email: string;
    onVerify: (otp: string) => Promise<boolean>;
    onResend: () => Promise<void>;
};

export default function OtpVerificationPopup({
    isOpen,
    onClose,
    email,
    onVerify,
    onResend,
}: OtpVerificationPopupProps) {
    const [otp, setOtp] = useState("");
    const [timeLeft, setTimeLeft] = useState(300);
    const [resendCooldown, setResendCooldown] = useState(60);
    const [loading, setLoading] = useState(false);

    const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
    if (isOpen !== prevIsOpen) {
        setPrevIsOpen(isOpen);
        if (isOpen) {
            setOtp("");
            setTimeLeft(300);
            setResendCooldown(60);
        }
    }

    // Countdown timers for OTP and Resend Cooldown
    useEffect(() => {
        if (!isOpen) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
            setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);

        return () => clearInterval(timer);
    }, [isOpen]);

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins < 10 ? `0${mins}` : mins}:${secs < 10 ? `0${secs}` : secs}`;
    };

    const handleConfirmOtp = async () => {
        if (!otp) {
            toast.error("Vui lòng nhập mã OTP");
            return;
        }
        if (timeLeft === 0) {
            toast.error("Mã OTP đã hết hạn, vui lòng gửi lại mã mới");
            return;
        }

        setLoading(true);
        try {
            const success = await onVerify(otp);
            if (!success) {
                toast.error("Mã OTP không đúng. Vui lòng kiểm tra lại.");
            }
        } catch (error: unknown) {
            const msg = getErrorMessage(error, "Mã OTP không đúng hoặc đã hết hạn");
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleSendOtp = async () => {
        setLoading(true);
        try {
            await onResend();
            setTimeLeft(300);
            setResendCooldown(60);
            toast.success("Mã OTP mới đã được gửi");
        } catch (error: unknown) {
            const msg = getErrorMessage(error, "Không thể gửi lại mã OTP, vui lòng thử lại sau");
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        onClose();
    };

    return (
        <Dialog
            open={isOpen}
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
                Xác thực Email
            </Typography>

            <DialogContent sx={{ p: 1, overflow: "hidden" }}>
                <Box className="flex flex-col gap-2 rounded-none">
                    <Box className="mb-2">
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            Chúng tôi đã gửi mã xác minh tới địa chỉ email đăng ký
                        </Typography>
                        <Typography variant="body2" color="text.primary" sx={{ fontWeight: "700", mb: 2 }}>
                            {email || "Đang xác định email..."}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Bạn vui lòng kiểm tra và điền mã xác thực
                        </Typography>
                    </Box>

                    <InputField 
                        label="OTP*" 
                        value={otp} 
                        placeholder="Nhập mã xác thực" 
                        onChange={(e) => setOtp(e.target.value)} 
                    />

                    <Box className="my-2">
                        <Typography variant="body1" color="#2962ff" sx={{ mb: 1, fontWeight: "500" }}>
                            {timeLeft > 0 ? `Hạn sử dụng mã: ${formatTime(timeLeft)}` : "Mã OTP đã hết hạn"}
                        </Typography>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                                cursor: resendCooldown === 0 ? "pointer" : "default",
                                opacity: resendCooldown === 0 ? 1 : 0.6,
                                "&:hover": { color: resendCooldown === 0 ? "#2962ff" : "text.secondary" },
                            }}
                            onClick={() => resendCooldown === 0 && handleSendOtp()}
                        >
                            Chưa nhận được mã? {resendCooldown === 0 ? "Gửi lại" : `Gửi lại sau ${resendCooldown}s`}
                        </Typography>
                    </Box>

                    <Button onClick={handleConfirmOtp} disabled={!otp} className="w-full">
                        Xác nhận
                    </Button>
                </Box>

                {/* NÚT HỦY  */}
                <Button variant="outline" onClick={handleClose} className="w-full border-none text-gray-500 hover:text-gray-700 mt-2">
                    <strong>Hủy bỏ</strong>
                </Button>
            </DialogContent>
        </Dialog>
    );
}
