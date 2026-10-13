export type RawListParams={q?:string|string[];status?:string|string[];sort?:string|string[];page?:string|string[]};
const sortOptions=["newest","oldest","customer","status"] as const;
export function parseOperationsQuery(input:RawListParams,validStatuses:string[]){
 const text=(v:unknown)=>typeof v==="string"?v:"";
 const q=text(input.q).trim().slice(0,120);
 const candidate=text(input.status).toUpperCase();
 const status=validStatuses.includes(candidate)?candidate:"ALL";
 const sorting=text(input.sort);
 const sort=sortOptions.some(x=>x===sorting)?sorting:"newest";
 const parsed=Number(text(input.page));
 const requestedPage=Number.isSafeInteger(parsed)&&parsed>0?Math.min(100000,parsed):1;
 return {q,status,sort,requestedPage,pattern:"%"+q.replace(/[\\%_]/g,c=>"\\"+c)+"%"};
}
export function countPages(total:number,size:number){return Math.max(1,Math.ceil(total/size));}
