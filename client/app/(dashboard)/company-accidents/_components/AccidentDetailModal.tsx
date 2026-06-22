"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { CAUSES, FACTORS } from "./constants";
import type { AccidentDetail } from "@/types/report";
import { toast } from "sonner";
import { InputField } from "@/components/form/InputField";

interface AccidentDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (detail: AccidentDetail) => void;
    initialData: AccidentDetail | null;
}

export default function AccidentDetailModal({ isOpen, onClose, onSubmit, initialData }: AccidentDetailModalProps) {
    const [detailInput, setDetailInput] = useState<AccidentDetail>({
        accidentCause: CAUSES[0],
        injuryFactor: FACTORS[0],
        occupationCategory: "",
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
    });

    useEffect(() => {
        if (isOpen) {
            Promise.resolve().then(() => {
                if (initialData) {
                    setDetailInput({ ...initialData });
                } else {
                    setDetailInput({
                        accidentCause: CAUSES[0],
                        injuryFactor: FACTORS[0],
                        occupationCategory: "",
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
                    });
                }
            });
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const handleSave = () => {
        if (!detailInput.occupationCategory?.trim()) {
            toast.error("Vui lòng điền nghề nghiệp của vụ tai nạn chi tiết");
            return;
        }
        onSubmit(detailInput);
    };

    return (
        <div className="fixed inset-0 bg-black/70 z-60 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden border border-gray-100 animate-in fade-in zoom-in duration-200 max-h-[85vh]">
                {/* Detail Header */}
                <div className="px-5 py-3.5 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                    <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wide">{initialData ? "Sửa chi tiết vụ tai nạn" : "Thêm chi tiết vụ tai nạn"}</h3>
                    <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                        <X size={18} />
                    </button>
                </div>

                {/* Detail Body */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        <InputField
                            label="NGUYÊN NHÂN CHÍNH"
                            value={detailInput.accidentCause}
                            onChange={(e) => setDetailInput((prev) => ({ ...prev, accidentCause: e.target.value }))}
                            isSelect
                            size="sm"
                            options={CAUSES.map((cause) => ({ label: cause, value: cause }))}
                        />
                        <InputField
                            label="YẾU TỐ CHẤN THƯƠNG"
                            value={detailInput.injuryFactor}
                            onChange={(e) => setDetailInput((prev) => ({ ...prev, injuryFactor: e.target.value }))}
                            isSelect
                            size="sm"
                            options={FACTORS.map((f) => ({ label: f, value: f }))}
                        />
                    </div>

                    <InputField
                        label="NGHỀ NGHIỆP CỦA NẠN NHÂN (VÍ DỤ: CÔNG NHÂN XÂY DỰNG, THỢ CƠ KHÍ...)"
                        type="text"
                        value={detailInput.occupationCategory || ""}
                        onChange={(e) => setDetailInput((prev) => ({ ...prev, occupationCategory: e.target.value }))}
                        placeholder="Nhập nghề nghiệp..."
                        size="sm"
                    />

                    <div className="border-t pt-4">
                        <h4 className="text-[10px] font-bold text-blue-700 uppercase mb-3">Số vụ và số nạn nhân của nhóm chi tiết này</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
                            <InputField
                                label="SỐ VỤ TNLĐ"
                                type="number"
                                value={detailInput.totalAccidentCases ? detailInput.totalAccidentCases.toString() : ""}
                                onChange={(e) => setDetailInput((prev) => ({ ...prev, totalAccidentCases: Math.max(0, Number(e.target.value)) }))}
                                placeholder="0"
                                size="sm"
                            />
                            <InputField
                                label="VỤ CÓ NGƯỜI CHẾT"
                                type="number"
                                value={detailInput.totalCasesWithDeath ? detailInput.totalCasesWithDeath.toString() : ""}
                                onChange={(e) => setDetailInput((prev) => ({ ...prev, totalCasesWithDeath: Math.max(0, Number(e.target.value)) }))}
                                placeholder="0"
                                size="sm"
                            />
                            <InputField
                                label="VỤ >= 2 NẠN NHÂN"
                                type="number"
                                value={detailInput.totalCasesWithTwoOrMoreVictims ? detailInput.totalCasesWithTwoOrMoreVictims.toString() : ""}
                                onChange={(e) => setDetailInput((prev) => ({ ...prev, totalCasesWithTwoOrMoreVictims: Math.max(0, Number(e.target.value)) }))}
                                placeholder="0"
                                size="sm"
                            />
                            <InputField
                                label="TỔNG NẠN NHÂN"
                                type="number"
                                value={detailInput.totalVictims ? detailInput.totalVictims.toString() : ""}
                                onChange={(e) => setDetailInput((prev) => ({ ...prev, totalVictims: Math.max(0, Number(e.target.value)) }))}
                                placeholder="0"
                                size="sm"
                            />
                            <InputField
                                label="NỮ NẠN NHÂN"
                                type="number"
                                value={detailInput.totalFemaleVictims ? detailInput.totalFemaleVictims.toString() : ""}
                                onChange={(e) => setDetailInput((prev) => ({ ...prev, totalFemaleVictims: Math.max(0, Number(e.target.value)) }))}
                                placeholder="0"
                                size="sm"
                            />
                            <InputField
                                label="SỐ NGƯỜI CHẾT"
                                type="number"
                                value={detailInput.totalDeaths ? detailInput.totalDeaths.toString() : ""}
                                onChange={(e) => setDetailInput((prev) => ({ ...prev, totalDeaths: Math.max(0, Number(e.target.value)) }))}
                                placeholder="0"
                                size="sm"
                            />
                            <InputField
                                label="THƯƠNG NẶNG"
                                type="number"
                                value={detailInput.totalSeriouslyInjured ? detailInput.totalSeriouslyInjured.toString() : ""}
                                onChange={(e) => setDetailInput((prev) => ({ ...prev, totalSeriouslyInjured: Math.max(0, Number(e.target.value)) }))}
                                placeholder="0"
                                size="sm"
                            />
                        </div>
                    </div>

                    <div className="border-t pt-4">
                        <h4 className="text-[10px] font-bold text-blue-700 uppercase mb-3">Chi phí và thiệt hại phát sinh của nhóm chi tiết này</h4>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-2">
                            <InputField
                                label="CHI PHÍ Y TẾ"
                                type="number"
                                value={detailInput.medicalCost ? detailInput.medicalCost.toString() : ""}
                                onChange={(e) => setDetailInput((prev) => ({ ...prev, medicalCost: Math.max(0, Number(e.target.value)) }))}
                                placeholder="0"
                                size="sm"
                            />
                            <InputField
                                label="TRẢ LƯƠNG ĐIỀU TRỊ"
                                type="number"
                                value={detailInput.salaryDuringTreatment ? detailInput.salaryDuringTreatment.toString() : ""}
                                onChange={(e) => setDetailInput((prev) => ({ ...prev, salaryDuringTreatment: Math.max(0, Number(e.target.value)) }))}
                                placeholder="0"
                                size="sm"
                            />
                            <InputField
                                label="BỒI THƯỜNG TRỢ CẤP"
                                type="number"
                                value={detailInput.compensationCost ? detailInput.compensationCost.toString() : ""}
                                onChange={(e) => setDetailInput((prev) => ({ ...prev, compensationCost: Math.max(0, Number(e.target.value)) }))}
                                placeholder="0"
                                size="sm"
                            />
                            <InputField
                                label="HẠI TÀI SẢN"
                                type="number"
                                value={detailInput.propertyDamage ? detailInput.propertyDamage.toString() : ""}
                                onChange={(e) => setDetailInput((prev) => ({ ...prev, propertyDamage: Math.max(0, Number(e.target.value)) }))}
                                placeholder="0"
                                size="sm"
                            />
                            <InputField
                                label="SỐ NGÀY NGHỈ"
                                type="number"
                                value={detailInput.totalSickDays ? detailInput.totalSickDays.toString() : ""}
                                onChange={(e) => setDetailInput((prev) => ({ ...prev, totalSickDays: Math.max(0, Number(e.target.value)) }))}
                                placeholder="0"
                                size="sm"
                            />
                        </div>
                    </div>
                </div>

                {/* Detail Footer */}
                <div className="px-5 py-3.5 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-3">
                    <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg text-xs font-bold hover:bg-gray-100 cursor-pointer">
                        Hủy bỏ
                    </button>
                    <button type="button" onClick={handleSave} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors">
                        Đồng ý
                    </button>
                </div>
            </div>
        </div>
    );
}
