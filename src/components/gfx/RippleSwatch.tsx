"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { canRunShader, capabilityStore } from "@/lib/motion";

/**
 * The "dip": a fired-tile photo behind a 2-buffer height-field ripple.
 * Pointer-over and taps drop ripples; an ambient drip lands every few
 * seconds. Simulated at 1/3 resolution and refracted into the photo.
 * When effects can't run, it's simply the photo.
 */
export function RippleSwatch({
  src,
  className,
}: {
  /** Fired-tile photo URL (e.g. /glazes/oribe-6.jpg). */
  src: string;
  className?: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const live = useSyncExternalStore(
    capabilityStore.subscribe,
    canRunShader,
    capabilityStore.server,
  );

  useEffect(() => {
    if (!live) return;
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let onscreen = true;
    let disposed = false;

    // sim state (created once the image loads)
    let W = 0;
    let H = 0;
    let prev: Float32Array;
    let cur: Float32Array;
    let srcData: Uint8ClampedArray;
    let out: ImageData;
    let sim: CanvasRenderingContext2D;

    const drop = (x: number, y: number, r = 3, strength = 240) => {
      for (let j = -r; j <= r; j++) {
        for (let i = -r; i <= r; i++) {
          if (i * i + j * j > r * r) continue;
          const px = Math.round(x) + i;
          const py = Math.round(y) + j;
          if (px < 1 || py < 1 || px >= W - 1 || py >= H - 1) continue;
          cur[py * W + px] = strength;
        }
      }
    };

    const img = new Image();
    img.src = src;
    img.onload = () => {
      if (disposed) return;
      const rect = wrap.getBoundingClientRect();
      // display canvas at ~device size, sim at 1/3
      canvas.width = Math.max(2, Math.round(rect.width));
      canvas.height = Math.max(2, Math.round(rect.height));
      W = Math.max(2, Math.round(canvas.width / 3));
      H = Math.max(2, Math.round(canvas.height / 3));

      const simCanvas = document.createElement("canvas");
      simCanvas.width = W;
      simCanvas.height = H;
      sim = simCanvas.getContext("2d", { willReadFrequently: true })!;
      // cover-fit the photo into the sim buffer
      const s = Math.max(W / img.width, H / img.height);
      const dw = img.width * s;
      const dh = img.height * s;
      sim.drawImage(img, (W - dw) / 2, (H - dh) / 2, dw, dh);
      srcData = sim.getImageData(0, 0, W, H).data;
      out = sim.createImageData(W, H);
      prev = new Float32Array(W * H);
      cur = new Float32Array(W * H);

      drop(W / 2, H / 2, 4); // opening splash
      play();
    };

    const step = () => {
      // classic two-buffer wave propagation with damping
      for (let y = 1; y < H - 1; y++) {
        const row = y * W;
        for (let x = 1; x < W - 1; x++) {
          const i = row + x;
          const v =
            (cur[i - 1] + cur[i + 1] + cur[i - W] + cur[i + W]) / 2 - prev[i];
          prev[i] = v * 0.985;
        }
      }
      const t = prev;
      prev = cur;
      cur = t;

      // refract the photo through the height field + a wet specular
      const d = out.data;
      for (let y = 1; y < H - 1; y++) {
        const row = y * W;
        for (let x = 1; x < W - 1; x++) {
          const i = row + x;
          const gx = cur[i - 1] - cur[i + 1];
          const gy = cur[i - W] - cur[i + W];
          let sx = x + (gx * 0.06 | 0);
          let sy = y + (gy * 0.06 | 0);
          if (sx < 0) sx = 0; else if (sx >= W) sx = W - 1;
          if (sy < 0) sy = 0; else if (sy >= H) sy = H - 1;
          const si = (sy * W + sx) * 4;
          const oi = i * 4;
          const shade = gx * 0.16 + gy * 0.1;
          d[oi] = srcData[si] + shade;
          d[oi + 1] = srcData[si + 1] + shade;
          d[oi + 2] = srcData[si + 2] + shade;
          d[oi + 3] = 255;
        }
      }
      sim.putImageData(out, 0, 0);
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(sim.canvas, 0, 0, W, H, 0, 0, canvas.width, canvas.height);
    };

    let lastDrip = performance.now();
    const frame = (now: number) => {
      raf = 0;
      if (now - lastDrip > 4200) {
        lastDrip = now;
        drop(1 + Math.random() * (W - 2), 1 + Math.random() * (H - 2), 2, 180);
      }
      step();
      if (onscreen && !document.hidden) raf = requestAnimationFrame(frame);
    };
    const play = () => {
      if (!raf && W && onscreen && !document.hidden) raf = requestAnimationFrame(frame);
    };

    const toSim = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      return {
        x: ((e.clientX - r.left) / r.width) * W,
        y: ((e.clientY - r.top) / r.height) * H,
      };
    };
    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const { x, y } = toSim(e);
      drop(x, y, 1.5, 90);
    };
    const onPointerDown = (e: PointerEvent) => {
      const { x, y } = toSim(e);
      drop(x, y, 4, 300);
    };
    canvas.addEventListener("pointermove", onPointerMove, { passive: true });
    canvas.addEventListener("pointerdown", onPointerDown, { passive: true });

    const io = new IntersectionObserver(([entry]) => {
      onscreen = entry.isIntersecting;
      if (onscreen) play();
    });
    io.observe(wrap);
    const onVis = () => play();
    document.addEventListener("visibilitychange", onVis);

    return () => {
      disposed = true;
      if (raf) cancelAnimationFrame(raf);
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerdown", onPointerDown);
    };
  }, [live, src]);

  return (
    <div
      ref={wrapRef}
      className={className}
      style={{ background: `url('${src}') center/cover` }}
      aria-hidden
    >
      {live && <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />}
    </div>
  );
}
