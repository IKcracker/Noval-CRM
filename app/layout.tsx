import type { Metadata } from "next";
import "./globals.css";
export const metadata:Metadata={title:{default:"Noval Logistics | Freight and Shipment Visibility",template:"%s | Noval Logistics"},description:"Request shipping quotes, coordinate road freight and track delivery milestones with Noval Logistics."};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
