const STORAGE_KEY = 'anime-viewer-va-favorites';

export interface FavoriteVoiceActor {
  id: number;
  name: string;
  nameNative?: string;
  addedAt: string;
}

function load(): FavoriteVoiceActor[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as FavoriteVoiceActor[]) : [];
  } catch {
    return [];
  }
}

function save(favorites: FavoriteVoiceActor[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  } catch (e) {
    console.error('Failed to save voice actor favorites:', e);
  }
}

export function getFavorites(): FavoriteVoiceActor[] {
  return load();
}

export function addFavorite(staff: { id: number; name: string; nameNative?: string }): void {
  const favorites = load();
  if (favorites.some((f) => f.id === staff.id)) return;
  favorites.push({ ...staff, addedAt: new Date().toISOString() });
  save(favorites);
}

export function removeFavorite(id: number): void {
  const favorites = load().filter((f) => f.id !== id);
  save(favorites);
}

export function isFavorite(id: number): boolean {
  return load().some((f) => f.id === id);
}
