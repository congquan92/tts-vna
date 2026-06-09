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
    disabled = false
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
}) => (
    <div className="relative w-full">
        {label && <label className="absolute -top-2 left-3 bg-white px-1 text-xs text-gray-400 font-medium z-10">{label}</label>}
        <div className="relative">
            {isSelect ? (
                <select 
                    name={name}
                    value={value || ""}
                    onChange={onChange}
                    disabled={disabled || readOnly}
                    className="w-full border border-gray-200 rounded-md px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-blue-500 bg-transparent appearance-none cursor-pointer disabled:bg-gray-50"
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
                    className="w-full border border-gray-200 rounded-md px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-blue-500 bg-transparent read-only:bg-gray-50 disabled:bg-gray-50 cursor-text" 
                />
            )}
            {/* Render Icon nếu có */}
            {Icon && !isSelect && <Icon className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 size-5" />}
            {isSelect && <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 size-4 pointer-events-none" />}
        </div>
    </div>
);
