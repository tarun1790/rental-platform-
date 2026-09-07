// =========================================================================
// HOUSE INTELLIGENCE - Exa.ai Neural Real Estate Search Client
// =========================================================================

export interface ExaSearchResult {
  id: string;
  url: string;
  title: string;
  score?: number;
  publishedDate?: string;
  author?: string;
  text?: string;
  highlights?: string[];
}

export interface ExaSearchResponse {
  results: ExaSearchResult[];
  autopromptString?: string;
}

/**
 * Searches real-time web listings using Exa.ai Neural Search across major US rental & sale portals
 */
export async function searchWithExa(
  query: string,
  apiKey?: string
): Promise<ExaSearchResult[]> {
  const key = apiKey || process.env.EXA_API_KEY;

  if (!key) {
    return [];
  }

  try {
    const response = await fetch('https://api.exa.ai/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': key,
      },
      body: JSON.stringify({
        query: `${query} real estate rental home listing price bedrooms square feet`,
        useAutoprompt: true,
        numResults: 10,
        includeDomains: [
          'zillow.com',
          'redfin.com',
          'realtor.com',
          'apartments.com',
          'trulia.com',
        ],
        contents: {
          text: { maxCharacters: 1000 },
          highlights: { numSentences: 3 },
        },
      }),
    });

    if (!response.ok) {
      console.warn(`Exa.ai search responded with status ${response.status}`);
      return [];
    }

    const data: ExaSearchResponse = await response.json();
    return data.results || [];
  } catch (error) {
    console.warn('Exa.ai neural search request failed:', error);
    return [];
  }
}
