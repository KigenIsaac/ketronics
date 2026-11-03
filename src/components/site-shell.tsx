'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Header } from './header';
import { Footer } from './footer';
import { Sidebar } from './sidebar';
import { KetronicsAI } from './ai/KetronicsAI';
import { LayoutDashboard, ShoppingBag, UserRound, Settings } from 'lucide-react';
const accountLinks=[['Overview','/dashboard',LayoutDashboard],['Orders','/orders',ShoppingBag],['Profile','/profile',UserRound],['Preferences','/settings',Settings]] as const;
export function SiteShell({children}:{children:React.ReactNode}){
 const path=usePathname();const admin=path.startsWith('/admin');const auth=path.startsWith('/auth');const checkout=path==='/checkout';const account=accountLinks.some(([,href])=>path===href||path.startsWith(href+'/'));
 return <div className={admin?'site-shell workspace-shell':'site-shell'}><Header/>{account&&<nav className="account-navigation site-container" aria-label="Your account">{accountLinks.map(([label,href,Icon])=><Link key={href} href={href} aria-current={path===href||(href==='/orders'&&path.startsWith('/orders/'))?'page':undefined}><Icon size={16}/>{label}</Link>)}</nav>}<div className={admin?'workspace-layout':'site-body'}>{admin&&<Sidebar/>}<main id="main-content" tabIndex={-1} className={path==='/'?'site-main home-main':'site-main'}>{children}</main></div>{!admin&&!auth&&!checkout&&<Footer/>}{(auth||checkout)&&<div className="minimal-footer">© {new Date().getFullYear()} Ketronics Solutions Ltd <Link href="/privacy-policy">Privacy</Link><Link href="/support">Help</Link></div>}{!admin&&!auth&&!checkout&&<KetronicsAI/>}</div>;
}
