"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { canRunShader, capabilityStore } from "@/lib/motion";

const VERTEX = `
attribute vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

export type ShaderCanvasProps = {
  /** Fragment shader source. Gets u_time, u_res, u_pointer (0..1), u_scroll, u_colors[4]. */
  fragment: string;
  /** Four glaze hexes fed to u_colors. */
  colors: [string, string, string, string];
  className?: string;
  /** Always rendered beneath the canvas — the static stand-in when WebGL is
   *  unavailable, motion is reduced, or the frame budget forces a demotion. */
  fallback?: React.ReactNode;
};

/**
 * A single fullscreen-triangle WebGL quad. Runs only when `canRunShader()`
 * allows it; pauses offscreen and while the tab is hidden; caps DPR (1.75
 * fine-pointer / 1.0 touch); and permanently demotes itself to the fallback
 * if the first 30 frames average over ~24ms — kiln-shelf phones get the
 * gradient, not a slideshow.
 */
export function ShaderCanvas({ fragment, colors, className, fallback }: ShaderCanvasProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const allowed = useSyncExternalStore(
    capabilityStore.subscribe,
    canRunShader,
    capabilityStore.server,
  );
  const [demoted, setDemoted] = useState(false);
  const phase = allowed && !demoted ? "running" : "demoted";

  useEffect(() => {
    if (phase !== "running") return;
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    const gl = canvas.getContext("webgl", {
      alpha: false,
      antialias: false,
      powerPreference: "low-power",
    });
    if (!gl) {
      setDemoted(true);
      return;
    }

    // -- compile --------------------------------------------------------
    const compile = (type: number, src: string) => {
      const sh = gl.createShader(type)!;
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        console.error("[ShaderCanvas]", gl.getShaderInfoLog(sh));
        return null;
      }
      return sh;
    };
    const vs = compile(gl.VERTEX_SHADER, VERTEX);
    const fs = compile(gl.FRAGMENT_SHADER, fragment);
    if (!vs || !fs) {
      setDemoted(true);
      return;
    }
    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW,
    );
    const loc = gl.getAttribLocation(prog, "a_pos");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(prog, "u_time");
    const uRes = gl.getUniformLocation(prog, "u_res");
    const uPointer = gl.getUniformLocation(prog, "u_pointer");
    const uScroll = gl.getUniformLocation(prog, "u_scroll");
    const uColors = gl.getUniformLocation(prog, "u_colors");
    gl.uniform3fv(uColors, colors.flatMap(hexToRgb));

    // -- sizing ---------------------------------------------------------
    const touch = window.matchMedia("(pointer: coarse)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, touch ? 1 : 1.75);
    const resize = () => {
      const w = Math.max(1, Math.round(wrap.clientWidth * dpr));
      const h = Math.max(1, Math.round(wrap.clientHeight * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    // -- pointer (lerped in the loop) ------------------------------------
    const target = { x: 0.5, y: 0.5 };
    const pointer = { x: 0.5, y: 0.5 };
    const onMove = (e: PointerEvent) => {
      const r = wrap.getBoundingClientRect();
      target.x = (e.clientX - r.left) / Math.max(1, r.width);
      target.y = 1 - (e.clientY - r.top) / Math.max(1, r.height);
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    // -- loop with pause + demotion --------------------------------------
    let raf = 0;
    let onscreen = true;
    let last = performance.now();
    const start = last;
    let frames = 0;
    let slowMs = 0;
    let dead = false;

    const frame = (now: number) => {
      raf = 0;
      const dt = now - last;
      last = now;

      // First-30-frame budget check (ignore the compile-heavy first frame).
      if (frames > 0 && frames <= 30) {
        slowMs += dt;
        if (frames === 30 && slowMs / 30 > 24) {
          dead = true;
          setDemoted(true);
          return;
        }
      }
      frames++;

      pointer.x += (target.x - pointer.x) * 0.06;
      pointer.y += (target.y - pointer.y) * 0.06;

      gl.uniform1f(uTime, (now - start) / 1000);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform2f(uPointer, pointer.x, pointer.y);
      gl.uniform1f(uScroll, Math.min(1, window.scrollY / window.innerHeight));
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      if (onscreen && !document.hidden) raf = requestAnimationFrame(frame);
    };
    const play = () => {
      if (!raf && !dead && onscreen && !document.hidden) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    };

    const io = new IntersectionObserver(([entry]) => {
      onscreen = entry.isIntersecting;
      if (onscreen) play();
    });
    io.observe(wrap);
    const onVis = () => play();
    document.addEventListener("visibilitychange", onVis);
    play();

    return () => {
      if (raf) cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("visibilitychange", onVis);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, [phase, fragment, colors]);

  return (
    <div ref={wrapRef} className={className} aria-hidden>
      {fallback}
      {phase === "running" && (
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      )}
    </div>
  );
}
