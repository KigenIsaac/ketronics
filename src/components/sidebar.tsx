'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard,Package,ShoppingCart,Users,BarChart3,Tags,Settings,Bot,ArrowUpRight } from 'lucide-react';
import { Sheet,SheetContent,SheetHeader,SheetTitle,SheetDescription } from '@/components/ui/sheet';
import { useMobileSidebar } from '@/components/providers';
import { isStaffRole } from '@/lib/roles';
import { useUserStore } from '@/lib/stores/userStore';
const groups=[{label:'STORE',items:[['Overview','/admin',LayoutDashboard],['Products','/admin/products',Package],['Categories','/admin/categories',Tags],['Orders','/admin/orders',ShoppingCart]]},{label:'BUSINESS',items:[['Customers & team','/admin/users',Users],['Analytics','/admin/analytics',BarChart3],['AI studio','/admin/ai',Bot],['Store settings','/admin/settings',Settings]]}] as const;
export function Sidebar(){
 const {user}=useUserStore();const path=usePathname();const {isOpen,setIsOpen}=useMobileSidebar();if(!isStaffRole(user?.role))return null;
 const navigation=<><div className="workspace-identity"><span>K</span><div><strong>Ketronics</strong><p>{user?.role==='admin'?'Administrator':'Store manager'}</p></div></div>{groups.map(group=><div className="workspace-nav-group" key={group.label}><p>{group.label}</p><nav aria-label={group.label+' navigation'}>{group.items.map(([label,href,Icon])=><Link key={href} href={href} onClick={()=>setIsOpen(false)} aria-current={path===href||(href!=='/admin'&&path.startsWith(href+'/'))?'page':undefined}><Icon size={18}/>{label}</Link>)}</nav></div>)}<Link href="/" onClick={()=>setIsOpen(false)} className="workspace-store-link">View storefront <ArrowUpRight size={16}/></Link></>;
 return <><aside className="workspace-sidebar">{navigation}</aside><Sheet open={isOpen} onOpenChange={setIsOpen}><SheetContent side="left" className="w-72 overflow-y-auto p-5"><SheetHeader className="sr-only"><SheetTitle>Store workspace</SheetTitle><SheetDescription>Manage Ketronics products, orders and settings.</SheetDescription></SheetHeader>{navigation}</SheetContent></Sheet></>;
}
