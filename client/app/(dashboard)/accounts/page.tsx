"use client";

import { InputField } from "@/components/form/InputField";
import TopHero from "@/components/TopHero";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";
import { Calendar, Camera, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { AuthApi } from "@/api/auth";
import { User, UpdateProfilePayload } from "@/types/auth";

const AccountPage = () => {
    const [profile, setProfile] = useState<User | null>(null);
    const [formData, setFormData] = useState<UpdateProfilePayload>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await AuthApi.getProfile();
                setProfile(data);
                // Initialize form data with current profile values
                setFormData({
                    fullName: data.fullName,
                    email: data.email,
                    avatarUrl: data.avatarUrl,
                    gender: data.gender,
                    province: data.province,
                    isActive: data.isActive,
                    dob: data.dob,
                    position: data.position,
                    ward: data.ward,
                    address: data.address,
                });
            } catch (error) {
                console.error("Error fetching profile:", error);
                setAlert({ type: "error", message: "Không thể tải thông tin người dùng" });
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleToggleActive = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({ ...prev, isActive: e.target.checked }));
    };

    const handleSave = async () => {
        setSaving(true);
        setAlert(null);
        try {
            const updatedProfile = await AuthApi.updateProfile(formData);
            setProfile({ ...updatedProfile, account: profile?.account });
            setAlert({ type: "success", message: "Cập nhật thông tin thành công" });
        } catch (error: any) {
            console.error("Error updating profile:", error);
            setAlert({ 
                type: "error", 
                message: error.response?.data?.message || "Có lỗi xảy ra khi cập nhật thông tin" 
            });
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        if (profile) {
            setFormData({
                fullName: profile.fullName,
                email: profile.email,
                avatarUrl: profile.avatarUrl,
                gender: profile.gender,
                province: profile.province,
                isActive: profile.isActive,
                dob: profile.dob,
                position: profile.position,
                ward: profile.ward,
                address: profile.address,
            });
        }
        setAlert(null);
    };

    if (loading) {
        return <div className="p-10 text-center">Đang tải thông tin...</div>;
    }

    return (
        <div className="space-y-5">
            <TopHero
                lable="Danh sách người dùng"
                component={
                    <div className="flex gap-3 ">
                        <Button 
                            variant="outline" 
                            size="sm" 
                            className="border-none font-bold text-gray-500 hover:bg-gray-100"
                            onClick={handleCancel}
                            disabled={saving}
                        >
                            Hủy Bỏ
                        </Button>
                        <Button 
                            variant="primary" 
                            size="sm" 
                            className="pl-2 font-bold "
                            onClick={handleSave}
                            loading={saving}
                        >
                            <Save className="size-5 mr-2" /> Lưu
                        </Button>
                    </div>
                }
            />

            <div className="w-full mb-4">
                {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}
            </div>

            <div className="flex flex-col md:flex-row gap-5 items-start">
                {/* Left Sidebar - Avatar & Kích hoạt */}
                <div className="w-full md:w-[280px] bg-white rounded-lg shadow-sm border border-gray-100 p-6 flex flex-col items-center shrink-0">
                    <div className="relative w-36 h-36 rounded-full border border-dashed border-gray-300 flex flex-col items-center justify-center bg-gray-50 mb-3 cursor-pointer hover:bg-gray-100 transition-colors">
                        {formData.avatarUrl ? (
                            <img src={formData.avatarUrl} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                        ) : (
                            <>
                                <Camera className="text-gray-500 mb-1 size-6" />
                                <span className="text-xs text-gray-500 font-medium">Tải ảnh đại diện</span>
                            </>
                        )}
                    </div>
                    <p className="text-[11px] text-gray-400 text-center mb-8 leading-relaxed">
                        *.jpeg, *.jpg, *.png.
                        <br />
                        Kích thước tối đa 5 MB
                    </p>

                    <div className="flex items-center justify-between w-full mt-auto pt-4">
                        <span className="text-sm font-bold text-gray-800">Kích hoạt</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                                type="checkbox" 
                                className="sr-only peer" 
                                checked={formData.isActive}
                                onChange={handleToggleActive}
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>
                </div>

                {/* Right Area - Form Inputs */}
                <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-100 p-6 w-full">
                    {/* Section 1: Thông tin cá nhân */}
                    <h2 className="text-[15px] font-bold text-gray-800 mb-6">Thông tin cá nhân</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-6 mb-6">
                        <InputField 
                            label="Tên đăng nhập(*)" 
                            value={profile?.account?.username || ""} 
                            placeholder="Tên đăng nhập"
                            readOnly
                        />
                        <InputField 
                            name="fullName"
                            label="Họ và tên(*)" 
                            value={formData.fullName || ""} 
                            onChange={handleChange}
                        />

                        <InputField 
                            name="dob"
                            label="Ngày tháng năm sinh" 
                            value={formData.dob ? new Date(formData.dob).toISOString().split('T')[0] : ""} 
                            type="date"
                            icon={Calendar} 
                            onChange={handleChange}
                        />
                        <InputField 
                            name="gender"
                            label="Giới tính" 
                            value={formData.gender || ""} 
                            isSelect 
                            onChange={handleChange}
                        />

                        <InputField 
                            name="position"
                            label="Chức danh" 
                            value={formData.position || ""}
                            placeholder="Nhập chức danh" 
                            onChange={handleChange}
                        />
                        <InputField 
                            label="Vai trò *" 
                            value={profile?.account?.role || "User"} 
                            isSelect 
                            readOnly
                        />
                    </div>

                    <div className="flex items-center gap-4 mb-8">
                        <div className="flex-1">
                            <input 
                                name="email"
                                type="email" 
                                value={formData.email || ""} 
                                onChange={handleChange}
                                className="w-full border border-gray-200 rounded-md px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-blue-500 bg-transparent" 
                            />
                        </div>
                        <button className="text-blue-600 text-sm font-semibold hover:underline px-2 cursor-pointer">Thay đổi</button>
                    </div>

                    {/* Section 2: Thông tin liên hệ */}
                    <div className="border-t border-gray-100 pt-6">
                        <h2 className="text-[15px] font-bold text-gray-800 mb-6">Thông tin liên hệ</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-6 mb-6">
                            <InputField 
                                name="province"
                                label="Tỉnh/ thành phố" 
                                value={formData.province || ""} 
                                isSelect 
                                onChange={handleChange}
                            />
                            <InputField 
                                name="ward"
                                label="Phường xã" 
                                value={formData.ward || ""} 
                                isSelect 
                                onChange={handleChange}
                            />
                        </div>

                        <InputField 
                            name="address"
                            label="Địa chỉ" 
                            value={formData.address || ""}
                            placeholder="Nhập địa chỉ chi tiết" 
                            onChange={handleChange}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AccountPage;
