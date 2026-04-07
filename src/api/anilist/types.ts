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
  voiceActors: AniListVoiceActor[] | null;
}

export interface AniListCharacters {
  edges: AniListCharacterEdge[];
}

export interface AniListMedia {
  id: number;
  title: AniListTitle;
  coverImage: AniListCoverImage | null;
  episodes?: number | null;
  genres: string[] | null;
  characters?: AniListCharacters;
}

export interface AniListPageResult {
  Page: {
    media: AniListMedia[];
  };
}

export interface AniListMediaByIdResult {
  Media: AniListMedia | null;
}

export interface AniListPageInfo {
  hasNextPage: boolean;
  currentPage: number;
  lastPage: number;
}

export interface AniListCharacterRoleName {
  full: string | null;
  native: string | null;
}

export interface AniListCharacterRoleImage {
  large: string | null;
}

export interface AniListStaffCharacterNode {
  id: number;
  name: AniListCharacterRoleName;
  image: AniListCharacterRoleImage | null;
  media: {
    nodes: Array<{
      id: number;
      title: AniListTitle;
      coverImage: AniListCoverImage | null;
      episodes?: number | null;
      genres: string[] | null;
    }>;
  };
}

export interface AniListStaffCharacterEdge {
  role?: 'MAIN' | 'SUPPORTING' | 'BACKGROUND' | null;
  node: AniListStaffCharacterNode;
}

export interface AniListStaff {
  id: number;
  name: {
    full: string | null;
    native: string | null;
  };
  characters: {
    edges: AniListStaffCharacterEdge[];
  };
}

export interface AniListStaffPageResult {
  Page: {
    pageInfo: AniListPageInfo;
    staff: AniListStaff[];
  };
}

export interface AniListGraphQLResponse<T> {
  data: T;
  errors?: Array<{ message: string }>;
}
