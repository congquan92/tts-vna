import clsx from "clsx";
import { Url } from "next/dist/shared/lib/router/router";
import Link from "next/link";
import { ReactNode } from "react";

type LinkButtonProps = {
    children: ReactNode;
    href: Url;
    variant?: "primary" | "outline";
    onClick?: () => void;
    className?: string;
};

export default function LinkButton({ children, variant = "primary", href, onClick, className }: LinkButtonProps) {
    const style = clsx(
        "font-medium rounded py-2 px-2 text-center transition-opacity block",
        {
            "bg-primary text-white hover:opacity-90": variant === "primary",
            "border border-primary text-primary hover:bg-primary hover:text-white": variant === "outline",
        },
        className,
    );

    return (
        <Link href={href} onClick={onClick} className={style}>
            {children}
        </Link>
    );
}
