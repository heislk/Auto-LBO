import React from "react";

interface StatCardProps {
    label: string;
    value: string;
    subValue?: string;
    className?: string;
}

export function StatCard({ label, value, subValue, className }: StatCardProps) {
    return (
        <div className={`bg-neutral-900 border border-neutral-800 p-4 rounded-md shadow-sm ${className}`}>
            <div className="flex justify-between items-start mb-2">
                <span className="text-sm font-medium text-neutral-400">{label}</span>
            </div>
            <div className="flex items-baseline justify-between">
                <span className="text-2xl font-semibold text-white tracking-tight">{value}</span>
                {subValue && (
                    <span className="text-xs text-neutral-500 font-medium">{subValue}</span>
                )}
            </div>
        </div>
    );
}
