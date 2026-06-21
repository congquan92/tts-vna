"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserApi } from "@/api/user";
import TopHero from "@/components/TopHero";
import Button from "@/components/ui/Button";
import { InputField } from "@/components/form/InputField";
import { toast } from "sonner";
import { Check, Upload, AlertCircle, ArrowLeft } from "lucide-react";
import axios from "axios";

interface ImportPreviewRow {
    row: number;
    fullName: string;
    username: string;
    email: string;
    role: string;
    position: string;
    isActive: boolean;
    errors?: string[];
}

export default function ImportPreviewPage() {
    const router = useRouter();
    const [importRows, setImportRows] = useState<ImportPreviewRow[] | null>(() => {
        if (typeof window !== "undefined") {
            const cached = sessionStorage.getItem("import_preview_rows");
            if (cached) {
                try {
                    return JSON.parse(cached);
                } catch (e) {
                    console.error("Lỗi khi parse cached import rows:", e);
                }
            }
        }
        return null;
    });
    const [loading, setLoading] = useState(false);

    // Save changes to sessionStorage whenever state changes
    const updateRowsState = (nextRows: ImportPreviewRow[] | null) => {
        setImportRows(nextRows);
        if (nextRows) {
            sessionStorage.setItem("import_preview_rows", JSON.stringify(nextRows));
        } else {
            sessionStorage.removeItem("import_preview_rows");
        }
    };

    const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const loadingToast = toast.loading("Đang đọc file preview...");
        setLoading(true);
        try {
            const res = await UserApi.importUsers(file, true);
            const { total, errors, rows } = res.data;

            if (total === 0) {
                toast.warning("File import không có dữ liệu người dùng.");
                return;
            }

            const successRows = (rows || []).map((r) => ({
                row: r.row,
                fullName: r.fullName || "",
                username: r.username || "",
                email: r.email || "",
                role: r.role || "",
                position: r.position || "",
                isActive: r.isActive !== undefined ? !!r.isActive : true,
                errors: [] as string[],
            }));

            const errorRows = (errors || []).map((err) => {
                const r = err.data || {};
                return {
                    row: err.row,
                    fullName: String(r["Họ tên"] || r.fullName || "").trim(),
                    username: String(r["Tài khoản"] || r.username || "").trim(),
                    email: String(r["Email"] || r.email || "").trim(),
                    role: String(r["Vai trò"] || r.role || "").trim(),
                    position: String(r["Chức danh"] || r.position || "").trim(),
                    isActive: r.isActive !== undefined ? !!r.isActive : true,
                    errors: err.errors || [],
                };
            });

            const allRows = [...successRows, ...errorRows].sort((a, b) => a.row - b.row);
            updateRowsState(allRows);
            toast.success("Đã tải dữ liệu xem trước");
        } catch (error: unknown) {
            console.error("Lỗi khi preview dữ liệu:", error);
            let message = "Không thể đọc dữ liệu file";
            if (axios.isAxiosError(error) && error.response?.data?.message) {
                message = error.response.data.message;
            }
            toast.error(message);
        } finally {
            toast.dismiss(loadingToast);
            setLoading(false);
            e.target.value = "";
        }
    };

    const handleEditRow = (index: number, field: keyof ImportPreviewRow, value: string | boolean) => {
        if (!importRows) return;
        const next = [...importRows];
        next[index] = { ...next[index], [field]: value } as ImportPreviewRow;

        // Dynamic frontend validation check (basic) to help user
        if (field === "email" && typeof value === "string") {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const currentErrors = next[index].errors || [];

            const updatedErrors = currentErrors.filter((err) => !err.includes("Email"));
            if (!value.trim()) {
                updatedErrors.push("Email không được để trống");
            } else if (!emailRegex.test(value)) {
                updatedErrors.push("Email không hợp lệ");
            }
            next[index].errors = updatedErrors;
        } else if (field === "fullName" && typeof value === "string") {
            const currentErrors = next[index].errors || [];
            const updatedErrors = currentErrors.filter((err) => !err.includes("Họ tên"));
            if (!value.trim()) {
                updatedErrors.push("Họ tên không được để trống");
            }
            next[index].errors = updatedErrors;
        } else if (field === "username" && typeof value === "string") {
            const currentErrors = next[index].errors || [];
            const updatedErrors = currentErrors.filter((err) => !err.includes("Tài khoản"));
            if (!value.trim()) {
                updatedErrors.push("Tài khoản không được để trống");
            }
            next[index].errors = updatedErrors;
        }

        updateRowsState(next);
    };

    const handleDeleteRow = (index: number) => {
        if (!importRows) return;
        const next = importRows.filter((_, idx) => idx !== index);
        updateRowsState(next);
    };

    const handleRevalidate = async () => {
        if (!importRows || importRows.length === 0) return;

        const loadingToast = toast.loading("Đang kiểm tra lại dữ liệu...");
        setLoading(true);
        try {
            // Strip client-side UI error lists before sending
            const sanitizedRows = importRows.map((row) => {
                const copy = { ...row };
                delete (copy as { errors?: string[] }).errors;
                return copy;
            });
            const res = await UserApi.importUsers(sanitizedRows, true);
            const { errors, rows } = res.data;

            const successRows = (rows || []).map((r) => ({
                row: r.row,
                fullName: r.fullName || "",
                username: r.username || "",
                email: r.email || "",
                role: r.role || "",
                position: r.position || "",
                isActive: r.isActive !== undefined ? !!r.isActive : true,
                errors: [] as string[],
            }));

            const errorRows = (errors || []).map((err) => {
                const r = err.data || {};
                return {
                    row: err.row,
                    fullName: String(r["Họ tên"] || r.fullName || "").trim(),
                    username: String(r["Tài khoản"] || r.username || "").trim(),
                    email: String(r["Email"] || r.email || "").trim(),
                    role: String(r["Vai trò"] || r.role || "").trim(),
                    position: String(r["Chức danh"] || r.position || "").trim(),
                    isActive: r.isActive !== undefined ? !!r.isActive : true,
                    errors: err.errors || [],
                };
            });

            // Merge and sort
            const allRows = [...successRows, ...errorRows].sort((a, b) => a.row - b.row);
            updateRowsState(allRows);
            toast.success("Kiểm tra dữ liệu hoàn tất!");
        } catch (error: unknown) {
            console.error("Lỗi khi kiểm tra lại dữ liệu:", error);
            let message = "Không thể kiểm tra dữ liệu";
            if (axios.isAxiosError(error) && error.response?.data?.message) {
                message = error.response.data.message;
            }
            toast.error(message);
        } finally {
            toast.dismiss(loadingToast);
            setLoading(false);
        }
    };

    const handleConfirmImport = async () => {
        if (!importRows || importRows.length === 0) {
            toast.error("Không có dữ liệu để import.");
            return;
        }

        // Filter out rows that contain errors
        const validRows = importRows.filter((r) => !r.errors || r.errors.length === 0);

        if (validRows.length === 0) {
            toast.error("Tất cả các dòng hiện tại đều có lỗi. Vui lòng sửa lại trước khi import.");
            return;
        }

        const loadingToast = toast.loading(`Đang import ${validRows.length} dòng hợp lệ...`);
        setLoading(true);
        try {
            // Strip preview specific props
            const sanitizedRows = validRows.map((row) => {
                const copy = { ...row };
                delete (copy as { errors?: string[] }).errors;
                return copy;
            });
            const res = await UserApi.importUsers(sanitizedRows, false);
            const { success, failed, total } = res.data;

            if (success > 0) {
                toast.success(`Đã import thành công ${success}/${total} người dùng`);
                updateRowsState(null);
                router.push("/accounts-managements");
            }

            if (failed > 0) {
                const firstErrors = res.data.errors.slice(0, 3);
                const errorMsg = firstErrors.map((err) => `• Dòng ${err.row}: ${err.errors.join(", ")}`).join("\n");

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
        } catch (error: unknown) {
            console.error("Lỗi khi import dữ liệu:", error);
            let message = "Không thể import dữ liệu";
            if (axios.isAxiosError(error) && error.response?.data?.message) {
                message = error.response.data.message;
            }
            toast.error(message);
        } finally {
            toast.dismiss(loadingToast);
            setLoading(false);
        }
    };

    const validRowsCount = importRows?.filter((r) => !r.errors || r.errors.length === 0).length || 0;
    const invalidRowsCount = importRows?.filter((r) => r.errors && r.errors.length > 0).length || 0;

    return (
        <main className="h-screen flex flex-col py-2">
            <div className="shrink-0">
                <TopHero
                    lable="Xem trước dữ liệu Import"
                    component={
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                size="sm"
                                className="flex gap-2 items-center text-sm font-semibold border-none cursor-pointer"
                                onClick={() => {
                                    updateRowsState(null);
                                    router.push("/accounts-managements");
                                }}
                            >
                                <span className="text-gray-500 font-semibold">Quay lại</span>
                            </Button>
                            {importRows && importRows.length > 0 && (
                                <>
                                    <Button variant="primary" size="sm" className="flex gap-2 items-center text-sm font-semibold cursor-pointer" onClick={handleConfirmImport} disabled={loading || validRowsCount === 0}>
                                        <Check className="size-4" />
                                        <span>Xác nhận Import ({validRowsCount})</span>
                                    </Button>
                                </>
                            )}
                        </div>
                    }
                />
            </div>

            <div className="bg-white rounded-lg border border-gray-100 shadow-sm flex flex-col flex-1 min-h-0 overflow-hidden mt-2">
                {importRows === null ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-12">
                        <Upload className="size-12 text-gray-400 mb-4 animate-bounce" />
                        <h3 className="text-lg font-bold text-gray-800 mb-1">Tải lên danh sách tài khoản</h3>
                        <p className="text-sm text-gray-500 text-center max-w-sm mb-6">Chọn tệp tin Excel (.xlsx, .xls) chứa thông tin tài khoản cán bộ Sở để tiến hành kiểm tra và import.</p>
                        <input type="file" id="dedicatedImportFileInput" className="hidden" accept=".xlsx, .xls" onChange={handleImportFile} />
                        <Button variant="primary" onClick={() => document.getElementById("dedicatedImportFileInput")?.click()} className="cursor-pointer font-semibold">
                            Chọn file từ thiết bị
                        </Button>
                    </div>
                ) : (
                    <>
                        {/* Summary Header Banner */}
                        <div className="shrink-0 border-b border-gray-200 bg-[#F4F6F8]/40 px-5 py-4 flex items-center justify-between">
                            <div className="flex items-center gap-6">
                                <div>
                                    <span className="text-gray-500 text-[10px] uppercase font-bold tracking-wider">
                                        Tổng số dòng : <strong>{importRows.length}</strong>
                                    </span>
                                    {/* <p className="text-lg font-bold text-gray-800">{importRows.length}</p> */}
                                </div>
                                <div className="w-px h-8 bg-gray-200" />
                                <div>
                                    <span className="text-gray-500 text-[10px] uppercase font-bold tracking-wider">
                                        Dòng hợp lệ (Sẽ import) : <strong>{validRowsCount}</strong>
                                    </span>
                                    {/* <p className="text-lg font-bold text-green-600">{validRowsCount}</p> */}
                                </div>
                                <div className="w-px h-8 bg-gray-200" />
                                <div>
                                    <span className="text-gray-500 text-[10px] uppercase font-bold tracking-wider">
                                        Dòng bị lỗi (Bị bỏ qua) : <strong>{invalidRowsCount}</strong>
                                    </span>
                                    {/* <p className="text-lg font-bold text-red-600">{invalidRowsCount}</p> */}
                                </div>
                            </div>
                            <div className="text-xs text-gray-500  max-w-md text-right leading-relaxed font-medium">
                                <Button variant="outline" size="sm" className="p-0" onClick={handleRevalidate}>
                                    <Check className="size-4 mr-2" /> <strong>Kiểm tra lại dữ liệu</strong>
                                </Button>
                            </div>
                        </div>

                        {/* Main Grid Table */}
                        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                            {/* Grid Header */}
                            <div className="shrink-0 border-b border-gray-200 bg-[#F4F6F8]">
                                <div className="grid gap-3 px-4 py-3 font-semibold text-gray-700 text-xs items-center" style={{ gridTemplateColumns: "50px 1.5fr 1fr 1.8fr 1.2fr 1.5fr 2.5fr 80px" }}>
                                    <div className="text-center">Dòng</div>
                                    <div>Họ tên *</div>
                                    <div>Tài khoản *</div>
                                    <div>Email *</div>
                                    <div>Chức danh</div>
                                    <div>Vai trò *</div>
                                    <div>Trạng thái / Chi tiết lỗi</div>
                                    <div className="text-center">Hành động</div>
                                </div>
                            </div>

                            {/* Grid Body */}
                            <div className="flex-1 overflow-y-auto min-h-0 divide-y divide-gray-100 bg-white">
                                {importRows.length === 0 ? (
                                    <div className="text-center py-12 text-sm text-gray-400 italic">Danh sách trống. Vui lòng tải lại tệp tin khác.</div>
                                ) : (
                                    importRows.map((row, index) => {
                                        const hasErrors = row.errors && row.errors.length > 0;
                                        return (
                                            <div
                                                key={index}
                                                className={`grid gap-3 px-4 py-1.5 hover:bg-blue-50/10 items-center text-xs text-gray-700 transition-colors ${hasErrors ? "bg-red-50/20 border-l-4 border-l-red-500" : "border-b border-gray-100"}`}
                                                style={{ gridTemplateColumns: "50px 1.5fr 1fr 1.8fr 1.2fr 1.5fr 2.5fr 80px" }}
                                            >
                                                <div className="text-center font-mono text-gray-400 text-xs">{row.row}</div>
                                                <div>
                                                    <InputField size="sm" value={row.fullName} onChange={(e) => handleEditRow(index, "fullName", e.target.value)} placeholder="Nhập họ tên" error={hasErrors && !row.fullName.trim() ? " " : undefined} />
                                                </div>
                                                <div>
                                                    <InputField
                                                        size="sm"
                                                        value={row.username}
                                                        onChange={(e) => handleEditRow(index, "username", e.target.value)}
                                                        placeholder="Nhập tài khoản"
                                                        error={hasErrors && (!row.username.trim() || row.errors?.some((err) => err.includes("Tài khoản"))) ? " " : undefined}
                                                    />
                                                </div>
                                                <div>
                                                    <InputField
                                                        size="sm"
                                                        value={row.email}
                                                        onChange={(e) => handleEditRow(index, "email", e.target.value)}
                                                        placeholder="Nhập email"
                                                        error={hasErrors && (!row.email.trim() || row.errors?.some((err) => err.includes("Email"))) ? " " : undefined}
                                                    />
                                                </div>
                                                <div>
                                                    <InputField size="sm" value={row.position} onChange={(e) => handleEditRow(index, "position", e.target.value)} placeholder="Nhập chức danh" />
                                                </div>
                                                <div>
                                                    <InputField
                                                        size="sm"
                                                        isSelect={true}
                                                        value={row.role}
                                                        onChange={(e) => handleEditRow(index, "role", e.target.value)}
                                                        options={[
                                                            { label: "Quản trị viên Sở", value: "ADMIN_SO" },
                                                            { label: "Lãnh đạo Sở", value: "MANAGER_SO" },
                                                            { label: "Chuyên viên", value: "CHUYENVIEN_SO" },
                                                        ]}
                                                        error={hasErrors && (!row.role || row.errors?.some((err) => err.includes("Vai trò"))) ? " " : undefined}
                                                    />
                                                </div>
                                                <div className="align-middle">
                                                    {hasErrors ? (
                                                        <div className="flex flex-col gap-1 text-[11px] text-red-600 font-medium leading-tight py-1">
                                                            {row.errors?.map((err, i) => (
                                                                <span key={i} className="flex items-start gap-1">
                                                                    <AlertCircle className="size-3.5 shrink-0 mt-0.5" />
                                                                    <span>{err}</span>
                                                                </span>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-green-50 text-green-700">
                                                            <Check className="size-3" />
                                                            Hợp lệ
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-center">
                                                    <button type="button" onClick={() => handleDeleteRow(index)} className="text-xs text-red-500 hover:text-red-700 font-semibold cursor-pointer hover:underline focus:outline-none">
                                                        Xóa
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </main>
    );
}
