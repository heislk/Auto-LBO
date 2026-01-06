import React from "react";
import { YearData } from "@/utils/lbo";

interface FinancialTableProps {
    projections: YearData[];
}

export function FinancialTable({ projections }: FinancialTableProps) {
    const formatCurrency = (val: number) => {
        return val.toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
    };

    const rows = [
        { label: "Revenue", key: "revenue", bold: true },
        { label: "Revenue Growth", key: "growth", format: (v: number) => `${v.toFixed(1)}%` },
        { label: "EBITDA", key: "ebitda", bold: true, highlight: true },
        { label: "Margin %", key: "margin", format: (v: number) => `${v.toFixed(1)}%` },
        { label: "EBIT", key: "ebit", bold: true },
        { label: "(-) Interest Expense", key: "interestExpense", format: (v: number) => `(${formatCurrency(v)})` },
        { label: "Net Income", key: "netIncome", bold: true },

        
        { label: "Free Cash Flow", key: "cashAvailableForSweep", spacer: true, bold: true, highlight: true },

        
        { label: "Revolver Balance", key: "revolver", spacer: true, color: "text-rose-500" },
        { label: "Senior Debt Balance", key: "seniorDebt" },
        { label: "Junior Debt Balance", key: "juniorDebt" },
        { label: "Total Debt", key: "totalDebt", bold: true },
        { label: "Net Debt", key: "netDebt", format: (v: number) => formatCurrency(v) },
    ];

    return (
        <div className="border border-neutral-800 bg-black overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
                <thead>
                    <tr className="bg-neutral-900 border-b border-neutral-800">
                        <th className="py-2 pl-3 border-r border-neutral-800 font-bold text-white uppercase tracking-wider w-48">Metric ($M)</th>
                        {projections.map((p) => (
                            <th key={p.year} className="py-2 px-3 text-right border-r border-neutral-800 text-neutral-400 font-mono text-[10px] w-24 last:border-r-0">
                                {p.year === 0 ? "Entry" : `Year ${p.year}`}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, i) => {
                        return (
                            <tr
                                key={i}
                                className={`
                                    ${i % 2 === 0 ? "bg-black" : "bg-neutral-900/50"} 
                                    ${row.spacer ? "border-t-[2px] border-neutral-800" : "border-b border-neutral-800/50"}
                                `}
                            >
                                <td className={`
                                    py-1.5 pl-3 border-r border-neutral-800 
                                    ${row.bold ? "font-bold text-white" : "text-neutral-400"}
                                    ${row.highlight ? "text-emerald-500" : ""}
                                `}>
                                    <span className="text-[10px] uppercase tracking-wide">{row.label}</span>
                                </td>
                                {projections.map((p, idx) => {
                                    let val = 0;

                                    if (row.key === "growth") {
                                        if (p.year === 0) return <td key={idx} className="border-r border-neutral-800 text-right px-3 text-neutral-700">-</td>;
                                        const prev = projections[idx - 1];
                                        val = ((p.revenue / prev.revenue) - 1) * 100;
                                    } else if (row.key === "margin") {
                                        val = (p.ebitda / p.revenue) * 100;
                                    } else if (row.key === "netDebt") {
                                        val = p.totalDebt - p.cash;
                                    } else {
                                        
                                        val = p[row.key];
                                    }

                                    return (
                                        <td key={idx} className={`
                                            py-1.5 px-3 text-right border-r border-neutral-800 last:border-r-0 font-mono text-[10px]
                                            ${row.bold ? "font-medium text-white" : "text-neutral-400"}
                                            ${row.color || ""}
                                        `}>
                                            {row.format ? row.format(val) : formatCurrency(val)}
                                        </td>
                                    );
                                })}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
