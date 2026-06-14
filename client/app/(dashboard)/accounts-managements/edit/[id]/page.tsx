"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import UserForm from "@/components/modals/UserModal";
import { UserApi } from "@/api/user";
import { toast } from "sonner";
import type { User } from "@/types/auth";
import type { UpdateUserPayload } from "@/types/user";

export default function EditUserPage() {
    const router = useRouter();
    const params = useParams();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const id = Number(params.id);
                if (isNaN(id)) {
                    toast.error("ID người dùng không hợp lệ");
                    router.push("/accounts-managements");
                    return;
                }
                const data = await UserApi.getById(id);
                setUser(data);
            } catch (error) {
                console.error("Lỗi khi tải thông tin người dùng:", error);
                toast.error("Không thể tải thông tin người dùng");
                router.push("/accounts-managements");
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [params.id, router]);

    const handleSave = async (payload: UpdateUserPayload) => {
        if (!user) return;
        try {
            const res = await UserApi.update(user.id, payload);
            toast.success(res.message || "Cập nhật người dùng thành công");
            router.push("/accounts-managements");
        } catch (error: any) {
            console.error("Lỗi khi lưu người dùng:", error);
            const message = error.response?.data?.message || "Không thể lưu người dùng";
            toast.error(message);
            throw error;
        }
    };

    if (loading) {
        return <div className="p-10 text-center">Đang tải thông tin...</div>;
    }

    return <UserForm editingItem={user} onClose={() => router.push("/accounts-managements")} onSave={handleSave} />;
}
