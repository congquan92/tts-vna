"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import TopHero from "@/components/TopHero";
import ToggleSwitch from "@/components/ToggleSwitch";
import { BusinessApi } from "@/api/business";
import { TypeOfBusinessApi } from "@/api/typeOfBusiness";
import { BusinessIndustryApi } from "@/api/businessIndustry";
import type { Business } from "@/types/business";
import type { TypeOfBusiness } from "@/types/typeOfBusiness";
import type { BusinessIndustry } from "@/types/businessIndustry";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import { Plus, Eye, Pencil, Key, ChevronLeft, ChevronRight, ChevronDown, Upload } from "lucide-react";

import CreatePasswordModal from "@/components/popup/create-password";
import AccountInfoPopup from "@/components/popup/account-info-popup";
import DeleteSelectionBanner from "@/components/DeleteSelectionBanner";
import type { User } from "@/types/auth";

const GRID_STYLE = { gridTemplateColumns: "40px 100px 1.5fr 140px 150px 200px 200px 110px" };

interface ApiBusiness extends Business {
    typeOfBusiness?: { name: string } | string;
    businessIndustry?: { name: string } | string;
    accounts?: any[];
}

interface ProvinceData {
    name: string;
    wards?: { name: string }[];
}

export default function BusinessManagementsPage() {
    const router = useRouter();
    const [data, setData] = useState<Business[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    // Password reset modal state
    const [selectedEnterprise, setSelectedEnterprise] = useState<Business | null>(null);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

    // Account details modal state
    const [selectedAccountDetails, setSelectedAccountDetails] = useState<{ accountNumber: string; password?: string } | null>(null);
    const [isAccountInfoOpen, setIsAccountInfoOpen] = useState(false);

    // Dropdown data
    const [businessTypes, setBusinessTypes] = useState<TypeOfBusiness[]>([]);
    const [industries, setIndustries] = useState<BusinessIndustry[]>([]);
    const [wardOptions, setWardOptions] = useState<{ label: string; value: string }[]>([]);

    const businessTypeOptions = useMemo(() => businessTypes.map((t) => ({ label: t.name, value: t.id.toString() })), [businessTypes]);
    const industryOptions = useMemo(() =>
        industries.map((t) => ({
            label: t.name,
            value: t.id.toString(),
        })),
        [industries]);
        
    // Filter states
    const [filters, setFilters] = useState({
        businessName: "",
        taxCode: "",
        typeOfBusinessId: "",
        businessIndustryId: "",
        registeredWard: "",
        status: "",
    });

    const handleFilterChange = (field: string, value: string) => {
        setFilters((prev) => ({ ...prev, [field]: value }));
        setCurrentPage(1);
    };

    // Pagination
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [total, setTotal] = useState(0);

    // Searchable ward dropdown state
    const [isWardOpen, setIsWardOpen] = useState(false);
    const [wardSearch, setWardSearch] = useState("");
    const wardDropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wardDropdownRef.current && !wardDropdownRef.current.contains(event.target as Node)) {
                setIsWardOpen(false);
                setWardSearch("");
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await BusinessApi.search({
                page: currentPage,
                limit: pageSize,
                businessName: filters.businessName || undefined,
                taxCode: filters.taxCode || undefined,
                typeOfBusinessId: filters.typeOfBusinessId ? Number(filters.typeOfBusinessId) : undefined,
                businessIndustryId: filters.businessIndustryId ? Number(filters.businessIndustryId) : undefined,
                registeredWard: filters.registeredWard || undefined,
                status: filters.status === "" ? undefined : filters.status === "active",
            });

            // Map API response keys to format correctly
            const mappedData = ((res.data as unknown as ApiBusiness[]) || []).map((item) => ({
                ...item,
                businessType: typeof item.typeOfBusiness === "object" ? item.typeOfBusiness.name : item.typeOfBusiness || item.businessType || "",
                industry: typeof item.businessIndustry === "object" ? item.businessIndustry.name : item.businessIndustry || item.industry || "",
            }));

            setData(mappedData);

            // Handle metadata wrapping from NestJS backend search
            const meta = res.meta;
            if (meta) {
                setTotal(meta.total ?? 0);
            } else {
                setTotal(res.total ?? 0);
            }
        } catch {
            toast.error("Không thể tải danh sách doanh nghiệp");
        } finally {
            setLoading(false);
        }
    }, [currentPage, pageSize, filters]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchData();
        }, 300); // Debounce search
        return () => clearTimeout(timer);
    }, [fetchData]);

    useEffect(() => {
        const fetchDropdowns = async () => {
            try {
                const [types, inds, geoRes] = await Promise.all([TypeOfBusinessApi.findAll(), BusinessIndustryApi.findLevel4(), fetch("/address.json")]);
                setBusinessTypes(types);
                setIndustries(inds);

                const geoData = (await geoRes.json()) as ProvinceData[];
                // Get all unique wards
                const allWards: string[] = [];
                geoData.forEach((province) => {
                    province.wards?.forEach((ward) => {
                        if (ward.name) allWards.push(ward.name);
                    });
                });
                const uniqueWards = Array.from(new Set(allWards)).sort();
                setWardOptions(uniqueWards.map((name) => ({ label: name, value: name })));
            } catch {
                console.error("Error fetching dropdowns");
            }
        };
        fetchDropdowns();
    }, []);

    const openNew = () => {
        router.push("/business-managements/create");
    };

    const handleEdit = (item: Business) => {
        router.push(`/business-managements/edit/${item.id}`);
    };

    const handleView = async (item: Business) => {
        try {
            setLoading(true);
            const detail = (await BusinessApi.getById(item.id)) as ApiBusiness;
            const account = detail.accounts?.[0];
            setSelectedAccountDetails({
                accountNumber: account?.username || detail.taxCode,
                password: account?.displayPassword,
            });
            setIsAccountInfoOpen(true);
        } catch {
            toast.error("Không thể tải thông tin tài khoản");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenPasswordReset = (item: Business) => {
        setSelectedEnterprise(item);
        setIsPasswordModalOpen(true);
    };

    const handleSavePassword = async (password: string) => {
        if (!selectedEnterprise) return;
        try {
            await BusinessApi.setPassword(selectedEnterprise.id, password);
            toast.success("Đặt lại mật khẩu doanh nghiệp thành công");
            setIsPasswordModalOpen(false);
        } catch {
            toast.error("Không thể đặt lại mật khẩu");
        }
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

    const handleDeleteSelected = async () => {
        if (selectedIds.length === 0) return;
        const confirmDelete = window.confirm(`Bạn có chắc chắn muốn xóa ${selectedIds.length} doanh nghiệp đã chọn?`);
        if (!confirmDelete) return;

        let successCount = 0;
        let failCount = 0;
        for (const id of selectedIds) {
            try {
                await BusinessApi.delete(id);
                successCount++;
            } catch {
                failCount++;
            }
        }

        if (successCount > 0) {
            toast.success(`Đã xóa thành công ${successCount} doanh nghiệp`);
        }
        if (failCount > 0) {
            toast.error(`Không thể xóa ${failCount} doanh nghiệp`);
        }

        setSelectedIds([]);
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

    const filteredWardOptions = useMemo(() => {
        return wardOptions.filter((opt) => opt.label.toLowerCase().includes(wardSearch.toLowerCase()));
    }, [wardOptions, wardSearch]);

    return (
        <main className="h-screen flex flex-col py-2">
            <div className="shrink-0">
                <TopHero
                    lable="Danh sách doanh nghiệp"
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
                    <div className="grid gap-3 text-xs font-semibold text-gray-700 py-3 px-4 bg-[#F4F6F8]" style={GRID_STYLE}>
                        <div />
                        <div className="px-2">Thao tác</div>
                        <div className="px-3">Tên doanh nghiệp</div>
                        <div className="px-3">Mã số thuế</div>
                        <div className="px-3">Loại hình kinh doanh</div>
                        <div className="px-3">Ngành nghề kinh doanh</div>
                        <div className="px-3">Phường/xã</div>
                        <div className="flex justify-center">Trạng thái</div>
                    </div>

                    {/* Filter Row */}
                    <div className="grid pb-3 px-4 bg-[#F4F6F8] gap-3 items-center" style={GRID_STYLE}>
                        <div className="flex items-center justify-center">
                            <input type="checkbox" className="w-3.5 h-3.5 accent-primary cursor-pointer rounded border-gray-300" checked={allSelected} onChange={(e) => handleSelectAll(e.target.checked)} />
                        </div>
                        <div />
                        <div className="px-3">
                            <input
                                type="text"
                                value={filters.businessName}
                                onChange={(e) => handleFilterChange("businessName", e.target.value)}
                                className="w-full bg-white border border-gray-200 rounded px-2.5 py-1.5 text-xs outline-none focus:border-primary transition-colors"
                            />
                        </div>
                        <div className="px-3">
                            <input
                                type="text"
                                value={filters.taxCode}
                                onChange={(e) => handleFilterChange("taxCode", e.target.value)}
                                className="w-full bg-white border border-gray-200 rounded px-2.5 py-1.5 text-xs outline-none focus:border-primary transition-colors"
                            />
                        </div>
                        <div className="px-3 relative">
                            <select
                                value={filters.typeOfBusinessId}
                                onChange={(e) => handleFilterChange("typeOfBusinessId", e.target.value)}
                                className="w-full appearance-none bg-white border border-gray-200 rounded px-2.5 py-1.5 pr-8 text-xs outline-none focus:border-primary transition-colors cursor-pointer"
                            >
                                <option value="">Tất cả</option>
                                {businessTypeOptions.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none size-3.5" />
                        </div>
                        <div className="px-3 relative">
                            <select
                                value={filters.businessIndustryId}
                                onChange={(e) => handleFilterChange("businessIndustryId", e.target.value)}
                                className="w-full appearance-none bg-white border border-gray-200 rounded px-2.5 py-1.5 pr-8 text-xs outline-none focus:border-primary transition-colors cursor-pointer"
                            >
                                <option value="">Tất cả</option>
                                {industryOptions.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none size-3.5" />
                        </div>
                        <div className="px-3 relative" ref={wardDropdownRef}>
                            <div
                                className={`w-full bg-white border border-gray-200 rounded px-2.5 py-1.5 pr-8 text-xs outline-none transition-colors cursor-pointer flex items-center min-h-7.5 ${isWardOpen ? "border-primary ring-1 ring-primary/10" : ""
                                    }`}
                                onClick={() => {
                                    if (isWardOpen) setWardSearch("");
                                    setIsWardOpen(!isWardOpen);
                                }}
                            >
                                <span className={filters.registeredWard ? "text-gray-700" : "text-gray-400"}>{filters.registeredWard || "Phường/Xã"}</span>
                            </div>
                            <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none size-3.5" />

                            {isWardOpen && (
                                <div className="absolute top-full left-0 w-full mt-1 bg-white border border-gray-200 rounded shadow-lg z-60 flex flex-col overflow-hidden">
                                    <div className="p-2 border-b border-gray-50 bg-gray-50/50">
                                        <input
                                            type="text"
                                            autoFocus
                                            value={wardSearch}
                                            onChange={(e) => setWardSearch(e.target.value)}
                                            placeholder="Tìm phường/xã..."
                                            className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded outline-none focus:border-primary bg-white"
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                    </div>
                                    <div className="max-h-60 overflow-y-auto">
                                        <div
                                            className="px-2.5 py-1.5 text-xs hover:bg-blue-50 cursor-pointer text-gray-500 border-b border-gray-50 italic"
                                            onClick={() => {
                                                handleFilterChange("registeredWard", "");
                                                setIsWardOpen(false);
                                            }}
                                        >
                                            Tất cả
                                        </div>
                                        {filteredWardOptions.map((opt) => (
                                            <div
                                                key={opt.value}
                                                className={`px-2.5 py-1.5 text-xs hover:bg-blue-50 cursor-pointer transition-colors ${filters.registeredWard === opt.value ? "bg-blue-50 text-primary font-medium" : "text-gray-700"}`}
                                                onClick={() => {
                                                    handleFilterChange("registeredWard", opt.value);
                                                    setIsWardOpen(false);
                                                }}
                                            >
                                                {opt.label}
                                            </div>
                                        ))}
                                        {filteredWardOptions.length === 0 && <div className="px-2.5 py-3 text-xs text-gray-400 text-center italic">Không tìm thấy kết quả</div>}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="px-3 relative">
                            <select
                                value={filters.status}
                                onChange={(e) => handleFilterChange("status", e.target.value)}
                                className="w-full appearance-none bg-white border border-gray-200 rounded px-2.5 py-1.5 pr-8 text-xs outline-none focus:border-primary transition-colors cursor-pointer"
                            >
                                <option value="">Tất cả</option>
                                <option value="active">Sử dụng</option>
                                <option value="inactive">Ngừng sử dụng</option>
                            </select>
                            <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none size-3.5" />
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto min-h-0">
                    {loading ? (
                        <div className="text-center py-10 text-gray-500 text-sm">Đang tải...</div>
                    ) : (
                        <>
                            {data.map((item) => (
                                <div key={item.id} className="grid gap-3 border-b border-gray-100 hover:bg-blue-50/40 transition-colors text-sm text-gray-700 items-center px-4 py-2.5" style={GRID_STYLE}>
                                    <div className="flex items-center justify-center">
                                        <input type="checkbox" className="w-3.5 h-3.5 accent-primary cursor-pointer rounded border-gray-300" checked={selectedIds.includes(item.id)} onChange={() => handleSelectOne(item.id)} />
                                    </div>

                                    <div className="flex items-center gap-2 px-2">
                                        <button type="button" onClick={() => handleView(item)} className="text-gray-400 hover:text-primary transition-colors cursor-pointer" title="Xem chi tiết">
                                            <Eye size={16} />
                                        </button>
                                        <button type="button" onClick={() => handleEdit(item)} className="text-gray-400 hover:text-primary transition-colors cursor-pointer" title="Chỉnh sửa">
                                            <Pencil size={16} />
                                        </button>
                                        <button type="button" onClick={() => handleOpenPasswordReset(item)} className="text-gray-400 hover:text-primary transition-colors cursor-pointer" title="Đặt lại mật khẩu">
                                            <Key size={16} />
                                        </button>
                                    </div>

                                    <div className="flex items-center px-3 truncate">{item.businessName}</div>
                                    <div className="flex items-center px-3">{item.taxCode}</div>
                                    <div className="flex items-center px-3 truncate">{item.businessType}</div>
                                    <div className="flex items-center px-3 truncate">{item.industry}</div>
                                    <div className="flex items-center px-3 truncate">{item.registeredWard}</div>

                                    <div className="flex items-center justify-center">
                                        <ToggleSwitch checked={item.status} onChange={() => handleToggleStatus(item.id)} />
                                    </div>
                                </div>
                            ))}
                            {data.length === 0 && <div className="flex items-center justify-center py-12 text-sm text-gray-400">Không có dữ liệu</div>}
                        </>
                    )}
                </div>

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
                            className="w-7 h-7 flex items-center justify-center rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <button
                            type="button"
                            disabled={currentPage >= totalPages}
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            className="w-7 h-7 flex items-center justify-center rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>

            <DeleteSelectionBanner selectedCount={selectedIds.length} onDelete={handleDeleteSelected} onClear={() => setSelectedIds([])} />

            <CreatePasswordModal
                isOpen={isPasswordModalOpen}
                user={selectedEnterprise ? ({ id: selectedEnterprise.id, fullName: selectedEnterprise.businessName, email: selectedEnterprise.email, account: { username: selectedEnterprise.taxCode } } as unknown as User) : null}
                onClose={() => setIsPasswordModalOpen(false)}
                onSave={handleSavePassword}
            />

            <AccountInfoPopup isOpen={isAccountInfoOpen} onClose={() => setIsAccountInfoOpen(false)} accountNumber={selectedAccountDetails?.accountNumber || ""} password={selectedAccountDetails?.password} />
        </main>
    );
}
