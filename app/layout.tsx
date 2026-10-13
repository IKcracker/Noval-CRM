import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
export const metadata:Metadata={
 title:{default:"Noval Logistics | Freight and Shipment Visibility",template:"%s | Noval Logistics"},
 description:"Request freight quotes, manage bookings and track shipment milestones with Noval Logistics."
};
export default function RootLayout({children}:{children:React.ReactNode}){
 return <html lang="en" suppressHydrationWarning><body>{children}<Toaster position="top-right" richColors closeButton/></body></html>;
}
