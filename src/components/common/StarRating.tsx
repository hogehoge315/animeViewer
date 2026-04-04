import type { CSSProperties } from 'react';

interface StarRatingProps {
  value: number | undefined;
  onChange?: (value: number) => void;
  readonly?: boolean;
  size?: number;
}

export function StarRating({ value, onChange, readonly = false, size = 20 }: StarRatingProps) {
  const stars = [1, 2, 3, 4, 5];

  const starStyle = (n: number): CSSProperties => ({
    cursor: readonly ? 'default' : 'pointer',
    fontSize: `${size}px`,
    color: value !== undefined && n <= value ? '#f59e0b' : '#d1d5db',
    transition: 'color 0.15s',
    padding: '0 1px',
    userSelect: 'none',
  });

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center' }}>
      {stars.map((n) => (
        <span
          key={n}
          style={starStyle(n)}
          onClick={() => !readonly && onChange?.(n)}
          role={readonly ? undefined : 'button'}
          aria-label={`${n}星`}
        >
          ★
        </span>
      ))}
    </span>
  );
}
