import { memo, useEffect, useRef, useState, type FC } from 'react';

// A single digit column that rolls (odometer-style) to its target value via a
// vertical strip of 0-9. Rolling is two-phase:
//   1. snap the strip to the starting digit with NO transition,
//   2. on the next frame enable the transition and move to the target digit.
// This gives a clean, visible roll every time — a `replay` tick re-runs it
// from 0 even when the value did not change (pull-to-refresh).
interface DigitColumnProps {
  value: number;
  disabled: boolean;
  replay: number;
  durationSecs: number;
}

const DigitColumn: FC<DigitColumnProps> = ({ value, disabled, replay, durationSecs }) => {
  const [display, setDisplay] = useState(value);
  const [transitioning, setTransitioning] = useState(false);
  const prevValueRef = useRef(value);
  const lastReplayRef = useRef(replay);
  const rafRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const raf = rafRef.current;
    if (raf !== undefined) cancelAnimationFrame(raf);

    if (disabled) {
      prevValueRef.current = value;
      setTransitioning(false);
      setDisplay(value);
      return;
    }

    const isReplay = replay !== lastReplayRef.current;
    lastReplayRef.current = replay;

    const from = isReplay ? 0 : prevValueRef.current;
    prevValueRef.current = value;
    if (from === value) {
      setTransitioning(false);
      setDisplay(value);
      return;
    }

    // Phase 1: snap to the start digit with transitions switched off.
    setTransitioning(false);
    setDisplay(from);

    // Phase 2: once the snap is committed, enable the transition and roll.
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = requestAnimationFrame(() => {
        setTransitioning(true);
        setDisplay(value);
      });
    });
  }, [value, disabled, replay]);

  return (
    <span
      className="inline-block h-[1em] overflow-hidden align-baseline"
      style={{ width: '1ch' }}
    >
      <span
        className="block"
        style={{
          lineHeight: 1,
          transform: `translateY(-${display}em)`,
          transition: transitioning
            ? `transform ${durationSecs}s cubic-bezier(0.22, 1, 0.36, 1)`
            : 'none',
        }}
      >
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(d => (
          <span key={d} className="block h-[1em]">
            {d}
          </span>
        ))}
      </span>
    </span>
  );
}

interface OdometerProps {
  value: number;
  format: (n: number) => string;
  className?: string;
  disabled?: boolean;
  // Bump to replay the roll from 0 even when `value` is unchanged.
  replay?: number;
  // Animation length in seconds (longer = more dramatic roll).
  durationSecs?: number;
}

// Rolls every digit of the formatted number like an odometer. Non-digit
// characters ($ , .) render statically; digits animate column by column.
// Columns are keyed by position so each digit instance persists between
// value changes and can roll rather than remount.
function OdometerBase({
  value,
  format,
  className,
  disabled = false,
  replay = 0,
  durationSecs = 1.1,
}: OdometerProps) {
  const str = format(value);

  return (
    <span className={`inline-block tabular-nums ${className ?? ''}`}>
      {str.split('').map((ch, i) => {
        if (/[0-9]/.test(ch)) {
          return (
            <DigitColumn
              key={i}
              value={Number(ch)}
              disabled={disabled}
              replay={replay}
              durationSecs={durationSecs}
            />
          );
        }
        return (
          <span key={i} className="inline-block">
            {ch}
          </span>
        );
      })}
    </span>
  );
}

export const Odometer = memo(OdometerBase);