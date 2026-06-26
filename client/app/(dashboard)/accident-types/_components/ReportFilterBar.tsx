"use client";

import React, { useMemo } from "react";
import { InputField } from "@/components/form/InputField";

export interface Ward {
    ward_code: string;
    name: string;
    province_code: string;
}

export interface Province {
    province_code: string;
    name: string;
    short_name: string;
    code: string;
    place_type: string;
    wards: Ward[];
}

interface ReportFilterBarProps {
    selectedProvince: string;
    setSelectedProvince: (val: string) => void;
    selectedWard: string;
    setSelectedWard: (val: string) => void;
    provinces: Province[];
    activeWards: Ward[];
}

export default function ReportFilterBar({ selectedProvince, setSelectedProvince, selectedWard, setSelectedWard, provinces, activeWards }: ReportFilterBarProps) {
    const provinceOptions = useMemo(() => {
        return [
            { label: "Tất cả", value: "Tất cả" },
            ...provinces.map((prov) => ({
                label: prov.name,
                value: prov.name,
            })),
        ];
    }, [provinces]);

    const wardOptions = useMemo(() => {
        return [
            { label: "Tất cả", value: "Tất cả" },
            ...activeWards.map((w) => ({
                label: w.name,
                value: w.name,
            })),
        ];
    }, [activeWards]);

    return (
        <div className="shrink-0 grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
            <InputField
                label="Tỉnh/ thành phố"
                isSelect
                value={selectedProvince}
                onChange={(e: any) => {
                    setSelectedProvince(e.target.value);
                }}
                options={provinceOptions}
                size="md"
            />

            <InputField
                label="Phường/ Xã"
                isSelect
                value={selectedWard}
                onChange={(e: any) => {
                    setSelectedWard(e.target.value);
                }}
                options={wardOptions}
                size="md"
                disabled={selectedProvince === "Tất cả"}
            />
        </div>
    );
}
