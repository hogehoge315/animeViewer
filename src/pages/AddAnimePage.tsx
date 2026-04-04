import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAnimeEntries } from '../hooks/useAnimeEntries.ts';
import { useAniListSearch } from '../hooks/useAniListSearch.ts';
import { extractTitle, extractCoverImage, extractVoiceActors } from '../api/adapter.ts';
import type { AniListMedia } from '../api/anilist/types.ts';
import { AnimeForm } from '../components/anime/AnimeForm.tsx';
import type { AnimeFormData } from '../components/anime/AnimeForm.tsx';
import { SearchInput } from '../components/common/SearchInput.tsx';
import type { CSSProperties } from 'react';

const containerStyle: CSSProperties = {
  maxWidth: '700px',
  margin: '0 auto',
  padding: '20px',
};

const searchResultStyle: CSSProperties = {
  display: 'flex',
  gap: '10px',
  padding: '10px',
  backgroundColor: '#fff0f3',
  borderRadius: '8px',
  cursor: 'pointer',
  border: '1px solid #fbcfe8',
  marginBottom: '6px',
  alignItems: 'center',
};

const thumbStyle: CSSProperties = {
  width: '50px',
  height: '70px',
  objectFit: 'cover',
  borderRadius: '4px',
  flexShrink: 0,
};

export function AddAnimePage() {
  const navigate = useNavigate();
  const { addEntry } = useAnimeEntries();
  const { query, setQuery, results, loading, error } = useAniListSearch();
  const [selectedMedia, setSelectedMedia] = useState<AniListMedia | null>(null);
  const [showSearch, setShowSearch] = useState(true);

  const handleSelect = (media: AniListMedia) => {
    setSelectedMedia(media);
    setShowSearch(false);
  };

  const handleSubmit = (data: AnimeFormData) => {
    addEntry({
      title: data.title,
      season: data.season,
      rating: data.rating,
      comment: data.comment || undefined,
      watchStatus: data.watchStatus,
      anilistMediaId: data.anilistMediaId,
      voiceActors: data.voiceActors,
      genres: data.genres,
      coverImage: data.coverImage,
    });
    navigate('/');
  };

  const initialData = selectedMedia
    ? {
        title: extractTitle(selectedMedia),
        coverImage: extractCoverImage(selectedMedia),
        voiceActors: extractVoiceActors(selectedMedia),
        genres: selectedMedia.genres,
        anilistMediaId: selectedMedia.id,
      }
    : undefined;

  return (
    <div style={containerStyle}>
      <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#1f2937', marginBottom: '20px' }}>
        アニメを追加
      </h1>

      {showSearch && (
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '6px', color: '#6b7280', fontSize: '13px', fontWeight: 600 }}>
            AniListで検索（任意）
          </label>
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="アニメタイトルを検索..."
            loading={loading}
          />
          {error && <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{error}</div>}

          {results.length > 0 && (
            <div style={{ marginTop: '8px', maxHeight: '300px', overflowY: 'auto' }}>
              {results.map((media) => (
                <div
                  key={media.id}
                  style={searchResultStyle}
                  onClick={() => handleSelect(media)}
                >
                  {media.coverImage?.medium && (
                    <img src={media.coverImage.medium} alt="" style={thumbStyle} />
                  )}
                  <div>
                    <div style={{ color: '#1f2937', fontSize: '14px', fontWeight: 600 }}>
                      {extractTitle(media)}
                    </div>
                    <div style={{ color: '#6b7280', fontSize: '12px' }}>
                      {media.genres.slice(0, 3).join(', ')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={() => setShowSearch(false)}
            style={{
              marginTop: '8px',
              padding: '6px 12px',
              backgroundColor: 'transparent',
              border: '1px solid #f9a8d4',
              borderRadius: '6px',
              color: '#6b7280',
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            検索せずに手動入力
          </button>
        </div>
      )}

      {!showSearch && selectedMedia && (
        <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#fff0f3', borderRadius: '8px', display: 'flex', gap: '12px', alignItems: 'center' }}>
          {extractCoverImage(selectedMedia) && (
            <img src={extractCoverImage(selectedMedia)} alt="" style={{ width: '60px', height: '85px', objectFit: 'cover', borderRadius: '6px' }} />
          )}
          <div>
            <div style={{ color: '#1f2937', fontWeight: 600 }}>{extractTitle(selectedMedia)}</div>
            <div style={{ color: '#6b7280', fontSize: '12px' }}>{selectedMedia.genres.join(', ')}</div>
          </div>
          <button
            type="button"
            onClick={() => { setSelectedMedia(null); setShowSearch(true); }}
            style={{ marginLeft: 'auto', color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px' }}
          >
            変更
          </button>
        </div>
      )}

      {!showSearch && (
        <AnimeForm
          initial={initialData}
          onSubmit={handleSubmit}
          submitLabel="追加する"
        />
      )}
    </div>
  );
}
