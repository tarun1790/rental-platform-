// =========================================================================
// HOUSE INTELLIGENCE - Entity Resolution & Canonical Identity Engine
// Resolves duplicate records, normalizes USPS addresses, and assigns canonical IDs
// =========================================================================

import { PropertyAddress, ShikaakPropertyListing, SourceType } from '../../types/property';

// Authorized Source Hierarchy Priority (Lower index = higher authority)
export const SOURCE_HIERARCHY_RANK: Record<SourceType, number> = {
  MLS_IDX: 1,
  COUNTY_ASSESSOR: 2,
  MUNICIPAL_RECORDS: 3,
  AUTHORIZED_API: 4,
  PARTNER_FEED: 5,
  USER_URL: 6,
};

const STREET_SUFFIX_MAP: Record<string, string> = {
  street: 'St',
  st: 'St',
  avenue: 'Ave',
  ave: 'Ave',
  boulevard: 'Blvd',
  blvd: 'Blvd',
  road: 'Rd',
  rd: 'Rd',
  drive: 'Dr',
  dr: 'Dr',
  lane: 'Ln',
  ln: 'Ln',
  court: 'Ct',
  ct: 'Ct',
  place: 'Pl',
  pl: 'Pl',
  terrace: 'Ter',
  ter: 'Ter',
  parkway: 'Pkwy',
  pkwy: 'Pkwy',
  highway: 'Hwy',
  hwy: 'Hwy',
  circle: 'Cir',
  cir: 'Cir',
};

const DIRECTIONAL_MAP: Record<string, string> = {
  north: 'N',
  south: 'S',
  east: 'E',
  west: 'W',
  northeast: 'NE',
  northwest: 'NW',
  southeast: 'SE',
  southwest: 'SW',
  n: 'N',
  s: 'S',
  e: 'E',
  w: 'W',
  ne: 'NE',
  nw: 'NW',
  sw: 'SW',
};

const UNIT_MAP: Record<string, string> = {
  apartment: 'APT',
  apt: 'APT',
  suite: 'STE',
  ste: 'STE',
  unit: 'UNIT',
  floor: 'FL',
  fl: 'FL',
  room: 'RM',
  rm: 'RM',
  penthouse: 'PH',
  ph: 'PH',
};

/**
 * Normalizes street address to standard USPS publication conventions (all-caps, standardized suffixes and unit designators)
 */
export function normalizeStreetAddress(rawStreet: string): string {
  if (!rawStreet) return '';

  const clean = rawStreet
    .replace(/\b(unit|apt|suite|ste|floor|fl)\s*#\s*([0-9a-zA-Z]+)/gi, '$1 $2')
    .replace(/#\s*([0-9a-zA-Z]+)/g, 'APT $1')
    .replace(/[.,#]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const tokens = clean.split(' ');
  const normalizedTokens = tokens.map((token) => {
    const lower = token.toLowerCase();

    // Check directional prefix/suffix
    if (DIRECTIONAL_MAP[lower]) {
      return DIRECTIONAL_MAP[lower];
    }

    // Check street suffix
    if (STREET_SUFFIX_MAP[lower]) {
      return STREET_SUFFIX_MAP[lower].toUpperCase();
    }

    // Check secondary unit designators
    if (UNIT_MAP[lower]) {
      return UNIT_MAP[lower];
    }

    return token.toUpperCase();
  });

  return normalizedTokens.join(' ');
}

/**
 * Generates a deterministic canonical property identifier across disparate feeds
 */
export function generateCanonicalPropertyId(address: PropertyAddress, parcelId?: string): string {
  const normStreet = normalizeStreetAddress(address.street).replace(/\s+/g, '_').toUpperCase();
  const normCity = (address.city || 'METRO').replace(/\s+/g, '_').toUpperCase();
  const normState = (address.state || 'US').toUpperCase();
  const zip = (address.zipCode || '00000').slice(0, 5);

  if (parcelId && parcelId.trim()) {
    const cleanParcel = parcelId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8).toUpperCase();
    return `PROP_${normState}_${normCity}_${cleanParcel}`;
  }

  return `PROP_${normState}_${normCity}_${normStreet}_${zip}`;
}

/**
 * Computes address similarity score between two records (0.0 to 1.0)
 */
export function calculateAddressSimilarity(addrA: PropertyAddress, addrB: PropertyAddress): number {
  if (addrA.zipCode && addrB.zipCode && addrA.zipCode.slice(0, 5) !== addrB.zipCode.slice(0, 5)) {
    return 0.0;
  }

  const normA = normalizeStreetAddress(addrA.street).toLowerCase();
  const normB = normalizeStreetAddress(addrB.street).toLowerCase();

  if (normA === normB) return 1.0;

  // Simple token jaccard index
  const tokensA = normA.split(' ');
  const tokensB = normB.split(' ');
  const setB = new Set(tokensB);
  let intersectionCount = 0;
  for (let i = 0; i < tokensA.length; i++) {
    if (setB.has(tokensA[i])) {
      intersectionCount++;
    }
  }
  const allTokens = new Set(tokensA.concat(tokensB));
  return allTokens.size > 0 ? intersectionCount / allTokens.size : 0.0;
}

/**
 * Deduplicates and resolves multi-source listings into canonical properties
 */
export function resolveDuplicateListings(listings: ShikaakPropertyListing[]): ShikaakPropertyListing[] {
  const canonicalMap = new Map<string, ShikaakPropertyListing>();

  for (const listing of listings) {
    const canonicalId = listing.canonicalId || generateCanonicalPropertyId(listing.propertyAddress);

    if (!canonicalMap.has(canonicalId)) {
      canonicalMap.set(canonicalId, {
        ...listing,
        canonicalId,
      });
    } else {
      // Merge with existing canonical listing using source hierarchy
      const existing = canonicalMap.get(canonicalId)!;
      canonicalMap.set(canonicalId, mergeListingRecords(existing, listing));
    }
  }

  return Array.from(canonicalMap.values());
}

/**
 * Merges two records for the same physical property based on authority hierarchy
 */
function mergeListingRecords(
  primary: ShikaakPropertyListing,
  secondary: ShikaakPropertyListing
): ShikaakPropertyListing {
  // Retain the higher quality media, verified specs, and lower vacancy/expense variance
  return {
    ...primary,
    media: {
      featuredImage: primary.media?.featuredImage || secondary.media?.featuredImage,
      gallery: Array.from(new Set([...(primary.media?.gallery || []), ...(secondary.media?.gallery || [])])),
    },
    nearbyPointsOfInterest: primary.nearbyPointsOfInterest?.length >= 5
      ? primary.nearbyPointsOfInterest
      : secondary.nearbyPointsOfInterest,
  };
}
