'use client';
import { useTheme } from 'next-themes';
import { Sun, Moon, Monitor } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
export function ThemeSwitcher(){
 const {setTheme}=useTheme();
 return <DropdownMenu><DropdownMenuTrigger asChild><button className="icon-button" aria-label="Change colour theme"><Sun size={18}/></button></DropdownMenuTrigger><DropdownMenuContent align="end">{[['light','Light',Sun],['dark','Dark',Moon],['system','System',Monitor]].map(([value,label,Icon])=>{const I=Icon as typeof Sun;return <DropdownMenuItem key={value as string} onClick={()=>setTheme(value as string)}><I size={16}/>{label as string}</DropdownMenuItem>;})}</DropdownMenuContent></DropdownMenu>;
}
