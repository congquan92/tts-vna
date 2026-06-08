import clsx from "clsx";
import Link from "next/link";
import { ReactNode } from "react";

type ButtonProps = {
    children: ReactNode;
    variant?: "primary" | "outline";
    onClick?: () => void;
    type?: "button" | "submit" | "reset";
    className?: string;
    disabled?: boolean;
    loading?: boolean;
};

export default function Button({ children, variant = "primary", onClick, type = "button", className, disabled = false, loading = false }: ButtonProps) {
    const style = clsx(
        "font-medium cursor-pointer rounded py-2 px-2 text-center transition-opacity",
        {
            "bg-primary text-white hover:opacity-90": variant === "primary",
            "border border-primary text-primary hover:bg-primary hover:text-white": variant === "outline",
            "opacity-50 cursor-not-allowed": disabled || loading,
        },
        className,
    );

    return (
        <button type={type} onClick={onClick} className={style} disabled={disabled || loading}>
            {loading ? "Đang xử lý..." : children}
        </button>
    );
}
