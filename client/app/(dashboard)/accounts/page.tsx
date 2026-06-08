"use client";

import TopHero from "@/components/TopHero";
import Button from "@/components/ui/Button";

const AccountPage = () => {
    return (
        <main className="space-y-5">
            <TopHero
                lable="Danh sách người dùng"
                component={
                    <div className="flex gap-5 rounded">
                        <Button variant="outline" className="flex gap-3 items-center">
                            <i className="fa-solid fa-upload"></i>
                            <span>Import</span>
                        </Button>
                        <Button variant="primary" className="flex gap-3 items-center">
                            <i className="fa-solid fa-plus"></i>
                            <span>Thêm mới</span>
                        </Button>
                    </div>
                }
            />

            <div>
                <div className="bg-[#F4F6F8] py-3 px-3">
                    <div className="flex font-semibold gap-3 pb-6">
                        <div className="flex-1"></div>
                        <div className="flex-4">Họ và tên</div>
                        <div className="flex-1">Tài khoản</div>
                        <div className="flex-2">Email</div>
                        <div className="flex-1">Vai trò</div>
                        <div className="flex-1">Chức danh</div>
                        <div className="flex-1">Trạng thái</div>
                    </div>

                    <div className="flex gap-3">
                        <div className="flex-1"></div>
                        <div className="flex-4">
                            <input type="text" className="w-full remove-outline px-3 py-1.25 ring-1 ring-gray-300 rounded bg-white" />
                        </div>
                        <div className="flex-1">
                            <input type="text" className="w-full remove-outline px-3 py-1.25 ring-1 ring-gray-300 rounded bg-white" />
                        </div>
                        <div className="flex-2">
                            <input type="text" className="w-full remove-outline px-3 py-1.25 ring-1 ring-gray-300 rounded bg-white" />
                        </div>
                        <div className="flex-1">
                            <select className="w-full remove-outline px-3 py-1.5 h-full ring-1 ring-gray-300 rounded bg-white">
                                <option value=""></option>
                            </select>
                        </div>
                        <div className="flex-1">
                            <input type="text" className="w-full remove-outline px-3 py-1.25 ring-1 ring-gray-300 rounded bg-white" />
                        </div>
                        <div className="flex-1">
                            <select className="w-full remove-outline px-3 py-1.5 h-full ring-1 ring-gray-300 rounded bg-white">
                                <option value=""></option>
                            </select>
                        </div>
                    </div>
                </div>

                <div></div>
            </div>
        </main>
    );
};

export default AccountPage;
