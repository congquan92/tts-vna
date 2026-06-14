"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import TopHero from "@/components/TopHero";
import { Switch } from "@mui/material";
import EnterpriseModal from "@/components/modals/Enterprise/EnterpriseModal";
import { BusinessApi } from "@/api/business";
import { TypeOfBusinessApi } from "@/api/typeOfBusiness";
import { BusinessIndustryApi } from "@/api/businessIndustry";
import type { Business } from "@/types/business";
import type { TypeOfBusiness } from "@/types/typeOfBusiness";
import type { BusinessIndustry } from "@/types/businessIndustry";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import { FolderUp, Plus, Eye, Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";

import { InputField } from "@/components/form/InputField";

const GRID_COLS = "grid-cols-[40px_100px_1fr_120px_160px_180px_140px_100px]";

export default function BusinessManagementsPage() {
    const [data, setData] = useState<Business[]>([]);
    const [loading, setLoading] = useState(false);
    const [viewMode, setViewMode] = useState<"list" | "create" | "edit" | "view">("list");
    const [selectedEnterprise, setSelectedEnterprise] = useState<Business | null>(null);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    // Dropdown data
    const [businessTypes, setBusinessTypes] = useState<TypeOfBusiness[]>([]);
    const [industries, setIndustries] = useState<BusinessIndustry[]>([]);

    const businessTypeOptions = useMemo(() => businessTypes.map((t) => ({ label: t.name, value: t.id.toString() })), [businessTypes]);
    const industryOptions = useMemo(() => industries.filter((i) => i.level === 4 || i.level === 1).map((t) => ({ label: t.name, value: t.id.toString() })), [industries]);

    // Filter states
    const [filterName, setFilterName] = useState("");
    const [filterTaxCode, setFilterTaxCode] = useState("");
    const [filterBusinessType, setFilterBusinessType] = useState("");
    const [filterIndustry, setFilterIndustry] = useState("");
    const [filterWard, setFilterWard] = useState("");
    const [filterStatus, setFilterStatus] = useState("");

    // Pagination
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [total, setTotal] = useState(0);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await BusinessApi.search({
                page: currentPage,
                limit: pageSize,
                businessName: filterName || undefined,
                taxCode: filterTaxCode || undefined,
                typeOfBusinessId: filterBusinessType ? Number(filterBusinessType) : undefined,
                businessIndustryId: filterIndustry ? Number(filterIndustry) : undefined,
                registeredWard: filterWard || undefined,
                status: filterStatus === "" ? undefined : filterStatus === "active",
            });
            setData(res.data);
            setTotal(res.total);
        } catch {
            toast.error("Không thể tải danh sách doanh nghiệp");
        } finally {
            setLoading(false);
        }
    }, [currentPage, pageSize, filterName, filterTaxCode, filterBusinessType, filterIndustry, filterWard, filterStatus]);

    const fetchDropdowns = useCallback(async () => {
        try {
            const [types, inds] = await Promise.all([TypeOfBusinessApi.findAll(), BusinessIndustryApi.findAll()]);
            setBusinessTypes(types);
            setIndustries(inds);
        } catch {
            console.error("Error fetching dropdowns");
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        fetchDropdowns();
    }, [fetchDropdowns]);

    const openNew = () => {
        setSelectedEnterprise(null);
        setViewMode("create");
    };

    const handleEdit = (item: Business) => {
        setSelectedEnterprise(item);
        setViewMode("edit");
    };

    const handleView = (item: Business) => {
        setSelectedEnterprise(item);
        setViewMode("view");
    };

    const handleToggleStatus = async (id: number) => {
        try {
            const res = await BusinessApi.toggleStatus(id);
            if (res) {
                toast.success("Cập nhật trạng thái thành công");
                setData((prev) => prev.map((item) => (item.id === id ? { ...item, status: res.data.isActive } : item)));
            }
        } catch {
            toast.error("Không thể cập nhật trạng thái");
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Bạn có chắc chắn muốn xóa doanh nghiệp này?")) return;
        try {
            await BusinessApi.delete(id);
            toast.success("Xóa doanh nghiệp thành công");
            fetchData();
        } catch {
            toast.error("Không thể xóa doanh nghiệp");
        }
    };

    const closeCreate = () => {
        setViewMode("list");
        setSelectedEnterprise(null);
        fetchData();
    };

    const handleSave = async () => {
        // Logic for saving via BusinessApi will be handled inside EnterpriseModal or passed here
        // For simplicity, we refresh list after modal closes
        fetchData();
    };

    const handleSelectAll = (checked: boolean) => {
        setSelectedIds(checked ? data.map((r) => r.id) : []);
    };

    const handleSelectOne = (id: number) => {
        setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    };

    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const allSelected = data.length > 0 && data.every((r) => selectedIds.includes(r.id));

    if (viewMode !== "list") {
        return <EnterpriseModal isOpen={true} onClose={closeCreate} onSave={handleSave} mode={viewMode} initialData={selectedEnterprise} />;
    }

    return (
        <div className="space-y-5">
            <TopHero
                lable="Danh sách doanh nghiệp"
                component={
                    <div className="flex gap-3">
                        <Button variant="outline" size="md" className="pl-2 font-bold ">
                            <FolderUp className="size-5 mr-2" />
                            Import
                        </Button>
                        <Button variant="primary" size="md" onClick={openNew} className="pl-2 font-bold">
                            <Plus className="size-5 mr-2" /> Thêm mới
                        </Button>
                    </div>
                }
            />

            <div className="bg-white rounded-lg border border-gray-100 shadow-sm flex flex-col flex-1 min-h-0 overflow-hidden mt-2">
                <div className="shrink-0 border-b border-gray-200">
                    <div className={`grid ${GRID_COLS} text-xs text-gray-500 font-medium bg-gray-50/50`}>
                        <div className="flex items-center justify-center py-2">
                            <input type="checkbox" className="w-3.5 h-3.5 accent-primary cursor-pointer" checked={allSelected} onChange={(e) => handleSelectAll(e.target.checked)} />
                        </div>
                        <div className="px-2 py-2">Thao tác</div>
                        <div className="px-3 py-2">Tên doanh nghiệp</div>
                        <div className="px-3 py-2">Mã số thuế</div>
                        <div className="px-3 py-2">Loại hình kinh doanh</div>
                        <div className="px-3 py-2">Ngành nghề kinh doanh</div>
                        <div className="px-3 py-2">Phường/xã</div>
                        <div className="px-3 py-2 text-center">Trạng thái</div>
                    </div>

                    <div className={`grid ${GRID_COLS} pb-2`}>
                        <div />
                        <div />
                        <div className="px-3">
                            <InputField
                                value={filterName}
                                onChange={(e) => {
                                    setFilterName(e.target.value);
                                    setCurrentPage(1);
                                }}
                                placeholder="Tìm tên..."
                            />
                        </div>
                        <div className="px-3">
                            <InputField
                                value={filterTaxCode}
                                onChange={(e) => {
                                    setFilterTaxCode(e.target.value);
                                    setCurrentPage(1);
                                }}
                                placeholder="Tìm MST..."
                            />
                        </div>
                        <div className="px-3">
                            <InputField
                                isSelect
                                value={filterBusinessType}
                                options={businessTypeOptions}
                                onChange={(e) => {
                                    setFilterBusinessType(e.target.value);
                                    setCurrentPage(1);
                                }}
                                placeholder="Tất cả"
                            />
                        </div>
                        <div className="px-3">
                            <InputField
                                isSelect
                                isSearchable
                                value={filterIndustry}
                                options={industryOptions}
                                onChange={(e) => {
                                    setFilterIndustry(e.target.value);
                                    setCurrentPage(1);
                                }}
                                placeholder="Tất cả"
                            />
                        </div>
                        <div className="px-3">
                            <InputField
                                value={filterWard}
                                onChange={(e) => {
                                    setFilterWard(e.target.value);
                                    setCurrentPage(1);
                                }}
                                placeholder="Tìm phường/xã..."
                            />
                        </div>
                        <div className="px-3">
                            <InputField
                                isSelect
                                value={filterStatus}
                                options={[
                                    { label: "Sử dụng", value: "active" },
                                    { label: "Ngừng sử dụng", value: "inactive" },
                                ]}
                                onChange={(e) => {
                                    setFilterStatus(e.target.value);
                                    setCurrentPage(1);
                                }}
                                placeholder="Tất cả"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto min-h-0">
                    {loading ? (
                        <div className="text-center py-10 text-gray-500 text-sm">Đang tải...</div>
                    ) : (
                        <>
                            {data.map((item) => (
                                <div key={item.id} className={`grid ${GRID_COLS} border-b border-gray-100 hover:bg-blue-50/40 transition-colors text-sm text-gray-700`}>
                                    <div className="flex items-center justify-center py-2.5">
                                        <input type="checkbox" className={`w-3.5 h-3.5 accent-primary cursor-pointer`} checked={selectedIds.includes(item.id)} onChange={() => handleSelectOne(item.id)} />
                                    </div>

                                    <div className="flex items-center gap-2 px-2 py-2.5">
                                        <button type="button" onClick={() => handleView(item)} className="text-gray-400 hover:text-primary transition-colors" title="Xem chi tiết">
                                            <Eye size={16} />
                                        </button>
                                        <button type="button" onClick={() => handleEdit(item)} className="text-gray-400 hover:text-primary transition-colors" title="Chỉnh sửa">
                                            <Pencil size={16} />
                                        </button>
                                        <button type="button" onClick={() => handleDelete(item.id)} className="text-gray-400 hover:text-red-500 transition-colors" title="Xóa">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>

                                    <div className="flex items-center px-3 py-2.5 truncate">{item.businessName}</div>
                                    <div className="flex items-center px-3 py-2.5">{item.taxCode}</div>
                                    <div className="flex items-center px-3 py-2.5 truncate">{item.businessType}</div>
                                    <div className="flex items-center px-3 py-2.5 truncate">{item.industry}</div>
                                    <div className="flex items-center px-3 py-2.5 truncate">{item.registeredWard}</div>

                                    <div className="flex items-center justify-center py-2.5">
                                        <Switch checked={item.status} onChange={() => handleToggleStatus(item.id)} slotProps={{ input: { "aria-label": "controlled" } }} size="small" color="primary" />
                                    </div>
                                </div>
                            ))}
                            {data.length === 0 && <div className="flex items-center justify-center py-12 text-sm text-gray-400">Không có dữ liệu</div>}
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
                        {total === 0 ? "0" : `${(currentPage - 1) * pageSize + 1} - ${Math.min(currentPage * pageSize, total)}`} of {total}
                    </span>
                    <div className="flex items-center gap-1">
                        <button
                            type="button"
                            disabled={currentPage <= 1}
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            className="w-7 h-7 flex items-center justify-center rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <button
                            type="button"
                            disabled={currentPage >= totalPages}
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            className="w-7 h-7 flex items-center justify-center rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
