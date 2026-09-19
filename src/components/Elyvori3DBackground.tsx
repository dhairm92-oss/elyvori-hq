import React, { useEffect, useRef } from 'react';
import { Theme } from '../types';

interface Elyvori3DBackgroundProps {
  theme: Theme;
  lang?: 'en' | 'ar';
}

export const Elyvori3DBackground: React.FC<Elyvori3DBackgroundProps> = ({ theme, lang = 'en' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDark = theme === 'dark';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Dynamic 3D Letter definitions for E L Y V O R I
    interface Point3D {
      x: number;
      y: number;
      z: number;
    }

    interface Segment3D {
      p1: Point3D;
      p2: Point3D;
    }

    interface Letter3D {
      char: string;
      offsetX: number;
      segments: Segment3D[];
    }

    const letters: Letter3D[] = [];
    const text = 'ELYVORI';
    // Dynamic spacing adapting nicely across phone, tablet and desktop
    const letterSpacing = 0.54;
    const totalSpan = (text.length - 1) * letterSpacing;

    const createLetterSegments = (char: string, depth = 0.42): Segment3D[] => {
      const segs: Segment3D[] = [];
      const line2D: [number, number, number, number][] = [];

      if (char === 'E') {
        line2D.push([-0.18, -0.32, -0.18, 0.32]); // main stem
        line2D.push([-0.18, -0.32, 0.18, -0.32]); // top
        line2D.push([-0.18, 0, 0.12, 0]); // center
        line2D.push([-0.18, 0.32, 0.18, 0.32]); // bottom
      } else if (char === 'L') {
        line2D.push([-0.18, -0.32, -0.18, 0.32]);
        line2D.push([-0.18, 0.32, 0.18, 0.32]);
      } else if (char === 'Y') {
        line2D.push([-0.18, -0.32, 0, -0.02]);
        line2D.push([0.18, -0.32, 0, -0.02]);
        line2D.push([0, -0.02, 0, 0.32]);
      } else if (char === 'V') {
        line2D.push([-0.18, -0.32, 0, 0.32]);
        line2D.push([0.18, -0.32, 0, 0.32]);
      } else if (char === 'O') {
        line2D.push([-0.18, -0.22, -0.18, 0.22]);
        line2D.push([0.18, -0.22, 0.18, 0.22]);
        line2D.push([-0.09, -0.32, 0.09, -0.32]);
        line2D.push([-0.09, 0.32, 0.09, 0.32]);
        line2D.push([-0.18, -0.22, -0.09, -0.32]);
        line2D.push([0.18, -0.22, 0.09, -0.32]);
        line2D.push([-0.18, 0.22, -0.09, 0.32]);
        line2D.push([0.18, 0.22, 0.09, 0.32]);
      } else if (char === 'R') {
        line2D.push([-0.18, -0.32, -0.18, 0.32]);
        line2D.push([-0.18, -0.32, 0.14, -0.32]);
        line2D.push([0.14, -0.32, 0.18, -0.16]);
        line2D.push([0.18, -0.16, 0.14, 0]);
        line2D.push([0.14, 0, -0.18, 0]);
        line2D.push([0, 0, 0.18, 0.32]);
      } else if (char === 'I') {
        line2D.push([0, -0.32, 0, 0.32]);
        line2D.push([-0.12, -0.32, 0.12, -0.32]);
        line2D.push([-0.12, 0.32, 0.12, 0.32]);
      }

      const halfD = depth / 2;
      line2D.forEach(([x1, y1, x2, y2]) => {
        // Front face
        segs.push({
          p1: { x: x1, y: y1, z: halfD },
          p2: { x: x2, y: y2, z: halfD },
        });
        // Back face
        segs.push({
          p1: { x: x1, y: y1, z: -halfD },
          p2: { x: x2, y: y2, z: -halfD },
        });
        // 3D Depth cross struts
        segs.push({
          p1: { x: x1, y: y1, z: halfD },
          p2: { x: x1, y: y1, z: -halfD },
        });
        segs.push({
          p1: { x: x2, y: y2, z: halfD },
          p2: { x: x2, y: y2, z: -halfD },
        });
      });

      return segs;
    };

    for (let i = 0; i < text.length; i++) {
      const offsetX = -totalSpan / 2 + i * letterSpacing;
      letters.push({
        char: text[i],
        offsetX,
        segments: createLetterSegments(text[i]),
      });
    }

    // High velocity Cyber Warp Particles
    const warpStars: { x: number; y: number; z: number; speed: number; size: number }[] = [];
    for (let i = 0; i < 70; i++) {
      warpStars.push({
        x: (Math.random() - 0.5) * 8,
        y: (Math.random() - 0.5) * 6,
        z: Math.random() * 8,
        speed: 0.04 + Math.random() * 0.05,
        size: Math.random() * 2 + 1.2,
      });
    }

    let time = 0;

    const render = () => {
      // Faster, high-energy dynamic frame clock
      time += 0.038;

      ctx.clearRect(0, 0, width, height);

      // Responsive Camera & Scale (Phone, Tablet, Desktop)
      const isMobile = width < 640;
      const isTablet = width >= 640 && width < 1024;
      
      const fov = isMobile ? 380 : isTablet ? 450 : 520;
      const cameraDistance = isMobile ? 4.2 : 3.4;
      const centerX = width / 2;
      const centerY = height * (isMobile ? 0.38 : 0.44);
      const scaleMultiplier = isMobile ? 0.38 : isTablet ? 0.46 : 0.56;
      const scale = Math.min(width * scaleMultiplier, height * 0.55);

      // FAST, VIBRANT, HIGH-VELOCITY 3D KINEMATICS
      // Multi-axis active rotation with accelerated yaw and energetic pitch
      const rotY = Math.sin(time * 1.6) * 0.48 + Math.cos(time * 0.9) * 0.25;
      const rotX = Math.sin(time * 1.3) * 0.24 + 0.06;
      const rotZ = Math.sin(time * 1.1) * 0.1;
      const floatY = Math.sin(time * 2.2) * 0.12; // swift hovering levitation

      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);
      const cosZ = Math.cos(rotZ);
      const sinZ = Math.sin(rotZ);

      const project = (x: number, y: number, z: number) => {
        // Y-axis rotation
        const x1 = x * cosY + z * sinY;
        const y1 = y;
        const z1 = -x * sinY + z * cosY;

        // X-axis rotation
        const x2 = x1;
        const y2 = y1 * cosX - z1 * sinX;
        const z2 = y1 * sinX + z1 * cosX;

        // Z-axis rotation
        const x3 = x2 * cosZ - y2 * sinZ;
        const y3 = x2 * sinZ + y2 * cosZ;
        const z3 = z2;

        const finalZ = z3 + cameraDistance;
        if (finalZ <= 0.1) return null;

        const pScale = fov / finalZ;
        return {
          screenX: centerX + x3 * pScale * (scale / 210),
          screenY: centerY + (y3 + floatY) * pScale * (scale / 210),
          depth: finalZ,
        };
      };

      // 1. Render Fast Moving Cyber Warp Grid Lines & Ground
      ctx.save();
      const ringCount = 4;
      for (let r = 0; r < ringCount; r++) {
        const ringRadius = 2.0 + r * 0.65;
        const ringY = 0.65;
        const points = 40;
        ctx.beginPath();
        for (let p = 0; p <= points; p++) {
          const angle = (p / points) * Math.PI * 2 + time * (0.18 * (r % 2 === 0 ? 1 : -1));
          const rx = Math.cos(angle) * ringRadius;
          const rz = Math.sin(angle) * (ringRadius * 0.42);
          const pr = project(rx, ringY, rz);
          if (pr) {
            if (p === 0) ctx.moveTo(pr.screenX, pr.screenY);
            else ctx.lineTo(pr.screenX, pr.screenY);
          }
        }
        ctx.strokeStyle = isDark
          ? `rgba(6, 182, 212, ${0.22 - r * 0.04})`
          : `rgba(99, 102, 241, ${0.15 - r * 0.03})`;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([8, 8]);
        ctx.stroke();
      }
      ctx.restore();

      // 2. High-Speed Warp Particles flying towards viewer
      warpStars.forEach((star) => {
        star.z -= star.speed;
        if (star.z < 0.1) {
          star.z = 8;
          star.x = (Math.random() - 0.5) * 8;
          star.y = (Math.random() - 0.5) * 6;
        }

        const pr = project(star.x, star.y, star.z);
        if (pr) {
          const alpha = Math.min(1, Math.max(0.1, (6 - star.z) / 4));
          ctx.beginPath();
          ctx.arc(pr.screenX, pr.screenY, star.size * (fov / (pr.depth * 180)), 0, Math.PI * 2);
          ctx.fillStyle = isDark
            ? `rgba(34, 211, 238, ${alpha * 0.7})`
            : `rgba(99, 102, 241, ${alpha * 0.5})`;
          ctx.shadowBlur = isDark ? 8 : 2;
          ctx.shadowColor = '#22d3ee';
          ctx.fill();
        }
      });

      // 2.5. Dedicated Volumetric Dynamic Color Aura Behind ELYVORI Letters
      letters.forEach((letter, idx) => {
        const letterWave = Math.sin(time * 3.5 + idx * 0.7) * 0.06;
        const letterProj = project(letter.offsetX, letterWave, 0);
        if (letterProj) {
          // Dynamic color cycle per letter (Cyan -> Magenta -> Violet -> Emerald -> Amber)
          const hue = (time * 70 + idx * 45) % 360;
          const letterGlowGrad = ctx.createRadialGradient(
            letterProj.screenX,
            letterProj.screenY,
            2,
            letterProj.screenX,
            letterProj.screenY,
            scale * 0.22
          );

          if (isDark) {
            letterGlowGrad.addColorStop(0, `hsla(${hue}, 100%, 65%, 0.32)`);
            letterGlowGrad.addColorStop(0.5, `hsla(${(hue + 40) % 360}, 90%, 55%, 0.14)`);
            letterGlowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
          } else {
            letterGlowGrad.addColorStop(0, `hsla(${hue}, 90%, 50%, 0.22)`);
            letterGlowGrad.addColorStop(0.6, `hsla(${(hue + 30) % 360}, 80%, 45%, 0.08)`);
            letterGlowGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
          }

          ctx.save();
          ctx.fillStyle = letterGlowGrad;
          ctx.beginPath();
          ctx.arc(letterProj.screenX, letterProj.screenY, scale * 0.22, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      });

      // 3. Render 3D Letters with Electric Shifting Chromatic Neon & Vibrant Colored Glow
      letters.forEach((letter, idx) => {
        // Fast energetic wave ripples across letters
        const letterWave = Math.sin(time * 3.5 + idx * 0.7) * 0.06;
        // Dynamic shifting hue for this specific letter
        const letterHue = (time * 65 + idx * 42) % 360;

        letter.segments.forEach((seg) => {
          const p1 = project(
            seg.p1.x + letter.offsetX,
            seg.p1.y + letterWave,
            seg.p1.z
          );
          const p2 = project(
            seg.p2.x + letter.offsetX,
            seg.p2.y + letterWave,
            seg.p2.z
          );

          if (p1 && p2) {
            const avgDepth = (p1.depth + p2.depth) / 2;
            const depthFactor = Math.max(0.2, Math.min(1.2, (5.2 - avgDepth) / 2.8));

            ctx.beginPath();
            ctx.moveTo(p1.screenX, p1.screenY);
            ctx.lineTo(p2.screenX, p2.screenY);

            // Striking Multi-Color Vibrant Chromatic Glow (Electric Cyan, Hot Pink, Violet, Neon Green)
            if (isDark) {
              ctx.shadowBlur = 24 * depthFactor;
              ctx.shadowColor = `hsl(${letterHue}, 100%, 65%)`;
              ctx.strokeStyle = `hsl(${letterHue}, 100%, ${65 + depthFactor * 15}%)`;
              ctx.lineWidth = 3.6 * depthFactor;
            } else {
              ctx.shadowBlur = 12;
              ctx.shadowColor = `hsl(${letterHue}, 85%, 45%)`;
              ctx.strokeStyle = `hsl(${letterHue}, 85%, 45%)`;
              ctx.lineWidth = 3.0 * depthFactor;
            }
            ctx.stroke();

            // Glowing Crystal Nodes on all 3D vertices with matching neon highlight
            ctx.beginPath();
            ctx.arc(p1.screenX, p1.screenY, 2.8 * depthFactor, 0, Math.PI * 2);
            ctx.fillStyle = isDark ? '#ffffff' : `hsl(${letterHue}, 100%, 35%)`;
            ctx.shadowBlur = isDark ? 14 : 4;
            ctx.shadowColor = `hsl(${letterHue}, 100%, 70%)`;
            ctx.fill();
          }
        });
      });

      // 4. Central Pulsing Holographic Core Beam
      const centerProj = project(0, 0.35 + floatY, 0);
      if (centerProj) {
        const radGrad = ctx.createRadialGradient(
          centerProj.screenX,
          centerProj.screenY,
          5,
          centerProj.screenX,
          centerProj.screenY,
          width * 0.42
        );
        if (isDark) {
          radGrad.addColorStop(0, 'rgba(6, 182, 212, 0.18)');
          radGrad.addColorStop(0.4, 'rgba(168, 85, 247, 0.08)');
          radGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        } else {
          radGrad.addColorStop(0, 'rgba(99, 102, 241, 0.12)');
          radGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        }
        ctx.fillStyle = radGrad;
        ctx.beginPath();
        ctx.ellipse(centerProj.screenX, centerProj.screenY + 30, width * 0.42, 80, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
    };
  }, [isDark, theme]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none flex items-center justify-center"
    >
      {/* 3D High-Velocity Canvas Engine */}
      <canvas
        ref={canvasRef}
        className="w-full h-full object-cover"
        style={{ opacity: isDark ? 1 : 0.85 }}
      />

      {/* Futuristic Status Badge with Responsive Scaling */}
      <div
        className="absolute bottom-16 sm:bottom-20 flex items-center gap-2 sm:gap-2.5 px-4 sm:px-6 py-2 sm:py-2.5 rounded-full border shadow-2xl backdrop-blur-md transition-all duration-300 pointer-events-none scale-90 sm:scale-100"
        style={{
          backgroundColor: isDark ? 'rgba(2, 6, 23, 0.85)' : 'rgba(255, 255, 255, 0.9)',
          borderColor: isDark ? 'rgba(34, 211, 238, 0.4)' : 'rgba(99, 102, 241, 0.3)',
          boxShadow: isDark ? '0 0 35px rgba(34, 211, 238, 0.25)' : '0 10px 30px rgba(99, 102, 241, 0.15)',
        }}
      >
        <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
        <span
          className={`text-[10px] sm:text-xs font-black tracking-widest uppercase ${
            isDark ? 'text-cyan-300' : 'text-indigo-800'
          }`}
        >
          {lang === 'ar' ? 'إليفوري • أنظمة ذكاء اصطناعي سيبرانية فائقة السرعة' : 'ELYVORI • AUTONOMOUS 3D HIGH-VELOCITY AI SYSTEMS'}
        </span>
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
      </div>
    </div>
  );
};
