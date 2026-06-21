"use client";

import React, { useState, useEffect, useCallback } from "react";
import { X, Building, FileText, Users, Save, Send, Info, PlusCircle } from "lucide-react";
import type { Report, CreateReportPayload, UpdateReportPayload, LaborAccidentReport, LaborAccidentSupportReport, AccidentDetail } from "@/types/report";
import { ReportApi } from "@/api/report";
import { toast } from "sonner";
import axios from "axios";
import { initialLaborReport, initialSupportReport } from "./constants";
import AccidentDetailModal from "./AccidentDetailModal";
import { InputField } from "@/components/form/InputField";
import Button from "@/components/ui/Button";

interface ReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    mode: "create" | "edit" | "view";
    report: Report | null;
    businessProfile: { name: string; taxCode: string } | null;
    existingReports: Report[];
    onSaveSuccess: () => void;
}

export default function ReportModal({ isOpen, onClose, mode, report, businessProfile, existingReports, onSaveSuccess }: ReportModalProps) {
    const [activeTab, setActiveTab] = useState<"general" | "contract" | "non-contract">("general");

    // Form fields state
    const [formYear, setFormYear] = useState<number>(new Date().getFullYear());
    const [formPeriod, setFormPeriod] = useState<string>("6 tháng");
    const [totalEmployees, setTotalEmployees] = useState<number>(0);
    const [totalFemaleEmployees, setTotalFemaleEmployees] = useState<number>(0);
    const [totalSalary, setTotalSalary] = useState<number>(0);

    const [laborReport, setLaborReport] = useState<LaborAccidentReport>(initialLaborReport());
    const [supportReport, setSupportReport] = useState<LaborAccidentSupportReport>(initialSupportReport());

    // Accident detail sub-modal state
    const [showDetailForm, setShowDetailForm] = useState(false);
    const [editingDetailIndex, setEditingDetailIndex] = useState<number | null>(null);
    const [editingDetailData, setEditingDetailData] = useState<AccidentDetail | null>(null);

    // Initialize/Reset states on open/change
    useEffect(() => {
        if (isOpen) {
            Promise.resolve().then(() => {
                setActiveTab("general");
                if (mode === "create") {
                    setFormYear(new Date().getFullYear());
                    setFormPeriod("6 tháng");
                    setTotalEmployees(0);
                    setTotalFemaleEmployees(0);
                    setTotalSalary(0);
                    setLaborReport(initialLaborReport());
                    setSupportReport(initialSupportReport());
                } else if (report) {
                    setFormYear(report.year || new Date().getFullYear());
                    setFormPeriod(report.reportPeriod || "6 tháng");
                    setTotalEmployees(report.companyInfo?.totalNumberOfEmployees || 0);
                    setTotalFemaleEmployees(report.companyInfo?.totalNumberOfFemaleEmployees || 0);
                    setTotalSalary(Number(report.companyInfo?.totalSalary || 0));

                    setLaborReport(
                        report.laborAccidentReport
                            ? {
                                  ...report.laborAccidentReport,
                                  accidentDetails: report.laborAccidentReport.accidentDetails || [],
                              }
                            : initialLaborReport(),
                    );

                    setSupportReport(report.laborAccidentSupportReport || initialSupportReport());
                }
            });
        }
    }, [isOpen, mode, report]);

    // Auto-calculate total costs for reports
    const handleLaborReportCostSum = useCallback(() => {
        setLaborReport((prev) => ({
            ...prev,
            totalCost: Number(prev.medicalCost || 0) + Number(prev.salaryDuringTreatment || 0) + Number(prev.compensationCost || 0),
        }));
    }, []);

    const handleSupportReportCostSum = useCallback(() => {
        setSupportReport((prev) => ({
            ...prev,
            totalCost: Number(prev.medicalCost || 0) + Number(prev.salaryDuringTreatment || 0) + Number(prev.compensationCost || 0),
        }));
    }, []);

    useEffect(() => {
        Promise.resolve().then(() => {
            handleLaborReportCostSum();
        });
    }, [laborReport.medicalCost, laborReport.salaryDuringTreatment, laborReport.compensationCost, handleLaborReportCostSum]);

    useEffect(() => {
        Promise.resolve().then(() => {
            handleSupportReportCostSum();
        });
    }, [supportReport.medicalCost, supportReport.salaryDuringTreatment, supportReport.compensationCost, handleSupportReportCostSum]);

    // Helper: auto calculate summary based on detail rows
    const calculateTotalsFromDetails = useCallback((detailsList: AccidentDetail[]) => {
        const totals = {
            totalAccidentCases: 0,
            totalCasesWithDeath: 0,
            totalCasesWithTwoOrMoreVictims: 0,
            totalVictims: 0,
            totalFemaleVictims: 0,
            totalDeaths: 0,
            totalSeriouslyInjured: 0,
            unmanagedVictims: 0,
            unmanagedFemaleVictims: 0,
            unmanagedDeaths: 0,
            unmanagedSeriouslyInjured: 0,
            medicalCost: 0,
            salaryDuringTreatment: 0,
            compensationCost: 0,
            propertyDamage: 0,
            totalSickDays: 0,
        };

        detailsList.forEach((d) => {
            totals.totalAccidentCases += Number(d.totalAccidentCases || 0);
            totals.totalCasesWithDeath += Number(d.totalCasesWithDeath || 0);
            totals.totalCasesWithTwoOrMoreVictims += Number(d.totalCasesWithTwoOrMoreVictims || 0);
            totals.totalVictims += Number(d.totalVictims || 0);
            totals.totalFemaleVictims += Number(d.totalFemaleVictims || 0);
            totals.totalDeaths += Number(d.totalDeaths || 0);
            totals.totalSeriouslyInjured += Number(d.totalSeriouslyInjured || 0);
            totals.unmanagedVictims += Number(d.unmanagedVictims || 0);
            totals.unmanagedFemaleVictims += Number(d.unmanagedFemaleVictims || 0);
            totals.unmanagedDeaths += Number(d.unmanagedDeaths || 0);
            totals.unmanagedSeriouslyInjured += Number(d.unmanagedSeriouslyInjured || 0);
            totals.medicalCost += Number(d.medicalCost || 0);
            totals.salaryDuringTreatment += Number(d.salaryDuringTreatment || 0);
            totals.compensationCost += Number(d.compensationCost || 0);
            totals.propertyDamage += Number(d.propertyDamage || 0);
            totals.totalSickDays += Number(d.totalSickDays || 0);
        });

        return totals;
    }, []);

    // Sync laborReport parent fields if details exist
    useEffect(() => {
        const details = laborReport.accidentDetails || [];
        if (details.length > 0) {
            const calculated = calculateTotalsFromDetails(details);
            Promise.resolve().then(() => {
                setLaborReport((prev) => ({
                    ...prev,
                    ...calculated,
                    totalCost: calculated.medicalCost + calculated.salaryDuringTreatment + calculated.compensationCost,
                }));
            });
        }
    }, [laborReport.accidentDetails, calculateTotalsFromDetails]);

    const validateForm = (): boolean => {
        // Basic validations
        if (!totalEmployees || totalEmployees < 0) {
            toast.error("Vui lòng điền tổng số lao động hợp lệ");
            return false;
        }
        if (totalFemaleEmployees < 0 || totalFemaleEmployees > totalEmployees) {
            toast.error("Số lao động nữ không hợp lệ (không được âm và không được lớn hơn tổng số lao động)");
            return false;
        }
        if (totalSalary < 0) {
            toast.error("Tổng quỹ lương không được nhỏ hơn 0");
            return false;
        }

        // Summary logical check helpers
        const validateSummary = (data: LaborAccidentReport | LaborAccidentSupportReport, prefixLabel: string) => {
            const tCases = Number(data.totalAccidentCases || 0);
            const tDeaths = Number(data.totalCasesWithDeath || 0);
            const tTwoVictims = Number(data.totalCasesWithTwoOrMoreVictims || 0);

            if (tCases !== tDeaths + tTwoVictims) {
                toast.error(`${prefixLabel}: Tổng số vụ (${tCases}) phải bằng số vụ có người chết (${tDeaths}) + số vụ có 2 người bị nạn trở lên (${tTwoVictims})`);
                return false;
            }

            const tVictims = Number(data.totalVictims || 0);
            const tFemale = Number(data.totalFemaleVictims || 0);
            const tDead = Number(data.totalDeaths || 0);
            const tSerious = Number(data.totalSeriouslyInjured || 0);

            const unmanagedV = Number(data.unmanagedVictims || 0);
            const unmanagedF = Number(data.unmanagedFemaleVictims || 0);
            const unmanagedD = Number(data.unmanagedDeaths || 0);
            const unmanagedS = Number(data.unmanagedSeriouslyInjured || 0);

            if (tVictims < unmanagedV) {
                toast.error(`${prefixLabel}: Tổng số người bị nạn phải lớn hơn hoặc bằng số người bị nạn không quản lý`);
                return false;
            }
            if (tFemale < unmanagedF) {
                toast.error(`${prefixLabel}: Số lao động nữ bị nạn phải lớn hơn hoặc bằng lao động nữ bị nạn không quản lý`);
                return false;
            }
            if (tDead < unmanagedD) {
                toast.error(`${prefixLabel}: Tổng số người chết phải lớn hơn hoặc bằng số người chết không quản lý`);
                return false;
            }
            if (tSerious < unmanagedS) {
                toast.error(`${prefixLabel}: Số người bị thương nặng phải lớn hơn hoặc bằng số người bị thương nặng không quản lý`);
                return false;
            }

            return true;
        };

        if (!validateSummary(laborReport, "Báo cáo có HĐLĐ")) return false;
        if (!validateSummary(supportReport, "Báo cáo không HĐLĐ")) return false;

        // Check if report already exists for the same year and period
        if (mode === "create") {
            const isDuplicate = existingReports.some((r) => r.year === formYear && r.reportPeriod === formPeriod);
            if (isDuplicate) {
                toast.error(`Doanh nghiệp đã khai báo báo cáo cho Kỳ ${formPeriod} năm ${formYear} rồi.`);
                return false;
            }
        }

        return true;
    };

    const handleSave = async (statusToSave: "đang báo cáo" | "đã tiếp nhận") => {
        if (!validateForm()) return;

        if (statusToSave === "đã tiếp nhận") {
            const confirm = window.confirm("Khi đã gửi báo cáo, bạn sẽ không thể chỉnh sửa thông tin này nữa. Bạn có chắc chắn muốn gửi báo cáo?");
            if (!confirm) return;
        }

        const payload: CreateReportPayload = {
            year: formYear,
            reportPeriod: formPeriod,
            status: statusToSave,
            companyInfo: {
                totalNumberOfEmployees: Number(totalEmployees),
                totalNumberOfFemaleEmployees: Number(totalFemaleEmployees),
                totalSalary: Number(totalSalary),
            },
            laborAccidentReport: {
                totalAccidentCases: Number(laborReport.totalAccidentCases),
                totalCasesWithDeath: Number(laborReport.totalCasesWithDeath),
                totalCasesWithTwoOrMoreVictims: Number(laborReport.totalCasesWithTwoOrMoreVictims),
                totalVictims: Number(laborReport.totalVictims),
                totalFemaleVictims: Number(laborReport.totalFemaleVictims),
                totalDeaths: Number(laborReport.totalDeaths),
                totalSeriouslyInjured: Number(laborReport.totalSeriouslyInjured),
                unmanagedVictims: Number(laborReport.unmanagedVictims),
                unmanagedFemaleVictims: Number(laborReport.unmanagedFemaleVictims),
                unmanagedDeaths: Number(laborReport.unmanagedDeaths),
                unmanagedSeriouslyInjured: Number(laborReport.unmanagedSeriouslyInjured),
                medicalCost: Number(laborReport.medicalCost),
                salaryDuringTreatment: Number(laborReport.salaryDuringTreatment),
                compensationCost: Number(laborReport.compensationCost),
                totalSickDays: Number(laborReport.totalSickDays),
                propertyDamage: Number(laborReport.propertyDamage),
                accidentDetails: (laborReport.accidentDetails || []).map((d) => ({
                    accidentCause: d.accidentCause,
                    injuryFactor: d.injuryFactor,
                    occupationCategory: d.occupationCategory,
                    totalAccidentCases: Number(d.totalAccidentCases),
                    totalCasesWithDeath: Number(d.totalCasesWithDeath),
                    totalCasesWithTwoOrMoreVictims: Number(d.totalCasesWithTwoOrMoreVictims),
                    totalVictims: Number(d.totalVictims),
                    totalFemaleVictims: Number(d.totalFemaleVictims),
                    totalDeaths: Number(d.totalDeaths),
                    totalSeriouslyInjured: Number(d.totalSeriouslyInjured),
                    unmanagedVictims: Number(d.unmanagedVictims),
                    unmanagedFemaleVictims: Number(d.unmanagedFemaleVictims),
                    unmanagedDeaths: Number(d.unmanagedDeaths),
                    unmanagedSeriouslyInjured: Number(d.unmanagedSeriouslyInjured),
                    medicalCost: Number(d.medicalCost),
                    salaryDuringTreatment: Number(d.salaryDuringTreatment),
                    compensationCost: Number(d.compensationCost),
                    propertyDamage: Number(d.propertyDamage),
                    totalSickDays: Number(d.totalSickDays),
                })),
            },
            laborAccidentSupportReport: {
                totalAccidentCases: Number(supportReport.totalAccidentCases),
                totalCasesWithDeath: Number(supportReport.totalCasesWithDeath),
                totalCasesWithTwoOrMoreVictims: Number(supportReport.totalCasesWithTwoOrMoreVictims),
                totalVictims: Number(supportReport.totalVictims),
                totalFemaleVictims: Number(supportReport.totalFemaleVictims),
                totalDeaths: Number(supportReport.totalDeaths),
                totalSeriouslyInjured: Number(supportReport.totalSeriouslyInjured),
                unmanagedVictims: Number(supportReport.unmanagedVictims),
                unmanagedFemaleVictims: Number(supportReport.unmanagedFemaleVictims),
                unmanagedDeaths: Number(supportReport.unmanagedDeaths),
                unmanagedSeriouslyInjured: Number(supportReport.unmanagedSeriouslyInjured),
                medicalCost: Number(supportReport.medicalCost),
                salaryDuringTreatment: Number(supportReport.salaryDuringTreatment),
                compensationCost: Number(supportReport.compensationCost),
                totalSickDays: Number(supportReport.totalSickDays),
                propertyDamage: Number(supportReport.propertyDamage),
            },
        };

        try {
            if (mode === "create") {
                await ReportApi.create(payload);
                toast.success(statusToSave === "đã tiếp nhận" ? "Gửi báo cáo thành công!" : "Lưu nháp thành công!");
            } else if (mode === "edit" && report !== null) {
                await ReportApi.update(report.id, payload as UpdateReportPayload);
                toast.success(statusToSave === "đã tiếp nhận" ? "Gửi báo cáo thành công!" : "Cập nhật nháp thành công!");
            }
            onSaveSuccess();
            onClose();
        } catch (error: unknown) {
            console.error("Save error:", error);
            if (axios.isAxiosError(error) && error.response?.data?.message) {
                const msg = error.response.data.message;
                toast.error(typeof msg === "string" ? msg : "Có lỗi nghiệp vụ xảy ra khi lưu dữ liệu");
            } else {
                toast.error("Có lỗi xảy ra khi lưu báo cáo");
            }
        }
    };

    const handleOpenAddDetail = () => {
        setEditingDetailIndex(null);
        setEditingDetailData(null);
        setShowDetailForm(true);
    };

    const handleOpenEditDetail = (index: number) => {
        const detail = (laborReport.accidentDetails || [])[index];
        setEditingDetailIndex(index);
        setEditingDetailData({ ...detail });
        setShowDetailForm(true);
    };

    const handleDeleteDetail = (index: number) => {
        const confirm = window.confirm("Bạn có chắc chắn muốn xóa chi tiết vụ tai nạn này?");
        if (!confirm) return;
        const details = (laborReport.accidentDetails || []).filter((_, i) => i !== index);
        setLaborReport((prev) => ({ ...prev, accidentDetails: details }));
        toast.success("Đã xóa chi tiết vụ tai nạn");
    };

    const handleDetailSubmit = (detail: AccidentDetail) => {
        const details = [...(laborReport.accidentDetails || [])];
        if (editingDetailIndex !== null) {
            details[editingDetailIndex] = detail;
            toast.success("Đã cập nhật chi tiết vụ tai nạn");
        } else {
            details.push(detail);
            toast.success("Đã thêm chi tiết vụ tai nạn");
        }
        setLaborReport((prev) => ({ ...prev, accidentDetails: details }));
        setShowDetailForm(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden border border-gray-100 animate-in fade-in zoom-in duration-200">
                {/* Modal Header */}
                <div className="shrink-0 px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <h2 className="text-base font-bold text-gray-800">{mode === "create" ? "Khai Báo Báo Cáo Tai Nạn Lao Động" : mode === "edit" ? "Chỉnh Sửa Báo Cáo Tai Nạn Lao Động" : "Chi Tiết Báo Cáo Tai Nạn Lao Động"}</h2>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${mode === "view" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"}`}>{mode === "view" ? "Chỉ xem (Đã khóa)" : "Nhập liệu"}</span>
                    </div>
                    <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200 transition-colors cursor-pointer">
                        <X size={20} />
                    </button>
                </div>

                {/* Tabs List */}
                <div className="shrink-0 bg-white border-b border-gray-100 px-6 flex gap-4">
                    {[
                        { id: "general", label: "1. Thông tin chung", icon: <Building size={16} /> },
                        { id: "contract", label: "2. Tai nạn lao động (HĐLĐ)", icon: <FileText size={16} /> },
                        { id: "non-contract", label: "3. Tai nạn lao động (Không HĐLĐ)", icon: <Users size={16} /> },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveTab(tab.id as "general" | "contract" | "non-contract")}
                            className={`py-3 px-1 border-b-2 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                                activeTab === tab.id ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200"
                            }`}
                        >
                            {tab.icon}
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Modal Body - Scrollable */}
                <div className="flex-1 overflow-y-auto px-6 py-6 bg-gray-50/50">
                    {/* TAB 1: General Info */}
                    {activeTab === "general" && (
                        <div className="space-y-6 max-w-4xl mx-auto">
                            <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm space-y-4">
                                <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider border-b pb-2">Thông tin doanh nghiệp</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                    <InputField label="TÊN DOANH NGHIỆP" disabled value={businessProfile?.name || ""} size="sm" />
                                    <InputField label="MÃ SỐ THUẾ" disabled value={businessProfile?.taxCode || ""} size="sm" />
                                </div>
                            </div>

                            <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm space-y-4">
                                <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider border-b pb-2">Kỳ báo cáo</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                    <InputField
                                        label="NĂM BÁO CÁO"
                                        disabled={mode === "view"}
                                        value={formYear.toString()}
                                        onChange={(e) => setFormYear(Number(e.target.value))}
                                        isSelect
                                        size="sm"
                                        options={[2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027].map((y) => ({ label: y.toString(), value: y.toString() }))}
                                    />
                                    <InputField
                                        label="KÝ BÁO CÁO"
                                        disabled={mode === "view"}
                                        value={formPeriod}
                                        onChange={(e) => setFormPeriod(e.target.value)}
                                        isSelect
                                        size="sm"
                                        options={[
                                            { label: "6 tháng", value: "6 tháng" },
                                            { label: "Cả năm", value: "Cả năm" },
                                        ]}
                                    />
                                </div>
                            </div>

                            <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm space-y-4">
                                <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider border-b pb-2">Số liệu lao động trong kỳ</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                                    <InputField
                                        label="TỔNG SỐ LAO ĐỘNG"
                                        type="number"
                                        disabled={mode === "view"}
                                        value={totalEmployees ? totalEmployees.toString() : ""}
                                        onChange={(e) => setTotalEmployees(Math.max(0, Number(e.target.value)))}
                                        placeholder="0"
                                        size="sm"
                                    />
                                    <InputField
                                        label="TRONG ĐÓ: LAO ĐỘNG NỮ"
                                        type="number"
                                        disabled={mode === "view"}
                                        value={totalFemaleEmployees ? totalFemaleEmployees.toString() : ""}
                                        onChange={(e) => setTotalFemaleEmployees(Math.max(0, Number(e.target.value)))}
                                        placeholder="0"
                                        size="sm"
                                    />
                                    <InputField
                                        label="TỔNG QUỸ LƯƠNG TRONG KỲ (VNĐ)"
                                        type="number"
                                        disabled={mode === "view"}
                                        value={totalSalary ? totalSalary.toString() : ""}
                                        onChange={(e) => setTotalSalary(Math.max(0, Number(e.target.value)))}
                                        placeholder="0"
                                        size="sm"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 2: Contract Accidents Report */}
                    {activeTab === "contract" && (
                        <div className="space-y-6">
                            {/* Warning alert if details auto-compute parent values */}
                            {(laborReport.accidentDetails || []).length > 0 && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3 text-xs text-blue-800 max-w-4xl mx-auto">
                                    <Info className="size-5 text-blue-500 shrink-0" />
                                    <div>
                                        <span className="font-bold">Lưu ý:</span> Số liệu thống kê tổng hợp bên dưới đang được <span className="font-bold text-blue-700">tính tự động bằng tổng các vụ tai nạn chi tiết</span> ở mục lục bảng bên dưới. Để
                                        điều chỉnh số liệu tổng, hãy sửa hoặc thêm chi tiết các vụ tai nạn ở cuối trang.
                                    </div>
                                </div>
                            )}

                            {/* Accident summary counts */}
                            <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm max-w-4xl mx-auto space-y-4">
                                <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider border-b pb-2">1. Tổng số vụ tai nạn lao động và số nạn nhân</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                                    <InputField
                                        label="TỔNG SỐ VỤ TNLĐ"
                                        type="number"
                                        disabled={mode === "view" || (laborReport.accidentDetails || []).length > 0}
                                        value={laborReport.totalAccidentCases ? laborReport.totalAccidentCases.toString() : ""}
                                        onChange={(e) => setLaborReport((prev) => ({ ...prev, totalAccidentCases: Math.max(0, Number(e.target.value)) }))}
                                        placeholder="0"
                                        size="sm"
                                    />
                                    <InputField
                                        label="SỐ VỤ CÓ NGƯỜI CHẾT"
                                        type="number"
                                        disabled={mode === "view" || (laborReport.accidentDetails || []).length > 0}
                                        value={laborReport.totalCasesWithDeath ? laborReport.totalCasesWithDeath.toString() : ""}
                                        onChange={(e) => setLaborReport((prev) => ({ ...prev, totalCasesWithDeath: Math.max(0, Number(e.target.value)) }))}
                                        placeholder="0"
                                        size="sm"
                                    />
                                    <InputField
                                        label="SỐ VỤ CÓ TỪ 2 NẠN NHÂN TRỞ LÊN"
                                        type="number"
                                        disabled={mode === "view" || (laborReport.accidentDetails || []).length > 0}
                                        value={laborReport.totalCasesWithTwoOrMoreVictims ? laborReport.totalCasesWithTwoOrMoreVictims.toString() : ""}
                                        onChange={(e) => setLaborReport((prev) => ({ ...prev, totalCasesWithTwoOrMoreVictims: Math.max(0, Number(e.target.value)) }))}
                                        placeholder="0"
                                        size="sm"
                                    />
                                    <InputField
                                        label="TỔNG SỐ NGƯỜI BỊ NẠN"
                                        type="number"
                                        disabled={mode === "view" || (laborReport.accidentDetails || []).length > 0}
                                        value={laborReport.totalVictims ? laborReport.totalVictims.toString() : ""}
                                        onChange={(e) => setLaborReport((prev) => ({ ...prev, totalVictims: Math.max(0, Number(e.target.value)) }))}
                                        placeholder="0"
                                        size="sm"
                                    />
                                    <InputField
                                        label="TRONG ĐÓ: LAO ĐỘNG NỮ"
                                        type="number"
                                        disabled={mode === "view" || (laborReport.accidentDetails || []).length > 0}
                                        value={laborReport.totalFemaleVictims ? laborReport.totalFemaleVictims.toString() : ""}
                                        onChange={(e) => setLaborReport((prev) => ({ ...prev, totalFemaleVictims: Math.max(0, Number(e.target.value)) }))}
                                        placeholder="0"
                                        size="sm"
                                    />
                                    <InputField
                                        label="SỐ NGƯỜI CHẾT"
                                        type="number"
                                        disabled={mode === "view" || (laborReport.accidentDetails || []).length > 0}
                                        value={laborReport.totalDeaths ? laborReport.totalDeaths.toString() : ""}
                                        onChange={(e) => setLaborReport((prev) => ({ ...prev, totalDeaths: Math.max(0, Number(e.target.value)) }))}
                                        placeholder="0"
                                        size="sm"
                                    />
                                    <InputField
                                        label="SỐ NGƯỜI BỊ THƯƠNG NẶNG"
                                        type="number"
                                        disabled={mode === "view" || (laborReport.accidentDetails || []).length > 0}
                                        value={laborReport.totalSeriouslyInjured ? laborReport.totalSeriouslyInjured.toString() : ""}
                                        onChange={(e) => setLaborReport((prev) => ({ ...prev, totalSeriouslyInjured: Math.max(0, Number(e.target.value)) }))}
                                        placeholder="0"
                                        size="sm"
                                    />
                                </div>

                                <h4 className="text-[11px] font-bold text-blue-700 uppercase tracking-wide border-t pt-3">Số người bị nạn không thuộc diện quản lý của doanh nghiệp (nếu có)</h4>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
                                    <InputField
                                        label="SỐ NGƯỜI BỊ NẠN"
                                        type="number"
                                        disabled={mode === "view" || (laborReport.accidentDetails || []).length > 0}
                                        value={laborReport.unmanagedVictims ? laborReport.unmanagedVictims.toString() : ""}
                                        onChange={(e) => setLaborReport((prev) => ({ ...prev, unmanagedVictims: Math.max(0, Number(e.target.value)) }))}
                                        placeholder="0"
                                        size="sm"
                                    />
                                    <InputField
                                        label="LAO ĐỘNG NỮ"
                                        type="number"
                                        disabled={mode === "view" || (laborReport.accidentDetails || []).length > 0}
                                        value={laborReport.unmanagedFemaleVictims ? laborReport.unmanagedFemaleVictims.toString() : ""}
                                        onChange={(e) => setLaborReport((prev) => ({ ...prev, unmanagedFemaleVictims: Math.max(0, Number(e.target.value)) }))}
                                        placeholder="0"
                                        size="sm"
                                    />
                                    <InputField
                                        label="SỐ NGƯỜI CHẾT"
                                        type="number"
                                        disabled={mode === "view" || (laborReport.accidentDetails || []).length > 0}
                                        value={laborReport.unmanagedDeaths ? laborReport.unmanagedDeaths.toString() : ""}
                                        onChange={(e) => setLaborReport((prev) => ({ ...prev, unmanagedDeaths: Math.max(0, Number(e.target.value)) }))}
                                        placeholder="0"
                                        size="sm"
                                    />
                                    <InputField
                                        label="BỊ THƯƠNG NẶNG"
                                        type="number"
                                        disabled={mode === "view" || (laborReport.accidentDetails || []).length > 0}
                                        value={laborReport.unmanagedSeriouslyInjured ? laborReport.unmanagedSeriouslyInjured.toString() : ""}
                                        onChange={(e) => setLaborReport((prev) => ({ ...prev, unmanagedSeriouslyInjured: Math.max(0, Number(e.target.value)) }))}
                                        placeholder="0"
                                        size="sm"
                                    />
                                </div>
                            </div>

                            {/* Cost breakdown */}
                            <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm max-w-4xl mx-auto space-y-4">
                                <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider border-b pb-2">2. Thiệt hại do tai nạn lao động (đơn vị: VNĐ, ngày nghỉ)</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                                    <InputField
                                        label="CHI PHÍ Y TẾ"
                                        type="number"
                                        disabled={mode === "view" || (laborReport.accidentDetails || []).length > 0}
                                        value={laborReport.medicalCost ? laborReport.medicalCost.toString() : ""}
                                        onChange={(e) => setLaborReport((prev) => ({ ...prev, medicalCost: Math.max(0, Number(e.target.value)) }))}
                                        placeholder="0"
                                        size="sm"
                                    />
                                    <InputField
                                        label="CHI TRẢ LƯƠNG TRONG THỜI GIAN ĐIỀU TRỊ"
                                        type="number"
                                        disabled={mode === "view" || (laborReport.accidentDetails || []).length > 0}
                                        value={laborReport.salaryDuringTreatment ? laborReport.salaryDuringTreatment.toString() : ""}
                                        onChange={(e) => setLaborReport((prev) => ({ ...prev, salaryDuringTreatment: Math.max(0, Number(e.target.value)) }))}
                                        placeholder="0"
                                        size="sm"
                                    />
                                    <InputField
                                        label="CHI PHÍ BỒI THƯỜNG TRỢ CẤP"
                                        type="number"
                                        disabled={mode === "view" || (laborReport.accidentDetails || []).length > 0}
                                        value={laborReport.compensationCost ? laborReport.compensationCost.toString() : ""}
                                        onChange={(e) => setLaborReport((prev) => ({ ...prev, compensationCost: Math.max(0, Number(e.target.value)) }))}
                                        placeholder="0"
                                        size="sm"
                                    />
                                    <InputField
                                        label="THIỆT HẠI TÀI SẢN"
                                        type="number"
                                        disabled={mode === "view" || (laborReport.accidentDetails || []).length > 0}
                                        value={laborReport.propertyDamage ? laborReport.propertyDamage.toString() : ""}
                                        onChange={(e) => setLaborReport((prev) => ({ ...prev, propertyDamage: Math.max(0, Number(e.target.value)) }))}
                                        placeholder="0"
                                        size="sm"
                                    />
                                    <InputField
                                        label="TỔNG SỐ NGÀY NGHỈ PHÉP BỆNH/ĐIỀU TRỊ"
                                        type="number"
                                        disabled={mode === "view" || (laborReport.accidentDetails || []).length > 0}
                                        value={laborReport.totalSickDays ? laborReport.totalSickDays.toString() : ""}
                                        onChange={(e) => setLaborReport((prev) => ({ ...prev, totalSickDays: Math.max(0, Number(e.target.value)) }))}
                                        placeholder="0"
                                        size="sm"
                                    />
                                    <InputField
                                        label="TỔNG CHI PHÍ THIỆT HẠI (AUTO SUM)"
                                        disabled
                                        value={(laborReport.totalCost || 0).toLocaleString()}
                                        size="sm"
                                        className="font-bold text-blue-700 disabled:bg-gray-100"
                                    />
                                </div>
                            </div>

                            {/* Accident details rows listing */}
                            <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm max-w-4xl mx-auto space-y-4">
                                <div className="flex items-center justify-between border-b pb-2">
                                    <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">3. Danh sách chi tiết các vụ tai nạn lao động</h3>

                                    {mode !== "view" && (
                                        <button type="button" onClick={handleOpenAddDetail} className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1.5 cursor-pointer">
                                            <PlusCircle size={14} />
                                            <span>Thêm chi tiết vụ tai nạn</span>
                                        </button>
                                    )}
                                </div>

                                <div className="overflow-x-auto border border-gray-200 rounded">
                                    <table className="w-full text-left text-xs">
                                        <thead className="bg-gray-50 border-b border-gray-200 text-gray-700 font-bold">
                                            <tr>
                                                <th className="py-2.5 px-3">Nguyên nhân chính</th>
                                                <th className="py-2.5 px-3">Yếu tố chấn thương</th>
                                                <th className="py-2.5 px-3">Nghề nghiệp</th>
                                                <th className="py-2.5 px-3 text-center">Số vụ</th>
                                                <th className="py-2.5 px-3 text-center">Nạn nhân</th>
                                                <th className="py-2.5 px-3 text-center">Số người chết</th>
                                                {mode !== "view" && <th className="py-2.5 px-3 text-center">Thao tác</th>}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {(laborReport.accidentDetails || []).map((detail, idx) => (
                                                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                                    <td className="py-2.5 px-3 font-medium text-gray-800">{detail.accidentCause}</td>
                                                    <td className="py-2.5 px-3 text-gray-600">{detail.injuryFactor}</td>
                                                    <td className="py-2.5 px-3 text-gray-600">{detail.occupationCategory}</td>
                                                    <td className="py-2.5 px-3 text-center tabular-nums">{detail.totalAccidentCases}</td>
                                                    <td className="py-2.5 px-3 text-center tabular-nums">{detail.totalVictims}</td>
                                                    <td className="py-2.5 px-3 text-center tabular-nums">{detail.totalDeaths}</td>
                                                    {mode !== "view" && (
                                                        <td className="py-2.5 px-3 flex items-center justify-center gap-3">
                                                            <button type="button" onClick={() => handleOpenEditDetail(idx)} className="text-blue-500 hover:text-blue-700 cursor-pointer">
                                                                Sửa
                                                            </button>
                                                            <button type="button" onClick={() => handleDeleteDetail(idx)} className="text-red-500 hover:text-red-700 cursor-pointer">
                                                                Xóa
                                                            </button>
                                                        </td>
                                                    )}
                                                </tr>
                                            ))}
                                            {(laborReport.accidentDetails || []).length === 0 && (
                                                <tr>
                                                    <td colSpan={mode !== "view" ? 7 : 6} className="py-6 text-center text-gray-400 italic">
                                                        Chưa khai báo chi tiết vụ tai nạn nào (Số liệu tổng bên trên được điền thủ công)
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 3: Support Report (Non-Contract workers) */}
                    {activeTab === "non-contract" && (
                        <div className="space-y-6 max-w-4xl mx-auto">
                            <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm space-y-4">
                                <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider border-b pb-2">1. Tổng số vụ tai nạn lao động và số nạn nhân (Không có HĐLĐ)</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                                    <InputField
                                        label="TỔNG SỐ VỤ TNLĐ"
                                        type="number"
                                        disabled={mode === "view"}
                                        value={supportReport.totalAccidentCases ? supportReport.totalAccidentCases.toString() : ""}
                                        onChange={(e) => setSupportReport((prev) => ({ ...prev, totalAccidentCases: Math.max(0, Number(e.target.value)) }))}
                                        placeholder="0"
                                        size="sm"
                                    />
                                    <InputField
                                        label="SỐ VỤ CÓ NGƯỜI CHẾT"
                                        type="number"
                                        disabled={mode === "view"}
                                        value={supportReport.totalCasesWithDeath ? supportReport.totalCasesWithDeath.toString() : ""}
                                        onChange={(e) => setSupportReport((prev) => ({ ...prev, totalCasesWithDeath: Math.max(0, Number(e.target.value)) }))}
                                        placeholder="0"
                                        size="sm"
                                    />
                                    <InputField
                                        label="SỐ VỤ CÓ TỪ 2 NẠN NHÂN TRỞ LÊN"
                                        type="number"
                                        disabled={mode === "view"}
                                        value={supportReport.totalCasesWithTwoOrMoreVictims ? supportReport.totalCasesWithTwoOrMoreVictims.toString() : ""}
                                        onChange={(e) => setSupportReport((prev) => ({ ...prev, totalCasesWithTwoOrMoreVictims: Math.max(0, Number(e.target.value)) }))}
                                        placeholder="0"
                                        size="sm"
                                    />
                                    <InputField
                                        label="TỔNG SỐ NGƯỜI BỊ NẠN"
                                        type="number"
                                        disabled={mode === "view"}
                                        value={supportReport.totalVictims ? supportReport.totalVictims.toString() : ""}
                                        onChange={(e) => setSupportReport((prev) => ({ ...prev, totalVictims: Math.max(0, Number(e.target.value)) }))}
                                        placeholder="0"
                                        size="sm"
                                    />
                                    <InputField
                                        label="TRONG ĐÓ: LAO ĐỘNG NỮ"
                                        type="number"
                                        disabled={mode === "view"}
                                        value={supportReport.totalFemaleVictims ? supportReport.totalFemaleVictims.toString() : ""}
                                        onChange={(e) => setSupportReport((prev) => ({ ...prev, totalFemaleVictims: Math.max(0, Number(e.target.value)) }))}
                                        placeholder="0"
                                        size="sm"
                                    />
                                    <InputField
                                        label="SỐ NGƯỜI CHẾT"
                                        type="number"
                                        disabled={mode === "view"}
                                        value={supportReport.totalDeaths ? supportReport.totalDeaths.toString() : ""}
                                        onChange={(e) => setSupportReport((prev) => ({ ...prev, totalDeaths: Math.max(0, Number(e.target.value)) }))}
                                        placeholder="0"
                                        size="sm"
                                    />
                                    <InputField
                                        label="SỐ NGƯỜI BỊ THƯƠNG NẶNG"
                                        type="number"
                                        disabled={mode === "view"}
                                        value={supportReport.totalSeriouslyInjured ? supportReport.totalSeriouslyInjured.toString() : ""}
                                        onChange={(e) => setSupportReport((prev) => ({ ...prev, totalSeriouslyInjured: Math.max(0, Number(e.target.value)) }))}
                                        placeholder="0"
                                        size="sm"
                                    />
                                </div>

                                <h4 className="text-[11px] font-bold text-blue-700 uppercase tracking-wide border-t pt-3">Số người bị nạn không thuộc diện quản lý</h4>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
                                    <InputField
                                        label="SỐ NGƯỜI BỊ NẠN"
                                        type="number"
                                        disabled={mode === "view"}
                                        value={supportReport.unmanagedVictims ? supportReport.unmanagedVictims.toString() : ""}
                                        onChange={(e) => setSupportReport((prev) => ({ ...prev, unmanagedVictims: Math.max(0, Number(e.target.value)) }))}
                                        placeholder="0"
                                        size="sm"
                                    />
                                    <InputField
                                        label="LAO ĐỘNG NỮ"
                                        type="number"
                                        disabled={mode === "view"}
                                        value={supportReport.unmanagedFemaleVictims ? supportReport.unmanagedFemaleVictims.toString() : ""}
                                        onChange={(e) => setSupportReport((prev) => ({ ...prev, unmanagedFemaleVictims: Math.max(0, Number(e.target.value)) }))}
                                        placeholder="0"
                                        size="sm"
                                    />
                                    <InputField
                                        label="SỐ NGƯỜI CHẾT"
                                        type="number"
                                        disabled={mode === "view"}
                                        value={supportReport.unmanagedDeaths ? supportReport.unmanagedDeaths.toString() : ""}
                                        onChange={(e) => setSupportReport((prev) => ({ ...prev, unmanagedDeaths: Math.max(0, Number(e.target.value)) }))}
                                        placeholder="0"
                                        size="sm"
                                    />
                                    <InputField
                                        label="BỊ THƯƠNG NẶNG"
                                        type="number"
                                        disabled={mode === "view"}
                                        value={supportReport.unmanagedSeriouslyInjured ? supportReport.unmanagedSeriouslyInjured.toString() : ""}
                                        onChange={(e) => setSupportReport((prev) => ({ ...prev, unmanagedSeriouslyInjured: Math.max(0, Number(e.target.value)) }))}
                                        placeholder="0"
                                        size="sm"
                                    />
                                </div>
                            </div>

                            <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm space-y-4">
                                <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider border-b pb-2">2. Thiệt hại do tai nạn lao động (Không có HĐLĐ)</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                                    <InputField
                                        label="CHI PHÍ Y TẾ (VNĐ)"
                                        type="number"
                                        disabled={mode === "view"}
                                        value={supportReport.medicalCost ? supportReport.medicalCost.toString() : ""}
                                        onChange={(e) => setSupportReport((prev) => ({ ...prev, medicalCost: Math.max(0, Number(e.target.value)) }))}
                                        placeholder="0"
                                        size="sm"
                                    />
                                    <InputField
                                        label="LƯƠNG TRONG THỜI GIAN ĐIỀU TRỊ (VNĐ)"
                                        type="number"
                                        disabled={mode === "view"}
                                        value={supportReport.salaryDuringTreatment ? supportReport.salaryDuringTreatment.toString() : ""}
                                        onChange={(e) => setSupportReport((prev) => ({ ...prev, salaryDuringTreatment: Math.max(0, Number(e.target.value)) }))}
                                        placeholder="0"
                                        size="sm"
                                    />
                                    <InputField
                                        label="CHI PHÍ BỒI THƯỜNG TRỢ CẤP (VNĐ)"
                                        type="number"
                                        disabled={mode === "view"}
                                        value={supportReport.compensationCost ? supportReport.compensationCost.toString() : ""}
                                        onChange={(e) => setSupportReport((prev) => ({ ...prev, compensationCost: Math.max(0, Number(e.target.value)) }))}
                                        placeholder="0"
                                        size="sm"
                                    />
                                    <InputField
                                        label="THIỆT HẠI TÀI SẢN (VNĐ)"
                                        type="number"
                                        disabled={mode === "view"}
                                        value={supportReport.propertyDamage ? supportReport.propertyDamage.toString() : ""}
                                        onChange={(e) => setSupportReport((prev) => ({ ...prev, propertyDamage: Math.max(0, Number(e.target.value)) }))}
                                        placeholder="0"
                                        size="sm"
                                    />
                                    <InputField
                                        label="SỐ NGÀY NGHỈ BỆNH/ĐIỀU TRỊ"
                                        type="number"
                                        disabled={mode === "view"}
                                        value={supportReport.totalSickDays ? supportReport.totalSickDays.toString() : ""}
                                        onChange={(e) => setSupportReport((prev) => ({ ...prev, totalSickDays: Math.max(0, Number(e.target.value)) }))}
                                        placeholder="0"
                                        size="sm"
                                    />
                                    <InputField
                                        label="TỔNG CHI PHÍ THIỆT HẠI (AUTO SUM)"
                                        disabled
                                        value={(supportReport.totalCost || 0).toLocaleString()}
                                        size="sm"
                                        className="font-bold text-blue-700 disabled:bg-gray-100"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Modal Footer */}
                <div className="shrink-0 px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-3">
                    {mode === "view" ? (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onClose}
                            className="px-5 py-2 border-gray-300 text-gray-700 hover:bg-gray-100 text-xs font-bold"
                        >
                            Đóng
                        </Button>
                    ) : (
                        <>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={onClose}
                                className="border-none bg-transparent hover:bg-gray-100 text-gray-600 hover:text-gray-800 text-xs font-semibold px-5 py-2"
                            >
                                Hủy bỏ
                            </Button>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleSave("đang báo cáo")}
                                className="gap-1.5 border-gray-300 text-gray-700 hover:bg-gray-50 text-xs font-bold px-4 py-2"
                            >
                                <Save size={14} />
                                <span>Lưu nháp</span>
                            </Button>

                            <Button
                                variant="primary"
                                size="sm"
                                onClick={() => handleSave("đã tiếp nhận")}
                                className="gap-1.5 text-xs font-bold px-4 py-2 shadow-sm"
                            >
                                <Send size={14} />
                                <span>Gửi báo cáo</span>
                            </Button>
                        </>
                    )}
                </div>
            </div>

            {/* Accident Detail Add/Edit Pop-up */}
            <AccidentDetailModal isOpen={showDetailForm} onClose={() => setShowDetailForm(false)} onSubmit={handleDetailSubmit} initialData={editingDetailData} />
        </div>
    );
}
