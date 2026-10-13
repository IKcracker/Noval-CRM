import Link from "next/link";

const serviceCards = [
  { index:"01", label:"Freight transport", title:"Road freight, without the guesswork.", detail:"Flexible freight coordination for palletised cargo, commercial goods and planned deliveries.", image:"https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=1100&q=85", alt:"Commercial freight truck on a highway" },
  { index:"02", label:"Priority delivery", title:"When timing matters.", detail:"Request a delivery solution tailored to urgent consignments and time-sensitive collections.", image:"https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=1100&q=85", alt:"Shipping packages in a logistics warehouse" },
  { index:"03", label:"Managed transport", title:"One point of contact. Every step.", detail:"Bring collections, dispatch coordination and delivery communication into a clearer process.", image:"https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1100&q=85", alt:"Modern freight warehouse and storage shelves" },
];

const steps = [
  { n:"01", title:"Share your shipment", text:"Tell us what you are moving, where it starts and where it needs to go." },
  { n:"02", title:"Receive a tailored quotation", text:"We review the details and follow up with a proposed transport solution." },
  { n:"03", title:"Confirm the movement", text:"Once the quote is accepted, your shipment can be planned for dispatch." },
  { n:"04", title:"Stay informed", text:"Follow shipment updates as the tracking platform is brought online." },
];

export default function Home() {
  return (
    <main className="overflow-hidden bg-[#f8f9f7] text-[#172827]">
      <div className="bg-[#102f35] px-5 py-2.5 text-center text-[11px] font-semibold tracking-[0.12em] text-white/80 sm:text-xs">
        SHIPPING SOLUTIONS FOR BUSINESSES ACROSS SOUTH AFRICA
      </div>
      <header className="relative z-20 border-b border-[#e5e9e4] bg-white">
        <div className="mx-auto flex h-[82px] max-w-[1440px] items-center justify-between gap-6 px-5 sm:px-8 xl:px-14">
          <Link href="/" aria-label="Noval Logistics home" className="flex shrink-0 items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-[11px] bg-[#123c43] text-xl font-black text-[#d5f273]">N<span className="-ml-1 text-white">.</span></span>
            <span className="flex flex-col leading-none"><span className="text-[21px] font-black tracking-[-0.055em]">NOVAL</span><span className="mt-1 text-[9px] font-bold tracking-[0.28em] text-[#627474]">LOGISTICS</span></span>
          </Link>
          <nav aria-label="Main navigation" className="hidden items-center gap-8 lg:flex">
            <a href="#services" className="text-[13px] font-semibold text-[#445756] transition hover:text-[#008b79]">Our services</a>
            <a href="#why-noval" className="text-[13px] font-semibold text-[#445756] transition hover:text-[#008b79]">Why Noval</a>
            <a href="#how-it-works" className="text-[13px] font-semibold text-[#445756] transition hover:text-[#008b79]">How it works</a>
            <Link href="/track" className="text-[13px] font-semibold text-[#445756] transition hover:text-[#008b79]">Track shipment</Link>
          </nav>
          <div className="hidden items-center gap-5 sm:flex">
            <Link href="/track" className="text-[13px] font-semibold text-[#123c43] lg:hidden">Track shipment</Link>
            <Link href="/quote" className="rounded-full bg-[#d5f273] px-6 py-3.5 text-[13px] font-extrabold text-[#123c43] transition hover:bg-[#c8e968]">Get a quote <span aria-hidden="true" className="ml-2">↗</span></Link>
          </div>
          <details className="group relative sm:hidden">
            <summary className="cursor-pointer list-none rounded-lg border border-[#dfe7e2] px-3 py-2 text-sm font-bold">Menu ☰</summary>
            <nav aria-label="Mobile navigation" className="absolute right-0 top-12 z-30 grid w-56 gap-1 rounded-2xl border border-[#e5e9e4] bg-white p-3 shadow-xl">
              <a href="#services" className="rounded-lg px-3 py-3 text-sm">Services</a>
              <a href="#why-noval" className="rounded-lg px-3 py-3 text-sm">Why Noval</a>
              <a href="#how-it-works" className="rounded-lg px-3 py-3 text-sm">How it works</a>
              <Link href="/track" className="rounded-lg px-3 py-3 text-sm">Track shipment</Link>
              <Link href="/quote" className="rounded-lg bg-[#d5f273] px-3 py-3 text-sm font-bold">Request quote ↗</Link>
            </nav>
          </details>
        </div>
      </header>

      <section className="relative min-h-[650px] bg-[#102f35] lg:min-h-[720px]">
        <div className="absolute inset-0 bg-cover bg-center" style={{backgroundImage:"url('https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=2400&q=90')"}} aria-hidden="true"/>
        <div className="absolute inset-0 bg-gradient-to-r from-[#102f35]/95 via-[#102f35]/83 to-[#102f35]/30" aria-hidden="true"/>
        <div className="absolute inset-0 bg-gradient-to-t from-[#102f35]/70 via-transparent to-transparent" aria-hidden="true"/>
        <div className="relative mx-auto flex min-h-[650px] max-w-[1440px] flex-col justify-center px-6 py-20 sm:px-8 lg:min-h-[720px] xl:px-14">
          <div className="max-w-[780px]">
            <div className="mb-8 flex items-center gap-3"><span className="h-[2px] w-10 bg-[#d5f273]"/><span className="text-[11px] font-bold uppercase tracking-[.25em] text-[#d5f273]">Moving what matters</span></div>
            <h1 className="max-w-[780px] text-[clamp(3.3rem,7vw,7rem)] font-extrabold leading-[0.98] tracking-[-0.065em] text-white">Logistics that<br/><span className="text-[#d5f273]">move you</span><br/>forward.</h1>
            <p className="mt-8 max-w-[550px] text-base leading-8 text-[#e2e9e8] sm:text-lg">From the first collection to the final handover, get the shipping support your business needs to keep moving.</p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link href="/quote" className="inline-flex items-center justify-center rounded-full bg-[#d5f273] px-7 py-4 text-sm font-extrabold text-[#123c43] transition hover:bg-white">Request a shipping quote <span className="ml-5 text-lg" aria-hidden="true">↗</span></Link>
              <a href="#services" className="inline-flex items-center justify-center rounded-full border border-white/50 px-7 py-4 text-sm font-semibold text-white transition hover:bg-white/10">Explore our services <span className="ml-5" aria-hidden="true">↓</span></a>
            </div>
          </div>
          <div className="mt-16 flex flex-wrap items-center gap-x-10 gap-y-4 border-t border-white/25 pt-7 text-xs font-semibold uppercase tracking-[.13em] text-white/75">
            <span>Road freight</span><span>Dedicated transport</span><span>Courier solutions</span><span>Delivery coordination</span>
          </div>
        </div>
        <div className="absolute bottom-0 right-0 hidden bg-[#d5f273] px-9 py-6 text-[#123c43] xl:block"><p className="text-[11px] font-bold uppercase tracking-[.18em]">Have something to move?</p><Link href="/quote" className="mt-2 block text-xl font-extrabold tracking-tight">Let's get it there ↗</Link></div>
      </section>

      <section id="services" className="mx-auto max-w-[1440px] px-6 py-24 sm:px-8 lg:py-32 xl:px-14">
        <div className="grid items-end gap-8 lg:grid-cols-[1fr_0.7fr]">
          <div><p className="text-xs font-extrabold uppercase tracking-[.23em] text-[#008b79]">What we do</p><h2 className="mt-5 max-w-[700px] text-[clamp(2.5rem,4vw,4.7rem)] font-extrabold leading-[1.08] tracking-[-.06em]">Your cargo. <span className="text-[#758e8a]">Our commitment.</span></h2></div>
          <p className="max-w-[410px] text-base leading-8 text-[#667572] lg:ml-auto">Every shipment brings its own challenges. We help you find a practical freight solution, with clear communication from inquiry to delivery.</p>
        </div>
        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {serviceCards.map((service)=><article key={service.index} className="group overflow-hidden rounded-[22px] border border-[#e7ebe6] bg-white transition hover:-translate-y-1 hover:shadow-xl">
            <div className="relative h-[250px] overflow-hidden bg-[#dbe5e2] sm:h-[300px]"><div className="h-full w-full bg-cover bg-center transition duration-500 group-hover:scale-105" style={{backgroundImage:`url("${service.image}")`}} role="img" aria-label={service.alt}/><span className="absolute left-6 top-6 rounded-full bg-white/95 px-4 py-2 text-[11px] font-bold uppercase tracking-[.13em] text-[#123c43]">{service.label}</span></div>
            <div className="p-7"><div className="flex items-center justify-between"><span className="text-xs font-bold text-[#8b9c96]">{service.index} / 03</span><span className="text-2xl text-[#008b79]" aria-hidden="true">↗</span></div><h3 className="mt-7 max-w-xs text-[26px] font-extrabold leading-tight tracking-[-.04em]">{service.title}</h3><p className="mt-4 min-h-24 text-sm leading-7 text-[#667572]">{service.detail}</p><Link href="/quote" className="inline-block border-b border-[#123c43] pb-1 text-sm font-bold text-[#123c43]">Request this service ↗</Link></div>
          </article>)}
        </div>
      </section>

      <section id="why-noval" className="bg-[#eaf0ec]">
        <div className="mx-auto grid max-w-[1440px] lg:grid-cols-2">
          <div className="min-h-[390px] bg-cover bg-center lg:min-h-[620px]" style={{backgroundImage:"url('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1400&q=85')"}} role="img" aria-label="Logistics distribution centre"/>
          <div className="flex flex-col justify-center px-7 py-20 sm:px-12 lg:px-16 xl:px-20">
            <p className="text-xs font-extrabold uppercase tracking-[.23em] text-[#008b79]">A better way to ship</p>
            <h2 className="mt-5 max-w-[560px] text-[clamp(2.5rem,4vw,4.6rem)] font-extrabold leading-[1.07] tracking-[-.06em]">More clarity.<br/>Less complexity.</h2>
            <p className="mt-7 max-w-[520px] leading-8 text-[#657671]">You have a business to run. Shipping should not mean chasing updates or repeating the same details. We are building a connected process between your quote request and delivery coordination.</p>
            <div className="mt-10 space-y-6">
              {[["01","A straightforward quote process","Share shipment information once, so our team can assess your requirements."],["02","Coordinated freight planning","Confirm the details that matter before your shipment is scheduled."],["03","A clear path to delivery","Track key milestones as our customer tracking service becomes available."]].map(([n,title,desc])=><div key={n} className="flex gap-5 border-t border-[#cbd8d1] pt-5"><span className="pt-1 text-xs font-extrabold text-[#008b79]">{n}</span><div><h3 className="font-extrabold">{title}</h3><p className="mt-2 text-sm leading-6 text-[#657671]">{desc}</p></div></div>)}
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="mx-auto max-w-[1440px] px-6 py-24 sm:px-8 lg:py-32 xl:px-14">
        <div className="flex flex-wrap items-end justify-between gap-6"><div><p className="text-xs font-extrabold uppercase tracking-[.23em] text-[#008b79]">The process</p><h2 className="mt-5 text-[clamp(2.5rem,4vw,4.7rem)] font-extrabold tracking-[-.06em]">Shipping, simplified.</h2></div><Link href="/quote" className="rounded-full border border-[#c7d1ca] px-6 py-3 text-sm font-extrabold text-[#123c43] transition hover:bg-[#eaf0ec]">Start a quote ↗</Link></div>
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{steps.map(step=><div key={step.n} className="border-t-2 border-[#153d42] pt-6"><span className="text-5xl font-extrabold tracking-[-.06em] text-[#c3d4cb]">{step.n}</span><h3 className="mt-8 text-xl font-extrabold tracking-tight">{step.title}</h3><p className="mt-4 text-sm leading-7 text-[#667572]">{step.text}</p></div>)}</div>
      </section>

      <section className="mx-4 mb-5 rounded-[26px] bg-[#123c43] px-7 py-20 text-white sm:mx-8 lg:rounded-[32px] lg:py-24">
        <div className="mx-auto flex max-w-[1250px] flex-wrap items-center justify-between gap-10"><div><p className="text-xs font-extrabold uppercase tracking-[.23em] text-[#d5f273]">Let's move forward</p><h2 className="mt-5 max-w-[700px] text-[clamp(2.8rem,5vw,5.8rem)] font-extrabold leading-[1.04] tracking-[-.06em]">Your next shipment starts here.</h2><p className="mt-5 max-w-md text-base leading-7 text-white/65">Tell us what you need transported and we'll review your request.</p></div><Link href="/quote" className="shrink-0 rounded-full bg-[#d5f273] px-8 py-5 text-sm font-extrabold text-[#123c43] transition hover:bg-white">Request a quote <span className="ml-6" aria-hidden="true">↗</span></Link></div>
      </section>
      <footer className="bg-[#f8f9f7] px-6 py-14 sm:px-8 xl:px-14"><div className="mx-auto max-w-[1340px]"><div className="flex flex-wrap justify-between gap-12 border-b border-[#d8e0d9] pb-12"><div><p className="text-2xl font-black tracking-[-.06em]">NOVAL <span className="font-medium">LOGISTICS</span></p><p className="mt-4 max-w-xs text-sm leading-7 text-[#667572]">Practical shipping solutions and clear communication from inquiry to delivery.</p></div><div className="flex flex-wrap gap-x-14 gap-y-7 text-sm font-semibold"><div className="grid gap-4"><a href="#services">Our services</a><a href="#how-it-works">How it works</a><a href="#why-noval">Why Noval</a></div><div className="grid gap-4"><Link href="/quote">Request a quote</Link><Link href="/track">Track shipment</Link></div></div></div><div className="flex flex-wrap justify-between gap-4 pt-7 text-xs text-[#87958d]"><span>© {new Date().getFullYear()} Noval Logistics. All rights reserved.</span><span>South Africa · Road freight and delivery coordination</span></div></div></footer>
    </main>
  );
}
