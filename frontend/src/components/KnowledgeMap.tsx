import React, { useState, useEffect, useRef } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  RefreshCw,
  Search,
  Filter,
  Sparkles,
  Layers,
  ArrowRight,
  BookOpen,
  Info,
  ChevronRight,
  X
} from 'lucide-react';
import { KnowledgeGraphData, GraphNode, GraphEdge, Course } from '../types';
import { api } from '../services/api';
import { sounds } from '../services/soundEffects';

interface KnowledgeMapProps {
  activeCourseId?: string;
  courses: Course[];
  onOpenLesson: (courseId: string, topicId: string, topicTitle: string) => void;
  onOpenCourse: (courseId: string) => void;
}

export const KnowledgeMap: React.FC<KnowledgeMapProps> = ({
  activeCourseId,
  courses,
  onOpenLesson,
  onOpenCourse,
}) => {
  const [mapMode, setMapMode] = useState<'course' | 'all'>('course');
  const [selectedCourseId, setSelectedCourseId] = useState<string>(activeCourseId || (courses[0]?.id || ''));
  const [graphData, setGraphData] = useState<KnowledgeGraphData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Search and Chapter Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [chapterFilter, setChapterFilter] = useState('all');

  // Selected Node State (Drawer)
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

  // Canvas & Physics State
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const nodesRef = useRef<(GraphNode & { x: number; y: number; vx: number; vy: number })[]>([]);
  const edgesRef = useRef<GraphEdge[]>([]);
  const animFrameRef = useRef<number | null>(null);

  // Pan & Zoom State
  const transformRef = useRef({ x: 0, y: 0, scale: 1 });
  const isDraggingCanvasRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const draggedNodeRef = useRef<(GraphNode & { x: number; y: number; vx: number; vy: number }) | null>(null);

  // Load Graph Data
  useEffect(() => {
    loadGraph();
  }, [mapMode, selectedCourseId]);

  const loadGraph = async () => {
    setIsLoading(true);
    try {
      let data: KnowledgeGraphData;
      if (mapMode === 'all') {
        data = await api.getAllLearningKnowledgeMap();
      } else {
        const cId = selectedCourseId || courses[0]?.id;
        if (!cId) {
          setIsLoading(false);
          return;
        }
        data = await api.getCourseKnowledgeMap(cId);
      }
      setGraphData(data);
      initializePhysics(data);
    } catch (e) {
      console.error('Failed to load knowledge map', e);
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize Force Simulation
  const initializePhysics = (data: KnowledgeGraphData) => {
    const canvas = canvasRef.current;
    const width = canvas?.width || 800;
    const height = canvas?.height || 600;

    // Distribute nodes radially
    const initialNodes = data.nodes.map((n, i) => {
      const angle = (i / Math.max(data.nodes.length, 1)) * Math.PI * 2;
      const radius = n.type === 'chapter' ? 120 : n.type === 'topic' ? 220 : 310;
      return {
        ...n,
        x: width / 2 + Math.cos(angle) * radius + (Math.random() - 0.5) * 50,
        y: height / 2 + Math.sin(angle) * radius + (Math.random() - 0.5) * 50,
        vx: 0,
        vy: 0,
      };
    });

    nodesRef.current = initialNodes;
    edgesRef.current = data.edges;

    // Center view
    transformRef.current = { x: 0, y: 0, scale: 0.95 };
  };

  // Physics & Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let running = true;

    const render = () => {
      if (!running) return;

      // Resize canvas to container
      if (canvas.parentElement) {
        const { clientWidth, clientHeight } = canvas.parentElement;
        if (canvas.width !== clientWidth || canvas.height !== clientHeight) {
          canvas.width = clientWidth;
          canvas.height = clientHeight;
        }
      }

      const width = canvas.width;
      const height = canvas.height;
      const nodes = nodesRef.current;
      const edges = edgesRef.current;

      // 1. Force Simulation Step
      const centerX = width / 2;
      const centerY = height / 2;

      for (let i = 0; i < nodes.length; i++) {
        const n1 = nodes[i];
        if (n1 === draggedNodeRef.current) continue;

        // Center gravity
        n1.vx += (centerX - n1.x) * 0.0004;
        n1.vy += (centerY - n1.y) * 0.0004;

        // Repulsion between nodes
        for (let j = i + 1; j < nodes.length; j++) {
          const n2 = nodes[j];
          const dx = n2.x - n1.x;
          const dy = n2.y - n1.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const minDist = n1.size + n2.size + 65;
          if (dist < minDist) {
            const force = (minDist - dist) / dist * 0.06;
            n1.vx -= dx * force;
            n1.vy -= dy * force;
            n2.vx += dx * force;
            n2.vy += dy * force;
          }
        }
      }

      // Spring force along edges
      const nodeMap = new Map(nodes.map((n) => [n.id, n]));
      for (const e of edges) {
        const source = nodeMap.get(e.source);
        const target = nodeMap.get(e.target);
        if (source && target) {
          const dx = target.x - source.x;
          const dy = target.y - source.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const targetDist = e.relation_type === 'subconcept' ? 80 : 160;
          const force = (dist - targetDist) * 0.002;
          if (source !== draggedNodeRef.current) {
            source.vx += dx * force;
            source.vy += dy * force;
          }
          if (target !== draggedNodeRef.current) {
            target.vx -= dx * force;
            target.vy -= dy * force;
          }
        }
      }

      // Apply velocity with damping
      for (const n of nodes) {
        if (n !== draggedNodeRef.current) {
          n.x += n.vx;
          n.y += n.vy;
          n.vx *= 0.88;
          n.vy *= 0.88;
        }
      }

      // 2. Clear Canvas with Soft Cartoon Nebula
      ctx.clearRect(0, 0, width, height);

      ctx.save();
      const { x: panX, y: panY, scale } = transformRef.current;
      ctx.translate(panX, panY);
      ctx.scale(scale, scale);

      // Connected nodes set for selective highlighting
      const connectedNodeIds = new Set<string>();
      if (selectedNode) {
        connectedNodeIds.add(selectedNode.id);
        edges.forEach((e) => {
          if (e.source === selectedNode.id) connectedNodeIds.add(e.target);
          if (e.target === selectedNode.id) connectedNodeIds.add(e.source);
        });
      }

      // 3. Draw Edges
      for (const edge of edges) {
        const source = nodeMap.get(edge.source);
        const target = nodeMap.get(edge.target);
        if (!source || !target) continue;

        const isHighlighted = selectedNode && (source.id === selectedNode.id || target.id === selectedNode.id);
        const isDimmed = selectedNode && !isHighlighted;

        ctx.beginPath();
        ctx.moveTo(source.x, source.y);
        ctx.lineTo(target.x, target.y);

        if (isHighlighted) {
          ctx.strokeStyle = '#0288D1';
          ctx.lineWidth = 3;
          ctx.setLineDash([]);
        } else if (isDimmed) {
          ctx.strokeStyle = '#E2E8F0';
          ctx.lineWidth = 1;
          ctx.setLineDash([4, 4]);
        } else {
          ctx.strokeStyle = edge.relation_type === 'subconcept' ? '#CBD5E1' : '#94A3B8';
          ctx.lineWidth = edge.relation_type === 'part_of' ? 2 : 1.5;
          ctx.setLineDash(edge.relation_type === 'cross_disciplinary' ? [6, 4] : []);
        }
        ctx.stroke();

        // Edge label for highlighted relation
        if (isHighlighted && edge.label) {
          const midX = (source.x + target.x) / 2;
          const midY = (source.y + target.y) / 2;
          ctx.save();
          ctx.font = 'bold 10px sans-serif';
          ctx.fillStyle = '#0288D1';
          ctx.fillText(edge.label, midX + 4, midY - 4);
          ctx.restore();
        }
      }

      // 4. Draw Nodes
      for (const node of nodes) {
        // Filter out if chapter filter active
        if (chapterFilter !== 'all') {
          if (node.type === 'chapter' && node.id !== chapterFilter) continue;
          if (node.type === 'topic' && node.session_id !== chapterFilter) continue;
        }

        const isSelected = selectedNode?.id === node.id;
        const isNeighbor = selectedNode && connectedNodeIds.has(node.id);
        const isDimmed = selectedNode && !isSelected && !isNeighbor;
        const matchesSearch = searchQuery && node.label.toLowerCase().includes(searchQuery.toLowerCase());

        ctx.save();
        ctx.globalAlpha = isDimmed ? 0.25 : 1.0;

        // Halo ring for selected or search match
        if (isSelected || matchesSearch) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.size + 8, 0, Math.PI * 2);
          ctx.fillStyle = isSelected ? 'rgba(2, 136, 209, 0.25)' : 'rgba(255, 214, 0, 0.4)';
          ctx.fill();
        }

        // Main Node Body
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2);
        ctx.fillStyle = node.type === 'chapter' ? '#0288D1' : node.type === 'topic' ? '#03A9F4' : '#AB47BC';
        ctx.fill();

        ctx.lineWidth = node.type === 'chapter' ? 3 : 2;
        ctx.strokeStyle = '#FFFFFF';
        ctx.stroke();

        // Node Inner Icon / Core
        if (node.type === 'chapter') {
          ctx.font = '14px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('📘', node.x, node.y);
        } else if (node.is_completed) {
          ctx.font = 'bold 12px sans-serif';
          ctx.fillStyle = '#FFFFFF';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('✓', node.x, node.y);
        } else {
          ctx.beginPath();
          ctx.arc(node.x, node.y, 4, 0, Math.PI * 2);
          ctx.fillStyle = '#FFFFFF';
          ctx.fill();
        }

        // Node Text Label
        ctx.font = node.type === 'chapter' ? 'bold 12px sans-serif' : '11px sans-serif';
        ctx.fillStyle = isSelected ? '#0288D1' : '#1E293B';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';

        // Draw pill background behind text for readability
        const label = node.label;
        const textWidth = ctx.measureText(label).width;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.88)';
        ctx.fillRect(node.x - textWidth / 2 - 4, node.y + node.size + 4, textWidth + 8, 14);

        ctx.fillStyle = isSelected ? '#0288D1' : '#0F172A';
        ctx.fillText(label, node.x, node.y + node.size + 4);

        ctx.restore();
      }

      ctx.restore();

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      running = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [graphData, selectedNode, searchQuery, chapterFilter]);

  // Mouse Interaction Handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Convert mouse to world coordinates
    const { x: panX, y: panY, scale } = transformRef.current;
    const worldX = (mouseX - panX) / scale;
    const worldY = (mouseY - panY) / scale;

    // Check if clicked a node
    const nodes = nodesRef.current;
    for (let i = nodes.length - 1; i >= 0; i--) {
      const n = nodes[i];
      const dist = Math.hypot(n.x - worldX, n.y - worldY);
      if (dist <= n.size + 6) {
        draggedNodeRef.current = n;
        setSelectedNode(n);
        sounds.playClickSound();
        return;
      }
    }

    // Otherwise dragging canvas
    isDraggingCanvasRef.current = true;
    dragStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (draggedNodeRef.current) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const { x: panX, y: panY, scale } = transformRef.current;
      draggedNodeRef.current.x = (mouseX - panX) / scale;
      draggedNodeRef.current.y = (mouseY - panY) / scale;
      draggedNodeRef.current.vx = 0;
      draggedNodeRef.current.vy = 0;
      return;
    }

    if (isDraggingCanvasRef.current) {
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      transformRef.current.x += dx;
      transformRef.current.y += dy;
      dragStartRef.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleMouseUp = () => {
    draggedNodeRef.current = null;
    isDraggingCanvasRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    const newScale = Math.min(Math.max(transformRef.current.scale * zoomFactor, 0.35), 2.8);
    transformRef.current.scale = newScale;
  };

  const handleZoom = (direction: 'in' | 'out') => {
    const factor = direction === 'in' ? 1.25 : 0.8;
    transformRef.current.scale = Math.min(Math.max(transformRef.current.scale * factor, 0.35), 2.8);
  };

  const handleResetView = () => {
    if (graphData) initializePhysics(graphData);
  };

  // Find relationships for selected node
  const getNodeConnections = () => {
    if (!selectedNode || !graphData) return [];
    return graphData.edges.filter(
      (e) => e.source === selectedNode.id || e.target === selectedNode.id
    );
  };

  const nodeMap = new Map(graphData?.nodes.map((n) => [n.id, n]) || []);
  const activeConnections = getNodeConnections();

  return (
    <div className="space-y-4">
      {/* Top Controls Bar */}
      <div className="bg-white/95 backdrop-blur-md p-4 sm:p-5 rounded-3xl border-2 border-sky-100 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl animate-float">🕸️</span>
            <h2 className="text-xl font-black text-slate-800 tracking-tight">
              Obsidian-Inspired Interactive Knowledge Map
            </h2>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-900 font-black">
              Graph View
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Visualize relationships, prerequisites, and conceptual bridges across your courses
          </p>
        </div>

        {/* Graph Mode Switcher (Course Map vs All Learning Map) */}
        <div className="flex items-center gap-2 bg-sky-50/80 p-1.5 rounded-2xl border border-sky-200">
          <button
            onClick={() => {
              setMapMode('course');
              setSelectedNode(null);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              mapMode === 'course'
                ? 'bg-[#0288D1] text-white shadow-sm'
                : 'text-slate-600 hover:text-sky-900'
            }`}
          >
            📄 Course Knowledge Map
          </button>
          <button
            onClick={() => {
              setMapMode('all');
              setSelectedNode(null);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              mapMode === 'all'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-purple-900'
            }`}
          >
            🌐 All Learning Map (Cross-Course)
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
        {mapMode === 'course' && (
          <div className="sm:col-span-4">
            <select
              value={selectedCourseId}
              onChange={(e) => {
                setSelectedCourseId(e.target.value);
                setSelectedNode(null);
              }}
              className="w-full px-4 py-2.5 rounded-2xl bg-white border border-sky-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-400 shadow-2xs"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  📚 {c.title}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className={mapMode === 'course' ? 'sm:col-span-5' : 'sm:col-span-8'}>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search concepts or topics on the graph..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-sky-100 text-xs text-slate-800 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400 shadow-2xs"
            />
          </div>
        </div>

        <div className="sm:col-span-3 flex items-center justify-end gap-2">
          <button
            onClick={() => handleZoom('in')}
            className="p-2.5 rounded-xl bg-white border border-sky-200 text-slate-700 hover:bg-sky-50 shadow-2xs cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleZoom('out')}
            className="p-2.5 rounded-xl bg-white border border-sky-200 text-slate-700 hover:bg-sky-50 shadow-2xs cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleResetView}
            className="p-2.5 rounded-xl bg-white border border-sky-200 text-slate-700 hover:bg-sky-50 shadow-2xs cursor-pointer"
            title="Recenter & Re-simulate Physics"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Graph Viewport + Inspector Drawer */}
      <div className="relative h-[620px] rounded-3xl overflow-hidden border-2 border-sky-200 shadow-xl bg-slate-950">
        {/* Obsidian-Style Graph Canvas */}
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onWheel={handleWheel}
          className="w-full h-full cursor-grab active:cursor-grabbing"
        />

        {/* Legend Overlay */}
        <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-md p-3 rounded-2xl border border-slate-700 text-white text-[11px] font-bold space-y-1.5 shadow-lg pointer-events-none">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider font-black mb-1">Node Legend</div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full bg-[#0288D1]" />
            <span>Chapter / Module</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full bg-[#03A9F4]" />
            <span>Curriculum Topic</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#AB47BC]" />
            <span>Subconcept / Formula</span>
          </div>
        </div>

        {/* Quick Stats Pill */}
        <div className="absolute bottom-4 left-4 bg-slate-900/80 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-700 text-slate-300 text-xs font-semibold shadow-lg">
          {graphData ? (
            <span>
              🌐 {graphData.stats.total_nodes} Nodes • 🔗 {graphData.stats.total_edges} Connections
            </span>
          ) : (
            <span>Loading Knowledge Graph...</span>
          )}
        </div>

        {/* Selected Node Details Drawer */}
        {selectedNode && (
          <div className="absolute top-4 right-4 bottom-4 w-80 sm:w-96 bg-white/95 backdrop-blur-md rounded-3xl border-2 border-sky-200 shadow-2xl p-5 overflow-y-auto animate-in slide-in-from-right duration-200 z-30">
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100 mb-4">
              <div>
                <span
                  className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                    selectedNode.type === 'chapter'
                      ? 'bg-sky-100 text-[#0288D1]'
                      : selectedNode.type === 'topic'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-purple-100 text-purple-800'
                  }`}
                >
                  {selectedNode.type}
                </span>
                <h3 className="font-black text-base text-slate-900 mt-1">
                  {selectedNode.full_label || selectedNode.label}
                </h3>
                <div className="text-xs text-slate-500 font-semibold">
                  Course: {selectedNode.course_title}
                </div>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Description / Summary */}
            <div className="mb-4 p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-600 font-medium">
              {selectedNode.summary || selectedNode.description || 'Core learning node in this study graph.'}
            </div>

            {/* Connected Concept Relationships (Requirement 8 & 9) */}
            <div className="space-y-2 mb-5">
              <div className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                <span>🔗</span>
                <span>Why It Connects ({activeConnections.length}):</span>
              </div>
              {activeConnections.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No direct connections found.</p>
              ) : (
                activeConnections.map((conn, idx) => {
                  const otherNodeId = conn.source === selectedNode.id ? conn.target : conn.source;
                  const otherNode = nodeMap.get(otherNodeId);
                  if (!otherNode) return null;

                  return (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl border border-sky-100 bg-sky-50/60 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between font-bold text-slate-800">
                        <span className="truncate">{otherNode.label}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-sky-200 text-sky-900 font-extrabold shrink-0">
                          {conn.label}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium">
                        {conn.explanation}
                      </p>
                    </div>
                  );
                })
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-3 border-t border-slate-100">
              {selectedNode.type === 'topic' && (
                <button
                  onClick={() => {
                    onOpenLesson(selectedNode.course_id, selectedNode.id, selectedNode.label);
                  }}
                  className="w-full py-3 px-4 rounded-2xl font-black text-xs text-white bg-gradient-to-r from-[#0288D1] to-[#03A9F4] hover:from-[#0277BD] hover:to-[#0288D1] shadow-md shadow-sky-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>✨ Pull Topic from 4D Pocket</span>
                  <ArrowRight className="w-4 h-4 stroke-[3]" />
                </button>
              )}

              <button
                onClick={() => onOpenCourse(selectedNode.course_id)}
                className="w-full py-2.5 px-4 rounded-2xl font-bold text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer text-center"
              >
                Go to Course Syllabus
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
