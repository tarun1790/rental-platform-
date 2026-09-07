// =========================================================================
// HOUSE INTELLIGENCE - Natural Language Search & Query Parsing Engine
// =========================================================================

import { PropertyType, ListingStatus } from '../types/property';

export interface ParsedNlpQuery {
  rawQuery: string;
  location?: {
    city?: string;
    neighborhood?: string;
    state?: string;
    displayName: string;
  };
  priceRange?: {
    minPrice?: number;
    maxPrice?: number;
  };
  beds?: number;
  baths?: number;
  propertyType?: PropertyType;
  listingStatus?: ListingStatus;
  minCapRate?: number;
  minPassFlowScore?: number;
  amenities: {
    nearTopSchools: boolean;
    nearMalls: boolean;
    nearParks: boolean;
    nearTransit: boolean;
    highRoiOnly: boolean;
    positiveCashFlow: boolean;
  };
  parsedChips: Array<{
    category: 'LOCATION' | 'PRICE' | 'BEDS' | 'BATHS' | 'ROI' | 'TYPE' | 'AMENITY';
    label: string;
    value: string;
  }>;
}

// Known geographic entities
const KNOWN_LOCATIONS: Array<{
  names: string[];
  city: string;
  state: string;
  neighborhood?: string;
  displayName: string;
}> = [
  // Chicago Neighborhoods
  { names: ['lincoln park', 'lincoln'], city: 'Chicago', state: 'IL', neighborhood: 'Lincoln Park', displayName: 'Lincoln Park, Chicago, IL' },
  { names: ['gold coast', 'goldcoast'], city: 'Chicago', state: 'IL', neighborhood: 'Gold Coast', displayName: 'Gold Coast, Chicago, IL' },
  { names: ['west loop', 'westloop', 'fulton market'], city: 'Chicago', state: 'IL', neighborhood: 'West Loop', displayName: 'West Loop, Chicago, IL' },
  { names: ['lakeview', 'lake view', 'wrigleyville'], city: 'Chicago', state: 'IL', neighborhood: 'Lakeview', displayName: 'Lakeview, Chicago, IL' },
  { names: ['wicker park', 'bucktown'], city: 'Chicago', state: 'IL', neighborhood: 'Wicker Park', displayName: 'Wicker Park, Chicago, IL' },
  { names: ['streeterville', 'mag mile'], city: 'Chicago', state: 'IL', neighborhood: 'Streeterville', displayName: 'Streeterville, Chicago, IL' },
  { names: ['south loop', 'printer row', 'printers row'], city: 'Chicago', state: 'IL', neighborhood: 'South Loop', displayName: 'South Loop, Chicago, IL' },
  { names: ['hyde park', 'uchicago'], city: 'Chicago', state: 'IL', neighborhood: 'Hyde Park', displayName: 'Hyde Park, Chicago, IL' },
  { names: ['logan square', 'logan'], city: 'Chicago', state: 'IL', neighborhood: 'Logan Square', displayName: 'Logan Square, Chicago, IL' },
  { names: ['old town', 'oldtown'], city: 'Chicago', state: 'IL', neighborhood: 'Old Town', displayName: 'Old Town, Chicago, IL' },
  { names: ['river north', 'rivernorth'], city: 'Chicago', state: 'IL', neighborhood: 'River North', displayName: 'River North, Chicago, IL' },
  { names: ['andersonville', 'edgewater'], city: 'Chicago', state: 'IL', neighborhood: 'Andersonville', displayName: 'Andersonville, Chicago, IL' },
  { names: ['chicago', 'chicago il', 'il'], city: 'Chicago', state: 'IL', displayName: 'Chicago, IL' },

  // Colorado Metros
  { names: ['denver', 'denver co', 'cherry creek'], city: 'Denver', state: 'CO', neighborhood: 'Cherry Creek', displayName: 'Denver (Cherry Creek), CO' },
  { names: ['boulder', 'boulder co', 'chautauqua'], city: 'Boulder', state: 'CO', neighborhood: 'Chautauqua', displayName: 'Boulder, CO' },
  { names: ['aspen', 'aspen co', 'red mountain'], city: 'Aspen', state: 'CO', neighborhood: 'Red Mountain', displayName: 'Aspen, CO' },
  { names: ['colorado', 'co'], city: 'Denver', state: 'CO', displayName: 'Colorado Region' },

  // Other Major US Metros for live crawling
  { names: ['austin', 'austin tx', 'texas'], city: 'Austin', state: 'TX', displayName: 'Austin, TX' },
  { names: ['seattle', 'seattle wa', 'washington'], city: 'Seattle', state: 'WA', displayName: 'Seattle, WA' },
  { names: ['miami', 'miami fl', 'florida'], city: 'Miami', state: 'FL', displayName: 'Miami, FL' },
  { names: ['san francisco', 'sf', 'bay area'], city: 'San Francisco', state: 'CA', displayName: 'San Francisco, CA' },
  { names: ['new york', 'nyc', 'manhattan'], city: 'New York', state: 'NY', displayName: 'New York, NY' },
];

/**
 * Intelligent NLP parser that converts arbitrary user sentences into structured real estate parameters
 */
export function parseNlpQuery(query: string): ParsedNlpQuery {
  const normalized = query.toLowerCase().trim();
  const chips: ParsedNlpQuery['parsedChips'] = [];

  // 1. Detect Location
  let detectedLocation: ParsedNlpQuery['location'] = undefined;
  for (const loc of KNOWN_LOCATIONS) {
    for (const name of loc.names) {
      const regex = new RegExp(`\\b${name}\\b`, 'i');
      if (regex.test(normalized)) {
        detectedLocation = {
          city: loc.city,
          state: loc.state,
          neighborhood: loc.neighborhood,
          displayName: loc.displayName,
        };
        chips.push({
          category: 'LOCATION',
          label: 'Area',
          value: loc.displayName,
        });
        break;
      }
    }
    if (detectedLocation) break;
  }

  // 2. Detect Price Range
  let minPrice: number | undefined;
  let maxPrice: number | undefined;

  // Under / Max price: e.g., "under 800k", "below $1.2m", "less than 650000", "under $900,000"
  const underPriceMatch = normalized.match(/(?:under|below|less than|max|up to)\s*\$?([0-9.,]+)\s*(k|m|million|thousand)?/i);
  if (underPriceMatch) {
    let val = parseFloat(underPriceMatch[1].replace(/,/g, ''));
    const unit = (underPriceMatch[2] || '').toLowerCase();
    if (unit === 'k' || unit === 'thousand') val *= 1000;
    else if (unit === 'm' || unit === 'million') val *= 1000000;
    else if (val < 2000) val *= 1000; // sensible shorthand e.g. "800" for 800k
    maxPrice = Math.round(val);
    chips.push({
      category: 'PRICE',
      label: 'Max Price',
      value: `< $${maxPrice.toLocaleString()}`,
    });
  }

  // Min / Over price: e.g., "over 500k", "above 1m", "minimum 400k"
  const overPriceMatch = normalized.match(/(?:over|above|greater than|min|at least)\s*\$?([0-9.,]+)\s*(k|m|million|thousand)?/i);
  if (overPriceMatch) {
    let val = parseFloat(overPriceMatch[1].replace(/,/g, ''));
    const unit = (overPriceMatch[2] || '').toLowerCase();
    if (unit === 'k' || unit === 'thousand') val *= 1000;
    else if (unit === 'm' || unit === 'million') val *= 1000000;
    else if (val < 2000) val *= 1000;
    minPrice = Math.round(val);
    chips.push({
      category: 'PRICE',
      label: 'Min Price',
      value: `> $${minPrice.toLocaleString()}`,
    });
  }

  // Between range: e.g., "500k to 900k", "between 600k and 1m"
  const betweenMatch = normalized.match(/(?:between\s*)?\$?([0-9.,]+)\s*(k|m)?\s*(?:to|-|and)\s*\$?([0-9.,]+)\s*(k|m)/i);
  if (betweenMatch && !maxPrice) {
    let low = parseFloat(betweenMatch[1].replace(/,/g, ''));
    const lowUnit = (betweenMatch[2] || '').toLowerCase();
    if (lowUnit === 'k') low *= 1000;
    else if (lowUnit === 'm') low *= 1000000;
    else if (low < 2000) low *= 1000;

    let high = parseFloat(betweenMatch[3].replace(/,/g, ''));
    const highUnit = (betweenMatch[4] || '').toLowerCase();
    if (highUnit === 'k') high *= 1000;
    else if (highUnit === 'm') high *= 1000000;
    else if (high < 2000) high *= 1000;

    minPrice = Math.round(low);
    maxPrice = Math.round(high);
    chips.push({
      category: 'PRICE',
      label: 'Price Range',
      value: `$${minPrice.toLocaleString()} - $${maxPrice.toLocaleString()}`,
    });
  }

  // 3. Detect Bedrooms
  let beds: number | undefined;
  const bedsMatch = normalized.match(/(\d+)\s*(?:\+)?\s*(?:bed|bedroom|bds|br)\b/i);
  if (bedsMatch) {
    beds = parseInt(bedsMatch[1], 10);
    chips.push({
      category: 'BEDS',
      label: 'Bedrooms',
      value: `${beds}+ Beds`,
    });
  } else if (normalized.includes('studio')) {
    beds = 1;
    chips.push({
      category: 'BEDS',
      label: 'Bedrooms',
      value: 'Studio / 1 Bed',
    });
  }

  // 4. Detect Bathrooms
  let baths: number | undefined;
  const bathsMatch = normalized.match(/(\d+(?:\.\d+)?)\s*(?:\+)?\s*(?:bath|bathroom|ba)\b/i);
  if (bathsMatch) {
    baths = parseFloat(bathsMatch[1]);
    chips.push({
      category: 'BATHS',
      label: 'Bathrooms',
      value: `${baths}+ Baths`,
    });
  }

  // 5. Detect Property Type
  let propertyType: PropertyType | undefined;
  if (/\b(?:condo|condominium|apartment|apt)\b/i.test(normalized)) {
    propertyType = 'CONDO';
    chips.push({ category: 'TYPE', label: 'Property Type', value: 'Condo' });
  } else if (/\b(?:townhouse|townhome)\b/i.test(normalized)) {
    propertyType = 'TOWNHOUSE';
    chips.push({ category: 'TYPE', label: 'Property Type', value: 'Townhouse' });
  } else if (/\b(?:loft)\b/i.test(normalized)) {
    propertyType = 'LOFT';
    chips.push({ category: 'TYPE', label: 'Property Type', value: 'Loft' });
  } else if (/\b(?:multi[- ]family|duplex|triplex|fourplex)\b/i.test(normalized)) {
    propertyType = 'MULTI_FAMILY';
    chips.push({ category: 'TYPE', label: 'Property Type', value: 'Multi-Family' });
  } else if (/\b(?:single family|house|home|single-family|estate)\b/i.test(normalized)) {
    propertyType = 'SINGLE_FAMILY';
    chips.push({ category: 'TYPE', label: 'Property Type', value: 'Single Family' });
  }

  // 6. Detect Listing Status (Rent vs Sale)
  let listingStatus: ListingStatus | undefined;
  if (/\b(?:rent|for rent|rental|lease|tenant)\b/i.test(normalized)) {
    listingStatus = 'FOR_RENT';
    chips.push({ category: 'TYPE', label: 'Status', value: 'For Rent' });
  } else if (/\b(?:buy|for sale|purchase|invest)\b/i.test(normalized)) {
    listingStatus = 'FOR_SALE';
    chips.push({ category: 'TYPE', label: 'Status', value: 'For Sale' });
  }

  // 7. Detect ROI & Investment Intent
  let minCapRate: number | undefined;
  let minPassFlowScore: number | undefined;

  const capRateMatch = normalized.match(/cap\s*rate\s*(?:>|>=|at least|over|above)?\s*([0-9.]+)\s*%/i);
  if (capRateMatch) {
    minCapRate = parseFloat(capRateMatch[1]);
    chips.push({
      category: 'ROI',
      label: 'Target Cap Rate',
      value: `≥ ${minCapRate}%`,
    });
  }

  const passFlowMatch = normalized.match(/pass[\s/-]*flow\s*(?:>|>=|at least)?\s*([0-9.]+)/i);
  if (passFlowMatch) {
    minPassFlowScore = parseFloat(passFlowMatch[1]);
    chips.push({
      category: 'ROI',
      label: 'Pass/Flow Grade',
      value: `≥ ${minPassFlowScore} / 5.0`,
    });
  }

  const positiveCashFlow = /\b(?:positive cash flow|cash flow|cashflow)\b/i.test(normalized);
  const highRoi = /\b(?:high roi|good roi|strong returns|investment grade|roi)\b/i.test(normalized);

  if (positiveCashFlow && !minCapRate) {
    chips.push({ category: 'ROI', label: 'Cash Flow', value: 'Positive Cash Flow' });
  }

  // 8. Detect Amenities & Proximity
  const nearTopSchools = /\b(?:school|schools|elementary|high school|greatschools|education)\b/i.test(normalized);
  const nearMalls = /\b(?:mall|malls|shopping|retail|whole foods|dining)\b/i.test(normalized);
  const nearParks = /\b(?:park|parks|forest|reserve|green|nature|trails)\b/i.test(normalized);
  const nearTransit = /\b(?:transit|train|cta|subway|metro|highway|commute)\b/i.test(normalized);

  if (nearTopSchools) chips.push({ category: 'AMENITY', label: 'Proximity', value: '🎓 Top Schools' });
  if (nearMalls) chips.push({ category: 'AMENITY', label: 'Proximity', value: '🛍️ Shopping Malls' });
  if (nearParks) chips.push({ category: 'AMENITY', label: 'Proximity', value: '🌲 Forest & Parks' });
  if (nearTransit) chips.push({ category: 'AMENITY', label: 'Proximity', value: '🚆 Rapid Transit' });

  return {
    rawQuery: query,
    location: detectedLocation,
    priceRange: (minPrice !== undefined || maxPrice !== undefined) ? { minPrice, maxPrice } : undefined,
    beds,
    baths,
    propertyType,
    listingStatus,
    minCapRate,
    minPassFlowScore,
    amenities: {
      nearTopSchools,
      nearMalls,
      nearParks,
      nearTransit,
      highRoiOnly: highRoi,
      positiveCashFlow,
    },
    parsedChips: chips,
  };
}
