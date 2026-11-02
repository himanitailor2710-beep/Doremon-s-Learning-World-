import React, { useState } from 'react';
import { Sparkles, Heart, HelpCircle, Lightbulb, Trophy, CheckCircle, Volume2 } from 'lucide-react';
import { sounds } from '../services/soundEffects';

export type MascotState =
  | 'idle'
  | 'welcome'
  | 'thinking'
  | 'searching'
  | 'presenting'
  | 'teaching'
  | 'celebrating'
  | 'encouraging'
  | 'explaining'
  // Backward compatibility aliases
  | 'wave'
  | 'float'
  | 'celebrate'
  | 'study'
  | 'encourage'
  | 'uploading'
  | 'processing';

interface DoraemonReferenceMascotProps {
  state?: MascotState;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  message?: string;
  showSpeechBubble?: boolean;
  onMascotClick?: () => void;
  interactiveLook?: boolean;
  studentName?: string;
}

export const DoraemonReferenceMascot: React.FC<DoraemonReferenceMascotProps> = ({
  state = 'idle',
  size = 'md',
  message,
  showSpeechBubble = true,
  onMascotClick,
  studentName = 'Himani',
}) => {
  const [isWaving, setIsWaving] = useState(false);
  const [clickPop, setClickPop] = useState(false);

  // Normalize aliases to canonical states
  let canonicalState:
    | 'idle'
    | 'welcome'
    | 'thinking'
    | 'searching'
    | 'presenting'
    | 'teaching'
    | 'celebrating'
    | 'encouraging'
    | 'explaining' = 'idle';

  if (state === 'welcome' || state === 'wave') canonicalState = 'welcome';
  else if (state === 'celebrating' || state === 'celebrate') canonicalState = 'celebrating';
  else if (state === 'encouraging' || state === 'encourage') canonicalState = 'encouraging';
  else if (state === 'teaching' || state === 'study') canonicalState = 'teaching';
  else if (state === 'thinking' || state === 'processing') canonicalState = 'thinking';
  else if (state === 'searching' || state === 'uploading') canonicalState = 'searching';
  else if (state === 'presenting') canonicalState = 'presenting';
  else if (state === 'explaining') canonicalState = 'explaining';
  else canonicalState = 'idle';

  // Dimension scaling
  const sizeMap = {
    sm: { width: 120, height: 150, imgH: 'h-32', badgeSize: 'w-6 h-6 text-xs' },
    md: { width: 190, height: 240, imgH: 'h-52', badgeSize: 'w-8 h-8 text-sm' },
    lg: { width: 260, height: 320, imgH: 'h-72', badgeSize: 'w-10 h-10 text-base' },
    xl: { width: 340, height: 410, imgH: 'h-96', badgeSize: 'w-12 h-12 text-lg' },
  };

  const dim = sizeMap[size];

  const handleClick = () => {
    setClickPop(true);
    setIsWaving(true);
    sounds.playMagicChime();
    setTimeout(() => setClickPop(false), 500);
    setTimeout(() => setIsWaving(false), 1800);
    if (onMascotClick) onMascotClick();
  };

  // State-specific mood badge and accent
  const stateBadge = () => {
    switch (canonicalState) {
      case 'thinking':
        return (
          <div className="absolute -top-2 right-4 bg-amber-400 text-amber-950 p-2 rounded-2xl shadow-lg border-2 border-white animate-bounce flex items-center gap-1 text-xs font-black">
            <Lightbulb className="w-4 h-4 fill-amber-950" />
            <span>Thinking...</span>
          </div>
        );
      case 'searching':
        return (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-950 px-3 py-1 rounded-full shadow-xl border-2 border-white animate-pulse flex items-center gap-1.5 text-xs font-black z-20">
            <Sparkles className="w-4 h-4 fill-yellow-950 animate-spin" />
            <span>4D Pocket Active!</span>
          </div>
        );
      case 'presenting':
        return (
          <div className="absolute -top-3 left-2 bg-gradient-to-r from-emerald-400 to-teal-500 text-white px-3 py-1 rounded-2xl shadow-xl border-2 border-white animate-bounce flex items-center gap-1.5 text-xs font-black z-20">
            <span>✨</span>
            <span>New Gadget!</span>
          </div>
        );
      case 'teaching':
        return (
          <div className="absolute -top-2 right-2 bg-sky-500 text-white px-2.5 py-1 rounded-2xl shadow-md border-2 border-white flex items-center gap-1 text-xs font-black animate-pulse">
            <span>👉</span>
            <span>Study Tip</span>
          </div>
        );
      case 'celebrating':
        return (
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-950 px-3.5 py-1.5 rounded-full shadow-2xl border-2 border-white animate-bounce flex items-center gap-1.5 text-xs font-black z-20">
            <Trophy className="w-4 h-4 text-amber-950 fill-amber-950" />
            <span>Yay, {studentName}! 🎉</span>
          </div>
        );
      case 'encouraging':
        return (
          <div className="absolute -top-2 left-4 bg-pink-500 text-white px-3 py-1 rounded-2xl shadow-lg border-2 border-white flex items-center gap-1 text-xs font-black animate-pulse">
            <Heart className="w-4 h-4 fill-white" />
            <span>You got this!</span>
          </div>
        );
      case 'welcome':
        return (
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-sky-500 text-white px-3 py-1 rounded-full shadow-lg border-2 border-white flex items-center gap-1 text-xs font-black animate-pop-in">
            <span>👋</span>
            <span>Kon'nichiwa!</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="relative inline-flex flex-col sm:flex-row items-center gap-3 select-none">
      {/* Speech Bubble with Personalized Greeting / Message */}
      {showSpeechBubble && message && (
        <div className="relative max-w-xs sm:max-w-sm p-4 rounded-3xl bg-white/95 backdrop-blur-md border-2 border-sky-200 shadow-xl animate-pop-in z-20 text-left">
          <div className="flex items-start gap-2">
            <span className="text-xl shrink-0">🎒</span>
            <p className="text-xs sm:text-sm font-black text-slate-800 leading-snug">
              {message}
            </p>
          </div>
          {/* Bubble tail */}
          <div className="hidden sm:block absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-t-2 border-r-2 border-sky-200 rotate-45 transform" />
        </div>
      )}

      {/* Mascot Character Wrapper with Exact Reference Photograph */}
      <div
        onClick={handleClick}
        className={`relative cursor-pointer transition-all duration-300 group ${
          clickPop ? 'scale-110' : 'hover:scale-105'
        }`}
        style={{ width: dim.width }}
        title="Click me for a magical Doraemon chime!"
      >
        {/* Soft Cartoon Atmosphere & Glowing Halos */}
        <div
          className={`absolute inset-0 rounded-full blur-2xl opacity-40 transition-all duration-500 pointer-events-none ${
            canonicalState === 'searching'
              ? 'bg-yellow-300 scale-125 opacity-70'
              : canonicalState === 'celebrating'
              ? 'bg-amber-300 scale-130 opacity-75'
              : canonicalState === 'encouraging'
              ? 'bg-pink-300 scale-110 opacity-60'
              : 'bg-sky-300 group-hover:opacity-70'
          }`}
        />

        {/* State Badge Floating Above Character */}
        {stateBadge()}

        {/* Mascot Photograph with Layered Cartoon Motion */}
        <div className="relative flex justify-center items-center">
          <img
            src="/doraemon_reference.png"
            alt="Doraemon Learning Mascot"
            className={`${dim.imgH} object-contain drop-shadow-2xl transition-transform duration-300 ${
              canonicalState === 'celebrating'
                ? 'animate-celebrate'
                : canonicalState === 'welcome' || isWaving
                ? 'animate-breathe'
                : canonicalState === 'thinking'
                ? '-rotate-3'
                : 'animate-float'
            }`}
          />

          {/* Golden 4D Pocket Glow Pulse (Signature Feature) */}
          {canonicalState === 'searching' && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-16 h-12 bg-yellow-400/80 rounded-full blur-md animate-ping" />
          )}

          {/* Teaching Pointer Stick Overlay */}
          {canonicalState === 'teaching' && (
            <div className="absolute right-2 top-1/3 transform rotate-45 text-2xl animate-pulse">
              🪄
            </div>
          )}

          {/* Sparkle particle dust */}
          <div className="absolute top-2 right-2 text-yellow-400 text-lg animate-spin">
            ✨
          </div>
          <div className="absolute bottom-6 left-2 text-sky-400 text-sm animate-pulse">
            🌟
          </div>
        </div>

        {/* Soft Contact Ground Shadow */}
        <div className="w-3/4 h-3 mx-auto mt-1 rounded-full bg-slate-900/15 blur-xs transform transition-all group-hover:scale-90" />
      </div>
    </div>
  );
};
