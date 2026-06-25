"use client";

import { useState, useEffect } from "react";
import type { User } from "@/types/auth";
import type { CreateUserPayload } from "@/types/user";
import { InputField } from "@/components/form/InputField";
import Button from "@/components/ui/Button";
import TopHero from "@/components/TopHero";
import { Camera, Save, Calendar } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { ROLE_OPTIONS } from "@/utils/display";
import LoadingOverlay from "@/components/LoadingOverlay";

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

interface UserFormData {
    username: string;
    password?: string;
    fullName: string;
    email: string;
    roleId: string;
    position: string;
    isActive: boolean;
    gender: string;
    dob: string;
    province: string;
    ward: string;
    address: string;
    avatarUrl: string;
}

type UserFormProps = {
    editingItem: User | null;
    onClose: () => void;
    onSave: (payload: CreateUserPayload) => Promise<void>;
};

const roleNameToId: Record<string, string> = {
    ADMIN_SO: "1",
    MANAGER_SO: "2",
    CHUYENVIEN_SO: "3",
    CEO_DN: "4",
    MANAGER_DN: "5",
    USER_DN: "6",
};

const formatDateToYYYYMMDD = (dateVal: string | Date | null | undefined) => {
    if (!dateVal) return "";
    const date = new Date(dateVal);
    if (isNaN(date.getTime())) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

export default function UserForm({ editingItem, onClose, onSave }: UserFormProps) {
    const [formData, setFormData] = useState<UserFormData>({
        username: "",
        password: editingItem ? "************" : "12345678",
        fullName: "",
        email: "",
        roleId: "",
        position: "",
        isActive: true,
        gender: "",
        dob: "",
        province: "",
        ward: "",
        address: "",
        avatarUrl: "",
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);

    // Image preview states
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    // Dữ liệu hành chính
    const [provincesData, setProvincesData] = useState<Province[]>([]);
    const [availableWards, setAvailableWards] = useState<{ label: string; value: string }[]>([]);

    useEffect(() => {
        const fetchGeoData = async () => {
            try {
                const geoRes = await fetch("/address.json");
                const geoData: Province[] = await geoRes.json();
                setProvincesData(geoData);
                return geoData;
            } catch (error) {
                console.error("Error fetching geo data:", error);
                return [];
            }
        };

        fetchGeoData().then((geoData) => {
            if (editingItem) {
                // Determine account data from API (plural 'accounts' array)
                interface UserWithAccounts extends User {
                    accounts?: {
                        id: number;
                        username: string;
                        roleId?: number;
                        role?: {
                            id: number;
                            name: string;
                        };
                    }[];
                }
                const itemWithAccounts = editingItem as UserWithAccounts;
                const account = editingItem.account || itemWithAccounts.accounts?.[0];

                // Determine role ID
                let rId = account?.role?.id?.toString() || "";
                if (!rId && account && "roleId" in account) {
                    rId = (account as { roleId?: number }).roleId?.toString() || "";
                }
                if (!rId && account?.role?.name) {
                    rId = roleNameToId[account.role.name] || "";
                } else if (!rId && editingItem.role) {
                    rId = roleNameToId[editingItem.role] || "";
                }

                setFormData({
                    username: account?.username || editingItem.username || "",
                    password: "************",
                    fullName: editingItem.fullName || "",
                    email: editingItem.email || "",
                    roleId: rId,
                    position: editingItem.position || "",
                    isActive: editingItem.isActive ?? editingItem.status === "Active",
                    gender: editingItem.gender || "",
                    dob: formatDateToYYYYMMDD(editingItem.dob),
                    province: editingItem.province || "",
                    ward: editingItem.ward || "",
                    address: editingItem.address || "",
                    avatarUrl: editingItem.avatarUrl || "",
                });

                if (editingItem.province) {
                    const province = geoData.find((p: Province) => p.name === editingItem.province);
                    if (province && province.wards) {
                        setAvailableWards(province.wards.map((w: Ward) => ({ label: w.name, value: w.name })));
                    }
                }
            } else {
                // Reset to default for new user
                setFormData({
                    username: "",
                    password: "12345678",
                    fullName: "",
                    email: "",
                    roleId: "",
                    position: "",
                    isActive: true,
                    gender: "",
                    dob: "",
                    province: "",
                    ward: "",
                    address: "",
                    avatarUrl: "",
                });
            }
        });

        const timer = setTimeout(() => {
            setErrors({});
            setPreviewUrl(null);
        }, 0);
        return () => clearTimeout(timer);
    }, [editingItem]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }

        if (name === "province") {
            if (value) {
                const province = provincesData.find((p: Province) => p.name === value);
                const wards = province?.wards?.map((w: Ward) => ({ label: w.name, value: w.name })) || [];
                setAvailableWards(wards);
                setFormData((prev) => ({ ...prev, ward: "" }));
            } else {
                setAvailableWards([]);
                setFormData((prev) => ({ ...prev, ward: "" }));
            }
        }
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            toast.error("Kích thước file vượt quá 5 MB");
            return;
        }

        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);
    };

    const validate = () => {
        const nextErrors: Record<string, string> = {};
        if (!formData.username.trim()) nextErrors.username = "Tên đăng nhập là bắt buộc";
        if (!formData.fullName.trim()) nextErrors.fullName = "Họ và tên là bắt buộc";
        if (!formData.email.trim()) {
            nextErrors.email = "Email là bắt buộc";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            nextErrors.email = "Email không hợp lệ";
        }
        if (!formData.roleId) nextErrors.roleId = "Vai trò là bắt buộc";

        if (formData.dob) {
            const selectedDate = new Date(formData.dob);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (selectedDate > today) {
                nextErrors.dob = "Ngày sinh không được là ngày trong tương lai";
            }
        }

        if (!editingItem) {
            if (!formData.password || !formData.password.trim()) {
                nextErrors.password = "Mật khẩu là bắt buộc";
            } else if (formData.password.length < 6) {
                nextErrors.password = "Mật khẩu phải từ 6 ký tự trở lên";
            }
        } else {
            if (formData.password && formData.password !== "************" && formData.password.trim().length < 6) {
                nextErrors.password = "Mật khẩu phải từ 6 ký tự trở lên";
            }
        }

        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validate()) {
            toast.error("Vui lòng nhập đầy đủ thông tin bắt buộc");
            return;
        }

        setSubmitting(true);
        try {
            // Remove avatarUrl and handle password dynamically
            const cleanData = { ...formData };
            
            if (editingItem) {
                delete (cleanData as any).username;
            }

            delete (cleanData as { avatarUrl?: string }).avatarUrl;
            const password = cleanData.password;
            delete (cleanData as { password?: string }).password;

            const payload: Record<string, unknown> = {
                ...cleanData,
                roleId: Number(formData.roleId),
            };

            if (password && password !== "************") {
                payload.password = password;
            }

            // Loại bỏ các trường rỗng để tránh lỗi validation ở backend (ví dụ: dob: "")
            Object.keys(payload).forEach((key) => {
                if (payload[key] === "" || payload[key] === null || payload[key] === undefined) {
                    delete payload[key];
                }
            });

            await onSave(payload as unknown as CreateUserPayload);
        } catch (error) {
            console.error("Lỗi khi lưu người dùng:", error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-5 pb-10">
            <LoadingOverlay isLoading={submitting} />
            <TopHero
                lable={editingItem ? "Chi tiết người dùng" : "Thêm mới người dùng"}
                component={
                    <div className="flex gap-3">
                        <Button variant="outline" size="sm" className="border-none font-bold text-gray-500 hover:bg-gray-100" onClick={onClose}>
                            Hủy Bỏ
                        </Button>
                        <Button variant="primary" size="sm" className="pl-2 font-bold" onClick={handleSave}>
                            <Save className="size-5 mr-2" /> Lưu
                        </Button>
                    </div>
                }
            />

            <div className="flex flex-col md:flex-row gap-5 items-start">
                {/* Left Sidebar - Avatar & Kích hoạt */}
                <div className="w-full md:w-70 bg-white rounded-lg shadow-sm border border-gray-100 p-6 flex flex-col items-center shrink-0">
                    <input type="file" id="modalAvatarInput" className="hidden" accept=".jpeg,.jpg,.png" onChange={handleAvatarChange} />
                    <div
                        className="relative w-36 h-36 rounded-full border border-dashed border-gray-300 flex flex-col items-center justify-center bg-gray-50 mb-3 cursor-pointer hover:bg-gray-100 transition-colors overflow-hidden"
                        onClick={() => document.getElementById("modalAvatarInput")?.click()}
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
                                <span className="text-xs text-gray-500 font-bold">Tải ảnh đại diện</span>
                            </>
                        )}
                    </div>
                    <p className="text-[11px] text-gray-400 text-center mb-8 leading-relaxed">
                        *.jpeg, *.jpg, *.png.
                        <br />
                        Kích thước tối đa 5 MB
                    </p>

                    <div className="flex items-center justify-between w-full mt-auto pt-4 border-t border-gray-50">
                        <span className="text-sm font-bold text-gray-800">Kích hoạt</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" checked={formData.isActive} onChange={(e) => setFormData((prev) => ({ ...prev, isActive: e.target.checked }))} />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>
                </div>

                {/* Right Area - Form Inputs */}
                <div className="flex-1 space-y-6 w-full">
                    {/* Section 1: Thông tin cá nhân */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                        <h2 className="text-[15px] font-bold text-gray-800 mb-6">Thông tin cá nhân</h2>
                        {editingItem ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-6">
                                {/* Row 1: Tên đăng nhập(*) | Họ và tên(*) */}
                                <InputField name="username" label="Tên đăng nhập(*)" value={formData.username} placeholder="Nhập tên đăng nhập" onChange={handleChange} error={errors.username} readOnly={true} />
                                <InputField name="fullName" label="Họ và tên(*)" value={formData.fullName} placeholder="Nhập họ và tên" onChange={handleChange} error={errors.fullName} />

                                {/* Row 2: Ngày tháng năm sinh | Giới tính */}
                                <InputField name="dob" label="Ngày tháng năm sinh" value={formData.dob} type="date" icon={Calendar} onChange={handleChange} error={errors.dob} max={new Date().toISOString().split("T")[0]} />
                                <InputField
                                    name="gender"
                                    label="Giới tính"
                                    value={formData.gender}
                                    isSelect
                                    placeholder="Chọn giới tính"
                                    options={[
                                        { label: "Nam", value: "MALE" },
                                        { label: "Nữ", value: "FEMALE" },
                                    ]}
                                    onChange={handleChange}
                                />

                                {/* Row 3: Chức danh | Vai trò * */}
                                <InputField name="position" label="Chức danh" value={formData.position} placeholder="Nhập chức danh" onChange={handleChange} />
                                <InputField name="roleId" label="Vai trò *" value={formData.roleId} isSelect placeholder="Chọn vai trò" options={ROLE_OPTIONS} onChange={handleChange} error={errors.roleId} />

                                {/* Row 4: Email * | Empty Column */}
                                <InputField name="email" type="email" label="Email *" value={formData.email} placeholder="Nhập địa chỉ email" onChange={handleChange} error={errors.email} />
                                <div className="hidden md:block"></div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-6">
                                {/* Row 1: Tên đăng nhập(*) | Mật khẩu * */}
                                <InputField name="username" label="Tên đăng nhập(*)" value={formData.username} placeholder="Nhập tên đăng nhập" onChange={handleChange} error={errors.username} />
                                <InputField name="password" label="Mật khẩu *" type="password" value={formData.password} placeholder="Nhập mật khẩu" onChange={handleChange} error={errors.password} />

                                {/* Row 2: Họ và tên(*) | Ngày tháng năm sinh */}
                                <InputField name="fullName" label="Họ và tên(*)" value={formData.fullName} placeholder="Nhập họ và tên" onChange={handleChange} error={errors.fullName} />
                                <InputField name="dob" label="Ngày tháng năm sinh" value={formData.dob} type="date" icon={Calendar} onChange={handleChange} error={errors.dob} max={new Date().toISOString().split("T")[0]} />

                                {/* Row 3: Giới tính | Chức danh */}
                                <InputField
                                    name="gender"
                                    label="Giới tính"
                                    value={formData.gender}
                                    isSelect
                                    placeholder="Chọn giới tính"
                                    options={[
                                        { label: "Nam", value: "MALE" },
                                        { label: "Nữ", value: "FEMALE" },
                                    ]}
                                    onChange={handleChange}
                                />
                                <InputField name="position" label="Chức danh" value={formData.position} placeholder="Nhập chức danh" onChange={handleChange} />

                                {/* Row 4: Vai trò * | Email * */}
                                <InputField name="roleId" label="Vai trò *" value={formData.roleId} isSelect placeholder="Chọn vai trò" options={ROLE_OPTIONS} onChange={handleChange} error={errors.roleId} />
                                <InputField name="email" type="email" label="Email *" value={formData.email} placeholder="Nhập địa chỉ email" onChange={handleChange} error={errors.email} />
                            </div>
                        )}
                    </div>

                    {/* Section 2: Thông tin liên hệ */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                        <h2 className="text-[15px] font-bold text-gray-800 mb-6">Thông tin liên hệ</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-6">
                            <InputField
                                name="province"
                                label="Tỉnh/ thành phố"
                                value={formData.province}
                                isSelect
                                isSearchable
                                placeholder="Chọn tỉnh/ thành phố"
                                options={provincesData.map((p) => ({ label: p.name, value: p.name }))}
                                onChange={handleChange}
                            />
                            <InputField name="ward" label="Phường xã" value={formData.ward} isSelect isSearchable placeholder="Chọn phường/ xã" options={availableWards} disabled={!formData.province} onChange={handleChange} />
                            <div className="md:col-span-2">
                                <InputField name="address" label="Địa chỉ" value={formData.address} placeholder="Nhập địa chỉ chi tiết" onChange={handleChange} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
