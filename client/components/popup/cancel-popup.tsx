"use client";

import React from "react";
import ConfirmPopup from "./confirm-popup";

interface CancelPopupProps {
    isOpen: boolean;
    onClose: () => void;      // Closes the popup and continues editing (cancels the cancellation)
    onConfirm: () => void;    // Confirms the cancel action (cancels editing, closes the form)
    title?: string;
    message?: string;
    confirmText?: string;
    cancelText?: string;
}

export default function CancelPopup({
    isOpen,
    onClose,
    onConfirm,
    title = "Cảnh báo",
    message = "Dữ liệu báo cáo đã nhập sẽ không được lưu lại",
    confirmText = "Đồng ý",
    cancelText = "Huỷ bỏ",
}: CancelPopupProps) {
    return (
        <ConfirmPopup
            isOpen={isOpen}
            onClose={onClose}
            onConfirm={onConfirm}
            title={title}
            message={message}
            confirmText={confirmText}
            cancelText={cancelText}
            variant="primary"
        />
    );
}
