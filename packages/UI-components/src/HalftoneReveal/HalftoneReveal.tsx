'use client';

import React, { useEffect, useRef } from 'react';
import type { CSSProperties } from 'react';
import { Renderer, Program, Mesh, Triangle, Texture } from 'ogl';
import './HalftoneReveal.css';

export interface HalftoneRevealProps {
  src?: string;
  dotSize?: number;
  dotDensity?: number;
  revealRadius?: number;
  softness?: number;
  reverse?: boolean;
  inkColor?: string;
  paperColor?: string;
  contrast?: number;
  brightness?: number;
  fit?: 'contain' | 'cover';
  className?: string;
  style?: CSSProperties;
}

const vertex = `#version 300 es
in vec2 position;
in vec2 uv;
out vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const fragment = `#version 300 es
precision highp float;

uniform sampler2D tImage;
uniform vec2 uResolution;
uniform vec2 uMouse;
uniform float uRadius;
uniform float uSoftness;
uniform float uDotSize;
uniform float uReverse;
uniform vec3 uInkColor;
uniform vec3 uPaperColor;
uniform float uContrast;
uniform float uBrightness;
uniform vec2 uCover;

in vec2 vUv;
out vec4 fragColor;

mat2 rotate(float a) {
  float s = sin(a);
  float c = cos(a);
  return mat2(c, -s, s, c);
}

void main() {
  // Compute UV with cover fit
  vec2 uv = (vUv - 0.5) * uCover + 0.5;
  vec4 imageColor = texture(tImage, uv);

  // Apply contrast and brightness
  vec3 rgb = imageColor.rgb;
  rgb = (rgb - 0.5) * uContrast + 0.5 + (uBrightness - 1.0);
  rgb = clamp(rgb, 0.0, 1.0);

  // Luminance
  float lum = dot(rgb, vec3(0.299, 0.587, 0.114));

  // Halftone Grid rotated 45 degrees
  vec2 coord = vUv * uResolution;
  vec2 rotCoord = rotate(0.785398) * coord;
  vec2 grid = mod(rotCoord, uDotSize) - uDotSize * 0.5;
  float distToDot = length(grid);

  // Halftone Dot Radius based on tone
  float maxRadius = uDotSize * 0.7071;
  float dotRadius = maxRadius * sqrt(clamp(1.0 - lum, 0.0, 1.0));
  float dotMask = smoothstep(dotRadius - 0.75, dotRadius + 0.75, distToDot);

  // Halftone composite color
  vec3 halftoneColor = mix(uInkColor, uPaperColor, dotMask);

  // Distance to cursor
  vec2 p = vUv * uResolution;
  float d = length(p - uMouse);
  float reveal = smoothstep(uRadius + uSoftness, uRadius - uSoftness, d);

  // If reverse is true: halftone outside, original photo revealed inside cursor
  // If reverse is false: original photo outside, halftone revealed inside cursor
  float mixFactor = (uReverse > 0.5) ? reveal : (1.0 - reveal);
  vec3 finalColor = mix(halftoneColor, imageColor.rgb, mixFactor);

  fragColor = vec4(finalColor, 1.0);
}
`;

const parseHex = (hex: string): [number, number, number] => {
  const c = hex.replace('#', '').trim();
  if (c.length === 3) {
    return [
      parseInt(c[0] + c[0], 16) / 255,
      parseInt(c[1] + c[1], 16) / 255,
      parseInt(c[2] + c[2], 16) / 255,
    ];
  }
  return [
    parseInt(c.slice(0, 2), 16) / 255,
    parseInt(c.slice(2, 4), 16) / 255,
    parseInt(c.slice(4, 6), 16) / 255,
  ];
};

const HalftoneReveal: React.FC<HalftoneRevealProps> = ({
  src = '/assets/love-wedding.jpg',
  dotSize = 10,
  dotDensity,
  revealRadius = 140,
  softness = 50,
  reverse = true,
  inkColor = '#5B1621',
  paperColor = '#FBF7F2',
  contrast = 1.1,
  brightness = 1.05,
  fit = 'cover',
  className = '',
  style,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let renderer: Renderer;
    try {
      renderer = new Renderer({
        alpha: true,
        antialias: true,
        dpr: Math.min(window.devicePixelRatio || 1, 2),
      });
    } catch {
      return;
    }

    const gl = renderer.gl;
    el.appendChild(gl.canvas);
    gl.canvas.style.display = 'block';
    gl.canvas.style.width = '100%';
    gl.canvas.style.height = '100%';

    const geometry = new Triangle(gl);
    const texture = new Texture(gl, { minFilter: gl.LINEAR, magFilter: gl.LINEAR });

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = src;

    let naturalW = 1;
    let naturalH = 1;

    img.onload = () => {
      naturalW = img.naturalWidth;
      naturalH = img.naturalHeight;
      texture.image = img;
      updateCover();
    };

    const mouse = { x: -1000, y: -1000 };
    const targetMouse = { x: -1000, y: -1000 };

    const ink = parseHex(inkColor);
    const paper = parseHex(paperColor);

    const effectiveDotSize = dotDensity ? Math.max(4, Math.round(100 / dotDensity * 8)) : dotSize;

    const program = new Program(gl, {
      vertex,
      fragment,
      uniforms: {
        tImage: { value: texture },
        uResolution: { value: [el.clientWidth, el.clientHeight] },
        uMouse: { value: [-1000, -1000] },
        uRadius: { value: revealRadius },
        uSoftness: { value: softness },
        uDotSize: { value: effectiveDotSize },
        uReverse: { value: reverse ? 1.0 : 0.0 },
        uInkColor: { value: ink },
        uPaperColor: { value: paper },
        uContrast: { value: contrast },
        uBrightness: { value: brightness },
        uCover: { value: [1, 1] },
      },
    });

    const mesh = new Mesh(gl, { geometry, program });

    const updateCover = () => {
      const cw = el.clientWidth || 1;
      const ch = el.clientHeight || 1;
      renderer.setSize(cw, ch);
      program.uniforms.uResolution.value = [cw, ch];

      const canvasAspect = cw / ch;
      const imageAspect = naturalW / naturalH;

      if (fit === 'cover') {
        if (canvasAspect > imageAspect) {
          program.uniforms.uCover.value = [1, (cw / naturalW) * (naturalH / ch)];
        } else {
          program.uniforms.uCover.value = [(ch / naturalH) * (naturalW / cw), 1];
        }
      } else {
        program.uniforms.uCover.value = [1, 1];
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      targetMouse.x = e.clientX - rect.left;
      targetMouse.y = e.clientY - rect.top;
    };

    const handlePointerLeave = () => {
      targetMouse.x = -1000;
      targetMouse.y = -1000;
    };

    el.addEventListener('pointermove', handlePointerMove);
    el.addEventListener('pointerleave', handlePointerLeave);
    window.addEventListener('resize', updateCover);

    let rafId: number;
    const render = () => {
      // Lerp mouse
      mouse.x += (targetMouse.x - mouse.x) * 0.15;
      mouse.y += (targetMouse.y - mouse.y) * 0.15;
      program.uniforms.uMouse.value = [mouse.x, mouse.y];

      renderer.render({ scene: mesh });
      rafId = requestAnimationFrame(render);
    };

    updateCover();
    rafId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafId);
      el.removeEventListener('pointermove', handlePointerMove);
      el.removeEventListener('pointerleave', handlePointerLeave);
      window.removeEventListener('resize', updateCover);
      if (gl.canvas && gl.canvas.parentNode === el) {
        el.removeChild(gl.canvas);
      }
    };
  }, [src, dotSize, dotDensity, revealRadius, softness, reverse, inkColor, paperColor, contrast, brightness, fit]);

  return (
    <div
      ref={containerRef}
      className={`halftone-reveal-container ${className}`}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        ...style,
      }}
    />
  );
};

export default HalftoneReveal;
