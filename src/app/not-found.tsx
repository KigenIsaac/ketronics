import Link from 'next/link';
import { ArrowRight, Search } from 'lucide-react';

export default function NotFound() {
  return <section className="mx-auto max-w-xl py-20 text-center">
    <p className="home-eyebrow text-muted-foreground">404 · PAGE NOT FOUND</p>
    <h1 className="home-heading mt-4">Let’s find something that works.</h1>
    <p className="mt-4 text-sm leading-7 text-muted-foreground">This page may have moved, or the product may no longer be available. Explore the catalog or ask our team for help.</p>
    <div className="mt-7 flex flex-wrap justify-center gap-3"><Link href="/products" className="home-button home-button-primary"><Search size={17}/>Explore products</Link><Link href="/contact" className="home-button border border-border">Ask Ketronics <ArrowRight size={17}/></Link></div>
  </section>;
}
