"use client";

import React, { useMemo } from "react";
import { LBOOutputs, LBOAssumptions, calculateLBOProfessional } from "@/utils/lbo";
import { StatCard } from "./ui/StatCard";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ComposedChart,
    Line,
    Area,
    Cell
} from "recharts";

interface ModelOverviewProps {
    outputs: LBOOutputs;
    assumptions: LBOAssumptions;
}

export function ModelOverview({ outputs, assumptions }: ModelOverviewProps) {
    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            maximumFractionDigits: 1,
            minimumFractionDigits: 0,
        }).format(val) + "M";
    };

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white border border-neutral-200 p-3 rounded-md shadow-lg">
                    <p className="text-neutral-900 mb-2 font-semibold text-xs border-b border-neutral-200 pb-1">{label}</p>
                    {payload.map((entry: any) => (
                        <div key={entry.name} className="flex items-center justify-between gap-6 text-xs mb-1 last:mb-0">
                            <span className="text-neutral-500 font-medium">{entry.name}</span>
                            <span className="text-neutral-900 font-bold font-mono">
                                {typeof entry.value === 'number' && entry.name.includes('Margin')
                                    ? entry.value.toFixed(1) + '%'
                                    : typeof entry.value === 'number' && (entry.name.includes('Lev') || entry.name.includes('Cov') || entry.name.includes('MOIC'))
                                        ? entry.value.toFixed(2) + 'x'
                                        : typeof entry.value === 'number' && entry.name.includes('IRR')
                                            ? entry.value.toFixed(1) + '%'
                                            : formatCurrency(entry.value)}
                            </span>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    
    const COL_MAIN = "#ffffff";
    const COL_SEC = "#a3a3a3";
    const COL_TERT = "#525252";
    const COL_DARK = "#262626";

    const COL_REV = "#262626";
    const COL_DEBT_SNR = "#737373";
    const COL_DEBT_JNR = "#404040";

    

    
    const bridgeData = useMemo(() => {
        const entryEquity = outputs.sourcesAndUses.sources.sponsorEquity;
        const grossExitEquity = outputs.valuation.exitEquityValue;
        const mip = outputs.valuation.managementProceeds;
        const netSponsorEquity = outputs.valuation.sponsorProceeds;

        
        const ebitdaGrowth = (outputs.projections[5].ebitda - outputs.projections[0].ebitda) * assumptions.entryMultiple;
        const multipleExpansion = (assumptions.exitMultiple - assumptions.entryMultiple) * outputs.projections[5].ebitda;
        const debtPaydown = (outputs.projections[0].totalDebt - outputs.projections[0].cash) - (outputs.projections[5].totalDebt - outputs.projections[5].cash);
        const totalValueCreation = grossExitEquity - entryEquity;
        const plug = totalValueCreation - (ebitdaGrowth + multipleExpansion + debtPaydown);

        return [
            { name: "Entry", value: entryEquity, fill: COL_TERT },
            { name: "Growth", value: ebitdaGrowth, fill: COL_SEC },
            { name: "Mult Exp", value: multipleExpansion, fill: COL_SEC },
            { name: "De-Lev", value: debtPaydown, fill: COL_SEC },
            { name: "Other", value: plug, fill: COL_DARK },
            { name: "MIP", value: -mip, fill: COL_DARK },
            { name: "Net Exit", value: netSponsorEquity, fill: COL_MAIN, isTotal: true },
        ];
    }, [outputs, assumptions]);

    
    const sensitivityData = useMemo(() => {
        const baseExitMult = assumptions.exitMultiple;
        const baseGrowth = assumptions.revenueGrowth;
        const iterations = [-1.0, 0, 1.0];
        return iterations.map((growthStep) => {
            const growth = baseGrowth + growthStep * 2.0;
            return {
                growthLabel: `${growth.toFixed(1)}%`,
                cells: iterations.map((multStep) => {
                    const mult = baseExitMult + multStep * 1.0;
                    const scenario = calculateLBOProfessional({ ...assumptions, revenueGrowth: growth, exitMultiple: mult });
                    return { multLabel: `${mult.toFixed(1)}x`, irr: scenario.returns.irr };
                })
            };
        });
    }, [assumptions]);

    
    const creditStatsData = useMemo(() => {
        return outputs.projections.slice(1).map(p => {
            const netDebt = Math.max(0, p.totalDebt - p.cash);
            const lev = netDebt / p.ebitda;
            const cov = p.interestExpense > 0 ? p.ebitda / p.interestExpense : 0;
            return { year: p.year, netLev: lev, intCov: cov };
        });
    }, [outputs]);

    
    const cfAllocData = useMemo(() => {
        return outputs.projections.slice(1).map(p => ({
            year: p.year,
            taxes: p.taxes,
            interest: p.interestExpense,
            capex: p.lessCapex,
            nwc: p.lessNWC,
            paydown: Math.max(0, p.mandatoryAmort + p.optionalPrepay), 
            ebitda: p.ebitda
        }));
    }, [outputs]);

    return (
        <div className="space-y-6 font-sans text-xs text-white">

            {}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard label="Net IRR" value={`${outputs.returns.irr.toFixed(1)}%`} />
                <StatCard label="Net MOIC" value={`${outputs.returns.moic.toFixed(2)}x`} />
                <StatCard label="Entry Equity" value={formatCurrency(outputs.sourcesAndUses.sources.sponsorEquity)} subValue="Check Size" />
                <StatCard label="Net Proceeds" value={formatCurrency(outputs.valuation.sponsorProceeds)} subValue="At Exit" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {}
                <div className="lg:col-span-2 space-y-6">

                    {}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {}
                        <div className="bg-[#0f1110] border border-neutral-800 rounded-md overflow-hidden">
                            <div className="flex justify-between items-center px-5 py-3 border-b border-neutral-800">
                                <h3 className="font-semibold text-neutral-200 text-xs">Financial Profile</h3>
                            </div>
                            <div className="h-[200px] p-5">
                                <ResponsiveContainer width="100%" height="100%">
                                    <ComposedChart data={outputs.projections.slice(1)}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                                        <XAxis dataKey="year" stroke="#525252" tick={{ fill: '#737373', fontSize: 10 }} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#525252" tick={{ fill: '#737373', fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={(val) => `${val / 1000}k`} />
                                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                                        <Bar dataKey="ebitda" name="EBITDA" fill={COL_SEC} barSize={30} radius={[2, 2, 0, 0]} />
                                        <Line type="step" dataKey="cashAvailableForSweep" name="Free Cash Flow" stroke={COL_MAIN} strokeWidth={2} dot={false} />
                                    </ComposedChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {}
                        <div className="bg-[#0f1110] border border-neutral-800 rounded-md overflow-hidden">
                            <div className="flex justify-between items-center px-5 py-3 border-b border-neutral-800">
                                <h3 className="font-semibold text-neutral-200 text-xs">Credit Statistics</h3>
                            </div>
                            <div className="h-[200px] p-5">
                                <ResponsiveContainer width="100%" height="100%">
                                    <ComposedChart data={creditStatsData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                                        <XAxis dataKey="year" stroke="#525252" tick={{ fill: '#737373', fontSize: 10 }} tickLine={false} axisLine={false} />
                                        <YAxis yAxisId="left" stroke="#525252" tick={{ fill: '#737373', fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}x`} domain={[0, 'auto']} />
                                        <YAxis yAxisId="right" orientation="right" stroke="#525252" tick={{ fill: '#737373', fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}x`} />
                                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                                        <Bar yAxisId="right" dataKey="intCov" name="Int. Coverage" fill={COL_TERT} barSize={20} opacity={0.5} radius={[2, 2, 0, 0]} />
                                        <Line yAxisId="left" type="monotone" dataKey="netLev" name="Net Leverage" stroke={COL_MAIN} strokeWidth={2} dot={{ r: 3, fill: 'black', strokeWidth: 2 }} />
                                    </ComposedChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {}
                        <div className="bg-[#0f1110] border border-neutral-800 rounded-md overflow-hidden">
                            <div className="flex justify-between items-center px-5 py-3 border-b border-neutral-800">
                                <h3 className="font-semibold text-neutral-200 text-xs">Debt Structure</h3>
                            </div>
                            <div className="h-[200px] p-5">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={outputs.projections}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                                        <XAxis dataKey="year" stroke="#525252" tick={{ fill: '#737373', fontSize: 10 }} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#525252" tick={{ fill: '#737373', fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={(val) => `${val / 1000}k`} />
                                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                                        <Bar dataKey="revolver" name="Revolver" stackId="a" fill={COL_REV} />
                                        <Bar dataKey="seniorDebt" name="Senior" stackId="a" fill={COL_DEBT_SNR} />
                                        <Bar dataKey="juniorDebt" name="Junior" stackId="a" fill={COL_DEBT_JNR} radius={[2, 2, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {}
                        <div className="bg-[#0f1110] border border-neutral-800 rounded-md overflow-hidden">
                            <div className="flex justify-between items-center px-5 py-3 border-b border-neutral-800">
                                <h3 className="font-semibold text-neutral-200 text-xs">EBITDA Allocation</h3>
                            </div>
                            <div className="h-[200px] p-5">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={cfAllocData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                                        <XAxis dataKey="year" stroke="#525252" tick={{ fill: '#737373', fontSize: 10 }} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#525252" tick={{ fill: '#737373', fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={(val) => `${val / 1000}k`} />
                                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                                        <Bar dataKey="interest" name="Interest" stackId="a" fill={COL_TERT} />
                                        <Bar dataKey="taxes" name="Taxes" stackId="a" fill={COL_DARK} />
                                        <Bar dataKey="capex" name="Capex" stackId="a" fill={COL_DARK} />
                                        <Bar dataKey="paydown" name="Principal Paydown" stackId="a" fill={COL_MAIN} radius={[2, 2, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-[#0f1110] border border-neutral-800 rounded-md overflow-hidden">
                            <div className="flex justify-between items-center px-5 py-3 border-b border-neutral-800">
                                <h3 className="font-semibold text-neutral-200 text-xs">Net Returns Profile</h3>
                            </div>
                            <div className="h-[200px] p-5">
                                <ResponsiveContainer width="100%" height="100%">
                                    <ComposedChart data={outputs.projections.slice(1)}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                                        <XAxis dataKey="year" stroke="#525252" tick={{ fill: '#737373', fontSize: 10 }} tickLine={false} axisLine={false} />
                                        <YAxis yAxisId="left" stroke="#525252" tick={{ fill: '#737373', fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}%`} />
                                        <YAxis yAxisId="right" orientation="right" stroke="#525252" tick={{ fill: '#737373', fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}x`} />
                                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                                        <Bar yAxisId="right" dataKey="moic" name="Net MOIC" fill={COL_DARK} barSize={20} radius={[2, 2, 0, 0]} />
                                        <Line yAxisId="left" type="monotone" dataKey="irr" name="Net IRR" stroke={COL_MAIN} strokeWidth={2} dot={{ r: 3, fill: 'black', strokeWidth: 2 }} />
                                    </ComposedChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="bg-[#0f1110] border border-neutral-800 rounded-md overflow-hidden">
                            <div className="flex justify-between items-center px-5 py-3 border-b border-neutral-800">
                                <h3 className="font-semibold text-neutral-200 text-xs">Value Creation Bridge</h3>
                            </div>
                            <div className="h-[200px] p-5">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={bridgeData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                                        <XAxis dataKey="name" stroke="#525252" tick={{ fill: '#737373', fontSize: 9 }} tickLine={false} axisLine={false} interval={0} />
                                        <YAxis stroke="#525252" tick={{ fill: '#737373', fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={(val) => `${val / 1000}k`} />
                                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                                        <Bar dataKey="value" name="Amount" barSize={20} radius={[2, 2, 0, 0]}>
                                            {bridgeData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.fill} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                </div>

                {}
                <div className="space-y-6">

                    {}
                    <div className="bg-[#0f1110] border border-neutral-800 rounded-md overflow-hidden">
                        <div className="flex justify-between items-center px-5 py-3 border-b border-neutral-800">
                            <h3 className="font-semibold text-neutral-200 text-xs">Sensitivity Analysis</h3>
                        </div>

                        <div className="p-5 flex flex-col gap-1">
                            <div className="flex gap-1 ml-12 mb-1">
                                {sensitivityData[0].cells.map((cell, i) => (
                                    <div key={i} className="flex-1 text-center text-xs text-neutral-500 font-medium">
                                        {cell.multLabel}
                                    </div>
                                ))}
                            </div>

                            {sensitivityData.map((row, i) => (
                                <div key={i} className="flex gap-1 items-center">
                                    <div className="w-12 text-right text-xs text-neutral-500 font-medium pr-2">
                                        {row.growthLabel}
                                    </div>

                                    {row.cells.map((cell, j) => {
                                        let bg = "bg-neutral-900 text-neutral-500";
                                        if (cell.irr > 25) bg = "bg-neutral-100 text-black font-semibold";
                                        else if (cell.irr > 15) bg = "bg-neutral-700 text-white";

                                        return (
                                            <div key={j} className={`flex-1 h-9 ${bg} rounded-sm flex items-center justify-center text-xs border border-transparent`}>
                                                {cell.irr.toFixed(1)}%
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>

                    {}
                    <div className="bg-[#0f1110] border border-neutral-800 rounded-md overflow-hidden">
                        <div className="flex justify-between items-center px-5 py-3 border-b border-neutral-800">
                            <h3 className="font-semibold text-neutral-200 text-xs">Uses of Funds</h3>
                        </div>
                        <div className="p-5 space-y-3 text-xs">
                            <div className="flex justify-between py-1 border-b border-neutral-900">
                                <span className="text-neutral-500 font-medium">Purchase Price</span>
                                <span className="text-white font-mono">{formatCurrency(outputs.sourcesAndUses.uses.purchasePrice)}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-neutral-900">
                                <span className="text-neutral-500 font-medium">Transaction Fees</span>
                                <span className="text-white font-mono">{formatCurrency(outputs.sourcesAndUses.uses.fees)}</span>
                            </div>
                            <div className="flex justify-between py-1 font-semibold text-white mt-1">
                                <span>Total Uses</span>
                                <span className="font-mono">{formatCurrency(outputs.sourcesAndUses.uses.totalUses)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#0f1110] border border-neutral-800 rounded-md overflow-hidden">
                        <div className="flex justify-between items-center px-5 py-3 border-b border-neutral-800">
                            <h3 className="font-semibold text-neutral-200 text-xs">Sources of Funds</h3>
                        </div>
                        <div className="p-5 space-y-3 text-xs">
                            <div className="flex justify-between py-1 border-b border-neutral-900">
                                <span className="text-neutral-500 font-medium">Debt Financing</span>
                                <span className="text-white font-mono">{formatCurrency(outputs.sourcesAndUses.sources.seniorDebt + outputs.sourcesAndUses.sources.juniorDebt)}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-neutral-900">
                                <span className="text-white font-medium">Sponsor Equity</span>
                                <span className="text-white font-bold font-mono">{formatCurrency(outputs.sourcesAndUses.sources.sponsorEquity)}</span>
                            </div>
                            <div className="flex justify-between py-1 font-semibold text-white mt-1">
                                <span>Total Sources</span>
                                <span className="font-mono">{formatCurrency(outputs.sourcesAndUses.sources.totalSources)}</span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
