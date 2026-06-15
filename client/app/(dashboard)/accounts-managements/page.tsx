"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { UserApi } from "@/api/user";
import type { User } from "@/types/auth";
import TopHero from "@/components/TopHero";
import Button from "@/components/ui/Button";
import ToggleSwitch from "@/components/ToggleSwitch";
import CreatePasswordModal from "@/components/popup/create-password";
import { toast } from "sonner";
import { Upload, Plus, ChevronDown, Pencil, Key, Download, ChevronLeft, ChevronRight } from "lucide-react";
import DeleteSelectionBanner from "@/components/DeleteSelectionBanner";
import axios from "axios";
import { getRoleDisplayName, ROLE_OPTIONS } from "@/utils/display";

const AccountPage = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        page: 1,
        pageSize: 10,
        total: 0,
    });

    const [filters, setFilters] = useState({
        fullName: "",
        username: "",
        email: "",
        roleId: undefined as number | undefined,
        position: "",
        isActive: undefined as boolean | undefined,
    });

    // Selection state
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    // Modal states
    const [isSetPasswordModalOpen, setIsSetPasswordModalOpen] = useState(false);
    const [selectedUserForPassword, setSelectedUserForPassword] = useState<User | null>(null);

    // Fetch user list
    const fetchUsers = useCallback(
        async (page = 1, limit = pagination.pageSize, filterParams = filters) => {
            setLoading(true);
            try {
                const result = await UserApi.search({
                    page,
                    limit,
                    fullName: filterParams.fullName || undefined,
                    username: filterParams.username || undefined,
                    email: filterParams.email || undefined,
                    roleId: filterParams.roleId,
                    position: filterParams.position || undefined,
                    isActive: filterParams.isActive,
                });

                if (result.data) {
                    setUsers(result.data);
                    setPagination((prev) => ({
                        ...prev,
                        page,
                        pageSize: limit,
                        total: result.total || 0,
                    }));

                    // Check if we need to show password modal for a newly created user
                    const newUserId = searchParams.get("newUserId");
                    if (newUserId) {
                        let newUser = result.data.find((u: User) => u.id === Number(newUserId));

                        // If not found in the current page, fetch them separately
                        if (!newUser) {
                            try {
                                newUser = await UserApi.getById(Number(newUserId));
                            } catch (e) {
                                console.error("Could not fetch new user for password setup", e);
                            }
                        }

                        if (newUser) {
                            setSelectedUserForPassword(newUser);
                            setIsSetPasswordModalOpen(true);
                            // Clear query param to avoid re-opening
                            router.replace("/accounts-managements");
                        }
                    }
                }
            } catch (error) {
                console.error("Lỗi khi lấy danh sách người dùng:", error);
                toast.error("Không thể tải danh sách người dùng");
            } finally {
                setLoading(false);
            }
        },
        [pagination.pageSize, filters, searchParams, router],
    );

    // Load data on mount
    useEffect(() => {
        const loadInitialData = async () => {
            await fetchUsers(1);
        };
        loadInitialData();
    }, [fetchUsers]);

    // Filter handlers
    const handleFilterChange = (field: string, value: string | number | boolean | undefined) => {
        const newFilters = { ...filters, [field]: value };
        setFilters(newFilters);
        fetchUsers(1, pagination.pageSize, newFilters);
    };

    const handleStatusChange = (value: string) => {
        const statusValue = value === "" ? undefined : value === "true";
        handleFilterChange("isActive", statusValue);
    };

    const handleToggleStatus = async (id: number) => {
        try {
            const res = await UserApi.toggleStatus(id);
            if (res) {
                toast.success("Cập nhật trạng thái thành công");
                setUsers((prev) =>
                    prev.map((u) => {
                        if (u.id === id) {
                            const newIsActive = res.data.isActive;
                            return {
                                ...u,
                                isActive: newIsActive,
                            };
                        }
                        return u;
                    }),
                );
            }
        } catch {
            toast.error("Không thể cập nhật trạng thái");
        }
    };

    // Selection handlers
    const handleSelectOne = (id: number) => {
        setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    };

    // Navigation handlers
    const handleOpenCreate = () => {
        router.push("/accounts-managements/create");
    };

    const handleOpenEdit = (user: User) => {
        router.push(`/accounts-managements/edit/${user.id}`);
    };

    const handleOpenSetPassword = (user: User) => {
        setSelectedUserForPassword(user);
        setIsSetPasswordModalOpen(true);
    };

    const handleSavePassword = async (password: string) => {
        if (!selectedUserForPassword) return;
        try {
            await UserApi.setPassword(selectedUserForPassword.id, password);
            toast.success("Đặt lại mật khẩu thành công");
            setIsSetPasswordModalOpen(false);
        } catch (error: unknown) {
            console.error("Lỗi khi đặt lại mật khẩu:", error);
            let message = "Không thể đặt lại mật khẩu";
            if (axios.isAxiosError(error) && error.response?.data?.message) {
                message = error.response.data.message;
            }
            toast.error(message);
            throw error;
        }
    };

    const handleDeleteSelected = async () => {
        if (selectedIds.length === 0) return;
        const confirmDelete = window.confirm(`Bạn có chắc chắn muốn xóa ${selectedIds.length} người dùng đã chọn?`);
        if (!confirmDelete) return;

        try {
            await Promise.all(selectedIds.map((id) => UserApi.delete(id)));
            toast.success(selectedIds.length === 1 ? "Xóa người dùng thành công" : "Xóa các người dùng thành công");
            setSelectedIds([]);
            fetchUsers(pagination.page);
        } catch (error) {
            console.error("Lỗi khi xóa người dùng:", error);
            toast.error("Không thể xóa một số người dùng. Vui lòng thử lại.");
        }
    };

    // Import/Export handlers
    const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const loadingToast = toast.loading("Đang import dữ liệu...");
        try {
            const res = await UserApi.importUsers(file);
            const { success, failed, total } = res.data;

            if (success > 0) {
                toast.success(`Đã import thành công ${success}/${total} người dùng`);
                fetchUsers(1);
            }

            if (failed > 0) {
                const firstErrors = res.data.errors.slice(0, 3);
                const errorMsg = firstErrors.map((err: any) => `• Dòng ${err.row}: ${err.errors.join(", ")}`).join("\n");

                toast.error(`Có ${failed}/${total} người dùng import thất bại`, {
                    description: (
                        <div className="flex flex-col gap-1 mt-1 text-[11px] leading-relaxed">
                            <p className="font-medium text-red-600">Chi tiết lỗi:</p>
                            <div className="whitespace-pre-wrap opacity-90 italic">
                                {errorMsg}
                                {failed > 3 && `\n... và ${failed - 3} lỗi khác`}
                            </div>
                        </div>
                    ),
                    duration: 6000,
                });
            }

            if (total === 0) {
                toast.warning("File import không có dữ liệu người dùng.");
            }
        } catch (error: unknown) {
            console.error("Lỗi khi import dữ liệu:", error);
            let message = "Không thể import dữ liệu";
            if (axios.isAxiosError(error) && error.response?.data?.message) {
                message = error.response.data.message;
            }
            toast.error(message);
        } finally {
            toast.dismiss(loadingToast);
            e.target.value = "";
        }
    };

    const handleExport = async () => {
        try {
            const blob = await UserApi.exportUsers();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `Danh_sach_nguoi_dung_${new Date().toISOString().slice(0, 10)}.xlsx`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
            toast.success("Xuất dữ liệu thành công");
        } catch (error: unknown) {
            console.error("Lỗi khi export dữ liệu:", error);
            toast.error("Không thể xuất dữ liệu");
        }
    };

    const totalPages = Math.max(1, Math.ceil(pagination.total / pagination.pageSize));

    return (
        <main className="h-screen flex flex-col py-2">
            <div className="shrink-0">
                <TopHero
                    lable="Danh sách người dùng"
                    component={
                        <div className="flex gap-3">
                            <input type="file" id="importFileInput" className="hidden" accept=".xlsx, .xls" onChange={handleImportFile} />
                            <Button variant="outline" size="sm" className="flex gap-2 items-center text-sm font-semibold" onClick={() => document.getElementById("importFileInput")?.click()}>
                                <Upload className="size-4" />
                                <span>Import</span>
                            </Button>
                            <Button variant="primary" size="sm" className="flex gap-2 items-center text-sm font-semibold" onClick={handleOpenCreate}>
                                <Plus className="size-4" />
                                <span>Thêm mới</span>
                            </Button>
                        </div>
                    }
                />
            </div>

            <div className="bg-white rounded-lg border border-gray-100 shadow-sm flex flex-col flex-1 min-h-0 overflow-hidden mt-2">
                {/* Header Row */}
                <div className="shrink-0 border-b border-gray-200">
                    <div className="grid gap-3 px-4 py-3 bg-[#F4F6F8] font-semibold text-gray-700 text-xs" style={{ gridTemplateColumns: "40px 45px 45px 1.5fr 1fr 2fr 1.5fr 1.5fr 100px" }}>
                        <div></div>
                        <div></div>
                        <div></div>
                        <div>Họ và tên</div>
                        <div>Tài khoản</div>
                        <div>Email</div>
                        <div>Vai trò</div>
                        <div>Chức danh</div>
                        <div>Trạng thái</div>
                    </div>

                    {/* Filter Row */}
                    <div className="grid gap-3 px-4 pb-3 bg-[#F4F6F8]" style={{ gridTemplateColumns: "40px 45px 45px 1.5fr 1fr 2fr 1.5fr 1.5fr 100px" }}>
                        <div></div>
                        <div></div>
                        <div></div>
                        <div>
                            <input
                                type="text"
                                value={filters.fullName}
                                onChange={(e) => handleFilterChange("fullName", e.target.value)}
                                className="w-full bg-white border border-gray-200 rounded px-2.5 py-1.5 text-xs outline-none focus:border-primary transition-colors"
                            />
                        </div>
                        <div>
                            <input
                                type="text"
                                value={filters.username}
                                onChange={(e) => handleFilterChange("username", e.target.value)}
                                className="w-full bg-white border border-gray-200 rounded px-2.5 py-1.5 text-xs outline-none focus:border-primary transition-colors"
                            />
                        </div>
                        <div>
                            <input
                                type="text"
                                value={filters.email}
                                onChange={(e) => handleFilterChange("email", e.target.value)}
                                className="w-full bg-white border border-gray-200 rounded px-2.5 py-1.5 text-xs outline-none focus:border-primary transition-colors"
                            />
                        </div>
                        <div className="relative">
                            <select
                                value={filters.roleId || ""}
                                onChange={(e) => handleFilterChange("roleId", e.target.value ? Number(e.target.value) : undefined)}
                                className="w-full appearance-none bg-white border border-gray-200 rounded px-2.5 py-1.5 pr-8 text-xs outline-none focus:border-primary transition-colors cursor-pointer"
                            >
                                <option value="">Tất cả</option>
                                {ROLE_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none size-3.5" />
                        </div>
                        <div>
                            <input
                                type="text"
                                value={filters.position}
                                onChange={(e) => handleFilterChange("position", e.target.value)}
                                className="w-full bg-white border border-gray-200 rounded px-2.5 py-1.5 text-xs outline-none focus:border-primary transition-colors"
                            />
                        </div>
                        <div className="relative">
                            <select
                                value={filters.isActive === undefined ? "" : filters.isActive ? "true" : "false"}
                                onChange={(e) => handleStatusChange(e.target.value)}
                                className="w-full appearance-none bg-white border border-gray-200 rounded px-2.5 py-1.5 pr-8 text-xs outline-none focus:border-primary transition-colors cursor-pointer"
                            >
                                <option value="">Tất cả</option>
                                <option value="true">Hoạt động</option>
                                <option value="false">Ngừng hoạt động</option>
                            </select>
                            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none size-3.5" />
                        </div>
                    </div>
                </div>

                {/* Table Body */}
                <div className="flex-1 overflow-y-auto min-h-0">
                    {loading ? (
                        <div className="text-center py-10 text-gray-500">Đang tải...</div>
                    ) : (
                        <>
                            {users.map((user) => (
                                <div
                                    key={user.id}
                                    className="grid gap-3 px-4 py-2.5 hover:bg-blue-50/20 border-b border-gray-100 items-center text-xs text-gray-700 transition-colors"
                                    style={{ gridTemplateColumns: "40px 45px 45px 1.5fr 1fr 2fr 1.5fr 1.5fr 100px" }}
                                >
                                    <div className="flex items-center justify-center">
                                        <input type="checkbox" checked={selectedIds.includes(user.id)} onChange={() => handleSelectOne(user.id)} className="w-3.5 h-3.5 accent-primary cursor-pointer rounded border-gray-300" />
                                    </div>
                                    <div className="flex items-center justify-center">
                                        <button type="button" onClick={() => handleOpenEdit(user)} className="text-gray-400 hover:text-primary transition-colors" title="Chỉnh sửa">
                                            <Pencil className="size-3.5" />
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-center">
                                        <button type="button" onClick={() => handleOpenSetPassword(user)} className="text-gray-400 hover:text-primary transition-colors" title="Đặt lại mật khẩu">
                                            <Key className="size-3.5" />
                                        </button>
                                    </div>
                                    <div className="truncate font-medium">{user.fullName}</div>
                                    <div className="truncate">{(user as any).username || "-"}</div>
                                    <div className="truncate text-gray-500">{user.email}</div>
                                    <div className="truncate">{getRoleDisplayName((user as any).role)}</div>
                                    <div className="truncate">{user.position || "-"}</div>
                                    <div className="flex items-center">
                                        <ToggleSwitch checked={user.isActive ?? false} onChange={() => handleToggleStatus(user.id)} />
                                    </div>
                                </div>
                            ))}
                            {users.length === 0 && <div className="flex items-center justify-center py-12 text-sm text-gray-400">Không tìm thấy người dùng nào</div>}
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="shrink-0 flex items-center justify-between px-5 py-3 border-t border-gray-200 text-xs text-gray-500 bg-white">
                    {/* Left: Export */}
                    <button type="button" onClick={handleExport} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 font-semibold transition-colors cursor-pointer">
                        <Download className="size-3.5" />
                        <span>Export Data</span>
                    </button>

                    {/* Right: Pagination */}
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5">
                            <select
                                value={pagination.pageSize}
                                onChange={(e) => {
                                    const newLimit = Number(e.target.value);
                                    fetchUsers(1, newLimit);
                                }}
                                className="border border-gray-300 rounded px-2 py-1 text-xs outline-none cursor-pointer bg-white hover:border-gray-400 transition-colors"
                            >
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={50}>50</option>
                            </select>
                        </div>

                        <span className="text-gray-500 tabular-nums">
                            {pagination.total === 0 ? "0" : `${(pagination.page - 1) * pagination.pageSize + 1} - ${Math.min(pagination.page * pagination.pageSize, pagination.total)}`} of {pagination.total}
                        </span>

                        <div className="flex items-center gap-1">
                            <button
                                type="button"
                                disabled={pagination.page <= 1}
                                onClick={() => fetchUsers(pagination.page - 1)}
                                className="w-7 h-7 flex items-center justify-center rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft className="size-4" />
                            </button>
                            <button
                                type="button"
                                disabled={pagination.page >= totalPages}
                                onClick={() => fetchUsers(pagination.page + 1)}
                                className="w-7 h-7 flex items-center justify-center rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight className="size-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <CreatePasswordModal isOpen={isSetPasswordModalOpen} user={selectedUserForPassword} onClose={() => setIsSetPasswordModalOpen(false)} onSave={handleSavePassword} />

            {/* Selection Banner */}
            <DeleteSelectionBanner selectedCount={selectedIds.length} onDelete={handleDeleteSelected} onClear={() => setSelectedIds([])} />
        </main>
    );
};

export default AccountPage;
