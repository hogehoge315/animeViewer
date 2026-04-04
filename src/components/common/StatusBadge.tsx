import type { WatchStatus } from '../../domain/types.ts';
import { WATCH_STATUS_LABELS, WATCH_STATUS_COLORS } from '../../domain/types.ts';
import type { CSSProperties } from 'react';

interface StatusBadgeProps {
  status: WatchStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const style: CSSProperties = {
    display: 'inline-block',
    padding: '2px 10px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 600,
    color: '#fff',
    backgroundColor: WATCH_STATUS_COLORS[status],
    whiteSpace: 'nowrap',
  };

  return <span style={style}>{WATCH_STATUS_LABELS[status]}</span>;
}
