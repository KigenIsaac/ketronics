import Link from 'next/link';
import { ArrowUpRight, PackageOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

export function StorePage({children,className}: {children:React.ReactNode;className?:string}) {
  return <div className={cn('store-page',className)}>{children}</div>;
}
export function PageHero({eyebrow,title,description,action}: {eyebrow?:string;title:string;description?:string;action?:React.ReactNode}) {
  return <section className="page-heading"><div className="min-w-0">{eyebrow&&<p className="eyebrow">{eyebrow}</p>}<h1>{title}</h1>{description&&<p className="page-description">{description}</p>}</div>{action&&<div className="page-heading-action">{action}</div>}</section>;
}
export function SectionHeader({eyebrow,title,description,href,actionLabel='View all'}:{eyebrow?:string;title:string;description?:string;href?:string;actionLabel?:string}) {
  return <div className="section-heading"><div>{eyebrow&&<p className="eyebrow">{eyebrow}</p>}<h2>{title}</h2>{description&&<p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>}</div>{href&&<Link href={href} className="text-link shrink-0">{actionLabel}<ArrowUpRight size={16}/></Link>}</div>;
}
export function Surface({children,className}:{children:React.ReactNode;className?:string}) {
  return <div className={cn('surface',className)}>{children}</div>;
}
export function EmptyState({title,description,action}:{title:string;description?:string;action?:React.ReactNode}) {
  return <Surface className="empty-state"><div className="empty-state-icon"><PackageOpen size={28} strokeWidth={1.5}/></div><h2 className="text-2xl font-semibold tracking-tight">{title}</h2>{description&&<p className="mt-3 max-w-md text-sm leading-7 text-muted-foreground">{description}</p>}{action&&<div className="mt-7">{action}</div>}</Surface>;
}
export function StatCard({label,value,hint,icon:Icon}:{label:string;value:React.ReactNode;hint?:string;icon:React.ComponentType<{className?:string}>}) {
  return <Surface className="stat-card"><div className="flex items-center justify-between gap-4"><p className="text-sm text-muted-foreground">{label}</p><Icon className="h-5 w-5 text-primary"/></div><p className="mt-5 break-words text-3xl font-semibold tracking-tight">{value}</p>{hint&&<p className="mt-2 text-xs text-muted-foreground">{hint}</p>}</Surface>;
}
