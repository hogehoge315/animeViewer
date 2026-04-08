import { useEffect } from 'react';
import type { CSSProperties } from 'react';
import type { AniListMedia, AniListExternalLink } from '../../api/anilist/types.ts';

interface AnimeDetailModalProps {
  media: AniListMedia;
  onClose: () => void;
  onAdd: (media: AniListMedia) => void;
  isRegistered?: boolean;
}

function getLinkIcon(link: AniListExternalLink): string {
  const site = link.site.toLowerCase();

  if (site.includes('twitter') || site.includes('x') || /^https?:\/\/([^/]*\.)?x\.com(\/|$)/i.test(link.url)) return '𝕏';
  if (site.includes('youtube')) return '▶';
  if (site.includes('crunchyroll')) return 'CR';
  if (site.includes('netflix')) return 'N';
  if (site.includes('amazon') || site.includes('prime')) return 'A';
  if (site.includes('instagram')) return '📷';
  if (site.includes('official') || link.type === 'INFO') return '🌐';

  switch (link.type) {
    case 'STREAMING':
      return '📺';
    case 'SOCIAL':
      return '💬';
    case 'INFO':
      return '🌐';
    default:
      return '🔗';
  }
}

function getLinkLabel(link: AniListExternalLink): string {
  return link.site;
}

const overlayStyle: CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
  padding: '20px',
};

const modalStyle: CSSProperties = {
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  maxWidth: '480px',
  width: '100%',
  maxHeight: '90vh',
  overflowY: 'auto',
  position: 'relative',
};

const headerStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'flex-end',
  padding: '12px 12px 0 12px',
  position: 'sticky',
  top: 0,
  backgroundColor: '#ffffff',
  borderRadius: '12px 12px 0 0',
  zIndex: 1,
};

const closeButtonStyle: CSSProperties = {
  background: 'none',
  border: 'none',
  fontSize: '20px',
  cursor: 'pointer',
  padding: '4px 8px',
  lineHeight: 1,
  color: '#6b7280',
};

const contentStyle: CSSProperties = {
  padding: '0 20px 20px 20px',
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
};

const coverImageStyle: CSSProperties = {
  width: '100%',
  maxHeight: '280px',
  objectFit: 'cover',
  borderRadius: '8px',
  backgroundColor: '#fce7f3',
};

const coverPlaceholderStyle: CSSProperties = {
  width: '100%',
  height: '180px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '48px',
  backgroundColor: '#fce7f3',
  borderRadius: '8px',
};

const titleStyle: CSSProperties = {
  fontSize: '20px',
  fontWeight: 700,
  color: '#1f2937',
  margin: 0,
};

const subtitleStyle: CSSProperties = {
  fontSize: '13px',
  color: '#6b7280',
  margin: 0,
};

const sectionLabelStyle: CSSProperties = {
  fontSize: '12px',
  fontWeight: 600,
  color: '#6b7280',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  marginBottom: '4px',
};

const metaStyle: CSSProperties = {
  fontSize: '13px',
  color: '#6b7280',
};

const genreContainerStyle: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '6px',
};

const genreTagStyle: CSSProperties = {
  fontSize: '12px',
  padding: '3px 10px',
  borderRadius: '9999px',
  backgroundColor: '#fce7f3',
  color: '#db2777',
  fontWeight: 500,
};

const linksRowStyle: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '8px',
};

const linkBadgeStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '5px',
  padding: '5px 10px',
  borderRadius: '9999px',
  border: '1px solid #e5e7eb',
  backgroundColor: '#f9fafb',
  fontSize: '13px',
  fontWeight: 500,
  cursor: 'pointer',
  textDecoration: 'none',
  whiteSpace: 'nowrap',
};

const addButtonStyle: CSSProperties = {
  width: '100%',
  padding: '12px',
  borderRadius: '10px',
  border: 'none',
  backgroundColor: '#ec4899',
  color: '#ffffff',
  fontSize: '15px',
  fontWeight: 600,
  cursor: 'pointer',
  marginTop: '4px',
};

export function AnimeDetailModal({ media, onClose, onAdd, isRegistered = false }: AnimeDetailModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const displayTitle = media.title.native ?? media.title.romaji ?? media.title.english ?? 'Unknown';
  const romajiTitle = media.title.romaji && media.title.romaji !== displayTitle ? media.title.romaji : null;
  const coverSrc = media.coverImage?.large ?? media.coverImage?.medium ?? null;
  const studios = media.studios?.nodes ?? [];
  const genres = media.genres ?? [];
  const externalLinks = media.externalLinks ?? [];

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <div style={headerStyle}>
          <button
            type="button"
            style={closeButtonStyle}
            onClick={onClose}
            aria-label="閉じる"
          >
            ❌
          </button>
        </div>

        <div style={contentStyle}>
          {coverSrc ? (
            <img src={coverSrc} alt={displayTitle} style={coverImageStyle} />
          ) : (
            <div style={coverPlaceholderStyle}>🎬</div>
          )}

          <div>
            <h2 style={titleStyle}>{displayTitle}</h2>
            {romajiTitle && (
              <p style={subtitleStyle}>{romajiTitle}</p>
            )}
          </div>

          {studios.length > 0 && (
            <div style={metaStyle}>
              {studios.map((studio) => studio.name).join(', ')}
            </div>
          )}

          {media.episodes != null && (
            <div style={metaStyle}>
              エピソード数: {media.episodes}
            </div>
          )}

          {genres.length > 0 && (
            <div>
              <div style={sectionLabelStyle}>ジャンル</div>
              <div style={genreContainerStyle}>
                {genres.map((genre) => (
                  <span key={genre} style={genreTagStyle}>{genre}</span>
                ))}
              </div>
            </div>
          )}

          {externalLinks.length > 0 && (
            <div>
              <div style={sectionLabelStyle}>リンク</div>
              <div style={linksRowStyle}>
                {externalLinks.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      ...linkBadgeStyle,
                      color: link.color ?? '#6b7280',
                    }}
                  >
                    <span>{getLinkIcon(link)}</span>
                    <span>{getLinkLabel(link)}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          <button
            type="button"
            style={isRegistered ? { ...addButtonStyle, backgroundColor: '#d1d5db', color: '#6b7280', cursor: 'default' } : addButtonStyle}
            onClick={() => { if (!isRegistered) onAdd(media); }}
          >
            {isRegistered ? '✓ 追加済み' : '+ リストに追加'}
          </button>
        </div>
      </div>
    </div>
  );
}
