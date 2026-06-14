"use client";

type AccountInfoPopupProps = {
    isOpen: boolean;
    onClose: () => void;
    accountNumber: string;
    password: string;
};

export default function AccountInfoPopup({ isOpen, onClose, accountNumber, password }: AccountInfoPopupProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50">
            <div className="w-[400px] bg-white rounded-xl shadow-2xl overflow-hidden animate-[fadeInScale_0.25s_ease-out]">
                {/* Header */}
                <div className="bg-primary px-6 py-4 text-center">
                    <h3 className="text-white font-bold text-lg">Thông tin tài khoản</h3>
                </div>

                {/* Content */}
                <div className="px-6 py-6">
                    <ul className="space-y-3">
                        <li className="flex items-baseline gap-2">
                            <span className="text-sm text-gray-600">•</span>
                            <span className="text-sm text-gray-700">
                                Tài khoản: <strong className="text-gray-900 font-bold">{accountNumber}</strong>
                            </span>
                        </li>
                        <li className="flex items-baseline gap-2">
                            <span className="text-sm text-gray-600">•</span>
                            <span className="text-sm text-gray-700">
                                Mật khẩu: <strong className="text-gray-900 font-bold">{password}</strong>
                            </span>
                        </li>
                    </ul>
                </div>

                {/* Footer */}
                <div className="px-6 pb-5 flex justify-end">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-primary hover:text-primary/80 font-medium transition-colors">
                        Huỷ bỏ
                    </button>
                </div>
            </div>
        </div>
    );
}
