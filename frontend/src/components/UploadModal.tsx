import React, { useState, useRef, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { X, UploadCloud, FileText, CheckCircle2, AlertCircle, Loader2, Sparkles, ArrowRight } from 'lucide-react';
import { api } from '../services/api';
import { Course } from '../types';
import { DoraemonMascot } from './DoraemonMascot';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (courseId?: string) => void;
  targetCourseId?: string;
  targetSessionId?: string;
  targetSessionTitle?: string;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onUploadSuccess,
  targetCourseId,
  targetSessionId,
  targetSessionTitle,
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [createdCourses, setCreatedCourses] = useState<Course[]>([]);
  const [activeCourseStatus, setActiveCourseStatus] = useState<any>(null);
  const [subjectName, setSubjectName] = useState<string>('');
  const [sessionTitle, setSessionTitle] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      setSelectedFiles([]);
      setCurrentStep(1);
      setIsUploading(false);
      setErrorMessage(null);
      setCreatedCourses([]);
      setActiveCourseStatus(null);
      setSubjectName('');
      setSessionTitle(targetSessionTitle || '');
    }
  }, [isOpen, targetSessionTitle]);

  // Polling for course status during Step 3
  useEffect(() => {
    if (currentStep !== 3 || createdCourses.length === 0) return;
    const targetId = createdCourses[0].id;

    const interval = setInterval(async () => {
      try {
        const detail = await api.getCourseDetail(targetId);
        setActiveCourseStatus(detail);
        if (detail.status === 'ready') {
          clearInterval(interval);
          try {
            confetti({
              particleCount: 80,
              spread: 70,
              origin: { y: 0.6 },
              colors: ['#0288D1', '#FFD600', '#E53935', '#00E676'],
            });
          } catch (e) {}
        } else if (detail.status === 'error') {
          clearInterval(interval);
          setErrorMessage(detail.status_message || 'Processing encountered an error.');
        }
      } catch (e) {
        console.error(e);
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [currentStep, createdCourses]);

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (incoming: File[]) => {
    const valid = incoming.filter(
      (f) => f.name.endsWith('.pptx') || f.name.endsWith('.pdf')
    );
    if (valid.length === 0) {
      setErrorMessage('Please select valid PowerPoint (.pptx) or PDF (.pdf) documents.');
      return;
    }
    setErrorMessage(null);
    setSelectedFiles((prev) => [...prev, ...valid]);
    setCurrentStep(2);
  };

  const removeFile = (idx: number) => {
    const updated = selectedFiles.filter((_, i) => i !== idx);
    setSelectedFiles(updated);
    if (updated.length === 0) setCurrentStep(1);
  };

  const handleStartProcessing = async () => {
    if (selectedFiles.length === 0) return;
    setIsUploading(true);
    setErrorMessage(null);

    try {
      if (targetSessionId && targetCourseId) {
        await api.uploadSessionFile(targetCourseId, targetSessionId, selectedFiles[0]);
        setCreatedCourses([{
          id: targetCourseId,
          title: sessionTitle || targetSessionTitle || 'Session Document',
          filename: selectedFiles[0].name,
          file_type: selectedFiles[0].name.endsWith('.pptx') ? 'pptx' : 'pdf',
          status: 'reading'
        } as any]);
        setIsUploading(false);
        setCurrentStep(3);
      } else {
        const res = await api.uploadFiles(
          selectedFiles,
          subjectName.trim() || undefined,
          sessionTitle.trim() || undefined,
          targetCourseId
        );
        setCreatedCourses(res.courses);
        setIsUploading(false);
        setCurrentStep(3);
      }
    } catch (err: any) {
      setIsUploading(false);
      setErrorMessage(err.message || 'Failed to upload files.');
    }
  };

  const isComplete = activeCourseStatus?.status === 'ready';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[82vh] sm:max-h-[85vh] border-2 border-sky-300 shadow-2xl shadow-sky-950/30 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header - Fixed at Top */}
        <div className="shrink-0 bg-gradient-to-r from-[#0288D1] via-[#03A9F4] to-[#29B6F6] px-4 py-2.5 sm:px-5 sm:py-3 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center text-base shadow-inner">
              🎒
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black tracking-tight flex items-center gap-2">
                <span>Upload Study Materials</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-400 text-yellow-950 font-black">
                  Step {currentStep} of 3
                </span>
              </h2>
              <p className="text-[10px] sm:text-[11px] text-sky-100 font-medium">
                Automatic 3D course, session, lesson & quiz generator
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isUploading}
            className="p-1 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3-Step Wizard Progress Bar - Fixed */}
        <div className="shrink-0 bg-sky-50 px-4 py-1.5 border-b border-sky-100 flex items-center justify-between text-xs font-bold">
          <div className={`flex items-center gap-1.5 ${currentStep >= 1 ? 'text-[#0288D1]' : 'text-slate-400'}`}>
            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] text-white font-black ${
              currentStep >= 1 ? 'bg-[#0288D1]' : 'bg-slate-300'
            }`}>1</span>
            <span>Subject & Files</span>
          </div>
          <div className="w-6 h-0.5 bg-slate-200" />
          <div className={`flex items-center gap-1.5 ${currentStep >= 2 ? 'text-[#0288D1]' : 'text-slate-400'}`}>
            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] text-white font-black ${
              currentStep >= 2 ? 'bg-[#0288D1]' : 'bg-slate-300'
            }`}>2</span>
            <span>Review</span>
          </div>
          <div className="w-6 h-0.5 bg-slate-200" />
          <div className={`flex items-center gap-1.5 ${currentStep === 3 ? 'text-emerald-700' : 'text-slate-400'}`}>
            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] text-white font-black ${
              currentStep === 3 ? 'bg-emerald-600' : 'bg-slate-300'
            }`}>3</span>
            <span>Ready to Learn</span>
          </div>
        </div>

        {/* Scrollable Body - Guaranteed to fit and never push buttons off screen */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-3 scrollbar-thin scrollbar-thumb-sky-200">
          {/* STEP 1 & 2: SELECT & REVIEW FILES */}
          {currentStep < 3 && (
            <>
              {/* Option to Specify Name of Subject & Session Details */}
              <div className="p-3 rounded-2xl bg-sky-50/90 border-2 border-sky-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-black text-[#0288D1]">
                    <span>📘</span>
                    <span>Set Subject & Session Name</span>
                  </div>
                  <span className="text-[10px] font-bold text-sky-600">Customizable anytime</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-700 mb-0.5">
                      Name of Subject *
                    </label>
                    <input
                      type="text"
                      value={subjectName}
                      onChange={(e) => setSubjectName(e.target.value)}
                      placeholder="e.g. Economics, Marketing, Data Structures..."
                      className="w-full px-3 py-1.5 rounded-xl border border-sky-300 focus:border-[#0288D1] focus:ring-2 focus:ring-sky-100 bg-white text-xs font-bold text-slate-800 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-700 mb-0.5">
                      Session Details / Number
                    </label>
                    <input
                      type="text"
                      value={sessionTitle}
                      onChange={(e) => setSessionTitle(e.target.value)}
                      placeholder="e.g. Session 1: Introduction, Chapter 2..."
                      className="w-full px-3 py-1.5 rounded-xl border border-sky-300 focus:border-[#0288D1] focus:ring-2 focus:ring-sky-100 bg-white text-xs font-bold text-slate-800 outline-none"
                    />
                  </div>
                </div>
              </div>

              {targetSessionTitle && !sessionTitle && (
                <div className="p-2.5 rounded-xl bg-sky-100/70 border border-sky-200 flex items-center gap-2 text-xs text-sky-900 font-bold shadow-xs">
                  <span className="text-base">🎯</span>
                  <div className="truncate">
                    <span className="text-[10px] uppercase font-black tracking-wider text-sky-600">Uploading to: </span>
                    <span className="font-black text-slate-900">{targetSessionTitle}</span>
                  </div>
                </div>
              )}

              {/* Drag & Drop Box */}
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-3xl p-6 text-center cursor-pointer transition-all duration-200 ${
                  dragActive
                    ? 'border-[#0288D1] bg-sky-50 scale-99'
                    : 'border-sky-200 hover:border-[#0288D1] bg-slate-50/70 hover:bg-sky-50/50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pptx,.pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="w-14 h-14 mx-auto rounded-3xl bg-sky-100 flex items-center justify-center text-[#0288D1] mb-3 shadow-xs">
                  <UploadCloud className="w-7 h-7" />
                </div>
                <p className="text-sm font-black text-slate-800 mb-1">
                  Click to select PPTX or PDF files
                </p>
                <p className="text-xs text-slate-500 font-medium mb-3">
                  Supports PowerPoint presentations (.pptx) & PDF documents
                </p>
                {/* Academic Subjects Supported (Requirement 5) */}
                <div className="flex flex-wrap gap-1.5 justify-center pt-2 border-t border-slate-200/60">
                  {[
                    'Marketing', 'Product Mgmt', 'Economics', 'Finance',
                    'Accounting', 'Statistics', 'Science', 'Computer Science', 'Psychology'
                  ].map((subj) => (
                    <span
                      key={subj}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-white/90 border border-sky-100 text-sky-800 font-extrabold"
                    >
                      {subj}
                    </span>
                  ))}
                </div>
              </div>

              {/* Selected Files List */}
              {selectedFiles.length > 0 && (
                <div className="mt-4 max-h-40 overflow-y-auto space-y-2 pr-1">
                  <p className="text-xs font-bold text-slate-700">
                    Selected Study Documents ({selectedFiles.length}):
                  </p>
                  {selectedFiles.map((file, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-2xl bg-sky-50/80 border border-sky-100 text-xs"
                    >
                      <div className="flex items-center gap-2 overflow-hidden pr-2">
                        <FileText className="w-4 h-4 text-[#0288D1] shrink-0" />
                        <span className="font-bold text-slate-800 truncate">
                          {file.name}
                        </span>
                        <span className="text-[10px] text-slate-400 shrink-0">
                          ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile(idx);
                        }}
                        className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* STEP 3: COMPACT & FOOLPROOF PROGRESS SCREEN */}
          {currentStep === 3 && (
            <div className="space-y-3">
              {/* If Complete: Show Big Celebration & Direct Learning Button */}
              {isComplete ? (
                <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50 to-sky-50 border-2 border-emerald-300 shadow-md text-center space-y-3 animate-in zoom-in-95 duration-200">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-black">
                    <span>🎉</span>
                    <span>Subject & Sessions Ready!</span>
                  </div>

                  <div>
                    <div className="text-[10px] font-black uppercase tracking-wider text-sky-600">Active Subject</div>
                    <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                      {createdCourses[0]?.title || subjectName || selectedFiles[0]?.name}
                    </h3>
                    {sessionTitle && (
                      <p className="text-xs font-bold text-sky-700 mt-0.5">
                        {sessionTitle}
                      </p>
                    )}
                    <div className="flex items-center justify-center gap-2 mt-2 text-xs font-bold">
                      <span className="px-2.5 py-0.5 rounded-lg bg-white border border-sky-200 text-sky-900">
                        📄 {activeCourseStatus?.total_units || 'All'} Units Extracted
                      </span>
                      <span className="px-2.5 py-0.5 rounded-lg bg-emerald-100 border border-emerald-300 text-emerald-900 font-black">
                        100% Zero Omissions
                      </span>
                    </div>
                  </div>

                  {/* High Visibility Start Learning Button Directly in Content */}
                  <button
                    onClick={() => {
                      onUploadSuccess(createdCourses[0]?.id);
                      onClose();
                    }}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-sm font-black text-white bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-600 hover:to-teal-700 shadow-lg shadow-emerald-200 hover:scale-102 transition-all cursor-pointer animate-pulse"
                  >
                    <span>🚀 Start Learning Now</span>
                    <ArrowRight className="w-4 h-4 stroke-[3]" />
                  </button>
                </div>
              ) : (
                /* Processing State: Clean & Compact */
                <div className="space-y-2.5">
                  <div className="p-3 rounded-2xl bg-sky-50 border border-sky-200 flex items-center gap-3">
                    <Loader2 className="w-6 h-6 text-[#0288D1] animate-spin shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-black text-slate-800">
                        Examining Slides & Extracting Topics...
                      </div>
                      <p className="text-[11px] text-sky-700 font-medium truncate">
                        {activeCourseStatus?.status_message || 'Creating your personalized learning journey'}
                      </p>
                    </div>
                    <span className="text-xs font-black text-sky-800">
                      {activeCourseStatus?.progress_percent || 25}%
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#0288D1] to-[#03A9F4] transition-all duration-300 rounded-full"
                      style={{ width: `${activeCourseStatus?.progress_percent || 25}%` }}
                    />
                  </div>

                  {/* 7 Stages compact pills */}
                  <div className="grid grid-cols-1 gap-1">
                    {[
                      { label: 'Receiving study material', threshold: 10 },
                      { label: 'Reading slides and pages', threshold: 25 },
                      { label: 'Understanding content', threshold: 45 },
                      { label: 'Discovering topics & hierarchy', threshold: 60 },
                      { label: 'Connecting related concepts', threshold: 75 },
                      { label: 'Preparing simple explanations', threshold: 90 },
                      { label: 'Creating learning journey', threshold: 100 },
                    ].map((st, sIdx) => {
                      const cur = activeCourseStatus?.progress_percent || 20;
                      const isDone = cur >= st.threshold;
                      return (
                        <div
                          key={sIdx}
                          className={`flex items-center justify-between px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                            isDone ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-50 text-slate-400'
                          }`}
                        >
                          <span className="flex items-center gap-1.5">
                            {isDone ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            ) : (
                              <span className="w-3.5 h-3.5 rounded-full border border-slate-300 flex items-center justify-center text-[9px] shrink-0 font-bold">
                                {sIdx + 1}
                              </span>
                            )}
                            <span>{st.label}</span>
                          </span>
                          {isDone && <span className="text-[9px] text-emerald-600 font-black">DONE</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Fixed Footer Action Bar - ALWAYS VISIBLE AT BOTTOM! */}
        <div className="shrink-0 bg-white border-t border-sky-100 px-5 py-3 flex items-center justify-between z-10 shadow-xs">
          {currentStep < 3 ? (
            <>
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleStartProcessing}
                disabled={isUploading || selectedFiles.length === 0}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black text-white bg-gradient-to-r from-[#0288D1] to-[#03A9F4] hover:from-[#0277BD] hover:to-[#0288D1] shadow-md shadow-sky-200 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Uploading Files...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-yellow-300" />
                    <span>Start Processing ({selectedFiles.length})</span>
                  </>
                )}
              </button>
            </>
          ) : (
            <div className="w-full flex items-center justify-between gap-3">
              <button
                onClick={() => {
                  onUploadSuccess();
                  onClose();
                }}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors"
              >
                Close & View Dashboard
              </button>

              {isComplete ? (
                <button
                  onClick={() => {
                    onUploadSuccess(createdCourses[0]?.id);
                    onClose();
                  }}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-black text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-lg shadow-emerald-200 hover:scale-102 transition-all cursor-pointer animate-pulse"
                >
                  <span>🚀 Start Learning Now</span>
                  <ArrowRight className="w-4 h-4 stroke-[3]" />
                </button>
              ) : (
                <span className="text-xs font-bold text-sky-700 flex items-center gap-1.5 animate-pulse">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Processing in 4D pocket...</span>
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
