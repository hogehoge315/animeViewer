export const SEARCH_ANIME_QUERY = `
query SearchAnime($search: String!, $perPage: Int) {
  Page(perPage: $perPage) {
    media(search: $search, type: ANIME) {
      id
      title { romaji english native }
      coverImage { medium large }
      episodes
      genres
      characters(role: MAIN, sort: [RELEVANCE]) {
        edges {
          voiceActors(language: JAPANESE) {
            id
            name { full native }
          }
        }
      }
    }
  }
}
`;

export const SEARCH_BY_VOICE_ACTOR_QUERY = `
query SearchByVoiceActor($search: String!, $page: Int!, $perPage: Int!, $worksPerPage: Int!) {
  Page(page: $page, perPage: $perPage) {
    pageInfo {
      hasNextPage
      currentPage
      lastPage
    }
    staff(search: $search) {
      id
      name { full native }
      staffMedia(type: ANIME, sort: [POPULARITY_DESC], perPage: $worksPerPage) {
        edges {
          characterRole
          characterName
          character {
            id
            name { full native }
            image { large }
          }
          node {
            id
            title { romaji english native }
            coverImage { medium large }
            episodes
            genres
          }
        }
      }
    }
  }
}
`;

export const SEARCH_ANIME_BY_ID_QUERY = `
query SearchAnimeById($id: Int!) {
  Media(id: $id, type: ANIME) {
    id
    title { romaji english native }
    coverImage { medium large }
    episodes
    genres
    characters(role: MAIN, sort: [RELEVANCE]) {
      edges {
        voiceActors(language: JAPANESE) {
          id
          name { full native }
        }
      }
    }
  }
}
`;
