"use client";

import { useEffect, useState } from "react";
import { User, IUser, IUserListResponse } from "@/src/api/User";

const AccountPage = () => {
    const [users, setUsers] = useState<IUser[]>([]);
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
        status: undefined as boolean | undefined,
    });

    const userApi = new User();

    // Fetch danh sách người dùng
    const fetchUsers = async (page = 1, filterParams = filters) => {
        setLoading(true);
        try {
            const result = await userApi.getAll({
                page,
                pageSize: pagination.pageSize,
                fullName: filterParams.fullName || undefined,
                username: filterParams.username || undefined,
                email: filterParams.email || undefined,
                roleId: filterParams.roleId,
                position: filterParams.position || undefined,
                status: filterParams.status,
            });

            if (result.success && result.data) {
                setUsers(result.data.items);
                setPagination((prev) => ({
                    ...prev,
                    page,
                    total: result.data!.count,
                }));
            }
        } catch (error) {
            console.error("Lỗi khi lấy danh sách người dùng:", error);
        } finally {
            setLoading(false);
        }
    };

    // Load danh sách khi component mount
    useEffect(() => {
        fetchUsers(1);
    }, []);

    // Xử lý thay đổi filter
    const handleFilterChange = (field: string, value: any) => {
        const newFilters = { ...filters, [field]: value };
        setFilters(newFilters);
        fetchUsers(1, newFilters);
    };

    // Xử lý thay đổi trạng thái
    const handleStatusChange = (value: string) => {
        const statusValue = value === "" ? undefined : value === "true";
        handleFilterChange("status", statusValue);
    };

    // Tính tổng số trang
    const totalPages = Math.ceil(pagination.total / pagination.pageSize);

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

                    {/* Filter */}
                    <div className="flex gap-3 pb-6">
                        <div className="flex-1"></div>
                        <div className="flex-4">
                            <input
                                type="text"
                                placeholder="Tìm theo họ tên..."
                                value={filters.fullName}
                                onChange={(e) => handleFilterChange("fullName", e.target.value)}
                                className="w-full remove-outline px-3 py-1.25 ring-1 ring-gray-300 rounded bg-white"
                            />
                        </div>
                        <div className="flex-1">
                            <input
                                type="text"
                                placeholder="Tài khoản..."
                                value={filters.username}
                                onChange={(e) => handleFilterChange("username", e.target.value)}
                                className="w-full remove-outline px-3 py-1.25 ring-1 ring-gray-300 rounded bg-white"
                            />
                        </div>
                        <div className="flex-2">
                            <input type="text" placeholder="Email..." value={filters.email} onChange={(e) => handleFilterChange("email", e.target.value)} className="w-full remove-outline px-3 py-1.25 ring-1 ring-gray-300 rounded bg-white" />
                        </div>
                        <div className="flex-1">
                            <select
                                value={filters.roleId || ""}
                                onChange={(e) => handleFilterChange("roleId", e.target.value ? Number(e.target.value) : undefined)}
                                className="w-full remove-outline px-3 py-1.5 h-full ring-1 ring-gray-300 rounded bg-white"
                            >
                                <option value="">Vai trò</option>
                            </select>
                        </div>
                        <div className="flex-1">
                            <input
                                type="text"
                                placeholder="Chức danh..."
                                value={filters.position}
                                onChange={(e) => handleFilterChange("position", e.target.value)}
                                className="w-full remove-outline px-3 py-1.25 ring-1 ring-gray-300 rounded bg-white"
                            />
                        </div>
                        <div className="flex-1">
                            <select
                                value={filters.status === undefined ? "" : filters.status ? "true" : "false"}
                                onChange={(e) => handleStatusChange(e.target.value)}
                                className="w-full remove-outline px-3 py-1.5 h-full ring-1 ring-gray-300 rounded bg-white"
                            >
                                <option value="">Trạng thái</option>
                                <option value="true">Bật</option>
                                <option value="false">Tắt</option>
                            </select>
                        </div>
                    </div>

                    {/* Danh sách */}
                    <div className="space-y-2">
                        {loading && <div className="text-center py-4">Đang tải...</div>}

                        {!loading && users.length === 0 && <div className="text-center py-4 text-gray-500">Không có dữ liệu người dùng</div>}

                        {!loading &&
                            users.map((user) => (
                                <div key={user.id} className="flex gap-3 py-2 hover:bg-gray-100 px-2 rounded">
                                    <div className="flex-1 flex items-center">
                                        <input type="checkbox" className="w-4 h-4" />
                                    </div>
                                    <div className="flex-4 line-clamp-1">{user.fullName}</div>
                                    <div className="flex-1 line-clamp-1">{user.username}</div>
                                    <div className="flex-2 line-clamp-1">{user.email}</div>
                                    <div className="flex-1 line-clamp-1">{user.role?.name || "-"}</div>
                                    <div className="flex-1 line-clamp-1">{user.position || "-"}</div>
                                    <div className="flex-1">
                                        <span className={`px-2 py-1 rounded text-xs ${user.status ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>{user.status ? "Bật" : "Tắt"}</span>
                                    </div>
                                </div>
                            ))}
                    </div>

                    {/* Phân trang */}
                    {totalPages > 1 && (
                        <div className="flex justify-between items-center mt-4 pt-4 border-t">
                            <span className="text-sm text-gray-600">
                                Trang {pagination.page} / {totalPages} (Tổng: {pagination.total} người dùng)
                            </span>
                            <div className="flex gap-2">
                                <button disabled={pagination.page === 1} onClick={() => fetchUsers(pagination.page - 1)} className="px-3 py-1 ring-1 ring-gray-300 rounded disabled:opacity-50">
                                    Trước
                                </button>
                                <button disabled={pagination.page === totalPages} onClick={() => fetchUsers(pagination.page + 1)} className="px-3 py-1 ring-1 ring-gray-300 rounded disabled:opacity-50">
                                    Sau
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
};

export default AccountPage;
