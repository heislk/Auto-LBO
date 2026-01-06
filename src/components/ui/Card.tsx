import React from "react";

interface CardProps {
    children: React.ReactNode;
    className?: string;
    title?: string;
}

export function Card({ children, className = "", title }: CardProps) {
    return (
        <div
            className={`bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl ${className}`}
        >
            {title && (
                <h3 className="text-xl font-semibold text-white/90 mb-4 tracking-tight">
                    {title}
                </h3>
            )}
            {children}
        </div>
    );
}
