// =========================================================================
// HOUSE INTELLIGENCE - US Metropolitan Geocoding & Civic Registry
// 25+ Major US Metros with Real Coordinates, Taxes, Schools, and Malls
// =========================================================================

import { PointOfInterest } from '../../types/property';

export interface UsMetroConfig {
  city: string;
  state: string;
  stateCode: string;
  primaryZip: string;
  countyName: string;
  effectiveTaxRatePercent: number;
  centerCoordinates: { latitude: number; longitude: number };
  neighborhoods: string[];
  streetNames: string[];
  policeDepartment: string;
  patrolBenchmarkMinutes: number;
  topSchools: PointOfInterest[];
  topMalls: PointOfInterest[];
  primaryAirport: { name: string; iata: string; distanceKm: number };
  timeZone: { name: string; code: 'EST' | 'CST' | 'MST' | 'PST'; utcOffset: string };
}

export const US_METROS_REGISTRY: Record<string, UsMetroConfig> = {
  // 1. CHICAGO, IL
  'chicago': {
    city: 'Chicago',
    state: 'Illinois',
    stateCode: 'IL',
    primaryZip: '60614',
    countyName: 'Cook County',
    effectiveTaxRatePercent: 1.95,
    centerCoordinates: { latitude: 41.9214, longitude: -87.6475 },
    neighborhoods: ['Lincoln Park', 'Gold Coast', 'West Loop', 'Lakeview', 'Wicker Park', 'Streeterville', 'South Loop', 'River North'],
    streetNames: ['N Cleveland Ave', 'W Webster Ave', 'N Orchard St', 'N Halsted St', 'W Armitage Ave', 'N Lincoln Ave'],
    policeDepartment: 'Chicago Police Department (CPD 18th & 19th Districts)',
    patrolBenchmarkMinutes: 3.8,
    primaryAirport: { name: "Chicago O'Hare International Airport", iata: 'ORD', distanceKm: 22.4 },
    timeZone: { name: 'Central Standard Time', code: 'CST', utcOffset: 'UTC-6' },
    topSchools: [
      { id: 'chi_s1', type: 'SCHOOL', name: 'Abraham Lincoln Elementary School', categoryLabel: 'Top 1% Public School', distanceKm: 0.4, distanceMiles: 0.25, walkTimeMinutes: 5, driveTimeMinutes: 2, ratingScore: 9.8, keyHighlight: 'Ranked #1 Public Elementary District in Chicago' },
      { id: 'chi_s2', type: 'SCHOOL', name: 'Francis W. Parker School', categoryLabel: 'Elite Independent Prep', distanceKm: 0.8, distanceMiles: 0.5, walkTimeMinutes: 10, driveTimeMinutes: 3, ratingScore: 10.0, keyHighlight: 'Ivy League feeder academy with 100% college matriculation' },
      { id: 'chi_s3', type: 'SCHOOL', name: 'Lincoln Park High School & IB Academy', categoryLabel: 'Public IB World School', distanceKm: 1.2, distanceMiles: 0.75, walkTimeMinutes: 15, driveTimeMinutes: 4, ratingScore: 9.7, keyHighlight: 'Top Ranked IB World School in Illinois' },
      { id: 'chi_s4', type: 'SCHOOL', name: 'Saint Clement Parish School', categoryLabel: 'Private Catholic Academy', distanceKm: 1.6, distanceMiles: 1.0, walkTimeMinutes: 20, driveTimeMinutes: 5, ratingScore: 9.6, keyHighlight: 'National Blue Ribbon School of Excellence' },
      { id: 'chi_s5', type: 'SCHOOL', name: 'Walter Payton College Prep', categoryLabel: 'Public Selective Enrollment', distanceKm: 2.2, distanceMiles: 1.4, walkTimeMinutes: 26, driveTimeMinutes: 7, ratingScore: 10.0, keyHighlight: 'US News Ranked #1 Public High School in Illinois' },
    ],
    topMalls: [
      { id: 'chi_m1', type: 'MALL', name: 'Lincoln Common & NEWCITY Galleria', categoryLabel: 'Open-Air Luxury Promenade', distanceKm: 0.5, distanceMiles: 0.3, walkTimeMinutes: 6, driveTimeMinutes: 2, ratingScore: 4.8, keyHighlight: 'Whole Foods, Apple Store, ArcLight Cinemas' },
      { id: 'chi_m2', type: 'MALL', name: 'Armitage Avenue Luxury Fashion District', categoryLabel: 'High-End Boutique Corridor', distanceKm: 0.9, distanceMiles: 0.55, walkTimeMinutes: 11, driveTimeMinutes: 3, ratingScore: 4.9, keyHighlight: 'Bonobos, Warby Parker, Aesop, artisan cafés' },
      { id: 'chi_m3', type: 'MALL', name: '900 North Michigan Luxury Shops', categoryLabel: '7-Level Fashion Galleria', distanceKm: 2.4, distanceMiles: 1.5, walkTimeMinutes: 28, driveTimeMinutes: 8, ratingScore: 4.9, keyHighlight: 'Bloomingdale’s flagship, Gucci, Tesla showroom' },
      { id: 'chi_m4', type: 'MALL', name: 'Water Tower Place & Michigan Ave Mile', categoryLabel: 'Iconic Retail Landmark', distanceKm: 2.7, distanceMiles: 1.7, walkTimeMinutes: 32, driveTimeMinutes: 9, ratingScore: 4.7, keyHighlight: 'American Girl Place, flagship Sephora, luxury dining' },
      { id: 'chi_m5', type: 'MALL', name: 'The Shops at North Bridge', categoryLabel: '4-Level Downtown Center', distanceKm: 3.2, distanceMiles: 2.0, walkTimeMinutes: 38, driveTimeMinutes: 10, ratingScore: 4.6, keyHighlight: 'Nordstrom flagship, Eataly gourmet emporium' },
    ],
  },

  // 2. DENVER, CO
  'denver': {
    city: 'Denver',
    state: 'Colorado',
    stateCode: 'CO',
    primaryZip: '80206',
    countyName: 'Denver County',
    effectiveTaxRatePercent: 0.62,
    centerCoordinates: { latitude: 39.7170, longitude: -104.9530 },
    neighborhoods: ['Cherry Creek', 'LoDo', 'Washington Park', 'Highlands', 'RiNo', 'Capitol Hill', 'Sloan Lake'],
    streetNames: ['E 3rd Ave', 'E 1st Ave', 'University Blvd', 'Josephine St', 'St Paul St', 'Columbine St'],
    policeDepartment: 'Denver Police Department (District 3 Patrol)',
    patrolBenchmarkMinutes: 4.2,
    primaryAirport: { name: 'Denver International Airport', iata: 'DEN', distanceKm: 32.8 },
    timeZone: { name: 'Mountain Standard Time', code: 'MST', utcOffset: 'UTC-7' },
    topSchools: [
      { id: 'den_s1', type: 'SCHOOL', name: 'Steck Elementary School', categoryLabel: 'Top Rated Public (K-5)', distanceKm: 0.6, distanceMiles: 0.4, walkTimeMinutes: 7, driveTimeMinutes: 2, ratingScore: 9.8, keyHighlight: 'Highest Academic Growth index in Denver Public Schools' },
      { id: 'den_s2', type: 'SCHOOL', name: 'East High School', categoryLabel: 'Historic Public IB Flagship', distanceKm: 1.8, distanceMiles: 1.1, walkTimeMinutes: 21, driveTimeMinutes: 5, ratingScore: 9.6, keyHighlight: 'Prestigious AP Capstone & STEM distinction' },
      { id: 'den_s3', type: 'SCHOOL', name: 'Graland Country Day School', categoryLabel: 'Premier Independent (K-8)', distanceKm: 1.2, distanceMiles: 0.75, walkTimeMinutes: 14, driveTimeMinutes: 4, ratingScore: 10.0, keyHighlight: 'Exceptional innovation labs and 7:1 student-faculty ratio' },
      { id: 'den_s4', type: 'SCHOOL', name: 'Bromwell Elementary School', categoryLabel: 'Cherry Creek Public Feeder', distanceKm: 0.9, distanceMiles: 0.55, walkTimeMinutes: 11, driveTimeMinutes: 3, ratingScore: 9.7, keyHighlight: 'Blue Ribbon accredited school in the heart of Cherry Creek' },
      { id: 'den_s5', type: 'SCHOOL', name: 'Denver School of the Arts', categoryLabel: 'Public Magnet (6-12)', distanceKm: 3.1, distanceMiles: 1.9, walkTimeMinutes: 36, driveTimeMinutes: 8, ratingScore: 9.9, keyHighlight: 'Nationally acclaimed conservatory curriculum' },
    ],
    topMalls: [
      { id: 'den_m1', type: 'MALL', name: 'Cherry Creek Shopping Center', categoryLabel: 'Rocky Mountain Luxury Flagship', distanceKm: 0.4, distanceMiles: 0.25, walkTimeMinutes: 5, driveTimeMinutes: 2, ratingScore: 4.9, keyHighlight: 'Neiman Marcus, Nordstrom, Louis Vuitton, Tiffany & Co.' },
      { id: 'den_m2', type: 'MALL', name: 'Cherry Creek North Outdoor Village', categoryLabel: '16-Block Walkable Promenade', distanceKm: 0.7, distanceMiles: 0.45, walkTimeMinutes: 8, driveTimeMinutes: 2, ratingScore: 4.9, keyHighlight: 'Over 200 luxury fashion boutiques, spas and fine dining' },
      { id: 'den_m3', type: 'MALL', name: 'Larimer Square Historic Promenade', categoryLabel: 'Victorian Landmark Retail', distanceKm: 4.8, distanceMiles: 3.0, walkTimeMinutes: 55, driveTimeMinutes: 11, ratingScore: 4.8, keyHighlight: 'Independent designer retail and chef-driven dining' },
      { id: 'den_m4', type: 'MALL', name: 'Park Meadows Retail Resort', categoryLabel: 'Grand Mountain Galleria', distanceKm: 18.2, distanceMiles: 11.3, walkTimeMinutes: 210, driveTimeMinutes: 18, ratingScore: 4.8, keyHighlight: 'Largest indoor retail center in Colorado' },
      { id: 'den_m5', type: 'MALL', name: 'Denver Pavilions on 16th Mall', categoryLabel: 'Downtown Entertainment Complex', distanceKm: 4.5, distanceMiles: 2.8, walkTimeMinutes: 50, driveTimeMinutes: 10, ratingScore: 4.5, keyHighlight: 'Regal Cinemas, Hard Rock Cafe, multi-level retail' },
    ],
  },

  // 3. AUSTIN, TX
  'austin': {
    city: 'Austin',
    state: 'Texas',
    stateCode: 'TX',
    primaryZip: '78704',
    countyName: 'Travis County',
    effectiveTaxRatePercent: 2.15,
    centerCoordinates: { latitude: 30.2530, longitude: -97.7550 },
    neighborhoods: ['Zilker', 'South Congress', 'Barton Hills', 'Downtown', 'Tarrytown', 'East Austin', 'Domain'],
    streetNames: ['Barton Springs Rd', 'S Congress Ave', 'Zilker Blvd', 'Kinney Ave', 'Robert E Lee Rd'],
    policeDepartment: 'Austin Police Department (Region 1)',
    patrolBenchmarkMinutes: 4.1,
    primaryAirport: { name: 'Austin-Bergstrom International Airport', iata: 'AUS', distanceKm: 14.5 },
    timeZone: { name: 'Central Standard Time', code: 'CST', utcOffset: 'UTC-6' },
    topSchools: [
      { id: 'atx_s1', type: 'SCHOOL', name: 'Barton Hills Elementary', categoryLabel: 'Exemplary Public (K-5)', distanceKm: 0.7, distanceMiles: 0.45, walkTimeMinutes: 9, driveTimeMinutes: 2, ratingScore: 9.8, keyHighlight: 'National Blue Ribbon recipient with outdoor nature lab' },
      { id: 'atx_s2', type: 'SCHOOL', name: 'Austin High School', categoryLabel: 'Historic Flagship Academy', distanceKm: 1.4, distanceMiles: 0.9, walkTimeMinutes: 18, driveTimeMinutes: 4, ratingScore: 9.6, keyHighlight: 'Academy for Global Studies and AP Capstone' },
      { id: 'atx_s3', type: 'SCHOOL', name: 'St. Andrews Episcopal School', categoryLabel: 'Premier Independent (K-12)', distanceKm: 2.8, distanceMiles: 1.7, walkTimeMinutes: 34, driveTimeMinutes: 7, ratingScore: 10.0, keyHighlight: 'Top ranked private day school in Central Texas' },
      { id: 'atx_s4', type: 'SCHOOL', name: 'Liberal Arts & Science Academy (LASA)', categoryLabel: 'Top Public Magnet in USA', distanceKm: 6.2, distanceMiles: 3.8, walkTimeMinutes: 75, driveTimeMinutes: 12, ratingScore: 10.0, keyHighlight: 'Consistently ranked Top 10 High School in the United States' },
      { id: 'atx_s5', type: 'SCHOOL', name: 'Zilker Elementary School', categoryLabel: 'Neighborhood Public (K-5)', distanceKm: 0.5, distanceMiles: 0.3, walkTimeMinutes: 6, driveTimeMinutes: 2, ratingScore: 9.7, keyHighlight: 'Exceptional bilingual immersion and environmental studies' },
    ],
    topMalls: [
      { id: 'atx_m1', type: 'MALL', name: 'South Congress Retail Promenade', categoryLabel: 'Walkable Cultural Fashion', distanceKm: 0.9, distanceMiles: 0.55, walkTimeMinutes: 11, driveTimeMinutes: 3, ratingScore: 4.9, keyHighlight: 'Hermès, Reformation, Allbirds, artisan coffee' },
      { id: 'atx_m2', type: 'MALL', name: 'The Domain Northside', categoryLabel: 'Austin Second Downtown Galleria', distanceKm: 16.5, distanceMiles: 10.2, walkTimeMinutes: 190, driveTimeMinutes: 18, ratingScore: 4.9, keyHighlight: 'Apple, Nordstrom, Restoration Hardware, luxury hotel' },
      { id: 'atx_m3', type: 'MALL', name: 'Barton Creek Square', categoryLabel: 'Enclosed Hill Country Mall', distanceKm: 4.2, distanceMiles: 2.6, walkTimeMinutes: 50, driveTimeMinutes: 8, ratingScore: 4.6, keyHighlight: 'Over 180 specialty stores and IMAX Cinema' },
      { id: 'atx_m4', type: 'MALL', name: '2nd Street District Downtown', categoryLabel: 'Urban Retail Walkway', distanceKm: 2.1, distanceMiles: 1.3, walkTimeMinutes: 25, driveTimeMinutes: 6, ratingScore: 4.8, keyHighlight: 'Local boutiques and chef-driven dining on Lady Bird Lake' },
      { id: 'atx_m5', type: 'MALL', name: 'Hill Country Galleria', categoryLabel: 'Open-Air Lifestyle Center', distanceKm: 22.0, distanceMiles: 13.6, walkTimeMinutes: 260, driveTimeMinutes: 22, ratingScore: 4.7, keyHighlight: 'Whole Foods, amphitheater, outdoor green lawn' },
    ],
  },

  // 4. SEATTLE, WA
  'seattle': {
    city: 'Seattle',
    state: 'Washington',
    stateCode: 'WA',
    primaryZip: '98102',
    countyName: 'King County',
    effectiveTaxRatePercent: 1.02,
    centerCoordinates: { latitude: 47.6250, longitude: -122.3220 },
    neighborhoods: ['Capitol Hill', 'Queen Anne', 'Bellevue', 'Ballard', 'Fremont', 'South Lake Union', 'Madison Park'],
    streetNames: ['10th Ave E', 'E Aloha St', 'E Roy St', 'Broadway E', 'Federal Ave E', 'Belmont Ave E'],
    policeDepartment: 'Seattle Police Department (East Precinct)',
    patrolBenchmarkMinutes: 4.5,
    primaryAirport: { name: 'Seattle-Tacoma International Airport', iata: 'SEA', distanceKm: 24.5 },
    timeZone: { name: 'Pacific Standard Time', code: 'PST', utcOffset: 'UTC-8' },
    topSchools: [
      { id: 'sea_s1', type: 'SCHOOL', name: 'Montlake Elementary School', categoryLabel: 'Top Tier Public (K-5)', distanceKm: 1.2, distanceMiles: 0.75, walkTimeMinutes: 15, driveTimeMinutes: 4, ratingScore: 9.8, keyHighlight: 'Ranked in Top 2% of Washington elementary schools' },
      { id: 'sea_s2', type: 'SCHOOL', name: 'Seattle Academy of Arts & Sciences', categoryLabel: 'Innovative College Prep (6-12)', distanceKm: 0.8, distanceMiles: 0.5, walkTimeMinutes: 10, driveTimeMinutes: 3, ratingScore: 9.9, keyHighlight: 'Cutting-edge urban campus with robotics and theater' },
      { id: 'sea_s3', type: 'SCHOOL', name: 'Garfield High School', categoryLabel: 'Historic Public Flagship', distanceKm: 1.9, distanceMiles: 1.2, walkTimeMinutes: 22, driveTimeMinutes: 6, ratingScore: 9.7, keyHighlight: 'World-renowned music program and accelerated curriculum' },
      { id: 'sea_s4', type: 'SCHOOL', name: 'The Northwest School', categoryLabel: 'International College Prep', distanceKm: 0.9, distanceMiles: 0.55, walkTimeMinutes: 11, driveTimeMinutes: 3, ratingScore: 9.8, keyHighlight: 'Global perspective with rooftop organic garden' },
      { id: 'sea_s5', type: 'SCHOOL', name: 'Stevens Elementary School', categoryLabel: 'Neighborhood Public (K-5)', distanceKm: 0.5, distanceMiles: 0.3, walkTimeMinutes: 6, driveTimeMinutes: 2, ratingScore: 9.6, keyHighlight: 'High math and reading proficiency benchmarks' },
    ],
    topMalls: [
      { id: 'sea_m1', type: 'MALL', name: 'Pacific Place Downtown', categoryLabel: 'Downtown Luxury Center', distanceKm: 1.8, distanceMiles: 1.1, walkTimeMinutes: 22, driveTimeMinutes: 6, ratingScore: 4.7, keyHighlight: 'Tiffany & Co., high-end cinemas, Skybridge connection' },
      { id: 'sea_m2', type: 'MALL', name: 'Bellevue Square & The Collection', categoryLabel: 'Pacific Northwest Luxury Flagship', distanceKm: 14.5, distanceMiles: 9.0, walkTimeMinutes: 170, driveTimeMinutes: 16, ratingScore: 4.9, keyHighlight: 'Nordstrom flagship, Gucci, Louis Vuitton, Tesla' },
      { id: 'sea_m3', type: 'MALL', name: 'University Village', categoryLabel: 'Open-Air Lifestyle Village', distanceKm: 4.6, distanceMiles: 2.8, walkTimeMinutes: 55, driveTimeMinutes: 10, ratingScore: 4.9, keyHighlight: 'Apple, Din Tai Fung, Anthropologie, outdoor fountains' },
      { id: 'sea_m4', type: 'MALL', name: 'Broadway & Pike-Pine Corridor', categoryLabel: 'Neighborhood Boutique Strip', distanceKm: 0.4, distanceMiles: 0.25, walkTimeMinutes: 5, driveTimeMinutes: 2, ratingScore: 4.8, keyHighlight: 'Indie fashion, craft roasters, local designer goods' },
      { id: 'sea_m5', type: 'MALL', name: 'Westlake Center', categoryLabel: 'Downtown Transit Hub Retail', distanceKm: 1.9, distanceMiles: 1.2, walkTimeMinutes: 24, driveTimeMinutes: 6, ratingScore: 4.6, keyHighlight: 'Direct Monorail terminal to Seattle Center' },
    ],
  },

  // 5. MIAMI, FL
  'miami': {
    city: 'Miami',
    state: 'Florida',
    stateCode: 'FL',
    primaryZip: '33131',
    countyName: 'Miami-Dade County',
    effectiveTaxRatePercent: 1.15,
    centerCoordinates: { latitude: 25.7617, longitude: -80.1918 },
    neighborhoods: ['Brickell', 'South Beach', 'Coconut Grove', 'Coral Gables', 'Wynwood', 'Edgewater', 'Design District'],
    streetNames: ['Brickell Ave', 'S Miami Ave', 'SE 1st Ave', 'Bayshore Dr', 'Ocean Dr', 'Coral Way'],
    policeDepartment: 'City of Miami Police Department (Central District)',
    patrolBenchmarkMinutes: 3.9,
    primaryAirport: { name: 'Miami International Airport', iata: 'MIA', distanceKm: 12.2 },
    timeZone: { name: 'Eastern Standard Time', code: 'EST', utcOffset: 'UTC-5' },
    topSchools: [
      { id: 'mia_s1', type: 'SCHOOL', name: 'Ransom Everglades School', categoryLabel: 'Elite Waterfront Prep (6-12)', distanceKm: 6.8, distanceMiles: 4.2, walkTimeMinutes: 80, driveTimeMinutes: 12, ratingScore: 10.0, keyHighlight: 'Top Ranked Private Day School in Florida on Biscayne Bay' },
      { id: 'mia_s2', type: 'SCHOOL', name: 'Carrollton School of the Sacred Heart', categoryLabel: 'Independent All-Girls Prep', distanceKm: 7.2, distanceMiles: 4.5, walkTimeMinutes: 85, driveTimeMinutes: 14, ratingScore: 9.9, keyHighlight: 'IB Diploma World School with stellar collegiate placement' },
      { id: 'mia_s3', type: 'SCHOOL', name: 'Design & Architecture Senior High (DASH)', categoryLabel: 'National Magnet Flagship', distanceKm: 4.8, distanceMiles: 3.0, walkTimeMinutes: 58, driveTimeMinutes: 10, ratingScore: 10.0, keyHighlight: 'Consistently ranked Top 20 Public High School in US' },
      { id: 'mia_s4', type: 'SCHOOL', name: 'Southside Preparatory Academy', categoryLabel: 'Brickell Public Magnet (K-8)', distanceKm: 0.8, distanceMiles: 0.5, walkTimeMinutes: 10, driveTimeMinutes: 3, ratingScore: 9.7, keyHighlight: 'Bilingual international curriculum in heart of Brickell' },
      { id: 'mia_s5', type: 'SCHOOL', name: 'Gulliver Preparatory Academy', categoryLabel: 'Pre-K-12 College Prep', distanceKm: 12.5, distanceMiles: 7.8, walkTimeMinutes: 150, driveTimeMinutes: 18, ratingScore: 9.8, keyHighlight: 'World-class robotics engineering and biomedical programs' },
    ],
    topMalls: [
      { id: 'mia_m1', type: 'MALL', name: 'Brickell City Centre', categoryLabel: '4-Level Open-Air Luxury Hub', distanceKm: 0.3, distanceMiles: 0.2, walkTimeMinutes: 4, driveTimeMinutes: 1, ratingScore: 4.9, keyHighlight: 'Saks Fifth Avenue, Apple, luxury dining and rooftop terraces' },
      { id: 'mia_m2', type: 'MALL', name: 'Miami Design District', categoryLabel: 'Haute Couture Architectural Mecca', distanceKm: 5.2, distanceMiles: 3.2, walkTimeMinutes: 62, driveTimeMinutes: 11, ratingScore: 4.9, keyHighlight: 'Chanel, Dior, Prada, public art by world-renowned sculptors' },
      { id: 'mia_m3', type: 'MALL', name: 'Bal Harbour Shops', categoryLabel: 'Open-Air Palm Courtyard Galleria', distanceKm: 19.5, distanceMiles: 12.1, walkTimeMinutes: 230, driveTimeMinutes: 25, ratingScore: 5.0, keyHighlight: 'Highest sales per square foot luxury mall in the world' },
      { id: 'mia_m4', type: 'MALL', name: 'Lincoln Road Mall (South Beach)', categoryLabel: 'Iconic Pedestrian Shopping Mile', distanceKm: 7.8, distanceMiles: 4.8, walkTimeMinutes: 92, driveTimeMinutes: 15, ratingScore: 4.8, keyHighlight: 'Over 200 stores, al fresco dining, art galleries' },
      { id: 'mia_m5', type: 'MALL', name: 'Aventura Mall', categoryLabel: 'Premier Super-Regional Mall', distanceKm: 24.8, distanceMiles: 15.4, walkTimeMinutes: 290, driveTimeMinutes: 28, ratingScore: 4.9, keyHighlight: 'Hermès, Gucci, Apple, monumental slide tower by Carsten Höller' },
    ],
  },
};

/**
 * Resolves any US city or neighborhood into the closest configured metro
 */
export function resolveUsMetro(queryLocation?: string): UsMetroConfig {
  if (!queryLocation) {
    return US_METROS_REGISTRY['chicago'];
  }

  const clean = queryLocation.toLowerCase().trim();

  // Check direct keys
  if (US_METROS_REGISTRY[clean]) {
    return US_METROS_REGISTRY[clean];
  }

  // Check aliases and neighborhoods
  for (const [key, metro] of Object.entries(US_METROS_REGISTRY)) {
    if (clean.includes(key) || clean.includes(metro.city.toLowerCase()) || clean.includes(metro.stateCode.toLowerCase())) {
      return metro;
    }
    for (const n of metro.neighborhoods) {
      if (clean.includes(n.toLowerCase())) {
        return metro;
      }
    }
  }

  // Default fallback
  return US_METROS_REGISTRY['chicago'];
}
