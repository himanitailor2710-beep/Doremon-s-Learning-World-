import React, { useEffect, useRef } from 'react';

export const WorldBackground: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Floating particles (golden sparkles and cherry petals)
    interface Particle {
      x: number;
      y: number;
      size: number;
      speedY: number;
      speedX: number;
      color: string;
      alpha: number;
      alphaSpeed: number;
    }

    const colors = ['#FFFFFF', '#E0F2FE', '#81D4FA', '#29B6F6', '#FFD600'];
    const particles: Particle[] = Array.from({ length: 35 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 3 + 1.5,
      speedY: -(Math.random() * 0.4 + 0.15),
      speedX: (Math.random() - 0.5) * 0.3,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: Math.random() * 0.7 + 0.2,
      alphaSpeed: (Math.random() * 0.01 + 0.005) * (Math.random() > 0.5 ? 1 : -1),
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.y += p.speedY;
        p.x += p.speedX;
        p.alpha += p.alphaSpeed;

        if (p.alpha <= 0.15 || p.alpha >= 0.85) {
          p.alphaSpeed *= -1;
        }

        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, p.alpha));
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 8;
        ctx.shadowColor = p.color;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Pure Doraemon Cartoon Sky Blue Atmosphere */}
      <div 
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: 'linear-gradient(180deg, #0288D1 0%, #03A9F4 22%, #29B6F6 48%, #BAE6FD 75%, #F0F9FF 100%)',
        }}
      />

      {/* Floating Volumetric Soft Clouds */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Cloud 1 */}
        <div 
          className="absolute top-10 -left-20 w-80 h-28 bg-white/80 rounded-full blur-md animate-cloud"
          style={{ animationDuration: '35s' }}
        />
        {/* Cloud 2 */}
        <div 
          className="absolute top-36 right-10 w-96 h-32 bg-white/70 rounded-full blur-md animate-cloud"
          style={{ animationDuration: '45s', animationDirection: 'reverse' }}
        />
        {/* Cloud 3 */}
        <div 
          className="absolute top-64 left-1/3 w-72 h-24 bg-white/60 rounded-full blur-sm animate-cloud"
          style={{ animationDuration: '55s' }}
        />
      </div>

      {/* Distant Futuristic City Skyline in Soft Blue */}
      <div className="fixed bottom-16 inset-x-0 pointer-events-none z-0 opacity-35">
        <svg viewBox="0 0 1440 240" className="w-full h-auto object-cover" preserveAspectRatio="none">
          <defs>
            <linearGradient id="cityGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#81D4FA" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#0288D1" stopOpacity="0.9" />
            </linearGradient>
          </defs>
          {/* Futuristic buildings silhouettes */}
          <path
            d="M0,240 L0,180 L40,180 L40,150 L60,130 L80,150 L80,180 L140,180 L140,110 L170,90 L200,110 L200,180 L280,180 L280,140 L320,140 L320,180 L420,180 L420,100 L440,80 L460,80 L480,100 L480,180 L580,180 L580,130 L620,130 L620,180 L720,180 L720,70 L750,50 L780,70 L780,180 L880,180 L880,120 L920,120 L920,180 L1020,180 L1020,95 L1060,95 L1060,180 L1180,180 L1180,140 L1220,140 L1220,180 L1320,180 L1320,110 L1360,110 L1360,180 L1440,180 L1440,240 Z"
            fill="url(#cityGrad)"
          />
        </svg>
      </div>

      {/* Harmonious Blue Rolling Hills */}
      <div className="fixed bottom-0 inset-x-0 pointer-events-none z-0">
        <svg viewBox="0 0 1440 180" className="w-full h-auto object-cover" preserveAspectRatio="none">
          <defs>
            <linearGradient id="hillBackGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#BAE6FD" />
              <stop offset="100%" stopColor="#7DD3FC" />
            </linearGradient>
            <linearGradient id="hillFrontGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="100%" stopColor="#0288D1" />
            </linearGradient>
          </defs>

          {/* Back Hill */}
          <path
            d="M0,180 L0,70 Q 360,10 720,60 T 1440,40 L1440,180 Z"
            fill="url(#hillBackGrad)"
            opacity="0.75"
          />

          {/* Front Hill with Depth & Daisies */}
          <path
            d="M0,180 L0,95 Q 420,50 840,105 T 1440,85 L1440,180 Z"
            fill="url(#hillFrontGrad)"
            opacity="0.85"
          />

          {/* Cute Decorative Flowers on Hill */}
          <g transform="translate(180, 115)">
            <circle cx="0" cy="0" r="5" fill="#FFFFFF" />
            <circle cx="0" cy="0" r="2.5" fill="#FACC15" />
          </g>
          <g transform="translate(240, 130)">
            <circle cx="0" cy="0" r="6" fill="#FACC15" />
            <circle cx="0" cy="0" r="3" fill="#FFFFFF" />
          </g>
          <g transform="translate(680, 120)">
            <circle cx="0" cy="0" r="5.5" fill="#FFFFFF" />
            <circle cx="0" cy="0" r="2.5" fill="#FACC15" />
          </g>
          <g transform="translate(890, 135)">
            <circle cx="0" cy="0" r="6" fill="#FACC15" />
            <circle cx="0" cy="0" r="2.5" fill="#FFFFFF" />
          </g>
          <g transform="translate(1220, 110)">
            <circle cx="0" cy="0" r="5" fill="#FFFFFF" />
            <circle cx="0" cy="0" r="2.5" fill="#FACC15" />
          </g>
        </svg>
      </div>

      {/* Floating Canvas Sparkles & Petals */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-0"
      />

      {/* Foreground Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};
