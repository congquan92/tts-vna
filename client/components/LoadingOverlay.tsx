import React from "react";

interface LoadingOverlayProps {
    isLoading?: boolean;
}

const LoadingOverlay = ({ isLoading = true }: LoadingOverlayProps) => {
    if (!isLoading) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="h-14 w-14 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600 shadow-lg"></div>
        </div>
    );
};

export default LoadingOverlay;
