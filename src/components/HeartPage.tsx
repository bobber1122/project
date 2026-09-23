import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { sounds } from '../utils/audio';

interface HeartPageProps {
  onExplodeComplete: () => void;
  audioMuted: boolean;
  toggleAudio: () => void;
  onHeartClick?: () => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  scale: number;
  scaleSpeed: number;
  rotation: number;
  rotationSpeed: number;
  alpha: number;
  decay: number;
  type: 'heart-pink' | 'heart-black' | 'shard' | 'spark' | 'ring';
  color: string;
  glowColor: string;
  wobble: number;
  wobbleSpeed: number;
  gravity: number;
  drag: number;
  points?: { x: number; y: number }[]; // For polygonal shards
}

export const HeartPage: React.FC<HeartPageProps> = ({
  onExplodeComplete,
  audioMuted,
  toggleAudio,
  onHeartClick,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [hasExploded, setHasExploded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [hintVisible, setHintVisible] = useState(false);

  // Show a very quiet, gentle hint after 2.5s if not clicked yet
  useEffect(() => {
    const timer = setTimeout(() => {
      setHintVisible(true);
    }, 2400);
    return () => clearTimeout(timer);
  }, []);

  // Periodic subtle heartbeat sound while waiting (optional, soft)
  useEffect(() => {
    if (hasExploded || audioMuted) return;
    const interval = setInterval(() => {
      sounds.playHeartbeat();
    }, 2800);
    return () => clearInterval(interval);
  }, [hasExploded, audioMuted]);

  // Handle heart explosion canvas animation
  const triggerExplosion = (clientX?: number, clientY?: number) => {
    if (hasExploded) return;
    if (onHeartClick) {
      onHeartClick();
    }
    setHasExploded(true);
    sounds.playExplosion();

    const canvas = canvasRef.current;
    if (!canvas) {
      setTimeout(onExplodeComplete, 2000);
      return;
    }

    const rect = canvas.getBoundingClientRect();
    const width = (canvas.width = window.innerWidth);
    const height = (canvas.height = window.innerHeight);
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setTimeout(onExplodeComplete, 2000);
      return;
    }

    const originX = clientX !== undefined ? clientX : width / 2;
    const originY = clientY !== undefined ? clientY : height / 2;

    const particles: Particle[] = [];

    // 1. Shockwave rings
    for (let r = 0; r < 3; r++) {
      particles.push({
        x: originX,
        y: originY,
        vx: 0,
        vy: 0,
        size: 20 + r * 15,
        scale: 1,
        scaleSpeed: 10 + r * 5,
        rotation: 0,
        rotationSpeed: 0,
        alpha: 0.95 - r * 0.2,
        decay: 0.024 + r * 0.006,
        type: 'ring',
        color: r === 0 ? 'rgba(244, 114, 182, 0.8)' : 'rgba(251, 207, 232, 0.4)',
        glowColor: 'rgba(244, 114, 182, 0.9)',
        wobble: 0,
        wobbleSpeed: 0,
        gravity: 0,
        drag: 1,
      });
    }

    // 2. Black heart shards (angular fragments bursting from the core)
    const numShards = 26;
    for (let i = 0; i < numShards; i++) {
      const angle = (Math.PI * 2 * i) / numShards + (Math.random() - 0.5) * 0.4;
      const speed = 4 + Math.random() * 11;
      const shardRadius = 8 + Math.random() * 16;
      // Generate small random polygon
      const points: { x: number; y: number }[] = [];
      const numPts = 3 + Math.floor(Math.random() * 3);
      for (let p = 0; p < numPts; p++) {
        const ptAngle = (Math.PI * 2 * p) / numPts;
        const rad = shardRadius * (0.6 + Math.random() * 0.7);
        points.push({
          x: Math.cos(ptAngle) * rad,
          y: Math.sin(ptAngle) * rad,
        });
      }

      particles.push({
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.5, // slight upward burst
        size: shardRadius,
        scale: 1,
        scaleSpeed: -0.008,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.22,
        alpha: 1,
        decay: 0.012 + Math.random() * 0.008,
        type: 'shard',
        color: '#120d14',
        glowColor: 'rgba(244, 114, 182, 0.35)',
        wobble: 0,
        wobbleSpeed: 0,
        gravity: 0.09,
        drag: 0.97,
        points,
      });
    }

    // 3. Exploding Hearts: 🖤 and 💖
    const numHearts = 65;
    for (let i = 0; i < numHearts; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 3 + Math.random() * 14;
      const isPink = Math.random() > 0.45; // balanced mix of 🖤 and 💖
      const size = 12 + Math.random() * 22;

      particles.push({
        x: originX + (Math.random() - 0.5) * 20,
        y: originY + (Math.random() - 0.5) * 20,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2.0,
        size,
        scale: 0.4 + Math.random() * 0.9,
        scaleSpeed: 0.003,
        rotation: (Math.random() - 0.5) * 0.8,
        rotationSpeed: (Math.random() - 0.5) * 0.08,
        alpha: 1,
        decay: 0.009 + Math.random() * 0.008,
        type: isPink ? 'heart-pink' : 'heart-black',
        color: isPink
          ? Math.random() > 0.4
            ? '#f472b6' // vivid rose pink
            : '#fbcfe8' // soft delicate pink
          : '#1a141c', // obsidian black heart
        glowColor: isPink ? 'rgba(244, 114, 182, 0.8)' : 'rgba(251, 207, 232, 0.3)',
        wobble: Math.random() * Math.PI,
        wobbleSpeed: 0.04 + Math.random() * 0.06,
        gravity: 0.06,
        drag: 0.965,
      });
    }

    // 4. Subtle luminous sparks, glitter & fairy dust
    const numSparks = 80;
    for (let i = 0; i < numSparks; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 16;
      particles.push({
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 1.5 + Math.random() * 3.5,
        scale: 1,
        scaleSpeed: -0.005,
        rotation: Math.random() * Math.PI,
        rotationSpeed: (Math.random() - 0.5) * 0.1,
        alpha: 0.95,
        decay: 0.01 + Math.random() * 0.015,
        type: 'spark',
        color: Math.random() > 0.5 ? '#fce7f3' : '#f472b6',
        glowColor: '#f472b6',
        wobble: 0,
        wobbleSpeed: 0,
        gravity: 0.03,
        drag: 0.96,
      });
    }

    // Draw heart path helper
    const drawHeart = (
      context: CanvasRenderingContext2D,
      cx: number,
      cy: number,
      size: number
    ) => {
      context.beginPath();
      const topCurveHeight = size * 0.3;
      context.moveTo(cx, cy + topCurveHeight);
      // top left curve
      context.bezierCurveTo(
        cx,
        cy,
        cx - size / 2,
        cy,
        cx - size / 2,
        cy + topCurveHeight
      );
      // bottom left curve
      context.bezierCurveTo(
        cx - size / 2,
        cy + (size + topCurveHeight) / 2,
        cx,
        cy + (size + topCurveHeight) / 1.4,
        cx,
        cy + size
      );
      // bottom right curve
      context.bezierCurveTo(
        cx,
        cy + (size + topCurveHeight) / 1.4,
        cx + size / 2,
        cy + (size + topCurveHeight) / 2,
        cx + size / 2,
        cy + topCurveHeight
      );
      // top right curve
      context.bezierCurveTo(
        cx + size / 2,
        cy,
        cx,
        cy,
        cx,
        cy + topCurveHeight
      );
      context.closePath();
    };

    let animationFrameId: number;
    let completed = false;
    const startTime = performance.now();
    const duration = 1400; // Snappy 1.4s explosion lifecycle for crisp transition

    const finishExplosion = () => {
      if (completed) return;
      completed = true;
      cancelAnimationFrame(animationFrameId);
      onExplodeComplete();
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      let aliveCount = 0;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        if (p.alpha <= 0.01) continue;
        aliveCount++;

        // Update physics
        p.vx *= p.drag;
        p.vy *= p.drag;
        p.vy += p.gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;
        p.wobble += p.wobbleSpeed;
        p.scale = Math.max(0.01, p.scale + p.scaleSpeed);
        p.alpha -= p.decay;

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);

        if (p.type === 'ring') {
          // Shockwave ring
          p.size += p.scaleSpeed;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.strokeStyle = p.color;
          ctx.lineWidth = Math.max(1, 3.5 * p.alpha);
          ctx.shadowBlur = 20;
          ctx.shadowColor = p.glowColor;
          ctx.stroke();
        } else if (p.type === 'heart-pink' || p.type === 'heart-black') {
          // Heart particles
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          const currentScale = p.scale * (1 + Math.sin(p.wobble) * 0.1);
          ctx.scale(currentScale, currentScale);

          ctx.shadowBlur = p.type === 'heart-pink' ? 16 : 8;
          ctx.shadowColor = p.glowColor;

          drawHeart(ctx, 0, -p.size / 2, p.size);
          ctx.fillStyle = p.color;
          ctx.fill();

          // Delicate rim light on black hearts
          if (p.type === 'heart-black') {
            ctx.strokeStyle = 'rgba(244, 114, 182, 0.45)';
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        } else if (p.type === 'shard') {
          // Dark geometric shard
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.scale(p.scale, p.scale);

          if (p.points && p.points.length > 2) {
            ctx.beginPath();
            ctx.moveTo(p.points[0].x, p.points[0].y);
            for (let pt = 1; pt < p.points.length; pt++) {
              ctx.lineTo(p.points[pt].x, p.points[pt].y);
            }
            ctx.closePath();
            ctx.fillStyle = p.color;
            ctx.shadowBlur = 6;
            ctx.shadowColor = p.glowColor;
            ctx.fill();
            ctx.strokeStyle = 'rgba(244, 114, 182, 0.25)';
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        } else if (p.type === 'spark') {
          // Star spark
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.fillStyle = p.color;
          ctx.shadowBlur = 12;
          ctx.shadowColor = p.glowColor;

          // Cross flare
          const r = p.size * p.scale;
          ctx.beginPath();
          ctx.arc(0, 0, r, 0, Math.PI * 2);
          ctx.fill();

          ctx.beginPath();
          ctx.moveTo(-r * 2.5, 0);
          ctx.lineTo(r * 2.5, 0);
          ctx.moveTo(0, -r * 2.5);
          ctx.lineTo(0, r * 2.5);
          ctx.strokeStyle = p.color;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }

        ctx.restore();
      }

      const elapsed = performance.now() - startTime;
      if (elapsed < duration) {
        animationFrameId = requestAnimationFrame(render);
      } else {
        // Animation finished smoothly, transition to next page immediately
        finishExplosion();
      }
    };

    animationFrameId = requestAnimationFrame(render);

    // Safety timeout in case frame loop drops
    setTimeout(finishExplosion, duration + 100);
  };

  const handleHeartClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (hasExploded) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    triggerExplosion(cx, cy);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen overflow-hidden flex flex-col items-center justify-center bg-[#09060b] select-none"
    >
      {/* Background radial atmosphere */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-pink-950/20 via-[#0e0913] to-[#070509]" />

      {/* Floating subtle ambient dust/stardust */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/5 w-1 h-1 bg-pink-300/40 rounded-full blur-[1px] animate-pulse" />
        <div className="absolute top-3/5 left-3/4 w-1.5 h-1.5 bg-pink-200/30 rounded-full blur-[1px] animate-pulse" />
        <div className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-pink-400/20 rounded-full blur-[0.5px]" />
        <div className="absolute top-1/3 right-1/4 w-2 h-2 bg-pink-400/15 rounded-full blur-[2px]" />
      </div>

      {/* Audio toggle in top corner */}
      <header className="absolute top-6 right-6 z-30">
        <button
          onClick={toggleAudio}
          className="group flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] backdrop-blur-md text-xs text-pink-200/70 hover:text-pink-100 transition-all duration-300"
          title={audioMuted ? 'Unmute sounds' : 'Mute sounds'}
          aria-label={audioMuted ? 'Unmute audio effects' : 'Mute audio effects'}
        >
          <span className="text-xs">
            {audioMuted ? '🔇' : '🎵'}
          </span>
          <span className="hidden sm:inline font-light tracking-wider text-[11px]">
            {audioMuted ? 'Sound Off' : 'Sound On'}
          </span>
        </button>
      </header>

      {/* Fullscreen Canvas for Explosion */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-20 pointer-events-none"
      />

      {/* Center Black Heart Interactive Element */}
      <div className="relative z-10 flex flex-col items-center justify-center">
        <AnimatePresence>
          {!hasExploded && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{
                scale: 1.4,
                opacity: 0,
                filter: 'blur(8px)',
                transition: { duration: 0.35, ease: 'easeOut' },
              }}
              className="relative flex items-center justify-center"
            >
              {/* Subtle pulsing background glow around the heart */}
              <div
                className={`absolute w-44 h-44 rounded-full transition-all duration-700 pointer-events-none ${
                  isHovered
                    ? 'bg-pink-500/25 blur-3xl scale-125'
                    : 'bg-pink-500/10 blur-2xl scale-100'
                }`}
              />

              {/* The Medium-sized Black Heart 🖤 Button */}
              <button
                onClick={handleHeartClick}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className="relative group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-400/50 rounded-full p-4 transition-transform active:scale-95"
                aria-label="Interactive Black Heart: Click to open"
              >
                {/* SVG Black Heart with layered depth, subtle rim highlight, and soft gloss */}
                <div className="w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 flex items-center justify-center animate-heart-pulse animate-float-gentle">
                  <svg
                    viewBox="0 0 100 90"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-full h-full drop-shadow-[0_15px_30px_rgba(0,0,0,0.9)] transition-all duration-300 group-hover:scale-105"
                  >
                    <defs>
                      {/* Deep Obsidian gradient */}
                      <linearGradient id="blackHeartGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#251a24" />
                        <stop offset="45%" stopColor="#120c15" />
                        <stop offset="100%" stopColor="#070408" />
                      </linearGradient>

                      {/* Delicate rose rim reflection */}
                      <linearGradient id="roseRimGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="rgba(244, 114, 182, 0.7)" />
                        <stop offset="50%" stopColor="rgba(251, 207, 232, 0.25)" />
                        <stop offset="100%" stopColor="rgba(244, 114, 182, 0.6)" />
                      </linearGradient>

                      {/* Gloss highlight */}
                      <linearGradient id="heartGloss" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="rgba(255, 255, 255, 0.25)" />
                        <stop offset="100%" stopColor="rgba(255, 255, 255, 0)" />
                      </linearGradient>
                    </defs>

                    {/* Main Heart Base */}
                    <path
                      d="M50 85 C50 85 10 58 10 32 C10 18 21 8 34 8 C42 8 47 13 50 17 C53 13 58 8 66 8 C79 8 90 18 90 32 C90 58 50 85 50 85 Z"
                      fill="url(#blackHeartGrad)"
                      stroke="url(#roseRimGrad)"
                      strokeWidth="1.2"
                    />

                    {/* Inner subtle curvature shadow for realistic depth */}
                    <path
                      d="M50 81 C48 79 14 55 14 32 C14 20 23 12 34 12 C41 12 46 16 50 20 C54 16 59 12 66 12 C77 12 86 20 86 32 C86 55 52 79 50 81 Z"
                      fill="none"
                      stroke="rgba(0, 0, 0, 0.7)"
                      strokeWidth="1.5"
                    />

                    {/* Left lobe top gloss curve */}
                    <path
                      d="M22 26 C22 18 28 13 36 13 C38 13 42 14 45 17 C42 18 36 20 30 24 C25 27 23 30 22 34 C22 31 22 28 22 26 Z"
                      fill="url(#heartGloss)"
                    />
                  </svg>
                </div>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quiet, poetic hint */}
        <AnimatePresence>
          {!hasExploded && hintVisible && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 0.65, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.8 }}
              className="mt-6 text-center pointer-events-none"
            >
              <p className="text-xs tracking-[0.25em] uppercase font-light text-pink-200/60 font-sans">
                touch the heart
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
