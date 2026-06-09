"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, Typography, TextField, Button, Box } from "@mui/material";

interface ChangeEmailPopupProps {
    open: boolean;
    onClose: () => void;
}

export default function ChangeEmailPopup({ open, onClose }: ChangeEmailPopupProps) {
    // step 1: Nhập OTP | step 2: Nhập Email mới
    const [step, setStep] = useState(1);
    const [otp, setOtp] = useState("122456");
    const [newEmail, setNewEmail] = useState("Phanthanhhtung094@gmail.com");
    const [timeLeft, setTimeLeft] = useState(60);

    // Đếm ngược thời gian gửi mã OTP
    useEffect(() => {
        if (step === 1 && timeLeft > 0) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [timeLeft, step]);

    const handleConfirmOtp = () => {
        setStep(2); // Chuyển sang form email mới
    };

    const handleSaveEmail = () => {
        console.log("Email mới đã lưu:", newEmail);
        onClose();
        // Reset lại từ đầu cho lần mở sau
        setTimeout(() => {
            setStep(1);
            setTimeLeft(60);
        }, 300);
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
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
                    mb: 1,
                }}
            >
                Thay đổi Email
            </Typography>

            <DialogContent sx={{ p: 3, overflow: "hidden" }}>
                {step === 1 ? (
                    /* ----- FORM 1: XÁC NHẬN OTP ----- */
                    <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            Chúng tôi đã gửi mã xác minh qua số email cũ
                        </Typography>
                        <Typography variant="body2" color="text.primary" sx={{ fontWeight: "700", mb: 2 }}>
                            phanthanhhtung093@gmail.com
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            Bạn vui lòng kiểm tra và điền mã xác thực
                        </Typography>

                        <TextField fullWidth label="OTP *" variant="outlined" value={otp} onChange={(e) => setOtp(e.target.value)} sx={{ mb: 2 }} />

                        <Typography variant="body1" color="#2962ff" sx={{ mb: 1, fontWeight: "500" }}>
                            00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
                        </Typography>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ cursor: "pointer", mb: 4, "&:hover": { color: "#2962ff" } }}
                            onClick={() => setTimeLeft(60)} // Tính năng gửi lại mã
                        >
                            Chưa nhận được mã? Gửi lại
                        </Typography>

                        <Button
                            fullWidth
                            variant="contained"
                            onClick={handleConfirmOtp}
                            disableElevation
                            sx={{
                                bgcolor: "#2962ff",
                                textTransform: "none",
                                fontWeight: "700",
                                fontSize: "16px",
                                py: 1.5,
                                borderRadius: 2,
                                boxShadow: "0px 6px 20px rgba(41, 98, 255, 0.4)", // Hiệu ứng glow xanh dương
                                mb: 3,
                                "&:hover": { bgcolor: "#1c44b2" },
                            }}
                        >
                            Xác nhận
                        </Button>
                    </Box>
                ) : (
                    /* ----- FORM 2: NHẬP EMAIL MỚI ----- */
                    <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                            Vui lòng nhập email mới
                        </Typography>

                        <TextField fullWidth label="Email *" variant="outlined" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} sx={{ mb: 4 }} />

                        <Button
                            fullWidth
                            variant="contained"
                            onClick={handleSaveEmail}
                            disableElevation
                            sx={{
                                bgcolor: "#2962ff",
                                textTransform: "none",
                                fontWeight: "700",
                                fontSize: "16px",
                                py: 1.5,
                                borderRadius: 2,
                                boxShadow: "0px 6px 20px rgba(41, 98, 255, 0.4)",
                                mb: 3,
                                "&:hover": { bgcolor: "#1c44b2" },
                            }}
                        >
                            Lưu
                        </Button>
                    </Box>
                )}

                {/* NÚT HỦY DÙNG CHUNG */}
                <Typography variant="body1" color="#90949c" sx={{ fontWeight: "700", cursor: "pointer", "&:hover": { color: "#60646c" } }} onClick={onClose}>
                    Hủy bỏ
                </Typography>
            </DialogContent>
        </Dialog>
    );
}
