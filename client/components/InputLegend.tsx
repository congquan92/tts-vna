"use client";

import FormField from "./form/FormField";

type InputLegendProps = {
    label: string;
    require?: boolean;
    input: React.InputHTMLAttributes<HTMLInputElement> & {
        value: string;
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    };
    errorMess?: string;
};

export default function InputLegend({ label, require, input, errorMess }: InputLegendProps) {
    return (
        <FormField label={label} required={require} error={errorMess}>
            <input
                {...input}
                className="outline-none px-2 py-1.5 w-full text-sm bg-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
        </FormField>
    );
}
