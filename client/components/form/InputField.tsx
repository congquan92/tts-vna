import { ChevronDown } from "lucide-react";

export const InputField = ({ label, value, type = "text", icon: Icon, isSelect = false, placeholder = "" }: { label?: string; value?: string; type?: string; icon?: any; isSelect?: boolean; placeholder?: string }) => (
    <div className="relative w-full">
        {label && <label className="absolute -top-2 left-3 bg-white px-1 text-xs text-gray-400 font-medium z-10">{label}</label>}
        <div className="relative">
            {isSelect ? (
                <select className="w-full border border-gray-200 rounded-md px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-blue-500 bg-transparent appearance-none cursor-pointer">
                    <option>{value}</option>
                </select>
            ) : (
                <input type={type} defaultValue={value} placeholder={placeholder} className="w-full border border-gray-200 rounded-md px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-blue-500 bg-transparent" />
            )}
            {/* Render Icon nếu có */}
            {Icon && !isSelect && <Icon className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 size-5" />}
            {isSelect && <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 size-4 pointer-events-none" />}
        </div>
    </div>
);
