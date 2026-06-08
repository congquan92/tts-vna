import clsx from "clsx";
import { AlertCircle, CheckCircle, X } from "lucide-react";

type AlertProps = {
    type: "error" | "success" | "warning" | "info";
    message: string;
    onClose?: () => void;
    className?: string;
};

export default function Alert({ type, message, onClose, className }: AlertProps) {
    const styles = clsx(
        "flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm",
        {
            "bg-red-50 text-red-800 border border-red-200": type === "error",
            "bg-green-50 text-green-800 border border-green-200": type === "success",
            "bg-yellow-50 text-yellow-800 border border-yellow-200": type === "warning",
            "bg-blue-50 text-blue-800 border border-blue-200": type === "info",
        },
        className,
    );

    return (
        <div className={styles}>
            <div className="shrink-0">
                {type === "error" && <AlertCircle size={20} />}
                {type === "success" && <CheckCircle size={20} />}
                {type === "warning" && <AlertCircle size={20} />}
                {type === "info" && <AlertCircle size={20} />}
            </div>
            <p className="flex-1">{message}</p>
            {onClose && (
                <button onClick={onClose} className="shrink-0 hover:opacity-70 cursor-pointer">
                    <X size={20} />
                </button>
            )}
        </div>
    );
}
