'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface ActiveTheoryParticleCanvasProps {
  interactive?: boolean;
}

export const ActiveTheoryParticleCanvas: React.FC<ActiveTheoryParticleCanvasProps> = ({
  interactive = true,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene, Camera, High-Fidelity Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x09090b, 0.024);

    const camera = new THREE.PerspectiveCamera(
      52,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 1.6, 13);

    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true, 
      powerPreference: 'high-performance' 
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.appendChild(renderer.domElement);

    // 2. Cosmic Ambient Stardust Nebula (Champagne Gold / Warm Diamond Palette)
    const stardustCount = 2000;
    const stardustGeo = new THREE.BufferGeometry();
    const stardustPos = new Float32Array(stardustCount * 3);
    const stardustColors = new Float32Array(stardustCount * 3);
    const stardustScales = new Float32Array(stardustCount);

    const palette = [
      new THREE.Color(0xe2b170), // Warm Champagne Gold
      new THREE.Color(0xf59e0b), // Deep Amber Gold
      new THREE.Color(0xd4a055), // Architectural Bronze
      new THREE.Color(0xfef3c7), // Soft Vanilla Diamond
      new THREE.Color(0xffffff), // Pure Celestial White
    ];

    for (let i = 0; i < stardustCount; i++) {
      const i3 = i * 3;
      const radius = 6 + Math.random() * 26;
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI * 0.85;

      stardustPos[i3] = radius * Math.cos(theta) * Math.cos(phi);
      stardustPos[i3 + 1] = radius * Math.sin(phi) * 0.75 + (Math.random() - 0.5) * 5;
      stardustPos[i3 + 2] = radius * Math.sin(theta) * Math.cos(phi) - 2.5;

      const col = palette[Math.floor(Math.random() * palette.length)];
      stardustColors[i3] = col.r;
      stardustColors[i3 + 1] = col.g;
      stardustColors[i3 + 2] = col.b;

      stardustScales[i] = Math.random() * 2.0 + 0.6;
    }

    stardustGeo.setAttribute('position', new THREE.BufferAttribute(stardustPos, 3));
    stardustGeo.setAttribute('color', new THREE.BufferAttribute(stardustColors, 3));

    // Glow Canvas Texture
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      gradient.addColorStop(0, 'rgba(255,255,255,1)');
      gradient.addColorStop(0.25, 'rgba(226,177,112,0.85)');
      gradient.addColorStop(0.65, 'rgba(212,160,85,0.25)');
      gradient.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 64, 64);
    }
    const particleTex = new THREE.CanvasTexture(canvas);

    const stardustMat = new THREE.PointsMaterial({
      size: 0.32,
      map: particleTex,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const stardustMesh = new THREE.Points(stardustGeo, stardustMat);
    scene.add(stardustMesh);

    // 3. Central Architectural Gyro Rig (From Active Theory & Arin Vale References)
    const shrineGroup = new THREE.Group();
    shrineGroup.position.set(0, 1.2, -4.0);

    // A. Suspended Top Champagne Gold Ring
    const topRingGeo = new THREE.TorusGeometry(6.5, 0.08, 16, 90);
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xe2b170,
      metalness: 0.95,
      roughness: 0.15,
      emissive: 0x5a3e10,
      emissiveIntensity: 0.45,
    });
    const topRing = new THREE.Mesh(topRingGeo, goldMat);
    topRing.rotation.x = Math.PI / 2;
    topRing.position.y = 4.8;
    shrineGroup.add(topRing);

    // B. Bottom Platform Ring
    const bottomRingGeo = new THREE.TorusGeometry(7.0, 0.1, 16, 90);
    const bottomRing = new THREE.Mesh(bottomRingGeo, goldMat);
    bottomRing.rotation.x = Math.PI / 2;
    bottomRing.position.y = -3.2;
    shrineGroup.add(bottomRing);

    // C. Vertical Hanging Metallic Tension Cables
    const cableCount = 18;
    const cableGroup = new THREE.Group();
    const cableMat = new THREE.LineBasicMaterial({
      color: 0xd4a055,
      transparent: true,
      opacity: 0.45,
    });

    for (let i = 0; i < cableCount; i++) {
      const angle = (i / cableCount) * Math.PI * 2;
      const x = Math.cos(angle) * 6.5;
      const z = Math.sin(angle) * 6.5;

      const points = [
        new THREE.Vector3(x, 4.8, z),
        new THREE.Vector3(x * 1.07, -3.2, z * 1.07),
      ];
      const cableGeo = new THREE.BufferGeometry().setFromPoints(points);
      const cable = new THREE.Line(cableGeo, cableMat);
      cableGroup.add(cable);
    }
    shrineGroup.add(cableGroup);

    // D. Organic Shimmering Particle Core
    const torusCount = 1800;
    const torusGeo = new THREE.BufferGeometry();
    const torusPos = new Float32Array(torusCount * 3);
    const torusColors = new Float32Array(torusCount * 3);
    const baseTheta = new Float32Array(torusCount);
    const basePhi = new Float32Array(torusCount);

    const majorR = 4.2;
    const minorR = 1.2;

    for (let i = 0; i < torusCount; i++) {
      const u = Math.random() * Math.PI * 2;
      const v = Math.random() * Math.PI * 2;
      baseTheta[i] = u;
      basePhi[i] = v;

      const x = (majorR + minorR * Math.cos(v)) * Math.cos(u);
      const y = (majorR + minorR * Math.cos(v)) * Math.sin(u) * 0.85;
      const z = minorR * Math.sin(v);

      torusPos[i * 3] = x;
      torusPos[i * 3 + 1] = y;
      torusPos[i * 3 + 2] = z;

      const c = Math.random() > 0.4 ? new THREE.Color(0xe2b170) : new THREE.Color(0xfef3c7);
      torusColors[i * 3] = c.r;
      torusColors[i * 3 + 1] = c.g;
      torusColors[i * 3 + 2] = c.b;
    }

    torusGeo.setAttribute('position', new THREE.BufferAttribute(torusPos, 3));
    torusGeo.setAttribute('color', new THREE.BufferAttribute(torusColors, 3));

    const torusMat = new THREE.PointsMaterial({
      size: 0.24,
      map: particleTex,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const organicTorusMesh = new THREE.Points(torusGeo, torusMat);
    shrineGroup.add(organicTorusMesh);
    scene.add(shrineGroup);

    // 4. Dark Obsidian Reflective Water Plane
    const waterGeo = new THREE.PlaneGeometry(80, 80, 40, 40);
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x09090b,
      roughness: 0.15,
      metalness: 0.9,
      transparent: true,
      opacity: 0.92,
    });
    const waterMesh = new THREE.Mesh(waterGeo, waterMat);
    waterMesh.rotation.x = -Math.PI / 2;
    waterMesh.position.y = -3.5;
    scene.add(waterMesh);

    const waterPosAttr = waterGeo.attributes.position;
    const initialZ = new Float32Array(waterPosAttr.count);
    for (let i = 0; i < waterPosAttr.count; i++) {
      initialZ[i] = waterPosAttr.getZ(i);
    }

    // 5. Lights
    const ambientLight = new THREE.AmbientLight(0x18181b, 1.4);
    scene.add(ambientLight);

    const goldCoreLight = new THREE.PointLight(0xe2b170, 3.5, 25);
    goldCoreLight.position.set(0, 1.2, -4.0);
    scene.add(goldCoreLight);

    const warmFillLight = new THREE.PointLight(0xd4a055, 1.8, 30);
    warmFillLight.position.set(10, 4, 2);
    scene.add(warmFillLight);

    // 6. Mouse Interaction with Fluid Spring Inertia
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouse.targetX = x * 1.5;
      mouse.targetY = y * 0.8;
    };

    if (interactive) {
      window.addEventListener('mousemove', handleMouseMove);
    }

    // 7. Resize Handler
    const handleResize = () => {
      if (!container) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    // 8. Animation Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Mouse inertia spring interpolation
      mouse.x += (mouse.targetX - mouse.x) * 0.045;
      mouse.y += (mouse.targetY - mouse.y) * 0.045;

      // Subtle camera parallax
      camera.position.x = mouse.x * 1.2;
      camera.position.y = 1.6 + mouse.y * 0.5;
      camera.lookAt(0, 0.6, -2);

      // Stardust cosmic drift
      stardustMesh.rotation.y = elapsedTime * 0.02 + mouse.x * 0.06;
      stardustMesh.rotation.x = Math.sin(elapsedTime * 0.015) * 0.03 + mouse.y * 0.04;

      // Shrine Gyro Rig Rotation
      shrineGroup.rotation.y = elapsedTime * 0.08 + mouse.x * 0.18;
      topRing.rotation.z = -elapsedTime * 0.14;
      bottomRing.rotation.z = elapsedTime * 0.14;

      // Animate Living Organic Torus Particles
      const positions = organicTorusMesh.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < torusCount; i++) {
        const u = baseTheta[i] + elapsedTime * 0.25;
        const v = basePhi[i] + Math.sin(elapsedTime * 0.5 + u) * 0.35;
        const pulse = 1 + Math.sin(elapsedTime * 1.2 + u * 2) * 0.06;

        const x = (majorR * pulse + minorR * Math.cos(v)) * Math.cos(u);
        const y = (majorR * pulse + minorR * Math.cos(v)) * Math.sin(u) * 0.85;
        const z = minorR * Math.sin(v);

        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;
      }
      organicTorusMesh.geometry.attributes.position.needsUpdate = true;

      // Water Ripple Waves
      for (let i = 0; i < waterPosAttr.count; i++) {
        const vx = waterPosAttr.getX(i);
        const vy = waterPosAttr.getY(i);
        const wave = Math.sin(vx * 0.35 + elapsedTime * 1.5) * Math.cos(vy * 0.35 + elapsedTime * 1.2) * 0.12;
        waterPosAttr.setZ(i, initialZ[i] + wave);
      }
      waterPosAttr.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      if (interactive) {
        window.removeEventListener('mousemove', handleMouseMove);
      }
      renderer.dispose();
      stardustGeo.dispose();
      stardustMat.dispose();
      particleTex.dispose();
      topRingGeo.dispose();
      goldMat.dispose();
      bottomRingGeo.dispose();
      cableMat.dispose();
      torusGeo.dispose();
      torusMat.dispose();
      waterGeo.dispose();
      waterMat.dispose();
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [interactive]);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden"
    />
  );
};
