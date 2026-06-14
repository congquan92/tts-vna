"use client";

interface ToggleSwitchProps {
    checked?: boolean;
    onChange?: () => void;
    disabled?: boolean;
}

export default function ToggleSwitch({ checked = false, onChange, disabled = false }: ToggleSwitchProps) {
    return (
        <label className={`relative inline-flex items-center justify-center w-9 h-5 ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}>
            <input type="checkbox" className="sr-only" checked={checked} onChange={onChange} disabled={disabled} />
            <div className={`absolute w-full h-3.5 rounded-full transition-colors duration-200 ease-in-out ${checked ? "bg-blue-300" : "bg-gray-300"}`} />
            <div className={`absolute left-0 w-5 h-5 rounded-full transition-transform duration-200 ease-in-out ${checked ? "translate-x-4 bg-blue-600" : "translate-x-0 bg-gray-100 shadow-sm border border-gray-200"}`} />
        </label>
    );
}
