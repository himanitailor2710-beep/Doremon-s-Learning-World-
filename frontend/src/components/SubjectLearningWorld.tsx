import React, { useState, useRef } from 'react';
import { CourseDetail, Topic, Lesson, CourseMaterial } from '../types';
import { api } from '../services/api';
import { sounds } from '../services/soundEffects';
import { ThreeInteractiveUniverse } from './ThreeInteractiveUniverse';
import { TopicExplanationModal } from './TopicExplanationModal';
import {
  ArrowLeft,
  UploadCloud,
  FileText,
  Sparkles,
  Loader2,
  Plus,
  BookOpen,
  Trash2,
  Rocket,
  Layers,
  Presentation,
  CheckCircle2,
  AlertTriangle,
  FolderOpen
} from 'lucide-react';

interface SubjectLearningWorldProps {
  courseDetail: CourseDetail;
  studentName: string;
  onBackToHouse: () => void;
  onReloadCourse: (courseId: string) => Promise<void>;
}

export const SubjectLearningWorld: React.FC<SubjectLearningWorldProps> = ({
  courseDetail,
  studentName,
  onBackToHouse,
  onReloadCourse,
}) => {
  // Navigation State: 'materials' (Directory of uploaded PPTs/PDFs) | 'universe' (3D Space Universe)
  const [viewMode, setViewMode] = useState<'materials' | 'universe'>('materials');

  // Flatten topics from all sessions
  const allTopics: Topic[] = React.useMemo(() => {
    const list: Topic[] = [];
    courseDetail.sessions?.forEach((sess) => {
      sess.topics?.forEach((t) => list.push(t));
    });
    return list;
  }, [courseDetail]);

  // Materials list (PPTs / PDFs uploaded to this subject)
  const materialsList: CourseMaterial[] = React.useMemo(() => {
    if (courseDetail.materials && courseDetail.materials.length > 0) {
      return courseDetail.materials;
    }
    // Fallback if course has a filename
    if (courseDetail.filename && courseDetail.filename.trim()) {
      return [
        {
          id: `doc_${courseDetail.id}`,
          course_id: courseDetail.id,
          filename: courseDetail.filename,
          file_type: (courseDetail.file_type || 'pptx') as 'pptx' | 'pdf',
          title: courseDetail.filename,
          total_units: courseDetail.total_units || allTopics.length,
          topic_count: allTopics.length,
          status: courseDetail.status,
          created_at: courseDetail.created_at,
        },
      ];
    }
    return [];
  }, [courseDetail, allTopics]);

  const [activeTopicId, setActiveTopicId] = useState<string | null>(
    allTopics.length > 0 ? allTopics[0].id : null
  );
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [isExplanationOpen, setIsExplanationOpen] = useState(false);
  const [isLoadingLesson, setIsLoadingLesson] = useState(false);

  // Deletion modal state for removing a PPT
  const [materialToDelete, setMaterialToDelete] = useState<CourseMaterial | null>(null);
  const [isDeletingMaterial, setIsDeletingMaterial] = useState(false);

  // Upload state inside subject
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatusMsg, setUploadStatusMsg] = useState('');
  const [sessionTitle, setSessionTitle] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cardFileInputRef = useRef<HTMLInputElement>(null);

  // Open Lesson Explanation Modal (the 10-point view)
  const handleOpenLesson = async (topicId: string) => {
    setActiveTopicId(topicId);
    setIsLoadingLesson(true);
    try {
      sounds.playMagicChime();
      const lessonData = await api.getLesson(topicId);
      setActiveLesson(lessonData);
      setIsExplanationOpen(true);
    } catch (e) {
      console.error('Failed to load lesson', e);
    } finally {
      setIsLoadingLesson(false);
    }
  };

  // Launch into 3D Space Universe for study
  const handleEnter3DUniverse = () => {
    sounds.playMagicChime();
    setViewMode('universe');
  };

  // Upload handler for this specific subject
  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const fileList = Array.from(files);

    try {
      setIsUploading(true);
      setUploadProgress(15);
      setUploadStatusMsg('Receiving document into 4D pocket...');
      sounds.playMagicChime();

      // Call API upload with target_course_id = current subject!
      await api.uploadFiles(
        fileList,
        courseDetail.title, // Keep exact subject title
        sessionTitle.trim() || undefined,
        courseDetail.id // Target this exact subject!
      );

      // Poll until ready
      setUploadProgress(45);
      setUploadStatusMsg('Reading every slide & extracting all topics with 100% zero omissions...');

      const pollInterval = setInterval(async () => {
        try {
          const detail = await api.getCourseDetail(courseDetail.id);
          if (detail.status === 'ready' || (detail.status_message && detail.status_message.includes('Ready'))) {
            clearInterval(pollInterval);
            setUploadProgress(100);
            setUploadStatusMsg('3D Knowledge Universe Ready!');
            sounds.playSuccessChime();
            await onReloadCourse(courseDetail.id);
            setIsUploading(false);
            setShowUploadModal(false);
          } else {
            setUploadProgress((prev) => Math.min(prev + 10, 90));
            setUploadStatusMsg(detail.status_message || 'Analyzing conceptual connections...');
          }
        } catch {
          // ignore transient poll error
        }
      }, 1500);
    } catch (err: any) {
      setIsUploading(false);
      alert(err.message || 'Failed to upload document.');
    }
  };

  // Remove / Delete uploaded presentation
  const confirmDeleteMaterial = async () => {
    if (!materialToDelete) return;
    try {
      setIsDeletingMaterial(true);
      sounds.playPopSound();
      await api.deleteMaterial(courseDetail.id, materialToDelete.id);
      await onReloadCourse(courseDetail.id);
      setMaterialToDelete(null);
      setViewMode('materials');
    } catch (err: any) {
      alert(err.message || 'Failed to remove study material.');
    } finally {
      setIsDeletingMaterial(false);
    }
  };

  const hasMaterials = materialsList.length > 0 || allTopics.length > 0;

  return (
    <div className="relative min-h-screen w-full bg-[#05162A] text-white flex flex-col select-none overflow-x-hidden">
      {/* ============================================================== */}
      {/* TOP HEADER: SUBJECT TITLE & NAVIGATION                         */}
      {/* ============================================================== */}
      <header className="sticky top-0 z-40 bg-[#061E38]/95 backdrop-blur-md border-b-2 border-sky-400/30 px-4 sm:px-8 py-3 flex items-center justify-between shadow-xl">
        {/* Left Navigation Buttons */}
        <div className="flex items-center gap-2">
          {viewMode === 'universe' ? (
            <button
              onClick={() => setViewMode('materials')}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-xs sm:text-sm font-black text-cyan-200 hover:text-white transition-all cursor-pointer shadow-xs hover:scale-102"
              title="Return to the list of PPTs/PDFs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>← Back to PPTs / Materials</span>
            </button>
          ) : (
            <button
              onClick={onBackToHouse}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs sm:text-sm font-black text-sky-200 hover:text-white transition-all cursor-pointer shadow-xs hover:scale-102"
              title="Return to Doraemon's House"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>← Back to Doraemon's House</span>
            </button>
          )}

          {/* Quick House Shortcut when inside 3D Universe */}
          {viewMode === 'universe' && (
            <button
              onClick={onBackToHouse}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-bold text-sky-300 hover:text-white transition-all cursor-pointer"
              title="Return directly to Doraemon's House"
            >
              <span>🏠 House</span>
            </button>
          )}
        </div>

        {/* Big Official Subject Banner: DORAEMON LEARNING WORLD – [SUBJECT NAME] */}
        <div className="text-center px-2">
          <div className="flex items-center justify-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-cyan-300">
            <span>✨</span>
            <span>Doraemon Learning World</span>
            <span>✨</span>
          </div>
          <h1 className="text-base sm:text-xl font-black tracking-tight text-white drop-shadow-md truncate max-w-xs sm:max-w-md md:max-w-xl">
            {courseDetail.title.toUpperCase()}
          </h1>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-black text-xs text-[#01579B] bg-gradient-to-r from-yellow-300 to-amber-300 hover:from-yellow-400 hover:to-amber-400 border border-yellow-400 transition-all cursor-pointer shadow-xs hover:scale-102"
            title="Upload another session presentation or PDF"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span className="hidden sm:inline">+ Upload PPT / PDF</span>
          </button>

          <div className="px-3 py-1 rounded-full bg-sky-950/80 border border-sky-500/40 text-xs font-black text-sky-200">
            🎒 {studentName}
          </div>
        </div>
      </header>

      {/* ============================================================== */}
      {/* MAIN CONTENT AREA: MATERIALS DIRECTORY OR 3D SPACE UNIVERSE    */}
      {/* ============================================================== */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 flex flex-col justify-center">
        {!hasMaterials ? (
          /* ========================================================== */
          /* CASE A: ZERO MATERIALS -> DORAEMON UPLOAD CLOUD ZONE       */
          /* ========================================================== */
          <div className="max-w-2xl w-full mx-auto text-center space-y-6 animate-in zoom-in-95 duration-300">
            {/* Doraemon Mascot Greeting */}
            <div className="relative w-32 h-40 mx-auto">
              <img
                src="/doraemon_reference.png"
                alt="Doraemon"
                className="w-full h-full object-contain filter drop-shadow-2xl animate-bounce"
              />
              <div className="absolute -top-2 right-2 w-7 h-7 rounded-full bg-yellow-400 border-2 border-white flex items-center justify-center text-xs shadow-md">
                🎒
              </div>
            </div>

            {/* Speech Dialogue */}
            <div className="relative p-4 rounded-3xl bg-white/95 text-slate-800 border-3 border-sky-300 shadow-2xl max-w-lg mx-auto">
              <p className="text-sm font-black leading-snug">
                Welcome to your <strong className="text-[#0288D1]">{courseDetail.title}</strong> learning world, {studentName}!
                Upload your session PPTs or PDFs below, and my 4D pocket will extract every concept into a 3D knowledge universe!
              </p>
              <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-t-3 border-l-3 border-sky-300 rotate-45 transform" />
            </div>

            {/* Interactive Upload Cloud Zone */}
            <div
              onClick={() => !isUploading && fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (!isUploading) handleFileUpload(e.dataTransfer.files);
              }}
              className="relative p-8 sm:p-12 rounded-[50px] bg-gradient-to-b from-[#0A2540] via-[#0D3B66] to-[#0A2540] border-4 border-dashed border-sky-400/60 hover:border-sky-300 shadow-2xl shadow-sky-500/10 cursor-pointer group hover:scale-102 transition-all duration-300 flex flex-col items-center justify-center text-center overflow-hidden"
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pptx,.pdf"
                onChange={(e) => handleFileUpload(e.target.files)}
                className="hidden"
              />

              {isUploading ? (
                <div className="space-y-4 py-4 w-full max-w-md">
                  <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mx-auto" />
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-white mb-1">
                      Doraemon is Extracting Your Knowledge
                    </h3>
                    <p className="text-xs text-sky-200">{uploadStatusMsg}</p>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-3 border border-sky-400/40 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-cyan-400 via-sky-400 to-yellow-400 h-full transition-all duration-500 rounded-full"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-3xl bg-sky-500/20 border-2 border-sky-400/40 flex items-center justify-center text-cyan-300 mb-4 group-hover:scale-110 group-hover:rotate-6 transition-transform shadow-inner">
                    <UploadCloud className="w-8 h-8" />
                  </div>

                  <h3 className="text-lg sm:text-xl font-black text-white tracking-tight mb-1">
                    Click or Drag & Drop Study Documents
                  </h3>
                  <p className="text-xs sm:text-sm text-sky-200 font-medium mb-4">
                    Supports PowerPoint presentations (.pptx) and PDF files (.pdf)
                  </p>

                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-sky-950/80 border border-sky-400/30 text-[11px] font-black text-sky-200">
                      📊 PowerPoint (.pptx)
                    </span>
                    <span className="px-3 py-1 rounded-full bg-sky-950/80 border border-sky-400/30 text-[11px] font-black text-sky-200">
                      📄 PDF Documents (.pdf)
                    </span>
                    <span className="px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-400/30 text-[11px] font-black text-emerald-300">
                      ✨ 100% Zero Omissions
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        ) : viewMode === 'materials' ? (
          /* ========================================================== */
          /* CASE B: SHOW UPLOADED PPTs / PDFs DIRECTORY FIRST          */
          /* ========================================================== */
          <div className="w-full space-y-6 animate-in fade-in duration-300">
            {/* Doraemon Guide Banner for Materials */}
            <div className="flex flex-col sm:flex-row items-center gap-4 p-5 rounded-3xl bg-gradient-to-r from-sky-900/60 via-[#0A2E50]/80 to-sky-950/70 border-2 border-sky-400/40 backdrop-blur-md shadow-xl">
              <div className="w-16 h-20 shrink-0">
                <img
                  src="/doraemon_reference.png"
                  alt="Doraemon"
                  className="w-full h-full object-contain filter drop-shadow-md animate-bounce"
                />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-base sm:text-lg font-black text-white flex items-center justify-center sm:justify-start gap-2">
                  <span>Study Presentations for {courseDetail.title}</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-400 text-slate-950 font-black">
                    {materialsList.length} Material{materialsList.length !== 1 ? 's' : ''}
                  </span>
                </h2>
                <p className="text-xs sm:text-sm text-sky-200 mt-1">
                  Choose a presentation below to enter its <strong>3D Knowledge Universe</strong> with floating topic planets, or remove any document to replace it.
                </p>
              </div>

              <button
                onClick={handleEnter3DUniverse}
                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl font-black text-xs sm:text-sm text-[#01579B] bg-gradient-to-r from-[#FFD600] to-[#FFE082] hover:from-[#FFCA28] hover:to-[#FFD600] shadow-lg shadow-yellow-500/20 hover:scale-105 active:scale-95 transition-all cursor-pointer animate-pulse shrink-0"
              >
                <Rocket className="w-4 h-4 text-[#01579B]" />
                <span>Launch 3D Universe</span>
              </button>
            </div>

            {/* Grid of Uploaded Presentations / Documents */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {materialsList.map((material, idx) => {
                const isPptx = material.file_type === 'pptx' || material.filename.endsWith('.pptx');
                return (
                  <div
                    key={material.id || idx}
                    className="relative group rounded-3xl bg-gradient-to-b from-[#0A2A4A] to-[#061C33] border-2 border-sky-400/40 hover:border-sky-300 p-5 shadow-xl hover:shadow-2xl hover:shadow-sky-500/20 transition-all duration-300 flex flex-col justify-between"
                  >
                    {/* Top Row: File Type Badge & Status */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-9 h-9 rounded-2xl flex items-center justify-center text-sm shadow-md ${
                            isPptx
                              ? 'bg-gradient-to-tr from-amber-500 to-orange-400 text-white border border-amber-300'
                              : 'bg-gradient-to-tr from-rose-600 to-red-400 text-white border border-rose-300'
                          }`}
                        >
                          {isPptx ? '📊' : '📄'}
                        </div>
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-wider text-cyan-300 block">
                            {isPptx ? 'PowerPoint Presentation' : 'PDF Document'}
                          </span>
                          <span className="text-[10px] text-sky-300 font-semibold">
                            Session {idx + 1}
                          </span>
                        </div>
                      </div>

                      <span className="flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        Ready
                      </span>
                    </div>

                    {/* Middle: Presentation Name & Counts */}
                    <div className="space-y-2 mb-5">
                      <h3
                        className="text-sm sm:text-base font-black text-white group-hover:text-cyan-200 transition-colors line-clamp-2"
                        title={material.filename}
                      >
                        {material.filename}
                      </h3>

                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-lg bg-sky-950/80 border border-sky-400/30 text-sky-200 flex items-center gap-1">
                          <Layers className="w-3 h-3 text-cyan-400" />
                          <span>{allTopics.length} Topics</span>
                        </span>

                        {material.total_units > 0 && (
                          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-lg bg-sky-950/80 border border-sky-400/30 text-sky-200">
                            {material.total_units} {isPptx ? 'Slides' : 'Pages'}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Bottom Action Buttons: Study in 3D Space & Remove PPT */}
                    <div className="flex items-center gap-2 pt-3 border-t border-sky-400/20">
                      {/* Enter 3D Universe Button */}
                      <button
                        onClick={handleEnter3DUniverse}
                        className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl font-black text-xs text-[#01579B] bg-gradient-to-r from-yellow-300 to-amber-300 hover:from-yellow-400 hover:to-amber-400 shadow-md shadow-yellow-500/20 hover:scale-102 active:scale-95 transition-all cursor-pointer"
                        title="Open 3D Space Universe for this PPT"
                      >
                        <Rocket className="w-3.5 h-3.5 text-[#01579B]" />
                        <span>Study in 3D Space</span>
                      </button>

                      {/* Remove PPT Button */}
                      <button
                        onClick={() => setMaterialToDelete(material)}
                        className="p-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/30 border border-rose-400/30 text-rose-300 hover:text-white transition-all cursor-pointer hover:scale-105"
                        title="Remove this uploaded presentation"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Upload Another PPT / PDF Card */}
              <div
                onClick={() => cardFileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (!isUploading) handleFileUpload(e.dataTransfer.files);
                }}
                className="rounded-3xl border-2 border-dashed border-sky-400/50 hover:border-sky-300 bg-sky-950/30 hover:bg-sky-950/50 p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 group min-h-[190px]"
              >
                <input
                  ref={cardFileInputRef}
                  type="file"
                  multiple
                  accept=".pptx,.pdf"
                  onChange={(e) => handleFileUpload(e.target.files)}
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-2xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-cyan-300 mb-3 group-hover:scale-110 group-hover:rotate-6 transition-transform">
                  <Plus className="w-6 h-6 stroke-[3]" />
                </div>
                <h4 className="text-sm font-black text-white group-hover:text-cyan-200 transition-colors">
                  + Add Another PPT or PDF
                </h4>
                <p className="text-[11px] text-sky-300 mt-1 max-w-[200px]">
                  Drop next session PPT here to expand your {courseDetail.title} knowledge universe!
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* ========================================================== */
          /* CASE C: 3D SPACE UNIVERSE VIEW                             */
          /* ========================================================== */
          <div className="w-full space-y-4 animate-in zoom-in-95 duration-300">
            <ThreeInteractiveUniverse
              topics={allTopics}
              activeTopicId={activeTopicId}
              onSelectTopic={(tId) => setActiveTopicId(tId)}
              onOpenLesson={(tId) => handleOpenLesson(tId)}
            />
          </div>
        )}
      </main>

      {/* ============================================================== */}
      {/* 10-SECTION EDUCATIONAL EXPLANATION MODAL                       */}
      {/* ============================================================== */}
      {isExplanationOpen && activeLesson && (
        <TopicExplanationModal
          lesson={activeLesson}
          onClose={() => setIsExplanationOpen(false)}
        />
      )}

      {/* ============================================================== */}
      {/* REMOVE PPT CONFIRMATION MODAL                                  */}
      {/* ============================================================== */}
      {materialToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-fade-in">
          <div className="bg-slate-900 border-3 border-rose-500/60 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-pop-in">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-400/40 flex items-center justify-center text-rose-400 mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-base sm:text-lg font-black text-white">
                Remove Uploaded Presentation?
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Are you sure you want to remove{' '}
                <strong className="text-rose-300 font-black">{materialToDelete.filename}</strong>?
              </p>
              <p className="text-[11px] text-slate-400">
                This will delete this presentation and its extracted topics from <strong>{courseDetail.title}</strong>. Your subject cloud will remain intact so you can upload new study documents anytime.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                disabled={isDeletingMaterial}
                onClick={() => setMaterialToDelete(null)}
                className="flex-1 py-2.5 rounded-xl text-xs font-black text-slate-300 bg-white/10 hover:bg-white/20 border border-white/20 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={isDeletingMaterial}
                onClick={confirmDeleteMaterial}
                className="flex-1 py-2.5 rounded-xl text-xs font-black text-white bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-600/30 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                {isDeletingMaterial ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Removing...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Yes, Remove PPT</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* UPLOAD MORE MODAL (FROM TOP BAR ACTION)                        */}
      {/* ============================================================== */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-slate-900 border-3 border-sky-400 rounded-3xl p-6 max-w-md w-full shadow-2xl text-center space-y-4">
            <h3 className="text-base font-black text-white flex items-center justify-center gap-2">
              <UploadCloud className="w-5 h-5 text-cyan-400" />
              <span>Upload More Materials to {courseDetail.title}</span>
            </h3>

            <input
              type="text"
              placeholder="Session Title (Optional, e.g. Session 2: APIs)"
              value={sessionTitle}
              onChange={(e) => setSessionTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl bg-slate-800 border border-sky-400/40 text-xs font-bold text-white placeholder-slate-400 outline-hidden focus:border-cyan-400"
            />

            <div
              onClick={() => !isUploading && fileInputRef.current?.click()}
              className="p-6 rounded-2xl border-2 border-dashed border-sky-400/50 hover:border-sky-300 bg-slate-800/50 cursor-pointer flex flex-col items-center justify-center gap-2"
            >
              <UploadCloud className="w-8 h-8 text-cyan-400" />
              <span className="text-xs font-black text-sky-200">
                Click to browse PPTX / PDF
              </span>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-white/10"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
