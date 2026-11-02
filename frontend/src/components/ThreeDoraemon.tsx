import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export type ThreeMascotState =
  | 'idle'
  | 'welcome'
  | 'thinking'
  | 'searching'
  | 'presenting'
  | 'teaching'
  | 'celebrating'
  | 'encouraging'
  | 'uploading'
  | 'processing';

interface ThreeDoraemonProps {
  state?: ThreeMascotState;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  message?: string;
  showSpeechBubble?: boolean;
  onMascotClick?: () => void;
  interactiveLook?: boolean;
}

export const ThreeDoraemon: React.FC<ThreeDoraemonProps> = ({
  state = 'idle',
  size = 'md',
  message,
  showSpeechBubble = true,
  onMascotClick,
  interactiveLook = true,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<ThreeMascotState>(state);
  stateRef.current = state;

  const sizeDimensions = {
    sm: { width: 120, height: 140, cameraZ: 6.8 },
    md: { width: 180, height: 210, cameraZ: 6.2 },
    lg: { width: 240, height: 270, cameraZ: 5.8 },
    xl: { width: 300, height: 340, cameraZ: 5.5 },
  };

  const dim = sizeDimensions[size];

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      38,
      dim.width / dim.height,
      0.1,
      100
    );
    camera.position.set(0, -0.4, dim.cameraZ);

    // 2. Renderer with Antialias & Alpha Transparency
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(dim.width, dim.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 3. Cinematic Studio Lighting
    // Warm key light
    const keyLight = new THREE.DirectionalLight(0xfff5e6, 2.2);
    keyLight.position.set(3, 4, 4);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 512;
    keyLight.shadow.mapSize.height = 512;
    scene.add(keyLight);

    // Cool sky fill light
    const fillLight = new THREE.DirectionalLight(0x90caf9, 1.4);
    fillLight.position.set(-3, 2, 2);
    scene.add(fillLight);

    // Warm backlight / rim light for cartoon silhouette pop
    const rimLight = new THREE.DirectionalLight(0xffd54f, 2.0);
    rimLight.position.set(0, 3, -4);
    scene.add(rimLight);

    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    // 4. Character Root Group
    const mascotGroup = new THREE.Group();
    scene.add(mascotGroup);

    // Materials with smooth cartoon shading
    const blueMaterial = new THREE.MeshStandardMaterial({
      color: 0x0288d1,
      roughness: 0.28,
      metalness: 0.12,
    });

    const whiteMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.25,
      metalness: 0.05,
    });

    const redMaterial = new THREE.MeshStandardMaterial({
      color: 0xe53935,
      roughness: 0.2,
      metalness: 0.1,
    });

    const goldMaterial = new THREE.MeshStandardMaterial({
      color: 0xffd600,
      roughness: 0.18,
      metalness: 0.75,
    });

    const darkMaterial = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.4,
    });

    // 5. Head Group
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 0.3, 0);
    mascotGroup.add(headGroup);

    // Blue Head Sphere
    const headGeo = new THREE.SphereGeometry(1.22, 32, 32);
    const headMesh = new THREE.Mesh(headGeo, blueMaterial);
    headMesh.castShadow = true;
    headGroup.add(headMesh);

    // White Face Oval
    const faceGeo = new THREE.SphereGeometry(1.06, 32, 32);
    const faceMesh = new THREE.Mesh(faceGeo, whiteMaterial);
    faceMesh.scale.set(1.0, 0.88, 0.42);
    faceMesh.position.set(0, -0.12, 0.64);
    headGroup.add(faceMesh);

    // Eyes Group
    const eyesGroup = new THREE.Group();
    headGroup.add(eyesGroup);

    const eyeWhiteGeo = new THREE.SphereGeometry(0.32, 24, 24);
    const pupilGeo = new THREE.SphereGeometry(0.12, 16, 16);
    const glintGeo = new THREE.SphereGeometry(0.04, 12, 12);

    // Left Eye
    const leftEye = new THREE.Mesh(eyeWhiteGeo, whiteMaterial);
    leftEye.scale.set(0.85, 1.18, 0.45);
    leftEye.position.set(-0.28, 0.34, 0.98);
    eyesGroup.add(leftEye);

    const leftPupil = new THREE.Mesh(pupilGeo, darkMaterial);
    leftPupil.position.set(-0.24, 0.34, 1.13);
    eyesGroup.add(leftPupil);

    const leftGlint = new THREE.Mesh(glintGeo, whiteMaterial);
    leftGlint.position.set(-0.22, 0.38, 1.22);
    eyesGroup.add(leftGlint);

    // Right Eye
    const rightEye = new THREE.Mesh(eyeWhiteGeo, whiteMaterial);
    rightEye.scale.set(0.85, 1.18, 0.45);
    rightEye.position.set(0.28, 0.34, 0.98);
    eyesGroup.add(rightEye);

    const rightPupil = new THREE.Mesh(pupilGeo, darkMaterial);
    rightPupil.position.set(0.24, 0.34, 1.13);
    eyesGroup.add(rightPupil);

    const rightGlint = new THREE.Mesh(glintGeo, whiteMaterial);
    rightGlint.position.set(0.26, 0.38, 1.22);
    eyesGroup.add(rightGlint);

    // Shiny Red Nose
    const noseGeo = new THREE.SphereGeometry(0.22, 24, 24);
    const noseMesh = new THREE.Mesh(noseGeo, redMaterial);
    noseMesh.position.set(0, 0.12, 1.18);
    headGroup.add(noseMesh);

    const noseHighlight = new THREE.Mesh(glintGeo, whiteMaterial);
    noseHighlight.position.set(-0.06, 0.18, 1.36);
    headGroup.add(noseHighlight);

    // Lip line & Cheerful mouth (Torus arc)
    const mouthGeo = new THREE.TorusGeometry(0.38, 0.035, 12, 24, Math.PI * 0.9);
    const mouthMesh = new THREE.Mesh(mouthGeo, darkMaterial);
    mouthMesh.rotation.x = Math.PI;
    mouthMesh.position.set(0, -0.22, 1.05);
    headGroup.add(mouthMesh);

    // Nose-to-mouth vertical line
    const philtrumGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.28, 8);
    const philtrumMesh = new THREE.Mesh(philtrumGeo, darkMaterial);
    philtrumMesh.position.set(0, -0.06, 1.08);
    headGroup.add(philtrumMesh);

    // Whiskers (3 left, 3 right)
    const whiskerGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.46, 6);
    const whiskerAngles = [-0.18, 0, 0.18];
    whiskerAngles.forEach((angle, i) => {
      // Left whiskers
      const lw = new THREE.Mesh(whiskerGeo, darkMaterial);
      lw.rotation.z = Math.PI / 2 + angle;
      lw.position.set(-0.68, -0.04 - i * 0.1, 0.92);
      headGroup.add(lw);

      // Right whiskers
      const rw = new THREE.Mesh(whiskerGeo, darkMaterial);
      rw.rotation.z = Math.PI / 2 - angle;
      rw.position.set(0.68, -0.04 - i * 0.1, 0.92);
      headGroup.add(rw);
    });

    // 6. Spinning Take-copter Propeller on Top of Head
    const propellerGroup = new THREE.Group();
    propellerGroup.position.set(0, 1.25, 0);
    headGroup.add(propellerGroup);

    // Yellow stem pole
    const stemGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.35, 12);
    const stemMesh = new THREE.Mesh(stemGeo, goldMaterial);
    stemMesh.position.set(0, 0.16, 0);
    propellerGroup.add(stemMesh);

    // Hub center ball
    const hubGeo = new THREE.SphereGeometry(0.09, 16, 16);
    const hubMesh = new THREE.Mesh(hubGeo, redMaterial);
    hubMesh.position.set(0, 0.35, 0);
    propellerGroup.add(hubMesh);

    // Twin spinning blades
    const bladesGroup = new THREE.Group();
    bladesGroup.position.set(0, 0.35, 0);
    propellerGroup.add(bladesGroup);

    const bladeGeo = new THREE.BoxGeometry(1.4, 0.035, 0.16);
    const bladeMesh = new THREE.Mesh(bladeGeo, goldMaterial);
    bladesGroup.add(bladeMesh);

    // 7. Red Collar & Golden Metallic Bell
    const collarGeo = new THREE.TorusGeometry(0.85, 0.12, 16, 32);
    const collarMesh = new THREE.Mesh(collarGeo, redMaterial);
    collarMesh.rotation.x = Math.PI / 2;
    collarMesh.position.set(0, -0.98, 0);
    mascotGroup.add(collarMesh);

    const bellGeo = new THREE.SphereGeometry(0.24, 24, 24);
    const bellMesh = new THREE.Mesh(bellGeo, goldMaterial);
    bellMesh.position.set(0, -1.18, 0.85);
    bellMesh.castShadow = true;
    mascotGroup.add(bellMesh);

    const bellRingGeo = new THREE.TorusGeometry(0.24, 0.025, 8, 24);
    const bellRing = new THREE.Mesh(bellRingGeo, darkMaterial);
    bellRing.position.set(0, -1.18, 0.85);
    mascotGroup.add(bellRing);

    const bellHoleGeo = new THREE.SphereGeometry(0.05, 12, 12);
    const bellHole = new THREE.Mesh(bellHoleGeo, darkMaterial);
    bellHole.position.set(0, -1.24, 1.05);
    mascotGroup.add(bellHole);

    // 8. Body & White Belly
    const bodyGroup = new THREE.Group();
    bodyGroup.position.set(0, -1.8, 0);
    mascotGroup.add(bodyGroup);

    const bodyGeo = new THREE.SphereGeometry(1.12, 32, 32);
    const bodyMesh = new THREE.Mesh(bodyGeo, blueMaterial);
    bodyMesh.scale.set(1.0, 1.1, 0.9);
    bodyMesh.castShadow = true;
    bodyGroup.add(bodyMesh);

    // White Belly Patch
    const bellyGeo = new THREE.SphereGeometry(0.92, 32, 32);
    const bellyMesh = new THREE.Mesh(bellyGeo, whiteMaterial);
    bellyMesh.scale.set(0.9, 0.9, 0.38);
    bellyMesh.position.set(0, 0.05, 0.52);
    bodyGroup.add(bellyMesh);

    // 4D Pocket Rim & Pouch
    const pocketGeo = new THREE.TorusGeometry(0.5, 0.04, 12, 24, Math.PI);
    const pocketRim = new THREE.Mesh(pocketGeo, blueMaterial);
    pocketRim.rotation.x = Math.PI;
    pocketRim.position.set(0, -0.05, 0.86);
    bodyGroup.add(pocketRim);

    // Internal pocket glow light
    const pocketLight = new THREE.PointLight(0xffd54f, 0, 4);
    pocketLight.position.set(0, 0, 0.95);
    bodyGroup.add(pocketLight);

    // 9. Articulated Arms & White Paws
    // Left Arm (Viewer's Left)
    const leftArmGroup = new THREE.Group();
    leftArmGroup.position.set(-1.0, -1.5, 0);
    mascotGroup.add(leftArmGroup);

    const armGeo = new THREE.CylinderGeometry(0.2, 0.24, 0.7, 16);
    const leftArmMesh = new THREE.Mesh(armGeo, blueMaterial);
    leftArmMesh.position.set(0, -0.3, 0);
    leftArmGroup.add(leftArmMesh);

    const pawGeo = new THREE.SphereGeometry(0.3, 24, 24);
    const leftPaw = new THREE.Mesh(pawGeo, whiteMaterial);
    leftPaw.position.set(0, -0.65, 0);
    leftArmGroup.add(leftPaw);

    // Right Arm (Viewer's Right)
    const rightArmGroup = new THREE.Group();
    rightArmGroup.position.set(1.0, -1.5, 0);
    mascotGroup.add(rightArmGroup);

    const rightArmMesh = new THREE.Mesh(armGeo, blueMaterial);
    rightArmMesh.position.set(0, -0.3, 0);
    rightArmGroup.add(rightArmMesh);

    const rightPaw = new THREE.Mesh(pawGeo, whiteMaterial);
    rightPaw.position.set(0, -0.65, 0);
    rightArmGroup.add(rightPaw);

    // Teacher Pointer Stick (visible during 'teaching')
    const stickGeo = new THREE.CylinderGeometry(0.03, 0.03, 1.2, 8);
    const stickMesh = new THREE.Mesh(stickGeo, goldMaterial);
    stickMesh.position.set(0.1, -0.95, 0.4);
    stickMesh.rotation.x = Math.PI / 4;
    stickMesh.rotation.z = -Math.PI / 6;
    stickMesh.visible = false;
    rightArmGroup.add(stickMesh);

    // 10. White Feet
    const footGeo = new THREE.SphereGeometry(0.42, 24, 24);
    const leftFoot = new THREE.Mesh(footGeo, whiteMaterial);
    leftFoot.scale.set(0.85, 0.5, 1.35);
    leftFoot.position.set(-0.48, -2.85, 0.15);
    leftFoot.castShadow = true;
    mascotGroup.add(leftFoot);

    const rightFoot = new THREE.Mesh(footGeo, whiteMaterial);
    rightFoot.scale.set(0.85, 0.5, 1.35);
    rightFoot.position.set(0.48, -2.85, 0.15);
    rightFoot.castShadow = true;
    mascotGroup.add(rightFoot);

    // 11. Soft Contact Shadow Plane on Ground
    const shadowGeo = new THREE.PlaneGeometry(2.6, 2.6);
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 128;
    shadowCanvas.height = 128;
    const shadowCtx = shadowCanvas.getContext('2d')!;
    const grad = shadowCtx.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, 'rgba(15, 23, 42, 0.45)');
    grad.addColorStop(0.6, 'rgba(15, 23, 42, 0.15)');
    grad.addColorStop(1, 'rgba(15, 23, 42, 0)');
    shadowCtx.fillStyle = grad;
    shadowCtx.fillRect(0, 0, 128, 128);

    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      opacity: 0.7,
      depthWrite: false,
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.set(0, -3.1, 0);
    scene.add(shadowMesh);

    // 12. Floating 3D Gold Particles
    const particleCount = 20;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      particlePos[i * 3] = (Math.random() - 0.5) * 3.5;
      particlePos[i * 3 + 1] = (Math.random() - 0.5) * 3.5;
      particlePos[i * 3 + 2] = (Math.random() - 0.5) * 2;
    }
    particleGeo.setAttribute(
      'position',
      new THREE.BufferAttribute(particlePos, 3)
    );

    const particleMat = new THREE.PointsMaterial({
      color: 0xffd54f,
      size: 0.08,
      transparent: true,
      opacity: 0.8,
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    // Mouse Tracking in 3D
    let targetLookX = 0;
    let targetLookY = 0;
    let currentLookX = 0;
    let currentLookY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      if (!interactiveLook) return;
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetLookX = Math.max(-0.45, Math.min(0.45, x * 0.45));
      targetLookY = Math.max(-0.25, Math.min(0.25, y * 0.25));
    };

    window.addEventListener('mousemove', handleMouseMove);

    // 13. Smooth 60 FPS Real-Time Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      const curState = stateRef.current;

      // 1. Continuous Propeller Spin
      bladesGroup.rotation.y += 0.28;

      // 2. Smooth Head & Eye tracking toward mouse
      currentLookX += (targetLookX - currentLookX) * 0.08;
      currentLookY += (targetLookY - currentLookY) * 0.08;
      headGroup.rotation.y = currentLookX;
      headGroup.rotation.x = -currentLookY;

      // 3. Floating particle bob
      particleSystem.rotation.y = time * 0.05;

      // 4. State-Driven Real 3D Skeletal Poses
      stickMesh.visible = curState === 'teaching';

      if (curState === 'celebrating') {
        // Jumping up and down in 3D with both paws high
        const jumpY = Math.abs(Math.sin(time * 6)) * 0.5;
        mascotGroup.position.y = jumpY;
        shadowMesh.scale.setScalar(1 - jumpY * 0.5);

        // Arms raised in victory
        leftArmGroup.rotation.z = Math.PI * 0.75 + Math.sin(time * 8) * 0.2;
        rightArmGroup.rotation.z = -Math.PI * 0.75 - Math.sin(time * 8) * 0.2;
        leftArmGroup.rotation.x = 0;
        rightArmGroup.rotation.x = 0;
        pocketLight.intensity = 0;
      } else if (curState === 'welcome') {
        // Friendly waving right arm
        mascotGroup.position.y = Math.sin(time * 2.5) * 0.08;
        shadowMesh.scale.setScalar(1 + Math.sin(time * 2.5) * 0.04);

        leftArmGroup.rotation.z = 0.2;
        leftArmGroup.rotation.x = 0;

        // Wave right arm
        rightArmGroup.rotation.z = -Math.PI * 0.7 + Math.sin(time * 6) * 0.35;
        rightArmGroup.rotation.x = Math.sin(time * 3) * 0.15;
        pocketLight.intensity = 0;
      } else if (curState === 'thinking') {
        // Tilted head, right paw under chin
        mascotGroup.position.y = Math.sin(time * 2) * 0.05;
        headGroup.rotation.z = 0.15 + Math.sin(time * 2) * 0.05;

        leftArmGroup.rotation.z = 0.2;
        rightArmGroup.rotation.z = -Math.PI * 0.55;
        rightArmGroup.rotation.x = 0.45;
        pocketLight.intensity = 0;
      } else if (curState === 'searching') {
        // Head tilted down towards pocket, right arm inside pocket with intense golden glow
        mascotGroup.position.y = -0.05;
        headGroup.rotation.x = 0.35;
        headGroup.rotation.y = 0;

        leftArmGroup.rotation.z = 0.2;
        // Right arm inside 4D pocket
        rightArmGroup.rotation.z = -0.3;
        rightArmGroup.rotation.x = 0.75 + Math.sin(time * 7) * 0.15;
        rightArmGroup.position.y = -1.5;

        // Pulsing pocket light!
        pocketLight.intensity = 2.5 + Math.sin(time * 10) * 1.5;
        pocketLight.color.setHex(0xffd54f);
      } else if (curState === 'presenting') {
        // Right arm raised high holding gadget, pocket glowing cyan
        mascotGroup.position.y = Math.sin(time * 2.5) * 0.08;
        headGroup.rotation.x = -0.15;

        leftArmGroup.rotation.z = 0.3;
        rightArmGroup.rotation.z = -Math.PI * 0.8;
        rightArmGroup.rotation.x = 0.2;

        pocketLight.intensity = 3.0;
        pocketLight.color.setHex(0x00e676);
      } else if (curState === 'teaching') {
        // Left arm resting, right arm holding pointer stick and gesturing forward
        mascotGroup.position.y = Math.sin(time * 2.5) * 0.05;
        leftArmGroup.rotation.z = 0.2;

        rightArmGroup.rotation.z = -Math.PI * 0.35 + Math.sin(time * 3) * 0.15;
        rightArmGroup.rotation.x = 0.4;
        pocketLight.intensity = 0;
      } else if (curState === 'encouraging') {
        // Thumbs up gesture, warm head tilt
        mascotGroup.position.y = Math.sin(time * 2) * 0.05;
        headGroup.rotation.z = -0.12;

        leftArmGroup.rotation.z = 0.2;
        rightArmGroup.rotation.z = -0.6;
        rightArmGroup.rotation.x = 0.5;
        pocketLight.intensity = 0;
      } else if (curState === 'uploading') {
        // Both arms open welcoming documents
        mascotGroup.position.y = Math.sin(time * 2.5) * 0.06;
        leftArmGroup.rotation.z = 0.6;
        leftArmGroup.rotation.x = 0.4;
        rightArmGroup.rotation.z = -0.6;
        rightArmGroup.rotation.x = 0.4;
        pocketLight.intensity = 1.5;
        pocketLight.color.setHex(0x29b6f6);
      } else if (curState === 'processing') {
        // Scanning motion
        mascotGroup.position.y = Math.sin(time * 3) * 0.04;
        headGroup.rotation.x = 0.2;

        leftArmGroup.rotation.z = 0.2;
        rightArmGroup.rotation.z = -0.4;
        rightArmGroup.rotation.x = 0.6 + Math.sin(time * 5) * 0.2;
        pocketLight.intensity = 2.0;
        pocketLight.color.setHex(0x00e676);
      } else {
        // Default Idle: Breathing and gentle floating
        const breath = Math.sin(time * 2.8);
        mascotGroup.position.y = breath * 0.08;
        headGroup.scale.setScalar(1 + breath * 0.015);
        bodyGroup.scale.set(1 + breath * 0.02, 1 + breath * 0.015, 1);
        shadowMesh.scale.setScalar(1 - breath * 0.06);

        // Relaxed arms
        leftArmGroup.rotation.z = 0.2 + breath * 0.04;
        rightArmGroup.rotation.z = -0.2 - breath * 0.04;
        leftArmGroup.rotation.x = 0;
        rightArmGroup.rotation.x = 0;
        pocketLight.intensity = 0;
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
      scene.clear();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [dim.width, dim.height, dim.cameraZ, interactiveLook]);

  return (
    <div className="relative inline-flex items-center gap-3 select-none">
      {/* Cartoon Speech Bubble */}
      {showSpeechBubble && message && (
        <div className="relative max-w-[240px] sm:max-w-[280px] p-2.5 sm:p-3 rounded-2xl bg-white/95 backdrop-blur-md border-2 border-sky-200 shadow-lg animate-pop-in z-20">
          <p className="text-[11px] sm:text-xs font-black text-slate-800 leading-snug">
            {message}
          </p>
          <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white border-t-2 border-r-2 border-sky-200 rotate-45 transform" />
        </div>
      )}

      {/* Real Three.js 3D Canvas */}
      <div
        ref={mountRef}
        onClick={onMascotClick}
        className="relative cursor-pointer transition-transform duration-200 hover:scale-105 drop-shadow-2xl"
        style={{ width: dim.width, height: dim.height }}
        title="I'm your real 3D Doraemon learning companion!"
      />
    </div>
  );
};
