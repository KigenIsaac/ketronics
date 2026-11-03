'use client';
import Image from 'next/image';
import { useState } from 'react';
import { ChevronLeft,ChevronRight,Expand,Package } from 'lucide-react';
import { Dialog,DialogContent,DialogTitle,DialogTrigger } from '@/components/ui/dialog';
export default function ProductGallery({name,images}:{name:string;images:string[]}){
 const [active,setActive]=useState(0);const [failed,setFailed]=useState<string[]>([]);const src=images[active];
 const photo=(large=false)=>src&&!failed.includes(src)?<Image src={src} alt={`${name}, image ${active+1}`} fill priority sizes={large?'90vw':'(max-width:1024px) 100vw, 55vw'} onError={()=>setFailed(current=>[...current,src])} className="object-contain p-6 sm:p-10"/>:<div className="image-placeholder"><Package size={44} strokeWidth={1}/><span>Image not available</span></div>;
 return <div><div className="product-gallery">{photo()}<span className="gallery-count">{images.length?`${active+1} / ${images.length}`:'Product image'}</span>{src&&<Dialog><DialogTrigger asChild><button className="gallery-expand" aria-label="Enlarge product image"><Expand size={18}/></button></DialogTrigger><DialogContent className="w-[95vw] max-w-4xl"><DialogTitle className="pr-7 text-sm">{name}</DialogTitle><div className="relative h-[70dvh]">{photo(true)}</div></DialogContent></Dialog>}{images.length>1&&<><button className="gallery-arrow left-3" aria-label="Previous image" onClick={()=>setActive(n=>(n-1+images.length)%images.length)}><ChevronLeft size={20}/></button><button className="gallery-arrow right-3" aria-label="Next image" onClick={()=>setActive(n=>(n+1)%images.length)}><ChevronRight size={20}/></button></>}</div>{images.length>1&&<div className="gallery-thumbnails">{images.map((image,index)=><button key={image+index} onClick={()=>setActive(index)} aria-label={`Show product image ${index+1}`} aria-pressed={active===index}><Image src={image} alt="" fill sizes="72px" className="object-contain p-2"/></button>)}</div>}</div>;
}
