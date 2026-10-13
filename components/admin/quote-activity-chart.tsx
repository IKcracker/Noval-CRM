"use client";
import {Bar,BarChart,CartesianGrid,XAxis,YAxis} from "recharts";
import {ChartContainer,ChartTooltip,ChartTooltipContent,type ChartConfig} from "@/components/ui/chart";
const config={quotes:{label:"Quote requests",color:"var(--chart-1)"}} satisfies ChartConfig;
export function QuoteActivityChart({data}:{data:{day:string;label:string;count:number}[]}){
 return <ChartContainer config={config} className="h-[270px] w-full aspect-auto">
  <BarChart accessibilityLayer data={data} margin={{top:12,right:10,left:-24,bottom:0}}>
   <CartesianGrid vertical={false} strokeDasharray="3 4"/>
   <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={10}/>
   <YAxis allowDecimals={false} tickLine={false} axisLine={false}/>
   <ChartTooltip content={<ChartTooltipContent/>}/>
   <Bar dataKey="count" name="quotes" fill="var(--color-quotes)" radius={[6,6,0,0]} maxBarSize={55}/>
  </BarChart>
 </ChartContainer>;
}
