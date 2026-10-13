import Link from "next/link";
/** Public-site wordmark (orange "N" tile + NOVAL.). */
export function Brand({light=false}:{light?:boolean}) {
 return <Link href="/" aria-label="Noval Logistics home" className={`inline-flex items-center gap-3 ${light?"text-white":"text-[#16231e]"}`}>
  <span className="grid size-9 place-items-center bg-[#fb5b32] text-lg font-black tracking-tighter text-white" style={{clipPath:"polygon(0 0,100% 0,100% 77%,77% 100%,0 100%)"}}>N</span>
  <span className="flex flex-col leading-none"><span className="text-lg font-black tracking-[-.08em]">NOVAL<span className="text-[#fb5b32]">.</span></span><span className="mt-1.5 text-[9px] font-bold uppercase tracking-[.32em] opacity-60">Logistics</span></span>
 </Link>
}
