import { useCallback, useRef } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';

export interface ChartWindow {
  start: number;
  end: number;
}

// Clamps a [start, end) window (inclusive-start / exclusive-end indices)
// into the valid range for `count` items, keeping the span between minSpan
// and count. Returns a new ChartWindow object.
export function clampChartWindow(
  start: number,
  end: number,
  count: number,
  minSpan: number
): ChartWindow {
  if (count <= 0) return { start: 0, end: 0 };
  const span = Math.min(count, Math.max(minSpan, end - start));
  const s = Math.max(0, Math.min(start, count - span));
  return { start: s, end: s + span };
}

interface PointerState {
  x: number;
  y: number;
  initX: number;
  initY: number;
}

interface UsePanZoomOptions {
  count: number;
  window: ChartWindow;
  onChange: (window: ChartWindow) => void;
  minSpan: number;
}

interface GestureOrigin {
  win: ChartWindow;
  dist: number;
  midIndex: number;
}

/**
 * Pointer-driven pan + pinch-zoom controller for a chart region.
 *
 * Drag with one finger/pointer to pan the visible window, pinch with two to
 * squeeze it (zoom around the midpoint of the pinch). Works on the element
 * you attach the returned handlers to; set `touch-action: none` on that
 * element so the browser does not hijack the gestures.
 */
export function usePanZoom({ count, window, onChange, minSpan }: UsePanZoomOptions) {
  const ref = useRef<HTMLDivElement | null>(null);
  const pointers = useRef(new Map<number, PointerState>());
  const originRef = useRef<GestureOrigin | null>(null);

  const stateRef = useRef({ count, window, minSpan, onChange });
  stateRef.current = { count, window, minSpan, onChange };

  const clamp = useCallback(
    (start: number, end: number) => clampChartWindow(start, end, stateRef.current.count, stateRef.current.minSpan),
    []
  );

  const handlePointerDown = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    try {
      el.setPointerCapture(e.pointerId);
    } catch {
      /* pointer already released */
    }
    pointers.current.set(e.pointerId, {
      x: e.clientX,
      y: e.clientY,
      initX: e.clientX,
      initY: e.clientY,
    });

    const pts = [...pointers.current.values()];
    if (pts.length === 2) {
      const dist = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y);
      const midX = (pts[0].x + pts[1].x) / 2;
      const rect = el.getBoundingClientRect();
      const frac = (midX - rect.left) / Math.max(1, rect.width);
      originRef.current = {
        win: { ...stateRef.current.window },
        dist,
        midIndex: Math.max(0, Math.min(stateRef.current.count - 1, Math.round(frac * stateRef.current.count))),
      };
    } else {
      originRef.current = {
        win: { ...stateRef.current.window },
        dist: 0,
        midIndex: 0,
      };
    }
  }, []);

  const handlePointerMove = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    const state = stateRef.current;
    if (state.count <= 0) return;
    const pt = pointers.current.get(e.pointerId);
    if (!pt) return;
    pt.x = e.clientX;
    pt.y = e.clientY;

    const origin = originRef.current;
    if (!origin) return;
    const el = ref.current;
    if (!el) return;

    const pts = [...pointers.current.values()];
    const rect = el.getBoundingClientRect();
    const width = Math.max(1, rect.width);

    if (pts.length >= 2 && origin.dist > 0) {
      // Pinch: zoom around the moving midpoint so the anchored data point
      // stays under your fingers while the window simultaneously pans.
      const dist = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y);
      const midX = (pts[0].x + pts[1].x) / 2;
      const anchorCur = Math.max(
        0,
        Math.min(state.count - 1, Math.round(((midX - rect.left) / width) * state.count))
      );
      const ratio = dist / origin.dist;
      const L0 = Math.max(1, origin.win.end - origin.win.start);
      const L = Math.max(state.minSpan, Math.min(state.count, Math.round(L0 / ratio)));
      const s0 = origin.win.start;
      const newStart = anchorCur - Math.round((origin.midIndex - s0) * (L / L0));
      state.onChange(clamp(newStart, newStart + L));
    } else if (pts.length === 1) {
      const dxDays = ((pts[0].x - pts[0].initX) / width) * state.count;
      const shift = Math.round(dxDays);
      const { start, end } = origin.win;
      const span = end - start;
      if (span < state.count) {
        state.onChange(clamp(start + shift, start + shift + span));
      }
    }
  }, [clamp]);

  const handlePointerUp = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    pointers.current.delete(e.pointerId);
    const pts = [...pointers.current.values()];
    if (pts.length === 1) {
      // One finger remains after a pinch: re-base it and carry the current
      // window so the gesture continues seamlessly as a drag.
      const remaining = pts[0];
      remaining.initX = remaining.x;
      remaining.initY = remaining.y;
      originRef.current = {
        win: { ...stateRef.current.window },
        dist: 0,
        midIndex: 0,
      };
    } else if (pts.length === 0) {
      originRef.current = null;
    }
  }, []);

  return {
    containerRef: ref,
    onPointerDown: handlePointerDown,
    onPointerMove: handlePointerMove,
    onPointerUp: handlePointerUp,
    onPointerCancel: handlePointerUp,
    clamp,
  };
}