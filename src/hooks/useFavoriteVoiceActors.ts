import { useState } from 'react';
import {
  type FavoriteVoiceActor,
  getFavorites,
  addFavorite,
  removeFavorite,
} from '../storage/voiceActorFavoritesRepository.ts';

export function useFavoriteVoiceActors(): {
  favorites: FavoriteVoiceActor[];
  isFavorite: (id: number) => boolean;
  toggleFavorite: (staff: { id: number; name: string; nameNative?: string }) => void;
} {
  const [favorites, setFavorites] = useState<FavoriteVoiceActor[]>(getFavorites);

  function isFavorite(id: number): boolean {
    return favorites.some((f) => f.id === id);
  }

  function toggleFavorite(staff: { id: number; name: string; nameNative?: string }): void {
    if (isFavorite(staff.id)) {
      removeFavorite(staff.id);
      setFavorites((prev) => prev.filter((f) => f.id !== staff.id));
    } else {
      addFavorite(staff);
      setFavorites((prev) => [...prev, { ...staff, addedAt: new Date().toISOString() }]);
    }
  }

  return { favorites, isFavorite, toggleFavorite };
}
