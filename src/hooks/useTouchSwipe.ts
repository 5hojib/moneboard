import { useEffect, useRef } from 'react';

const SWIPE_THRESHOLD = 64;
const VERTICAL_LOCK = 3;

export function useTouchSwipe(onSwipe: (dir: 'left' | 'right') => void) {
  const startRef = useRef<{ x: number; y: number } | null>(null);
  const onSwipeRef = useRef(onSwipe);

  useEffect(() => {
    onSwipeRef.current = onSwipe;
  });

  useEffect(() => {
    const touchStart = (e: TouchEvent) => {
      startRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };

    const touchEnd = (e: TouchEvent) => {
      if (!startRef.current) return;
      const dx = e.changedTouches[0].clientX - startRef.current.x;
      const dy = e.changedTouches[0].clientY - startRef.current.y;
      startRef.current = null;

      // Only treat as a tab swipe when the horizontal movement clearly
      // dominates the vertical (so it doesn't fight pull-to-refresh or
      // vertical chart/table scrolling).
      if (Math.abs(dx) < SWIPE_THRESHOLD || Math.abs(dx) / Math.max(Math.abs(dy), 1) < VERTICAL_LOCK) {
        return;
      }
      onSwipeRef.current(dx < 0 ? 'left' : 'right');
    };

    window.addEventListener('touchstart', touchStart, { passive: true });
    window.addEventListener('touchend', touchEnd, { passive: true });
    return () => {
      window.removeEventListener('touchstart', touchStart);
      window.removeEventListener('touchend', touchEnd);
    };
  }, []);
}