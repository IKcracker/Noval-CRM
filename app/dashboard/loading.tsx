import {Skeleton} from "@/components/ui/skeleton";
// Suspense boundary below the dashboard layout, so client navigations between
// workspace pages show this skeleton while the page reads the session and records.
export default function WorkspaceLoading(){
 return <div className="mx-auto max-w-[1740px] space-y-5 p-4 md:p-6" aria-busy="true" aria-label="Loading workspace">
  <Skeleton className="h-36 rounded-2xl"/>
  <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">{Array.from({length:6},(_,i)=><Skeleton key={i} className="h-64 rounded-xl"/>)}</div>
 </div>;
}
