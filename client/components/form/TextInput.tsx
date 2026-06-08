import clsx from "clsx";
import FormField from "./FormField";

type TextInputProps = {
    label: string;
    required?: boolean;
    placeholder?: string;
    classname?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    type?: string;
    disabled?: boolean;
    error?: string;
};

export default function TextInput({ label, required, placeholder, classname, value, onChange, type = "text", disabled = false, error }: TextInputProps) {
    return (
        <FormField label={label} required={required} error={error}>
            <input
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                disabled={disabled}
                className={clsx(
                    "outline-none px-2 py-1 w-full disabled:bg-gray-100 disabled:cursor-not-allowed",
                    {
                        "border-red-500": error,
                    },
                    classname,
                )}
            />
        </FormField>
    );
}
