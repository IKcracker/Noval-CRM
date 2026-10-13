import Link from "next/link";
import {Arrow,SiteFooter,SiteHeader} from "@/components/site/site-chrome";

const freightImage = "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=2200&q=85";
const warehouseImage = "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1400&q=85";
// Local photo; the previous Unsplash link resolved to an unrelated toy image.
const cargoImage = "/fleet/truck-semi.jpg";

const advantages=[
 ["01","A single point of contact","Your shipment details and conversations stay connected from request through fulfilment."],
 ["02","Planning that fits your cargo","Share handling, quantity and delivery requirements before your shipment is scheduled."],
 ["03","Visibility as it moves","Track shipping milestones through the customer portal as tracking becomes available."]
];
export default function Home(){
 return <main className="min-h-screen bg-[#f5f4ef] font-sans text-[#18251f] selection:bg-[#fb5b32] selection:text-white">
  <SiteHeader/>

  <section className="relative isolate min-h-[600px] overflow-hidden bg-[#18251f] lg:min-h-[640px]">
   <div className="absolute inset-0 bg-cover bg-[center_45%] lg:left-[31%]" style={{backgroundImage:`url("${freightImage}")`}}/>
   <div className="absolute inset-0 bg-gradient-to-r from-[#15251f] via-[#15251f]/90 to-[#15251f]/20 lg:via-[#15251f]/85"/>
   <div className="absolute inset-0 bg-gradient-to-t from-[#14251f]/95 via-transparent to-transparent"/>
   <div className="relative mx-auto flex min-h-[600px] max-w-[1536px] flex-col justify-between px-6 py-16 sm:px-9 lg:min-h-[640px] lg:py-16 xl:px-16">
    <div className="max-w-[920px]">
     <div className="mb-7 flex items-center gap-4"><span className="h-[2px] w-11 bg-[#fb5b32]"/><span className="text-xs font-bold uppercase tracking-[.25em] text-white/80">Freight. Forward thinking.</span></div>
     <h1 className="text-[clamp(2.6rem,5vw,5rem)] font-black leading-[.95] tracking-[-.045em] text-white">MOVE<br/>WITH <span className="text-[#fb5b32]">PURPOSE.</span></h1>
     <div className="mt-8 max-w-[600px] border-l-[3px] border-[#fb5b32] pl-6"><p className="text-base leading-7 text-white/80 md:text-lg">Freight solutions made for the people and businesses that keep South Africa moving. Plan it, book it, and stay informed through every step.</p></div>
     <div className="mt-10 flex flex-wrap gap-3">
      <Link href="/quote" className="inline-flex h-12 items-center justify-between gap-8 bg-[#fb5b32] px-6 text-sm font-extrabold text-white transition hover:bg-[#f47a58]">Request a quote <Arrow diagonal/></Link>
      <Link href="/track" className="inline-flex h-12 items-center justify-between gap-8 border border-white/40 px-6 text-sm font-bold text-white transition hover:bg-white/10">Track a shipment <Arrow/></Link>
     </div>
    </div>
    <div className="mt-16 flex flex-wrap items-center gap-x-10 gap-y-5 border-t border-white/25 pt-6"><span className="text-xs font-extrabold uppercase tracking-[.2em] text-white/50">Transport solutions</span>{["ROAD FREIGHT","DEDICATED TRIPS","EXPRESS DELIVERY"].map(s=><span key={s} className="text-xs font-bold tracking-[.12em] text-white">{s}</span>)}</div>
   </div>
   <div className="absolute bottom-0 right-0 hidden bg-[#fb5b32] px-6 py-5 text-white xl:block"><div className="text-[10px] font-bold uppercase tracking-widest">Ready to ship?</div><Link href="/quote" className="mt-2 flex items-center gap-8 text-lg font-extrabold">Let&apos;s get moving <Arrow diagonal/></Link></div>
  </section>

  <section className="border-b border-[#ddded6] bg-white">
   <div className="mx-auto grid max-w-[1536px] lg:grid-cols-[1fr_1fr]">
    <div className="flex flex-col justify-center px-6 py-16 sm:px-9 lg:py-20 xl:pl-16 xl:pr-24"><div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[.2em] text-[#f05a35]"><span className="h-px w-10 bg-[#f05a35]"/>Built for real-world logistics</div><h2 className="mt-7 max-w-[650px] text-[clamp(2rem,3.4vw,3.25rem)] font-black leading-[.97] tracking-[-.045em]">Every shipment<br/>has a <span className="text-[#ed5938]">destination.</span><br/>We help get it there.</h2><p className="mt-7 max-w-[530px] text-base leading-8 text-[#68736d]">From a single delivery to more complex transport needs, Noval helps coordinate the journey. Share your requirements and get a solution shaped around your cargo, timing and route.</p><Link href="/quote" className="mt-9 inline-flex w-fit items-center gap-7 border-b-2 border-[#18251f] pb-3 text-sm font-extrabold">Tell us what you&apos;re moving <Arrow diagonal/></Link></div>
    <div className="relative min-h-[400px] bg-cover bg-center lg:min-h-[520px]" style={{backgroundImage:`url("${warehouseImage}")`}}><span className="absolute bottom-7 left-7 bg-[#f5f4ef] px-5 py-3 text-[11px] font-extrabold uppercase tracking-[.16em] text-[#18251f]">Commercial logistics / South Africa</span></div>
   </div>
  </section>

  <section id="solutions" className="mx-auto max-w-[1536px] px-6 py-20 sm:px-9 lg:py-24 xl:px-16">
   <div className="flex flex-wrap items-end justify-between gap-8"><div><div className="text-xs font-extrabold uppercase tracking-[.2em] text-[#ed5938]">Our capabilities — 01 / 03</div><h2 className="mt-5 text-[clamp(2rem,3.4vw,3.25rem)] font-black leading-[.95] tracking-[-.045em]">WHAT WE <span className="text-[#ed5938]">MOVE.</span></h2></div><p className="max-w-[400px] text-base leading-7 text-[#64726b]">Shipping requirements differ. Our services are designed to start with what your business actually needs.</p></div>
   <div className="mt-14 grid gap-4 lg:grid-cols-[1.3fr_1fr_1fr]">
    <article className="group relative flex min-h-[400px] flex-col justify-between overflow-hidden bg-[#18251f] p-6 text-white sm:p-8"><div className="absolute inset-0 bg-cover bg-center opacity-55 transition duration-500 group-hover:scale-105" style={{backgroundImage:`url("${freightImage}")`}}/><div className="absolute inset-0 bg-gradient-to-t from-[#12261f] via-[#12261f]/35 to-[#12261f]/45"/><div className="relative flex justify-between"><span className="text-xs font-bold tracking-[.2em]">01 / ROAD FREIGHT</span><span className="text-2xl">↗</span></div><div className="relative"><h3 className="max-w-[390px] text-3xl font-black leading-[1.05] tracking-[-.04em] sm:text-4xl">FREIGHT THAT GOES THE DISTANCE.</h3><p className="mt-5 max-w-sm text-sm leading-7 text-white/75">Commercial road transport planned around your loads, collection points and delivery requirements.</p><Link href="/quote" className="mt-7 inline-flex items-center gap-8 border-b border-white pb-2 text-sm font-bold">Enquire now <Arrow diagonal/></Link></div></article>
    <article className="group flex min-h-[400px] flex-col justify-between overflow-hidden bg-[#e3e6dd] p-6 sm:p-8"><div className="flex items-center justify-between"><span className="text-xs font-bold tracking-[.16em]">02 / DEDICATED TRANSPORT</span><span className="text-2xl">↗</span></div><div><div className="mb-7 h-32 bg-cover bg-center" style={{backgroundImage:`url("${cargoImage}")`}}/><h3 className="text-2xl font-black leading-[1.1] tracking-[-.035em]">YOUR LOAD.<br/>YOUR PLAN.</h3><p className="mt-5 text-sm leading-7 text-[#68736d]">Dedicated transport planning for shipments that need focused coordination.</p><Link href="/quote" className="mt-7 inline-flex items-center gap-6 border-b border-[#18251f] pb-2 text-sm font-bold">Enquire now <Arrow diagonal/></Link></div></article>
    <article className="group flex min-h-[400px] flex-col justify-between bg-[#fb5b32] p-6 text-white sm:p-8"><div className="flex items-center justify-between"><span className="text-xs font-bold tracking-[.16em]">03 / EXPRESS DELIVERY</span><span className="text-2xl">↗</span></div><div><span aria-hidden="true" className="block text-[72px] font-black leading-none tracking-[-.045em] opacity-25">→→</span><h3 className="mt-7 text-2xl font-black leading-[1.1] tracking-[-.035em]">WHEN TIME IS EVERYTHING.</h3><p className="mt-5 text-sm leading-7 text-white/85">Have an urgent delivery? Let our team assess the route, schedule and service options.</p><Link href="/quote" className="mt-7 inline-flex items-center gap-6 border-b border-white pb-2 text-sm font-bold">Enquire now <Arrow diagonal/></Link></div></article>
   </div>
  </section>

  <section id="advantage" className="bg-[#18251f] px-6 py-24 text-white sm:px-9 lg:py-32 xl:px-16">
   <div className="mx-auto max-w-[1408px]"><div className="grid gap-10 lg:grid-cols-[1.1fr_.9fr]"><div><div className="text-xs font-bold uppercase tracking-[.2em] text-[#fb7757]">A smarter approach to shipping</div><h2 className="mt-6 text-[clamp(2rem,3.4vw,3.25rem)] font-black leading-[.95] tracking-[-.045em]">LESS BACK<br/>AND FORTH.<br/><span className="text-[#fb5b32]">MORE FORWARD.</span></h2></div><div className="flex items-end"><p className="max-w-md text-base leading-7 text-white/60">A more connected freight experience starts with clear requests, considered planning and updates that matter. We&apos;re building Noval around those fundamentals.</p></div></div><div className="mt-14 grid gap-8 border-t border-white/20 pt-10 md:grid-cols-3">{advantages.map(([n,title,desc])=><div key={n}><span className="text-sm font-bold text-[#fb7757]">{n} /</span><h3 className="mt-7 max-w-[300px] text-2xl font-extrabold tracking-[-.04em]">{title}</h3><p className="mt-4 max-w-sm text-sm leading-7 text-white/55">{desc}</p></div>)}</div></div>
  </section>

  <section id="process" className="mx-auto max-w-[1536px] px-6 py-20 sm:px-9 lg:py-24 xl:px-16"><div className="grid gap-14 lg:grid-cols-[.75fr_1.25fr]"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-[#ed5938]">The process</p><h2 className="mt-6 text-[clamp(2rem,3.4vw,3.25rem)] font-black leading-[.98] tracking-[-.045em]">FROM<br/>ENQUIRY<br/><span className="text-[#ed5938]">TO ARRIVAL.</span></h2><p className="mt-7 max-w-sm text-base leading-8 text-[#68736d]">Four straightforward stages make it easier to move from an initial request towards a completed shipment.</p></div><div className="divide-y divide-[#d6dbd2] border-t border-[#d6dbd2]">{[["01","Request a quote","Tell us the origin, destination, cargo and preferred timing."],["02","Review and confirm","Our team evaluates your requirements and follows up with a quotation."],["03","Plan the movement","Once agreed, the booking can progress into scheduling and dispatch."],["04","Follow delivery progress","Receive shipment milestones as tracking capabilities are brought online."]].map(([n,title,desc])=><div key={n} className="grid gap-3 py-5 sm:grid-cols-[56px_1fr_1.15fr] sm:items-start"><span className="text-base font-black text-[#ed5938]">{n}</span><h3 className="text-lg font-black tracking-[-.03em]">{title}</h3><p className="text-sm leading-7 text-[#68736d]">{desc}</p></div>)}</div></div></section>

  <section className="bg-[#fb5b32] px-6 py-16 text-white sm:px-9 lg:py-20 xl:px-16"><div className="mx-auto flex max-w-[1408px] flex-wrap items-end justify-between gap-12"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-white/80">Let&apos;s get to work</p><h2 className="mt-6 text-[clamp(2rem,3.4vw,3.25rem)] font-black leading-[.95] tracking-[-.045em]">GOT CARGO?<br/>LET&apos;S <span className="text-[#18251f]">MOVE.</span></h2></div><Link href="/quote" className="inline-flex h-12 items-center gap-8 bg-[#18251f] px-6 text-sm font-extrabold text-white transition hover:bg-[#314840]">Start your quote <Arrow diagonal/></Link></div></section>

  <SiteFooter/>
 </main>
}
