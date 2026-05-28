"use client";

import { useEffect, useRef } from "react";

interface ChartPoint {
  multiplier: number;
}

interface CrashChartProps {
  points: ChartPoint[];
  crashed: boolean;
  exploded?: boolean;
  autoCashoutMultiplier?: number | null;
  onRocketPosition?: (pos: { x: number; y: number; angle: number } | null) => void;
}

export function CrashChart({
  points,
  crashed,
  exploded = false,
  autoCashoutMultiplier = null,
  onRocketPosition,
}: CrashChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const draw = () => {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      const width = container.clientWidth;
      const height = container.clientHeight;

      if (width === 0 || height === 0) return;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      const padding = 20;
      const gridStep = 30;

      ctx.strokeStyle = "rgba(26, 51, 96, 0.45)";
      ctx.lineWidth = 1;
      for (let x = padding; x < width; x += gridStep) {
        ctx.beginPath();
        ctx.moveTo(x, padding);
        ctx.lineTo(x, height - padding);
        ctx.stroke();
      }
      for (let y = padding; y < height; y += gridStep) {
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
        ctx.stroke();
      }

      const maxM = Math.max(
        ...points.map((p) => p.multiplier),
        autoCashoutMultiplier ?? 0,
        2,
      );

      const toX = (index: number, total: number) =>
        padding + (index / Math.max(total - 1, 1)) * (width - padding * 2);
      const toY = (m: number) =>
        height - padding - (m / maxM) * (height - padding * 2);

      if (autoCashoutMultiplier && autoCashoutMultiplier > 1) {
        const y = toY(autoCashoutMultiplier);
        ctx.setLineDash([6, 6]);
        ctx.strokeStyle = "rgba(249, 115, 22, 0.45)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      if (points.length < 2) {
        onRocketPosition?.(null);
        return;
      }

      const coords = points.map((point, i) => ({
        x: toX(i, points.length),
        y: toY(point.multiplier),
      }));

      const lineGradient = ctx.createLinearGradient(0, height, width, 0);
      if (crashed) {
        lineGradient.addColorStop(0, "#ef4444");
        lineGradient.addColorStop(1, "#f87171");
      } else {
        lineGradient.addColorStop(0, "#f97316");
        lineGradient.addColorStop(1, "#fdba74");
      }

      ctx.shadowColor = crashed
        ? "rgba(239, 68, 68, 0.65)"
        : "rgba(249, 115, 22, 0.75)";
      ctx.shadowBlur = 12;

      ctx.beginPath();
      ctx.strokeStyle = lineGradient;
      ctx.lineWidth = 3;
      ctx.lineJoin = "round";
      ctx.lineCap = "round";

      coords.forEach((coord, i) => {
        if (i === 0) ctx.moveTo(coord.x, coord.y);
        else ctx.lineTo(coord.x, coord.y);
      });

      if (crashed && coords.length > 1) {
        ctx.lineTo(coords[coords.length - 1].x, height - padding);
      }

      ctx.stroke();
      ctx.shadowBlur = 0;

      const fillGradient = ctx.createLinearGradient(0, 0, 0, height);
      fillGradient.addColorStop(
        0,
        crashed ? "rgba(239,68,68,0.2)" : "rgba(249,115,22,0.25)",
      );
      fillGradient.addColorStop(1, "rgba(6,13,31,0)");
      ctx.lineTo(coords[coords.length - 1].x, height - padding);
      ctx.lineTo(coords[0].x, height - padding);
      ctx.closePath();
      ctx.fillStyle = fillGradient;
      ctx.fill();

      const last = coords[coords.length - 1];
      const prev = coords[coords.length - 2] ?? last;
      const angle = Math.atan2(last.y - prev.y, last.x - prev.x);

      if (!crashed && !exploded) {
        onRocketPosition?.({ x: last.x, y: last.y, angle });
        ctx.save();
        ctx.translate(last.x, last.y);
        ctx.rotate(angle);
        ctx.shadowColor = "rgba(249, 115, 22, 0.9)";
        ctx.shadowBlur = 14;
        ctx.fillStyle = "#f97316";
        ctx.beginPath();
        ctx.moveTo(16, 0);
        ctx.lineTo(-10, -7);
        ctx.lineTo(-5, 0);
        ctx.lineTo(-10, 7);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      } else if (exploded) {
        onRocketPosition?.(null);
      } else {
        onRocketPosition?.(null);
      }
    };

    const loop = () => {
      draw();
      rafRef.current = requestAnimationFrame(loop);
    };

    loop();

    const observer = new ResizeObserver(draw);
    observer.observe(container);

    return () => {
      observer.disconnect();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [points, crashed, exploded, autoCashoutMultiplier, onRocketPosition]);

  return (
    <div ref={containerRef} className="relative h-full w-full min-h-[220px]">
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  );
}
