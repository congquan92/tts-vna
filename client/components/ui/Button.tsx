import clsx from "clsx";
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
        "font-medium cursor-pointer rounded-lg py-3 px-4 text-center text-[15px] transition-all duration-200",
        {
            "bg-blue-600 text-white hover:bg-blue-700": variant === "primary",
            "border border-blue-600 text-blue-600 bg-transparent hover:bg-blue-50": variant === "outline",
            "opacity-60 cursor-not-allowed": disabled || loading,
        },
        className,
    );

    return (
        <button type={type} onClick={onClick} className={style} disabled={disabled || loading}>
            {loading ? "Đang xử lý..." : children}
        </button>
    );
}
