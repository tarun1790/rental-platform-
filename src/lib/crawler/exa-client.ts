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

export interface ExaSearchOptions {
  apiKey?: string;
  numResults?: number;
  includeDomains?: string[];
}

/**
 * Retrieves configured Exa API key from parameters, localStorage, or environment
 */
export function getExaApiKey(explicitKey?: string): string | null {
  if (explicitKey && explicitKey.trim()) {
    return explicitKey.trim();
  }

  if (typeof window !== 'undefined') {
    const stored = window.localStorage?.getItem('EXA_API_KEY');
    if (stored && stored.trim()) {
      return stored.trim();
    }
  }

  if (typeof process !== 'undefined' && process.env?.EXA_API_KEY) {
    return process.env.EXA_API_KEY.trim();
  }

  return null;
}

/**
 * Tests whether an Exa.ai API key is valid and has active search quota
 */
export async function testExaApiKey(apiKey: string): Promise<{ valid: boolean; message: string }> {
  if (!apiKey || !apiKey.trim()) {
    return { valid: false, message: 'API key cannot be empty' };
  }

  try {
    const response = await fetch('https://api.exa.ai/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey.trim(),
      },
      body: JSON.stringify({
        query: 'chicago real estate rental listings',
        numResults: 1,
      }),
    });

    if (response.ok) {
      return { valid: true, message: 'Exa.ai API key verified successfully! Live neural crawler active.' };
    }

    if (response.status === 401 || response.status === 403) {
      return { valid: false, message: 'Invalid Exa.ai API key (Unauthorized). Please check your key.' };
    }

    if (response.status === 402) {
      return { valid: false, message: 'Exa.ai account has insufficient credits or requires a payment method.' };
    }

    return { valid: false, message: `Exa.ai returned HTTP status ${response.status}` };
  } catch (err: any) {
    return { valid: false, message: `Network error connecting to Exa.ai: ${err?.message || err}` };
  }
}

/**
 * Searches real-time web listings using Exa.ai Neural Search across major US rental & sale portals
 */
export async function searchWithExa(
  query: string,
  apiKey?: string,
  options?: ExaSearchOptions
): Promise<ExaSearchResult[]> {
  const key = getExaApiKey(apiKey || options?.apiKey);

  if (!key) {
    return [];
  }

  const numResults = options?.numResults || 10;
  const includeDomains = options?.includeDomains || [
    'zillow.com',
    'redfin.com',
    'realtor.com',
    'apartments.com',
    'trulia.com',
    'hotpads.com',
  ];

  try {
    const response = await fetch('https://api.exa.ai/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': key,
      },
      body: JSON.stringify({
        query: `${query} real estate rental home listing price bedrooms square feet address`,
        useAutoprompt: true,
        numResults,
        includeDomains,
        contents: {
          text: { maxCharacters: 1500 },
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
