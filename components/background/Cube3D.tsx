"use client";

import React, { useEffect, useRef, useState } from "react";
import { useTheme } from "../theme/ThemeProvider";

export function Cube3D() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Rotation angles (degrees)
  const rotationRef = useRef({ x: -18, y: 35 });
  const [displayRotation, setDisplayRotation] = useState({ x: -18, y: 35 });

  // Drag tracking refs
  const dragStartRef = useRef({ x: 0, y: 0, rotX: -18, rotY: 35 });
  const velocityRef = useRef({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);
  const autoRotateRef = useRef(true);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    setMounted(true);

    // Continuous physics loop for auto-rotation and momentum damping
    const updatePhysics = () => {
      if (!isDraggingRef.current) {
        // If momentum exists, apply it with friction
        if (Math.abs(velocityRef.current.x) > 0.01 || Math.abs(velocityRef.current.y) > 0.01) {
          rotationRef.current.y += velocityRef.current.x;
          rotationRef.current.x -= velocityRef.current.y;
          velocityRef.current.x *= 0.94; // Friction damping
          velocityRef.current.y *= 0.94;
        } else if (autoRotateRef.current) {
          // Gentle continuous auto-spin when idle
          rotationRef.current.y += 0.35;
        }
      }

      // Clamp X rotation to avoid flipping upside down
      rotationRef.current.x = Math.max(-85, Math.min(85, rotationRef.current.x));

      setDisplayRotation({
        x: rotationRef.current.x,
        y: rotationRef.current.y,
      });

      animFrameRef.current = requestAnimationFrame(updatePhysics);
    };

    animFrameRef.current = requestAnimationFrame(updatePhysics);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  // Pointer Down (Mouse click or Touch start)
  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    autoRotateRef.current = false;
    setIsDragging(true);

    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      rotX: rotationRef.current.x,
      rotY: rotationRef.current.y,
    };
    velocityRef.current = { x: 0, y: 0 };

    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  // Pointer Move (Dragging)
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;

    const deltaX = e.clientX - dragStartRef.current.x;
    const deltaY = e.clientY - dragStartRef.current.y;

    const sensitivity = 0.55;

    const newRotY = dragStartRef.current.rotY + deltaX * sensitivity;
    const newRotX = Math.max(-85, Math.min(85, dragStartRef.current.rotX - deltaY * sensitivity));

    velocityRef.current = {
      x: (newRotY - rotationRef.current.y) * 0.4,
      y: (rotationRef.current.x - newRotX) * 0.4,
    };

    rotationRef.current.y = newRotY;
    rotationRef.current.x = newRotX;
  };

  // Pointer Up (Release)
  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      setIsDragging(false);
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch (_) {}

      // Resume gentle auto-rotate after 3.5 seconds of inactivity
      setTimeout(() => {
        if (!isDraggingRef.current) {
          autoRotateRef.current = true;
        }
      }, 3500);
    }
  };

  const isDark = mounted ? theme === "dark" : true;
  const cubeSize = 130; // 130px face size
  const halfSize = cubeSize / 2; // 65px translateZ

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className={`relative flex items-center justify-center select-none py-6 transition-all duration-300 touch-none ${
        isDragging ? "cursor-grabbing" : "cursor-grab"
      }`}
      style={{
        perspective: "1200px",
        width: "280px",
        height: "280px",
      }}
    >
      {/* Realistic Shadow */}
      <div
        className="absolute -bottom-2 w-32 h-6 rounded-full bg-black/10 dark:bg-black/60 blur-md pointer-events-none"
      />

      {/* 3D Manipulable Cube Canvas */}
      <div
        className="cube-scene relative"
        style={{
          width: `${cubeSize}px`,
          height: `${cubeSize}px`,
          transformStyle: "preserve-3d",
          transform: `rotateX(${displayRotation.x}deg) rotateY(${displayRotation.y}deg)`,
          transition: isDragging ? "none" : "transform 0.05s ease-out",
        }}
      >
        {/* Face 1: Front (.box Brand) */}
        <div
          className={`cube-face absolute inset-0 flex flex-col items-center justify-center rounded-xl font-mono transition-colors duration-300 ${
            isDark
              ? "bg-zinc-950 border border-zinc-700 text-zinc-100 shadow-md"
              : "bg-white border border-zinc-300 text-zinc-950 shadow-md"
          }`}
          style={{ transform: `translateZ(${halfSize}px)` }}
        >
          <span className="text-xl tracking-widest uppercase font-black">.box</span>
          <span className="text-[10px] text-zinc-400 tracking-wider font-sans mt-0.5">universal</span>
        </div>

        {/* Face 2: Back (Zstandard Fast Stream) */}
        <div
          className={`cube-face absolute inset-0 flex flex-col items-center justify-center rounded-xl font-mono transition-colors duration-300 ${
            isDark
              ? "bg-zinc-950 border border-zinc-700 text-zinc-100 shadow-md"
              : "bg-white border border-zinc-300 text-zinc-950 shadow-md"
          }`}
          style={{ transform: `rotateY(180deg) translateZ(${halfSize}px)` }}
        >
          <span className="text-sm font-bold text-orange-500 tracking-wider">ZSTD</span>
          <span className="text-[10px] text-zinc-400 font-sans mt-1">Level C Fast</span>
        </div>

        {/* Face 3: Right (SHA-256 Fast Integrity) */}
        <div
          className={`cube-face absolute inset-0 flex flex-col items-center justify-center rounded-xl font-mono transition-colors duration-300 ${
            isDark
              ? "bg-zinc-950 border border-zinc-700 text-zinc-100 shadow-md"
              : "bg-white border border-zinc-300 text-zinc-950 shadow-md"
          }`}
          style={{ transform: `rotateY(90deg) translateZ(${halfSize}px)` }}
        >
          <span className="text-xs font-bold text-emerald-500 tracking-wider">SHA-256</span>
          <span className="text-[10px] text-zinc-400 font-sans mt-1">Hermétique</span>
        </div>

        {/* Face 4: Left (Rust Core) */}
        <div
          className={`cube-face absolute inset-0 flex flex-col items-center justify-center rounded-xl font-mono transition-colors duration-300 ${
            isDark
              ? "bg-zinc-950 border border-zinc-700 text-zinc-100 shadow-md"
              : "bg-white border border-zinc-300 text-zinc-950 shadow-md"
          }`}
          style={{ transform: `rotateY(-90deg) translateZ(${halfSize}px)` }}
        >
          <span className="text-sm font-bold text-amber-500 tracking-wider">RUST</span>
          <span className="text-[10px] text-zinc-400 font-sans mt-1">Core Natif</span>
        </div>

        {/* Face 5: Top (Engine Apex) */}
        <div
          className={`cube-face absolute inset-0 flex flex-col items-center justify-center rounded-xl font-mono transition-colors duration-300 ${
            isDark
              ? "bg-zinc-900 border border-zinc-700 text-zinc-100 shadow-md"
              : "bg-zinc-100 border border-zinc-300 text-zinc-950 shadow-md"
          }`}
          style={{ transform: `rotateX(90deg) translateZ(${halfSize}px)` }}
        >
          <div className="w-5 h-5 border border-current rounded-sm rotate-45 flex items-center justify-center mb-1">
            <div className="w-1.5 h-1.5 bg-current rounded-full" />
          </div>
          <span className="text-[9px] font-bold tracking-wider">AUTONOME</span>
        </div>

        {/* Face 6: Bottom */}
        <div
          className={`cube-face absolute inset-0 flex flex-col items-center justify-center rounded-xl font-mono transition-colors duration-300 ${
            isDark
              ? "bg-zinc-950 border border-zinc-700 text-zinc-400"
              : "bg-zinc-200 border border-zinc-300 text-zinc-700"
          }`}
          style={{ transform: `rotateX(-90deg) translateZ(${halfSize}px)` }}
        >
          <span className="text-xs font-bold">v1.0.0</span>
          <span className="text-[9px] text-zinc-400">RELEASE</span>
        </div>
      </div>
    </div>
  );
}
