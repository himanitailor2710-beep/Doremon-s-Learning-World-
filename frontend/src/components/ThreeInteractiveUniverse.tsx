import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Topic } from '../types';
import { ArrowLeft, ArrowRight, BookOpen, Compass, Eye, Sparkles, Waves } from 'lucide-react';
import { sounds } from '../services/soundEffects';

interface ThreeInteractiveUniverseProps {
  topics: Topic[];
  activeTopicId: string | null;
  onSelectTopic: (topicId: string) => void;
  onOpenLesson: (topicId: string) => void;
}

export const ThreeInteractiveUniverse: React.FC<ThreeInteractiveUniverseProps> = ({
  topics,
  activeTopicId,
  onSelectTopic,
  onOpenLesson,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const labelsRef = useRef<(HTMLDivElement | null)[]>([]);
  const activeTopicIndex = Math.max(0, topics.findIndex((t) => t.id === activeTopicId));
  const [selectedIdx, setSelectedIdx] = useState<number>(activeTopicIndex);
  const [isTraveling, setIsTraveling] = useState<boolean>(false);

  // Sync when prop changes
  useEffect(() => {
    if (activeTopicId) {
      const idx = topics.findIndex((t) => t.id === activeTopicId);
      if (idx !== -1 && idx !== selectedIdx) {
        setSelectedIdx(idx);
      }
    }
  }, [activeTopicId]);

  // Keep ref for 3D render loop
  const targetIndexRef = useRef<number>(selectedIdx);
  targetIndexRef.current = selectedIdx;

  useEffect(() => {
    const container = mountRef.current;
    if (!container || topics.length === 0) return;

    // 1. Scene, Camera, Renderer
    let curWidth = container.clientWidth || 800;
    let curHeight = container.clientHeight || 500;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x061e38);
    scene.fog = new THREE.FogExp2(0x061e38, 0.025);

    const camera = new THREE.PerspectiveCamera(48, curWidth / curHeight, 0.1, 1000);
    camera.position.set(0, 4, 18);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(curWidth, curHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 2. Cinematic Cartoon Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff59d, 2.0);
    sunLight.position.set(10, 20, 15);
    scene.add(sunLight);

    const blueFill = new THREE.DirectionalLight(0x29b6f6, 1.8);
    blueFill.position.set(-15, -5, -10);
    scene.add(blueFill);

    // 3. Ambient Stardust & Floating Particles
    const starCount = 350;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPos[i] = (Math.random() - 0.5) * 80;
      starPos[i + 1] = (Math.random() - 0.5) * 40;
      starPos[i + 2] = (Math.random() - 0.5) * 50;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0xbaeafe,
      size: 0.25,
      transparent: true,
      opacity: 0.7,
    });
    const starField = new THREE.Points(starGeo, starMat);
    scene.add(starField);

    // 4. Calculate 3D Wave Positions for Each Topic
    // Positions follow an undulating 3D sine wave ribbon!
    const nodePositions: THREE.Vector3[] = topics.map((_, i) => {
      const spread = 4.2;
      const x = (i - (topics.length - 1) / 2) * spread;
      const y = Math.sin(i * 0.9) * 2.2;
      const z = Math.cos(i * 0.7) * 2.5;
      return new THREE.Vector3(x, y, z);
    });

    // 5. Build 3D Topic Orbs & Interactive Groups
    const nodeMeshes: THREE.Group[] = [];
    const ringMeshes: THREE.Mesh[] = [];

    const sphereGeo = new THREE.SphereGeometry(1.0, 32, 32);
    const ringGeo = new THREE.TorusGeometry(1.4, 0.05, 16, 48);

    topics.forEach((t, i) => {
      const pos = nodePositions[i];
      const nodeGroup = new THREE.Group();
      nodeGroup.position.copy(pos);
      nodeGroup.userData = { topicIndex: i, topicId: t.id, title: t.title };

      // Importance Colors
      let orbColor = 0x0288d1; // Blue default
      if (t.importance === 'High') orbColor = 0xffb300; // Gold
      else if (i === 0) orbColor = 0x00e676; // Emerald for introductory topic

      const orbMat = new THREE.MeshStandardMaterial({
        color: orbColor,
        roughness: 0.2,
        metalness: 0.35,
        emissive: orbColor,
        emissiveIntensity: 0.25,
      });

      const sphereMesh = new THREE.Mesh(sphereGeo, orbMat);
      nodeGroup.add(sphereMesh);

      // Rotating Golden Halo Ring
      const ringMat = new THREE.MeshStandardMaterial({
        color: 0xffd54f,
        metalness: 0.8,
        roughness: 0.2,
        emissive: 0xffa000,
        emissiveIntensity: 0.3,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = Math.PI / 2.5;
      nodeGroup.add(ringMesh);
      ringMeshes.push(ringMesh);

      // Inner Core Glow
      const coreGeo = new THREE.SphereGeometry(0.35, 16, 16);
      const coreMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const coreMesh = new THREE.Mesh(coreGeo, coreMat);
      nodeGroup.add(coreMesh);

      scene.add(nodeGroup);
      nodeMeshes.push(nodeGroup);
    });

    // 6. Connecting Undulating Wave Spline Paths
    if (nodePositions.length > 1) {
      const curve = new THREE.CatmullRomCurve3(nodePositions);
      const tubeGeo = new THREE.TubeGeometry(curve, 100, 0.08, 8, false);
      const tubeMat = new THREE.MeshStandardMaterial({
        color: 0x29b6f6,
        emissive: 0x0288d1,
        emissiveIntensity: 0.6,
        roughness: 0.3,
        transparent: true,
        opacity: 0.75,
      });
      const waveTube = new THREE.Mesh(tubeGeo, tubeMat);
      scene.add(waveTube);

      // Wave Pulses (Particles racing along the wave path)
      const pulseGeo = new THREE.SphereGeometry(0.2, 12, 12);
      const pulseMat = new THREE.MeshBasicMaterial({ color: 0xffeb3b });
      const pulses: THREE.Mesh[] = [];
      for (let p = 0; p < 6; p++) {
        const pulse = new THREE.Mesh(pulseGeo, pulseMat);
        scene.add(pulse);
        pulses.push(pulse);
      }

      // Keep in ref for animation loop
      (scene as any)._curve = curve;
      (scene as any)._pulses = pulses;
    }

    // 7. Interactive Raycasting (Hover & Click Nodes)
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerDown = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);

      for (const hit of intersects) {
        let cur: THREE.Object3D | null = hit.object;
        while (cur && cur.parent && cur.parent !== scene) {
          cur = cur.parent;
        }
        if (cur && cur.userData && typeof cur.userData.topicIndex === 'number') {
          const clickedIdx = cur.userData.topicIndex;
          sounds.playMagicChime();
          setSelectedIdx(clickedIdx);
          onSelectTopic(topics[clickedIdx].id);
          break;
        }
      }
    };

    renderer.domElement.addEventListener('pointerdown', handlePointerDown);

    // 8. Animation & Wave Travelling Camera Engine
    let animId: number;
    let clock = new THREE.Clock();

    // Camera current and target tracking
    const currentCamPos = camera.position.clone();
    const currentLookAt = new THREE.Vector3(0, 0, 0);

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Rotate Starfield and Orb Rings
      starField.rotation.y = elapsedTime * 0.02;
      ringMeshes.forEach((rm, i) => {
        rm.rotation.z = elapsedTime * (0.8 + (i % 3) * 0.2);
      });

      // Animate Wave Pulses along curve
      const curve: THREE.CatmullRomCurve3 = (scene as any)._curve;
      const pulses: THREE.Mesh[] = (scene as any)._pulses;
      if (curve && pulses) {
        pulses.forEach((p, idx) => {
          const t = (elapsedTime * 0.15 + idx / pulses.length) % 1.0;
          const pos = curve.getPointAt(t);
          p.position.copy(pos);
        });
      }

      // Calculate Target Camera Position (Smooth Wave Travel Journey!)
      const targetIdx = targetIndexRef.current;
      const targetPos = nodePositions[targetIdx] || new THREE.Vector3(0, 0, 0);

      // Camera sits slightly in front, elevated, giving rich 3D depth and perspective
      const idealCamPos = new THREE.Vector3(
        targetPos.x,
        targetPos.y + 2.2,
        targetPos.z + 8.5
      );

      // Undulating wave travel transition: camera curves up slightly like an oceanic wave crest
      currentCamPos.lerp(idealCamPos, 0.05);
      currentLookAt.lerp(targetPos, 0.06);

      camera.position.copy(currentCamPos);
      camera.lookAt(currentLookAt);

      // Pulse the currently selected node
      nodeMeshes.forEach((nm, idx) => {
        if (idx === targetIdx) {
          const s = 1.0 + Math.sin(elapsedTime * 4.5) * 0.12;
          nm.scale.set(s, s, s);
        } else {
          nm.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
        }
      });

      // Update 3D Projected Floating Topic Name Labels above each planet
      const tempVec = new THREE.Vector3();
      topics.forEach((_, idx) => {
        const labelEl = labelsRef.current[idx];
        const node = nodeMeshes[idx];
        if (!labelEl || !node) return;

        node.getWorldPosition(tempVec);
        // Float directly on top of the planet (top of sphere + ring)
        tempVec.y += 1.65 * node.scale.y;
        tempVec.project(camera);

        // Check if inside camera frustum (in front of camera)
        const isVisible = tempVec.z > -1.0 && tempVec.z < 1.0;
        if (isVisible) {
          const x = (tempVec.x * 0.5 + 0.5) * curWidth;
          const y = (-(tempVec.y * 0.5) + 0.5) * curHeight;

          // Only display if reasonably near viewport bounds
          if (x >= -180 && x <= curWidth + 180 && y >= -120 && y <= curHeight + 120) {
            const dist = camera.position.distanceTo(node.position);
            const isCurrent = idx === targetIndexRef.current;
            // Perspective scale: closer planets have slightly larger labels
            const scale = isCurrent
              ? Math.max(0.88, Math.min(1.2, 12 / dist))
              : Math.max(0.72, Math.min(1.02, 11 / dist));
            const opacity = isCurrent ? 1.0 : Math.max(0.35, Math.min(0.95, 22 / dist));

            labelEl.style.display = 'flex';
            labelEl.style.transform = `translate(-50%, -100%) translate3d(${x}px, ${y}px, 0) scale(${scale})`;
            labelEl.style.opacity = `${opacity}`;
            return;
          }
        }
        labelEl.style.display = 'none';
      });

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      curWidth = container.clientWidth || 800;
      curHeight = container.clientHeight || 500;
      camera.aspect = curWidth / curHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(curWidth, curHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
      cancelAnimationFrame(animId);
      renderer.dispose();
      scene.clear();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [topics]);

  // Wave Travel Navigation to Previous / Next
  const handleTravelTo = (newIdx: number) => {
    if (newIdx < 0 || newIdx >= topics.length) return;
    sounds.playMagicChime();
    setIsTraveling(true);
    setSelectedIdx(newIdx);
    onSelectTopic(topics[newIdx].id);
    setTimeout(() => setIsTraveling(false), 800);
  };

  const currentTopic = topics[selectedIdx] || topics[0];

  return (
    <div className="relative w-full h-[540px] sm:h-[620px] rounded-3xl overflow-hidden border-4 border-sky-300 shadow-2xl bg-[#061E38] flex flex-col justify-between select-none">
      {/* 3D WebGL Canvas Viewport */}
      <div ref={mountRef} className="absolute inset-0 z-0 cursor-grab active:cursor-grabbing" />

      {/* Dynamic 3D Projected Topic Name Badges Directly on Top of Every Planet */}
      <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
        {topics.map((t, idx) => {
          const isCurrent = idx === selectedIdx;
          return (
            <div
              key={t.id}
              ref={(el) => {
                labelsRef.current[idx] = el;
              }}
              onClick={(e) => {
                e.stopPropagation();
                handleTravelTo(idx);
              }}
              className={`absolute top-0 left-0 pointer-events-auto cursor-pointer flex flex-col items-center select-none transition-transform duration-75 group ${
                isCurrent ? 'z-30' : 'z-20'
              }`}
              style={{ willChange: 'transform' }}
              title={`Click to travel to Topic ${idx + 1}: ${t.title}`}
            >
              {/* Floating Pill on Top of Planet */}
              <div
                className={`flex items-center gap-2 px-3 py-1.5 rounded-2xl shadow-2xl backdrop-blur-md transition-all ${
                  isCurrent
                    ? 'bg-slate-900/95 border-2 border-yellow-400 ring-4 ring-yellow-400/30 text-yellow-300 scale-105 shadow-yellow-500/30'
                    : 'bg-slate-950/85 hover:bg-slate-900 border border-sky-400/50 hover:border-sky-300 text-white hover:scale-105 shadow-lg'
                }`}
              >
                {/* Topic Index */}
                <span
                  className={`px-1.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider shrink-0 ${
                    isCurrent
                      ? 'bg-yellow-400 text-slate-950 shadow-xs'
                      : 'bg-sky-500/30 text-cyan-300 border border-cyan-400/30'
                  }`}
                >
                  #{idx + 1}
                </span>

                {/* Topic Title */}
                <span className="text-xs sm:text-sm font-black tracking-tight max-w-[140px] sm:max-w-[200px] md:max-w-[280px] truncate drop-shadow-md">
                  {t.title}
                </span>

                {/* "You Are Here" Badge for Current Planet */}
                {isCurrent ? (
                  <span className="flex items-center gap-1 text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 animate-pulse shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    Here
                  </span>
                ) : (
                  <span className="text-[10px] text-cyan-300 font-bold opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    Go →
                  </span>
                )}
              </div>

              {/* Downward Pointer Arrow targeting the top of the planet sphere */}
              <div
                className={`w-2.5 h-2.5 -mt-1 rotate-45 border-r border-b transition-colors ${
                  isCurrent
                    ? 'bg-slate-900 border-yellow-400'
                    : 'bg-slate-950 border-sky-400/50 group-hover:border-sky-300'
                }`}
              />
            </div>
          );
        })}
      </div>

      {/* Top Floating Badge Bar */}
      <div className="relative z-10 p-3 sm:p-4 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-sky-400/40 text-white text-xs font-black shadow-lg">
          <Waves className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span>3D Knowledge Universe</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-400 text-slate-950 font-black">
            Wave Navigation
          </span>
        </div>

        {/* Current Active Planet Location Banner */}
        {currentTopic && (
          <div className="pointer-events-auto flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 backdrop-blur-md border border-yellow-400/50 text-yellow-300 text-xs font-black shadow-lg">
            <span className="w-2 h-2 rounded-full bg-yellow-400 animate-ping" />
            <span className="text-yellow-400 font-bold">Current Planet:</span>
            <span className="text-white max-w-[180px] sm:max-w-xs truncate">
              #{selectedIdx + 1} {currentTopic.title}
            </span>
          </div>
        )}
      </div>

      {/* Centerpiece: Wave Traveling Particle Notification when moving between topics */}
      {isTraveling && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none flex items-center gap-2 px-4 py-2 rounded-2xl bg-cyan-500/90 backdrop-blur-md border border-white text-slate-950 font-black text-sm shadow-2xl animate-pop-in">
          <Sparkles className="w-4 h-4 text-yellow-300" />
          <span>Travelling Wave Trajectory...</span>
        </div>
      )}

      {/* Bottom Floating Topic Navigation Console */}
      <div className="relative z-10 p-3 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3 bg-gradient-to-t from-slate-950/95 via-slate-950/80 to-transparent">
        {/* Navigation Step Indicator */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
          <button
            onClick={() => handleTravelTo(selectedIdx - 1)}
            disabled={selectedIdx <= 0}
            className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-black text-white bg-white/10 hover:bg-white/20 border border-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Prev Topic</span>
          </button>

          <div className="px-3 py-1 rounded-xl bg-sky-950/80 border border-sky-400/30 text-center">
            <span className="text-[10px] font-black uppercase tracking-wider text-cyan-300">
              Topic {selectedIdx + 1} of {topics.length}
            </span>
          </div>

          <button
            onClick={() => handleTravelTo(selectedIdx + 1)}
            disabled={selectedIdx >= topics.length - 1}
            className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-black text-white bg-white/10 hover:bg-white/20 border border-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            <span>Next Topic</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Selected Topic Title & Direct Action to Open 10-point explanation */}
        {currentTopic && (
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <div className="text-center sm:text-right max-w-sm">
              <span className="text-[10px] font-bold text-sky-300 uppercase tracking-wider block">
                Selected Concept Node
              </span>
              <h4 className="text-sm font-black text-white truncate max-w-xs sm:max-w-sm">
                {currentTopic.title}
              </h4>
            </div>

            <button
              onClick={() => onOpenLesson(currentTopic.id)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl font-black text-xs sm:text-sm text-[#01579B] bg-gradient-to-r from-[#FFD600] to-[#FFE082] hover:from-[#FFCA28] hover:to-[#FFD600] shadow-lg shadow-yellow-500/30 hover:scale-105 active:scale-95 transition-all cursor-pointer animate-pulse"
            >
              <BookOpen className="w-4 h-4 text-[#01579B]" />
              <span>Open Explanation</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
