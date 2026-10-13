import type { HTMLAttributes } from "react";
export function Card({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) { return <div className={`rounded-2xl border border-slate-200/90 bg-white shadow-[0_4px_26px_rgba(15,23,42,0.035)] ${className}`} {...props} />; }
