import { ReactNode, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  maxPull = 96,
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
      if (window.scrollY <= 0 && e.touches[0].clientY > 0) {
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
      setPullValue(Math.min(maxPull, delta * 0.45));
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
          setPullValue(0);
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
  }, []);

  const progress = Math.min(1, pull / threshold);
  const rotationDeg = progress * 180;

  return (
    <div className="relative">
      {/* Facebook-style pull-to-refresh indicator: a spinner that drops in from
          the top and retracts once the refresh completes. Content never moves. */}
      <AnimatePresence>
        {(pull > 0 || refreshing) && (
          <motion.div
            initial={{ opacity: 0, y: -24 }}
            animate={{
              opacity: refreshing ? 1 : Math.max(0.3, progress),
              y: refreshing || pull > 0 ? 0 : -24,
            }}
            exit={{ opacity: 0, y: -24 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="fixed top-0 left-0 right-0 z-40 flex justify-center pointer-events-none"
            style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 64px)' }}
          >
            <div className="h-10 w-10 rounded-full bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 flex items-center justify-center">
              <RefreshCw
                className={`w-5 h-5 text-slate-600 dark:text-neutral-300 ${refreshing ? 'animate-spin' : ''}`}
                style={refreshing ? undefined : { transform: `rotate(${rotationDeg}deg)` }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {children}
    </div>
  );
}