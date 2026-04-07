export const SEARCH_ANIME_QUERY = `
query SearchAnime($search: String!, $perPage: Int) {
  Page(perPage: $perPage) {
    media(search: $search, type: ANIME) {
      id
      title { romaji english native }
      coverImage { medium large }
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
query SearchByVoiceActor($search: String!) {
  Page(perPage: 20) {
    staff(search: $search) {
      id
      name { full native }
      staffMedia(type: ANIME, sort: [POPULARITY_DESC]) {
        edges {
          node {
            id
            title { romaji english native }
            coverImage { medium large }
            genres
          }
        }
      }
    }
  }
}
`;
