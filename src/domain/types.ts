export type WatchStatus = 'watching' | 'completed' | 'dropped' | 'plan_to_watch';

export const WATCH_STATUS_LABELS: Record<WatchStatus, string> = {
  watching: '視聴中',
  completed: '視聴済み',
  dropped: '中断',
  plan_to_watch: '視聴予定',
};

export const WATCH_STATUS_COLORS: Record<WatchStatus, string> = {
  watching: '#3b82f6',
  completed: '#22c55e',
  dropped: '#ef4444',
  plan_to_watch: '#9ca3af',
};

export type SeasonName = '冬' | '春' | '夏' | '秋';

export const SEASON_NAMES: SeasonName[] = ['冬', '春', '夏', '秋'];

export interface VoiceActor {
  id: number;
  name: string;
  nameNative?: string;
}

export interface AnimeEntry {
  id: string;
  season: string;
  title: string;
  anilistMediaId?: number;
  rating?: number;
  comment?: string;
  watchStatus: WatchStatus;
  voiceActors: VoiceActor[];
  genres: string[];
  coverImage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StorageSchema {
  schemaVersion: number;
  appVersion: string;
  entries: AnimeEntry[];
}

export interface ExportData {
  appVersion: string;
  exportedAt: string;
  schemaVersion: number;
  entries: AnimeEntry[];
}

export interface FilterOptions {
  season?: string;
  rating?: number;
  watchStatus?: WatchStatus;
  titleQuery?: string;
  voiceActorQuery?: string;
  hasComment?: boolean;
}

export function generateRecentSeasons(count: number = 8): string[] {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  let seasonIndex: number;
  if (currentMonth <= 3) seasonIndex = 0;
  else if (currentMonth <= 6) seasonIndex = 1;
  else if (currentMonth <= 9) seasonIndex = 2;
  else seasonIndex = 3;

  const seasons: string[] = [];
  let year = currentYear;
  let si = seasonIndex;

  for (let i = 0; i < count; i++) {
    seasons.push(`${year}${SEASON_NAMES[si]}`);
    si--;
    if (si < 0) {
      si = 3;
      year--;
    }
  }
  return seasons;
}

export function generateId(): string {
  return crypto.randomUUID();
}
