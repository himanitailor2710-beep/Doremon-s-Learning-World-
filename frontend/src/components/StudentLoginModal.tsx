import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, User, Users, Check, Edit2 } from 'lucide-react';
import { api } from '../services/api';
import { StudentProfile } from '../types';
import { sounds } from '../services/soundEffects';

interface StudentLoginModalProps {
  isOpen: boolean;
  currentStudentName: string;
  onSaveProfile: (studentName: string, studentId: string) => void;
  onClose?: () => void;
  canDismiss?: boolean;
}

export const StudentLoginModal: React.FC<StudentLoginModalProps> = ({
  isOpen,
  currentStudentName,
  onSaveProfile,
  onClose,
  canDismiss = false,
}) => {
  const [nameInput, setNameInput] = useState(currentStudentName || 'Himani');
  const [existingProfiles, setExistingProfiles] = useState<StudentProfile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setNameInput(currentStudentName || 'Himani');
      loadProfiles();
    }
  }, [isOpen, currentStudentName]);

  const loadProfiles = async () => {
    try {
      const profiles = await api.getStudentProfiles();
      setExistingProfiles(profiles);
    } catch (e) {
      console.error('Failed to load student profiles', e);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const finalName = nameInput.trim() || 'Himani';
    setIsSubmitting(true);
    sounds.playMagicChime();

    try {
      const res = await api.createOrSwitchStudentProfile(finalName);
      onSaveProfile(res.name, res.id);
      if (onClose) onClose();
    } catch (err) {
      console.error(err);
      // Fallback
      const slug = finalName.toLowerCase().replace(/[^a-z0-9]/g, '_');
      onSaveProfile(finalName, `student_${slug}`);
      if (onClose) onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectExisting = (prof: StudentProfile) => {
    setNameInput(prof.name);
    sounds.playClickSound();
    onSaveProfile(prof.name, prof.id);
    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative max-w-md sm:max-w-lg w-full max-h-[88vh] overflow-y-auto bg-white rounded-3xl border-4 border-sky-300 shadow-2xl text-center p-5 sm:p-7 animate-in zoom-in-95 duration-200">
        {/* Soft Background Sky & Clouds Pattern */}
        <div className="absolute top-0 left-0 right-0 h-36 bg-gradient-to-b from-sky-400 via-sky-300 to-sky-100 opacity-30 pointer-events-none" />

        {/* Mascot Photograph */}
        <div className="relative z-10 flex flex-col items-center justify-center mb-4">
          <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-gradient-to-tr from-sky-200 to-white p-2 shadow-xl border-4 border-white flex items-center justify-center">
            <img
              src="/doraemon_reference.png"
              alt="Doraemon Welcome"
              className="w-32 h-32 sm:w-40 sm:h-40 object-contain animate-breathe drop-shadow-md"
            />
            {/* Sparkle badge */}
            <div className="absolute bottom-1 right-2 w-10 h-10 rounded-full bg-yellow-400 border-2 border-white flex items-center justify-center text-lg shadow-md animate-bounce">
              ✨
            </div>
          </div>
        </div>

        {/* Welcome Text */}
        <div className="relative z-10 mb-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-100 text-[#0288D1] text-xs font-black uppercase tracking-wider mb-2 border border-sky-200">
            <span>🎒</span>
            <span>Welcome to Doremon's Learning World</span>
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight leading-snug">
            Hello! What should I call you?
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-semibold mt-1">
            Enter your name to unlock your personalized learning journey with Doraemon!
          </p>
        </div>

        {/* Name Input Form */}
        <form onSubmit={handleSubmit} className="relative z-10 space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-sky-500" />
            </div>
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="e.g. Himani"
              maxLength={30}
              autoFocus
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-sky-50/70 border-2 border-sky-200 text-slate-900 font-black text-base sm:text-lg focus:outline-none focus:ring-4 focus:ring-sky-200 focus:border-[#0288D1] transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Live Personalised Greeting Preview */}
          {nameInput.trim() && (
            <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 text-amber-900 text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 animate-pop-in">
              <span>🌟</span>
              <span>
                "Welcome, {nameInput.trim()}! Are you ready to explore something new today?"
              </span>
            </div>
          )}

          {/* Start Learning Button */}
          <button
            type="submit"
            disabled={isSubmitting || !nameInput.trim()}
            className="w-full py-4 px-6 rounded-2xl font-black text-sm sm:text-base text-white bg-gradient-to-r from-[#0288D1] via-[#03A9F4] to-[#29B6F6] hover:from-[#0277BD] hover:to-[#0288D1] shadow-xl shadow-sky-300/50 hover:shadow-sky-400/60 hover:scale-102 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <span>🚀 Start Learning</span>
            <ArrowRight className="w-5 h-5 stroke-[3]" />
          </button>
        </form>

        {/* Switch Student Profiles List (if multiple exist) */}
        {existingProfiles.length > 0 && (
          <div className="relative z-10 mt-6 pt-5 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-2.5">
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                <span>Existing Student Profiles:</span>
              </span>
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              {existingProfiles.map((prof) => (
                <button
                  key={prof.id}
                  onClick={() => handleSelectExisting(prof)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black border transition-all cursor-pointer flex items-center gap-1.5 ${
                    nameInput.toLowerCase() === prof.name.toLowerCase()
                      ? 'bg-sky-500 text-white border-sky-600 shadow-xs'
                      : 'bg-slate-50 hover:bg-sky-50 text-slate-700 border-slate-200'
                  }`}
                >
                  <span>🎒</span>
                  <span>{prof.name}</span>
                  <span className="text-[10px] opacity-75 font-normal">({prof.total_xp} XP)</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Can Dismiss / Cancel if just opening from settings */}
        {canDismiss && onClose && (
          <button
            onClick={onClose}
            className="mt-4 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            Cancel & Return to Study World
          </button>
        )}
      </div>
    </div>
  );
};
