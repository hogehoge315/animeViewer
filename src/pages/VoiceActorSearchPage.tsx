import { useNavigate } from 'react-router-dom';
import { useVoiceActorSearch } from '../hooks/useAniListSearch.ts';
import { useAnimeEntries } from '../hooks/useAnimeEntries.ts';
import { SearchInput } from '../components/common/SearchInput.tsx';
import type { CSSProperties } from 'react';

const containerStyle: CSSProperties = {
  maxWidth: '800px',
  margin: '0 auto',
  padding: '20px',
};

const workCardStyle: CSSProperties = {
  display: 'flex',
  gap: '10px',
  padding: '10px',
  backgroundColor: '#fff0f3',
  borderRadius: '8px',
  alignItems: 'center',
  marginBottom: '6px',
};

const thumbStyle: CSSProperties = {
  width: '45px',
  height: '64px',
  objectFit: 'cover',
  borderRadius: '4px',
  flexShrink: 0,
  backgroundColor: '#fce7f3',
};

const actionBtnStyle: CSSProperties = {
  marginLeft: 'auto',
  padding: '4px 12px',
  fontSize: '12px',
  fontWeight: 600,
  borderRadius: '6px',
  cursor: 'pointer',
  border: 'none',
  flexShrink: 0,
};

const roleBadgeStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '20px',
  height: '20px',
  borderRadius: '9999px',
  backgroundColor: '#f9a8d4',
  color: '#fff',
  fontSize: '11px',
  fontWeight: 700,
  flexShrink: 0,
};

export function VoiceActorSearchPage() {
  const navigate = useNavigate();
  const { query, search, results, loading, error } = useVoiceActorSearch();
  const { entries } = useAnimeEntries();

  const existingMediaIds = new Set(entries.filter((e) => e.anilistMediaId).map((e) => e.anilistMediaId));
  const getRoleIcon = (role?: (typeof results)[number]['works'][number]['characterRole']) => {
    if (role === 'MAIN') return 'メ';
    if (role === 'SUPPORTING') return 'サ';
    if (role === 'BACKGROUND') return '背';
    return null;
  };

  return (
    <div style={containerStyle}>
      <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#1f2937', marginBottom: '16px' }}>
        声優検索
      </h1>

      <div style={{ marginBottom: '20px' }}>
        <SearchInput
          value={query}
          onChange={search}
          placeholder="声優名を入力..."
          loading={loading}
        />
        {error && <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{error}</div>}
      </div>

      {results.length === 0 && query.trim() && !loading && (
        <div style={{ textAlign: 'center', color: '#6b7280', padding: '40px' }}>
          結果が見つかりません
        </div>
      )}

      {results.map((staff) => (
        <div
          key={staff.id}
          style={{
            marginBottom: '20px',
            padding: '16px',
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #fbcfe8',
          }}
        >
          <h3 style={{ margin: '0 0 4px 0', color: '#ec4899', fontSize: '16px' }}>
            {staff.name}
          </h3>
          {staff.nameNative && (
            <div style={{ color: '#6b7280', fontSize: '13px', marginBottom: '10px' }}>
              {staff.nameNative}
            </div>
          )}

          <div>
            {staff.works.map((work) => {
              const isExisting = existingMediaIds.has(work.mediaId);
              const existingEntry = entries.find((e) => e.anilistMediaId === work.mediaId);

              return (
                <div key={work.mediaId} style={workCardStyle}>
                  {work.characterImage || work.coverImage ? (
                    <img src={work.characterImage || work.coverImage} alt="" style={thumbStyle} />
                  ) : (
                    <div style={thumbStyle} />
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {(work.characterName || work.characterRole) && (
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '2px' }}>
                        {getRoleIcon(work.characterRole) && (
                          <span style={roleBadgeStyle}>{getRoleIcon(work.characterRole)}</span>
                        )}
                        <div style={{ color: '#ec4899', fontSize: '12px', fontWeight: 600 }}>
                          {work.characterName || 'キャラクター名不明'}
                        </div>
                      </div>
                    )}
                    <div style={{ color: '#1f2937', fontSize: '14px', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {work.title}
                    </div>
                    <div style={{ color: '#9ca3af', fontSize: '11px' }}>
                      {work.genres.slice(0, 3).join(', ')}
                    </div>
                    {work.totalEpisodes !== undefined && (
                      <div style={{ color: '#9ca3af', fontSize: '11px', marginTop: '2px' }}>
                        全{work.totalEpisodes}話
                      </div>
                    )}
                  </div>
                  {isExisting && existingEntry ? (
                    <button
                      type="button"
                      onClick={() => navigate(`/anime/${existingEntry.id}`)}
                      style={{
                        ...actionBtnStyle,
                        backgroundColor: '#22c55e',
                        color: '#fff',
                      }}
                    >
                      詳細を見る
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => navigate(`/add?mediaId=${work.mediaId}&title=${encodeURIComponent(work.title)}`)}
                      style={{
                        ...actionBtnStyle,
                        backgroundColor: '#ec4899',
                        color: '#fff',
                      }}
                    >
                      追加
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
