import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAnimeEntries } from '../hooks/useAnimeEntries.ts';
import { AnimeForm } from '../components/anime/AnimeForm.tsx';
import type { AnimeFormData } from '../components/anime/AnimeForm.tsx';
import { StarRating } from '../components/common/StarRating.tsx';
import { StatusBadge } from '../components/common/StatusBadge.tsx';
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
  backgroundColor: '#312e5c',
  borderRadius: '16px',
  fontSize: '12px',
  color: '#c4b5fd',
  marginRight: '6px',
  marginBottom: '4px',
};

export function DetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { entries, updateEntry, deleteEntry } = useAnimeEntries();
  const [editing, setEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const entry = entries.find((e) => e.id === id);

  if (!entry) {
    return (
      <div style={containerStyle}>
        <p style={{ color: '#9ca3af' }}>アニメが見つかりません</p>
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

  if (editing) {
    return (
      <div style={containerStyle}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#e5e7eb', marginBottom: '16px' }}>
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
            border: '1px solid #4b5563',
            borderRadius: '8px',
            color: '#9ca3af',
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
          <div style={{ width: '140px', height: '200px', backgroundColor: '#312e5c', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px', flexShrink: 0 }}>
            🎬
          </div>
        )}
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#e5e7eb', marginTop: 0, marginBottom: '8px' }}>
            {entry.title}
          </h1>
          <div style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '8px' }}>{entry.season}</div>
          <StarRating value={entry.rating} readonly size={20} />
          <div style={{ marginTop: '8px' }}><StatusBadge status={entry.watchStatus} /></div>
        </div>
      </div>

      {entry.genres.length > 0 && (
        <div style={sectionStyle}>
          <h3 style={{ fontSize: '14px', color: '#9ca3af', marginBottom: '6px' }}>ジャンル</h3>
          <div>{entry.genres.map((g) => <span key={g} style={tagStyle}>{g}</span>)}</div>
        </div>
      )}

      {entry.comment && (
        <div style={sectionStyle}>
          <h3 style={{ fontSize: '14px', color: '#9ca3af', marginBottom: '6px' }}>コメント</h3>
          <p style={{ color: '#e5e7eb', backgroundColor: '#1e1b3a', padding: '12px', borderRadius: '8px', whiteSpace: 'pre-wrap', margin: 0 }}>
            {entry.comment}
          </p>
        </div>
      )}

      {entry.voiceActors.length > 0 && (
        <div style={sectionStyle}>
          <h3 style={{ fontSize: '14px', color: '#9ca3af', marginBottom: '6px' }}>声優</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {entry.voiceActors.map((va) => (
              <span key={va.id} style={tagStyle}>
                {va.name}{va.nameNative ? ` (${va.nameNative})` : ''}
              </span>
            ))}
          </div>
        </div>
      )}

      <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '20px' }}>
        <div>登録日: {new Date(entry.createdAt).toLocaleDateString('ja-JP')}</div>
        <div>更新日: {new Date(entry.updatedAt).toLocaleDateString('ja-JP')}</div>
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          type="button"
          onClick={() => setEditing(true)}
          style={{
            padding: '8px 16px',
            backgroundColor: '#6366f1',
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
                color: '#9ca3af',
                border: '1px solid #4b5563',
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
