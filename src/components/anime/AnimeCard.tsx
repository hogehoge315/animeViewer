import { Link } from 'react-router-dom';
import type { AnimeEntry } from '../../domain/types.ts';
import { StarRating } from '../common/StarRating.tsx';
import { StatusBadge } from '../common/StatusBadge.tsx';
import type { CSSProperties } from 'react';

interface AnimeCardProps {
  entry: AnimeEntry;
}

const cardStyle: CSSProperties = {
  display: 'flex',
  gap: '12px',
  padding: '12px',
  backgroundColor: '#1e1b3a',
  borderRadius: '12px',
  border: '1px solid #312e5c',
  textDecoration: 'none',
  color: 'inherit',
  transition: 'border-color 0.2s',
};

const imageStyle: CSSProperties = {
  width: '70px',
  height: '100px',
  objectFit: 'cover',
  borderRadius: '6px',
  flexShrink: 0,
  backgroundColor: '#312e5c',
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
  color: '#e5e7eb',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

const metaStyle: CSSProperties = {
  fontSize: '12px',
  color: '#9ca3af',
};

export function AnimeCard({ entry }: AnimeCardProps) {
  return (
    <Link to={`/anime/${entry.id}`} style={cardStyle}>
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
      </div>
    </Link>
  );
}
