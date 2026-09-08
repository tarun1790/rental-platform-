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
  monthlyRentBudget?: number;
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

// Known geographic entities across 25+ US Metropolitan Regions
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
  { names: ['pilsen'], city: 'Chicago', state: 'IL', neighborhood: 'Pilsen', displayName: 'Pilsen, Chicago, IL' },
  { names: ['bridgeport'], city: 'Chicago', state: 'IL', neighborhood: 'Bridgeport', displayName: 'Bridgeport, Chicago, IL' },
  { names: ['humboldt park', 'humboldt'], city: 'Chicago', state: 'IL', neighborhood: 'Humboldt Park', displayName: 'Humboldt Park, Chicago, IL' },
  { names: ['uptown'], city: 'Chicago', state: 'IL', neighborhood: 'Uptown', displayName: 'Uptown, Chicago, IL' },
  { names: ['avondale'], city: 'Chicago', state: 'IL', neighborhood: 'Avondale', displayName: 'Avondale, Chicago, IL' },
  { names: ['albany park'], city: 'Chicago', state: 'IL', neighborhood: 'Albany Park', displayName: 'Albany Park, Chicago, IL' },
  { names: ['bronzeville'], city: 'Chicago', state: 'IL', neighborhood: 'Bronzeville', displayName: 'Bronzeville, Chicago, IL' },
  { names: ['andersonville', 'edgewater'], city: 'Chicago', state: 'IL', neighborhood: 'Edgewater', displayName: 'Edgewater, Chicago, IL' },
  { names: ['chicago', 'chicago il', 'il'], city: 'Chicago', state: 'IL', displayName: 'Chicago, IL' },

  // Colorado Metros
  { names: ['cherry creek', 'cherry crek'], city: 'Denver', state: 'CO', neighborhood: 'Cherry Creek', displayName: 'Denver (Cherry Creek), CO' },
  { names: ['chautauqua'], city: 'Boulder', state: 'CO', neighborhood: 'Chautauqua', displayName: 'Boulder (Chautauqua), CO' },
  { names: ['boulder', 'boulder co'], city: 'Boulder', state: 'CO', displayName: 'Boulder, CO' },
  { names: ['red mountain'], city: 'Aspen', state: 'CO', neighborhood: 'Red Mountain', displayName: 'Aspen (Red Mountain), CO' },
  { names: ['aspen', 'aspen co'], city: 'Aspen', state: 'CO', displayName: 'Aspen, CO' },
  { names: ['denver', 'denver co', 'dnver'], city: 'Denver', state: 'CO', displayName: 'Denver, CO' },
  { names: ['colorado', 'co'], city: 'Denver', state: 'CO', displayName: 'Colorado Region' },

  // Texas Metros
  { names: ['zilker'], city: 'Austin', state: 'TX', neighborhood: 'Zilker', displayName: 'Austin (Zilker), TX' },
  { names: ['south congress', 'the domain', 'domain'], city: 'Austin', state: 'TX', neighborhood: 'The Domain', displayName: 'Austin (Domain), TX' },
  { names: ['austin', 'austin tx'], city: 'Austin', state: 'TX', displayName: 'Austin, TX' },
  { names: ['highland park', 'uptown dallas'], city: 'Dallas', state: 'TX', neighborhood: 'Highland Park', displayName: 'Dallas (Highland Park), TX' },
  { names: ['dallas', 'dallas tx'], city: 'Dallas', state: 'TX', displayName: 'Dallas, TX' },

  // Washington Metros
  { names: ['capitol hill', 'cap hill'], city: 'Seattle', state: 'WA', neighborhood: 'Capitol Hill', displayName: 'Seattle (Capitol Hill), WA' },
  { names: ['queen anne'], city: 'Seattle', state: 'WA', neighborhood: 'Queen Anne', displayName: 'Seattle (Queen Anne), WA' },
  { names: ['ballard'], city: 'Seattle', state: 'WA', neighborhood: 'Ballard', displayName: 'Seattle (Ballard), WA' },
  { names: ['bellevue'], city: 'Seattle', state: 'WA', displayName: 'Bellevue, WA' },
  { names: ['seattle', 'seattle wa'], city: 'Seattle', state: 'WA', displayName: 'Seattle, WA' },

  // Florida Metros
  { names: ['brickell', 'brickel'], city: 'Miami', state: 'FL', neighborhood: 'Brickell', displayName: 'Miami (Brickell), FL' },
  { names: ['south beach'], city: 'Miami', state: 'FL', neighborhood: 'South Beach', displayName: 'Miami Beach, FL' },
  { names: ['coconut grove'], city: 'Miami', state: 'FL', neighborhood: 'Coconut Grove', displayName: 'Miami (Coconut Grove), FL' },
  { names: ['coral gables'], city: 'Miami', state: 'FL', neighborhood: 'Coral Gables', displayName: 'Coral Gables, FL' },
  { names: ['miami', 'miami fl'], city: 'Miami', state: 'FL', displayName: 'Miami, FL' },

  // California Metros
  { names: ['pacific heights'], city: 'San Francisco', state: 'CA', neighborhood: 'Pacific Heights', displayName: 'San Francisco (Pacific Heights), CA' },
  { names: ['soma', 'marina'], city: 'San Francisco', state: 'CA', neighborhood: 'SoMa / Marina', displayName: 'San Francisco, CA' },
  { names: ['san francisco', 'sf', 'bay area'], city: 'San Francisco', state: 'CA', displayName: 'San Francisco, CA' },
  { names: ['santa monica'], city: 'Los Angeles', state: 'CA', neighborhood: 'Santa Monica', displayName: 'Santa Monica, CA' },
  { names: ['beverly hills', 'beverly hils'], city: 'Los Angeles', state: 'CA', neighborhood: 'Beverly Hills', displayName: 'Beverly Hills, CA' },
  { names: ['silver lake', 'pasadena'], city: 'Los Angeles', state: 'CA', neighborhood: 'Silver Lake', displayName: 'Los Angeles, CA' },
  { names: ['los angeles', 'la'], city: 'Los Angeles', state: 'CA', displayName: 'Los Angeles, CA' },

  // East Coast Metros
  { names: ['tribeca', 'manhattan', 'manhatan', 'brooklyn', 'soho'], city: 'New York', state: 'NY', neighborhood: 'Tribeca', displayName: 'New York (Tribeca), NY' },
  { names: ['new york', 'nyc'], city: 'New York', state: 'NY', displayName: 'New York, NY' },
  { names: ['back bay', 'beacon hill', 'newbury st'], city: 'Boston', state: 'MA', neighborhood: 'Back Bay', displayName: 'Boston (Back Bay), MA' },
  { names: ['cambridge'], city: 'Boston', state: 'MA', displayName: 'Cambridge, MA' },
  { names: ['boston', 'boston ma'], city: 'Boston', state: 'MA', displayName: 'Boston, MA' },
  { names: ['buckhead'], city: 'Atlanta', state: 'GA', neighborhood: 'Buckhead', displayName: 'Atlanta (Buckhead), GA' },
  { names: ['atlanta', 'atlanta ga'], city: 'Atlanta', state: 'GA', displayName: 'Atlanta, GA' },
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

  // 2. Detect Monthly Rent vs Purchase Price Range
  let minPrice: number | undefined;
  let maxPrice: number | undefined;
  let monthlyRentBudget: number | undefined;

  // 2.1. Monthly Rent Budget Detection (e.g. "$2,500/mo", "rent under 3k", "around $1,800/month", "rent under 2200")
  const explicitRentMatch = normalized.match(/(?:under|below|around|approx|for|up to|max|\$)?\s*\$?([0-9.,]+)\s*(k)?\s*(?:\/mo|\/month|per month|a month|\bmo\b|\bmonth\b)/i);
  const rentPrefixMatch = normalized.match(/(?:rent|rental|lease|renting|apartment|studio)\s*(?:of|under|below|around|approx|for|up to|max|at)?\s*\$?([0-9.,]+)\s*(k)?(?!\s*(?:bed|bedroom|br|bds|bath))/i);

  const matchedRent = explicitRentMatch || rentPrefixMatch;
  if (matchedRent) {
    let val = parseFloat(matchedRent[1].replace(/,/g, ''));
    const unit = (matchedRent[2] || '').toLowerCase();
    if (unit === 'k') val *= 1000;
    if (val >= 400 && val <= 25000) {
      monthlyRentBudget = Math.round(val);
      chips.push({
        category: 'PRICE',
        label: 'Monthly Rent',
        value: `< $${monthlyRentBudget.toLocaleString()}/mo`,
      });
    }
  }

  // 2.2. Purchase Price Range (only if monthlyRentBudget is not already parsed)
  if (!monthlyRentBudget) {
    // Under / Max price: e.g., "under 800k", "below $1.2m", "less than 650000", "under $900,000"
    const underPriceMatch = normalized.match(/(?:under|below|less than|max|up to)\s*\$?([0-9.,]+)\s*(k|m|million|thousand)?(?!\s*(?:\/mo|\/month|per month|a month|\bmo\b|\bmonth\b|%|percent|\bcap\b|\broi\b|\bbed\b|\bbeds\b|\bbr\b|\bbath\b|\bbaths\b))/i);
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
    const overPriceMatch = normalized.match(/(?:over|above|greater than|min|at least)\s*\$?([0-9.,]+)\s*(k|m|million|thousand)?(?!\s*(?:\/mo|\/month|per month|a month|\bmo\b|\bmonth\b|%|percent|\bcap\b|\broi\b|\bbed\b|\bbeds\b|\bbr\b|\bbath\b|\bbaths\b))/i);
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

    // Target / Approx Price: e.g. "for 400k", "around 400k", "at 400k", "about 400k", "approx 400k", "budget 400k", "priced at 400k", "in the range of 400k"
    if (!maxPrice && !minPrice) {
      const targetPriceMatch = normalized.match(/(?:for|around|about|approx|approx\.|approximately|budget(?:\s*of)?|price(?:\s*of)?|priced\s*(?:at|around)?|at|in the range of|near)\s*\$?([0-9.,]+)\s*(k|m|million|thousand)?(?!\s*(?:\/mo|\/month|per month|a month|\bmo\b|\bmonth\b))/i);
      if (targetPriceMatch) {
        let val = parseFloat(targetPriceMatch[1].replace(/,/g, ''));
        const unit = (targetPriceMatch[2] || '').toLowerCase();
        if (unit === 'k' || unit === 'thousand') val *= 1000;
        else if (unit === 'm' || unit === 'million') val *= 1000000;
        else if (val < 2000) val *= 1000;

        maxPrice = Math.round(val);
        chips.push({
          category: 'PRICE',
          label: 'Target Budget',
          value: `~$${maxPrice.toLocaleString()}`,
        });
      }
    }

    // Standalone Price Notation: e.g. "400k house", "$400k home", "$450,000 condo", "house 400k"
    if (!maxPrice && !minPrice) {
      const standalonePriceMatch = normalized.match(/(?:^|\s)\$?([0-9.,]+)\s*(k|m|million|thousand)\b(?!\s*(?:\/mo|\/month|per month|a month|\bmo\b|\bmonth\b|bed|br|bath|acre|sqft|ft))/i);
      if (standalonePriceMatch) {
        let val = parseFloat(standalonePriceMatch[1].replace(/,/g, ''));
        const unit = (standalonePriceMatch[2] || '').toLowerCase();
        if (unit === 'k' || unit === 'thousand') val *= 1000;
        else if (unit === 'm' || unit === 'million') val *= 1000000;
        else if (val < 2000) val *= 1000;

        maxPrice = Math.round(val);
        chips.push({
          category: 'PRICE',
          label: 'Target Price',
          value: `~$${maxPrice.toLocaleString()}`,
        });
      }
    }

    // Full formatted dollar numbers: e.g. "$400,000"
    if (!maxPrice && !minPrice) {
      const dollarFullMatch = normalized.match(/\$([0-9]{2,3}(?:,\d{3})+)(?!\s*(?:\/mo|\/month|per month|a month|\bmo\b|\bmonth\b))/);
      if (dollarFullMatch) {
        const val = parseFloat(dollarFullMatch[1].replace(/,/g, ''));
        if (val >= 30000) {
          maxPrice = Math.round(val);
          chips.push({
            category: 'PRICE',
            label: 'Target Price',
            value: `~$${maxPrice.toLocaleString()}`,
          });
        }
      }
    }
  }

  // 3. Detect Bedrooms
  let beds: number | undefined;
  const bedsMatch = normalized.match(/(\d+)\s*(?:\+)?\s*(?:bed|bedroom|bds|br)s?\b/i);
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
  const bathsMatch = normalized.match(/(\d+(?:\.\d+)?)\s*(?:\+)?\s*(?:bath|bathroom|ba)s?\b/i);
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

  const capRateMatch = normalized.match(/(?:cap\s*rate|caprate)\s*(?:of|>|>=|at least|over|above)?\s*([0-9.]+)\s*%/i) || normalized.match(/([0-9.]+)\s*%\s*(?:cap\s*rate|caprate)/i);
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
    monthlyRentBudget,
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
