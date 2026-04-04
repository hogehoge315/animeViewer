import type { VoiceActor } from '../domain/types.ts';
import type { AniListMedia, AniListStaff } from './anilist/types.ts';

export function extractTitle(media: AniListMedia): string {
  return media.title.native || media.title.romaji || media.title.english || 'Unknown';
}

export function extractCoverImage(media: AniListMedia): string | undefined {
  return media.coverImage?.large || media.coverImage?.medium || undefined;
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
          name: va.name.full || 'Unknown',
          nameNative: va.name.native || undefined,
        });
      }
    }
  }
  return actors;
}

export interface StaffWithWorks {
  id: number;
  name: string;
  nameNative?: string;
  works: Array<{
    mediaId: number;
    title: string;
    coverImage?: string;
    genres: string[];
  }>;
}

export function adaptStaffResult(staff: AniListStaff): StaffWithWorks {
  return {
    id: staff.id,
    name: staff.name.full || 'Unknown',
    nameNative: staff.name.native || undefined,
    works: staff.characterMedia.edges.map((edge) => ({
      mediaId: edge.node.id,
      title:
        edge.node.title.native ||
        edge.node.title.romaji ||
        edge.node.title.english ||
        'Unknown',
      coverImage: edge.node.coverImage?.large || edge.node.coverImage?.medium || undefined,
      genres: edge.node.genres,
    })),
  };
}
