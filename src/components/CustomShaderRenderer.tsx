/**
 * CustomShaderRenderer — WebGL 1.0 renderer for AI-generated and user GLSL shaders.
 *
 * Unlike ShaderRenderer (which runs the official Google M3 energy shader in WebGL2),
 * this component compiles arbitrary WebGL 1.0 fragment shaders with the standard
 * G→Shader uniform set:
 *   u_resolution, u_time, u_mouse, u_color_primary, u_color_secondary, u_speed, u_scale
 */

import React, { useEffect, useRef, useCallback } from 'react';

interface CustomShaderRendererProps {
  shaderCode: string;
  primaryColorHex: string;
  secondaryColorHex: string;
  speed?: number;
  scale?: number;
  width?: number;
  height?: number;
  className?: string;
  isActive?: boolean;
  onError?: (msg: string) => void;
}

function hexToVec3(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const n = parseInt(clean.length === 3
    ? clean.split('').map(c => c + c).join('')
    : clean, 16);
  if (isNaN(n)) return [0.1, 0.1, 0.1];
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

const VERTEX_SRC = `
  attribute vec2 a_position;
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

export default function CustomShaderRenderer({
  shaderCode, primaryColorHex, secondaryColorHex,
  speed = 1.0, scale = 1.0,
  width = 400, height = 300,
  className = '',
  isActive = true,
  onError,
}: CustomShaderRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const rafRef = useRef<number>(0);
  const startTimeRef = useRef<number>(performance.now());
  const mouseRef = useRef<[number, number]>([0.5, 0.5]);
  const mountedRef = useRef(true);

  // Compile + link shader program
  const buildProgram = useCallback((gl: WebGLRenderingContext, fragSrc: string): WebGLProgram | null => {
    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        const info = gl.getShaderInfoLog(s) || 'Unknown compile error';
        onError?.(info);
        gl.deleteShader(s);
        return null;
      }
      return s;
    };

    const vs = compile(gl.VERTEX_SHADER, VERTEX_SRC);
    const fs = compile(gl.FRAGMENT_SHADER, fragSrc);
    if (!vs || !fs) return null;

    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);

    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      const info = gl.getProgramInfoLog(prog) || 'Unknown link error';
      onError?.(info);
      return null;
    }
    return prog;
  }, [onError]);

  // Full GL setup
  useEffect(() => {
    mountedRef.current = true;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) { onError?.('WebGL not supported'); return; }
    glRef.current = gl as WebGLRenderingContext;

    const program = buildProgram(gl as WebGLRenderingContext, shaderCode);
    if (!program) return;
    programRef.current = program;

    // Full-screen quad
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);

    const posLoc = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    startTimeRef.current = performance.now();

    const tick = () => {
      if (!mountedRef.current) return;
      if (!isActive) { rafRef.current = requestAnimationFrame(tick); return; }

      const elapsed = (performance.now() - startTimeRef.current) / 1000;
      const g = gl as WebGLRenderingContext;
      const prog = programRef.current;
      if (!prog) return;

      g.viewport(0, 0, canvas.width, canvas.height);
      g.useProgram(prog);

      const setUniform = (name: string, fn: (loc: WebGLUniformLocation) => void) => {
        const loc = g.getUniformLocation(prog, name);
        if (loc !== null) fn(loc);
      };

      setUniform('u_resolution', loc => g.uniform2f(loc, canvas.width, canvas.height));
      setUniform('u_time',       loc => g.uniform1f(loc, elapsed));
      setUniform('u_mouse',      loc => g.uniform2f(loc, mouseRef.current[0], mouseRef.current[1]));
      setUniform('u_speed',      loc => g.uniform1f(loc, speed));
      setUniform('u_scale',      loc => g.uniform1f(loc, scale));

      const [pr, pg, pb] = hexToVec3(primaryColorHex);
      const [sr, sg, sb] = hexToVec3(secondaryColorHex);
      setUniform('u_color_primary',   loc => g.uniform3f(loc, pr, pg, pb));
      setUniform('u_color_secondary', loc => g.uniform3f(loc, sr, sg, sb));

      g.drawArrays(g.TRIANGLE_STRIP, 0, 4);
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      mountedRef.current = false;
      cancelAnimationFrame(rafRef.current);
    };
  // Recompile when shaderCode changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shaderCode, isActive]);

  // Mouse tracking
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseRef.current = [
      (e.clientX - rect.left) / rect.width,
      1.0 - (e.clientY - rect.top) / rect.height,
    ];
  }, []);

  // Uniform updates without re-compiling
  useEffect(() => {
    // Colors/speed/scale are read each frame from props via closure — no extra work needed
  }, [primaryColorHex, secondaryColorHex, speed, scale]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className={className}
      onMouseMove={handleMouseMove}
      style={{ display: 'block' }}
    />
  );
}
