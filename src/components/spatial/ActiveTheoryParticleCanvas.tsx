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
    scene.fog = new THREE.FogExp2(0x09090b, 0.026);

    const camera = new THREE.PerspectiveCamera(
      52,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 1.5, 13);

    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true, 
      powerPreference: 'high-performance' 
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    // 2. Cosmic Ambient Stardust Nebula (Champagne Gold / Warm Diamond Palette)
    const stardustCount = 1800;
    const stardustGeo = new THREE.BufferGeometry();
    const stardustPos = new Float32Array(stardustCount * 3);
    const stardustColors = new Float32Array(stardustCount * 3);

    const palette = [
      new THREE.Color(0xe2b170), // Warm Champagne Gold
      new THREE.Color(0xf59e0b), // Deep Amber Gold
      new THREE.Color(0xd4a055), // Architectural Bronze
      new THREE.Color(0xfef3c7), // Soft Vanilla Diamond
      new THREE.Color(0xffffff), // Celestial White
    ];

    for (let i = 0; i < stardustCount; i++) {
      const i3 = i * 3;
      const radius = 8 + Math.random() * 28;
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI * 0.9;

      stardustPos[i3] = radius * Math.cos(theta) * Math.cos(phi);
      stardustPos[i3 + 1] = radius * Math.sin(phi) * 0.8 + (Math.random() - 0.5) * 6;
      stardustPos[i3 + 2] = radius * Math.sin(theta) * Math.cos(phi) - 3;

      const col = palette[Math.floor(Math.random() * palette.length)];
      stardustColors[i3] = col.r;
      stardustColors[i3 + 1] = col.g;
      stardustColors[i3 + 2] = col.b;
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
      gradient.addColorStop(0.2, 'rgba(226,177,112,0.85)');
      gradient.addColorStop(0.6, 'rgba(212,160,85,0.2)');
      gradient.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 64, 64);
    }
    const particleTex = new THREE.CanvasTexture(canvas);

    const stardustMat = new THREE.PointsMaterial({
      size: 0.28,
      map: particleTex,
      vertexColors: true,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const stardustMesh = new THREE.Points(stardustGeo, stardustMat);
    scene.add(stardustMesh);

    // 3. Ambient Lights
    const ambientLight = new THREE.AmbientLight(0x18181b, 1.2);
    scene.add(ambientLight);

    const goldCoreLight = new THREE.PointLight(0xe2b170, 2.5, 30);
    goldCoreLight.position.set(0, 2, -4.0);
    scene.add(goldCoreLight);

    // 4. Mouse Interaction with Fluid Spring Inertia
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouse.targetX = x * 1.2;
      mouse.targetY = y * 0.6;
    };

    if (interactive) {
      window.addEventListener('mousemove', handleMouseMove);
    }

    // 5. Resize Handler
    const handleResize = () => {
      if (!container) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    // 6. Animation Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Mouse inertia spring interpolation
      mouse.x += (mouse.targetX - mouse.x) * 0.04;
      mouse.y += (mouse.targetY - mouse.y) * 0.04;

      // Gentle camera parallax
      camera.position.x = mouse.x * 1.0;
      camera.position.y = 1.5 + mouse.y * 0.4;
      camera.lookAt(0, 0.5, -2);

      // Stardust cosmic drift
      stardustMesh.rotation.y = elapsedTime * 0.015 + mouse.x * 0.04;
      stardustMesh.rotation.x = Math.sin(elapsedTime * 0.01) * 0.02 + mouse.y * 0.03;

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
