"use client";

import React, { useEffect, useRef } from "react";
import { useTheme } from "../theme/ThemeProvider";

interface Particle {
  x: number;
  y: number;
  angle: number;
  radius: number;
  speed: number;
  size: number;
  opacity: number;
  color: string;
}

export function BlackHoleBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight * 1.5); // Spans hero et upper page

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = Math.max(window.innerHeight * 1.5, 1200);
      initParticles();
    };

    window.addEventListener("resize", handleResize);

    const isDark = theme === "dark";

    // The Box cube is the singularity (~55px radius for 120px cube)
    const boxSingularityRadius = 55;

    // Color palettes for the accretion disk particles
    const darkPalette = [
      "rgba(0, 240, 255, ", // Electric Cyan
      "rgba(99, 102, 241, ", // Indigo
      "rgba(139, 92, 246, ", // Violet
      "rgba(16, 185, 129, ", // Emerald
      "rgba(255, 255, 255, ", // Bright white photon
    ];

    const lightPalette = [
      "rgba(37, 99, 235, ", // Royal Blue
      "rgba(2, 132, 199, ", // Cyan Blue
      "rgba(79, 70, 229, ", // Deep Indigo
      "rgba(15, 23, 42, ", // Slate Dark
      "rgba(100, 116, 139, ", // Muted Slate
    ];

    const palette = isDark ? darkPalette : lightPalette;

    let particles: Particle[] = [];
    const numParticles = 320;

    function initParticles() {
      particles = [];
      const maxDist = Math.max(width, height) * 0.6;
      for (let i = 0; i < numParticles; i++) {
        const radius = boxSingularityRadius + 15 + Math.random() * maxDist;
        const angle = Math.random() * Math.PI * 2;
        const speed = (0.005 + (1.5 / (radius * 0.18))) * 0.75;
        const colorPrefix = palette[Math.floor(Math.random() * palette.length)];

        particles.push({
          x: 0,
          y: 0,
          angle,
          radius,
          speed,
          size: Math.random() * 2.5 + 0.8,
          opacity: Math.random() * 0.85 + 0.15,
          color: colorPrefix,
        });
      }
    }

    initParticles();

    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = (e.clientX - width / 2) * 0.04;
      targetMouseY = (e.clientY - window.innerHeight / 2) * 0.04;
    };

    window.addEventListener("mousemove", handleMouseMove);

    let currentCx = width / 2;
    let currentCy = 260;
    let tick = 0;

    const render = () => {
      tick += 0.012;
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      // Locate the exact anchor of the 3D Box in page space
      const cubeAnchor = document.getElementById("hero-cube-anchor");
      if (cubeAnchor) {
        const rect = cubeAnchor.getBoundingClientRect();
        // Calculate position relative to the top of the canvas
        const pageTop = window.scrollY;
        const targetX = rect.left + rect.width / 2;
        const targetY = rect.top + pageTop + rect.height / 2;
        currentCx += (targetX - currentCx) * 0.1;
        currentCy += (targetY - currentCy) * 0.1;
      } else {
        currentCx = width / 2;
        currentCy = 260;
      }

      const cx = currentCx + mouseX;
      const cy = currentCy + mouseY;

      ctx.clearRect(0, 0, width, height);

      // 1. Atmospheric Ambient Radial Energy Field
      const bgGrad = ctx.createRadialGradient(
        cx,
        cy,
        30,
        cx,
        cy,
        Math.max(width, height) * 0.6
      );
      if (isDark) {
        bgGrad.addColorStop(0, "rgba(6, 182, 212, 0.18)");
        bgGrad.addColorStop(0.2, "rgba(99, 102, 241, 0.08)");
        bgGrad.addColorStop(0.5, "rgba(0, 0, 0, 0)");
        bgGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
      } else {
        bgGrad.addColorStop(0, "rgba(37, 99, 235, 0.12)");
        bgGrad.addColorStop(0.25, "rgba(14, 165, 233, 0.05)");
        bgGrad.addColorStop(0.6, "rgba(255, 255, 255, 0)");
        bgGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
      }
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Accretion Disk Elliptical Orbits
      const ringTilt = 0.36; // 3D tilt perspective
      const rings = [
        { r: boxSingularityRadius + 30, alpha: isDark ? 0.35 : 0.15, width: 1.5, dash: [4, 6] },
        { r: boxSingularityRadius + 75, alpha: isDark ? 0.25 : 0.1, width: 1.2, dash: [6, 8] },
        { r: boxSingularityRadius + 130, alpha: isDark ? 0.18 : 0.07, width: 1, dash: [8, 12] },
        { r: boxSingularityRadius + 210, alpha: isDark ? 0.12 : 0.05, width: 0.8, dash: [10, 16] },
        { r: boxSingularityRadius + 320, alpha: isDark ? 0.06 : 0.02, width: 0.7, dash: [12, 20] },
      ];

      rings.forEach((ring, idx) => {
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(cx, cy, ring.r, ring.r * ringTilt, -0.22, 0, Math.PI * 2);
        ctx.strokeStyle = isDark
          ? idx % 2 === 0
            ? `rgba(0, 240, 255, ${ring.alpha})`
            : `rgba(139, 92, 246, ${ring.alpha})`
          : `rgba(37, 99, 235, ${ring.alpha})`;
        ctx.lineWidth = ring.width;
        ctx.setLineDash(ring.dash);
        ctx.stroke();
        ctx.restore();
      });

      // 3. Gravitational Spiral Arms converging into the Box
      const numStreams = 4;
      for (let s = 0; s < numStreams; s++) {
        const streamAngle = (s * (Math.PI * 2)) / numStreams + tick * 0.35;
        ctx.beginPath();
        for (let step = 0; step < 50; step++) {
          const r = boxSingularityRadius + 10 + step * 8;
          const theta = streamAngle + step * 0.11;
          const px = cx + Math.cos(theta) * r;
          const py = cy + Math.sin(theta) * (r * ringTilt);
          if (step === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.strokeStyle = isDark
          ? `rgba(0, 240, 255, ${0.1 - s * 0.015})`
          : `rgba(37, 99, 235, ${0.07 - s * 0.01})`;
        ctx.lineWidth = 1.4;
        ctx.stroke();
      }

      // 4. Swirling Relativistic Particles
      particles.forEach((p) => {
        p.angle += p.speed;
        p.radius -= 0.18; // Constant inward gravitational pull

        // Respawn when reaching the Box
        if (p.radius <= boxSingularityRadius) {
          p.radius =
            boxSingularityRadius +
            90 +
            Math.random() * (Math.max(width, height) * 0.5);
          p.speed = (0.005 + (1.5 / (p.radius * 0.18))) * 0.75;
          p.opacity = Math.random() * 0.85 + 0.15;
        }

        const doppler = Math.sin(p.angle) * 0.35 + 0.65;
        const proximityFade = Math.min((p.radius - boxSingularityRadius) / 35, 1);

        p.x = cx + Math.cos(p.angle) * p.radius;
        p.y = cy + Math.sin(p.angle) * (p.radius * ringTilt);

        // Trail
        const trailX = cx + Math.cos(p.angle - p.speed * 2) * (p.radius + 1.5);
        const trailY = cy + Math.sin(p.angle - p.speed * 2) * ((p.radius + 1.5) * ringTilt);

        ctx.beginPath();
        ctx.moveTo(trailX, trailY);
        ctx.lineTo(p.x, p.y);
        ctx.strokeStyle = `${p.color}${p.opacity * doppler * proximityFade * 0.4})`;
        ctx.lineWidth = p.size * 0.8;
        ctx.stroke();

        // Particle Head
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * doppler, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${p.opacity * doppler * proximityFade})`;
        if (isDark) {
          ctx.shadowColor = "#00f0ff";
          ctx.shadowBlur = 5;
        }
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute top-0 left-0 z-0 w-full opacity-95 transition-opacity duration-700"
      style={{ height: "100%" }}
      aria-hidden="true"
    />
  );
}
