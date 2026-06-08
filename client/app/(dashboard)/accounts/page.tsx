"use client";

import { InputField } from "@/components/form/InputField";
import TopHero from "@/components/TopHero";
import Button from "@/components/ui/Button";
import { Calendar, Camera, Save } from "lucide-react";

const AccountPage = () => {
    return (
        <div className="space-y-5">
            <TopHero
                lable="Danh sách người dùng"
                component={
                    <div className="flex gap-3 ">
                        <Button variant="outline" size="sm" className="border-none font-bold text-gray-500 hover:bg-gray-100">
                            Hủy Bỏ
                        </Button>
                        <Button variant="primary" size="sm" className="pl-2 font-bold ">
                            <Save className="size-5 mr-2" /> Lưu
                        </Button>
                    </div>
                }
            />

            <div className="flex flex-col md:flex-row gap-5 items-start">
                {/* Left Sidebar - Avatar & Kích hoạt */}
                <div className="w-full md:w-[280px] bg-white rounded-lg shadow-sm border border-gray-100 p-6 flex flex-col items-center shrink-0">
                    <div className="relative w-36 h-36 rounded-full border border-dashed border-gray-300 flex flex-col items-center justify-center bg-gray-50 mb-3 cursor-pointer hover:bg-gray-100 transition-colors">
                        <Camera className="text-gray-500 mb-1 size-6" />
                        <span className="text-xs text-gray-500 font-medium">Tải ảnh đại diện</span>
                    </div>
                    <p className="text-[11px] text-gray-400 text-center mb-8 leading-relaxed">
                        *.jpeg, *.jpg, *.png.
                        <br />
                        Kích thước tối đa 5 MB
                    </p>

                    <div className="flex items-center justify-between w-full mt-auto pt-4">
                        <span className="text-sm font-bold text-gray-800">Kích hoạt</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" defaultChecked />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>
                </div>

                {/* Right Area - Form Inputs */}
                <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-100 p-6 w-full">
                    {/* Section 1: Thông tin cá nhân */}
                    <h2 className="text-[15px] font-bold text-gray-800 mb-6">Thông tin cá nhân</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-6 mb-6">
                        <InputField label="Tên đăng nhập(*)" value="Vna25112020" />
                        <InputField label="Họ và tên(*)" value="Phan Thanh Tùng" />

                        <InputField label="Ngày tháng năm sinh" value="01/06/1995" icon={Calendar} />
                        <InputField label="Giới tính" value="" isSelect />

                        <InputField label="Chức danh" placeholder="Nhập chức danh" />
                        <InputField label="Vai trò *" value="Quản trị viên" isSelect />
                    </div>

                    <div className="flex items-center gap-4 mb-8">
                        <div className="flex-1">
                            {/* Ô email không có label nổi theo như hình */}
                            <input type="email" defaultValue="phanthanhhtung093@gmail.com" className="w-full border border-gray-200 rounded-md px-3 py-2.5 text-sm text-gray-500 focus:outline-none focus:border-blue-500" />
                        </div>
                        <button className="text-blue-600 text-sm font-semibold hover:underline px-2 cursor-pointer">Thay đổi</button>
                    </div>

                    {/* Section 2: Thông tin liên hệ */}
                    <div className="border-t border-gray-100 pt-6">
                        <h2 className="text-[15px] font-bold text-gray-800 mb-6">Thông tin liên hệ</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-6 mb-6">
                            <InputField label="Tỉnh/ thành phố" value="Thành phố Hồ Chí Minh" isSelect />
                            <InputField label="Phường xã" value="Phường Gò Vấp" isSelect />
                        </div>

                        <InputField label="Địa chỉ" placeholder="Nhập địa chỉ chi tiết" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AccountPage;
