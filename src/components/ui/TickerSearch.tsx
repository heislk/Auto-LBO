import React, { useState } from "react";
import { Loader2, Search } from "lucide-react";

interface TickerSearchProps {
    onSearch: (ticker: string) => Promise<void>;
}

export function TickerSearch({ onSearch }: TickerSearchProps) {
    const [ticker, setTicker] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!ticker.trim()) return;

        setIsLoading(true);
        try {
            await onSearch(ticker);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="relative">
            <input
                type="text"
                placeholder="Search ticker (e.g. AAPL)..."
                className="w-full bg-neutral-900 border border-neutral-700 rounded-md pl-10 pr-4 py-2.5 text-white text-sm placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500 focus:border-neutral-500 transition-all shadow-sm"
                value={ticker}
                onChange={(e) => setTicker(e.target.value)}
                autoFocus
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">
                <Search size={16} />
            </div>
            {isLoading && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 animate-spin">
                    <Loader2 size={16} />
                </div>
            )}
        </form>
    );
}
