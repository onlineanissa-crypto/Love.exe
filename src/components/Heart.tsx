import { useId } from 'react';

export function HeartArt({ className = '' }: { className?: string }) {
  const id = useId().replace(/:/g, '');
  return <svg className={`heart-art ${className}`} viewBox="0 0 330 310" fill="none" aria-hidden="true">
    <defs>
      <linearGradient id={`${id}body`} x1="83" y1="22" x2="265" y2="277" gradientUnits="userSpaceOnUse"><stop stopColor="#ffacc9"/><stop offset=".24" stopColor="#f65794"/><stop offset=".5" stopColor="#ac174c"/><stop offset=".74" stopColor="#e74480"/><stop offset="1" stopColor="#580c2b"/></linearGradient>
      <radialGradient id={`${id}shine`} cx="0" cy="0" r="1" gradientTransform="translate(91 75) rotate(52) scale(166 111)" gradientUnits="userSpaceOnUse"><stop stopColor="#ffe5e7" stopOpacity=".92"/><stop offset=".36" stopColor="#ffb4c9" stopOpacity=".3"/><stop offset="1" stopColor="#ff8cb4" stopOpacity="0"/></radialGradient>
      <linearGradient id={`${id}edge`} x1="90" y1="37" x2="237" y2="280"><stop stopColor="#ffc1d5"/><stop offset=".45" stopColor="#e96091" stopOpacity=".3"/><stop offset="1" stopColor="#ff8db1" stopOpacity=".7"/></linearGradient>
      <filter id={`${id}blur`}><feGaussianBlur stdDeviation="7"/></filter>
    </defs>
    <path d="M165 282C141 265 39 196 24 126C8 47 111 8 165 81C219 8 322 47 306 126C291 196 189 265 165 282Z" fill={`url(#${id}body)`} stroke={`url(#${id}edge)`} strokeWidth="2"/>
    <path d="M165 282C141 265 39 196 24 126C8 47 111 8 165 81C219 8 322 47 306 126C291 196 189 265 165 282Z" fill={`url(#${id}shine)`}/>
    <path d="M49 116C38 73 86 40 120 63" stroke="#ffe1eb" strokeOpacity=".62" strokeWidth="7" strokeLinecap="round" filter={`url(#${id}blur)`}/>
    <path d="M51 111C48 85 63 66 83 62" stroke="#fff0f5" strokeOpacity=".8" strokeWidth="3" strokeLinecap="round"/>
    <path d="M278 143C259 194 203 245 168 266" stroke="#ffb1d1" strokeOpacity=".25" strokeWidth="5" strokeLinecap="round"/>
  </svg>;
}
