import {Truck} from "lucide-react";
export function VehicleThumbnail({className=""}:{className?:string}){
 return <div className={"relative flex items-center justify-center overflow-hidden rounded-xl border border-[#e8edf6] bg-gradient-to-br from-[#f5f8fc] via-white to-[#ebf2fb] "+className}>
 <svg viewBox="0 0 260 110" className="h-full max-h-28 w-full" role="img" aria-label="Illustrated freight vehicle" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="noval-trailer" x1="0" x2="1"><stop offset="0" stopColor="#e7edf5"/><stop offset=".5" stopColor="#ffffff"/><stop offset="1" stopColor="#d6e0ed"/></linearGradient><linearGradient id="noval-cab" x1="0" x2="1"><stop stopColor="#d8e4f1"/><stop offset=".52" stopColor="#fff"/><stop offset="1" stopColor="#aec3d8"/></linearGradient></defs>
  <ellipse cx="136" cy="91" rx="111" ry="7" fill="#c7d5e7" opacity=".45"/>
  <rect x="102" y="23" width="141" height="57" rx="3" fill="url(#noval-trailer)" stroke="#a8bbcf" strokeWidth="1.5"/>
  <rect x="109" y="28" width="3" height="47" rx="1" fill="#d3deed"/><rect x="235" y="28" width="3" height="47" rx="1" fill="#bacbdc"/>
  <rect x="101" y="75" width="146" height="6" rx="2" fill="#465a70"/>
  <path d="M24 52 L34 36 Q36 33 44 33 H86 Q92 33 95 40 L99 53 L101 78 H23 V59 Q23 54 24 52 Z" fill="url(#noval-cab)" stroke="#90a7bc" strokeWidth="1.5"/>
  <path d="M39 38 H80 Q85 38 87 43 L91 53 H35 Z" fill="#6886a3"/><path d="M61 38 V53" stroke="#d8e7f5" strokeWidth="2"/>
  <path d="M22 69 H101 V80 H22 Z" fill="#f6f8fb"/><rect x="22" y="77" width="81" height="6" rx="2" fill="#53677c"/>
  <rect x="26" y="60" width="7" height="5" rx="2" fill="#e8ac63"/><rect x="91" y="59" width="7" height="4" rx="1" fill="#85a6c7"/>
  <circle cx="55" cy="83" r="12" fill="#253442"/><circle cx="55" cy="83" r="5.5" fill="#a1b4c8"/><circle cx="192" cy="83" r="12" fill="#253442"/><circle cx="192" cy="83" r="5.5" fill="#a1b4c8"/>
  <circle cx="214" cy="83" r="12" fill="#253442"/><circle cx="214" cy="83" r="5.5" fill="#a1b4c8"/>
  <rect x="67" y="61" width="19" height="4" rx="2" fill="#8aa4bf" opacity=".5"/>
 </svg>
 <span className="sr-only"><Truck className="size-4"/> Vehicle illustration, not an actual vehicle photo</span>
 </div>;
}
