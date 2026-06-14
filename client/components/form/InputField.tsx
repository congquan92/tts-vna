"use client";

import { ChevronDown, Search, Eye, EyeOff } from "lucide-react";
import { useState, useRef, useEffect, useMemo } from "react";

export const InputField = ({ 
    label, 
    value, 
    name,
    onChange,
    type = "text", 
    icon: Icon, 
    isSelect = false, 
    isSearchable = false,
    options = [],
    placeholder = "",
    readOnly = false,
    disabled = false,
    error
}: { 
    label?: string; 
    value?: string; 
    name?: string;
    onChange?: (e: any) => void;
    type?: string; 
    icon?: any; 
    isSelect?: boolean; 
    isSearchable?: boolean;
    options?: { label: string; value: string }[];
    placeholder?: string;
    readOnly?: boolean;
    disabled?: boolean;
    error?: string;
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const filteredOptions = useMemo(() => {
        if (!searchTerm) return options;
        return options.filter(opt => 
            opt.label.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [options, searchTerm]);

    const selectedOption = options.find(opt => opt.value === value);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (option: { label: string; value: string }) => {
        if (onChange) {
            onChange({
                target: { name, value: option.value }
            } as any);
        }
        setIsOpen(false);
        setSearchTerm("");
    };

    const handleFocus = () => setIsFocused(true);
    const handleBlur = () => setIsFocused(false);

    const hasValue = value !== undefined && value !== null && value !== "";
    const shouldFloat = isFocused || hasValue || type === "date" || (isSelect && !!value) || isOpen;

    const labelClasses = label && (
        shouldFloat 
            ? `absolute -top-2 left-3 bg-white px-1 text-[11px] font-medium z-10 transition-all duration-200 ${
                error ? "text-red-500" : isFocused ? "text-blue-500" : "text-gray-400"
              }`
            : `absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 z-10 transition-all duration-200 pointer-events-none`
    );

    const inputType = type === "password" ? (showPassword ? "text" : "password") : type;

    if (!isSelect || !isSearchable) {
        return (
            <div className="relative w-full">
                {label && (
                    <label className={labelClasses}>
                        {label}
                    </label>
                )}
                <div className="relative">
                    {isSelect ? (
                        <select 
                            name={name}
                            value={value || ""}
                            onChange={onChange}
                            onFocus={handleFocus}
                            onBlur={handleBlur}
                            disabled={disabled || readOnly}
                            className={`w-full border rounded-md px-3 py-2.5 text-sm text-gray-700 focus:outline-none bg-transparent appearance-none cursor-pointer disabled:bg-gray-50 ${
                                error ? "border-red-500 focus:border-red-500" : "border-gray-200 focus:border-blue-500"
                            }`}
                        >
                            <option value="" disabled hidden>{shouldFloat ? (placeholder || "Chưa chọn") : ""}</option>
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
                            type={inputType} 
                            value={value} 
                            onChange={onChange}
                            onFocus={handleFocus}
                            onBlur={handleBlur}
                            readOnly={readOnly}
                            disabled={disabled}
                            placeholder={shouldFloat ? placeholder : ""} 
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
                    
                    {/* Render Icon/Eye Toggle */}
                    {type === "password" ? (
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer z-10"
                        >
                            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        </button>
                    ) : Icon && !isSelect ? (
                        <Icon className={`absolute right-3 top-1/2 -translate-y-1/2 size-5 ${error ? "text-red-500" : "text-gray-400"}`} />
                    ) : null}
                    
                    {isSelect && <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 size-4 pointer-events-none ${error ? "text-red-500" : "text-gray-500"}`} />}
                </div>
                {error && <p className="text-red-500 text-[11px] mt-1 ml-1">{error}</p>}
            </div>
        );
    }

    // Searchable Select
    return (
        <div className="relative w-full" ref={dropdownRef}>
            {label && (
                <label className={labelClasses}>
                    {label}
                </label>
            )}
            <div className="relative">
                <div
                    onClick={() => !disabled && !readOnly && setIsOpen(!isOpen)}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    tabIndex={disabled || readOnly ? -1 : 0}
                    className={`w-full border rounded-md px-3 py-2.5 text-sm text-gray-700 focus:outline-none bg-transparent cursor-pointer flex justify-between items-center min-h-[42px] ${
                        disabled || readOnly ? "bg-gray-50 cursor-not-allowed" : "hover:border-blue-500"
                    } ${error ? "border-red-500" : "border-gray-200"}`}
                >
                    <span className={selectedOption ? "text-gray-700" : "text-gray-400"}>
                        {selectedOption ? selectedOption.label : (shouldFloat ? (placeholder || "Chưa chọn") : "")}
                    </span>
                    <ChevronDown className={`size-4 transition-transform ${isOpen ? "rotate-180" : ""} ${error ? "text-red-500" : "text-gray-500"}`} />
                </div>

                {isOpen && (
                    <div className="absolute top-full left-0 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-[100] overflow-hidden">
                        <div className="p-2 border-b border-gray-100 flex items-center gap-2 sticky top-0 bg-white">
                            <Search className="size-4 text-gray-400 shrink-0" />
                            <input
                                autoFocus
                                type="text"
                                placeholder="Tìm kiếm..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full text-sm outline-none py-1"
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                        <ul className="max-h-60 overflow-auto py-1">
                            {filteredOptions.length > 0 ? (
                                filteredOptions.map((opt) => (
                                    <li
                                        key={opt.value}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleSelect(opt);
                                        }}
                                        className={`px-3 py-2 text-sm cursor-pointer hover:bg-blue-50 transition-colors ${
                                            opt.value === value ? "bg-blue-50 text-blue-600 font-medium" : "text-gray-700"
                                        }`}
                                    >
                                        {opt.label}
                                    </li>
                                ))
                            ) : (
                                <li className="px-3 py-2 text-sm text-gray-400 text-center italic">Không tìm thấy kết quả</li>
                            )}
                        </ul>
                    </div>
                )}
            </div>
            {error && <p className="text-red-500 text-[11px] mt-1 ml-1">{error}</p>}
        </div>
    );
};
