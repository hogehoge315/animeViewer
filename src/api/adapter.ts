import type { VoiceActor } from '../domain/types.ts';
import type { AniListMedia, AniListStaff } from './anilist/types.ts';

const CHARACTER_NAME_SEPARATOR = ' / ';

export function extractTitle(media: AniListMedia): string {
  return media.title.native || media.title.romaji || media.title.english || 'Unknown';
}

export function extractCoverImage(media: AniListMedia): string | undefined {
  return media.coverImage?.large || media.coverImage?.medium || undefined;
}

export function extractEpisodeCount(media: AniListMedia): number | undefined {
  if (typeof media.episodes !== 'number' || !Number.isFinite(media.episodes) || media.episodes <= 0) {
    return undefined;
  }
  return Math.floor(media.episodes);
}

const ANILIST_SEASON_MAP: Record<string, string> = {
  WINTER: '冬',
  SPRING: '春',
  SUMMER: '夏',
  FALL: '秋',
};

export function extractSeason(media: AniListMedia): string | undefined {
  if (media.season && media.seasonYear) {
    const seasonJP = ANILIST_SEASON_MAP[media.season];
    if (seasonJP) return `${media.seasonYear}${seasonJP}`;
  }
  return undefined;
}

export function extractVoiceActors(media: AniListMedia): VoiceActor[] {
  if (!media.characters?.edges) return [];

  const seen = new Set<number>();
  const actors: VoiceActor[] = [];

  for (const edge of media.characters.edges) {
    for (const va of (edge.voiceActors ?? [])) {
      if (!seen.has(va.id)) {
        seen.add(va.id);
        actors.push({
          id: va.id,
          name: va.name.native || va.name.full || 'Unknown',
          nameNative:
            va.name.full && va.name.full !== va.name.native
              ? va.name.full
              : undefined,
        });
      }
    }
  }
  return actors;
}

export type CharacterRole = 'MAIN' | 'SUPPORTING' | 'BACKGROUND';

export interface StaffWithWorks {
  id: number;
  name: string;
  nameNative?: string;
  works: Array<{
    mediaId: number;
    title: string;
    coverImage?: string;
    totalEpisodes?: number;
    genres: string[];
    characterName?: string;
    characterRole?: CharacterRole;
    characterImage?: string;
  }>;
}

export function adaptStaffResult(staff: AniListStaff): StaffWithWorks {
  const works = new Map<number, StaffWithWorks['works'][number]>();

  for (const charEdge of staff.characters.edges) {
    const characterName =
      charEdge.node.name.native || charEdge.node.name.full || undefined;
    const characterImage = charEdge.node.image?.large || undefined;
    const characterRole = charEdge.role || undefined;

    for (const media of charEdge.node.media.nodes) {
      if (media.genres && media.genres.includes('Hentai')) continue;
      const existing = works.get(media.id);

      if (existing) {
        const existingCharacterNames = new Set(
          (existing.characterName || '')
            .split(CHARACTER_NAME_SEPARATOR)
            .map((name) => name.trim())
            .filter(Boolean)
        );
        if (characterName && !existingCharacterNames.has(characterName)) {
          existing.characterName = existing.characterName
            ? `${existing.characterName}${CHARACTER_NAME_SEPARATOR}${characterName}`
            : characterName;
        }
        if (!existing.characterImage) {
          existing.characterImage = characterImage;
        }
        if (
          characterRole === 'MAIN' ||
          (!existing.characterRole && characterRole)
        ) {
          existing.characterRole = characterRole ?? existing.characterRole;
        }
        continue;
      }

      const title =
        media.title.native ||
        media.title.romaji ||
        media.title.english ||
        'Unknown';

      works.set(media.id, {
        mediaId: media.id,
        title,
        coverImage: media.coverImage?.large || media.coverImage?.medium || undefined,
        totalEpisodes: extractEpisodeCount(media),
        genres: media.genres || [],
        characterName,
        characterRole,
        characterImage,
      });
    }
  }

  return {
    id: staff.id,
    name: staff.name.native || staff.name.full || 'Unknown',
    nameNative:
      staff.name.full && staff.name.full !== staff.name.native
        ? staff.name.full
        : undefined,
    works: Array.from(works.values()),
  };
}
