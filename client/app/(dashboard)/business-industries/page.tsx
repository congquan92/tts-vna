"use client";

import { useState, useEffect, useMemo } from "react";
import TopHero from "@/components/TopHero";
import BusinessIndustryPopup from "@/components/popup/business-industry-popup";
import { BusinessIndustryApi } from "@/api/businessIndustry";
import type { BusinessIndustry, CreateBusinessIndustryPayload } from "@/types/businessIndustry";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import axios from "axios";
import { Upload, Plus, Pencil, ChevronLeft, ChevronRight, ChevronDown, Trash2, X } from "lucide-react";

interface TreeNode extends BusinessIndustry {
    children: TreeNode[];
}

export default function BusinessIndustriesPage() {
    const [allIndustries, setAllIndustries] = useState<BusinessIndustry[]>([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<BusinessIndustry | null>(null);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [userExpandedIds, setUserExpandedIds] = useState<Record<number, boolean>>({});

    // Filter states
    const [filterCode, setFilterCode] = useState("");
    const [filterName, setFilterName] = useState("");
    const [filterLevel, setFilterLevel] = useState("");

    // Pagination (Pages the root-level categories to ensure parents & children stay together)
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await BusinessIndustryApi.findAll();
            setAllIndustries(res || []);
        } catch (error) {
            console.error("Error fetching business industries:", error);
            toast.error("Không thể tải danh sách ngành nghề kinh doanh");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Defer state update inside effect to avoid cascading renders warning
        Promise.resolve().then(fetchData);
    }, []);

    // Build hierarchical tree structure from flat list
    const treeData = useMemo(() => {
        const nodeMap: Record<number, TreeNode> = {};
        allIndustries.forEach((item) => {
            nodeMap[item.id] = { ...item, children: [] };
        });

        const rootNodes: TreeNode[] = [];
        allIndustries.forEach((item) => {
            const node = nodeMap[item.id];
            if (item.parentId && nodeMap[item.parentId]) {
                nodeMap[item.parentId].children.push(node);
            } else {
                rootNodes.push(node);
            }
        });

        // Sort nodes by code alphabetically
        const sortTree = (nodes: TreeNode[]) => {
            nodes.sort((a, b) => a.code.localeCompare(b.code));
            nodes.forEach((node) => {
                if (node.children && node.children.length > 0) {
                    sortTree(node.children);
                }
            });
        };
        sortTree(rootNodes);

        return rootNodes;
    }, [allIndustries]);

    // Filter tree client-side
    const filteredTree = useMemo(() => {
        if (!filterCode && !filterName && !filterLevel) {
            return treeData;
        }

        const filterNodes = (nodes: TreeNode[]): TreeNode[] => {
            return nodes
                .map((node) => {
                    const matchesCode = !filterCode || node.code.toLowerCase().includes(filterCode.toLowerCase());
                    const matchesName = !filterName || node.name.toLowerCase().includes(filterName.toLowerCase());
                    const matchesLevel = !filterLevel || String(node.level) === filterLevel;
                    const matches = matchesCode && matchesName && matchesLevel;

                    const filteredChildren = node.children ? filterNodes(node.children) : [];

                    if (matches || filteredChildren.length > 0) {
                        return {
                            ...node,
                            children: filteredChildren,
                        };
                    }
                    return null;
                })
                .filter((node): node is TreeNode => node !== null);
        };

        return filterNodes(treeData);
    }, [treeData, filterCode, filterName, filterLevel]);

    // Auto expand parents of matching nodes when filters are applied (derived state, avoids useEffect set-state warning)
    const isFilterActive = !!(filterCode || filterName || filterLevel);

    const autoExpandedIds = useMemo(() => {
        if (!isFilterActive) return {};

        const newExpanded: Record<number, boolean> = {};
        const collectExpanded = (nodes: TreeNode[]): boolean => {
            let anyMatch = false;
            nodes.forEach((node) => {
                const matchesCode = !filterCode || node.code.toLowerCase().includes(filterCode.toLowerCase());
                const matchesName = !filterName || node.name.toLowerCase().includes(filterName.toLowerCase());
                const matchesLevel = !filterLevel || String(node.level) === filterLevel;
                const matches = matchesCode && matchesName && matchesLevel;

                const childrenMatch = node.children ? collectExpanded(node.children) : false;

                if (childrenMatch) {
                    newExpanded[node.id] = true;
                }
                if (matches || childrenMatch) {
                    anyMatch = true;
                }
            });
            return anyMatch;
        };

        collectExpanded(treeData);
        return newExpanded;
    }, [treeData, filterCode, filterName, filterLevel, isFilterActive]);

    const expandedIds = useMemo(() => {
        return { ...userExpandedIds, ...autoExpandedIds };
    }, [userExpandedIds, autoExpandedIds]);

    const total = filteredTree.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    // Get paginated root nodes
    const paginatedRootNodes = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        const end = start + pageSize;
        return filteredTree.slice(start, end);
    }, [filteredTree, currentPage, pageSize]);

    // Flatten tree structure of paginated nodes for grid display
    const displayData = useMemo(() => {
        const flatten = (nodes: TreeNode[]): TreeNode[] => {
            const list: TreeNode[] = [];
            nodes.forEach((node) => {
                list.push(node);
                const isExpanded = expandedIds[node.id];
                if (isExpanded && node.children && node.children.length > 0) {
                    list.push(...flatten(node.children));
                }
            });
            return list;
        };
        return flatten(paginatedRootNodes);
    }, [paginatedRootNodes, expandedIds]);

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

    const handleSave = async (payload: CreateBusinessIndustryPayload) => {
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
        } catch (error: unknown) {
            if (axios.isAxiosError(error) && error.response?.status === 409) {
                const serverMessage = error.response?.data?.message;
                toast.error(serverMessage || "Mã đã được sử dụng. Vui lòng nhập mã khác");
            } else {
                toast.error("Có lỗi xảy ra khi lưu");
            }
            throw error;
        }
    };

    const getDescendantIds = (nodeId: number): number[] => {
        const ids: number[] = [];
        const findDescendants = (id: number) => {
            const children = allIndustries.filter((item) => item.parentId === id);
            children.forEach((child) => {
                ids.push(child.id);
                findDescendants(child.id);
            });
        };
        findDescendants(nodeId);
        return ids;
    };

    const handleSelectOne = (id: number) => {
        const isSelected = selectedIds.includes(id);
        const descendantIds = getDescendantIds(id);
        const targetIds = [id, ...descendantIds];

        if (isSelected) {
            setSelectedIds((prev) => prev.filter((x) => !targetIds.includes(x)));
        } else {
            setSelectedIds((prev) => [...new Set([...prev, ...targetIds])]);
        }
    };

    const handleSelectAll = () => {
        const pageIds = displayData.map((item) => item.id);
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
            } catch {
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

    const toggleExpand = (id: number) => {
        setUserExpandedIds((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

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
                            <input
                                type="checkbox"
                                className="w-3.5 h-3.5 accent-primary cursor-pointer rounded border-gray-300"
                                checked={displayData.length > 0 && displayData.every((item) => selectedIds.includes(item.id))}
                                onChange={handleSelectAll}
                            />
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
                            {displayData.map((item) => {
                                const hasChildren = item.children && item.children.length > 0;
                                const isExpanded = !!expandedIds[item.id];
                                const isLevel1 = item.level === 1;
                                return (
                                    <div
                                        key={item.id}
                                        className={`grid gap-3 border-b border-gray-100 transition-colors text-xs items-stretch px-4 ${
                                            isLevel1
                                                ? "bg-gray-50/60 hover:bg-gray-100/80 text-gray-900 font-semibold"
                                                : "bg-white hover:bg-blue-50/30 text-gray-700 font-normal"
                                        }`}
                                        style={{ gridTemplateColumns: "40px 40px 120px 1fr 140px" }}
                                    >
                                        <div className="flex items-center justify-center py-2.5">
                                            <input type="checkbox" className="w-3.5 h-3.5 accent-primary cursor-pointer rounded border-gray-300" checked={selectedIds.includes(item.id)} onChange={() => handleSelectOne(item.id)} />
                                        </div>

                                        <div className="flex items-center justify-center py-2.5">
                                            <button type="button" onClick={() => openEdit(item)} className="text-gray-400 hover:text-primary transition-colors cursor-pointer" title="Chỉnh sửa">
                                                <Pencil className="size-3.5" />
                                            </button>
                                        </div>

                                        <div className="truncate font-medium flex items-center py-2.5">{item.code}</div>
                                        <div className="relative flex items-center gap-1.5 py-2.5 min-w-0" style={{ paddingLeft: `${((item.level || 1) - 1) * 24}px` }}>
                                            {hasChildren ? (
                                                <button
                                                    type="button"
                                                    onClick={() => toggleExpand(item.id)}
                                                    className="p-0.5 hover:bg-gray-100 rounded text-gray-500 focus:outline-none transition-colors"
                                                >
                                                    {isExpanded ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />}
                                                </button>
                                            ) : (
                                                <div style={{ width: "18px" }} className="flex items-center justify-center">
                                                    <span className="w-1 h-1 rounded-full bg-gray-300" />
                                                </div>
                                            )}
                                            <span className="truncate">{item.name}</span>
                                        </div>
                                        <div className="truncate text-gray-500 flex items-center py-2.5">Cấp {item.level}</div>
                                    </div>
                                );
                            })}
                            {displayData.length === 0 && <div className="flex items-center justify-center py-12 text-sm text-gray-400">Không có dữ liệu</div>}
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
                    <div className="bg-blue-600 text-white font-bold px-4 h-full flex items-center justify-center min-w-10">{selectedIds.length}</div>
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
