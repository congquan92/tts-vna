"use client";

import { useState, useMemo, useEffect } from "react";
import TopHero from "@/components/TopHero";
import ToggleSwitch from "@/components/ToggleSwitch";
import BusinessTypeModal from "@/components/modals/BusinessType/BusinessTypeModal";
import { TypeOfBusinessApi } from "@/api/typeOfBusiness";
import { TypeOfBusiness, BusinessStatus } from "@/types/typeOfBusiness";
import { toast } from "sonner";
import Button from "@/components/ui/Button";

const GRID_COLS = "grid-cols-[40px_40px_120px_1fr_140px]";

export default function BusinessTypesPage() {
    const [data, setData] = useState<TypeOfBusiness[]>([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<TypeOfBusiness | null>(null);
    const [form, setForm] = useState({ code: "", name: "", status: "true" });
    const [errors, setErrors] = useState({ code: "", name: "" });
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    // Filter states
    const [filterCode, setFilterCode] = useState("");
    const [filterName, setFilterName] = useState("");
    const [filterStatus, setFilterStatus] = useState("");

    // Pagination
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

    const fetchData = async () => {
        setLoading(true);
        try {
            const result = await TypeOfBusinessApi.findAll();
            setData(result);
        } catch (error) {
            console.error("Error fetching business types:", error);
            toast.error("Không thể tải danh sách loại hình kinh doanh");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const openNew = () => {
        setEditingItem(null);
        setForm({ code: "", name: "", status: "true" });
        setErrors({ code: "", name: "" });
        setIsModalOpen(true);
    };

    const openEdit = (item: TypeOfBusiness) => {
        setEditingItem(item);
        setForm({ code: item.code, name: item.name, status: item.status ? "true" : "false" });
        setErrors({ code: "", name: "" });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const validate = () => {
        const nextErrors = { code: "", name: "" };
        if (!form.code.trim()) nextErrors.code = "Mã loại hình là bắt buộc";
        if (!form.name.trim()) nextErrors.name = "Tên loại hình là bắt buộc";
        setErrors(nextErrors);
        return !nextErrors.code && !nextErrors.name;
    };

    const handleSave = async () => {
        if (!validate()) return;

        try {
            const statusVal = form.status === "true" ? BusinessStatus.ACTIVE : BusinessStatus.INACTIVE;
            if (editingItem) {
                await TypeOfBusinessApi.update(editingItem.id, {
                    code: form.code,
                    name: form.name,
                    status: statusVal,
                });
                toast.success("Cập nhật thành công");
            } else {
                await TypeOfBusinessApi.create({
                    code: form.code,
                    name: form.name,
                    status: statusVal,
                });
                toast.success("Thêm mới thành công");
            }
            fetchData();
            closeModal();
        } catch (error) {
            toast.error("Có lỗi xảy ra khi lưu");
        }
    };

    const handleToggleStatus = async (id: number) => {
        try {
            const res = await TypeOfBusinessApi.toggleStatus(id);
            if (res) {
                toast.success("Cập nhật trạng thái thành công");
                setData((prev) => prev.map((item) => (item.id === id ? { ...item, status: res.data.status ? BusinessStatus.ACTIVE : BusinessStatus.INACTIVE } : item)));
            }
        } catch (error) {
            toast.error("Không thể cập nhật trạng thái");
        }
    };

    const handleSelectAll = (checked: boolean) => {
        setSelectedIds(checked ? paginatedRows.map((r) => r.id) : []);
    };

    const handleSelectOne = (id: number) => {
        setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    };

    const filteredRows = useMemo(() => {
        return data.filter((item) => {
            const matchCode = filterCode ? item.code.toLowerCase().includes(filterCode.toLowerCase()) : true;
            const matchName = filterName ? item.name.toLowerCase().includes(filterName.toLowerCase()) : true;
            const matchStatus = filterStatus === "" ? true : filterStatus === "active" ? item.status === BusinessStatus.ACTIVE : filterStatus === "inactive" ? item.status === BusinessStatus.INACTIVE : true;
            return matchCode && matchName && matchStatus;
        });
    }, [data, filterCode, filterName, filterStatus]);

    const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
    const paginatedRows = filteredRows.slice((currentPage - 1) * pageSize, currentPage * pageSize);
    const allSelected = paginatedRows.length > 0 && paginatedRows.every((r) => selectedIds.includes(r.id));

    return (
        <main className="h-screen flex flex-col py-2">
            <div className="shrink-0">
                <TopHero
                    lable="Danh sách loại hình kinh doanh"
                    component={
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="flex items-center gap-2">
                                <i className="fa-solid fa-upload text-xs" />
                                <span>Thêm từ file</span>
                            </Button>
                            <Button variant="primary" size="sm" onClick={openNew} className="flex items-center gap-2">
                                <i className="fa-solid fa-plus text-xs" />
                                <span>Thêm mới</span>
                            </Button>
                        </div>
                    }
                />
            </div>

            <div className="bg-white rounded-lg border border-gray-100 shadow-sm flex flex-col flex-1 min-h-0 overflow-hidden mt-2">
                <div className="shrink-0 border-b border-gray-200">
                    <div className={`grid ${GRID_COLS} text-xs text-gray-500 font-medium`}>
                        <div />
                        <div />
                        <div className="px-3 py-2">Mã loại hình</div>
                        <div className="px-3 py-2">Tên loại hình</div>
                        <div className="px-3 py-2 text-center">Trạng thái</div>
                    </div>

                    <div className={`grid ${GRID_COLS} pb-2`}>
                        <div />
                        <div />
                        <div className="px-3">
                            <input
                                type="text"
                                value={filterCode}
                                onChange={(e) => {
                                    setFilterCode(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm outline-none focus:border-primary transition-colors"
                            />
                        </div>
                        <div className="px-3">
                            <input
                                type="text"
                                value={filterName}
                                onChange={(e) => {
                                    setFilterName(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm outline-none focus:border-primary transition-colors"
                            />
                        </div>
                        <div className="px-3">
                            <select
                                value={filterStatus}
                                onChange={(e) => {
                                    setFilterStatus(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm outline-none focus:border-primary transition-colors bg-white"
                            >
                                <option value="">Tất cả</option>
                                <option value="active">Sử dụng</option>
                                <option value="inactive">Ngừng sử dụng</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto min-h-0">
                    {loading ? (
                        <div className="text-center py-10 text-gray-500">Đang tải...</div>
                    ) : (
                        <>
                            {paginatedRows.map((item) => (
                                <div key={item.id} className={`grid ${GRID_COLS} border-b border-gray-100 hover:bg-blue-50/40 transition-colors text-sm text-gray-700`}>
                                    <div className="flex items-center justify-center py-2.5">
                                        <input type="checkbox" className="w-3.5 h-3.5 accent-primary cursor-pointer" checked={selectedIds.includes(item.id)} onChange={() => handleSelectOne(item.id)} />
                                    </div>

                                    <div className="flex items-center justify-center py-2.5">
                                        <button type="button" onClick={() => openEdit(item)} className="text-gray-400 hover:text-primary transition-colors" title="Chỉnh sửa">
                                            <i className="fa-solid fa-pen text-xs" />
                                        </button>
                                    </div>

                                    <div className="flex items-center px-3 py-2.5">{item.code}</div>
                                    <div className="flex items-center px-3 py-2.5">{item.name}</div>

                                    <div className="flex items-center justify-center py-2.5">
                                        <ToggleSwitch checked={item.status === BusinessStatus.ACTIVE} onChange={() => handleToggleStatus(item.id)} />
                                    </div>
                                </div>
                            ))}
                            {paginatedRows.length === 0 && <div className="flex items-center justify-center py-12 text-sm text-gray-400">Không có dữ liệu</div>}
                        </>
                    )}
                </div>

                <div className="shrink-0 flex items-center justify-end gap-4 px-5 py-3 border-t border-gray-200 text-sm text-gray-500">
                    <div className="flex items-center gap-1.5">
                        <select
                            value={pageSize}
                            onChange={(e) => {
                                setPageSize(Number(e.target.value));
                                setCurrentPage(1);
                            }}
                            className="border border-gray-300 rounded px-2 py-1 text-sm outline-none cursor-pointer bg-white hover:border-gray-400 transition-colors"
                        >
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                        </select>
                    </div>

                    <span className="text-gray-500 tabular-nums">
                        {filteredRows.length === 0 ? "0" : `${(currentPage - 1) * pageSize + 1} - ${Math.min(currentPage * pageSize, filteredRows.length)}`} of {filteredRows.length}
                    </span>

                    <div className="flex items-center gap-1">
                        <button
                            type="button"
                            disabled={currentPage <= 1}
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            className="w-7 h-7 flex items-center justify-center rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            <i className="fa-solid fa-chevron-left text-xs" />
                        </button>
                        <button
                            type="button"
                            disabled={currentPage >= totalPages}
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            className="w-7 h-7 flex items-center justify-center rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            <i className="fa-solid fa-chevron-right text-xs" />
                        </button>
                    </div>
                </div>
            </div>

            <BusinessTypeModal 
                isOpen={isModalOpen} 
                editingItem={editingItem} 
                form={form} 
                errors={errors} 
                onClose={closeModal} 
                onSave={handleSave} 
                onChange={(field, value) => setForm((prev) => ({ ...prev, [field]: value }))} 
            />
        </main>
    );
}
