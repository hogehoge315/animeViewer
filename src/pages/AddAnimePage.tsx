import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAnimeEntries } from '../hooks/useAnimeEntries.ts';
import { useAniListSearch, useVoiceActorSearch } from '../hooks/useAniListSearch.ts';
import { extractTitle, extractCoverImage, extractEpisodeCount, extractVoiceActors, extractSeason } from '../api/adapter.ts';
import type { StaffWithWorks } from '../api/adapter.ts';
import type { AniListMedia, AniListMediaByIdResult } from '../api/anilist/types.ts';
import { queryAniList } from '../api/anilist/client.ts';
import { SEARCH_ANIME_BY_ID_QUERY } from '../api/anilist/queries.ts';
import type { VoiceActor } from '../domain/types.ts';
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

const searchResultButtonStyle: CSSProperties = {
  ...searchResultStyle,
  width: '100%',
  textAlign: 'left',
  border: '1px solid #fbcfe8',
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

const successBoxStyle: CSSProperties = {
  padding: '20px',
  backgroundColor: '#f0fdf4',
  border: '1px solid #bbf7d0',
  borderRadius: '10px',
  textAlign: 'center',
};

const successTitleStyle: CSSProperties = {
  fontSize: '18px',
  fontWeight: 700,
  color: '#15803d',
  marginBottom: '8px',
};

const successMessageStyle: CSSProperties = {
  color: '#1f2937',
  fontSize: '14px',
  marginBottom: '20px',
};

const successActionsStyle: CSSProperties = {
  display: 'flex',
  gap: '12px',
  justifyContent: 'center',
  flexWrap: 'wrap',
};

const addAnotherBtnStyle: CSSProperties = {
  padding: '10px 20px',
  backgroundColor: '#ec4899',
  color: '#fff',
  border: 'none',
  borderRadius: '8px',
  fontSize: '14px',
  fontWeight: 600,
  cursor: 'pointer',
};

const backToListBtnStyle: CSSProperties = {
  padding: '10px 20px',
  backgroundColor: '#fff',
  color: '#6b7280',
  border: '1px solid #f9a8d4',
  borderRadius: '8px',
  fontSize: '14px',
  fontWeight: 600,
  cursor: 'pointer',
};

type SearchMode = 'anime' | 'voiceActor';

interface SelectionInfo {
  title: string;
  image?: string;
  genres: string[];
  formData: Partial<AnimeFormData>;
}

export function AddAnimePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addEntry } = useAnimeEntries();
  const { query, setQuery, results, loading, error } = useAniListSearch();
  const { query: vaQuery, search: vaSearch, results: vaResults, loading: vaLoading, error: vaError } = useVoiceActorSearch();

  const [showSearch, setShowSearch] = useState(true);
  const [searchMode, setSearchMode] = useState<SearchMode>('anime');
  const [selection, setSelection] = useState<SelectionInfo | null>(null);
  const [prefillError, setPrefillError] = useState<string | null>(null);

  const getRoleIcon = (role?: StaffWithWorks['works'][number]['characterRole']) => {
    if (role === 'MAIN') return 'メ';
    if (role === 'SUPPORTING') return 'サ';
    if (role === 'BACKGROUND') return '背';
    return null;
  };

  const handleSelectAnime = useCallback((media: AniListMedia) => {
    setSelection({
      title: extractTitle(media),
      image: extractCoverImage(media),
      genres: media.genres || [],
      formData: {
        title: extractTitle(media),
        coverImage: extractCoverImage(media),
        totalEpisodes: extractEpisodeCount(media),
        watchedEpisodes: 0,
        voiceActors: extractVoiceActors(media),
        genres: media.genres || [],
        anilistMediaId: media.id,
        season: extractSeason(media),
      },
    });
    setShowSearch(false);
  }, []);

  const handleSelectWork = (work: StaffWithWorks['works'][number], staff: StaffWithWorks) => {
    const voiceActor: VoiceActor = { id: staff.id, name: staff.name, nameNative: staff.nameNative };
    setSelection({
      title: work.title,
      image: work.coverImage,
      genres: work.genres,
      formData: {
        title: work.title,
        coverImage: work.coverImage,
        totalEpisodes: work.totalEpisodes,
        watchedEpisodes: 0,
        voiceActors: [voiceActor],
        genres: work.genres,
        anilistMediaId: work.mediaId,
      },
    });
    setShowSearch(false);
  };

  useEffect(() => {
    const mediaIdParam = searchParams.get('mediaId');
    if (!mediaIdParam) {
      setPrefillError(null);
      return;
    }

    const mediaId = Number(mediaIdParam);
    if (!Number.isFinite(mediaId)) {
      setPrefillError('アニメ情報の取得に失敗しました');
      return;
    }

    let cancelled = false;

    const prefillSelection = async () => {
      try {
        const data = await queryAniList<AniListMediaByIdResult>(SEARCH_ANIME_BY_ID_QUERY, {
          id: mediaId,
        });

        if (cancelled) return;

        if (data?.Media) {
          handleSelectAnime(data.Media);
          setPrefillError(null);
          return;
        }

        const fallbackTitle = searchParams.get('title') || '';
        setSelection({
          title: fallbackTitle || '作品を追加',
          genres: [],
          formData: {
            title: fallbackTitle,
            anilistMediaId: mediaId,
            voiceActors: [],
            genres: [],
          },
        });
        setShowSearch(false);
        setPrefillError('作品情報の一部を取得できなかったため、タイトルのみ入力済みにしました');
      } catch {
        if (cancelled) return;
        setPrefillError('アニメ情報の取得に失敗しました');
      }
    };

    void prefillSelection();

    return () => {
      cancelled = true;
    };
  }, [handleSelectAnime, searchParams]);

  const [addedTitle, setAddedTitle] = useState<string | null>(null);

  const handleSubmit = (data: AnimeFormData) => {
    addEntry({
      title: data.title,
      season: data.season,
      rating: data.rating,
      comment: data.comment || undefined,
      watchStatus: data.watchStatus,
      anilistMediaId: data.anilistMediaId,
      totalEpisodes: data.totalEpisodes,
      watchedEpisodes: data.watchedEpisodes,
      voiceActors: data.voiceActors,
      genres: data.genres,
      coverImage: data.coverImage,
    });
    setAddedTitle(data.title);
  };

  const handleAddAnother = () => {
    setAddedTitle(null);
    setSelection(null);
    setShowSearch(true);
  };

  const tabBtnStyle = (active: boolean): CSSProperties => ({
    padding: '6px 14px',
    borderRadius: '6px',
    border: 'none',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    backgroundColor: active ? '#ec4899' : '#fce7f3',
    color: active ? '#fff' : '#6b7280',
  });

  const staffSectionStyle: CSSProperties = {
    marginBottom: '12px',
    padding: '10px',
    backgroundColor: '#fff0f3',
    borderRadius: '8px',
    border: '1px solid #fbcfe8',
  };

  return (
    <div style={containerStyle}>
      <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#1f2937', marginBottom: '20px' }}>
        アニメを追加
      </h1>

      {addedTitle !== null && (
        <div style={successBoxStyle}>
          <div style={successTitleStyle}>
            ✓ 追加しました
          </div>
          <div style={successMessageStyle}>
            「{addedTitle}」をリストに追加しました。
          </div>
          <div style={successActionsStyle}>
            <button
              type="button"
              onClick={handleAddAnother}
              style={addAnotherBtnStyle}
            >
              続けて追加する
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              style={backToListBtnStyle}
            >
              一覧に戻る
            </button>
          </div>
        </div>
      )}

      {showSearch && addedTitle === null && (
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', color: '#6b7280', fontSize: '13px', fontWeight: 600 }}>
            AniListで検索（任意）
          </label>

          {/* Search mode tabs */}
          <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
            <button type="button" onClick={() => setSearchMode('anime')} style={tabBtnStyle(searchMode === 'anime')}>
              タイトルから探す
            </button>
            <button type="button" onClick={() => setSearchMode('voiceActor')} style={tabBtnStyle(searchMode === 'voiceActor')}>
              声優から探す
            </button>
          </div>

          {/* Anime title search */}
          {searchMode === 'anime' && (
            <>
              <SearchInput
                value={query}
                onChange={setQuery}
                placeholder="アニメタイトルを検索..."
                loading={loading}
              />
              {error && <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{error}</div>}
              {prefillError && <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{prefillError}</div>}

              {results.length > 0 && (
                <div style={{ marginTop: '8px', maxHeight: '300px', overflowY: 'auto' }}>
                  {results.map((media) => (
                    <button
                      type="button"
                      key={media.id}
                      style={searchResultButtonStyle}
                      onClick={() => handleSelectAnime(media)}
                    >
                      {media.coverImage?.medium && (
                        <img src={media.coverImage.medium} alt="" style={thumbStyle} />
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ color: '#1f2937', fontSize: '14px', fontWeight: 600 }}>
                          {extractTitle(media)}
                        </div>
                        <div style={{ color: '#6b7280', fontSize: '12px' }}>
                          {(media.genres || []).slice(0, 3).join(', ')}
                        </div>
                        {extractEpisodeCount(media) !== undefined && (
                          <div style={{ color: '#9ca3af', fontSize: '11px', marginTop: '2px' }}>
                            全{extractEpisodeCount(media)}話
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Voice actor search */}
          {searchMode === 'voiceActor' && (
            <>
              <SearchInput
                value={vaQuery}
                onChange={vaSearch}
                placeholder="声優名を入力..."
                loading={vaLoading}
              />
              {vaError && <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{vaError}</div>}

              {vaQuery.trim() && !vaLoading && vaResults.length === 0 && (
                <div style={{ textAlign: 'center', color: '#6b7280', padding: '20px', fontSize: '13px' }}>
                  結果が見つかりません
                </div>
              )}

              <div style={{ marginTop: '8px', maxHeight: '400px', overflowY: 'auto' }}>
                {vaResults.map((staff) => (
                  <div key={staff.id} style={staffSectionStyle}>
                    <div style={{ fontWeight: 600, color: '#ec4899', fontSize: '14px', marginBottom: '2px' }}>
                      {staff.name}
                    </div>
                    {staff.nameNative && (
                      <div style={{ color: '#9ca3af', fontSize: '12px', marginBottom: '8px' }}>
                        {staff.nameNative}
                      </div>
                    )}
                    <div>
                      {staff.works.map((work) => (
                        <button
                          type="button"
                          key={work.mediaId}
                          style={searchResultButtonStyle}
                          onClick={() => handleSelectWork(work, staff)}
                        >
                          {work.characterImage ? (
                            <img src={work.characterImage} alt="" style={thumbStyle} />
                          ) : work.coverImage ? (
                            <img src={work.coverImage} alt="" style={thumbStyle} />
                          ) : (
                            <div style={{ ...thumbStyle, backgroundColor: '#fce7f3' }} />
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
                            <div style={{ color: '#1f2937', fontSize: '14px', fontWeight: 600 }}>
                              {work.title}
                            </div>
                            <div style={{ color: '#6b7280', fontSize: '12px' }}>
                              {(work.genres || []).slice(0, 3).join(', ')}
                            </div>
                            {work.totalEpisodes !== undefined && (
                              <div style={{ color: '#9ca3af', fontSize: '11px', marginTop: '2px' }}>
                                全{work.totalEpisodes}話
                              </div>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
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

      {!showSearch && selection && addedTitle === null && (
        <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#fff0f3', borderRadius: '8px', display: 'flex', gap: '12px', alignItems: 'center' }}>
          {selection.image && (
            <img src={selection.image} alt="" style={{ width: '60px', height: '85px', objectFit: 'cover', borderRadius: '6px' }} />
          )}
            <div>
              <div style={{ color: '#1f2937', fontWeight: 600 }}>{selection.title}</div>
              <div style={{ color: '#6b7280', fontSize: '12px' }}>{selection.genres.join(', ')}</div>
              {selection.formData.totalEpisodes !== undefined && (
                <div style={{ color: '#9ca3af', fontSize: '11px', marginTop: '2px' }}>
                  全{selection.formData.totalEpisodes}話
                </div>
              )}
            </div>
          <button
            type="button"
            onClick={() => { setSelection(null); setShowSearch(true); }}
            style={{ marginLeft: 'auto', color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px' }}
          >
            変更
          </button>
        </div>
      )}

      {!showSearch && addedTitle === null && (
        <AnimeForm
          initial={selection?.formData}
          onSubmit={handleSubmit}
          submitLabel="追加する"
          fromApi={!!selection?.formData.anilistMediaId}
          apiSeason={selection?.formData.season}
        />
      )}
    </div>
  );
}
