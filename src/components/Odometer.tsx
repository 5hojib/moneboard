import { memo, useEffect, useRef, useState, type FC } from 'react';

// A single digit column that rolls (odometer-style) to its target value via a
// vertical strip of 0-9. Uses rAF sequencing so the strip first snaps to the
// previously-shown digit, then CSS-transitions up/down to the new one.
interface DigitColumnProps {
  value: number;
  disabled: boolean;
}

const DigitColumn: FC<DigitColumnProps> = ({ value, disabled }) => {
  const [display, setDisplay] = useState(value);
  const prevRef = useRef(value);

  useEffect(() => {
    if (disabled) {
      prevRef.current = value;
      setDisplay(value);
      return;
    }

    if (prevRef.current === value) return;

    let raf2: number;
    setDisplay(prevRef.current);
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        setDisplay(value);
        prevRef.current = value;
      });
    });
    return () => {
      cancelAnimationFrame(raf1);
      if (raf2 !== undefined) cancelAnimationFrame(raf2);
    };
  }, [value, disabled]);

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
          transition: disabled ? 'none' : 'transform 0.55s cubic-bezier(0.22, 1, 0.36, 1)',
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
}

// Rolls every digit of the formatted number like an odometer. Non-digit
// characters ($ , .) render statically; digits animate column by column.
// Columns are keyed by position so each digit instance persists between
// value changes and can roll rather than remount.
function OdometerBase({ value, format, className, disabled = false }: OdometerProps) {
  const str = format(value);

  return (
    <span className={`inline-block tabular-nums ${className ?? ''}`}>
      {str.split('').map((ch, i) => {
        if (/[0-9]/.test(ch)) {
          return <DigitColumn key={i} value={Number(ch)} disabled={disabled} />;
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