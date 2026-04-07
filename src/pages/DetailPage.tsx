import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAnimeEntries } from '../hooks/useAnimeEntries.ts';
import { AnimeForm } from '../components/anime/AnimeForm.tsx';
import type { AnimeFormData } from '../components/anime/AnimeForm.tsx';
import { StarRating } from '../components/common/StarRating.tsx';
import { StatusBadge } from '../components/common/StatusBadge.tsx';
import { queryAniList } from '../api/anilist/client.ts';
import { SEARCH_ANIME_BY_ID_QUERY } from '../api/anilist/queries.ts';
import { extractEpisodeCount } from '../api/adapter.ts';
import type { AniListMediaByIdResult } from '../api/anilist/types.ts';
import type { CSSProperties } from 'react';

const containerStyle: CSSProperties = {
  maxWidth: '700px',
  margin: '0 auto',
  padding: '20px',
};

const sectionStyle: CSSProperties = {
  marginBottom: '20px',
};

const tagStyle: CSSProperties = {
  display: 'inline-block',
  padding: '3px 10px',
  backgroundColor: '#fce7f3',
  borderRadius: '16px',
  fontSize: '12px',
  color: '#db2777',
  marginRight: '6px',
  marginBottom: '4px',
};

export function DetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { entries, updateEntry, deleteEntry } = useAnimeEntries();
  const [editing, setEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [syncingEpisodes, setSyncingEpisodes] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  const entry = entries.find((e) => e.id === id);

  if (!entry) {
    return (
      <div style={containerStyle}>
        <p style={{ color: '#6b7280' }}>アニメが見つかりません</p>
      </div>
    );
  }

  const handleUpdate = (data: AnimeFormData) => {
    updateEntry(entry.id, {
      title: data.title,
      season: data.season,
      rating: data.rating,
      comment: data.comment || undefined,
      watchStatus: data.watchStatus,
      totalEpisodes: data.totalEpisodes,
      watchedEpisodes: data.watchedEpisodes,
      voiceActors: data.voiceActors,
      genres: data.genres,
      coverImage: data.coverImage,
    });
    setEditing(false);
  };

  const handleDelete = () => {
    deleteEntry(entry.id);
    navigate('/');
  };

  const handleSyncEpisodes = async () => {
    if (!entry.anilistMediaId) return;
    setSyncingEpisodes(true);
    setSyncMessage(null);
    try {
      const data = await queryAniList<AniListMediaByIdResult>(SEARCH_ANIME_BY_ID_QUERY, {
        id: entry.anilistMediaId,
      });
      if (data?.Media) {
        const episodes = extractEpisodeCount(data.Media);
        if (episodes !== undefined) {
          updateEntry(entry.id, { totalEpisodes: episodes });
          setSyncMessage(`総話数を${episodes}話に更新しました`);
        } else {
          setSyncMessage('AniListでもまだ総話数が未定です');
        }
      } else {
        setSyncMessage('AniListからの情報取得に失敗しました');
      }
    } catch {
      setSyncMessage('AniListからの情報取得に失敗しました');
    } finally {
      setSyncingEpisodes(false);
    }
  };

  if (editing) {
    return (
      <div style={containerStyle}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#1f2937', marginBottom: '16px' }}>
          編集
        </h1>
        <AnimeForm
          initial={{
            title: entry.title,
            season: entry.season,
             rating: entry.rating,
             comment: entry.comment || '',
             watchStatus: entry.watchStatus,
             anilistMediaId: entry.anilistMediaId,
             totalEpisodes: entry.totalEpisodes,
             watchedEpisodes: entry.watchedEpisodes,
             voiceActors: entry.voiceActors,
             genres: entry.genres,
             coverImage: entry.coverImage,
          }}
          onSubmit={handleUpdate}
          submitLabel="更新する"
        />
        <button
          type="button"
          onClick={() => setEditing(false)}
          style={{
            marginTop: '12px',
            padding: '8px 16px',
            backgroundColor: 'transparent',
            border: '1px solid #f9a8d4',
            borderRadius: '8px',
            color: '#6b7280',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          キャンセル
        </button>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={{ display: 'flex', gap: '20px', marginBottom: '24px' }}>
        {entry.coverImage ? (
          <img
            src={entry.coverImage}
            alt={entry.title}
            style={{ width: '140px', height: '200px', objectFit: 'cover', borderRadius: '10px', flexShrink: 0 }}
          />
        ) : (
          <div style={{ width: '140px', height: '200px', backgroundColor: '#fce7f3', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px', flexShrink: 0 }}>
            🎬
          </div>
        )}
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#1f2937', marginTop: 0, marginBottom: '8px' }}>
            {entry.title}
          </h1>
          <div style={{ color: '#6b7280', fontSize: '14px', marginBottom: '8px' }}>{entry.season}</div>
          <StarRating value={entry.rating} readonly size={20} />
          <div style={{ marginTop: '8px' }}><StatusBadge status={entry.watchStatus} /></div>
          {entry.totalEpisodes !== undefined ? (
            <div style={{ color: '#6b7280', fontSize: '13px', marginTop: '8px' }}>
              視聴話数: {entry.watchedEpisodes ?? 0} / {entry.totalEpisodes}
            </div>
          ) : (
            <div style={{ color: '#9ca3af', fontSize: '13px', marginTop: '8px' }}>総話数: 未定</div>
          )}
          {entry.anilistMediaId !== undefined && (
            <div style={{ marginTop: '8px' }}>
              <button
                type="button"
                onClick={handleSyncEpisodes}
                disabled={syncingEpisodes}
                style={{
                  padding: '4px 10px',
                  backgroundColor: syncingEpisodes ? '#f9a8d4' : '#fce7f3',
                  color: '#db2777',
                  border: '1px solid #f9a8d4',
                  borderRadius: '6px',
                  fontSize: '12px',
                  cursor: syncingEpisodes ? 'not-allowed' : 'pointer',
                }}
              >
                {syncingEpisodes ? '更新中...' : 'AniListから話数を更新'}
              </button>
              {syncMessage && (
                <div style={{ color: '#6b7280', fontSize: '12px', marginTop: '4px' }}>{syncMessage}</div>
              )}
            </div>
          )}
        </div>
      </div>

      {entry.genres.length > 0 && (
        <div style={sectionStyle}>
          <h3 style={{ fontSize: '14px', color: '#6b7280', marginBottom: '6px' }}>ジャンル</h3>
          <div>{entry.genres.map((g) => <span key={g} style={tagStyle}>{g}</span>)}</div>
        </div>
      )}

      {entry.comment && (
        <div style={sectionStyle}>
          <h3 style={{ fontSize: '14px', color: '#6b7280', marginBottom: '6px' }}>コメント</h3>
          <p style={{ color: '#1f2937', backgroundColor: '#fff0f3', padding: '12px', borderRadius: '8px', whiteSpace: 'pre-wrap', margin: 0 }}>
            {entry.comment}
          </p>
        </div>
      )}

      {entry.voiceActors.length > 0 && (
        <div style={sectionStyle}>
          <h3 style={{ fontSize: '14px', color: '#6b7280', marginBottom: '6px' }}>声優</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {entry.voiceActors.map((va) => (
              <span key={va.id} style={tagStyle}>
                {va.name}{va.nameNative ? ` (${va.nameNative})` : ''}
              </span>
            ))}
          </div>
        </div>
      )}

      <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '20px' }}>
        <div>登録日: {new Date(entry.createdAt).toLocaleDateString('ja-JP')}</div>
        <div>更新日: {new Date(entry.updatedAt).toLocaleDateString('ja-JP')}</div>
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          type="button"
          onClick={() => setEditing(true)}
          style={{
            padding: '8px 16px',
            backgroundColor: '#ec4899',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 600,
          }}
        >
          編集
        </button>
        {!showDeleteConfirm ? (
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            style={{
              padding: '8px 16px',
              backgroundColor: 'transparent',
              color: '#ef4444',
              border: '1px solid #ef4444',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            削除
          </button>
        ) : (
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <span style={{ color: '#ef4444', fontSize: '13px' }}>本当に削除しますか？</span>
            <button
              type="button"
              onClick={handleDelete}
              style={{
                padding: '6px 14px',
                backgroundColor: '#ef4444',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '13px',
              }}
            >
              はい
            </button>
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(false)}
              style={{
                padding: '6px 14px',
                backgroundColor: 'transparent',
                color: '#6b7280',
                border: '1px solid #f9a8d4',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '13px',
              }}
            >
              いいえ
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
