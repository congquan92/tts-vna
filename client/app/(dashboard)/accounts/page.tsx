"use client";

import { InputField } from "@/components/form/InputField";
import TopHero from "@/components/TopHero";
import Button from "@/components/ui/Button";
import { Calendar, Camera, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { AuthApi } from "@/api/auth";
import { User, UpdateProfilePayload } from "@/types/auth";
import { useAuth } from "@/contexts/AuthContext";
import { getRoleDisplayName } from "@/utils/display";
import ChangeEmailPopup from "@/components/popup/change-email-popup";
import Image from "next/image";
import { toast } from "sonner";

interface Ward {
    ward_code: string;
    name: string;
    province_code: string;
}

interface Province {
    province_code: string;
    name: string;
    short_name: string;
    code: string;
    place_type: string;
    wards: Ward[];
}

type FormErrors = {
    fullName?: string;
    email?: string;
    dob?: string;
};

const AccountPage = () => {
    const { updateUser } = useAuth();
    const [profile, setProfile] = useState<User | null>(null);
    const [formData, setFormData] = useState<UpdateProfilePayload>({});
    const [errors, setErrors] = useState<FormErrors>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isChangeEmailOpen, setIsChangeEmailOpen] = useState(false);

    // Image preview states
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    // Dữ liệu hành chính
    const [provincesData, setProvincesData] = useState<Province[]>([]);
    const [availableWards, setAvailableWards] = useState<{ label: string; value: string }[]>([]);

    useEffect(() => {
        const initData = async () => {
            try {
                // Fetch provinces data
                const geoRes = await fetch("/address.json");
                const geoData: Province[] = await geoRes.json();
                setProvincesData(geoData);

                // Fetch profile
                const data = await AuthApi.getProfile();
                setProfile(data);

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

                // Nếu đã có tỉnh thành, load xã phường tương ứng
                if (data.province) {
                    const province = geoData.find((p: Province) => p.name === data.province);
                    if (province && province.wards) {
                        const wards = province.wards.map((w: Ward) => ({
                            label: w.name,
                            value: w.name,
                        }));
                        setAvailableWards(wards);
                    }
                }
            } catch (error) {
                console.error("Error fetching data:", error);
                toast.error("Không thể tải thông tin hệ thống");
            } finally {
                setLoading(false);
            }
        };

        initData();
    }, []);

    const validateForm = () => {
        const newErrors: FormErrors = {};

        if (!formData.fullName?.trim()) {
            newErrors.fullName = "Vui lòng nhập họ và tên";
        }

        if (formData.dob) {
            const birthDate = new Date(formData.dob);
            const today = new Date();

            if (birthDate > today) {
                newErrors.dob = "Ngày sinh không thể là tương lai";
            } else {
                let age = today.getFullYear() - birthDate.getFullYear();
                const monthDiff = today.getMonth() - birthDate.getMonth();
                if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                    age--;
                }

                if (age < 18) {
                    newErrors.dob = "Bạn phải từ 18 tuổi trở lên";
                }
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        // Clear error when typing
        if (errors[name as keyof FormErrors]) {
            setErrors((prev) => ({ ...prev, [name]: undefined }));
        }

        // Nếu thay đổi tỉnh thành, cần reset và cập nhật xã phường
        if (name === "province") {
            if (value) {
                const province = provincesData.find((p: Province) => p.name === value);
                const wards =
                    province && province.wards
                        ? province.wards.map((w: Ward) => ({
                              label: w.name,
                              value: w.name,
                          }))
                        : [];
                setAvailableWards(wards);
                setFormData((prev) => ({ ...prev, ward: "" })); // Reset ward khi đổi tỉnh
            } else {
                setAvailableWards([]);
                setFormData((prev) => ({ ...prev, ward: "" }));
            }
        }
    };

    const handleSave = async () => {
        if (!validateForm()) {
            toast.error("Vui lòng nhập đầy đủ thông tin bắt buộc");
            return;
        }

        setSaving(true);
        try {
            let currentAvatarUrl = formData.avatarUrl;

            // Nếu có file mới được chọn, upload lên Cloudinary trước
            if (selectedFile) {
                const res = await AuthApi.uploadAvatar(selectedFile);
                currentAvatarUrl = res.avatarUrl;
            }

            const payload = { ...formData, avatarUrl: currentAvatarUrl };
            const updatedProfile = await AuthApi.updateProfile(payload);

            setProfile(updatedProfile);
            updateUser(updatedProfile);
            setFormData((prev) => ({
                ...prev,
                avatarUrl: updatedProfile.avatarUrl,
                dob: updatedProfile.dob ? new Date(updatedProfile.dob).toISOString().split("T")[0] : "",
            }));
            setSelectedFile(null);
            setPreviewUrl(null);

            toast.success("Cập nhật thông tin thành công");
        } catch (error: unknown) {
            console.error("Error updating profile:", error);
            const axiosError = error as { response?: { data?: { message?: string } } };
            toast.error(axiosError.response?.data?.message || "Có lỗi xảy ra khi cập nhật thông tin");
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
            setSelectedFile(null);
            setPreviewUrl(null);
        }
    };

    const handleEmailChanged = () => {
        AuthApi.getProfile().then((data) => {
            setProfile(data);
            updateUser(data);
            setFormData((prev) => ({ ...prev, email: data.email }));
        });
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error("Kích thước file vượt quá 5 MB. Vui lòng chọn file khác.");
            return;
        }

        // Validate file type
        const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
        if (!allowedTypes.includes(file.type)) {
            toast.error("Chỉ chấp nhận định dạng .jpeg, .jpg, .png");
            return;
        }

        setSelectedFile(file);
        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);

        // Cleanup previous object URL if any
        return () => URL.revokeObjectURL(objectUrl);
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
                        <Button variant="outline" size="sm" className="border-none font-bold text-gray-500 hover:bg-gray-100" onClick={handleCancel} disabled={saving}>
                            Hủy Bỏ
                        </Button>
                        <Button variant="primary" size="sm" className="pl-2 font-bold " onClick={handleSave} loading={saving}>
                            <Save className="size-5 mr-2" /> Lưu
                        </Button>
                    </div>
                }
            />

            <div className="flex flex-col md:flex-row gap-5 items-start">
                {/* Left Sidebar - Avatar & Kích hoạt */}
                <div className="w-full md:w-[280px] bg-white rounded-lg shadow-sm border border-gray-100 p-6 flex flex-col items-center shrink-0">
                    <input type="file" id="avatarInput" className="hidden" accept=".jpeg,.jpg,.png" onChange={handleAvatarChange} />
                    <div
                        className="relative w-36 h-36 rounded-full border border-dashed border-gray-300 flex flex-col items-center justify-center bg-gray-50 mb-3 cursor-pointer hover:bg-gray-100 transition-colors overflow-hidden"
                        onClick={() => document.getElementById("avatarInput")?.click()}
                    >
                        {previewUrl || formData.avatarUrl ? (
                            <Image
                                src={previewUrl || (formData.avatarUrl?.startsWith("http") ? formData.avatarUrl : `${process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "")}/${formData.avatarUrl?.replace(/^\//, "")}`)}
                                alt="Avatar"
                                width={144}
                                height={144}
                                className="w-full h-full rounded-full object-cover"
                                unoptimized={!!previewUrl}
                            />
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
                        <label className="relative inline-flex items-center opacity-60">
                            <input type="checkbox" className="sr-only peer" checked={formData.isActive} disabled />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>
                </div>

                {/* Right Area - Form Inputs */}
                <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-100 p-6 w-full">
                    {/* Section 1: Thông tin cá nhân */}
                    <h2 className="text-[15px] font-bold text-gray-800 mb-6">Thông tin cá nhân</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-6 mb-6">
                        <InputField label="Tên đăng nhập(*)" value={profile?.account?.username || ""} placeholder="Tên đăng nhập" readOnly />
                        <InputField name="fullName" label="Họ và tên(*)" value={formData.fullName || ""} onChange={handleChange} error={errors.fullName} />

                        <InputField name="dob" label="Ngày tháng năm sinh" value={formData.dob ? new Date(formData.dob).toISOString().split("T")[0] : ""} type="date" icon={Calendar} onChange={handleChange} error={errors.dob} />
                        <InputField
                            name="gender"
                            label="Giới tính"
                            value={formData.gender ?? ""}
                            isSelect
                            placeholder="Chọn giới tính"
                            options={[
                                { label: "Nam", value: "MALE" },
                                { label: "Nữ", value: "FEMALE" },
                            ]}
                            onChange={handleChange}
                        />

                        <InputField name="position" label="Chức danh" value={formData.position || ""} placeholder="Nhập chức danh" onChange={handleChange} />
                        <InputField label="Vai trò *" value={getRoleDisplayName(profile?.account?.role?.name) || "User"} isSelect readOnly />
                    </div>

                    <div className="flex items-center gap-4 mb-8 w-full md:w-[calc(50%-10px)]">
                        <div className="w-full">
                            <input name="email" type="email" value={formData.email || ""} readOnly className="w-full border border-gray-200 rounded-md px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-blue-500 bg-white" />
                        </div>
                        <button type="button" onClick={() => setIsChangeEmailOpen(true)} className="text-blue-600 text-sm font-bold hover:underline cursor-pointer whitespace-nowrap shrink-0">
                            Thay đổi
                        </button>
                    </div>

                    {/* Section 2: Thông tin liên hệ */}
                    <div className="border-t border-gray-100 pt-6">
                        <h2 className="text-[15px] font-bold text-gray-800 mb-6">Thông tin liên hệ</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-6 mb-6">
                            <InputField
                                name="province"
                                label="Tỉnh/ thành phố"
                                value={formData.province ?? ""}
                                isSelect
                                isSearchable
                                placeholder="Chọn tỉnh/ thành phố"
                                options={provincesData.map((p) => ({ label: p.name, value: p.name }))}
                                onChange={handleChange}
                            />
                            <InputField name="ward" label="Phường xã" value={formData.ward ?? ""} isSelect isSearchable placeholder="Chọn phường/ xã" options={availableWards} disabled={!formData.province} onChange={handleChange} />
                        </div>

                        <InputField name="address" label="Địa chỉ" value={formData.address || ""} placeholder="Nhập địa chỉ chi tiết" onChange={handleChange} />
                    </div>
                </div>
            </div>

            <ChangeEmailPopup
                open={isChangeEmailOpen}
                currentEmail={profile?.email}
                onClose={() => {
                    setIsChangeEmailOpen(false);
                    handleEmailChanged();
                }}
            />
        </div>
    );
};

export default AccountPage;
