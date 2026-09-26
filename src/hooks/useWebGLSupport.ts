'use client';

/**
 * WebGL capability detection used to decide between rendering the 3D organ
 * viewer and the accessible 2D fallback. Runs once on mount; never throws.
 */

import { useEffect, useState } from 'react';

export type WebGLState = 'checking' | 'supported' | 'unsupported';

let cached: boolean | null = null;

function detectWebGL(): boolean {
  if (cached !== null) return cached;
  try {
    const canvas = document.createElement('canvas');
    const gl =
      canvas.getContext('webgl2') ||
      canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl');
    cached = Boolean(gl);
    // Release the probe context immediately.
    if (gl && 'getExtension' in gl) {
      const lose = (gl as WebGLRenderingContext).getExtension('WEBGL_lose_context');
      lose?.loseContext();
    }
  } catch {
    cached = false;
  }
  return cached;
}

export function useWebGLSupport(): WebGLState {
  const [state, setState] = useState<WebGLState>('checking');
  useEffect(() => {
    setState(detectWebGL() ? 'supported' : 'unsupported');
  }, []);
  return state;
}

/** True when the user has asked the OS to minimise animation. */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return reduced;
}
