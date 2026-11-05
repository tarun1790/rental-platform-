'use client';

import React, { useEffect, useState } from 'react';

export const CinematicReticle: React.FC = () => {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [target, setTarget] = useState({ x: -100, y: -100 });
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setTarget({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);

      const targetEl = e.target as HTMLElement | null;
      if (targetEl && (targetEl.closest('button') || targetEl.closest('a') || targetEl.closest('[role="button"]') || targetEl.closest('.cursor-pointer'))) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.body.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.body.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isVisible]);

  // Smooth lerp loop
  useEffect(() => {
    let animId: number;
    const updateLerp = () => {
      setPos((prev) => ({
        x: prev.x + (target.x - prev.x) * 0.22,
        y: prev.y + (target.y - prev.y) * 0.22,
      }));
      animId = requestAnimationFrame(updateLerp);
    };
    animId = requestAnimationFrame(updateLerp);
    return () => cancelAnimationFrame(animId);
  }, [target]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden hidden md:block">
      {/* Outer Reticle Ring (Lerped) */}
      <div
        className="absolute rounded-full border transition-[width,height,border-color,background-color] duration-200 -translate-x-1/2 -translate-y-1/2"
        style={{
          left: `${pos.x}px`,
          top: `${pos.y}px`,
          width: isHovering ? '48px' : '28px',
          height: isHovering ? '48px' : '28px',
          borderColor: isHovering ? 'rgba(226, 177, 112, 0.8)' : 'rgba(255, 255, 255, 0.25)',
          backgroundColor: isHovering ? 'rgba(226, 177, 112, 0.08)' : 'transparent',
          boxShadow: isHovering ? '0 0 20px rgba(226, 177, 112, 0.3)' : 'none',
        }}
      />

      {/* Center Target Dot (Instant Position) */}
      <div
        className="absolute w-1.5 h-1.5 rounded-full bg-[#e2b170] -translate-x-1/2 -translate-y-1/2 transition-transform duration-100"
        style={{
          left: `${target.x}px`,
          top: `${target.y}px`,
          transform: isHovering ? 'translate(-50%, -50%) scale(1.6)' : 'translate(-50%, -50%) scale(1)',
        }}
      />
    </div>
  );
};
