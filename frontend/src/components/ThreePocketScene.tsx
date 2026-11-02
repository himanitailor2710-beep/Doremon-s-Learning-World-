import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface ThreePocketSceneProps {
  stage: number; // 1 to 6
  gadgetType?: 'book' | 'calculator' | 'hologram' | 'scene' | 'booklet' | 'quiz_cards' | 'memory_cards';
}

export const ThreePocketScene: React.FC<ThreePocketSceneProps> = ({
  stage,
  gadgetType = 'book',
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<number>(stage);
  stageRef.current = stage;

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = 280;
    const height = 280;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, -0.2, 5.8);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Studio Lights
    const keyLight = new THREE.DirectionalLight(0xfff8e1, 2.2);
    keyLight.position.set(3, 4, 4);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x81d4fa, 1.4);
    fillLight.position.set(-3, 2, 2);
    scene.add(fillLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const pocketGlowLight = new THREE.PointLight(0xffd54f, 0, 4);
    pocketGlowLight.position.set(0, -0.6, 1.2);
    scene.add(pocketGlowLight);

    // Mascot Group
    const mascotGroup = new THREE.Group();
    mascotGroup.position.set(0, 0.5, 0);
    scene.add(mascotGroup);

    const blueMat = new THREE.MeshStandardMaterial({
      color: 0x0288d1,
      roughness: 0.28,
      metalness: 0.1,
    });
    const whiteMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.25,
    });
    const redMat = new THREE.MeshStandardMaterial({
      color: 0xe53935,
      roughness: 0.2,
    });
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xffd600,
      roughness: 0.18,
      metalness: 0.8,
    });
    const darkMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.4,
    });

    // Head
    const headGroup = new THREE.Group();
    mascotGroup.add(headGroup);

    const headMesh = new THREE.Mesh(
      new THREE.SphereGeometry(1.0, 32, 32),
      blueMat
    );
    headGroup.add(headMesh);

    // White face
    const faceMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.88, 32, 32),
      whiteMat
    );
    faceMesh.scale.set(1.0, 0.88, 0.42);
    faceMesh.position.set(0, -0.1, 0.55);
    headGroup.add(faceMesh);

    // Eyes looking down towards pocket
    const eyeWhiteGeo = new THREE.SphereGeometry(0.26, 24, 24);
    const pupilGeo = new THREE.SphereGeometry(0.1, 16, 16);

    const leftEye = new THREE.Mesh(eyeWhiteGeo, whiteMat);
    leftEye.scale.set(0.85, 1.15, 0.45);
    leftEye.position.set(-0.24, 0.28, 0.82);
    headGroup.add(leftEye);

    const leftPupil = new THREE.Mesh(pupilGeo, darkMat);
    leftPupil.position.set(-0.24, 0.22, 0.94);
    headGroup.add(leftPupil);

    const rightEye = new THREE.Mesh(eyeWhiteGeo, whiteMat);
    rightEye.scale.set(0.85, 1.15, 0.45);
    rightEye.position.set(0.24, 0.28, 0.82);
    headGroup.add(rightEye);

    const rightPupil = new THREE.Mesh(pupilGeo, darkMat);
    rightPupil.position.set(0.24, 0.22, 0.94);
    headGroup.add(rightPupil);

    // Nose
    const noseMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 24, 24),
      redMat
    );
    noseMesh.position.set(0, 0.1, 0.98);
    headGroup.add(noseMesh);

    // Propeller spinning
    const propeller = new THREE.Group();
    propeller.position.set(0, 1.05, 0);
    headGroup.add(propeller);
    const blades = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 0.03, 0.14),
      goldMat
    );
    propeller.add(blades);

    // Collar & Bell
    const collar = new THREE.Mesh(
      new THREE.TorusGeometry(0.72, 0.1, 16, 32),
      redMat
    );
    collar.rotation.x = Math.PI / 2;
    collar.position.set(0, -0.85, 0);
    mascotGroup.add(collar);

    const bell = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 24, 24),
      goldMat
    );
    bell.position.set(0, -1.0, 0.72);
    mascotGroup.add(bell);

    // Body & White Belly
    const bodyMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.95, 32, 32),
      blueMat
    );
    bodyMesh.scale.set(1.0, 1.1, 0.9);
    bodyMesh.position.set(0, -1.5, 0);
    mascotGroup.add(bodyMesh);

    const bellyMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.78, 32, 32),
      whiteMat
    );
    bellyMesh.scale.set(0.9, 0.9, 0.38);
    bellyMesh.position.set(0, -1.45, 0.44);
    mascotGroup.add(bellyMesh);

    // 4D Pocket Rim
    const pocketRim = new THREE.Mesh(
      new THREE.TorusGeometry(0.42, 0.035, 12, 24, Math.PI),
      blueMat
    );
    pocketRim.rotation.x = Math.PI;
    pocketRim.position.set(0, -1.55, 0.74);
    mascotGroup.add(pocketRim);

    // Right Arm (Reaching inside the pocket)
    const rightArmGroup = new THREE.Group();
    rightArmGroup.position.set(0.85, -1.2, 0);
    mascotGroup.add(rightArmGroup);

    const rightArmMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.16, 0.2, 0.6, 16),
      blueMat
    );
    rightArmMesh.position.set(0, -0.25, 0);
    rightArmGroup.add(rightArmMesh);

    const rightPaw = new THREE.Mesh(
      new THREE.SphereGeometry(0.25, 24, 24),
      whiteMat
    );
    rightPaw.position.set(0, -0.55, 0);
    rightArmGroup.add(rightPaw);

    // Left Arm (Resting)
    const leftArmGroup = new THREE.Group();
    leftArmGroup.position.set(-0.85, -1.2, 0);
    mascotGroup.add(leftArmGroup);

    const leftArmMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.16, 0.2, 0.6, 16),
      blueMat
    );
    leftArmMesh.position.set(0, -0.25, 0);
    leftArmGroup.add(leftArmMesh);

    const leftPaw = new THREE.Mesh(
      new THREE.SphereGeometry(0.25, 24, 24),
      whiteMat
    );
    leftPaw.position.set(0, -0.55, 0);
    leftArmGroup.add(leftPaw);

    // 3D FLOATING GADGET OBJECT: Emerges in 3D from the pocket!
    const gadgetGroup = new THREE.Group();
    gadgetGroup.position.set(0, -1.5, 0.8);
    gadgetGroup.scale.set(0.01, 0.01, 0.01);
    scene.add(gadgetGroup);

    // Construct 3D Gadget based on type
    if (gadgetType === 'calculator') {
      // 3D Quantum Calculator
      const calcBody = new THREE.Mesh(
        new THREE.BoxGeometry(0.9, 1.2, 0.16),
        new THREE.MeshStandardMaterial({
          color: 0xffb300,
          roughness: 0.2,
          metalness: 0.4,
        })
      );
      gadgetGroup.add(calcBody);

      // Glowing screen
      const screen = new THREE.Mesh(
        new THREE.PlaneGeometry(0.7, 0.35),
        new THREE.MeshBasicMaterial({ color: 0x00e676 })
      );
      screen.position.set(0, 0.32, 0.09);
      gadgetGroup.add(screen);
    } else if (gadgetType === 'hologram') {
      // 3D Holographic Pyramid with rotating ring
      const pyramid = new THREE.Mesh(
        new THREE.ConeGeometry(0.6, 0.9, 4),
        new THREE.MeshStandardMaterial({
          color: 0x818cf8,
          roughness: 0.1,
          metalness: 0.6,
          wireframe: true,
        })
      );
      gadgetGroup.add(pyramid);

      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.7, 0.03, 8, 24),
        new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
      );
      ring.rotation.x = Math.PI / 2;
      gadgetGroup.add(ring);
    } else {
      // Default: 3D Magical Concept Tome (Book)
      const bookCover = new THREE.Mesh(
        new THREE.BoxGeometry(0.95, 1.25, 0.22),
        new THREE.MeshStandardMaterial({
          color: 0x0288d1,
          roughness: 0.2,
          metalness: 0.3,
        })
      );
      gadgetGroup.add(bookCover);

      const bookPages = new THREE.Mesh(
        new THREE.BoxGeometry(0.88, 1.18, 0.18),
        new THREE.MeshStandardMaterial({ color: 0xfff9c4, roughness: 0.4 })
      );
      bookPages.position.set(0.04, 0, 0);
      gadgetGroup.add(bookPages);

      // Golden Star Badge on book
      const star = new THREE.Mesh(
        new THREE.SphereGeometry(0.15, 16, 16),
        goldMat
      );
      star.position.set(0, 0, 0.14);
      gadgetGroup.add(star);
    }

    // 3D Floating Particle Sparkles orbiting the gadget
    const sparkleCount = 18;
    const sparkleGeo = new THREE.BufferGeometry();
    const sparklePos = new Float32Array(sparkleCount * 3);
    for (let i = 0; i < sparkleCount; i++) {
      const angle = (i / sparkleCount) * Math.PI * 2;
      sparklePos[i * 3] = Math.cos(angle) * 0.9;
      sparklePos[i * 3 + 1] = Math.sin(angle) * 0.9;
      sparklePos[i * 3 + 2] = (Math.random() - 0.5) * 0.6;
    }
    sparkleGeo.setAttribute(
      'position',
      new THREE.BufferAttribute(sparklePos, 3)
    );
    const sparkleSystem = new THREE.Points(
      sparkleGeo,
      new THREE.PointsMaterial({
        color: 0xffd54f,
        size: 0.08,
        transparent: true,
        opacity: 0.9,
      })
    );
    gadgetGroup.add(sparkleSystem);

    let animFrame: number;
    let clock = new THREE.Clock();

    const render = () => {
      animFrame = requestAnimationFrame(render);
      const time = clock.getElapsedTime();
      const currentStage = stageRef.current;

      blades.rotation.y += 0.32;

      if (currentStage === 1) {
        // Stage 1: Looking curious and smiling
        headGroup.rotation.x = 0;
        rightArmGroup.rotation.z = -0.2;
        rightArmGroup.rotation.x = 0;
        pocketGlowLight.intensity = 0;
        gadgetGroup.scale.set(0.001, 0.001, 0.001);
      } else if (currentStage === 2) {
        // Stage 2: Looking down at pocket
        headGroup.rotation.x = 0.35;
        rightArmGroup.rotation.z = -0.3;
        rightArmGroup.rotation.x = 0.5;
        pocketGlowLight.intensity = 0.5;
        gadgetGroup.scale.set(0.001, 0.001, 0.001);
      } else if (currentStage === 3) {
        // Stage 3: Arm reaching inside pocket
        headGroup.rotation.x = 0.4;
        rightArmGroup.rotation.x = 0.85 + Math.sin(time * 8) * 0.15;
        rightArmGroup.rotation.z = -0.25;
        pocketGlowLight.intensity = 2.5 + Math.sin(time * 12) * 1.5;
        gadgetGroup.scale.set(0.001, 0.001, 0.001);
      } else if (currentStage >= 4) {
        // Stage 4+: Gadget emerges floating up from the pocket!
        headGroup.rotation.x = -0.15;
        rightArmGroup.rotation.x = 0.2;
        rightArmGroup.rotation.z = -Math.PI * 0.65;

        // Animate gadget floating up towards center
        const targetY = 0.1;
        const targetZ = 1.6;
        gadgetGroup.position.y += (targetY - gadgetGroup.position.y) * 0.08;
        gadgetGroup.position.z += (targetZ - gadgetGroup.position.z) * 0.08;

        // Scale up
        gadgetGroup.scale.lerp(new THREE.Vector3(1.15, 1.15, 1.15), 0.08);

        // Smooth rotation in 3D!
        gadgetGroup.rotation.y = time * 1.2;
        gadgetGroup.rotation.x = Math.sin(time * 2) * 0.15;
        sparkleSystem.rotation.z = time * 2;

        pocketGlowLight.intensity = 3.5;
        pocketGlowLight.color.setHex(0x38bdf8);
      }

      renderer.render(scene, camera);
    };

    render();

    return () => {
      cancelAnimationFrame(animFrame);
      renderer.dispose();
      scene.clear();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [gadgetType]);

  return (
    <div
      ref={mountRef}
      className="relative mx-auto drop-shadow-2xl select-none"
      style={{ width: 280, height: 280 }}
    />
  );
};
