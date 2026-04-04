import type { AniListGraphQLResponse } from './types.ts';

const ANILIST_ENDPOINT = 'https://graphql.anilist.co';

const requestTimestamps: number[] = [];
const MAX_REQUESTS_PER_MINUTE = 85;

async function waitForRateLimit(): Promise<void> {
  const now = Date.now();
  const oneMinuteAgo = now - 60_000;

  while (requestTimestamps.length > 0 && requestTimestamps[0] < oneMinuteAgo) {
    requestTimestamps.shift();
  }

  if (requestTimestamps.length >= MAX_REQUESTS_PER_MINUTE) {
    const waitTime = requestTimestamps[0] - oneMinuteAgo + 100;
    await new Promise((resolve) => setTimeout(resolve, waitTime));
  }
}

export async function queryAniList<T>(
  query: string,
  variables: Record<string, unknown>
): Promise<T | null> {
  try {
    await waitForRateLimit();
    requestTimestamps.push(Date.now());

    const response = await fetch(ANILIST_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) {
      console.error(`AniList API error: ${response.status} ${response.statusText}`);
      return null;
    }

    const json = (await response.json()) as AniListGraphQLResponse<T>;

    if (json.errors && json.errors.length > 0) {
      console.error('AniList GraphQL errors:', json.errors);
      return null;
    }

    return json.data;
  } catch (e) {
    console.error('AniList API request failed:', e);
    return null;
  }
}
