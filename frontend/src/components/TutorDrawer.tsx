import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Bot, Sparkles, FileText, ChevronDown, ChevronUp, ChevronRight, CheckCircle2, MessageSquare } from 'lucide-react';
import { TutorMessage } from '../types';
import { api } from '../services/api';
import { DoraemonMascot } from './DoraemonMascot';

interface TutorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeCourseId?: string;
  activeTopicId?: string;
  initialPrompt?: string;
}

export const TutorDrawer: React.FC<TutorDrawerProps> = ({
  isOpen,
  onClose,
  activeCourseId,
  activeTopicId,
  initialPrompt,
}) => {
  const [messages, setMessages] = useState<TutorMessage[]>([
    {
      id: 'welcome',
      role: 'tutor',
      content: "Kon'nichiwa! 🤖 I am your friendly **Doremon's AI Teacher**!\n\nI read directly from your uploaded slides and notes. I can explain any concept in simple English or Hinglish, give Indian industry examples (UPI, Tata, Jio, Zomato), show diagrams, and quiz you!\n\nWhat would you like to learn today?",
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [expandedMessages, setExpandedMessages] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialPrompt && isOpen) {
      handleSendMessage(initialPrompt);
    }
  }, [initialPrompt, isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (!isOpen) return null;

  // The 6 exact requested prompts
  const suggestedQuestions = [
    'Explain this in simple English.',
    'Explain in Hinglish.',
    'Give me a real-life example.',
    'Show me a diagram.',
    'Ask me five questions.',
    'Give me quick revision notes.',
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const q = textToSend || inputValue;
    if (!q.trim() || isLoading) return;

    const userMsg: TutorMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: q,
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputValue('');
    setIsLoading(true);

    try {
      const res = await api.sendTutorMessage(q, activeCourseId, activeTopicId);
      const tutorMsg: TutorMessage = {
        id: `tutor_${Date.now()}`,
        role: 'tutor',
        content: res.reply,
        citations: res.citations,
        source_snippets: res.source_snippets,
      };
      setMessages((prev) => [...prev, tutorMsg]);
    } catch (e: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          role: 'tutor',
          content: `⚠️ I had a small hiccup checking the lecture notes: ${e.message}. Let's try asking again!`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedMessages((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] bg-white border-l-2 border-sky-200 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0288D1] via-[#03A9F4] to-[#29B6F6] p-4 text-white flex items-center justify-between shrink-0 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-xl shadow-inner animate-float">
            🤖
          </div>
          <div>
            <h2 className="text-base font-black tracking-tight flex items-center gap-1.5">
              <span>Doremon's AI Teacher</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-400 text-emerald-950 font-black">
                RAG Grounded
              </span>
            </h2>
            <p className="text-[11px] text-sky-100 font-medium">
              Verified Slide & Page References
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-sky-50/40">
        {messages.map((msg) => {
          const isExpanded = expandedMessages[msg.id] ?? false;
          const isLong = msg.content.length > 320;
          const displayContent = isLong && !isExpanded
            ? msg.content.slice(0, 320) + '...'
            : msg.content;

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${
                msg.role === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`max-w-[92%] p-4 rounded-3xl text-xs sm:text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-[#0288D1] text-white rounded-br-xs shadow-sm font-semibold'
                    : 'bg-white text-slate-800 border-2 border-sky-100 rounded-bl-xs shadow-sm font-medium'
                }`}
              >
                <div className="whitespace-pre-line">{displayContent}</div>

                {/* Expand / Collapse Button for long explanations */}
                {isLong && (
                  <button
                    onClick={() => toggleExpand(msg.id)}
                    className="mt-2 text-xs font-black text-[#0288D1] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>{isExpanded ? 'Show Less' : 'Expand for More Detail'}</span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                )}

                {/* Citations Chips */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] font-bold text-slate-500">
                      Grounded Citations:
                    </span>
                    {msg.citations.map((cite, cIdx) => (
                      <span
                        key={cIdx}
                        className="text-[10px] font-black px-2 py-0.5 rounded-md bg-sky-100 text-sky-800 border border-sky-200 shadow-2xs"
                      >
                        {cite}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-3 p-3 bg-white rounded-2xl border-2 border-sky-200 shadow-sm max-w-[85%]">
            <DoraemonMascot state="thinking" size="sm" showSpeechBubble={false} />
            <span className="text-xs text-slate-700 font-bold leading-snug">
              Consulting your lecture notes & preparing simple explanation...
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions Grid (Explicit user requirement) */}
      <div className="p-3 bg-slate-50 border-t border-slate-200 shrink-0">
        <div className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1.5 px-1 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-[#0288D1]" />
          <span>Ask Doremon's AI Teacher:</span>
        </div>
        <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
          {suggestedQuestions.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              disabled={isLoading}
              className="text-[11px] font-bold px-3 py-1 rounded-full bg-white hover:bg-sky-50 text-sky-800 border border-sky-200 hover:border-[#0288D1] transition-all cursor-pointer shadow-2xs"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Input Box */}
      <div className="p-3 bg-white border-t border-slate-200 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type any study question or topic..."
            className="flex-1 px-4 py-2.5 rounded-2xl border border-slate-200 focus:outline-none focus:border-[#0288D1] text-xs sm:text-sm text-slate-800 placeholder-slate-400"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="p-2.5 rounded-2xl bg-gradient-to-r from-[#0288D1] to-[#03A9F4] text-white hover:from-[#0277BD] hover:to-[#0288D1] shadow-md shadow-sky-200 disabled:opacity-50 cursor-pointer transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
