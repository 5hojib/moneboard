import { ReactNode, useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { RefreshCw } from 'lucide-react';

interface PullToRefreshProps {
  onRefresh: () => void | Promise<void>;
  threshold?: number;
  maxPull?: number;
  children: ReactNode;
}

export default function PullToRefresh({
  onRefresh,
  threshold = 64,
  maxPull = 110,
  children,
}: PullToRefreshProps) {
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const pullRef = useRef(0);
  const refreshingRef = useRef(false);
  const startYRef = useRef<number | null>(null);
  const onRefreshRef = useRef(onRefresh);

  useEffect(() => {
    onRefreshRef.current = onRefresh;
  });

  const setPullValue = (value: number) => {
    pullRef.current = value;
    setPull(value);
  };

  useEffect(() => {
    const touchStart = (e: TouchEvent) => {
      if (refreshingRef.current) return;
      if (window.scrollY <= 0) {
        startYRef.current = e.touches[0].clientY;
      } else {
        startYRef.current = null;
      }
    };

    const touchMove = (e: TouchEvent) => {
      if (startYRef.current === null || refreshingRef.current) return;

      const delta = e.touches[0].clientY - startYRef.current;
      if (delta <= 0 || window.scrollY > 0) {
        if (pullRef.current !== 0) setPullValue(0);
        return;
      }

      e.preventDefault();
      setPullValue(Math.min(maxPull, delta * 0.5));
    };

    const touchEnd = () => {
      if (startYRef.current === null) return;
      startYRef.current = null;

      if (pullRef.current >= threshold && !refreshingRef.current) {
        refreshingRef.current = true;
        setRefreshing(true);
        setPullValue(0);
        const result = onRefreshRef.current();
        Promise.resolve(result).finally(() => {
          refreshingRef.current = false;
          setRefreshing(false);
        });
      } else {
        setPullValue(0);
      }
    };

    window.addEventListener('touchstart', touchStart, { passive: true });
    window.addEventListener('touchmove', touchMove, { passive: false });
    window.addEventListener('touchend', touchEnd);
    window.addEventListener('touchcancel', touchEnd);
    return () => {
      window.removeEventListener('touchstart', touchStart);
      window.removeEventListener('touchmove', touchMove);
      window.removeEventListener('touchend', touchEnd);
      window.removeEventListener('touchcancel', touchEnd);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showIndicator = pull > 0 || refreshing;
  const releasing = pull >= threshold;
  const rotation = Math.min(1, pull / threshold) * 180;

  return (
    <div className="relative">
      {/* Pull-to-refresh indicator */}
      {showIndicator && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed top-0 left-0 right-0 z-40 flex justify-center pointer-events-none"
          style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
        >
          <div className="mt-2 h-9 px-3.5 rounded-full bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 shadow-lg flex items-center gap-2 font-mono text-[11px] text-slate-500 dark:text-neutral-300 select-none">
            <RefreshCw
              className={`w-3.5 h-3.5 shrink-0 ${refreshing ? 'animate-spin' : ''}`}
              style={refreshing ? undefined : { transform: `rotate(${rotation}deg)` }}
            />
            {refreshing ? 'Syncing...' : releasing ? 'Release to refresh' : 'Pull to refresh'}
          </div>
        </motion.div>
      )}

      {/* Sliding content */}
      <motion.div
        animate={{ y: pull }}
        transition={
          refreshing
            ? { type: 'spring', stiffness: 260, damping: 28 }
            : { type: 'spring', stiffness: 320, damping: 30 }
        }
      >
        {children}
      </motion.div>
    </div>
  );
}