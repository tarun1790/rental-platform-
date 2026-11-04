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
    scene.fog = new THREE.FogExp2(0x06060c, 0.022);

    const camera = new THREE.PerspectiveCamera(
      55,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 1.8, 13);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    container.appendChild(renderer.domElement);

    // 2. Cosmic Ambient Stardust Nebula (2,600 luminous stardust particles)
    const stardustCount = 2400;
    const stardustGeo = new THREE.BufferGeometry();
    const stardustPos = new Float32Array(stardustCount * 3);
    const stardustColors = new Float32Array(stardustCount * 3);
    const stardustScales = new Float32Array(stardustCount);

    const palette = [
      new THREE.Color(0xf39c12), // Solar Amber/Gold
      new THREE.Color(0xe67e22), // Deep Gold
      new THREE.Color(0x00f0ff), // Electric Cyan
      new THREE.Color(0xa855f7), // Neon Violet
      new THREE.Color(0xffffff), // Diamond White
    ];

    for (let i = 0; i < stardustCount; i++) {
      const i3 = i * 3;
      const radius = 5 + Math.random() * 28;
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI * 0.8;

      stardustPos[i3] = radius * Math.cos(theta) * Math.cos(phi);
      stardustPos[i3 + 1] = radius * Math.sin(phi) * 0.75 + (Math.random() - 0.5) * 6;
      stardustPos[i3 + 2] = radius * Math.sin(theta) * Math.cos(phi) - 3;

      const col = palette[Math.floor(Math.random() * palette.length)];
      stardustColors[i3] = col.r;
      stardustColors[i3 + 1] = col.g;
      stardustColors[i3 + 2] = col.b;

      stardustScales[i] = Math.random() * 2.2 + 0.8;
    }

    stardustGeo.setAttribute('position', new THREE.BufferAttribute(stardustPos, 3));
    stardustGeo.setAttribute('color', new THREE.BufferAttribute(stardustColors, 3));

    // Particle Glow Texture Canvas
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      gradient.addColorStop(0, 'rgba(255,255,255,1)');
      gradient.addColorStop(0.25, 'rgba(255,200,100,0.85)');
      gradient.addColorStop(0.65, 'rgba(100,180,255,0.3)');
      gradient.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 64, 64);
    }
    const particleTex = new THREE.CanvasTexture(canvas);

    const stardustMat = new THREE.PointsMaterial({
      size: 0.38,
      map: particleTex,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const stardustMesh = new THREE.Points(stardustGeo, stardustMat);
    scene.add(stardustMesh);

    // 3. Central Architectural Gyro Rig & Organic Particle Torus (From Active Theory Video)
    const shrineGroup = new THREE.Group();
    shrineGroup.position.set(0, 1.6, -3.5);

    // A. Suspended Top Golden Metallic Ring Chandelier
    const topRingGeo = new THREE.TorusGeometry(7.0, 0.15, 16, 90);
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xdeb887,
      metalness: 0.9,
      roughness: 0.2,
      emissive: 0x6e4a05,
      emissiveIntensity: 0.55,
    });
    const topRing = new THREE.Mesh(topRingGeo, goldMat);
    topRing.rotation.x = Math.PI / 2;
    topRing.position.y = 5.2;
    shrineGroup.add(topRing);

    // B. Bottom Platform Ring
    const bottomRingGeo = new THREE.TorusGeometry(7.4, 0.18, 16, 90);
    const bottomRing = new THREE.Mesh(bottomRingGeo, goldMat);
    bottomRing.rotation.x = Math.PI / 2;
    bottomRing.position.y = -3.6;
    shrineGroup.add(bottomRing);

    // C. Vertical Hanging Metallic Tension Cables
    const cableCount = 20;
    const cableGroup = new THREE.Group();
    const cableMat = new THREE.LineBasicMaterial({
      color: 0xe6a838,
      transparent: true,
      opacity: 0.75,
    });

    for (let i = 0; i < cableCount; i++) {
      const angle = (i / cableCount) * Math.PI * 2;
      const x = Math.cos(angle) * 7.0;
      const z = Math.sin(angle) * 7.0;

      const points = [
        new THREE.Vector3(x, 5.2, z),
        new THREE.Vector3(x * 1.05, -3.6, z * 1.05),
      ];
      const cableGeo = new THREE.BufferGeometry().setFromPoints(points);
      const cable = new THREE.Line(cableGeo, cableMat);
      cableGroup.add(cable);
    }
    shrineGroup.add(cableGroup);

    // D. Organic Shimmering Particle Torus (The Living Core in Active Theory)
    const torusCount = 2200;
    const torusGeo = new THREE.BufferGeometry();
    const torusPos = new Float32Array(torusCount * 3);
    const torusColors = new Float32Array(torusCount * 3);
    const baseTheta = new Float32Array(torusCount);
    const basePhi = new Float32Array(torusCount);

    const majorR = 4.4;
    const minorR = 1.35;

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

      // Golden core with violet and cyan perimeter fringe
      const isFringe = Math.random() > 0.7;
      const c = isFringe
        ? (Math.random() > 0.5 ? new THREE.Color(0x00f0ff) : new THREE.Color(0xa855f7))
        : new THREE.Color(0xffbe3b);

      torusColors[i * 3] = c.r;
      torusColors[i * 3 + 1] = c.g;
      torusColors[i * 3 + 2] = c.b;
    }

    torusGeo.setAttribute('position', new THREE.BufferAttribute(torusPos, 3));
    torusGeo.setAttribute('color', new THREE.BufferAttribute(torusColors, 3));

    const torusMat = new THREE.PointsMaterial({
      size: 0.28,
      map: particleTex,
      vertexColors: true,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const organicTorusMesh = new THREE.Points(torusGeo, torusMat);
    organicTorusMesh.position.y = 0.3;
    shrineGroup.add(organicTorusMesh);

    scene.add(shrineGroup);

    // 4. Dark Reflective Water Plane with Ripple Motion (Bottom Floor in Video)
    const waterGeo = new THREE.PlaneGeometry(80, 80, 48, 48);
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x070712,
      roughness: 0.15,
      metalness: 0.85,
      transparent: true,
      opacity: 0.88,
    });
    const waterMesh = new THREE.Mesh(waterGeo, waterMat);
    waterMesh.rotation.x = -Math.PI / 2;
    waterMesh.position.y = -3.8;
    scene.add(waterMesh);

    // Store original plane vertices for ripple animation
    const waterPosAttr = waterGeo.attributes.position;
    const initialZ = new Float32Array(waterPosAttr.count);
    for (let i = 0; i < waterPosAttr.count; i++) {
      initialZ[i] = waterPosAttr.getZ(i);
    }

    // 5. Brutalist Monolithic Architectural Framing Columns (Left & Right)
    const pillarGeo = new THREE.BoxGeometry(4.5, 30, 7);
    const pillarMat = new THREE.MeshStandardMaterial({
      color: 0x090910,
      roughness: 0.9,
      metalness: 0.2,
    });

    const leftPillar = new THREE.Mesh(pillarGeo, pillarMat);
    leftPillar.position.set(-15, 4, -4);
    scene.add(leftPillar);

    const rightPillar = new THREE.Mesh(pillarGeo, pillarMat);
    rightPillar.position.set(15, 4, -4);
    scene.add(rightPillar);

    // 6. Dynamic Lights: Golden Spotlight on Shrine + Ambient Volumetric Fill
    const ambientLight = new THREE.AmbientLight(0x0e0e1a, 1.2);
    scene.add(ambientLight);

    const goldCoreLight = new THREE.PointLight(0xffbe3b, 4.5, 25);
    goldCoreLight.position.set(0, 1.5, -4.5);
    scene.add(goldCoreLight);

    const cyanRimLight = new THREE.PointLight(0x00f0ff, 2.5, 30);
    cyanRimLight.position.set(-12, 6, 2);
    scene.add(cyanRimLight);

    const magentaRimLight = new THREE.PointLight(0xa855f7, 2.5, 30);
    magentaRimLight.position.set(12, -2, 2);
    scene.add(magentaRimLight);

    // 7. Mouse Interaction with Fluid Spring Inertia
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouse.targetX = x * 1.8;
      mouse.targetY = y * 0.9;
    };

    if (interactive) {
      window.addEventListener('mousemove', handleMouseMove);
    }

    // 8. Resize Handler
    const handleResize = () => {
      if (!container) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    // 9. Animation Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Mouse inertia spring interpolation
      mouse.x += (mouse.targetX - mouse.x) * 0.045;
      mouse.y += (mouse.targetY - mouse.y) * 0.045;

      // Camera parallax
      camera.position.x = mouse.x * 1.4;
      camera.position.y = 1.8 + mouse.y * 0.7;
      camera.lookAt(0, 0.8, -2);

      // Stardust cosmic drift
      stardustMesh.rotation.y = elapsedTime * 0.03 + mouse.x * 0.08;
      stardustMesh.rotation.x = Math.sin(elapsedTime * 0.02) * 0.05 + mouse.y * 0.05;

      // Shrine Gyro Rig Rotation
      shrineGroup.rotation.y = elapsedTime * 0.12 + mouse.x * 0.25;
      topRing.rotation.z = -elapsedTime * 0.18;
      bottomRing.rotation.z = elapsedTime * 0.18;

      // Animate Living Organic Torus Particles (Pulse & Spiral)
      const positions = organicTorusMesh.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < torusCount; i++) {
        const u = baseTheta[i] + elapsedTime * 0.35;
        const v = basePhi[i] + Math.sin(elapsedTime * 0.6 + u) * 0.4;
        const pulse = 1 + Math.sin(elapsedTime * 1.5 + u * 2) * 0.08;

        const x = (majorR * pulse + minorR * Math.cos(v)) * Math.cos(u);
        const y = (majorR * pulse + minorR * Math.cos(v)) * Math.sin(u) * 0.85;
        const z = minorR * Math.sin(v);

        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;
      }
      organicTorusMesh.geometry.attributes.position.needsUpdate = true;

      // Animate Water Ripple Waves
      for (let i = 0; i < waterPosAttr.count; i++) {
        const vx = waterPosAttr.getX(i);
        const vy = waterPosAttr.getY(i);
        const wave = Math.sin(vx * 0.35 + elapsedTime * 1.8) * Math.cos(vy * 0.35 + elapsedTime * 1.5) * 0.18;
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
      pillarGeo.dispose();
      pillarMat.dispose();
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
        background: 'radial-gradient(ellipse at 50% 25%, #0e0e1c 0%, #06060c 60%, #020205 100%)',
      }}
    />
  );
};
