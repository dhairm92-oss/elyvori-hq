import { useEffect, useRef } from 'react';
import { Theme } from '../types';

interface ParticleBackgroundProps {
  theme: Theme;
}

export function ParticleBackground({ theme }: ParticleBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let t = 0;
    let mouseX = -9999, mouseY = -9999;
    let W = canvas.width = window.innerWidth;
    let H = canvas.height = window.innerHeight;

    const onResize = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; };
    window.addEventListener('resize', onResize);
    window.addEventListener('mousemove', e => { mouseX = e.clientX; mouseY = e.clientY; });
    window.addEventListener('mouseleave', () => { mouseX = -9999; mouseY = -9999; });

    // ── 3D Particles ──────────────────────────────
    const PERSPECTIVE = 600;
    const N = 120;
    type P3 = { x: number; y: number; z: number; vx: number; vy: number; vz: number; hue: number; size: number };
    const pts: P3[] = Array.from({ length: N }, () => ({
      x: (Math.random() - 0.5) * W * 1.5,
      y: (Math.random() - 0.5) * H * 1.5,
      z: Math.random() * 800 - 400,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      vz: (Math.random() - 0.5) * 0.3,
      hue: Math.random() < 0.5 ? 190 : 290, // cyan or purple
      size: Math.random() * 2 + 0.5,
    }));

    // ── Floating 3D rings ──────────────────────────
    const RINGS = Array.from({ length: 5 }, (_, i) => ({
      cx: W * 0.5,
      cy: H * 0.4,
      r: 80 + i * 60,
      tilt: Math.random() * Math.PI,
      speed: 0.0008 + i * 0.0003,
      hue: i % 2 === 0 ? 190 : 290,
      alpha: 0.06 - i * 0.01,
    }));

    // ── ELYVORI text path ──────────────────────────
    const TEXT = 'ELYVORI';
    const FONT_SIZE = Math.min(W * 0.18, 160);

    // project 3D → 2D
    const project = (x: number, y: number, z: number) => {
      const scale = PERSPECTIVE / (PERSPECTIVE + z + 300);
      return { px: W / 2 + x * scale, py: H / 2 + y * scale, scale };
    };

    const draw = () => {
      t += 0.008;
      ctx.clearRect(0, 0, W, H);

      // ── Background ──────────────────────────────
      ctx.fillStyle = '#080A12';
      ctx.fillRect(0, 0, W, H);

      // ── Ambient glow orbs ──────────────────────
      const drawOrb = (cx: number, cy: number, r: number, color: string) => {
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        g.addColorStop(0, color);
        g.addColorStop(1, 'transparent');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
      };
      drawOrb(W * 0.2, H * 0.2, W * 0.4, 'rgba(0,229,255,0.12)');
      drawOrb(W * 0.8, H * 0.7, W * 0.35, 'rgba(213,0,249,0.14)');
      drawOrb(W * 0.5, H * 0.5, W * 0.3, 'rgba(124,58,237,0.08)');

      // ── Grid lines ──────────────────────────
      ctx.save();
      ctx.globalAlpha = 0.06;
      const GS = 60;
      ctx.strokeStyle = '#00E5FF';
      ctx.lineWidth = 0.5;
      for (let gx = 0; gx < W; gx += GS) {
        ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke();
      }
      for (let gy = 0; gy < H; gy += GS) {
        ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke();
      }
      ctx.restore();

      // ── ELYVORI 3D text (background layer) ───
      ctx.save();
      ctx.font = `900 ${FONT_SIZE}px 'Cairo','Inter',sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      // 3D extrusion layers
      for (let d = 15; d >= 0; d--) {
        ctx.globalAlpha = 0.03 + (d / 15) * 0.04;
        ctx.fillStyle = d % 2 === 0 ? '#00E5FF' : '#7C3AED';
        ctx.fillText(TEXT, W / 2 + d * 2, H * 0.42 + d * 2);
      }
      // Main text
      ctx.globalAlpha = 0.18 + Math.sin(t * 0.7) * 0.04;
      ctx.shadowBlur = 80;
      ctx.shadowColor = '#00E5FF';
      ctx.fillStyle = '#00E5FF';
      ctx.fillText(TEXT, W / 2, H * 0.42);
      // Purple glow layer
      ctx.globalAlpha = 0.08;
      ctx.shadowColor = '#D500F9';
      ctx.shadowBlur = 120;
      ctx.fillStyle = '#D500F9';
      ctx.fillText(TEXT, W / 2, H * 0.42);
      ctx.restore();

      // ── 3D Rings ─────────────────────────────
      RINGS.forEach((ring, ri) => {
        ring.tilt += ring.speed;
        ctx.save();
        ctx.globalAlpha = ring.alpha + Math.sin(t + ri) * 0.01;
        ctx.strokeStyle = ring.hue === 190 ? '#00E5FF' : '#D500F9';
        ctx.lineWidth = 0.8;
        ctx.shadowBlur = 8;
        ctx.shadowColor = ring.hue === 190 ? '#00E5FF' : '#D500F9';
        ctx.beginPath();
        for (let a = 0; a <= Math.PI * 2; a += 0.05) {
          const rx = Math.cos(a) * ring.r;
          const ry = Math.sin(a) * ring.r * Math.sin(ring.tilt);
          const rz = Math.sin(a) * ring.r * Math.cos(ring.tilt) * 0.5;
          const { px, py } = project(rx, ry - H * 0.08, rz);
          if (a === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.stroke();
        ctx.restore();
      });

      // ── 3D Particles ─────────────────────────
      // Update positions
      pts.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.z += p.vz;
        const bnd = 800;
        if (Math.abs(p.x) > bnd) p.vx *= -1;
        if (Math.abs(p.y) > bnd) p.vy *= -1;
        if (p.z > 400 || p.z < -400) p.vz *= -1;
        // Mouse repulsion
        const { px, py, scale } = project(p.x, p.y, p.z);
        const dx = mouseX - px, dy = mouseY - py;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          p.vx -= dx * 0.00008;
          p.vy -= dy * 0.00008;
        }
      });

      // Sort by z (back to front)
      const sorted = [...pts].sort((a, b) => a.z - b.z);

      // Draw connections first
      for (let i = 0; i < sorted.length; i++) {
        for (let j = i + 1; j < sorted.length; j++) {
          const a = sorted[i], b = sorted[j];
          const dx = a.x - b.x, dy = a.y - b.y, dz = a.z - b.z;
          const dist3d = Math.sqrt(dx*dx + dy*dy + dz*dz);
          if (dist3d < 180) {
            const pa = project(a.x, a.y, a.z);
            const pb = project(b.x, b.y, b.z);
            const alpha = (1 - dist3d / 180) * 0.12 * Math.min(pa.scale, pb.scale);
            const mixed = (a.hue + b.hue) / 2;
            ctx.beginPath();
            ctx.moveTo(pa.px, pa.py);
            ctx.lineTo(pb.px, pb.py);
            ctx.strokeStyle = mixed === 190 ? `rgba(0,229,255,${alpha})` :
              mixed === 290 ? `rgba(213,0,249,${alpha})` :
              `rgba(124,58,237,${alpha})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      // Draw particles
      sorted.forEach(p => {
        const { px, py, scale } = project(p.x, p.y, p.z);
        if (px < -50 || px > W + 50 || py < -50 || py > H + 50) return;
        const r = p.size * scale * 1.5;
        const alpha = 0.3 + scale * 0.5;
        ctx.save();
        ctx.globalAlpha = Math.min(alpha, 0.85);
        ctx.shadowBlur = 8 * scale;
        ctx.shadowColor = p.hue === 190 ? '#00E5FF' : '#D500F9';
        ctx.beginPath();
        ctx.arc(px, py, Math.max(r, 0.5), 0, Math.PI * 2);
        ctx.fillStyle = p.hue === 190 ? `rgba(0,229,255,${alpha})` : `rgba(213,0,249,${alpha})`;
        ctx.fill();
        ctx.restore();
      });

      // ── Scan line effect ─────────────────────
      const scanY = (t * 60) % (H + 100) - 50;
      const scanGrad = ctx.createLinearGradient(0, scanY - 40, 0, scanY + 40);
      scanGrad.addColorStop(0, 'transparent');
      scanGrad.addColorStop(0.5, 'rgba(0,229,255,0.015)');
      scanGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = scanGrad;
      ctx.fillRect(0, scanY - 40, W, 80);

      // ── Corner accents ───────────────────────
      const corners = [[0,0,1,1],[W,0,-1,1],[0,H,1,-1],[W,H,-1,-1]];
      corners.forEach(([cx, cy, sx, sy]) => {
        const len = 30;
        ctx.save();
        ctx.globalAlpha = 0.25;
        ctx.strokeStyle = '#00E5FF';
        ctx.lineWidth = 1;
        ctx.shadowBlur = 6;
        ctx.shadowColor = '#00E5FF';
        ctx.beginPath();
        ctx.moveTo(cx + sx * len, cy as number);
        ctx.lineTo(cx, cy as number);
        ctx.lineTo(cx, (cy as number) + (sy as number) * len);
        ctx.stroke();
        ctx.restore();
      });

      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
    };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0 h-full w-full"
      style={{ opacity: 1 }}
      aria-hidden="true"
    />
  );
}
