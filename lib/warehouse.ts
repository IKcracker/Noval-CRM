export const loadingStatuses=["NOT_STARTED","LOADING","READY"] as const;
export type LoadingStatus=typeof loadingStatuses[number];
/** Number of physical loading docks; configure WAREHOUSE_DOCK_COUNT per depot. */
export function dockCount(){
 const value=Number(process.env.WAREHOUSE_DOCK_COUNT);
 return Number.isInteger(value)&&value>=1&&value<=99?value:10;
}
