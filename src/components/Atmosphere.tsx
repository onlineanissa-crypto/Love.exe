import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'motion/react';

type Particle = { x: number; y: number; vx: number; vy: number; life: number; max: number; size: number; heart: boolean; petal: boolean; color: string };
export function Atmosphere({ celebration, burst }: { celebration: boolean; burst: number }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const burstRef = useRef(burst);
  const reduced = useReducedMotion();
  useEffect(() => { burstRef.current = burst; }, [burst]);
  useEffect(() => {
    const element = canvas.current;
    if (!element || reduced) return;
    const ctx = element.getContext('2d'); if (!ctx) return;
    let width = 0, height = 0, frame = 0, raf = 0, lastBurst = burstRef.current, lastTime = 0;
    const particles: Particle[] = [];
    const resize = () => { width = window.innerWidth; height = window.innerHeight; const dpr = Math.min(window.devicePixelRatio, 1.5); element.width = width * dpr; element.height = height * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    resize(); window.addEventListener('resize', resize);
    const add = (firework = false, origin = { x: width / 2, y: height * 0.45 }) => {
      const angle = Math.random() * Math.PI * 2;
      const petal = !firework && Math.random() > .8;
      const speed = 1 + Math.random() * 4;
      particles.push({ x: firework ? origin.x : Math.random() * width, y: firework ? origin.y : petal ? 0 : height + 20, vx: firework ? Math.cos(angle) * speed : (Math.random() - 0.5) * 0.5, vy: firework ? Math.sin(angle) * speed - 1 : petal ? .6 : -0.3 - Math.random() * 0.8, life: 0, max: firework ? 120 : 550, size: petal ? 6 + Math.random() * 6 : firework ? 3 + Math.random() * 9 : 1 + Math.random() * (celebration ? 9 : 2), heart: celebration || firework, petal, color: ['#eb719b', '#f0b6ba', '#e8c6a0'][Math.floor(Math.random() * 3)] });
    };
    const draw = (time: number) => {
      raf = requestAnimationFrame(draw);
      if (document.hidden || time - lastTime < 1000 / 30) return;
      lastTime = time; frame++; ctx.clearRect(0, 0, width, height);
      if (frame % (celebration ? 1 : 6) === 0) add();
      if (burstRef.current !== lastBurst || (celebration && frame % 75 === 0)) { const origin = { x: width * (.2 + Math.random() * .6), y: height * (.2 + Math.random() * .45) }; for (let i = 0; i < 50; i++) add(true, origin); lastBurst = burstRef.current; }
      if (particles.length > 230) particles.splice(0, particles.length - 230);
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]; p.life++; p.x += p.vx; p.y += p.vy;
        if (p.life > p.max || p.y < -20) { particles.splice(i, 1); continue; }
        ctx.globalAlpha = Math.min(p.life / 25, 1 - p.life / p.max) * 0.65;
        ctx.fillStyle = p.color; ctx.save(); ctx.translate(p.x, p.y);
        if (p.petal) { ctx.rotate(p.life / 40); ctx.scale(Math.cos(p.life / 50), 1); ctx.beginPath(); ctx.moveTo(0, -p.size); ctx.bezierCurveTo(p.size, -p.size, p.size, p.size, 0, p.size * .7); ctx.bezierCurveTo(-p.size * .7, p.size * .2, -p.size * .8, -p.size * .7, 0, -p.size); ctx.fill(); }
        else if (p.heart) { ctx.rotate(Math.sin(p.life / 40) * 0.5); ctx.beginPath(); const s = p.size; ctx.moveTo(0, s * 0.4); ctx.bezierCurveTo(-s * 1.4, -s * 0.4, -s * 0.5, -s * 1.2, 0, -s * 0.5); ctx.bezierCurveTo(s * 0.5, -s * 1.2, s * 1.4, -s * 0.4, 0, s * 0.4); ctx.fill(); }
        else { ctx.beginPath(); ctx.arc(0, 0, p.size, 0, Math.PI * 2); ctx.fill(); }
        ctx.restore();
      }
    };
    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, [celebration, reduced]);
  return <canvas ref={canvas} className="atmosphere" aria-hidden="true" />;
}
