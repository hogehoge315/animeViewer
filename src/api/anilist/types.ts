export interface AniListTitle {
  romaji: string | null;
  english: string | null;
  native: string | null;
}

export interface AniListCoverImage {
  medium: string | null;
  large: string | null;
}

export interface AniListVoiceActor {
  id: number;
  name: {
    full: string | null;
    native: string | null;
  };
}

export interface AniListCharacterEdge {
  voiceActors: AniListVoiceActor[];
}

export interface AniListCharacters {
  edges: AniListCharacterEdge[];
}

export interface AniListMedia {
  id: number;
  title: AniListTitle;
  coverImage: AniListCoverImage | null;
  genres: string[];
  characters?: AniListCharacters;
}

export interface AniListPageResult {
  Page: {
    media: AniListMedia[];
  };
}

export interface AniListStaffCharacterMediaEdge {
  node: {
    id: number;
    title: AniListTitle;
    coverImage: AniListCoverImage | null;
    genres: string[];
  };
}

export interface AniListStaff {
  id: number;
  name: {
    full: string | null;
    native: string | null;
  };
  characterMedia: {
    edges: AniListStaffCharacterMediaEdge[];
  };
}

export interface AniListStaffPageResult {
  Page: {
    staff: AniListStaff[];
  };
}

export interface AniListGraphQLResponse<T> {
  data: T;
  errors?: Array<{ message: string }>;
}
