import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, ArrowRight } from 'lucide-react';
import { sounds } from '../services/soundEffects';

interface WelcomeLoginScreenProps {
  initialName?: string;
  onStartLearning: (name: string) => void;
}

export const WelcomeLoginScreen: React.FC<WelcomeLoginScreenProps> = ({
  initialName = '',
  onStartLearning,
}) => {
  const [name, setName] = useState(initialName || '');
  const [isTransitioning, setIsTransitioning] = useState(false);

  const trimmedName = name.trim();

  // Dynamic dialogue message from Doraemon
  const getDoraemonMessage = () => {
    if (trimmedName.length > 0) {
      return `Welcome, ${trimmedName}! Ready to explore and learn with me in my house?`;
    }
    return "Hey! What's your name? I'm Doraemon, and I've prepared a magical 3D learning world for you!";
  };

  const handleStart = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!trimmedName) return;

    sounds.playMagicChime();
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#0288D1', '#FFD600', '#E53935', '#00E676'],
    });

    setIsTransitioning(true);
    setTimeout(() => {
      onStartLearning(trimmedName);
    }, 600);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-700 select-none ${
        isTransitioning ? 'scale-125 opacity-0 blur-md pointer-events-none' : 'scale-100 opacity-100'
      }`}
      style={{
        background: 'radial-gradient(circle at center, #E0F2FE 0%, #BAE6FD 45%, #7DD3FC 100%)',
      }}
    >
      {/* Cartoon Floating Background Clouds & Sparkles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-10 left-12 w-40 h-16 rounded-full bg-white/70 blur-xs animate-float" />
        <div className="absolute top-20 right-20 w-64 h-24 rounded-full bg-white/60 blur-xs animate-float" style={{ animationDelay: '1.5s' }} />
        <div className="absolute bottom-16 left-24 w-52 h-20 rounded-full bg-white/50 blur-xs animate-float" style={{ animationDelay: '2.5s' }} />

        {/* Floating Cartoon Bells and Take-copters */}
        <div className="absolute top-16 right-1/4 text-3xl animate-float" style={{ animationDelay: '0.8s' }}>
          🔔
        </div>
        <div className="absolute bottom-24 right-1/3 text-3xl animate-float" style={{ animationDelay: '2s' }}>
          🚁
        </div>
        <div className="absolute top-1/3 left-16 text-3xl animate-float" style={{ animationDelay: '1.2s' }}>
          ✨
        </div>
      </div>

      {/* Main Interactive Welcome Card */}
      <div className="relative max-w-xl w-full bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-10 border-4 border-sky-300 shadow-2xl shadow-sky-500/20 text-center animate-in zoom-in-95 duration-300">
        {/* Doraemon Mascot Illustration with animated waving arm & bell */}
        <div className="relative w-36 h-44 mx-auto mb-4 flex items-center justify-center">
          {/* Glowing Aura Ring */}
          <div className="absolute inset-0 rounded-full bg-sky-200/60 blur-xl animate-pulse" />

          {/* Reference Image of Doraemon */}
          <img
            src="/doraemon_reference.png"
            alt="Doraemon Waving"
            className="relative z-10 w-36 h-44 object-contain animate-bounce drop-shadow-xl cursor-pointer"
            onClick={() => sounds.playMagicChime()}
            title="Click me for magic!"
          />

          {/* Spinning Propeller Badge on top */}
          <div className="absolute -top-3 right-6 w-7 h-7 rounded-full bg-yellow-400 border-2 border-white flex items-center justify-center text-xs shadow-md animate-spin" style={{ animationDuration: '3s' }}>
            🚁
          </div>
        </div>

        {/* Doraemon's Cartoon Speech Bubble */}
        <div className="relative mb-6 p-4 rounded-3xl bg-sky-50 border-2 border-sky-300 shadow-md">
          <p className="text-sm sm:text-base font-black text-slate-800 leading-snug">
            {getDoraemonMessage()}
          </p>
          {/* Speech triangle */}
          <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-4 h-4 bg-sky-50 border-t-2 border-l-2 border-sky-300 rotate-45 transform" />
        </div>

        {/* Personal Interaction Name Input Form */}
        <form onSubmit={handleStart} className="space-y-4">
          <div className="relative max-w-md mx-auto">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name (e.g. Himani)"
              autoFocus
              className="w-full px-5 py-3.5 rounded-2xl border-3 border-sky-300 focus:border-[#0288D1] focus:ring-4 focus:ring-sky-200 bg-white text-base sm:text-lg font-black text-slate-800 placeholder:text-slate-400 placeholder:font-medium text-center outline-none shadow-inner transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={!trimmedName}
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl font-black text-base sm:text-lg text-[#01579B] bg-gradient-to-r from-[#FFD600] via-[#FFE082] to-[#FFCA28] hover:from-[#FFCA28] hover:to-[#FFD600] border-2 border-yellow-500 shadow-lg shadow-sky-950/20 hover:scale-105 active:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed animate-pulse"
          >
            <Sparkles className="w-5 h-5 text-amber-700" />
            <span>Let's Start!</span>
            <ArrowRight className="w-5 h-5 stroke-[3]" />
          </button>
        </form>

        <p className="text-[11px] text-sky-800 font-bold mt-4">
          Doraemon's 3D Interactive Learning World • No passwords needed!
        </p>
      </div>
    </div>
  );
};
