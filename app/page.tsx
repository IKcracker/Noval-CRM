import Link from "next/link";

const freightImage = "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=2200&q=85";
const warehouseImage = "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1400&q=85";
const cargoImage = "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=1400&q=85";

function Brand({light=false}:{light?:boolean}) {
 return <Link href="/" aria-label="Noval Logistics home" className={`inline-flex items-center gap-3 ${light?"text-white":"text-[#16231e]"}`}>
  <span className="grid size-10 place-items-center bg-[#fb5b32] text-xl font-black tracking-tighter text-white" style={{clipPath:"polygon(0 0,100% 0,100% 77%,77% 100%,0 100%)"}}>N</span>
  <span className="flex flex-col leading-none"><span className="text-xl font-black tracking-[-.08em]">NOVAL<span className="text-[#fb5b32]">.</span></span><span className="mt-1.5 text-[9px] font-bold uppercase tracking-[.32em] opacity-60">Logistics</span></span>
 </Link>
}
function Arrow({diagonal=false}:{diagonal?:boolean}){return <span aria-hidden="true" className="text-xl font-light">{diagonal?"↗":"→"}</span>}
const advantages=[
 ["01","A single point of contact","Your shipment details and conversations stay connected from request through fulfilment."],
 ["02","Planning that fits your cargo","Share handling, quantity and delivery requirements before your shipment is scheduled."],
 ["03","Visibility as it moves","Track shipping milestones through the customer portal as tracking becomes available."]
];
export default function Home(){
 return <main className="min-h-screen bg-[#f5f4ef] font-sans text-[#18251f] selection:bg-[#fb5b32] selection:text-white">
  <header className="relative z-20 border-b border-[#e7e5dc] bg-[#f5f4ef]">
   <div className="mx-auto flex h-[88px] max-w-[1536px] items-center justify-between px-5 sm:px-9 xl:px-16">
    <Brand/>
    <nav aria-label="Main navigation" className="hidden items-center gap-9 lg:flex">
     <a className="text-[13px] font-semibold hover:text-[#e74f2d]" href="#solutions">Solutions</a>
     <a className="text-[13px] font-semibold hover:text-[#e74f2d]" href="#advantage">Why Noval</a>
     <a className="text-[13px] font-semibold hover:text-[#e74f2d]" href="#process">How it works</a>
     <Link className="text-[13px] font-semibold hover:text-[#e74f2d]" href="/track">Track a shipment</Link>
    </nav>
    <Link href="/quote" className="hidden items-center gap-5 bg-[#18251f] px-6 py-4 text-xs font-extrabold uppercase tracking-[.13em] text-white transition hover:bg-[#fb5b32] sm:inline-flex">Get a freight quote <Arrow diagonal/></Link>
    <details className="group relative sm:hidden">
     <summary className="cursor-pointer list-none border border-[#cccfc6] px-4 py-3 text-xs font-bold uppercase tracking-widest">Menu +</summary>
     <nav aria-label="Mobile navigation" className="absolute right-0 top-14 z-50 grid w-60 gap-1 border border-[#e7e5dc] bg-[#f5f4ef] p-3 shadow-2xl">
      <a href="#solutions" className="p-3 text-sm">Solutions</a><a href="#advantage" className="p-3 text-sm">Why Noval</a><a href="#process" className="p-3 text-sm">How it works</a><Link href="/track" className="p-3 text-sm">Track shipment</Link><Link href="/quote" className="bg-[#fb5b32] p-3 text-sm font-bold text-white">Get a quote ↗</Link>
     </nav>
    </details>
   </div>
  </header>

  <section className="relative isolate min-h-[760px] overflow-hidden bg-[#18251f] lg:min-h-[790px]">
   <div className="absolute inset-0 bg-cover bg-[center_45%] lg:left-[31%]" style={{backgroundImage:`url("${freightImage}")`}}/>
   <div className="absolute inset-0 bg-gradient-to-r from-[#15251f] via-[#15251f]/90 to-[#15251f]/20 lg:via-[#15251f]/85"/>
   <div className="absolute inset-0 bg-gradient-to-t from-[#14251f]/95 via-transparent to-transparent"/>
   <div className="relative mx-auto flex min-h-[760px] max-w-[1536px] flex-col justify-between px-6 py-16 sm:px-9 lg:min-h-[790px] lg:py-20 xl:px-16">
    <div className="max-w-[920px]">
     <div className="mb-9 flex items-center gap-4"><span className="h-[2px] w-11 bg-[#fb5b32]"/><span className="text-xs font-bold uppercase tracking-[.25em] text-white/80">Freight. Forward thinking.</span></div>
     <h1 className="text-[clamp(4.15rem,8.8vw,10rem)] font-black leading-[.88] tracking-[-.083em] text-white">MOVE<br/>WITH <span className="text-[#fb5b32]">PURPOSE.</span></h1>
     <div className="mt-10 max-w-[630px] border-l-[3px] border-[#fb5b32] pl-6"><p className="text-lg leading-8 text-white/80 md:text-[21px]">Freight solutions made for the people and businesses that keep South Africa moving. Plan it, book it, and stay informed through every step.</p></div>
     <div className="mt-10 flex flex-wrap gap-3">
      <Link href="/quote" className="inline-flex min-h-14 items-center justify-between gap-12 bg-[#fb5b32] px-7 py-4 text-sm font-extrabold text-white transition hover:bg-[#f47a58]">Request a quote <Arrow diagonal/></Link>
      <Link href="/track" className="inline-flex min-h-14 items-center justify-between gap-12 border border-white/40 px-7 py-4 text-sm font-bold text-white transition hover:bg-white/10">Track a shipment <Arrow/></Link>
     </div>
    </div>
    <div className="mt-16 flex flex-wrap items-center gap-x-10 gap-y-5 border-t border-white/25 pt-6"><span className="text-xs font-extrabold uppercase tracking-[.2em] text-white/50">Transport solutions</span>{["ROAD FREIGHT","DEDICATED TRIPS","EXPRESS DELIVERY"].map(s=><span key={s} className="text-xs font-bold tracking-[.12em] text-white">{s}</span>)}</div>
   </div>
   <div className="absolute bottom-0 right-0 hidden bg-[#fb5b32] px-8 py-7 text-white xl:block"><div className="text-[10px] font-bold uppercase tracking-widest">Ready to ship?</div><Link href="/quote" className="mt-2 flex items-center gap-8 text-lg font-extrabold">Let&apos;s get moving <Arrow diagonal/></Link></div>
  </section>

  <section className="border-b border-[#ddded6] bg-white">
   <div className="mx-auto grid max-w-[1536px] lg:grid-cols-[1fr_1fr]">
    <div className="flex flex-col justify-center px-6 py-16 sm:px-9 lg:py-24 xl:pl-16 xl:pr-24"><div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[.2em] text-[#f05a35]"><span className="h-px w-10 bg-[#f05a35]"/>Built for real-world logistics</div><h2 className="mt-7 max-w-[650px] text-[clamp(2.8rem,4.9vw,5.8rem)] font-black leading-[.97] tracking-[-.073em]">Every shipment<br/>has a <span className="text-[#ed5938]">destination.</span><br/>We help get it there.</h2><p className="mt-7 max-w-[530px] text-base leading-8 text-[#68736d]">From a single delivery to more complex transport needs, Noval helps coordinate the journey. Share your requirements and get a solution shaped around your cargo, timing and route.</p><Link href="/quote" className="mt-9 inline-flex w-fit items-center gap-7 border-b-2 border-[#18251f] pb-3 text-sm font-extrabold">Tell us what you&apos;re moving <Arrow diagonal/></Link></div>
    <div className="relative min-h-[400px] bg-cover bg-center lg:min-h-[620px]" style={{backgroundImage:`url("${warehouseImage}")`}}><span className="absolute bottom-7 left-7 bg-[#f5f4ef] px-5 py-3 text-[11px] font-extrabold uppercase tracking-[.16em] text-[#18251f]">Commercial logistics / South Africa</span></div>
   </div>
  </section>

  <section id="solutions" className="mx-auto max-w-[1536px] px-6 py-24 sm:px-9 lg:py-32 xl:px-16">
   <div className="flex flex-wrap items-end justify-between gap-8"><div><div className="text-xs font-extrabold uppercase tracking-[.2em] text-[#ed5938]">Our capabilities — 01 / 03</div><h2 className="mt-5 text-[clamp(3rem,5vw,5.8rem)] font-black leading-[.95] tracking-[-.075em]">WHAT WE <span className="text-[#ed5938]">MOVE.</span></h2></div><p className="max-w-[400px] text-base leading-7 text-[#64726b]">Shipping requirements differ. Our services are designed to start with what your business actually needs.</p></div>
   <div className="mt-14 grid gap-4 lg:grid-cols-[1.3fr_1fr_1fr]">
    <article className="group relative flex min-h-[530px] flex-col justify-between overflow-hidden bg-[#18251f] p-8 text-white sm:p-10"><div className="absolute inset-0 bg-cover bg-center opacity-55 transition duration-500 group-hover:scale-105" style={{backgroundImage:`url("${freightImage}")`}}/><div className="absolute inset-0 bg-gradient-to-t from-[#12261f] via-[#12261f]/35 to-[#12261f]/45"/><div className="relative flex justify-between"><span className="text-xs font-bold tracking-[.2em]">01 / ROAD FREIGHT</span><span className="text-2xl">↗</span></div><div className="relative"><h3 className="max-w-[390px] text-4xl font-black leading-[1.02] tracking-[-.055em] sm:text-5xl">FREIGHT THAT GOES THE DISTANCE.</h3><p className="mt-5 max-w-sm text-sm leading-7 text-white/75">Commercial road transport planned around your loads, collection points and delivery requirements.</p><Link href="/quote" className="mt-7 inline-flex items-center gap-8 border-b border-white pb-2 text-sm font-bold">Enquire now <Arrow diagonal/></Link></div></article>
    <article className="group flex min-h-[530px] flex-col justify-between overflow-hidden bg-[#e3e6dd] p-8 sm:p-10"><div className="flex items-center justify-between"><span className="text-xs font-bold tracking-[.16em]">02 / DEDICATED TRANSPORT</span><span className="text-2xl">↗</span></div><div><div className="mb-9 h-40 bg-cover bg-center" style={{backgroundImage:`url("${cargoImage}")`}}/><h3 className="text-3xl font-black leading-[1.07] tracking-[-.05em]">YOUR LOAD.<br/>YOUR PLAN.</h3><p className="mt-5 text-sm leading-7 text-[#68736d]">Dedicated transport planning for shipments that need focused coordination.</p><Link href="/quote" className="mt-7 inline-flex items-center gap-6 border-b border-[#18251f] pb-2 text-sm font-bold">Enquire now <Arrow diagonal/></Link></div></article>
    <article className="group flex min-h-[530px] flex-col justify-between bg-[#fb5b32] p-8 text-white sm:p-10"><div className="flex items-center justify-between"><span className="text-xs font-bold tracking-[.16em]">03 / EXPRESS DELIVERY</span><span className="text-2xl">↗</span></div><div><span aria-hidden="true" className="block text-[112px] font-black leading-none tracking-[-.1em] opacity-25">→→</span><h3 className="mt-7 text-3xl font-black leading-[1.07] tracking-[-.05em]">WHEN TIME IS EVERYTHING.</h3><p className="mt-5 text-sm leading-7 text-white/85">Have an urgent delivery? Let our team assess the route, schedule and service options.</p><Link href="/quote" className="mt-7 inline-flex items-center gap-6 border-b border-white pb-2 text-sm font-bold">Enquire now <Arrow diagonal/></Link></div></article>
   </div>
  </section>

  <section id="advantage" className="bg-[#18251f] px-6 py-24 text-white sm:px-9 lg:py-32 xl:px-16">
   <div className="mx-auto max-w-[1408px]"><div className="grid gap-10 lg:grid-cols-[1.1fr_.9fr]"><div><div className="text-xs font-bold uppercase tracking-[.2em] text-[#fb7757]">A smarter approach to shipping</div><h2 className="mt-6 text-[clamp(3.2rem,6.3vw,7.8rem)] font-black leading-[.91] tracking-[-.08em]">LESS BACK<br/>AND FORTH.<br/><span className="text-[#fb5b32]">MORE FORWARD.</span></h2></div><div className="flex items-end"><p className="max-w-md text-lg leading-8 text-white/60">A more connected freight experience starts with clear requests, considered planning and updates that matter. We&apos;re building Noval around those fundamentals.</p></div></div><div className="mt-20 grid gap-8 border-t border-white/20 pt-10 md:grid-cols-3">{advantages.map(([n,title,desc])=><div key={n}><span className="text-sm font-bold text-[#fb7757]">{n} /</span><h3 className="mt-7 max-w-[300px] text-2xl font-extrabold tracking-[-.04em]">{title}</h3><p className="mt-4 max-w-sm text-sm leading-7 text-white/55">{desc}</p></div>)}</div></div>
  </section>

  <section id="process" className="mx-auto max-w-[1536px] px-6 py-24 sm:px-9 lg:py-32 xl:px-16"><div className="grid gap-14 lg:grid-cols-[.75fr_1.25fr]"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-[#ed5938]">The process</p><h2 className="mt-6 text-[clamp(3rem,4.8vw,5.7rem)] font-black leading-[.98] tracking-[-.07em]">FROM<br/>ENQUIRY<br/><span className="text-[#ed5938]">TO ARRIVAL.</span></h2><p className="mt-7 max-w-sm text-base leading-8 text-[#68736d]">Four straightforward stages make it easier to move from an initial request towards a completed shipment.</p></div><div className="divide-y divide-[#d6dbd2] border-t border-[#d6dbd2]">{[["01","Request a quote","Tell us the origin, destination, cargo and preferred timing."],["02","Review and confirm","Our team evaluates your requirements and follows up with a quotation."],["03","Plan the movement","Once agreed, the booking can progress into scheduling and dispatch."],["04","Follow delivery progress","Receive shipment milestones as tracking capabilities are brought online."]].map(([n,title,desc])=><div key={n} className="grid gap-4 py-7 sm:grid-cols-[65px_1fr_1.15fr] sm:items-start"><span className="text-lg font-black text-[#ed5938]">{n}</span><h3 className="text-xl font-black tracking-[-.04em]">{title}</h3><p className="text-sm leading-7 text-[#68736d]">{desc}</p></div>)}</div></div></section>

  <section className="bg-[#fb5b32] px-6 py-20 text-white sm:px-9 lg:py-28 xl:px-16"><div className="mx-auto flex max-w-[1408px] flex-wrap items-end justify-between gap-12"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-white/80">Let&apos;s get to work</p><h2 className="mt-6 text-[clamp(3.5rem,7.5vw,9rem)] font-black leading-[.9] tracking-[-.08em]">GOT CARGO?<br/>LET&apos;S <span className="text-[#18251f]">MOVE.</span></h2></div><Link href="/quote" className="inline-flex items-center gap-14 bg-[#18251f] px-8 py-5 text-sm font-extrabold text-white transition hover:bg-[#314840]">Start your quote <Arrow diagonal/></Link></div></section>

  <footer className="bg-[#14231d] px-6 py-14 text-white sm:px-9 xl:px-16"><div className="mx-auto max-w-[1408px]"><div className="grid gap-12 border-b border-white/15 pb-16 lg:grid-cols-[1.4fr_1fr_1fr]"><div><Brand light/><p className="mt-7 max-w-xs text-sm leading-7 text-white/55">Practical freight solutions, clear communication, and better connected shipping.</p></div><div><p className="mb-6 text-xs font-bold uppercase tracking-[.19em] text-[#fb7757]">Explore</p><div className="grid gap-4 text-sm text-white/70"><a href="#solutions">Our solutions</a><a href="#advantage">Why Noval</a><a href="#process">How it works</a></div></div><div><p className="mb-6 text-xs font-bold uppercase tracking-[.19em] text-[#fb7757]">Your shipment</p><div className="grid gap-4 text-sm text-white/70"><Link href="/quote">Request a quote</Link><Link href="/track">Track shipment</Link></div></div></div><div className="flex flex-wrap justify-between gap-5 pt-7 text-xs text-white/45"><span>© 2026 Noval Logistics. All rights reserved.</span><span>Freight and delivery coordination · South Africa</span></div></div></footer>
 </main>
}
