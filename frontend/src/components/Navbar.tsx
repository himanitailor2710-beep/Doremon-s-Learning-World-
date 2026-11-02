import React, { useState } from 'react';
import {
  Sparkles,
  Flame,
  Key,
  Plus,
  Volume2,
  VolumeX,
  Settings,
  BookOpen,
  Layers,
  User,
  UploadCloud,
  Network
} from 'lucide-react';
import { GamificationProfile } from '../types';
import { sounds } from '../services/soundEffects';

export type NavigationTab =
  | 'home'
  | 'courses'
  | 'upload'
  | 'materials'
  | 'learn'
  | 'knowledge-map'
  | 'quiz-revision'
  | 'quiz'
  | 'revision'
  | 'progress'
  | 'settings';

interface NavbarProps {
  profile: GamificationProfile | null;
  activeTab: NavigationTab;
  studentName: string;
  onSelectTab: (tab: NavigationTab) => void;
  onOpenUpload: () => void;
  onOpenSettings: () => void;
  onToggleTutor: () => void;
  onGoHome: () => void;
  onOpenStudentLogin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  profile,
  activeTab,
  studentName,
  onSelectTab,
  onOpenUpload,
  onOpenSettings,
  onToggleTutor,
  onGoHome,
  onOpenStudentLogin,
}) => {
  const [soundEnabled, setSoundEnabled] = useState(sounds.isEnabled());

  const handleToggleSound = () => {
    const newState = sounds.toggleSound();
    setSoundEnabled(newState);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b-2 border-sky-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between">
        {/* Brand with Exact Doraemon Avatar */}
        <div 
          onClick={onGoHome}
          className="flex items-center gap-2.5 cursor-pointer group select-none"
        >
          <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-[#0288D1] to-[#29B6F6] p-1 flex items-center justify-center shadow-sm shadow-sky-200 group-hover:scale-105 transition-transform duration-200 border-2 border-white">
            <img
              src="/doraemon_reference.png"
              alt="Doraemon"
              className="w-8 h-8 object-contain drop-shadow"
            />
            {/* Sparkle badge */}
            <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-yellow-400 border border-white flex items-center justify-center text-[8px]">
              ✨
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-[#0288D1] via-[#0277BD] to-[#01579B] bg-clip-text text-transparent">
                Doremon's
              </span>
              <span className="font-black text-lg sm:text-xl text-[#E53935] tracking-tight">3D</span>
              <span className="font-bold text-lg sm:text-xl text-slate-800 tracking-tight">World</span>
            </div>
            <p className="text-[10px] text-sky-700 font-semibold hidden sm:block">
              AI-Powered 3D LMS with 4D Pocket
            </p>
          </div>
        </div>

        {/* Center: Personalized Student Badge & Gamification Stats */}
        <div className="hidden md:flex items-center gap-2.5">
          {/* 3D Mode Pill */}
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white text-[11px] font-black shadow-xs">
            <span>✨</span>
            <span>3D Learning LMS</span>
          </span>

          {/* Personalized Student Profile Pill */}
          <button
            onClick={onOpenStudentLogin}
            title="Click to Switch Student Profile or Change Name"
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-950 text-xs font-black transition-all cursor-pointer shadow-2xs hover:scale-102"
          >
            <span className="text-sm">🎒</span>
            <span className="font-extrabold">{studentName || 'Himani'}</span>
            <span className="text-[9px] px-1 py-0.5 rounded-md bg-sky-200 text-sky-900 font-bold">
              Switch
            </span>
          </button>

          {/* Streak Counter */}
          <div 
            title="Daily Study Streak"
            className="flex items-center gap-1 px-3 py-1 rounded-xl bg-orange-50 border border-orange-200 text-orange-700 text-xs font-black shadow-2xs"
          >
            <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500 animate-pulse" />
            <span>{profile?.current_streak || 1}d</span>
          </div>

          {/* XP & Level Badge */}
          <div 
            title="Total XP & Progress"
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-sky-50 border border-sky-200 text-sky-900 text-xs font-black shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#FFD600] fill-[#FFD600]" />
            <span>Lv. {profile?.level || 1}</span>
            <span className="text-slate-300">|</span>
            <span className="text-sky-700">{profile?.total_xp || 0} XP</span>
          </div>
        </div>

        {/* Right Actions: Sound Switch, AI Tutor, Settings, Upload */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Mobile Student Profile Button */}
          <button
            onClick={onOpenStudentLogin}
            className="md:hidden p-1.5 rounded-xl bg-sky-50 border border-sky-200 text-sky-900 text-xs font-black"
            title="Switch Student Profile"
          >
            <span>🎒 {studentName || 'Himani'}</span>
          </button>

          {/* Royalty-free Sound ON/OFF switch */}
          <button
            onClick={handleToggleSound}
            title={soundEnabled ? 'Sound is ON (Click to Mute)' : 'Sound is OFF (Click to Enable Magical Chimes)'}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              soundEnabled
                ? 'bg-sky-100 border-sky-300 text-sky-900 shadow-xs'
                : 'bg-slate-100 border-slate-200 text-slate-400 hover:text-slate-700'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-sky-700" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>

          {/* AI Teacher Toggle */}
          <button
            onClick={onToggleTutor}
            title="Ask Doremon's AI Teacher"
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-sky-800 bg-sky-50 hover:bg-sky-100 border border-sky-200 transition-all hover:scale-102 cursor-pointer shadow-2xs"
          >
            <span className="text-sm">🤖</span>
            <span className="hidden sm:inline">AI Tutor</span>
          </button>

          {/* Settings Tab Button */}
          <button
            onClick={() => onSelectTab('settings')}
            title="Settings & API Configuration"
            className={`p-2 rounded-xl border transition-colors cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-sky-500 text-white border-sky-600 shadow-xs'
                : 'text-slate-500 hover:text-sky-600 hover:bg-sky-50 border-slate-200'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
          </button>

          {/* Prominent Upload Button */}
          <button
            onClick={onOpenUpload}
            className="flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl font-black text-xs sm:text-sm text-white bg-gradient-to-r from-[#0288D1] via-[#03A9F4] to-[#29B6F6] hover:from-[#0277BD] hover:to-[#0288D1] shadow-md shadow-sky-300/40 hover:shadow-sky-400/50 transition-all hover:-translate-y-0.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>+ Upload PPT / PDF</span>
          </button>
        </div>
      </div>
    </header>
  );
};
