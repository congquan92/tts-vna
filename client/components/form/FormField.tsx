import { ReactNode } from "react";
import clsx from "clsx";

type FormFieldProps = {
    label: string;
    required?: boolean;
    children: ReactNode;
    error?: string;
};

export default function FormField({ label, required, children, error }: FormFieldProps) {
    return (
        <div>
            <fieldset
                className={clsx("border rounded text-sm", {
                    "border-gray-400": !error,
                    "border-red-500": error,
                })}
            >
                <legend className="ml-1.5 px-1 text-gray-500">
                    {label}
                    {required && <span className="text-red-500">*</span>}
                </legend>

                {children}
            </fieldset>
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
    );
}
