import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Laptop, Smartphone, Monitor, Printer, Headphones, Cpu, ShieldCheck, Network, Wrench, MapPin, Phone, MessageCircle } from 'lucide-react';
import { HomeCatalog } from '@/components/products/HomeCatalog';

const categories = [
  { name: 'Laptops', value: 'laptops', icon: Laptop, detail: 'Work. Create. Go further.' },
  { name: 'Phones & tablets', value: 'phones', icon: Smartphone, detail: 'Your everyday companion.' },
  { name: 'TVs & displays', value: 'tvs', icon: Monitor, detail: 'See the bigger picture.' },
  { name: 'PCs & components', value: 'pcs', icon: Cpu, detail: 'Build your next setup.' },
  { name: 'Printers', value: 'printers', icon: Printer, detail: 'Keep business moving.' },
  { name: 'Accessories', value: 'accessories', icon: Headphones, detail: 'The details that matter.' },
];
const services = [
  { icon: ShieldCheck, title: 'CCTV & security', text: 'Plan a camera setup around your space, coverage needs and budget.', query: 'CCTV installation' },
  { icon: Network, title: 'Networks that connect', text: 'Get help with Wi-Fi coverage, cabling and connectivity for your team.', query: 'Network installation' },
  { icon: Wrench, title: 'Repairs & technical support', text: 'Describe the issue. We’ll help you work out the right next step.', query: 'Device repair' },
];

export default function Home() {
  return <div className="store-home">
    <section className="home-hero" aria-labelledby="home-title">
      <div className="home-wrap grid gap-12 py-14 sm:py-20 lg:grid-cols-[1.15fr_1fr] lg:items-center lg:py-24">
        <div>
          <p className="home-eyebrow text-orange-300">KETRONICS SOLUTIONS LTD · ELDORET, KENYA</p>
          <h1 id="home-title" className="mt-6 max-w-[13ch] text-5xl font-semibold leading-[1.03] tracking-[-.055em] sm:text-6xl xl:text-7xl">Good technology.<br/><span className="text-orange-300">Great possibilities.</span></h1>
          <p className="mt-6 max-w-lg text-base leading-7 text-slate-300 sm:text-lg">From your next laptop to a connected business. Find the devices, practical advice and hands-on support to make it happen.</p>
          <div className="mt-8 flex flex-wrap gap-3"><Link href="/products" className="home-button home-button-primary">Explore the store <ArrowRight size={18}/></Link><Link href="/contact" className="home-button border border-white/30 text-white hover:bg-white/10">Discuss a project <ArrowUpRight size={18}/></Link></div>
          <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-300"><span className="flex items-center gap-2"><MapPin size={16}/> Local team in Eldoret</span><span className="flex items-center gap-2"><MessageCircle size={16}/> Advice before you buy</span></div>
        </div>
        <div className="home-studio">
          <div className="flex items-center justify-between border-b border-white/10 pb-5"><span className="home-eyebrow text-slate-400">YOUR NEXT SETUP STARTS HERE</span><span className="h-2 w-2 rounded-full bg-orange-300"/></div>
          <div className="relative flex min-h-64 items-center justify-center py-10" aria-hidden="true"><div className="home-monitor"><div className="home-screen"><span className="text-xs tracking-[.25em] text-orange-200">WORK / CREATE / CONNECT</span><span className="mt-5 block text-5xl font-semibold tracking-[-.07em]">Make<br/>what’s next.</span><div className="mt-6 h-1 w-12 bg-orange-300"/></div></div></div>
          <div className="mt-6 grid grid-cols-3 gap-2 border-t border-white/10 pt-5">{[['01','Find your device'],['02','Build your setup'],['03','Get support']].map(([n,label])=><div key={n}><span className="text-xs text-orange-300">{n}</span><p className="mt-2 text-xs leading-5 text-slate-200">{label}</p></div>)}</div>
        </div>
      </div>
    </section>
    <section className="home-wrap py-12 sm:py-16" aria-labelledby="categories-title">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4"><div><p className="home-eyebrow text-muted-foreground">FIND YOUR FOCUS</p><h2 id="categories-title" className="home-heading mt-2">A better setup starts here.</h2></div><Link href="/products" className="home-text-link">All products <ArrowRight size={16}/></Link></div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">{categories.map(({name,value,icon:Icon,detail})=><Link key={value} href={`/products?category=${value}`} className="home-category group"><Icon size={30} strokeWidth={1.5} className="mb-7 text-primary transition-transform group-hover:-translate-y-1"/><h3 className="text-sm font-semibold">{name}</h3><p className="mt-2 text-xs leading-5 text-muted-foreground">{detail}</p><ArrowUpRight size={16} className="absolute right-4 top-4 text-muted-foreground"/></Link>)}</div>
    </section>
    <HomeCatalog/>
    <section className="home-wrap py-12 sm:py-20" aria-labelledby="services-title"><div className="grid gap-8 border-t border-border pt-12 lg:grid-cols-[.8fr_1.2fr]"><div><p className="home-eyebrow text-muted-foreground">BEYOND THE BOX</p><h2 id="services-title" className="home-heading mt-3 max-w-sm">Technology is only the beginning.</h2><p className="mt-4 max-w-sm text-sm leading-7 text-muted-foreground">A device is useful when it works for you. Talk to Ketronics about installation, connectivity and keeping your equipment running.</p><Link href="/services" className="home-text-link mt-6">Talk about your project <ArrowRight size={16}/></Link></div><div className="space-y-3">{services.map(({icon:Icon,title,text,query})=><Link key={title} href={`/contact?subject=${encodeURIComponent(query)}`} className="home-service group"><Icon size={24} strokeWidth={1.5} className="mt-1 shrink-0 text-primary"/><div><h3 className="font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p></div><ArrowUpRight size={18} className="ml-auto shrink-0 text-muted-foreground"/></Link>)}</div></div></section>
    <section className="home-wrap pb-16"><div className="home-visit"><div><p className="home-eyebrow text-muted-foreground">REAL PEOPLE. PRACTICAL ANSWERS.</p><h2 className="home-heading mt-3">Let’s find what works for you.</h2><p className="mt-4 max-w-lg text-sm leading-7 text-muted-foreground">Visit us at AA Building, 1st floor, room F6A, Eldoret. Bring your questions, your ideas or the device that needs a little attention.</p><p className="mt-3 text-xs text-muted-foreground">Monday–Friday, 8am–6pm · Saturday, 9am–4pm</p></div><div className="flex shrink-0 flex-col gap-3"><a href="tel:+254728097922" className="home-button home-button-primary"><Phone size={17}/> Call 0728 097 922</a><Link href="/contact" className="home-button border border-border">Send an enquiry <ArrowUpRight size={17}/></Link></div></div></section>
  </div>;
}
