"use client";

import { useState, useEffect } from "react";
import TopHero from "@/components/TopHero";
import BusinessIndustryPopup from "@/components/popup/business-industry-popup";
import { BusinessIndustryApi } from "@/api/businessIndustry";
import type { BusinessIndustry } from "@/types/businessIndustry";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import axios from "axios";
import { Upload, Plus, Pencil, ChevronLeft, ChevronRight, Trash2, X } from "lucide-react";

export default function BusinessIndustriesPage() {
    const [data, setData] = useState<BusinessIndustry[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<BusinessIndustry | null>(null);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    // Filter states
    const [filterCode, setFilterCode] = useState("");
    const [filterName, setFilterName] = useState("");
    const [filterLevel, setFilterLevel] = useState("");

    // Pagination
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

    const fetchData = async () => {
        setLoading(true);
        try {
            const levelNum = filterLevel ? parseInt(filterLevel) : undefined;
            const res = await BusinessIndustryApi.search({
                page: currentPage,
                limit: pageSize,
                code: filterCode || undefined,
                name: filterName || undefined,
                level: isNaN(Number(levelNum)) ? undefined : levelNum,
            });

            setData(res.data || []);
            // Handle backend meta wrapping
            const meta = (res as any).meta;
            if (meta) {
                setTotal(meta.total ?? 0);
            } else {
                setTotal(res.total ?? 0);
            }
        } catch (error) {
            console.error("Error fetching business industries:", error);
            toast.error("Không thể tải danh sách ngành nghề kinh doanh");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchData();
        }, 300); // Debounce search
        return () => clearTimeout(timer);
    }, [filterCode, filterName, filterLevel, currentPage, pageSize]);

    const openNew = () => {
        setEditingItem(null);
        setIsModalOpen(true);
    };

    const openEdit = (item: BusinessIndustry) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const handleSave = async (payload: any) => {
        try {
            if (editingItem) {
                await BusinessIndustryApi.update(editingItem.id, payload);
                toast.success("Cập nhật thành công");
            } else {
                await BusinessIndustryApi.create(payload);
                toast.success("Thêm mới thành công");
            }
            fetchData();
            closeModal();
        } catch (error: any) {
            if (axios.isAxiosError(error) && error.response?.status === 409) {
                const serverMessage = error.response?.data?.message;
                toast.error(serverMessage || "Mã đã được sử dụng. Vui lòng nhập mã khác");
            } else {
                toast.error("Có lỗi xảy ra khi lưu");
            }
            throw error;
        }
    };

    const handleSelectOne = (id: number) => {
        setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    };

    const handleSelectAll = () => {
        const pageIds = data.map((item) => item.id);
        const allSelected = pageIds.every((id) => selectedIds.includes(id));
        if (allSelected) {
            setSelectedIds((prev) => prev.filter((id) => !pageIds.includes(id)));
        } else {
            setSelectedIds((prev) => [...new Set([...prev, ...pageIds])]);
        }
    };

    const handleDeleteSelected = async () => {
        if (selectedIds.length === 0) return;
        const confirmDelete = window.confirm(`Bạn có chắc chắn muốn xóa ${selectedIds.length} ngành nghề kinh doanh đã chọn?`);
        if (!confirmDelete) return;

        let successCount = 0;
        let failCount = 0;

        for (const id of selectedIds) {
            try {
                await BusinessIndustryApi.delete(id);
                successCount++;
            } catch (error) {
                failCount++;
            }
        }

        if (successCount > 0) {
            toast.success(`Đã xóa thành công ${successCount} ngành nghề kinh doanh`);
        }
        if (failCount > 0) {
            toast.error(`Không thể xóa ${failCount} ngành nghề (có thể do chứa ngành nghề con hoặc đang được sử dụng)`);
        }

        setSelectedIds([]);
        fetchData();
    };

    const formatNameWithDashes = (name: string, level?: number) => {
        if (!level || level <= 1) return name;
        const dashes = "-".repeat(level);
        return `${dashes} ${name}`;
    };

    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    return (
        <main className="h-screen flex flex-col py-2">
            <div className="shrink-0">
                <TopHero
                    lable="Danh sách ngành nghề kinh doanh"
                    component={
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="flex items-center gap-2 text-xs font-semibold">
                                <Upload className="size-4" />
                                <span>Thêm từ file</span>
                            </Button>
                            <Button variant="primary" size="sm" onClick={openNew} className="flex items-center gap-2 text-xs font-semibold">
                                <Plus className="size-4" />
                                <span>Thêm mới</span>
                            </Button>
                        </div>
                    }
                />
            </div>

            <div className="bg-white rounded-lg border border-gray-100 shadow-sm flex flex-col flex-1 min-h-0 overflow-hidden mt-2">
                {/* Grid Header */}
                <div className="shrink-0 border-b border-gray-200">
                    <div className="grid gap-3 text-xs font-semibold text-gray-700 py-3 px-4 bg-[#F4F6F8]" style={{ gridTemplateColumns: "40px 40px 120px 1fr 140px" }}>
                        <div />
                        <div />
                        <div>Mã ngành</div>
                        <div>Tên ngành nghề</div>
                        <div>Cấp</div>
                    </div>

                    {/* Filter Row */}
                    <div className="grid pb-3 px-4 bg-[#F4F6F8] gap-3" style={{ gridTemplateColumns: "40px 40px 120px 1fr 140px" }}>
                        <div className="flex items-center justify-center">
                            <input type="checkbox" className="w-3.5 h-3.5 accent-primary cursor-pointer rounded border-gray-300" checked={data.length > 0 && data.every((item) => selectedIds.includes(item.id))} onChange={handleSelectAll} />
                        </div>
                        <div />
                        <div>
                            <input
                                type="text"
                                value={filterCode}
                                placeholder=""
                                onChange={(e) => {
                                    setFilterCode(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full bg-white border border-gray-200 rounded px-2.5 py-1.5 text-xs outline-none focus:border-primary transition-colors"
                            />
                        </div>
                        <div>
                            <input
                                type="text"
                                value={filterName}
                                placeholder=""
                                onChange={(e) => {
                                    setFilterName(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full bg-white border border-gray-200 rounded px-2.5 py-1.5 text-xs outline-none focus:border-primary transition-colors"
                            />
                        </div>
                        <div>
                            <input
                                type="text"
                                value={filterLevel}
                                placeholder=""
                                onChange={(e) => {
                                    setFilterLevel(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full bg-white border border-gray-200 rounded px-2.5 py-1.5 text-xs outline-none focus:border-primary transition-colors"
                            />
                        </div>
                    </div>
                </div>

                {/* Table Body */}
                <div className="flex-1 overflow-y-auto min-h-0">
                    {loading ? (
                        <div className="text-center py-10 text-gray-500">Đang tải...</div>
                    ) : (
                        <>
                            {data.map((item) => (
                                <div key={item.id} className="grid gap-3 border-b border-gray-100 hover:bg-blue-50/40 transition-colors text-xs text-gray-700 items-center px-4 py-2.5" style={{ gridTemplateColumns: "40px 40px 120px 1fr 140px" }}>
                                    <div className="flex items-center justify-center">
                                        <input type="checkbox" className="w-3.5 h-3.5 accent-primary cursor-pointer rounded border-gray-300" checked={selectedIds.includes(item.id)} onChange={() => handleSelectOne(item.id)} />
                                    </div>

                                    <div className="flex items-center justify-center">
                                        <button type="button" onClick={() => openEdit(item)} className="text-gray-400 hover:text-primary transition-colors cursor-pointer" title="Chỉnh sửa">
                                            <Pencil className="size-3.5" />
                                        </button>
                                    </div>

                                    <div className="truncate font-medium">{item.code}</div>
                                    <div className="truncate font-medium">{formatNameWithDashes(item.name, item.level)}</div>
                                    <div className="truncate text-gray-500">Cấp {item.level}</div>
                                </div>
                            ))}
                            {data.length === 0 && <div className="flex items-center justify-center py-12 text-sm text-gray-400">Không có dữ liệu</div>}
                        </>
                    )}
                </div>

                {/* Pagination Footer */}
                <div className="shrink-0 flex items-center justify-end gap-4 px-5 py-3 border-t border-gray-200 text-xs text-gray-500 bg-white">
                    <div className="flex items-center gap-1.5">
                        <select
                            value={pageSize}
                            onChange={(e) => {
                                setPageSize(Number(e.target.value));
                                setCurrentPage(1);
                            }}
                            className="border border-gray-300 rounded px-2 py-1 text-xs outline-none cursor-pointer bg-white hover:border-gray-400 transition-colors"
                        >
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                        </select>
                    </div>

                    <span className="text-gray-500 tabular-nums">
                        {total === 0 ? "0" : `${(currentPage - 1) * pageSize + 1} - ${Math.min(currentPage * pageSize, total)}`} of {total}
                    </span>

                    <div className="flex items-center gap-1">
                        <button
                            type="button"
                            disabled={currentPage <= 1}
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            className="w-7 h-7 flex items-center justify-center rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft className="size-4" />
                        </button>
                        <button
                            type="button"
                            disabled={currentPage >= totalPages}
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            className="w-7 h-7 flex items-center justify-center rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronRight className="size-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Selection Banner */}
            {selectedIds.length > 0 && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white rounded-lg shadow-xl border border-gray-100 flex items-center h-12 overflow-hidden z-50 transition-all duration-300">
                    <div className="bg-blue-600 text-white font-bold px-4 h-full flex items-center justify-center min-w-[40px]">{selectedIds.length}</div>
                    <div className="px-4 text-xs font-semibold text-gray-700 select-none">dữ liệu được chọn</div>
                    <div className="pr-3 flex items-center gap-3">
                        <button type="button" onClick={handleDeleteSelected} className="bg-red-600 hover:bg-red-700 text-white rounded px-3 py-1.5 flex items-center gap-1.5 font-semibold text-xs cursor-pointer transition-colors">
                            <Trash2 className="size-3.5" />
                            <span>Xoá</span>
                        </button>
                        <button type="button" onClick={() => setSelectedIds([])} className="text-gray-400 hover:text-gray-600 transition-colors p-1 cursor-pointer">
                            <X className="size-4" />
                        </button>
                    </div>
                </div>
            )}

            <BusinessIndustryPopup isOpen={isModalOpen} editingItem={editingItem} onClose={closeModal} onSave={handleSave} />
        </main>
    );
}
