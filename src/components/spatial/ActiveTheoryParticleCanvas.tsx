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

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x05050a, 0.0018);

    const camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 2, 14);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // 2. Cosmic Particle Nebula (2,500 luminous stardust particles)
    const particleCount = 2200;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const scales = new Float32Array(particleCount);

    const colorPalette = [
      new THREE.Color(0x00f0ff), // Electric Cyan
      new THREE.Color(0xff007f), // Neon Magenta
      new THREE.Color(0x7928ca), // Cyber Purple
      new THREE.Color(0xffb800), // Solar Amber
      new THREE.Color(0xffffff), // Pure Starlight
    ];

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      // Spherical distribution with vertical flattening
      const radius = 6 + Math.random() * 26;
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI * 0.7;

      positions[i3] = radius * Math.cos(theta) * Math.cos(phi);
      positions[i3 + 1] = radius * Math.sin(phi) * 0.7 + (Math.random() - 0.5) * 4;
      positions[i3 + 2] = radius * Math.sin(theta) * Math.cos(phi) - 4;

      const col = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      colors[i3] = col.r;
      colors[i3 + 1] = col.g;
      colors[i3 + 2] = col.b;

      scales[i] = Math.random() * 2.5 + 0.8;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Particle Material with Soft Glow Sprite
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
      gradient.addColorStop(0, 'rgba(255,255,255,1)');
      gradient.addColorStop(0.3, 'rgba(120,200,255,0.7)');
      gradient.addColorStop(0.8, 'rgba(100,50,255,0.2)');
      gradient.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 32, 32);
    }
    const texture = new THREE.CanvasTexture(canvas);

    const material = new THREE.PointsMaterial({
      size: 0.35,
      map: texture,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // 3. Holographic Cybernetic Centerpiece (Rotating Cyber Ring / Portal)
    const ringGroup = new THREE.Group();
    ringGroup.position.set(0, 1.2, -6);

    // Outer Torus Ring
    const torusGeo = new THREE.TorusGeometry(5.2, 0.08, 16, 100);
    const torusMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const torus = new THREE.Mesh(torusGeo, torusMat);
    ringGroup.add(torus);

    // Inner Geometric Gyro Ring
    const innerGeo = new THREE.IcosahedronGeometry(3.2, 1);
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0xff007f,
      wireframe: true,
      transparent: true,
      opacity: 0.2,
    });
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    ringGroup.add(innerMesh);

    // Orbiting Luminescent Nodes on the Ring
    const nodeCount = 12;
    const nodesGroup = new THREE.Group();
    const nodeGeo = new THREE.SphereGeometry(0.12, 12, 12);
    const nodeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

    for (let i = 0; i < nodeCount; i++) {
      const angle = (i / nodeCount) * Math.PI * 2;
      const node = new THREE.Mesh(nodeGeo, nodeMat);
      node.position.set(Math.cos(angle) * 5.2, Math.sin(angle) * 5.2, 0);
      nodesGroup.add(node);
    }
    ringGroup.add(nodesGroup);
    scene.add(ringGroup);

    // 4. Subtle Ambient Lights
    const ambientLight = new THREE.AmbientLight(0x1a1a2e, 1.5);
    scene.add(ambientLight);

    const cyanLight = new THREE.PointLight(0x00f0ff, 3, 30);
    cyanLight.position.set(-8, 5, 2);
    scene.add(cyanLight);

    const magentaLight = new THREE.PointLight(0xff007f, 3, 30);
    magentaLight.position.set(8, -3, 2);
    scene.add(magentaLight);

    // 5. Mouse Interaction with Spring Inertia
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

    // 6. Resize Handler
    const handleResize = () => {
      if (!container) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    // 7. Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth mouse inertia
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      // Particle rotation & flow
      particles.rotation.y = elapsedTime * 0.04 + mouse.x * 0.15;
      particles.rotation.x = Math.sin(elapsedTime * 0.03) * 0.08 + mouse.y * 0.1;

      // Holographic Ring Gyro Spin
      ringGroup.rotation.z = elapsedTime * 0.08;
      ringGroup.rotation.x = Math.sin(elapsedTime * 0.12) * 0.25 + mouse.y * 0.3;
      ringGroup.rotation.y = elapsedTime * 0.15 + mouse.x * 0.4;
      innerMesh.rotation.x = -elapsedTime * 0.2;
      innerMesh.rotation.y = -elapsedTime * 0.25;

      camera.position.x = mouse.x * 1.2;
      camera.position.y = 2 + mouse.y * 0.8;
      camera.lookAt(0, 0.5, 0);

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      if (interactive) {
        window.removeEventListener('mousemove', handleMouseMove);
      }
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      torusGeo.dispose();
      torusMat.dispose();
      innerGeo.dispose();
      innerMat.dispose();
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [interactive]);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden"
      style={{
        background: 'radial-gradient(ellipse at 50% 30%, #0c0c16 0%, #050508 65%, #020204 100%)',
      }}
    />
  );
};
