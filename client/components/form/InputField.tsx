import { ChevronDown } from "lucide-react";

export const InputField = ({ 
    label, 
    value, 
    name,
    onChange,
    type = "text", 
    icon: Icon, 
    isSelect = false, 
    options = [],
    placeholder = "",
    readOnly = false,
    disabled = false,
    error
}: { 
    label?: string; 
    value?: string; 
    name?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    type?: string; 
    icon?: any; 
    isSelect?: boolean; 
    options?: { label: string; value: string }[];
    placeholder?: string;
    readOnly?: boolean;
    disabled?: boolean;
    error?: string;
}) => (
    <div className="relative w-full">
        {label && (
            <label className={`absolute -top-2 left-3 bg-white px-1 text-xs font-medium z-10 ${error ? "text-red-500" : "text-gray-400"}`}>
                {label}
            </label>
        )}
        <div className="relative">
            {isSelect ? (
                <select 
                    name={name}
                    value={value || ""}
                    onChange={onChange}
                    disabled={disabled || readOnly}
                    className={`w-full border rounded-md px-3 py-2.5 text-sm text-gray-700 focus:outline-none bg-transparent appearance-none cursor-pointer disabled:bg-gray-50 ${
                        error ? "border-red-500 focus:border-red-500" : "border-gray-200 focus:border-blue-500"
                    }`}
                >
                    <option value="" disabled hidden>{placeholder || "Chưa chọn"}</option>
                    {options.length > 0 ? (
                        options.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))
                    ) : (
                        value && <option value={value}>{value}</option>
                    )}
                </select>
            ) : (
                <input 
                    name={name}
                    type={type} 
                    value={value} 
                    onChange={onChange}
                    readOnly={readOnly}
                    disabled={disabled}
                    placeholder={placeholder} 
                    onClick={(e) => {
                        if (type === "date" && !readOnly && !disabled) {
                            (e.target as any).showPicker?.();
                        }
                    }}
                    className={`w-full border rounded-md px-3 py-2.5 text-sm text-gray-700 focus:outline-none bg-transparent read-only:bg-gray-50 disabled:bg-gray-50 cursor-text ${
                        error ? "border-red-500 focus:border-red-500" : "border-gray-200 focus:border-blue-500"
                    }`} 
                />
            )}
            {/* Render Icon nếu có */}
            {Icon && !isSelect && <Icon className={`absolute right-3 top-1/2 -translate-y-1/2 size-5 ${error ? "text-red-500" : "text-gray-400"}`} />}
            {isSelect && <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 size-4 pointer-events-none ${error ? "text-red-500" : "text-gray-500"}`} />}
        </div>
        {error && <p className="text-red-500 text-[11px] mt-1 ml-1">{error}</p>}
    </div>
);
