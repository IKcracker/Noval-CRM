import Link from "next/link";
import {ArrowUpRight,type LucideIcon} from "lucide-react";
import {Card} from "@/components/ui/card";
export type OverviewStat={label:string;value:string;info:string;chip:string;tone:string;icon:LucideIcon;href:string};
/** Single overview card with divided KPI columns, shared by the dashboard and warehouse pages. */
export function OverviewStats({title,updated,stats}:{title:string;updated:string;stats:OverviewStat[]}){
 return <Card className="rounded-2xl py-0">
  <div className="flex items-center justify-between gap-3 px-5 pt-5 md:px-6"><h1 className="text-[19px] font-semibold tracking-tight">{title}</h1><p className="text-xs text-muted-foreground">Last updated: Today, {updated}</p></div>
  <div className="grid sm:grid-cols-2 xl:grid-cols-4">{stats.map((s,i)=><Link key={s.label} href={s.href} className={"group relative px-5 py-5 transition-colors hover:bg-muted/40 md:px-6 "+(i>0?"xl:before:absolute xl:before:inset-y-5 xl:before:left-0 xl:before:w-px xl:before:bg-border":"")}>
   <p className="flex items-center gap-2.5 text-[13px] text-foreground/80"><s.icon className="size-4.5 text-foreground/70"/>{s.label}<ArrowUpRight className="ml-auto size-3.5 text-muted-foreground opacity-0 transition group-hover:opacity-100"/></p>
   <p className="mt-4 flex items-baseline gap-2.5"><span className="text-[28px] font-semibold tracking-tight tabular-nums">{s.value}</span><span className={"text-xs font-semibold "+s.tone}>{s.chip}</span></p>
   <p className="mt-1 text-[12.5px] text-muted-foreground">{s.info}</p>
  </Link>)}</div>
 </Card>;
}
/** Current time in the depot's timezone, e.g. "14:32". */
export function depotTime(){return new Date().toLocaleTimeString("en-ZA",{hour:"2-digit",minute:"2-digit",timeZone:"Africa/Johannesburg"});}
