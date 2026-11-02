import React, { useState, useEffect } from 'react';
import { X, Key, CheckCircle2, AlertCircle, Loader2, Sparkles, Shield, Cpu } from 'lucide-react';
import { api } from '../services/api';
import { AppSettings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsUpdated: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onSettingsUpdated,
}) => {
  const [apiKey, setApiKey] = useState('');
  const [modelName, setModelName] = useState('gemini-1.5-flash');
  const [currentSettings, setCurrentSettings] = useState<AppSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadSettings();
    }
  }, [isOpen]);

  const loadSettings = async () => {
    try {
      const data = await api.getSettings();
      setCurrentSettings(data);
      setModelName(data.model_name || 'gemini-1.5-flash');
    } catch (e) {
      console.error(e);
    }
  };

  if (!isOpen) return null;

  const handleSave = async () => {
    setSaving(true);
    setTestResult(null);
    try {
      await api.updateSettings({
        gemini_api_key: apiKey,
        model_name: modelName,
      });
      await loadSettings();
      setApiKey('');
      onSettingsUpdated();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await api.testConnection();
      setTestResult({
        success: res.success,
        message: res.message,
      });
    } catch (e: any) {
      setTestResult({
        success: false,
        message: e.message || 'Connection test failed',
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-lg w-full border border-sky-100 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center text-xl">
              ⚙️
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight flex items-center gap-2">
                <span>AI Tutor & Engine Settings</span>
              </h2>
              <p className="text-xs text-slate-300 font-medium">
                Configure your Gemini API key securely
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

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Engine Status Banner */}
          <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 flex items-start gap-3">
            <Cpu className="w-5 h-5 text-sky-700 mt-0.5 shrink-0" />
            <div className="text-xs text-sky-950 leading-relaxed font-medium">
              <span className="font-bold">Dual-Engine Architecture:</span> Doremon's Learning World includes a built-in Intelligent Heuristic Engine that extracts lessons and generates quizzes immediately out of the box. Adding your Gemini API key activates live conversational LLM reasoning!
            </div>
          </div>

          {/* Current Config State */}
          <div className="text-xs space-y-1">
            <span className="font-bold text-slate-700">Current AI Status: </span>
            {currentSettings?.is_configured ? (
              <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Active Key: {currentSettings.masked_key}
              </span>
            ) : (
              <span className="font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                Built-in Intelligent Engine Active
              </span>
            )}
          </div>

          {/* API Key Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Google Gemini API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={currentSettings?.is_configured ? 'Enter new key to update...' : 'AIzaSy...'}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0288D1]"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Keys are stored securely on your local backend and never exposed to the frontend.
            </p>
          </div>

          {/* Model Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Gemini Model
            </label>
            <select
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-[#0288D1] bg-white cursor-pointer"
            >
              <option value="gemini-1.5-flash">Gemini 1.5 Flash (Fast & Recommended)</option>
              <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
              <option value="gemini-1.5-pro">Gemini 1.5 Pro (Deep Reasoning)</option>
            </select>
          </div>

          {/* Test Result Message */}
          {testResult && (
            <div
              className={`p-3.5 rounded-xl text-xs flex items-start gap-2 border ${
                testResult.success
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-950 font-medium'
                  : 'bg-rose-50 border-rose-200 text-rose-950'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <span>{testResult.message}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <button
              onClick={handleTestConnection}
              disabled={testing}
              className="px-4 py-2 rounded-xl text-xs font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              {testing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Testing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Test Connection</span>
                </>
              )}
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || (!apiKey && modelName === currentSettings?.model_name)}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-black shadow-xs disabled:opacity-50 cursor-pointer"
              >
                {saving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
