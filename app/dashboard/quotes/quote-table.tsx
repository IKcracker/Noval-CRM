"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  type ColumnDef, type SortingState, type VisibilityState,
  type RowSelectionState, flexRender, getCoreRowModel,
  getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronLeft, ChevronRight, Columns3, Search, SlidersHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type Item = {
 id:string; reference:string; contact_name:string; company:string|null; email:string;
 origin:string; destination:string; status:string; service_type:string; created_at:string;
};

const statuses = ["NEW","REVIEWING","PRICED","SENT","ACCEPTED","DECLINED","EXPIRED"];
function statusVariant(value:string): "secondary"|"default"|"destructive"|"outline" {
 if(value==="ACCEPTED")return "default";
 if(value==="DECLINED"||value==="EXPIRED")return "destructive";
 if(value==="NEW")return "secondary";
 return "outline";
}
const columns:ColumnDef<Item>[] = [
 { id:"select", header:({table})=><Checkbox aria-label="Select all quotes on page" checked={table.getIsAllPageRowsSelected()} onCheckedChange={v=>table.toggleAllPageRowsSelected(Boolean(v))}/>, cell:({row})=><Checkbox aria-label={"Select "+row.original.reference} checked={row.getIsSelected()} onCheckedChange={v=>row.toggleSelected(Boolean(v))}/>, enableSorting:false,enableHiding:false },
 { accessorKey:"reference", header:({column})=><Button variant="ghost" size="sm" onClick={()=>column.toggleSorting(column.getIsSorted()==="asc")}>Reference <ArrowUpDown className="ml-1 size-3.5"/></Button>, cell:({row})=><Link className="font-semibold text-primary hover:underline" href={"/dashboard/quotes/"+row.original.id}>{row.original.reference}</Link> },
 { accessorKey:"contact_name", header:({column})=><Button variant="ghost" size="sm" onClick={()=>column.toggleSorting(column.getIsSorted()==="asc")}>Customer <ArrowUpDown className="ml-1 size-3.5"/></Button>,cell:({row})=><div className="min-w-36"><p className="font-medium">{row.original.contact_name}</p><p className="max-w-44 truncate text-xs text-muted-foreground">{row.original.company||row.original.email}</p></div> },
 { id:"route", accessorFn:row=>row.origin+" → "+row.destination, header:"Shipping route", cell:({row})=><div className="max-w-56 truncate text-muted-foreground" title={row.original.origin+" → "+row.original.destination}>{row.original.origin} → {row.original.destination}</div> },
 { accessorKey:"service_type",header:"Service" },
 { accessorKey:"created_at",header:({column})=><Button variant="ghost" size="sm" onClick={()=>column.toggleSorting(column.getIsSorted()==="asc")}>Received <ArrowUpDown className="ml-1 size-3.5"/></Button>,cell:({row})=><span className="text-muted-foreground">{new Date(row.original.created_at).toLocaleDateString("en-ZA")}</span> },
 { accessorKey:"status",header:"Status",cell:({row})=><Badge variant={statusVariant(row.original.status)}>{row.original.status.replaceAll("_"," ")}</Badge> },
 { id:"actions",enableSorting:false,enableHiding:false,cell:({row})=><Button nativeButton={false} size="sm" variant="outline" render={<Link href={"/dashboard/quotes/"+row.original.id}/>}>Review →</Button> },
];

export function QuoteTable({rows}:{rows:Item[]}) {
 const [query,setQuery]=useState("");
 const [status,setStatus]=useState("ALL");
 const [sorting,setSorting]=useState<SortingState>([{id:"created_at",desc:true}]);
 const [visibility,setVisibility]=useState<VisibilityState>({});
 const [selection,setSelection]=useState<RowSelectionState>({});
 const filtered=useMemo(()=>rows.filter(r=>(status==="ALL"||r.status===status)&&
   [r.reference,r.contact_name,r.company,r.email,r.origin,r.destination,r.service_type].some(v=>(v||"").toLowerCase().includes(query.toLowerCase().trim()))),[rows,query,status]);
 const table=useReactTable({
  data:filtered,columns,getRowId:row=>row.id,
  state:{sorting,columnVisibility:visibility,rowSelection:selection},
  onSortingChange:setSorting,onColumnVisibilityChange:setVisibility,onRowSelectionChange:setSelection,
  getCoreRowModel:getCoreRowModel(),getSortedRowModel:getSortedRowModel(),getFilteredRowModel:getFilteredRowModel(),getPaginationRowModel:getPaginationRowModel(),
  initialState:{pagination:{pageSize:10}},
 });
 const selected=table.getSelectedRowModel().rows.map(r=>r.original);
 return <div className="space-y-0">
  <div className="flex flex-wrap items-center justify-between gap-4 p-5">
   <div><h2 className="text-lg font-semibold tracking-tight">Quotation pipeline</h2><p className="mt-1 text-xs text-muted-foreground">Review, qualify and price incoming freight enquiries</p></div>
   <Badge variant="secondary">{filtered.length} records</Badge>
  </div>
  <div className="flex flex-wrap items-center gap-2 border-y border-border px-5 py-3">
   <div className="relative min-w-44 flex-1 sm:max-w-sm"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"/><Input aria-label="Search quotations" value={query} onChange={e=>{setQuery(e.target.value);table.setPageIndex(0)}} placeholder="Search quotes, customers, routes..." className="h-9 pl-9"/></div>
   <Select value={status} onValueChange={v=>{setStatus(v??"ALL");table.setPageIndex(0)}}>
    <SelectTrigger aria-label="Filter by status" className="h-9 min-w-40"><SlidersHorizontal className="size-4"/><SelectValue/></SelectTrigger>
    <SelectContent><SelectItem value="ALL">All statuses</SelectItem>{statuses.map(s=><SelectItem key={s} value={s}>{s.replaceAll("_"," ")}</SelectItem>)}</SelectContent>
   </Select>
   <DropdownMenu>
    <DropdownMenuTrigger render={<Button variant="outline" size="sm"/>}><Columns3 className="size-4"/> Columns</DropdownMenuTrigger>
    <DropdownMenuContent align="end"><DropdownMenuLabel>Visible columns</DropdownMenuLabel>{table.getAllLeafColumns().filter(c=>c.getCanHide()).map(c=><DropdownMenuCheckboxItem key={c.id} checked={c.getIsVisible()} onCheckedChange={v=>c.toggleVisibility(Boolean(v))}>{c.id.replaceAll("_"," ")}</DropdownMenuCheckboxItem>)}</DropdownMenuContent>
   </DropdownMenu>
   {selected.length>0&&<Button variant="outline" size="sm" onClick={()=>{const csv=["Reference,Customer,Email,Status",...selected.map(x=>[x.reference,x.contact_name,x.email,x.status].map(v=>'"'+v.replaceAll('"','""')+'"').join(","))].join("\n");const blob=new Blob([csv],{type:"text/csv"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="noval-selected-quotes.csv";a.click();URL.revokeObjectURL(url)}}>Export {selected.length} selected</Button>}
  </div>
  <Table>
   <TableHeader>{table.getHeaderGroups().map(group=><TableRow key={group.id}>{group.headers.map(header=><TableHead key={header.id} className="px-4 py-3">{header.isPlaceholder?null:flexRender(header.column.columnDef.header,header.getContext())}</TableHead>)}</TableRow>)}</TableHeader>
   <TableBody>{table.getRowModel().rows.length ? table.getRowModel().rows.map(row=><TableRow key={row.id} data-state={row.getIsSelected()?"selected":undefined}>{row.getVisibleCells().map(cell=><TableCell key={cell.id} className="px-4 py-3">{flexRender(cell.column.columnDef.cell,cell.getContext())}</TableCell>)}</TableRow>):<TableRow><TableCell colSpan={table.getVisibleLeafColumns().length} className="h-28 text-center text-muted-foreground">No quote requests match your filters.</TableCell></TableRow>}</TableBody>
  </Table>
  <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 text-xs text-muted-foreground">
   <span>{table.getFilteredSelectedRowModel().rows.length} selected · {filtered.length} results</span>
   <div className="flex items-center gap-3"><span>Page {table.getState().pagination.pageIndex+1} of {Math.max(1,table.getPageCount())}</span><Button size="sm" variant="outline" aria-label="Previous page" disabled={!table.getCanPreviousPage()} onClick={()=>table.previousPage()}><ChevronLeft/></Button><Button size="sm" variant="outline" aria-label="Next page" disabled={!table.getCanNextPage()} onClick={()=>table.nextPage()}><ChevronRight/></Button></div>
  </div>
 </div>;
}
