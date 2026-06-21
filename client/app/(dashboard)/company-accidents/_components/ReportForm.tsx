"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ChevronDown, ChevronUp, Trash2, Plus, Save, Send, X } from "lucide-react";
import type { Report, CreateReportPayload, UpdateReportPayload, LaborAccidentReport, LaborAccidentSupportReport, AccidentDetail } from "@/types/report";
import { CAUSES, FACTORS, OCCUPATIONS, initialLaborReport, initialSupportReport } from "./constants";
import { ReportApi } from "@/api/report";
import { toast } from "sonner";
import axios from "axios";
import CancelPopup from "@/components/popup/cancel-popup";
import Button from "@/components/ui/Button";

// Helpers for number formatting with dot separators (e.g. 10.000.000)
const formatNumber = (val: number | string | undefined | null): string => {
    if (val === undefined || val === null || val === "") return "";
    const num = Number(val);
    if (isNaN(num)) return "";
    return num.toLocaleString("vi-VN");
};

const parseNumber = (val: string): number => {
    const clean = val.replace(/\./g, "").replace(/,/g, "");
    const num = Number(clean);
    return isNaN(num) ? 0 : num;
};

interface FormInputProps {
    label: string;
    value: string | number;
    onChange?: (val: string) => void;
    type?: string;
    disabled?: boolean;
    required?: boolean;
    suffix?: string;
}

const FormInput: React.FC<FormInputProps> = ({ label, value, onChange, type = "text", disabled = false, required = false, suffix }) => {
    return (
        <div className="relative flex items-center">
            <label className="absolute left-2.5 top-0 -translate-y-1/2 bg-white px-1 text-[10px] text-gray-400 font-semibold tracking-wide z-10">
                {label}
                {required && <span className="text-red-500 ml-0.5">*</span>}
            </label>
            <input
                type={type}
                disabled={disabled}
                value={value ?? ""}
                onChange={(e) => onChange && onChange(e.target.value)}
                className={`w-full bg-white border border-gray-200 rounded px-3 py-2 text-xs outline-none focus:border-blue-500 font-semibold text-gray-800 disabled:bg-gray-50/50 disabled:text-gray-500 disabled:cursor-not-allowed ${suffix ? "pr-16" : ""}`}
            />
            {suffix && <span className="absolute right-3 text-[10px] text-gray-400 font-semibold pointer-events-none">{suffix}</span>}
        </div>
    );
};

interface FormSelectProps {
    label: string;
    value: string;
    onChange: (val: string) => void;
    options: string[];
    disabled?: boolean;
    required?: boolean;
}

const FormSelect: React.FC<FormSelectProps> = ({ label, value, onChange, options, disabled = false, required = false }) => {
    return (
        <div className="relative">
            <label className="absolute left-2.5 top-0 -translate-y-1/2 bg-white px-1 text-[10px] text-gray-400 font-semibold tracking-wide z-10">
                {label}
                {required && <span className="text-red-500 ml-0.5">*</span>}
            </label>
            <select
                disabled={disabled}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded px-3 py-2.5 text-xs outline-none focus:border-blue-500 font-semibold text-gray-800 appearance-none pr-10 cursor-pointer disabled:bg-gray-50/50 disabled:text-gray-500 disabled:cursor-not-allowed"
            >
                {options.map((opt) => (
                    <option key={opt} value={opt}>
                        {opt}
                    </option>
                ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 size-4 pointer-events-none" />
        </div>
    );
};

interface ReportFormProps {
    mode: "create" | "edit" | "view";
    report: Report | null;
    businessProfile: { name: string; taxCode: string; businessType?: string; industry?: string } | null;
    existingReports: Report[];
    onSaveSuccess: () => void;
    onClose: () => void;
    registerTriggers: (triggers: { save: () => void; continue: () => void; cancel: () => void; setYear: (y: number) => void; year: number; selectedSection: string; print: () => void }) => void;
}

type ReportSection = "Thông tin doanh nghiệp" | "1. Tai nạn lao động" | "2. Tai nạn lao động được hưởng trợ cấp theo quy định tại Khoản 2 Điều 39 Luật ATVSLĐ" | "Xem tổng quan báo cáo tai nạn lao động";

export default function ReportForm({ mode, report, businessProfile, existingReports, onSaveSuccess, onClose, registerTriggers }: ReportFormProps) {
    const [selectedSection, setSelectedSection] = useState<ReportSection>("Thông tin doanh nghiệp");
    const [activeSubTab, setActiveSubTab] = useState<"summary" | "details">("summary");

    // Form fields state
    const [formYear, setFormYear] = useState<number>(new Date().getFullYear());
    const [formPeriod, setFormPeriod] = useState<string>("6 tháng");
    const [totalEmployees, setTotalEmployees] = useState<number>(0);
    const [totalFemaleEmployees, setTotalFemaleEmployees] = useState<number>(0);
    const [totalSalary, setTotalSalary] = useState<number>(0);

    const [laborReport, setLaborReport] = useState<LaborAccidentReport>(initialLaborReport());
    const [supportReport, setSupportReport] = useState<LaborAccidentSupportReport>(initialSupportReport());

    // Accident detail accordions expanded state index
    const [expandedDetailIndex, setExpandedDetailIndex] = useState<number | null>(0);

    // Stamped PDF state
    const [stampedFile, setStampedFile] = useState<File | null>(null);

    // Dialog flags
    const [showCancelDialog, setShowCancelDialog] = useState(false);
    const [showSaveDialog, setShowSaveDialog] = useState(false);

    // Prepopulate/Reset on report change
    useEffect(() => {
        Promise.resolve().then(() => {
            if (mode === "create") {
                setFormYear(new Date().getFullYear());
                setFormPeriod("6 tháng");
                setTotalEmployees(0);
                setTotalFemaleEmployees(0);
                setTotalSalary(0);
                setLaborReport(initialLaborReport());
                setSupportReport(initialSupportReport());
                setSelectedSection("Thông tin doanh nghiệp");
                setActiveSubTab("summary");
                setStampedFile(null);
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
                setSelectedSection("Thông tin doanh nghiệp");
                setActiveSubTab("summary");
                setStampedFile(null);
            }
        });
    }, [mode, report]);

    // Sum total cost for reports
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

    // Calculate sum from details list
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

    // Keep parent totals synchronized with detail rows
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

    // Validation
    const validateForm = (): boolean => {
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

        // Check details for occupations
        if (laborReport.accidentDetails && laborReport.accidentDetails.length > 0) {
            for (let i = 0; i < laborReport.accidentDetails.length; i++) {
                const detail = laborReport.accidentDetails[i];
                if (!detail.occupationCategory || !detail.occupationCategory.trim()) {
                    toast.error(`Vui lòng chọn nghề nghiệp cho vụ tai nạn số ${i + 1}`);
                    return false;
                }
                if (!validateSummary(detail, `Vụ tai nạn số ${i + 1}`)) return false;
            }
        }

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

    // Header navigation triggers
    const handleContinue = useCallback(() => {
        if (selectedSection === "Thông tin doanh nghiệp") {
            setSelectedSection("1. Tai nạn lao động");
        } else if (selectedSection === "1. Tai nạn lao động") {
            setSelectedSection("2. Tai nạn lao động được hưởng trợ cấp theo quy định tại Khoản 2 Điều 39 Luật ATVSLĐ");
        } else if (selectedSection === "2. Tai nạn lao động được hưởng trợ cấp theo quy định tại Khoản 2 Điều 39 Luật ATVSLĐ") {
            setSelectedSection("Xem tổng quan báo cáo tai nạn lao động");
        } else {
            toast.info("Đã đến mục báo cáo cuối cùng");
        }
    }, [selectedSection]);

    const handleCancelTrigger = useCallback(() => {
        if (mode === "view") {
            onClose();
        } else {
            setShowCancelDialog(true);
        }
    }, [mode, onClose]);

    const handleSaveTrigger = useCallback(() => {
        if (mode === "view") return;
        setShowSaveDialog(true);
    }, [mode]);

    const handlePrint = useCallback(() => {
        window.print();
    }, []);

    // Keep callback refs so they are always current, avoiding infinite loops from parent re-renders
    const saveRef = React.useRef(handleSaveTrigger);
    const continueRef = React.useRef(handleContinue);
    const cancelRef = React.useRef(handleCancelTrigger);
    const setYearRef = React.useRef(setFormYear);
    const printRef = React.useRef(handlePrint);

    // Update refs in an effect to avoid mutating refs during render
    useEffect(() => {
        saveRef.current = handleSaveTrigger;
        continueRef.current = handleContinue;
        cancelRef.current = handleCancelTrigger;
        setYearRef.current = setFormYear;
        printRef.current = handlePrint;
    }, [handleSaveTrigger, handleContinue, handleCancelTrigger, setFormYear, handlePrint]);

    useEffect(() => {
        registerTriggers({
            save: () => saveRef.current(),
            continue: () => continueRef.current(),
            cancel: () => cancelRef.current(),
            setYear: (y) => setYearRef.current(y),
            year: formYear,
            selectedSection,
            print: () => printRef.current(),
        });
    }, [registerTriggers, formYear, selectedSection]);

    // Detail Accordion manipulation
    const handleAddDetail = () => {
        const newDetail: AccidentDetail = {
            accidentCause: CAUSES[0],
            injuryFactor: FACTORS[0],
            occupationCategory: OCCUPATIONS[0],
            totalAccidentCases: 1,
            totalCasesWithDeath: 0,
            totalCasesWithTwoOrMoreVictims: 0,
            totalVictims: 1,
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

        const updatedDetails = [...(laborReport.accidentDetails || []), newDetail];
        setLaborReport((prev) => ({ ...prev, accidentDetails: updatedDetails }));
        setExpandedDetailIndex(updatedDetails.length - 1);
        toast.success(`Đã thêm chi tiết vụ tai nạn số ${updatedDetails.length}`);
    };

    const handleDeleteDetail = (index: number, e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm(`Bạn có chắc chắn muốn xóa chi tiết vụ tai nạn số ${index + 1}?`)) {
            const updatedDetails = (laborReport.accidentDetails || []).filter((_, idx) => idx !== index);
            setLaborReport((prev) => ({ ...prev, accidentDetails: updatedDetails }));
            if (expandedDetailIndex === index) {
                setExpandedDetailIndex(updatedDetails.length > 0 ? 0 : null);
            } else if (expandedDetailIndex !== null && expandedDetailIndex > index) {
                setExpandedDetailIndex(expandedDetailIndex - 1);
            }
            toast.success(`Đã xóa chi tiết vụ tai nạn số ${index + 1}`);
        }
    };

    const handleDetailFieldChange = (index: number, field: keyof AccidentDetail, val: string | number | undefined) => {
        const updatedDetails = [...(laborReport.accidentDetails || [])];
        updatedDetails[index] = {
            ...updatedDetails[index],
            [field]: val,
        };
        setLaborReport((prev) => ({ ...prev, accidentDetails: updatedDetails }));
    };

    // Stamped PDF upload handler
    const handleStampedFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
                toast.error("Chỉ chấp nhận file PDF");
                return;
            }
            setStampedFile(file);
            toast.success("Đã đính kèm file mộc: " + file.name);
        }
    };

    // Overview statistics helpers
    const getCauseStats = (causeName: string) => {
        const stats = {
            cases: 0,
            deathCases: 0,
            twoVictimsCases: 0,
            victims: 0,
            unmanagedVictims: 0,
            femaleVictims: 0,
            unmanagedFemale: 0,
            deaths: 0,
            unmanagedDeaths: 0,
            serious: 0,
            unmanagedSerious: 0,
        };
        (laborReport.accidentDetails || []).forEach((d) => {
            if (d.accidentCause === causeName) {
                stats.cases += Number(d.totalAccidentCases || 0);
                stats.deathCases += Number(d.totalCasesWithDeath || 0);
                stats.twoVictimsCases += Number(d.totalCasesWithTwoOrMoreVictims || 0);
                stats.victims += Number(d.totalVictims || 0);
                stats.unmanagedVictims += Number(d.unmanagedVictims || 0);
                stats.femaleVictims += Number(d.totalFemaleVictims || 0);
                stats.unmanagedFemale += Number(d.unmanagedFemaleVictims || 0);
                stats.deaths += Number(d.totalDeaths || 0);
                stats.unmanagedDeaths += Number(d.unmanagedDeaths || 0);
                stats.serious += Number(d.totalSeriouslyInjured || 0);
                stats.unmanagedSerious += Number(d.unmanagedSeriouslyInjured || 0);
            }
        });
        return stats;
    };

    const getFactorStats = (factorName: string) => {
        const stats = {
            cases: 0,
            deathCases: 0,
            twoVictimsCases: 0,
            victims: 0,
            unmanagedVictims: 0,
            femaleVictims: 0,
            unmanagedFemale: 0,
            deaths: 0,
            unmanagedDeaths: 0,
            serious: 0,
            unmanagedSerious: 0,
        };
        (laborReport.accidentDetails || []).forEach((d) => {
            if (d.injuryFactor === factorName) {
                stats.cases += Number(d.totalAccidentCases || 0);
                stats.deathCases += Number(d.totalCasesWithDeath || 0);
                stats.twoVictimsCases += Number(d.totalCasesWithTwoOrMoreVictims || 0);
                stats.victims += Number(d.totalVictims || 0);
                stats.unmanagedVictims += Number(d.unmanagedVictims || 0);
                stats.femaleVictims += Number(d.totalFemaleVictims || 0);
                stats.unmanagedFemale += Number(d.unmanagedFemaleVictims || 0);
                stats.deaths += Number(d.totalDeaths || 0);
                stats.unmanagedDeaths += Number(d.unmanagedDeaths || 0);
                stats.serious += Number(d.totalSeriouslyInjured || 0);
                stats.unmanagedSerious += Number(d.unmanagedSeriouslyInjured || 0);
            }
        });
        return stats;
    };

    const getOccupationStats = (occName: string) => {
        const stats = {
            cases: 0,
            deathCases: 0,
            twoVictimsCases: 0,
            victims: 0,
            unmanagedVictims: 0,
            femaleVictims: 0,
            unmanagedFemale: 0,
            deaths: 0,
            unmanagedDeaths: 0,
            serious: 0,
            unmanagedSerious: 0,
        };
        (laborReport.accidentDetails || []).forEach((d) => {
            if (d.occupationCategory === occName) {
                stats.cases += Number(d.totalAccidentCases || 0);
                stats.deathCases += Number(d.totalCasesWithDeath || 0);
                stats.twoVictimsCases += Number(d.totalCasesWithTwoOrMoreVictims || 0);
                stats.victims += Number(d.totalVictims || 0);
                stats.unmanagedVictims += Number(d.unmanagedVictims || 0);
                stats.femaleVictims += Number(d.totalFemaleVictims || 0);
                stats.unmanagedFemale += Number(d.unmanagedFemaleVictims || 0);
                stats.deaths += Number(d.totalDeaths || 0);
                stats.unmanagedDeaths += Number(d.unmanagedDeaths || 0);
                stats.serious += Number(d.totalSeriouslyInjured || 0);
                stats.unmanagedSerious += Number(d.unmanagedSeriouslyInjured || 0);
            }
        });
        return stats;
    };

    const laborStats = {
        cases: Number(laborReport.totalAccidentCases || 0),
        deathCases: Number(laborReport.totalCasesWithDeath || 0),
        twoVictimsCases: Number(laborReport.totalCasesWithTwoOrMoreVictims || 0),
        victims: Number(laborReport.totalVictims || 0),
        unmanagedVictims: Number(laborReport.unmanagedVictims || 0),
        femaleVictims: Number(laborReport.totalFemaleVictims || 0),
        unmanagedFemale: Number(laborReport.unmanagedFemaleVictims || 0),
        deaths: Number(laborReport.totalDeaths || 0),
        unmanagedDeaths: Number(laborReport.unmanagedDeaths || 0),
        serious: Number(laborReport.totalSeriouslyInjured || 0),
        unmanagedSerious: Number(laborReport.unmanagedSeriouslyInjured || 0),
    };

    const supportStats = {
        cases: Number(supportReport.totalAccidentCases || 0),
        deathCases: Number(supportReport.totalCasesWithDeath || 0),
        twoVictimsCases: Number(supportReport.totalCasesWithTwoOrMoreVictims || 0),
        victims: Number(supportReport.totalVictims || 0),
        unmanagedVictims: Number(supportReport.unmanagedVictims || 0),
        femaleVictims: Number(supportReport.totalFemaleVictims || 0),
        unmanagedFemale: Number(supportReport.unmanagedFemaleVictims || 0),
        deaths: Number(supportReport.totalDeaths || 0),
        unmanagedDeaths: Number(supportReport.unmanagedDeaths || 0),
        serious: Number(supportReport.totalSeriouslyInjured || 0),
        unmanagedSerious: Number(supportReport.unmanagedSeriouslyInjured || 0),
    };

    const totalStats = {
        cases: laborStats.cases + supportStats.cases,
        deathCases: laborStats.deathCases + supportStats.deathCases,
        twoVictimsCases: laborStats.twoVictimsCases + supportStats.twoVictimsCases,
        victims: laborStats.victims + supportStats.victims,
        unmanagedVictims: laborStats.unmanagedVictims + supportStats.unmanagedVictims,
        femaleVictims: laborStats.femaleVictims + supportStats.femaleVictims,
        unmanagedFemale: laborStats.unmanagedFemale + supportStats.unmanagedFemale,
        deaths: laborStats.deaths + supportStats.deaths,
        unmanagedDeaths: laborStats.unmanagedDeaths + supportStats.unmanagedDeaths,
        serious: laborStats.serious + supportStats.serious,
        unmanagedSerious: laborStats.unmanagedSerious + supportStats.unmanagedSerious,
    };

    return (
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm flex flex-col flex-1 min-h-0 overflow-hidden mt-2 p-6">
            {/* Custom Print Style to isolate only the A4 document content */}
            <style jsx global>{`
                @media print {
                    body * {
                        visibility: hidden !important;
                    }
                    #print-section,
                    #print-section * {
                        visibility: visible !important;
                    }
                    #print-section {
                        position: absolute !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 100% !important;
                        padding: 0 !important;
                        margin: 0 !important;
                        border: none !important;
                        box-shadow: none !important;
                    }
                }
            `}</style>

            {/* Form Section Dropdown Selector */}
            <div className="mb-6 max-w-xl print:hidden">
                <FormSelect
                    label="Chọn mục báo cáo"
                    value={selectedSection}
                    onChange={(val) => setSelectedSection(val as ReportSection)}
                    options={["Thông tin doanh nghiệp", "1. Tai nạn lao động", "2. Tai nạn lao động được hưởng trợ cấp theo quy định tại Khoản 2 Điều 39 Luật ATVSLĐ", "Xem tổng quan báo cáo tai nạn lao động"]}
                    disabled={false}
                />
            </div>

            {/* Form Scrollable Body */}
            <div className="flex-1 overflow-y-auto pr-2 space-y-6 min-h-0">
                {/* 1. SECTION: Thông tin doanh nghiệp */}
                {selectedSection === "Thông tin doanh nghiệp" && (
                    <div className="space-y-6 print:hidden">
                        <div className="border-b border-gray-150 pb-2">
                            <h2 className="text-sm font-bold text-gray-800">1. Thông tin công ty</h2>
                        </div>

                        <p className="text-[11px] font-bold text-red-500">*** Lưu ý: nhập tổng quỹ lương 6 tháng khi khai báo TNLĐ 6 tháng hoặc tổng quỹ lương 12 tháng khi khai báo TNLĐ cả năm</p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                            <FormInput label="Tên công ty" value={businessProfile?.name || ""} disabled={true} />
                            <FormInput label="Loại hình công ty" value={businessProfile?.businessType || "Doanh nghiệp tư nhân"} disabled={true} />
                            <FormInput label="Ngành nghề kinh doanh" value={businessProfile?.industry || "Chưa xác định"} disabled={true} />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                            <FormInput label="Tổng số lao động của cơ sở" value={totalEmployees || ""} onChange={(val) => setTotalEmployees(Math.max(0, Number(val)))} type="number" required={true} disabled={mode === "view"} />
                            <FormInput label="Tổng số lao động nữ" value={totalFemaleEmployees || ""} onChange={(val) => setTotalFemaleEmployees(Math.max(0, Number(val)))} type="number" required={true} disabled={mode === "view"} />
                            <FormInput label="Tổng quỹ lương" value={formatNumber(totalSalary)} onChange={(val) => setTotalSalary(parseNumber(val))} required={true} disabled={mode === "view"} suffix="(1.000đ)" />
                        </div>
                    </div>
                )}

                {/* 2. SECTION: 1. Tai nạn lao động (có HĐLĐ) */}
                {selectedSection === "1. Tai nạn lao động" && (
                    <div className="space-y-4 print:hidden">
                        {/* Sub Tabs */}
                        <div className="flex gap-6 border-b border-gray-200">
                            <button
                                type="button"
                                onClick={() => setActiveSubTab("summary")}
                                className={`pb-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer ${activeSubTab === "summary" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
                            >
                                (1) Tổng số vụ tai nạn lao động
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveSubTab("details")}
                                className={`pb-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer ${activeSubTab === "details" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
                            >
                                (2) Chi tiết các vụ tai nạn lao động
                            </button>
                        </div>

                        <p className="text-[11px] font-bold text-blue-600 italic">**** Doanh nghiệp xảy ra tai nạn lao động vui lòng nhập theo từng bước</p>

                        {/* SUB-TAB 1: Summary fields */}
                        {activeSubTab === "summary" && (
                            <div className="space-y-6 pt-2">
                                {laborReport.accidentDetails && laborReport.accidentDetails.length > 0 && (
                                    <div className="bg-blue-50 border border-blue-200 rounded px-3 py-2 text-[10px] text-blue-800 font-semibold">
                                        Lưu ý: Số liệu tổng hợp bên dưới đang được tính tự động từ danh sách chi tiết các vụ tai nạn lao động.
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wide">1. Tổng số vụ tai nạn lao động & số nạn nhân tai nạn lao động</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <FormInput
                                            label="Tổng số vụ"
                                            value={laborReport.totalAccidentCases || ""}
                                            onChange={(val) => setLaborReport((prev) => ({ ...prev, totalAccidentCases: Math.max(0, Number(val)) }))}
                                            type="number"
                                            required={true}
                                            disabled={mode === "view" || (laborReport.accidentDetails || []).length > 0}
                                        />
                                        <FormInput
                                            label="Tổng số vụ có người chết"
                                            value={laborReport.totalCasesWithDeath || ""}
                                            onChange={(val) => setLaborReport((prev) => ({ ...prev, totalCasesWithDeath: Math.max(0, Number(val)) }))}
                                            type="number"
                                            required={true}
                                            disabled={mode === "view" || (laborReport.accidentDetails || []).length > 0}
                                        />
                                        <FormInput
                                            label="Tổng số vụ có 2 người bị nạn trở lên"
                                            value={laborReport.totalCasesWithTwoOrMoreVictims || ""}
                                            onChange={(val) => setLaborReport((prev) => ({ ...prev, totalCasesWithTwoOrMoreVictims: Math.max(0, Number(val)) }))}
                                            type="number"
                                            required={true}
                                            disabled={mode === "view" || (laborReport.accidentDetails || []).length > 0}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-2">
                                        <FormInput
                                            label="Tổng số người bị nạn"
                                            value={laborReport.totalVictims || ""}
                                            onChange={(val) => setLaborReport((prev) => ({ ...prev, totalVictims: Math.max(0, Number(val)) }))}
                                            type="number"
                                            required={true}
                                            disabled={mode === "view" || (laborReport.accidentDetails || []).length > 0}
                                        />
                                        <FormInput
                                            label="Tổng số lao động nữ bị nạn"
                                            value={laborReport.totalFemaleVictims || ""}
                                            onChange={(val) => setLaborReport((prev) => ({ ...prev, totalFemaleVictims: Math.max(0, Number(val)) }))}
                                            type="number"
                                            required={true}
                                            disabled={mode === "view" || (laborReport.accidentDetails || []).length > 0}
                                        />
                                        <FormInput
                                            label="Tổng số người bị chết"
                                            value={laborReport.totalDeaths || ""}
                                            onChange={(val) => setLaborReport((prev) => ({ ...prev, totalDeaths: Math.max(0, Number(val)) }))}
                                            type="number"
                                            required={true}
                                            disabled={mode === "view" || (laborReport.accidentDetails || []).length > 0}
                                        />
                                        <FormInput
                                            label="Tổng số người bị thương nặng"
                                            value={laborReport.totalSeriouslyInjured || ""}
                                            onChange={(val) => setLaborReport((prev) => ({ ...prev, totalSeriouslyInjured: Math.max(0, Number(val)) }))}
                                            type="number"
                                            required={true}
                                            disabled={mode === "view" || (laborReport.accidentDetails || []).length > 0}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-2">
                                        <FormInput
                                            label="Số người bị nạn không QL"
                                            value={laborReport.unmanagedVictims || 0}
                                            onChange={(val) => setLaborReport((prev) => ({ ...prev, unmanagedVictims: Math.max(0, Number(val)) }))}
                                            type="number"
                                            required={true}
                                            disabled={mode === "view" || (laborReport.accidentDetails || []).length > 0}
                                        />
                                        <FormInput
                                            label="Lao động nữ bị nạn không QL"
                                            value={laborReport.unmanagedFemaleVictims || 0}
                                            onChange={(val) => setLaborReport((prev) => ({ ...prev, unmanagedFemaleVictims: Math.max(0, Number(val)) }))}
                                            type="number"
                                            required={true}
                                            disabled={mode === "view" || (laborReport.accidentDetails || []).length > 0}
                                        />
                                        <FormInput
                                            label="Số người chết không QL"
                                            value={laborReport.unmanagedDeaths || 0}
                                            onChange={(val) => setLaborReport((prev) => ({ ...prev, unmanagedDeaths: Math.max(0, Number(val)) }))}
                                            type="number"
                                            required={true}
                                            disabled={mode === "view" || (laborReport.accidentDetails || []).length > 0}
                                        />
                                        <FormInput
                                            label="Người bị thương nặng không QL"
                                            value={laborReport.unmanagedSeriouslyInjured || 0}
                                            onChange={(val) => setLaborReport((prev) => ({ ...prev, unmanagedSeriouslyInjured: Math.max(0, Number(val)) }))}
                                            type="number"
                                            required={true}
                                            disabled={mode === "view" || (laborReport.accidentDetails || []).length > 0}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4 border-t border-gray-100 pt-6">
                                    <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wide">2. Thiệt hại do tai nạn lao động</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                        <FormInput
                                            label="Chi phí y tế"
                                            value={formatNumber(laborReport.medicalCost)}
                                            onChange={(val) => setLaborReport((prev) => ({ ...prev, medicalCost: parseNumber(val) }))}
                                            required={true}
                                            disabled={mode === "view" || (laborReport.accidentDetails || []).length > 0}
                                            suffix="(1.000đ)"
                                        />
                                        <FormInput
                                            label="Chi phí trả lương trong thời gian điều trị"
                                            value={formatNumber(laborReport.salaryDuringTreatment)}
                                            onChange={(val) => setLaborReport((prev) => ({ ...prev, salaryDuringTreatment: parseNumber(val) }))}
                                            required={true}
                                            disabled={mode === "view" || (laborReport.accidentDetails || []).length > 0}
                                            suffix="(1.000đ)"
                                        />
                                        <FormInput
                                            label="Chi phí bồi thường trợ cấp"
                                            value={formatNumber(laborReport.compensationCost)}
                                            onChange={(val) => setLaborReport((prev) => ({ ...prev, compensationCost: parseNumber(val) }))}
                                            required={true}
                                            disabled={mode === "view" || (laborReport.accidentDetails || []).length > 0}
                                            suffix="(1.000đ)"
                                        />
                                        <FormInput label="Tổng số tiền chi phí" value={formatNumber(laborReport.totalCost)} required={true} disabled={true} suffix="(1.000đ)" />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                                        <FormInput
                                            label="Tổng số ngày nghỉ vì TNLĐ"
                                            value={laborReport.totalSickDays || ""}
                                            onChange={(val) => setLaborReport((prev) => ({ ...prev, totalSickDays: Math.max(0, Number(val)) }))}
                                            type="number"
                                            required={true}
                                            disabled={mode === "view" || (laborReport.accidentDetails || []).length > 0}
                                        />
                                        <FormInput
                                            label="Thiệt hại tài sản"
                                            value={formatNumber(laborReport.propertyDamage)}
                                            onChange={(val) => setLaborReport((prev) => ({ ...prev, propertyDamage: parseNumber(val) }))}
                                            disabled={mode === "view" || (laborReport.accidentDetails || []).length > 0}
                                            suffix="(1.000đ)"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* SUB-TAB 2: Accident detail accordions list */}
                        {activeSubTab === "details" && (
                            <div className="space-y-4 pt-2">
                                {(laborReport.accidentDetails || []).map((detail, idx) => {
                                    const isExpanded = expandedDetailIndex === idx;
                                    return (
                                        <div key={idx} className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
                                            {/* Accordion Header */}
                                            <div
                                                onClick={() => setExpandedDetailIndex(isExpanded ? null : idx)}
                                                className="bg-gray-50/70 border-b border-gray-150 px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-gray-100/50 transition-colors"
                                            >
                                                <div className="flex items-center gap-2">
                                                    {isExpanded ? <ChevronUp size={16} className="text-gray-500" /> : <ChevronDown size={16} className="text-gray-500" />}
                                                    <span className="text-xs font-bold text-gray-800">Chi tiết vụ tai nạn số {idx + 1}</span>
                                                </div>
                                                {mode !== "view" && (
                                                    <button type="button" onClick={(e) => handleDeleteDetail(idx, e)} className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors" title="Xóa vụ tai nạn này">
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </div>

                                            {/* Accordion Body */}
                                            {isExpanded && (
                                                <div className="p-4 space-y-6">
                                                    {/* Dropdown selects */}
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        <FormSelect
                                                            label="1. Phân theo nguyên nhân xảy ra TNLĐ"
                                                            value={detail.accidentCause || ""}
                                                            onChange={(val) => handleDetailFieldChange(idx, "accidentCause", val)}
                                                            options={CAUSES}
                                                            disabled={mode === "view"}
                                                        />
                                                        <FormSelect
                                                            label="2. Phân theo yếu tố gây chấn thương"
                                                            value={detail.injuryFactor || ""}
                                                            onChange={(val) => handleDetailFieldChange(idx, "injuryFactor", val)}
                                                            options={FACTORS}
                                                            disabled={mode === "view"}
                                                        />
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        <FormSelect
                                                            label="3. Phân theo nghề nghiệp"
                                                            value={detail.occupationCategory || ""}
                                                            onChange={(val) => handleDetailFieldChange(idx, "occupationCategory", val)}
                                                            options={OCCUPATIONS}
                                                            disabled={mode === "view"}
                                                        />
                                                    </div>

                                                    {/* Detail count grid */}
                                                    <div className="space-y-4 border-t border-gray-100 pt-4">
                                                        <h4 className="text-xs font-bold text-gray-800">4. Chi tiết vụ tai nạn số {idx + 1}</h4>
                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                            <FormInput
                                                                label="Tổng số vụ"
                                                                value={detail.totalAccidentCases || ""}
                                                                onChange={(val) => handleDetailFieldChange(idx, "totalAccidentCases", Math.max(0, Number(val)))}
                                                                type="number"
                                                                required={true}
                                                                disabled={mode === "view"}
                                                            />
                                                            <FormInput
                                                                label="Tổng số vụ có người chết"
                                                                value={detail.totalCasesWithDeath || ""}
                                                                onChange={(val) => handleDetailFieldChange(idx, "totalCasesWithDeath", Math.max(0, Number(val)))}
                                                                type="number"
                                                                required={true}
                                                                disabled={mode === "view"}
                                                            />
                                                            <FormInput
                                                                label="Tổng số vụ có 2 người bị nạn trở lên"
                                                                value={detail.totalCasesWithTwoOrMoreVictims || ""}
                                                                onChange={(val) => handleDetailFieldChange(idx, "totalCasesWithTwoOrMoreVictims", Math.max(0, Number(val)))}
                                                                type="number"
                                                                required={true}
                                                                disabled={mode === "view"}
                                                            />
                                                        </div>

                                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-2">
                                                            <FormInput
                                                                label="Tổng số người bị nạn"
                                                                value={detail.totalVictims || ""}
                                                                onChange={(val) => handleDetailFieldChange(idx, "totalVictims", Math.max(0, Number(val)))}
                                                                type="number"
                                                                required={true}
                                                                disabled={mode === "view"}
                                                            />
                                                            <FormInput
                                                                label="Tổng số lao động nữ bị nạn"
                                                                value={detail.totalFemaleVictims || ""}
                                                                onChange={(val) => handleDetailFieldChange(idx, "totalFemaleVictims", Math.max(0, Number(val)))}
                                                                type="number"
                                                                required={true}
                                                                disabled={mode === "view"}
                                                            />
                                                            <FormInput
                                                                label="Tổng số người bị chết"
                                                                value={detail.totalDeaths || ""}
                                                                onChange={(val) => handleDetailFieldChange(idx, "totalDeaths", Math.max(0, Number(val)))}
                                                                type="number"
                                                                required={true}
                                                                disabled={mode === "view"}
                                                            />
                                                            <FormInput
                                                                label="Tổng số người bị thương nặng"
                                                                value={detail.totalSeriouslyInjured || ""}
                                                                onChange={(val) => handleDetailFieldChange(idx, "totalSeriouslyInjured", Math.max(0, Number(val)))}
                                                                type="number"
                                                                required={true}
                                                                disabled={mode === "view"}
                                                            />
                                                        </div>

                                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-2">
                                                            <FormInput
                                                                label="Số người bị nạn không QL"
                                                                value={detail.unmanagedVictims || 0}
                                                                onChange={(val) => handleDetailFieldChange(idx, "unmanagedVictims", Math.max(0, Number(val)))}
                                                                type="number"
                                                                required={true}
                                                                disabled={mode === "view"}
                                                            />
                                                            <FormInput
                                                                label="Lao động nữ bị nạn không QL"
                                                                value={detail.unmanagedFemaleVictims || 0}
                                                                onChange={(val) => handleDetailFieldChange(idx, "unmanagedFemaleVictims", Math.max(0, Number(val)))}
                                                                type="number"
                                                                required={true}
                                                                disabled={mode === "view"}
                                                            />
                                                            <FormInput
                                                                label="Số người chết không QL"
                                                                value={detail.unmanagedDeaths || 0}
                                                                onChange={(val) => handleDetailFieldChange(idx, "unmanagedDeaths", Math.max(0, Number(val)))}
                                                                type="number"
                                                                required={true}
                                                                disabled={mode === "view"}
                                                            />
                                                            <FormInput
                                                                label="Người bị thương nặng không QL"
                                                                value={detail.unmanagedSeriouslyInjured || 0}
                                                                onChange={(val) => handleDetailFieldChange(idx, "unmanagedSeriouslyInjured", Math.max(0, Number(val)))}
                                                                type="number"
                                                                required={true}
                                                                disabled={mode === "view"}
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Detail cost grid */}
                                                    <div className="space-y-4 border-t border-gray-100 pt-4">
                                                        <h4 className="text-xs font-bold text-gray-800">5. Thiệt hại do tai nạn lao động số {idx + 1}</h4>
                                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                                            <FormInput
                                                                label="Chi phí y tế"
                                                                value={formatNumber(detail.medicalCost)}
                                                                onChange={(val) => handleDetailFieldChange(idx, "medicalCost", parseNumber(val))}
                                                                required={true}
                                                                disabled={mode === "view"}
                                                                suffix="(1.000đ)"
                                                            />
                                                            <FormInput
                                                                label="Chi phí trả lương trong thời gian điều trị"
                                                                value={formatNumber(detail.salaryDuringTreatment)}
                                                                onChange={(val) => handleDetailFieldChange(idx, "salaryDuringTreatment", parseNumber(val))}
                                                                required={true}
                                                                disabled={mode === "view"}
                                                                suffix="(1.000đ)"
                                                            />
                                                            <FormInput
                                                                label="Chi phí bồi thường trợ cấp"
                                                                value={formatNumber(detail.compensationCost)}
                                                                onChange={(val) => handleDetailFieldChange(idx, "compensationCost", parseNumber(val))}
                                                                required={true}
                                                                disabled={mode === "view"}
                                                                suffix="(1.000đ)"
                                                            />
                                                            <FormInput
                                                                label="Tổng số tiền chi phí"
                                                                value={formatNumber(Number(detail.medicalCost || 0) + Number(detail.salaryDuringTreatment || 0) + Number(detail.compensationCost || 0))}
                                                                required={true}
                                                                disabled={true}
                                                                suffix="(1.000đ)"
                                                            />
                                                        </div>

                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                                                            <FormInput
                                                                label="Tổng số ngày nghỉ vì TNLĐ"
                                                                value={detail.totalSickDays || ""}
                                                                onChange={(val) => handleDetailFieldChange(idx, "totalSickDays", Math.max(0, Number(val)))}
                                                                type="number"
                                                                required={true}
                                                                disabled={mode === "view"}
                                                            />
                                                            <FormInput
                                                                label="Thiệt hại tài sản"
                                                                value={formatNumber(detail.propertyDamage)}
                                                                onChange={(val) => handleDetailFieldChange(idx, "propertyDamage", parseNumber(val))}
                                                                disabled={mode === "view"}
                                                                suffix="(1.000đ)"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}

                                {laborReport.accidentDetails?.length === 0 && (
                                    <div className="text-center py-8 border border-dashed border-gray-200 rounded-lg text-gray-400 text-xs italic">Chưa có chi tiết vụ tai nạn nào được khai báo (Số liệu tổng hợp sẽ được nhập thủ công ở Tab 1)</div>
                                )}

                                {mode !== "view" && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleAddDetail}
                                        className="w-full py-2.5 border-dashed border-blue-300 text-blue-600 hover:bg-blue-50/50 text-xs font-bold gap-1.5 mt-2"
                                    >
                                        <Plus size={14} />
                                        <span>Thêm chi tiết vụ tai nạn</span>
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* 3. SECTION: 2. Tai nạn lao động được hưởng trợ cấp ... (Không HĐLĐ) */}
                {selectedSection === "2. Tai nạn lao động được hưởng trợ cấp theo quy định tại Khoản 2 Điều 39 Luật ATVSLĐ" && (
                    <div className="space-y-6 print:hidden">
                        <div className="space-y-4">
                            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wide">1. Tổng số vụ tai nạn lao động & số nạn nhân tai nạn lao động</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <FormInput
                                    label="Tổng số vụ"
                                    value={supportReport.totalAccidentCases || ""}
                                    onChange={(val) => setSupportReport((prev) => ({ ...prev, totalAccidentCases: Math.max(0, Number(val)) }))}
                                    type="number"
                                    required={true}
                                    disabled={mode === "view"}
                                />
                                <FormInput
                                    label="Tổng số vụ có người chết"
                                    value={supportReport.totalCasesWithDeath || ""}
                                    onChange={(val) => setSupportReport((prev) => ({ ...prev, totalCasesWithDeath: Math.max(0, Number(val)) }))}
                                    type="number"
                                    required={true}
                                    disabled={mode === "view"}
                                />
                                <FormInput
                                    label="Tổng số vụ có từ 2 nạn nhân trở lên"
                                    value={supportReport.totalCasesWithTwoOrMoreVictims || ""}
                                    onChange={(val) => setSupportReport((prev) => ({ ...prev, totalCasesWithTwoOrMoreVictims: Math.max(0, Number(val)) }))}
                                    type="number"
                                    required={true}
                                    disabled={mode === "view"}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-2">
                                <FormInput
                                    label="Tổng số người bị nạn"
                                    value={supportReport.totalVictims || ""}
                                    onChange={(val) => setSupportReport((prev) => ({ ...prev, totalVictims: Math.max(0, Number(val)) }))}
                                    type="number"
                                    required={true}
                                    disabled={mode === "view"}
                                />
                                <FormInput
                                    label="Tổng số lao động nữ bị nạn"
                                    value={supportReport.totalFemaleVictims || ""}
                                    onChange={(val) => setSupportReport((prev) => ({ ...prev, totalFemaleVictims: Math.max(0, Number(val)) }))}
                                    type="number"
                                    required={true}
                                    disabled={mode === "view"}
                                />
                                <FormInput
                                    label="Tổng số người chết"
                                    value={supportReport.totalDeaths || ""}
                                    onChange={(val) => setSupportReport((prev) => ({ ...prev, totalDeaths: Math.max(0, Number(val)) }))}
                                    type="number"
                                    required={true}
                                    disabled={mode === "view"}
                                />
                                <FormInput
                                    label="Tổng số người bị thương nặng"
                                    value={supportReport.totalSeriouslyInjured || ""}
                                    onChange={(val) => setSupportReport((prev) => ({ ...prev, totalSeriouslyInjured: Math.max(0, Number(val)) }))}
                                    type="number"
                                    required={true}
                                    disabled={mode === "view"}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-2">
                                <FormInput
                                    label="Số người bị nạn không QL"
                                    value={supportReport.unmanagedVictims || 0}
                                    onChange={(val) => setSupportReport((prev) => ({ ...prev, unmanagedVictims: Math.max(0, Number(val)) }))}
                                    type="number"
                                    required={true}
                                    disabled={mode === "view"}
                                />
                                <FormInput
                                    label="Lao động nữ bị nạn không QL"
                                    value={supportReport.unmanagedFemaleVictims || 0}
                                    onChange={(val) => setSupportReport((prev) => ({ ...prev, unmanagedFemaleVictims: Math.max(0, Number(val)) }))}
                                    type="number"
                                    required={true}
                                    disabled={mode === "view"}
                                />
                                <FormInput
                                    label="Số người chết không QL"
                                    value={supportReport.unmanagedDeaths || 0}
                                    onChange={(val) => setSupportReport((prev) => ({ ...prev, unmanagedDeaths: Math.max(0, Number(val)) }))}
                                    type="number"
                                    required={true}
                                    disabled={mode === "view"}
                                />
                                <FormInput
                                    label="Người bị thương nặng không QL"
                                    value={supportReport.unmanagedSeriouslyInjured || 0}
                                    onChange={(val) => setSupportReport((prev) => ({ ...prev, unmanagedSeriouslyInjured: Math.max(0, Number(val)) }))}
                                    type="number"
                                    required={true}
                                    disabled={mode === "view"}
                                />
                            </div>
                        </div>

                        <div className="space-y-4 border-t border-gray-100 pt-6">
                            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wide">2. Thiệt hại do tai nạn lao động</h3>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <FormInput
                                    label="Chi phí y tế"
                                    value={formatNumber(supportReport.medicalCost)}
                                    onChange={(val) => setSupportReport((prev) => ({ ...prev, medicalCost: parseNumber(val) }))}
                                    required={true}
                                    disabled={mode === "view"}
                                    suffix="(1.000đ)"
                                />
                                <FormInput
                                    label="Chi phí trả lương trong thời gian điều trị"
                                    value={formatNumber(supportReport.salaryDuringTreatment)}
                                    onChange={(val) => setSupportReport((prev) => ({ ...prev, salaryDuringTreatment: parseNumber(val) }))}
                                    required={true}
                                    disabled={mode === "view"}
                                    suffix="(1.000đ)"
                                />
                                <FormInput
                                    label="Chi phí bồi thường trợ cấp"
                                    value={formatNumber(supportReport.compensationCost)}
                                    onChange={(val) => setSupportReport((prev) => ({ ...prev, compensationCost: parseNumber(val) }))}
                                    required={true}
                                    disabled={mode === "view"}
                                    suffix="(1.000đ)"
                                />
                                <FormInput label="Tổng số tiền chi phí" value={formatNumber(supportReport.totalCost)} required={true} disabled={true} suffix="(1.000đ)" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                                <FormInput
                                    label="Tổng số ngày nghỉ vì TNLĐ"
                                    value={supportReport.totalSickDays || ""}
                                    onChange={(val) => setSupportReport((prev) => ({ ...prev, totalSickDays: Math.max(0, Number(val)) }))}
                                    type="number"
                                    required={true}
                                    disabled={mode === "view"}
                                />
                                <FormInput
                                    label="Thiệt hại tài sản"
                                    value={formatNumber(supportReport.propertyDamage)}
                                    onChange={(val) => setSupportReport((prev) => ({ ...prev, propertyDamage: parseNumber(val) }))}
                                    disabled={mode === "view"}
                                    suffix="(1.000đ)"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* 4. SECTION: Xem tổng quan báo cáo tai nạn lao động */}
                {selectedSection === "Xem tổng quan báo cáo tai nạn lao động" && (
                    <div id="print-section" className="space-y-6 bg-white p-4 border border-gray-100 rounded-lg">
                        {/* Overview Title block */}
                        <div className="text-center space-y-2 border-b border-gray-150 pb-4">
                            <h2 className="text-sm font-bold text-gray-900 uppercase">
                                Báo cáo tổng hợp tình hình tai nạn lao động - Kỳ báo cáo: {formPeriod} năm {formYear}
                            </h2>
                        </div>

                        {/* Stamped file attachment notice */}
                        <div className="bg-gray-50/50 border border-gray-200 rounded px-4 py-3 text-xs print:hidden">
                            <p className="text-xs font-semibold text-gray-700">
                                <span className="text-red-500 font-bold mr-1">**</span>Vui lòng đính kèm báo cáo TNLĐ có dấu mộc công ty:{" "}
                                <label className="text-blue-600 underline cursor-pointer hover:text-blue-800 ml-1 font-bold">
                                    Tại đây
                                    <input type="file" className="hidden" accept=".pdf" onChange={handleStampedFileChange} disabled={mode === "view"} />
                                </label>
                                {stampedFile ? <span className="ml-2 text-blue-600 font-bold underline">{stampedFile.name}</span> : <span className="ml-2 text-gray-400 italic font-normal">baocaoTNLĐ.pdf</span>}
                            </p>
                        </div>

                        {/* TABLE I: Phân loại chi tiết */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse border border-gray-200 text-[10px]">
                                <thead>
                                    <tr className="bg-[#F4F6F8] font-bold text-gray-700">
                                        <th rowSpan={3} className="border border-gray-200 p-2 text-left align-middle w-62.5">
                                            Tên chỉ tiêu thống kê
                                        </th>
                                        <th rowSpan={3} className="border border-gray-200 p-2 text-center align-middle w-11.25">
                                            Mã số
                                        </th>
                                        <th colSpan={11} className="border border-gray-200 p-2 text-center align-middle">
                                            Phân loại TNLĐ theo mức độ thương tật
                                        </th>
                                    </tr>
                                    <tr className="bg-[#F4F6F8] font-bold text-gray-700">
                                        <th colSpan={3} className="border border-gray-200 p-2 text-center align-middle">
                                            Số vụ (Vụ)
                                        </th>
                                        <th colSpan={8} className="border border-gray-200 p-2 text-center align-middle">
                                            Số người bị nạn (Người)
                                        </th>
                                    </tr>
                                    <tr className="bg-[#F4F6F8] font-bold text-gray-600 text-[9px]">
                                        {/* Số vụ */}
                                        <th className="border border-gray-200 p-1.5 text-center">Tổng số</th>
                                        <th className="border border-gray-200 p-1.5 text-center">Số vụ có người chết</th>
                                        <th className="border border-gray-200 p-1.5 text-center">Số vụ có 2 người bị nạn trở lên</th>
                                        {/* Số người bị nạn - Tổng số */}
                                        <th className="border border-gray-200 p-1.5 text-center">Tổng số</th>
                                        <th className="border border-gray-200 p-1.5 text-center">NN không thuộc quyền quản lý</th>
                                        {/* Số người bị nạn - Số LD nữ */}
                                        <th className="border border-gray-200 p-1.5 text-center">Tổng số</th>
                                        <th className="border border-gray-200 p-1.5 text-center">NN không thuộc quyền quản lý</th>
                                        {/* Số người bị nạn - Số người bị chết */}
                                        <th className="border border-gray-200 p-1.5 text-center">Tổng số</th>
                                        <th className="border border-gray-200 p-1.5 text-center">NN không thuộc quyền quản lý</th>
                                        {/* Số người bị nạn - Số người bị thương nặng */}
                                        <th className="border border-gray-200 p-1.5 text-center">Tổng số</th>
                                        <th className="border border-gray-200 p-1.5 text-center">NN không thuộc quyền quản lý</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {/* 1. Tai nạn lao động */}
                                    <tr className="bg-gray-50/50 font-bold text-gray-800">
                                        <td className="border border-gray-200 p-2">1. Tai nạn lao động</td>
                                        <td className="border border-gray-200 p-2 text-center"></td>
                                        <td className="border border-gray-200 p-2 text-center"></td>
                                        <td className="border border-gray-200 p-2 text-center"></td>
                                        <td className="border border-gray-200 p-2 text-center"></td>
                                        <td className="border border-gray-200 p-2 text-center"></td>
                                        <td className="border border-gray-200 p-2 text-center"></td>
                                        <td className="border border-gray-200 p-2 text-center"></td>
                                        <td className="border border-gray-200 p-2 text-center"></td>
                                        <td className="border border-gray-200 p-2 text-center"></td>
                                        <td className="border border-gray-200 p-2 text-center"></td>
                                        <td className="border border-gray-200 p-2 text-center"></td>
                                        <td className="border border-gray-200 p-2 text-center"></td>
                                    </tr>
                                    <tr className="font-semibold text-gray-800">
                                        <td className="border border-gray-200 p-2 pl-4">Tai nạn lao động</td>
                                        <td className="border border-gray-200 p-2 text-center"></td>
                                        <td className="border border-gray-200 p-2 text-center">{laborStats.cases}</td>
                                        <td className="border border-gray-200 p-2 text-center">{laborStats.deathCases}</td>
                                        <td className="border border-gray-200 p-2 text-center">{laborStats.twoVictimsCases}</td>
                                        <td className="border border-gray-200 p-2 text-center">{laborStats.victims}</td>
                                        <td className="border border-gray-200 p-2 text-center">{laborStats.unmanagedVictims}</td>
                                        <td className="border border-gray-200 p-2 text-center">{laborStats.femaleVictims}</td>
                                        <td className="border border-gray-200 p-2 text-center">{laborStats.unmanagedFemale}</td>
                                        <td className="border border-gray-200 p-2 text-center">{laborStats.deaths}</td>
                                        <td className="border border-gray-200 p-2 text-center">{laborStats.unmanagedDeaths}</td>
                                        <td className="border border-gray-200 p-2 text-center">{laborStats.serious}</td>
                                        <td className="border border-gray-200 p-2 text-center">{laborStats.unmanagedSerious}</td>
                                    </tr>

                                    {/* 1.1 Phân theo nguyên nhân */}
                                    <tr className="bg-gray-50/20 font-bold text-gray-700">
                                        <td className="border border-gray-200 p-2 pl-4">1.1 Phân theo nguyên nhân xảy ra TNLĐ</td>
                                        <td className="border border-gray-200 p-2 text-center"></td>
                                        <td colSpan={11} className="border border-gray-200 p-2"></td>
                                    </tr>
                                    <tr className="bg-gray-50/10 font-semibold text-gray-600">
                                        <td className="border border-gray-200 p-2 pl-6">a. Do người sử dụng lao động</td>
                                        <td className="border border-gray-200 p-2 text-center"></td>
                                        <td colSpan={11} className="border border-gray-200 p-2"></td>
                                    </tr>

                                    {/* Cause codes 1 to 6 */}
                                    {[
                                        { code: "1", name: "Không có thiết bị an toàn hoặc thiết bị không đảm bảo an toàn" },
                                        { code: "2", name: "Không có phương tiện bảo vệ cá nhân hoặc phương tiện bảo vệ cá nhân không tốt" },
                                        { code: "3", name: "Tổ chức lao động không hợp lý" },
                                        { code: "4", name: "Chưa huấn luyện hoặc huấn luyện an toàn vệ sinh lao động chưa đầy đủ" },
                                        { code: "5", name: "Không có quy trình an toàn hoặc biện pháp làm việc an toàn" },
                                        { code: "6", name: "Điều kiện làm việc không tốt" },
                                    ].map((c) => {
                                        const s = getCauseStats(c.name);
                                        return (
                                            <tr key={c.code} className="text-gray-700">
                                                <td className="border border-gray-200 p-2 pl-8">{c.name}</td>
                                                <td className="border border-gray-200 p-2 text-center">{c.code}</td>
                                                <td className="border border-gray-200 p-2 text-center">{s.cases}</td>
                                                <td className="border border-gray-200 p-2 text-center">{s.deathCases}</td>
                                                <td className="border border-gray-200 p-2 text-center">{s.twoVictimsCases}</td>
                                                <td className="border border-gray-200 p-2 text-center">{s.victims}</td>
                                                <td className="border border-gray-200 p-2 text-center">{s.unmanagedVictims}</td>
                                                <td className="border border-gray-200 p-2 text-center">{s.femaleVictims}</td>
                                                <td className="border border-gray-200 p-2 text-center">{s.unmanagedFemale}</td>
                                                <td className="border border-gray-200 p-2 text-center">{s.deaths}</td>
                                                <td className="border border-gray-200 p-2 text-center">{s.unmanagedDeaths}</td>
                                                <td className="border border-gray-200 p-2 text-center">{s.serious}</td>
                                                <td className="border border-gray-200 p-2 text-center">{s.unmanagedSerious}</td>
                                            </tr>
                                        );
                                    })}

                                    <tr className="bg-gray-50/10 font-semibold text-gray-600">
                                        <td className="border border-gray-200 p-2 pl-6">b. Do người lao động</td>
                                        <td className="border border-gray-200 p-2 text-center"></td>
                                        <td colSpan={11} className="border border-gray-200 p-2"></td>
                                    </tr>

                                    {/* Cause codes 7 to 9 */}
                                    {[
                                        { code: "7", name: "Quy phạm nội quy, quy trình, quy chuẩn, biện pháp làm việc an toàn" },
                                        { code: "8", name: "Không sử dụng phương tiện bảo vệ cá nhân" },
                                        { code: "9", name: "Khách quan khó tránh/ Nguyên nhân chưa kể đến" },
                                    ].map((c) => {
                                        const s = getCauseStats(c.name);
                                        return (
                                            <tr key={c.code} className="text-gray-700">
                                                <td className="border border-gray-200 p-2 pl-8">{c.name}</td>
                                                <td className="border border-gray-200 p-2 text-center">{c.code}</td>
                                                <td className="border border-gray-200 p-2 text-center">{s.cases}</td>
                                                <td className="border border-gray-200 p-2 text-center">{s.deathCases}</td>
                                                <td className="border border-gray-200 p-2 text-center">{s.twoVictimsCases}</td>
                                                <td className="border border-gray-200 p-2 text-center">{s.victims}</td>
                                                <td className="border border-gray-200 p-2 text-center">{s.unmanagedVictims}</td>
                                                <td className="border border-gray-200 p-2 text-center">{s.femaleVictims}</td>
                                                <td className="border border-gray-200 p-2 text-center">{s.unmanagedFemale}</td>
                                                <td className="border border-gray-200 p-2 text-center">{s.deaths}</td>
                                                <td className="border border-gray-200 p-2 text-center">{s.unmanagedDeaths}</td>
                                                <td className="border border-gray-200 p-2 text-center">{s.serious}</td>
                                                <td className="border border-gray-200 p-2 text-center">{s.unmanagedSerious}</td>
                                            </tr>
                                        );
                                    })}

                                    {/* 1.2 Phân theo yếu tố gây chấn thương */}
                                    <tr className="bg-gray-50/20 font-bold text-gray-700">
                                        <td className="border border-gray-200 p-2 pl-4">1.2 Phân theo yếu tố gây chấn thương</td>
                                        <td className="border border-gray-200 p-2 text-center"></td>
                                        <td colSpan={11} className="border border-gray-200 p-2"></td>
                                    </tr>
                                    {(() => {
                                        const s = getFactorStats("Thiết bị nâng");
                                        return (
                                            <tr className="text-gray-700">
                                                <td className="border border-gray-200 p-2 pl-6">Thiết bị nâng</td>
                                                <td className="border border-gray-200 p-2 text-center">101</td>
                                                <td className="border border-gray-200 p-2 text-center">{s.cases}</td>
                                                <td className="border border-gray-200 p-2 text-center">{s.deathCases}</td>
                                                <td className="border border-gray-200 p-2 text-center">{s.twoVictimsCases}</td>
                                                <td className="border border-gray-200 p-2 text-center">{s.victims}</td>
                                                <td className="border border-gray-200 p-2 text-center">{s.unmanagedVictims}</td>
                                                <td className="border border-gray-200 p-2 text-center">{s.femaleVictims}</td>
                                                <td className="border border-gray-200 p-2 text-center">{s.unmanagedFemale}</td>
                                                <td className="border border-gray-200 p-2 text-center">{s.deaths}</td>
                                                <td className="border border-gray-200 p-2 text-center">{s.unmanagedDeaths}</td>
                                                <td className="border border-gray-200 p-2 text-center">{s.serious}</td>
                                                <td className="border border-gray-200 p-2 text-center">{s.unmanagedSerious}</td>
                                            </tr>
                                        );
                                    })()}

                                    {/* 1.3 Phân theo nghề nghiệp */}
                                    <tr className="bg-gray-50/20 font-bold text-gray-700">
                                        <td className="border border-gray-200 p-2 pl-4">1.3 Phân theo nghề nghiệp</td>
                                        <td className="border border-gray-200 p-2 text-center"></td>
                                        <td colSpan={11} className="border border-gray-200 p-2"></td>
                                    </tr>
                                    {[
                                        { code: "102", name: "Nhà lãnh đạo cơ quan Đảng Cộng sản Việt Nam cấp Trung ương" },
                                        { code: "103", name: "Công nhân" },
                                    ].map((occ) => {
                                        const s = getOccupationStats(occ.name);
                                        return (
                                            <tr key={occ.code} className="text-gray-700">
                                                <td className="border border-gray-200 p-2 pl-6">{occ.name}</td>
                                                <td className="border border-gray-200 p-2 text-center">{occ.code}</td>
                                                <td className="border border-gray-200 p-2 text-center">{s.cases}</td>
                                                <td className="border border-gray-200 p-2 text-center">{s.deathCases}</td>
                                                <td className="border border-gray-200 p-2 text-center">{s.twoVictimsCases}</td>
                                                <td className="border border-gray-200 p-2 text-center">{s.victims}</td>
                                                <td className="border border-gray-200 p-2 text-center">{s.unmanagedVictims}</td>
                                                <td className="border border-gray-200 p-2 text-center">{s.femaleVictims}</td>
                                                <td className="border border-gray-200 p-2 text-center">{s.unmanagedFemale}</td>
                                                <td className="border border-gray-200 p-2 text-center">{s.deaths}</td>
                                                <td className="border border-gray-200 p-2 text-center">{s.unmanagedDeaths}</td>
                                                <td className="border border-gray-200 p-2 text-center">{s.serious}</td>
                                                <td className="border border-gray-200 p-2 text-center">{s.unmanagedSerious}</td>
                                            </tr>
                                        );
                                    })}

                                    {/* 2. Tai nạn được hưởng trợ cấp */}
                                    <tr className="bg-gray-50/50 font-bold text-gray-800">
                                        <td className="border border-gray-200 p-2">2. Tai nạn được hưởng trợ cấp theo quy định tại Khoản 2 Điều 39 Luật ATVSLĐ</td>
                                        <td className="border border-gray-200 p-2 text-center">10</td>
                                        <td className="border border-gray-200 p-2 text-center">{supportStats.cases}</td>
                                        <td className="border border-gray-200 p-2 text-center">{supportStats.deathCases}</td>
                                        <td className="border border-gray-200 p-2 text-center">{supportStats.twoVictimsCases}</td>
                                        <td className="border border-gray-200 p-2 text-center">{supportStats.victims}</td>
                                        <td className="border border-gray-200 p-2 text-center">{supportStats.unmanagedVictims}</td>
                                        <td className="border border-gray-200 p-2 text-center">{supportStats.femaleVictims}</td>
                                        <td className="border border-gray-200 p-2 text-center">{supportStats.unmanagedFemale}</td>
                                        <td className="border border-gray-200 p-2 text-center">{supportStats.deaths}</td>
                                        <td className="border border-gray-200 p-2 text-center">{supportStats.unmanagedDeaths}</td>
                                        <td className="border border-gray-200 p-2 text-center">{supportStats.serious}</td>
                                        <td className="border border-gray-200 p-2 text-center">{supportStats.unmanagedSerious}</td>
                                    </tr>

                                    {/* 3. Tổng số */}
                                    <tr className="bg-gray-100 font-bold text-gray-900">
                                        <td className="border border-gray-200 p-2">3. Tổng số</td>
                                        <td className="border border-gray-200 p-2 text-center"></td>
                                        <td className="border border-gray-200 p-2 text-center"></td>
                                        <td className="border border-gray-200 p-2 text-center"></td>
                                        <td className="border border-gray-200 p-2 text-center"></td>
                                        <td className="border border-gray-200 p-2 text-center"></td>
                                        <td className="border border-gray-200 p-2 text-center"></td>
                                        <td className="border border-gray-200 p-2 text-center"></td>
                                        <td className="border border-gray-200 p-2 text-center"></td>
                                        <td className="border border-gray-200 p-2 text-center"></td>
                                        <td className="border border-gray-200 p-2 text-center"></td>
                                        <td className="border border-gray-200 p-2 text-center"></td>
                                        <td className="border border-gray-200 p-2 text-center"></td>
                                    </tr>
                                    <tr className="bg-gray-100 font-bold text-gray-900">
                                        <td className="border border-gray-200 p-2 pl-4">Tổng số (3=1+2)</td>
                                        <td className="border border-gray-200 p-2 text-center"></td>
                                        <td className="border border-gray-200 p-2 text-center">{totalStats.cases}</td>
                                        <td className="border border-gray-200 p-2 text-center">{totalStats.deathCases}</td>
                                        <td className="border border-gray-200 p-2 text-center">{totalStats.twoVictimsCases}</td>
                                        <td className="border border-gray-200 p-2 text-center">{totalStats.victims}</td>
                                        <td className="border border-gray-200 p-2 text-center">{totalStats.unmanagedVictims}</td>
                                        <td className="border border-gray-200 p-2 text-center">{totalStats.femaleVictims}</td>
                                        <td className="border border-gray-200 p-2 text-center">{totalStats.unmanagedFemale}</td>
                                        <td className="border border-gray-200 p-2 text-center">{totalStats.deaths}</td>
                                        <td className="border border-gray-200 p-2 text-center">{totalStats.unmanagedDeaths}</td>
                                        <td className="border border-gray-200 p-2 text-center">{totalStats.serious}</td>
                                        <td className="border border-gray-200 p-2 text-center">{totalStats.unmanagedSerious}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* TABLE II: Thiệt hại */}
                        <div className="space-y-3 pt-4">
                            <div className="border-b border-gray-150 pb-2">
                                <h3 className="text-xs font-bold text-gray-800 uppercase">II. Thiết hại do tai nạn lao động</h3>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-center border-collapse border border-gray-200 text-[10px]">
                                    <thead>
                                        <tr className="bg-[#F4F6F8] font-bold text-gray-700">
                                            <th rowSpan={2} className="border border-gray-200 p-2 text-left align-middle w-[35%]">
                                                Tổng số ngày nghỉ vì tai nạn lao động (kể cả ngày nghỉ chế độ)
                                            </th>
                                            <th colSpan={4} className="border border-gray-200 p-2 text-center align-middle">
                                                Tổng số tiền chi phí (1.000đ)
                                            </th>
                                            <th rowSpan={2} className="border border-gray-200 p-2 text-center align-middle w-[25%]">
                                                Thiết hại tài sản (1.000đ)
                                            </th>
                                        </tr>
                                        <tr className="bg-[#F4F6F8] font-bold text-gray-600 text-[9px]">
                                            <th className="border border-gray-200 p-1.5 text-center">Tổng số</th>
                                            <th className="border border-gray-200 p-1.5 text-center">Y tế</th>
                                            <th className="border border-gray-200 p-1.5 text-center">Trả lương trong thời gian điều trị</th>
                                            <th className="border border-gray-200 p-1.5 text-center">Bồi thường trợ cấp</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr className="font-semibold text-gray-800 text-[10px]">
                                            <td className="border border-gray-200 p-2.5 text-center">{(laborReport.totalSickDays || 0) + (supportReport.totalSickDays || 0)}</td>
                                            <td className="border border-gray-200 p-2.5 text-center">{formatNumber((laborReport.totalCost || 0) + (supportReport.totalCost || 0))}</td>
                                            <td className="border border-gray-200 p-2.5 text-center">{formatNumber((laborReport.medicalCost || 0) + (supportReport.medicalCost || 0))}</td>
                                            <td className="border border-gray-200 p-2.5 text-center">{formatNumber((laborReport.salaryDuringTreatment || 0) + (supportReport.salaryDuringTreatment || 0))}</td>
                                            <td className="border border-gray-200 p-2.5 text-center">{formatNumber((laborReport.compensationCost || 0) + (supportReport.compensationCost || 0))}</td>
                                            <td className="border border-gray-200 p-2.5 text-center">{formatNumber((laborReport.propertyDamage || 0) + (supportReport.propertyDamage || 0))}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* DIALOG 1: Warn on Cancel (Cancellation modal) */}
            <CancelPopup
                isOpen={showCancelDialog}
                onClose={() => setShowCancelDialog(false)}
                onConfirm={() => {
                    setShowCancelDialog(false);
                    onClose();
                }}
            />

            {/* DIALOG 2: Save Confirmation Prompt */}
            {showSaveDialog && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-999 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        {/* Blue header bar */}
                        <div className="bg-blue-600 px-6 py-3.5 text-center flex items-center justify-between">
                            <h3 className="text-white text-sm font-bold uppercase tracking-wide">Xác nhận lưu báo cáo</h3>
                            <button type="button" onClick={() => setShowSaveDialog(false)} className="text-white/80 hover:text-white">
                                <X size={18} />
                            </button>
                        </div>
                        {/* Content */}
                        <div className="px-6 py-6 space-y-4">
                            <div className="relative">
                                <FormSelect label="Kỳ báo cáo" value={formPeriod} onChange={(val) => setFormPeriod(val)} options={["6 tháng", "Cả năm"]} />
                            </div>
                            <p className="text-xs text-gray-500 font-medium">Hãy chọn trạng thái bạn muốn lưu cho báo cáo kỳ này:</p>
                        </div>
                        {/* Footer */}
                        <div className="px-6 py-4 bg-gray-50 flex items-center justify-end gap-3 border-t border-gray-100">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowSaveDialog(false)}
                                className="border-none bg-transparent hover:bg-gray-100 text-gray-600 hover:text-gray-800 text-xs font-semibold px-4 py-2"
                            >
                                Hủy
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setShowSaveDialog(false);
                                    handleSave("đang báo cáo");
                                }}
                                className="gap-1.5 border-gray-300 text-gray-700 hover:bg-gray-50 text-xs font-bold px-4 py-2 shadow-sm"
                            >
                                <Save size={14} />
                                <span>Lưu nháp</span>
                            </Button>
                            <Button
                                variant="primary"
                                size="sm"
                                onClick={() => {
                                    setShowSaveDialog(false);
                                    if (window.confirm("Khi đã gửi báo cáo, bạn sẽ không thể chỉnh sửa thông tin này nữa. Bạn có chắc chắn muốn gửi báo cáo?")) {
                                        handleSave("đã tiếp nhận");
                                    }
                                }}
                                className="gap-1.5 text-xs font-bold px-4 py-2 shadow-sm"
                            >
                                <Send size={14} />
                                <span>Gửi báo cáo</span>
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
