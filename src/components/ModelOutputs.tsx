"use client";

import React from "react";
import { StatCard } from "./ui/StatCard";
import { LBOOutputs } from "@/utils/lbo";
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
} from "recharts";

interface ModelOutputsProps {
    outputs: LBOOutputs;
}

export function ModelOutputs({ outputs }: ModelOutputsProps) {
    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            maximumFractionDigits: 1,
            minimumFractionDigits: 1,
        }).format(val) + "M";
    };

    const formatPercent = (val: number) => {
        return val.toFixed(1) + "%";
    };

    const formatMultiple = (val: number) => {
        return val.toFixed(2) + "x";
    };


    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-neutral-900 border border-neutral-800 p-3 rounded-lg shadow-xl">
                    <p className="text-neutral-400 mb-2 font-medium text-xs uppercase tracking-wider">Year {label}</p>
                    {payload.map((entry: any) => (
                        <div key={entry.name} className="flex items-center gap-3 text-sm">
                            <div
                                className="w-2 h-2 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)]"
                                style={{ backgroundColor: entry.color, boxShadow: `0 0 8px ${entry.color}` }}
                            />
                            <span className="text-neutral-300 min-w-[100px]">{entry.name}</span>
                            <span className="text-white font-mono font-medium text-right flex-1">
                                {formatCurrency(entry.value)}
                            </span>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };


    const totalDebtPaydown = outputs.projections[0].totalDebt - outputs.projections[5].totalDebt;
    const avgFcfYield = (outputs.projections.reduce((a, b) => a + b.cashAvailableForSweep, 0) / 5) / outputs.valuation.entryEV * 100;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-500">

            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-2xl font-bold text-white">Project Returns</h2>
                    <p className="text-neutral-400">Pro forma analysis based on current assumptions</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    label="IRR"
                    value={formatPercent(outputs.returns.irr)}
                    className="bg-gradient-to-br from-emerald-900/40 to-black border-emerald-500/30"
                />
                <StatCard
                    label="MOIC"
                    value={formatMultiple(outputs.returns.moic)}
                    subValue={`of ${formatCurrency(outputs.sourcesAndUses.sources.sponsorEquity)} Equity`}
                    className="bg-gradient-to-br from-emerald-900/40 to-black border-emerald-500/30"
                />
                <StatCard
                    label="Exit Value"
                    value={formatCurrency(outputs.valuation.exitEV)}
                    subValue={`@ ${outputs.projections[5].ebitda.toFixed(1)}M EBITDA`}
                />
                <StatCard
                    label="Debt Paydown"
                    value={formatCurrency(totalDebtPaydown)}
                    className="bg-gradient-to-br from-blue-900/20 to-black border-blue-500/20"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[500px]">

                <div className="lg:col-span-2 bg-neutral-900/50 border border-white/5 rounded-xl p-6 backdrop-blur-sm flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-semibold text-white/90">Projected Performance</h3>
                        <div className="flex gap-4 text-xs font-medium text-white/40">
                            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500" />EBITDA</div>
                            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-amber-500" />Free Cash Flow</div>
                        </div>
                    </div>

                    <div className="flex-1 min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={outputs.projections.slice(1)} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                                <XAxis
                                    dataKey="year"
                                    stroke="#525252"
                                    tick={{ fill: '#737373', fontSize: 12 }}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="#525252"
                                    tick={{ fill: '#737373', fontSize: 12 }}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(val) => `$${val}`}
                                />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                                <Bar dataKey="ebitda" fill="#10b981" radius={[4, 4, 0, 0]} barSize={60} fillOpacity={0.8} />
                                <Line type="monotone" dataKey="cashAvailableForSweep" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4, fill: '#f59e0b', strokeWidth: 0 }} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-neutral-900/50 border border-white/5 rounded-xl p-6 backdrop-blur-sm flex flex-col">
                    <h3 className="font-semibold text-white/90 mb-6">Deleveraging</h3>
                    <div className="flex-1 min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={outputs.projections} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                                <XAxis
                                    dataKey="year"
                                    stroke="#525252"
                                    tick={{ fill: '#737373', fontSize: 12 }}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="#525252"
                                    tick={{ fill: '#737373', fontSize: 12 }}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(val) => `$${val}`}
                                />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                                <Bar dataKey="seniorDebt" stackId="a" fill="#3b82f6" radius={[0, 0, 4, 4]} fillOpacity={0.8} />
                                <Bar dataKey="juniorDebt" stackId="a" fill="#8b5cf6" radius={[4, 4, 0, 0]} fillOpacity={0.8} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-4 flex justify-between text-xs text-white/40">
                        <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-sm bg-blue-500" />Senior</div>
                        <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-sm bg-violet-500" />Junior</div>
                    </div>
                </div>

            </div>

        </div>
    );
}
