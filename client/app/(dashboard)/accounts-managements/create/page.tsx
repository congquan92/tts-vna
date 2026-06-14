"use client";

import { useRouter } from "next/navigation";
import UserForm from "@/components/modals/UserModal";
import { UserApi } from "@/api/user";
import { toast } from "sonner";
import type { CreateUserPayload } from "@/types/user";
import { getErrorMessage } from "@/utils/error-handle";

export default function CreateUserPage() {
    const router = useRouter();

    const handleSave = async (payload: CreateUserPayload) => {
        try {
            const res = await UserApi.create(payload);
            toast.success(res.message || "Thêm mới người dùng thành công");
            
            // Note: In a real app, we might store the new user ID in a temporary state/query 
            // to show the password popup on the list page. For now, we just redirect.
            router.push("/accounts-managements?newUserId=" + res.data.id);
        } catch (error: any) {
            console.error("Lỗi khi lưu người dùng:", error);
            toast.error(getErrorMessage(error, "Không thể lưu người dùng"));
            throw error;
        }
    };

    return <UserForm editingItem={null} onClose={() => router.push("/accounts-managements")} onSave={handleSave} />;
}
