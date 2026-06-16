"use client";

import { useState, useMemo, useEffect } from "react";
import TopHero from "@/components/TopHero";
import ToggleSwitch from "@/components/ToggleSwitch";
import BusinessTypePopup from "@/components/popup/business-type-popup";
import { TypeOfBusinessApi } from "@/api/typeOfBusiness";
import { TypeOfBusiness, BusinessStatus } from "@/types/typeOfBusiness";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import axios from "axios";
import { Upload, Plus, Pencil, ChevronLeft, ChevronRight, ChevronDown, Trash2, X } from "lucide-react";

const GRID_COLS = "grid-cols-[40px_40px_120px_1fr_140px]";

export default function BusinessTypesPage() {
    const [data, setData] = useState<TypeOfBusiness[]>([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<TypeOfBusiness | null>(null);
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
            let result: TypeOfBusiness[] = [];
            
            if (filterCode) {
                result = await TypeOfBusinessApi.findByCode(filterCode);
            } else if (filterName) {
                result = await TypeOfBusinessApi.findByName(filterName);
            } else if (filterStatus) {
                result = await TypeOfBusinessApi.findByStatus(filterStatus);
            } else {
                result = await TypeOfBusinessApi.findAll();
            }
            
            setData(result);
        } catch (error) {
            console.error("Error fetching business types:", error);
            toast.error("Không thể tải danh sách loại hình kinh doanh");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchData();
        }, 300); // Debounce search
        return () => clearTimeout(timer);
    }, [filterCode, filterName, filterStatus]);

    const openNew = () => {
        setEditingItem(null);
        setIsModalOpen(true);
    };

    const openEdit = (item: TypeOfBusiness) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const handleSave = async (payload: { code: string; name: string; status: BusinessStatus }) => {
        try {
            if (editingItem) {
                await TypeOfBusinessApi.update(editingItem.id, payload);
                toast.success("Cập nhật thành công");
            } else {
                await TypeOfBusinessApi.create(payload);
                toast.success("Thêm mới thành công");
            }
            fetchData();
            closeModal();
        } catch (error: any) {
            if (axios.isAxiosError(error) && error.response?.status === 409) {
                toast.error("Mã đã được sử dụng. Vui lòng nhập mã khác");
            } else {
                toast.error("Có lỗi xảy ra khi lưu");
            }
            throw error;
        }
    };

    const handleToggleStatus = async (id: number) => {
        try {
            const res = await TypeOfBusinessApi.toggleStatus(id);
            if (res) {
                toast.success("Cập nhật trạng thái thành công");
                setData((prev) => prev.map((item) => (item.id === id ? { ...item, status: res.data.status } : item)));
            }
        } catch (error) {
            toast.error("Không thể cập nhật trạng thái");
        }
    };

    const handleSelectOne = (id: number) => {
        setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    };

    const handleDeleteSelected = async () => {
        if (selectedIds.length === 0) return;
        const confirmDelete = window.confirm(`Bạn có chắc chắn muốn xóa ${selectedIds.length} loại hình kinh doanh đã chọn?`);
        if (!confirmDelete) return;

        try {
            await Promise.all(selectedIds.map((id) => TypeOfBusinessApi.delete(id)));
            toast.success("Xóa các loại hình kinh doanh thành công");
            setSelectedIds([]);
            fetchData();
        } catch (error) {
            console.error("Lỗi khi xóa loại hình kinh doanh:", error);
            toast.error("Không thể xóa một số loại hình kinh doanh. Vui lòng thử lại.");
        }
    };

    const totalPages = Math.max(1, Math.ceil(data.length / pageSize));
    const paginatedRows = data.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    return (
        <main className="h-screen flex flex-col py-2">
            <div className="shrink-0">
                <TopHero
                    lable="Danh sách loại hình kinh doanh"
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
                    <div className={`grid ${GRID_COLS} gap-3 text-xs text-gray-500 font-medium py-3 px-4 bg-[#F4F6F8] font-semibold text-gray-700`}>
                        <div />
                        <div />
                        <div>Mã loại hình</div>
                        <div>Tên loại hình</div>
                        <div className="text-center">Trạng thái</div>
                    </div>

                    {/* Filter Row */}
                    <div className={`grid ${GRID_COLS} pb-3 px-4 bg-[#F4F6F8] gap-3`}>
                        <div />
                        <div />
                        <div>
                            <input
                                type="text"
                                value={filterCode}
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
                                onChange={(e) => {
                                    setFilterName(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full bg-white border border-gray-200 rounded px-2.5 py-1.5 text-xs outline-none focus:border-primary transition-colors"
                            />
                        </div>
                        <div className="relative">
                            <select
                                value={filterStatus}
                                onChange={(e) => {
                                    setFilterStatus(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full appearance-none bg-white border border-gray-200 rounded px-2.5 py-1.5 pr-8 text-xs outline-none focus:border-primary transition-colors cursor-pointer"
                            >
                                <option value="">Tất cả</option>
                                <option value="active">Sử dụng</option>
                                <option value="inactive">Ngừng sử dụng</option>
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
                            {paginatedRows.map((item) => (
                                <div key={item.id} className={`grid ${GRID_COLS} gap-3 border-b border-gray-100 hover:bg-blue-50/40 transition-colors text-xs text-gray-700 items-center px-4 py-2.5`}>
                                    <div className="flex items-center justify-center">
                                        <input type="checkbox" className="w-3.5 h-3.5 accent-primary cursor-pointer rounded border-gray-300" checked={selectedIds.includes(item.id)} onChange={() => handleSelectOne(item.id)} />
                                    </div>

                                    <div className="flex items-center justify-center">
                                        <button type="button" onClick={() => openEdit(item)} className="text-gray-400 hover:text-primary transition-colors cursor-pointer" title="Chỉnh sửa">
                                            <Pencil className="size-3.5" />
                                        </button>
                                    </div>

                                    <div className="truncate font-medium">{item.code}</div>
                                    <div className="truncate">{item.name}</div>

                                    <div className="flex items-center justify-center">
                                        <ToggleSwitch checked={item.status === BusinessStatus.ACTIVE} onChange={() => handleToggleStatus(item.id)} />
                                    </div>
                                </div>
                            ))}
                            {paginatedRows.length === 0 && <div className="flex items-center justify-center py-12 text-sm text-gray-400">Không có dữ liệu</div>}
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
                        {data.length === 0 ? "0" : `${(currentPage - 1) * pageSize + 1} - ${Math.min(currentPage * pageSize, data.length)}`} of {data.length}
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
                    <div className="bg-blue-600 text-white font-bold px-4 h-full flex items-center justify-center min-w-[40px]">
                        {selectedIds.length}
                    </div>
                    <div className="px-4 text-xs font-semibold text-gray-700 select-none">
                        dữ liệu được chọn
                    </div>
                    <div className="pr-3 flex items-center gap-3">
                        <button
                            type="button"
                            onClick={handleDeleteSelected}
                            className="bg-red-600 hover:bg-red-700 text-white rounded px-3 py-1.5 flex items-center gap-1.5 font-semibold text-xs cursor-pointer transition-colors"
                        >
                            <Trash2 className="size-3.5" />
                            <span>Xoá</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setSelectedIds([])}
                            className="text-gray-400 hover:text-gray-600 transition-colors p-1 cursor-pointer"
                        >
                            <X className="size-4" />
                        </button>
                    </div>
                </div>
            )}

            <BusinessTypePopup 
                isOpen={isModalOpen} 
                editingItem={editingItem} 
                onClose={closeModal} 
                onSave={handleSave} 
            />
        </main>
    );
}
