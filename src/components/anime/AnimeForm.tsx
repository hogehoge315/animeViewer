import { useState } from 'react';
import type { WatchStatus, VoiceActor } from '../../domain/types.ts';
import { WATCH_STATUS_LABELS, generateRecentSeasons } from '../../domain/types.ts';
import { StarRating } from '../common/StarRating.tsx';
import type { CSSProperties } from 'react';

export interface AnimeFormData {
  title: string;
  season: string;
  rating: number | undefined;
  comment: string;
  watchStatus: WatchStatus;
  anilistMediaId?: number;
  totalEpisodes?: number;
  watchedEpisodes?: number;
  voiceActors: VoiceActor[];
  genres: string[];
  coverImage?: string;
}

interface AnimeFormProps {
  initial?: Partial<AnimeFormData>;
  onSubmit: (data: AnimeFormData) => void;
  submitLabel?: string;
}

const labelStyle: CSSProperties = {
  display: 'block',
  marginBottom: '4px',
  fontSize: '13px',
  color: '#6b7280',
  fontWeight: 600,
};

const inputStyle: CSSProperties = {
  width: '100%',
  padding: '8px 12px',
  border: '1px solid #f9a8d4',
  borderRadius: '8px',
  backgroundColor: '#ffffff',
  color: '#1f2937',
  fontSize: '14px',
  boxSizing: 'border-box',
};

const fieldGroupStyle: CSSProperties = {
  marginBottom: '16px',
};

const errorStyle: CSSProperties = {
  color: '#ef4444',
  fontSize: '12px',
  marginTop: '4px',
};

const seasons = generateRecentSeasons(12);
const statuses = Object.entries(WATCH_STATUS_LABELS) as [WatchStatus, string][];

export function AnimeForm({ initial, onSubmit, submitLabel = '保存' }: AnimeFormProps) {
  const [title, setTitle] = useState(initial?.title || '');
  const [season, setSeason] = useState(initial?.season || seasons[0]);
  const [rating, setRating] = useState<number | undefined>(initial?.rating);
  const [comment, setComment] = useState(initial?.comment || '');
  const [watchStatus, setWatchStatus] = useState<WatchStatus>(initial?.watchStatus || 'plan_to_watch');
  const [totalEpisodes, setTotalEpisodes] = useState<number | undefined>(initial?.totalEpisodes);
  const [watchedEpisodes, setWatchedEpisodes] = useState<number | undefined>(initial?.watchedEpisodes);
  const [errors, setErrors] = useState<string[]>([]);

  const parseEpisodeValue = (value: string): number | undefined => {
    if (!value.trim()) return undefined;
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return undefined;
    return Math.max(0, Math.floor(parsed));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: string[] = [];
    const normalizedTotalEpisodes = totalEpisodes !== undefined ? Math.max(0, Math.floor(totalEpisodes)) : undefined;
    const normalizedWatchedEpisodes = watchedEpisodes !== undefined ? Math.max(0, Math.floor(watchedEpisodes)) : undefined;
    if (!title.trim()) errs.push('タイトルは必須です');
    if (!season.trim()) errs.push('シーズンは必須です');
    if (
      normalizedTotalEpisodes !== undefined &&
      normalizedWatchedEpisodes !== undefined &&
      normalizedWatchedEpisodes > normalizedTotalEpisodes
    ) {
      errs.push('視聴済み話数は総話数以下にしてください');
    }
    if (errs.length > 0) {
      setErrors(errs);
      return;
    }
    setErrors([]);
    onSubmit({
      title: title.trim(),
      season,
      rating,
      comment: comment.trim(),
      watchStatus,
      anilistMediaId: initial?.anilistMediaId,
      totalEpisodes: normalizedTotalEpisodes,
      watchedEpisodes: normalizedWatchedEpisodes,
      voiceActors: initial?.voiceActors || [],
      genres: initial?.genres || [],
      coverImage: initial?.coverImage,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      {errors.length > 0 && (
        <div style={{ marginBottom: '12px' }}>
          {errors.map((err, i) => (
            <div key={i} style={errorStyle}>{err}</div>
          ))}
        </div>
      )}

      <div style={fieldGroupStyle}>
        <label style={labelStyle}>タイトル *</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={inputStyle}
          placeholder="アニメタイトル"
        />
      </div>

      <div style={fieldGroupStyle}>
        <label style={labelStyle}>シーズン *</label>
        <select
          value={season}
          onChange={(e) => setSeason(e.target.value)}
          style={inputStyle}
        >
          {seasons.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div style={fieldGroupStyle}>
        <label style={labelStyle}>評価</label>
        <StarRating value={rating} onChange={setRating} size={24} />
      </div>

      <div style={fieldGroupStyle}>
        <label style={labelStyle}>視聴状態</label>
        <select
          value={watchStatus}
          onChange={(e) => setWatchStatus(e.target.value as WatchStatus)}
          style={inputStyle}
        >
          {statuses.map(([val, label]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>
      </div>

      <div style={fieldGroupStyle}>
        <label style={labelStyle}>総話数</label>
        <input
          type="number"
          min="0"
          value={totalEpisodes ?? ''}
          onChange={(e) => setTotalEpisodes(parseEpisodeValue(e.target.value))}
          style={inputStyle}
          placeholder="AniListから自動入力 / 手動入力"
        />
      </div>

      <div style={fieldGroupStyle}>
        <label style={labelStyle}>視聴済み話数</label>
        <input
          type="number"
          min="0"
          value={watchedEpisodes ?? ''}
          onChange={(e) => setWatchedEpisodes(parseEpisodeValue(e.target.value))}
          style={inputStyle}
          placeholder="0"
        />
      </div>

      <div style={fieldGroupStyle}>
        <label style={labelStyle}>コメント</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
          placeholder="感想やメモ..."
        />
      </div>

      <button
        type="submit"
        style={{
          padding: '10px 24px',
          backgroundColor: '#ec4899',
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        {submitLabel}
      </button>
    </form>
  );
}
