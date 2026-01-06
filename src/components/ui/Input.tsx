import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
}

export function Input({ label, className, ...props }: InputProps) {
    return (
        <div className={`space-y-1.5 ${className}`}>
            <label className="text-xs font-medium text-neutral-400">
                {label}
            </label>
            <div className="relative">
                <input
                    className="
            w-full bg-neutral-900 text-white text-sm
            border border-neutral-700 rounded-md
            py-2 px-3
            placeholder-neutral-600
            focus:outline-none focus:ring-1 focus:ring-neutral-500 focus:border-neutral-500
            transition-all shadow-sm
          "
                    {...props}
                />
            </div>
        </div>
    );
}
