"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { TickerSearch } from "@/components/ui/TickerSearch";

export default function Home() {
    const router = useRouter();

    const handleSearch = async (ticker: string) => {
        router.push(`/model?ticker=${ticker}`);
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-neutral-800/50">
            {}
            <header className="h-16 border-b border-neutral-800 flex items-center px-8 justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-white rounded-sm"></div>
                    <span className="text-sm font-semibold text-neutral-200">Auto-LBO</span>
                </div>
                <div className="text-xs font-medium text-neutral-500">
                    V3.0
                </div>
            </header>

            {}
            <main className="flex-1 flex flex-col items-center justify-center p-6">
                <div className="w-full max-w-[480px] space-y-8">

                    {}
                    <div className="text-center space-y-3">
                        <h1 className="text-2xl font-semibold text-white tracking-tight">
                            Project Returns Analysis
                        </h1>
                        <p className="text-neutral-500 text-sm">
                            Enter a ticker symbol to generate a full institutional LBO model.
                        </p>
                    </div>

                    {}
                    <div className="bg-[#0f1110] p-6 rounded-lg border border-neutral-800 shadow-xl">
                        <label className="block text-xs font-medium text-neutral-400 mb-2">Ticker Symbol</label>
                        <TickerSearch onSearch={handleSearch} />
                    </div>

                </div>
            </main>

            {}
            <footer className="h-12 border-t border-neutral-800 flex items-center justify-between px-8 text-xs text-neutral-600">
                <div>&copy; 2024 Auto-LBO</div>
                <div className="flex gap-6">
                    <span className="hover:text-neutral-400 cursor-pointer">Documentation</span>
                    <span className="hover:text-neutral-400 cursor-pointer">Methodology</span>
                    <span className="hover:text-neutral-400 cursor-pointer">Export Guide</span>
                </div>
            </footer>
        </div>
    );
}
