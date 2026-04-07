import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { queryAniList } from '../api/anilist/client.ts';
import { POPULARITY_RANKING_QUERY } from '../api/anilist/queries.ts';
import type { AniListPagedResult, AniListMedia } from '../api/anilist/types.ts';
import { AnimeDetailModal } from '../components/anime/AnimeDetailModal.tsx';
import type { CSSProperties } from 'react';

type AniListSeason = 'WINTER' | 'SPRING' | 'SUMMER' | 'FALL';

function getCurrentSeason(): { season: AniListSeason; year: number } {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  let season: AniListSeason;
  if (month <= 3) season = 'WINTER';
  else if (month <= 6) season = 'SPRING';
  else if (month <= 9) season = 'SUMMER';
  else season = 'FALL';
  return { season, year };
}

const containerStyle: CSSProperties = {
  maxWidth: '800px',
  margin: '0 auto',
  padding: '20px',
};

const cardStyle: CSSProperties = {
  display: 'flex',
  gap: '12px',
  padding: '12px',
  backgroundColor: '#fff0f3',
  borderRadius: '10px',
  border: '1px solid #fbcfe8',
  alignItems: 'flex-start',
};

const coverStyle: CSSProperties = {
  width: '60px',
  height: '85px',
  objectFit: 'cover',
  borderRadius: '6px',
  flexShrink: 0,
};

const coverPlaceholderStyle: CSSProperties = {
  ...coverStyle,
  backgroundColor: '#fce7f3',
};

function extractTitle(media: AniListMedia): string {
  return media.title.native || media.title.romaji || media.title.english || 'Unknown';
}

export function DiscoverPage() {
  const navigate = useNavigate();
  const { season: currentSeason, year: currentYear } = getCurrentSeason();
  const [selectedYear, setSelectedYear] = useState<number | undefined>(currentYear);
  const [selectedSeasonName, setSelectedSeasonName] = useState<AniListSeason | undefined>(currentSeason);
  const yearOptions: number[] = [];
  for (let y = currentYear; y >= 1990; y--) yearOptions.push(y);
  const [page, setPage] = useState(1);
  const [mediaList, setMediaList] = useState<AniListMedia[]>([]);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detailMedia, setDetailMedia] = useState<AniListMedia | null>(null);

  const PER_PAGE = 20;

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const variables: Record<string, unknown> = {
        season: selectedSeasonName,
        seasonYear: selectedYear,
        page,
        perPage: PER_PAGE,
      };
      const data = await queryAniList<AniListPagedResult>(POPULARITY_RANKING_QUERY, variables);
      if (data) {
        setMediaList(data.Page.media);
        setHasNextPage(data.Page.pageInfo.hasNextPage);
      } else {
        setError('データの取得に失敗しました');
      }
    } catch {
      setError('データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }, [selectedSeasonName, selectedYear, page]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  return (
    <div style={containerStyle}>
      <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#1f2937', marginBottom: '16px' }}>
        アニメを探す
      </h1>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => { setSelectedYear(currentYear); setSelectedSeasonName(currentSeason); setPage(1); }}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            backgroundColor: '#ec4899',
            color: '#fff',
          }}
        >
          今季
        </button>
        <select
          value={selectedYear ?? ''}
          onChange={(e) => { setSelectedYear(e.target.value === '' ? undefined : Number(e.target.value)); setPage(1); }}
          style={{
            padding: '8px 12px',
            border: '1px solid #f9a8d4',
            borderRadius: '8px',
            backgroundColor: '#ffffff',
            color: '#1f2937',
            fontSize: '14px',
          }}
        >
          <option value="">全期間</option>
          {yearOptions.map((y) => (
            <option key={y} value={y}>{y}年</option>
          ))}
        </select>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            type="button"
            onClick={() => { setSelectedSeasonName(undefined); setPage(1); }}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              backgroundColor: selectedSeasonName === undefined ? '#ec4899' : '#fce7f3',
              color: selectedSeasonName === undefined ? '#fff' : '#6b7280',
              transition: 'background-color 0.15s, color 0.15s',
            }}
          >
            全
          </button>
          {([['SPRING', '春'], ['SUMMER', '夏'], ['FALL', '秋'], ['WINTER', '冬']] as [AniListSeason, string][]).map(([val, label]) => (
            <button
              key={val}
              type="button"
              onClick={() => { setSelectedSeasonName(val); setPage(1); }}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                backgroundColor: selectedSeasonName === val ? '#ec4899' : '#fce7f3',
                color: selectedSeasonName === val ? '#fff' : '#6b7280',
                transition: 'background-color 0.15s, color 0.15s',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>読み込み中...</div>
      )}
      {error && (
        <div style={{ textAlign: 'center', padding: '20px', color: '#ef4444' }}>{error}</div>
      )}

      {!loading && !error && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {mediaList.map((media, idx) => {
            const rank = (page - 1) * PER_PAGE + idx + 1;
            return (
              <div
                key={media.id}
                style={{ ...cardStyle, cursor: 'pointer' }}
                onClick={() => setDetailMedia(media)}
              >
                <div style={{
                  flexShrink: 0,
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: rank <= 3 ? '#ec4899' : '#fce7f3',
                  color: rank <= 3 ? '#fff' : '#6b7280',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '14px',
                  alignSelf: 'center',
                }}>
                  {rank}
                </div>
                {media.coverImage?.medium ? (
                  <img src={media.coverImage.medium} alt="" style={coverStyle} />
                ) : (
                  <div style={coverPlaceholderStyle} />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '15px', fontWeight: 600, color: '#1f2937', marginBottom: '4px' }}>
                    {extractTitle(media)}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                    {(media.genres || []).slice(0, 3).join(', ')}
                  </div>
                  {media.episodes && (
                    <div style={{ fontSize: '11px', color: '#9ca3af' }}>全{media.episodes}話</div>
                  )}
                  {media.popularity && (
                    <div style={{ fontSize: '11px', color: '#f9a8d4', marginTop: '2px' }}>
                      人気度: {media.popularity.toLocaleString()}
                    </div>
                  )}
                </div>
                <div onClick={(e) => e.stopPropagation()}>
                  <Link
                    to={`/add?mediaId=${media.id}&title=${encodeURIComponent(extractTitle(media))}&from=discover`}
                    style={{
                      flexShrink: 0,
                      padding: '6px 12px',
                      backgroundColor: '#ec4899',
                      color: '#fff',
                      textDecoration: 'none',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 600,
                      alignSelf: 'center',
                      display: 'block',
                    }}
                  >
                    追加
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {detailMedia && (
        <AnimeDetailModal
          media={detailMedia}
          onClose={() => setDetailMedia(null)}
          onAdd={(media) => {
            setDetailMedia(null);
            navigate(`/add?mediaId=${media.id}&title=${encodeURIComponent(extractTitle(media))}&from=discover`);
          }}
        />
      )}

      {/* Pagination */}
      {!loading && !error && (mediaList.length > 0 || page > 1) && (
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '20px' }}>
          <button
            type="button"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: '1px solid #f9a8d4',
              backgroundColor: page === 1 ? '#f9fafb' : '#fff',
              color: page === 1 ? '#9ca3af' : '#1f2937',
              cursor: page === 1 ? 'default' : 'pointer',
              fontSize: '13px',
            }}
          >
            ← 前のページ
          </button>
          <span style={{ padding: '8px 12px', color: '#6b7280', fontSize: '13px' }}>
            {page}ページ
          </span>
          <button
            type="button"
            disabled={!hasNextPage}
            onClick={() => setPage((p) => p + 1)}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: '1px solid #f9a8d4',
              backgroundColor: !hasNextPage ? '#f9fafb' : '#fff',
              color: !hasNextPage ? '#9ca3af' : '#1f2937',
              cursor: !hasNextPage ? 'default' : 'pointer',
              fontSize: '13px',
            }}
          >
            次のページ →
          </button>
        </div>
      )}
    </div>
  );
}
