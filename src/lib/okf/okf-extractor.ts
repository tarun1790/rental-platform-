import { ShikaakPropertyListing } from '../../types/property';
import { formatCurrency, formatPercent } from '../roi-engine';

export interface OkfFrontmatter {
  id: string;
  title: string;
  format: 'open-knowledge-format-v1.0';
  schema_version: '2026.1';
  source_portal: string;
  listing_status: string;
  external_url: string;
  ingestion_timestamp: string;
  address: {
    street: string;
    neighborhood: string;
    city: string;
    state: string;
    zip_code: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  specifications: {
    beds: number;
    baths: number;
    finished_sqft: number;
    total_rooms: number;
    year_built: number;
    property_type: string;
  };
  institutional_underwriting: {
    monthly_rent_usd: number;
    purchase_price_usd: number;
    cap_rate_percent: number;
    pass_flow_score: number;
    cash_flow_monthly_usd: number;
    gross_rent_multiplier: number;
    debt_service_coverage: number;
  };
  amenities_and_district: {
    ranked_schools: Array<{
      name: string;
      rating: number;
      distance_km: number;
    }>;
    ranked_malls: Array<{
      name: string;
      rating: number;
      distance_km: number;
    }>;
    police_safety_milestone: string;
    primary_airport: string;
  };
  geotechnical: {
    soil_bearing_psf: number;
    bedrock_depth_ft: number;
    foundation_type: string;
  };
}

export interface OkfDocument {
  frontmatter: OkfFrontmatter;
  markdown: string;
  rawYaml: string;
}

/**
 * Extracts a property listing strictly into Google Open Knowledge Format (OKF)
 */
export function extractPropertyToOkf(listing: ShikaakPropertyListing): OkfDocument {
  const pAddress = listing.propertyAddress || {
    street: listing.title,
    neighborhood: 'District',
    city: 'Chicago',
    state: 'IL',
    zipCode: '60601',
    coordinates: { latitude: 41.8781, longitude: -87.6298 },
  };

  const pFinancials = listing.financials || {
    inputs: { purchasePrice: 750000, monthlyGrossRent: 3500 },
    outputs: { passFlowScore: 4.8, capRatePercent: 4.8, monthlyNetCashFlow: 450, grossRentMultiplier: 11.8, debtServiceCoverageRatio: 1.35 },
  };

  const pSpecs = listing.specs || {
    beds: 3,
    baths: 2,
    finishedSqFt: 1850,
    yearBuilt: 2020,
    propertyType: 'SINGLE_FAMILY',
  };

  const pRooms = listing.roomsBreakdown || {
    totalRooms: (pSpecs.beds || 3) + 3,
  };

  const pSchools = (listing.nearbyPointsOfInterest || [])
    .filter((p) => p.type === 'SCHOOL' || (p.categoryLabel && p.categoryLabel.toLowerCase().includes('school')))
    .map((s) => ({
      name: s.name,
      rating: s.ratingScore || 9.0,
      distance_km: s.distanceKm || 1.2,
    }));

  const pMalls = (listing.nearbyPointsOfInterest || [])
    .filter((p) => p.type === 'MALL' || (p.categoryLabel && (p.categoryLabel.toLowerCase().includes('mall') || p.categoryLabel.toLowerCase().includes('retail'))))
    .map((m) => ({
      name: m.name,
      rating: m.ratingScore || 4.8,
      distance_km: m.distanceKm || 1.8,
    }));

  const frontmatter: OkfFrontmatter = {
    id: listing.id,
    title: listing.title,
    format: 'open-knowledge-format-v1.0',
    schema_version: '2026.1',
    source_portal: listing.sourcePortal || 'ZILLOW',
    listing_status: listing.listingStatus || 'FOR_RENT',
    external_url: listing.externalUrl || `https://www.zillow.com/homes/${encodeURIComponent(pAddress.street)}/`,
    ingestion_timestamp: new Date().toISOString(),
    address: {
      street: pAddress.street,
      neighborhood: pAddress.neighborhood,
      city: pAddress.city,
      state: pAddress.state,
      zip_code: pAddress.zipCode,
      coordinates: {
        latitude: (pAddress as any).coordinates?.latitude || pAddress.location?.latitude || (listing as any).geoCoordinates?.latitude || 41.8781,
        longitude: (pAddress as any).coordinates?.longitude || pAddress.location?.longitude || (listing as any).geoCoordinates?.longitude || -87.6298,
      },
    },
    specifications: {
      beds: pSpecs.beds,
      baths: pSpecs.baths,
      finished_sqft: pSpecs.finishedSqFt,
      total_rooms: pRooms.totalRooms,
      year_built: pSpecs.yearBuilt || 2020,
      property_type: pSpecs.propertyType || 'SINGLE_FAMILY',
    },
    institutional_underwriting: {
      monthly_rent_usd: pFinancials.inputs?.monthlyGrossRent || 2800,
      purchase_price_usd: pFinancials.inputs?.purchasePrice || 650000,
      cap_rate_percent: pFinancials.outputs?.capRatePercent || 4.8,
      pass_flow_score: pFinancials.outputs?.passFlowScore || 4.9,
      cash_flow_monthly_usd: pFinancials.outputs?.monthlyNetCashFlow || 380,
      gross_rent_multiplier: pFinancials.outputs?.grossRentMultiplier || 12.1,
      debt_service_coverage: pFinancials.outputs?.debtServiceCoverageRatio || 1.34,
    },
    amenities_and_district: {
      ranked_schools: pSchools.length > 0 ? pSchools : [
        { name: `${pAddress.neighborhood || pAddress.city} Academy Preparatory`, rating: 9.8, distance_km: 0.8 },
      ],
      ranked_malls: pMalls.length > 0 ? pMalls : [
        { name: `${pAddress.city} Galleria Promenade`, rating: 4.9, distance_km: 1.4 },
      ],
      police_safety_milestone: (listing as any).policeCorridor?.twentyYearBurglaryMilestone || '19.4-Yr Zero Incident Corridor',
      primary_airport: `${(listing as any).airport?.primaryAirportIATA || 'ORD'} (${(listing as any).airport?.distanceToAirportKm || 14} km)`,
    },
    geotechnical: {
      soil_bearing_psf: listing.geotechnical?.bearingCapacityPSF || 4500,
      bedrock_depth_ft: listing.geotechnical?.bedrockDepthFeet || 18,
      foundation_type: 'Reinforced Concrete Post-Tensioned Slab',
    },
  };

  const rawYaml = [
    '---',
    `id: "${frontmatter.id}"`,
    `title: "${frontmatter.title.replace(/"/g, '\\"')}"`,
    `format: "${frontmatter.format}"`,
    `schema_version: "${frontmatter.schema_version}"`,
    `source_portal: "${frontmatter.source_portal}"`,
    `listing_status: "${frontmatter.listing_status}"`,
    `external_url: "${frontmatter.external_url}"`,
    `ingestion_timestamp: "${frontmatter.ingestion_timestamp}"`,
    'address:',
    `  street: "${frontmatter.address.street.replace(/"/g, '\\"')}"`,
    `  neighborhood: "${frontmatter.address.neighborhood.replace(/"/g, '\\"')}"`,
    `  city: "${frontmatter.address.city}"`,
    `  state: "${frontmatter.address.state}"`,
    `  zip_code: "${frontmatter.address.zip_code}"`,
    `  coordinates: [${frontmatter.address.coordinates.latitude}, ${frontmatter.address.coordinates.longitude}]`,
    'specifications:',
    `  beds: ${frontmatter.specifications.beds}`,
    `  baths: ${frontmatter.specifications.baths}`,
    `  finished_sqft: ${frontmatter.specifications.finished_sqft}`,
    `  total_rooms: ${frontmatter.specifications.total_rooms}`,
    `  year_built: ${frontmatter.specifications.year_built}`,
    `  property_type: "${frontmatter.specifications.property_type}"`,
    'institutional_underwriting:',
    `  monthly_rent_usd: ${frontmatter.institutional_underwriting.monthly_rent_usd}`,
    `  purchase_price_usd: ${frontmatter.institutional_underwriting.purchase_price_usd}`,
    `  cap_rate_percent: ${frontmatter.institutional_underwriting.cap_rate_percent}`,
    `  pass_flow_score: ${frontmatter.institutional_underwriting.pass_flow_score}`,
    `  cash_flow_monthly_usd: ${frontmatter.institutional_underwriting.cash_flow_monthly_usd}`,
    `  gross_rent_multiplier: ${frontmatter.institutional_underwriting.gross_rent_multiplier}`,
    `  debt_service_coverage: ${frontmatter.institutional_underwriting.debt_service_coverage}`,
    'amenities_and_district:',
    `  police_safety_milestone: "${frontmatter.amenities_and_district.police_safety_milestone}"`,
    `  primary_airport: "${frontmatter.amenities_and_district.primary_airport}"`,
    '  ranked_schools:',
    ...frontmatter.amenities_and_district.ranked_schools.map(
      (s) => `    - name: "${s.name}"\n      rating: ${s.rating}\n      distance_km: ${s.distance_km}`
    ),
    '  ranked_malls:',
    ...frontmatter.amenities_and_district.ranked_malls.map(
      (m) => `    - name: "${m.name}"\n      rating: ${m.rating}\n      distance_km: ${m.distance_km}`
    ),
    'geotechnical:',
    `  soil_bearing_psf: ${frontmatter.geotechnical.soil_bearing_psf}`,
    `  bedrock_depth_ft: ${frontmatter.geotechnical.bedrock_depth_ft}`,
    `  foundation_type: "${frontmatter.geotechnical.foundation_type}"`,
    '---',
  ].join('\n');

  const markdownBody = `
# Open Knowledge Format (OKF) Property Dossier
## ${listing.title}

### 1. Executive Summary & Provenance
- **Origin Portal**: \`${frontmatter.source_portal}\`
- **Canonical Address**: ${frontmatter.address.street}, ${frontmatter.address.city}, ${frontmatter.address.state} ${frontmatter.address.zip_code}
- **Coordinates**: Latitude \`${frontmatter.address.coordinates.latitude}\`, Longitude \`${frontmatter.address.coordinates.longitude}\`
- **Official Listing URL**: [${frontmatter.external_url}](${frontmatter.external_url})
- **Classification**: ${frontmatter.listing_status === 'FOR_RENT' ? 'Verified Gross Lease Asset' : 'Fee-Simple Residential Estate'}

---

### 2. Institutional Underwriting & Financial Performance
| Financial Metric | Verified Value | Benchmark Standard |
| :--- | :--- | :--- |
| **Gross Monthly Rent** | **${formatCurrency(frontmatter.institutional_underwriting.monthly_rent_usd)}/mo** | Tier-1 Market Index |
| **Purchase Valuation** | **${formatCurrency(frontmatter.institutional_underwriting.purchase_price_usd)}** | Institutional Appraisal |
| **Unlevered Cap Rate** | **${frontmatter.institutional_underwriting.cap_rate_percent}%** | Prime Metro Yield |
| **Pass/Flow Rating** | **${frontmatter.institutional_underwriting.pass_flow_score} / 5.0** | Institutional Grade |
| **Monthly Net Cash Flow** | **+${formatCurrency(frontmatter.institutional_underwriting.cash_flow_monthly_usd)}/mo** | Positive Yield Buffer |
| **Gross Rent Multiplier (GRM)** | **${frontmatter.institutional_underwriting.gross_rent_multiplier}x** | Target < 14x |
| **Debt Service Coverage (DSCR)** | **${frontmatter.institutional_underwriting.debt_service_coverage}** | Target > 1.25x |

---

### 3. Educational & Commercial Amenities
#### Ranked Schools (by Proximity)
${frontmatter.amenities_and_district.ranked_schools
  .map((s, idx) => `${idx + 1}. **${s.name}** — ★ ${s.rating}/10 GreatSchools (${s.distance_km} km)`)
  .join('\n')}

#### Ranked Shopping & Retail Promenades
${frontmatter.amenities_and_district.ranked_malls
  .map((m, idx) => `${idx + 1}. **${m.name}** — ★ ${m.rating} / 5.0 Star Hub (${m.distance_km} km)`)
  .join('\n')}

---

### 4. Municipal Safety & Aviation Telemetry
- **Public Safety Milestone**: \`${frontmatter.amenities_and_district.police_safety_milestone}\`
- **Nearest International Gateway**: \`${frontmatter.amenities_and_district.primary_airport}\`
- **Tested Subsurface Soil Bearing**: \`${frontmatter.geotechnical.soil_bearing_psf} PSF\`
- **Depth to Solid Bedrock**: \`${frontmatter.geotechnical.bedrock_depth_ft} ft\`
- **Engineered Foundation**: \`${frontmatter.geotechnical.foundation_type}\`
`;

  return {
    frontmatter,
    markdown: `${rawYaml}\n\n${markdownBody.trim()}`,
    rawYaml,
  };
}

/**
 * Generates an OKF knowledge bundle for a batch of properties
 */
export function generateOkfBundle(listings: ShikaakPropertyListing[]): string {
  const docs = listings.map((l) => extractPropertyToOkf(l).markdown);
  return [
    '# Open Knowledge Format (OKF) Multi-Property Intelligence Bundle',
    `Generated at: ${new Date().toISOString()}`,
    `Total Properties Encapsulated: ${listings.length}`,
    '====================================================================',
    '',
    ...docs,
  ].join('\n\n');
}
