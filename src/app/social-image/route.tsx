import { ImageResponse } from 'next/og';
export const dynamic='force-static';
export function GET(){
 return new ImageResponse(<div style={{display:'flex',flexDirection:'column',width:'100%',height:'100%',background:'#122234',color:'#ffffff',padding:'70px',justifyContent:'space-between',fontFamily:'sans-serif'}}><div style={{display:'flex',fontSize:30,color:'#ffb768',letterSpacing:4}}>KETRONICS SOLUTIONS LTD</div><div style={{display:'flex',flexDirection:'column',fontSize:76,fontWeight:700,letterSpacing:-3,lineHeight:1.1}}><span>Good technology.</span><span style={{color:'#ffb768'}}>Great possibilities.</span></div><div style={{display:'flex',fontSize:25,color:'#cbd5e1'}}>Electronics · IT services · Eldoret, Kenya</div><div style={{display:'flex',fontSize:23}}>www.ketronics.co.ke</div></div>,{width:1200,height:630});
}
