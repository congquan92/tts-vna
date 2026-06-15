import clsx from "clsx";
import { ReactNode } from "react";

type ButtonProps = {
    children: ReactNode;
    variant?: "primary" | "outline";
    onClick?: () => void;
    type?: "button" | "submit" | "reset";
    className?: string;
    disabled?: boolean;
    size?: "sm" | "md" | "lg";
};

export default function Button({ children, variant = "primary", onClick, type = "button", className, disabled = false, size = "md" }: ButtonProps) {
    const style = clsx(
        "font-medium cursor-pointer rounded-lg text-center transition-all duration-200 flex items-center justify-center",
        {
            // Variant
            "bg-blue-600 text-white hover:bg-blue-700": variant === "primary",
            "border border-blue-600 text-blue-600 bg-transparent hover:bg-blue-50": variant === "outline",

            // Size
            "py-2 px-3 text-sm": size === "sm",
            "py-3 px-4 text-[15px]": size === "md",
            "py-4 px-6 text-lg": size === "lg",

            // State
            "opacity-60 cursor-not-allowed": disabled,
        },
        className,
    );

    return (
        <button type={type} onClick={onClick} className={style} disabled={disabled}>
            {children}
        </button>
    );
}
