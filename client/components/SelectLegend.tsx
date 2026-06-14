"use client";

import FormField from "./form/FormField";
import { ChevronDown } from "lucide-react";

type SelectLegendProps = {
    label: string;
    require?: boolean;
    select: {
        value: string;
        onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
        disabled?: boolean;
    };
    errorMess?: string;
    children: React.ReactNode;
};

export default function SelectLegend({ label, require, select, errorMess, children }: SelectLegendProps) {
    return (
        <FormField label={label} required={require} error={errorMess}>
            <div className="relative">
                <select
                    {...select}
                    className="outline-none px-2 py-1.5 w-full text-sm bg-transparent appearance-none cursor-pointer disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                    {children}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 size-4 pointer-events-none text-gray-500" />
            </div>
        </FormField>
    );
}
