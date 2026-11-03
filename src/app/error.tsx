'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { RefreshCw } from 'lucide-react';

export default function PageError({error, reset}: {error: Error & {digest?: string}; reset: () => void}) {
  useEffect(() => { console.error('Ketronics page error', error); }, [error]);
  return <section className="mx-auto max-w-xl py-20 text-center" role="alert">
    <p className="home-eyebrow text-muted-foreground">LET’S GET YOU BACK ON TRACK</p>
    <h1 className="home-heading mt-4">This page couldn’t load.</h1>
    <p className="mt-4 text-sm leading-7 text-muted-foreground">Please try again. If the problem continues, our team can help you find what you need.</p>
    <div className="mt-7 flex flex-wrap justify-center gap-3"><button onClick={reset} className="home-button home-button-primary"><RefreshCw size={16}/>Try again</button><Link href="/contact" className="home-button border border-border">Contact support</Link><Link href="/" className="home-text-link">Back to store</Link></div>
  </section>;
}
