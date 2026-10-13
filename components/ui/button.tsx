import type { ButtonHTMLAttributes } from "react";
type Props = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "default" | "outline" | "ghost"; size?: "default" | "sm" };
export function Button({ variant = "default", size = "default", className = "", ...props }: Props) {
  const variants = { default: "bg-[#173b56] text-white hover:bg-[#0d2d45]", outline: "border border-slate-200 bg-white text-slate-800 hover:bg-slate-50", ghost: "text-slate-700 hover:bg-slate-100" };
  return <button className={`inline-flex cursor-pointer items-center justify-center rounded-xl font-semibold transition disabled:opacity-50 ${size === "sm" ? "px-3 py-2 text-xs" : "px-5 py-3 text-sm"} ${variants[variant]} ${className}`} {...props} />;
}
