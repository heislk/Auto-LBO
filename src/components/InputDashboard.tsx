"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Input } from "./ui/Input";
import { calculateLBOProfessional, LBOAssumptions } from "@/utils/lbo";
import { fetchTickerData } from "@/utils/marketData";
import { FinancialTable } from "./ui/FinancialTable";
import { ModelOverview } from "./ModelOverview";
import { FileSpreadsheet, ChevronLeft } from "lucide-react";
import { generateExcelModel } from "@/utils/excelExport";

export default function InputDashboard() {
    const searchParams = useSearchParams();
    const tickerParam = searchParams.get("ticker");

    const [activeTab, setActiveTab] = useState<"overview" | "financials">("overview");


    const [formData, setFormData] = useState({

        revenue: "100",
        revenueGrowth: "5.0",
        ebitdaMargin: "25.0",
        taxRate: "21.0",

        entryMultiple: "10.0",
        exitMultiple: "10.0",
        transactionFees: "2.0",
        minCash: "5.0",
        mipPercent: "10.0",

        seniorDebtMultiple: "3.5",
        juniorDebtMultiple: "1.5",
        seniorInterest: "6.5",
        juniorInterest: "10.0",
        seniorAmort: "1.0",


        capexPercent: "2.0",
        refinanceAmount: "0.0",
    });

    const [isLoaded, setIsLoaded] = useState(false);


    useEffect(() => {
        if (tickerParam && !isLoaded) {
            handleTickerSearch(tickerParam);
            setIsLoaded(true);
        }
    }, [tickerParam, isLoaded]);

    const handleTickerSearch = async (ticker: string) => {
        const data = await fetchTickerData(ticker);
        if (data) {
            setFormData((prev) => ({
                ...prev,
                revenue: data.revenue.toString(),
                revenueGrowth: data.revenueGrowth.toString(),
                ebitdaMargin: data.ebitdaMargin.toString(),
                taxRate: data.taxRate.toString(),
            }));
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData((prev) => ({ ...prev, [id]: value }));
    };

    const assumptions: LBOAssumptions = useMemo(() => ({
        revenue: parseFloat(formData.revenue) || 0,
        revenueGrowth: parseFloat(formData.revenueGrowth) || 0,
        ebitdaMargin: parseFloat(formData.ebitdaMargin) || 0,
        taxRate: parseFloat(formData.taxRate) || 0,
        entryMultiple: parseFloat(formData.entryMultiple) || 0,
        exitMultiple: parseFloat(formData.exitMultiple) || 0,
        transactionFees: parseFloat(formData.transactionFees) || 0,
        minCash: parseFloat(formData.minCash) || 0,
        seniorDebtMultiple: parseFloat(formData.seniorDebtMultiple) || 0,
        juniorDebtMultiple: parseFloat(formData.juniorDebtMultiple) || 0,
        seniorInterest: parseFloat(formData.seniorInterest) || 0,
        juniorInterest: parseFloat(formData.juniorInterest) || 0,
        seniorAmort: parseFloat(formData.seniorAmort) || 0,
        mipPercent: parseFloat(formData.mipPercent) || 0,
        capexPercent: parseFloat(formData.capexPercent) || 0,
        refinanceAmount: parseFloat(formData.refinanceAmount) || 0,
    }), [formData]);


    const outputs = useMemo(() => {
        return calculateLBOProfessional(assumptions);
    }, [assumptions]);

    const handleExport = async () => {
        await generateExcelModel(tickerParam || "MODEL", assumptions, outputs);
    };

    return (
        <div className="flex h-screen bg-[#0a0a0a] text-white overflow-hidden font-sans selection:bg-neutral-800/50">

            { }
            <aside className="w-[320px] flex-shrink-0 border-r border-neutral-800 bg-[#0f1110] overflow-y-auto custom-scrollbar">
                <div className="p-6 space-y-8">
                    <div className="flex items-center">
                        <a href="/" className="text-xs font-medium text-neutral-400 hover:text-white flex items-center gap-1 transition-colors">
                            <ChevronLeft size={14} /> Back to Search
                        </a>
                    </div>

                    <div className="space-y-8">
                        { }
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-white border-b border-neutral-800 pb-2">Operating Case</h3>
                            <div className="space-y-3">
                                <Input id="revenue" label="LTM Revenue ($M)" value={formData.revenue} onChange={handleChange} />
                                <Input id="revenueGrowth" label="Revenue Growth (%)" value={formData.revenueGrowth} onChange={handleChange} />
                                <Input id="ebitdaMargin" label="EBITDA Margin (%)" value={formData.ebitdaMargin} onChange={handleChange} />
                                <Input id="capexPercent" label="Capex (% of Rev)" value={formData.capexPercent} onChange={handleChange} />
                                <Input id="minCash" label="Min Cash ($M)" value={formData.minCash} onChange={handleChange} />
                            </div>
                        </div>

                        { }
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-white border-b border-neutral-800 pb-2">Transaction Details</h3>
                            <div className="space-y-3">
                                <Input id="entryMultiple" label="Entry Multiple (x)" value={formData.entryMultiple} onChange={handleChange} />
                                <Input id="exitMultiple" label="Exit Multiple (x)" value={formData.exitMultiple} onChange={handleChange} />
                                <div className="grid grid-cols-2 gap-3">
                                    <Input id="transactionFees" label="Tx Fees (%)" value={formData.transactionFees} onChange={handleChange} />
                                    <Input id="taxRate" label="Tax Rate (%)" value={formData.taxRate} onChange={handleChange} />
                                </div>
                                <Input id="refinanceAmount" label="Refinance Debt ($M)" value={formData.refinanceAmount} onChange={handleChange} />
                                <Input id="mipPercent" label="Mgmt Incentive (%)" value={formData.mipPercent} onChange={handleChange} />
                            </div>
                        </div>

                        { }
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-white border-b border-neutral-800 pb-2">Debt Structure</h3>

                            <div className="space-y-4">
                                <div className="bg-neutral-900/50 p-3 rounded-md border border-neutral-800 space-y-3">
                                    <p className="text-xs font-semibold text-neutral-300">Senior Debt</p>
                                    <div className="grid grid-cols-2 gap-3">
                                        <Input id="seniorDebtMultiple" label="Lev (x)" value={formData.seniorDebtMultiple} onChange={handleChange} />
                                        <Input id="seniorInterest" label="Int (%)" value={formData.seniorInterest} onChange={handleChange} />
                                    </div>
                                    <Input id="seniorAmort" label="Amortization (%)" value={formData.seniorAmort} onChange={handleChange} />
                                </div>

                                <div className="bg-neutral-900/50 p-3 rounded-md border border-neutral-800 space-y-3">
                                    <p className="text-xs font-semibold text-neutral-300">Junior Debt</p>
                                    <div className="grid grid-cols-2 gap-3">
                                        <Input id="juniorDebtMultiple" label="Lev (x)" value={formData.juniorDebtMultiple} onChange={handleChange} />
                                        <Input id="juniorInterest" label="Int (%)" value={formData.juniorInterest} onChange={handleChange} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            { }
            <main className="flex-1 flex flex-col overflow-hidden bg-[#0a0a0a] relative">

                { }
                <div className="flex-shrink-0 h-16 border-b border-neutral-800 flex items-center px-8 justify-between bg-[#0a0a0a] z-10">
                    <div>
                        <h1 className="text-lg font-semibold text-white">
                            {tickerParam || "Model"} Analysis
                        </h1>
                        <p className="text-xs text-neutral-500 mt-0.5">Project Returns & Sensitivity</p>
                    </div>

                    <div className="flex gap-4 items-center">
                        <button
                            onClick={handleExport}
                            className="flex items-center gap-2 text-neutral-300 hover:text-white text-xs font-medium px-4 py-2 rounded-md border border-neutral-700 hover:border-neutral-500 bg-neutral-900 hover:bg-neutral-800 transition-all"
                        >
                            <FileSpreadsheet size={14} /> Export Excel
                        </button>

                        <div className="flex bg-neutral-900 rounded-md p-1 border border-neutral-800">
                            <button
                                onClick={() => setActiveTab("overview")}
                                className={`px-4 py-1.5 rounded text-xs font-medium transition-all ${activeTab === "overview"
                                    ? "bg-neutral-800 text-white shadow-sm"
                                    : "text-neutral-500 hover:text-neutral-300"
                                    }`}
                            >
                                Overview
                            </button>
                            <button
                                onClick={() => setActiveTab("financials")}
                                className={`px-4 py-1.5 rounded text-xs font-medium transition-all ${activeTab === "financials"
                                    ? "bg-neutral-800 text-white shadow-sm"
                                    : "text-neutral-500 hover:text-neutral-300"
                                    }`}
                            >
                                Financials
                            </button>
                        </div>
                    </div>
                </div>

                { }
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-[#0a0a0a]">
                    <div className="max-w-[1400px] mx-auto pb-12">
                        {activeTab === "overview" ? (
                            <ModelOverview outputs={outputs} assumptions={assumptions} />
                        ) : (
                            <div className="border border-neutral-800 rounded-md bg-[#0f1110] overflow-hidden">
                                <div className="flex justify-between items-center px-6 py-4 border-b border-neutral-800">
                                    <h3 className="text-sm font-semibold text-white">Pro Forma Financials</h3>
                                    <div className="text-xs text-neutral-500">
                                        5-Year Projection (USD Millions)
                                    </div>
                                </div>
                                <div className="p-0">
                                    <FinancialTable projections={outputs.projections} />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

            </main>
        </div>
    );
}
