import type { CSSProperties } from 'react';
import type { AniListMedia, AniListExternalLink } from '../../api/anilist/types.ts';

interface AnimeDetailModalProps {
  media: AniListMedia;
  onClose: () => void;
  onAdd: (media: AniListMedia) => void;
}

function stripHtml(text: string): string {
  let result = text;
  let previous = '';
  while (result !== previous) {
    previous = result;
    result = result.replace(/<[^>]*>/g, '');
  }
  return result.trim();
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

const descriptionStyle: CSSProperties = {
  fontSize: '14px',
  color: '#1f2937',
  lineHeight: 1.6,
  margin: 0,
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

const linkButtonStyle: CSSProperties = {
  width: '36px',
  height: '36px',
  borderRadius: '8px',
  border: '1px solid #e5e7eb',
  backgroundColor: '#f9fafb',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '14px',
  fontWeight: 700,
  cursor: 'pointer',
  textDecoration: 'none',
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

export function AnimeDetailModal({ media, onClose, onAdd }: AnimeDetailModalProps) {
  const displayTitle = media.title.english ?? media.title.romaji ?? media.title.native ?? 'Unknown';
  const nativeTitle = media.title.native;
  const coverSrc = media.coverImage?.large ?? media.coverImage?.medium ?? null;
  const studios = media.studios?.nodes ?? [];
  const genres = media.genres ?? [];
  const externalLinks = media.externalLinks ?? [];
  const description = media.description ? stripHtml(media.description) : null;

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
            {nativeTitle && nativeTitle !== displayTitle && (
              <p style={subtitleStyle}>{nativeTitle}</p>
            )}
          </div>

          {studios.length > 0 && (
            <div style={metaStyle}>
              {studios.map((s) => s.name).join(', ')}
            </div>
          )}

          {media.episodes != null && (
            <div style={metaStyle}>
              エピソード数: {media.episodes}
            </div>
          )}

          {genres.length > 0 && (
            <div>
              <div style={sectionLabelStyle}>Genres</div>
              <div style={genreContainerStyle}>
                {genres.map((genre) => (
                  <span key={genre} style={genreTagStyle}>{genre}</span>
                ))}
              </div>
            </div>
          )}

          {description && (
            <div>
              <div style={sectionLabelStyle}>Synopsis</div>
              <p style={descriptionStyle}>{description}</p>
            </div>
          )}

          {externalLinks.length > 0 && (
            <div>
              <div style={sectionLabelStyle}>Links</div>
              <div style={linksRowStyle}>
                {externalLinks.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={getLinkLabel(link)}
                    aria-label={getLinkLabel(link)}
                    style={{
                      ...linkButtonStyle,
                      color: link.color ?? '#6b7280',
                    }}
                  >
                    {getLinkIcon(link)}
                  </a>
                ))}
              </div>
            </div>
          )}

          <button
            type="button"
            style={addButtonStyle}
            onClick={() => onAdd(media)}
          >
            + リストに追加
          </button>
        </div>
      </div>
    </div>
  );
}
