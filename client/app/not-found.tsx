import React from "react";
import Link from "next/link";
import { FileQuestion, Home } from "lucide-react";

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-gray-100">
                <div className="flex justify-center mb-6">
                    <div className="p-4 bg-blue-50 rounded-full">
                        <FileQuestion className="h-16 w-16 text-blue-600" />
                    </div>
                </div>
                
                <h1 className="text-4xl font-bold text-gray-900 mb-2">404</h1>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Không tìm thấy trang</h2>
                
                <p className="text-gray-500 mb-8 leading-relaxed">
                    Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di dời. 
                    Vui lòng kiểm tra lại đường dẫn hoặc quay về trang chủ.
                </p>
                
                <Link 
                    href="/accounts" 
                    className="inline-flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg shadow-blue-200 active:scale-[0.98]"
                >
                    <Home className="h-5 w-5" />
                    Về trang chủ
                </Link>
            </div>
        </div>
    );
}
