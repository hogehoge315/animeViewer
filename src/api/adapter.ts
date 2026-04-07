import type { VoiceActor } from '../domain/types.ts';
import type { AniListMedia, AniListStaff } from './anilist/types.ts';

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

export function extractVoiceActors(media: AniListMedia): VoiceActor[] {
  if (!media.characters?.edges) return [];

  const seen = new Set<number>();
  const actors: VoiceActor[] = [];

  for (const edge of media.characters.edges) {
    for (const va of edge.voiceActors) {
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

  for (const edge of staff.staffMedia.edges) {
    const title =
      edge.node.title.native ||
      edge.node.title.romaji ||
      edge.node.title.english ||
      'Unknown';
    const characterName =
      edge.characterName ||
      edge.character?.name.native ||
      edge.character?.name.full ||
      undefined;
    const existing = works.get(edge.node.id);

    if (existing) {
      if (characterName && !existing.characterName?.includes(characterName)) {
        existing.characterName = existing.characterName
          ? `${existing.characterName} / ${characterName}`
          : characterName;
      }
      if (!existing.characterImage) {
        existing.characterImage = edge.character?.image?.large || undefined;
      }
      if (
        edge.characterRole === 'MAIN' ||
        (!existing.characterRole && edge.characterRole)
      ) {
        existing.characterRole = edge.characterRole || existing.characterRole;
      }
      continue;
    }

    works.set(edge.node.id, {
      mediaId: edge.node.id,
      title,
      coverImage: edge.node.coverImage?.large || edge.node.coverImage?.medium || undefined,
      totalEpisodes: extractEpisodeCount(edge.node),
      genres: edge.node.genres || [],
      characterName,
      characterRole: edge.characterRole || undefined,
      characterImage: edge.character?.image?.large || undefined,
    });
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
