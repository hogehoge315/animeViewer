import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { AnimeEntry } from '../../domain/types.ts';
import { StarRating } from '../common/StarRating.tsx';
import { StatusBadge } from '../common/StatusBadge.tsx';
import type { CSSProperties } from 'react';

interface AnimeCardProps {
  entry: AnimeEntry;
  onProgressCommit?: (watchedEpisodes: number) => void;
}

const cardStyle: CSSProperties = {
  display: 'flex',
  gap: '12px',
  padding: '12px',
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  border: '1px solid #fbcfe8',
  transition: 'border-color 0.2s',
};

const linkStyle: CSSProperties = {
  display: 'flex',
  gap: '12px',
  flex: 1,
  minWidth: 0,
  textDecoration: 'none',
  color: 'inherit',
};

const imageStyle: CSSProperties = {
  width: '70px',
  height: '100px',
  objectFit: 'cover',
  borderRadius: '6px',
  flexShrink: 0,
  backgroundColor: '#fce7f3',
};

const bodyStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
  flex: 1,
  minWidth: 0,
};

const titleStyle: CSSProperties = {
  fontSize: '15px',
  fontWeight: 600,
  color: '#1f2937',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

const metaStyle: CSSProperties = {
  fontSize: '12px',
  color: '#6b7280',
};

const progressPanelStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  alignItems: 'flex-end',
  justifyContent: 'center',
  flexShrink: 0,
};

const progressButtonStyle: CSSProperties = {
  width: '28px',
  height: '28px',
  borderRadius: '9999px',
  border: '1px solid #f9a8d4',
  backgroundColor: '#fff0f3',
  color: '#db2777',
  fontSize: '16px',
  fontWeight: 700,
  cursor: 'pointer',
};

const confirmButtonStyle: CSSProperties = {
  ...progressButtonStyle,
  backgroundColor: '#ec4899',
  borderColor: '#ec4899',
  color: '#fff',
};

export function AnimeCard({ entry, onProgressCommit }: AnimeCardProps) {
  const [draftWatchedEpisodes, setDraftWatchedEpisodes] = useState<number | null>(null);

  useEffect(() => {
    setDraftWatchedEpisodes(null);
  }, [entry.watchedEpisodes, entry.totalEpisodes]);

  const currentWatchedEpisodes = entry.watchedEpisodes ?? 0;
  const displayedWatchedEpisodes = draftWatchedEpisodes ?? currentWatchedEpisodes;
  const hasPendingProgressChange =
    draftWatchedEpisodes !== null && draftWatchedEpisodes !== currentWatchedEpisodes;

  const updateDraft = (nextValue: number) => {
    if (entry.totalEpisodes === undefined) return;
    const clampedValue = Math.max(0, Math.min(entry.totalEpisodes, nextValue));
    setDraftWatchedEpisodes(clampedValue);
  };

  return (
    <div style={cardStyle}>
      <Link to={`/anime/${entry.id}`} style={linkStyle}>
        {entry.coverImage ? (
          <img src={entry.coverImage} alt={entry.title} style={imageStyle} />
        ) : (
          <div style={{ ...imageStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
            🎬
          </div>
        )}
        <div style={bodyStyle}>
          <div style={titleStyle}>{entry.title}</div>
          <div style={metaStyle}>{entry.season}</div>
          <StarRating value={entry.rating} readonly size={14} />
          <div><StatusBadge status={entry.watchStatus} /></div>
          {entry.totalEpisodes !== undefined && (
            <div style={metaStyle}>
              視聴話数: {displayedWatchedEpisodes} / {entry.totalEpisodes}
            </div>
          )}
        </div>
      </Link>

      {entry.totalEpisodes !== undefined && onProgressCommit && (
        <div style={progressPanelStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              type="button"
              onClick={() => updateDraft(displayedWatchedEpisodes - 1)}
              style={progressButtonStyle}
              disabled={displayedWatchedEpisodes <= 0}
            >
              −
            </button>
            <button
              type="button"
              onClick={() => updateDraft(displayedWatchedEpisodes + 1)}
              style={progressButtonStyle}
              disabled={displayedWatchedEpisodes >= entry.totalEpisodes}
            >
              ＋
            </button>
            {hasPendingProgressChange && (
              <button
                type="button"
                onClick={() => {
                  if (draftWatchedEpisodes !== null) {
                    onProgressCommit(draftWatchedEpisodes);
                  }
                }}
                style={confirmButtonStyle}
              >
                ✓
              </button>
            )}
          </div>
          <div style={{ ...metaStyle, textAlign: 'right' }}>話数更新</div>
        </div>
      )}
    </div>
  );
}
