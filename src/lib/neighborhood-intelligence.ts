import { PointOfInterest, LocalEventItem, NightlifePartyItem, CommunityTelemetry, SmartCityLightingTelemetry, RoadTransitTelemetry } from '../types/property';

export function getRankedSchoolsForProperty(neighborhood: string, baseDistanceKm: number = 0.5): PointOfInterest[] {
  const schoolTemplates: Record<string, Array<{ name: string; categoryLabel: string; ratingScore: number; highlight: string; baseDist: number }>> = {
    'Lincoln Park': [
      { name: 'Abraham Lincoln Elementary School', categoryLabel: 'Public Elementary (K-8) • Top 1% in State', ratingScore: 9.8, highlight: 'Ranked #1 Public Elementary District in Chicago, 14:1 Ratio', baseDist: 0.4 },
      { name: 'Francis W. Parker School', categoryLabel: 'Independent Pre-K-12 Prep Academy', ratingScore: 10.0, highlight: 'Ivy League feeder academy with 100% college matriculation', baseDist: 0.8 },
      { name: 'Lincoln Park High School & IB Academy', categoryLabel: 'Public High School • International Baccalaureate', ratingScore: 9.7, highlight: 'Top Ranked IB World School in Illinois, 32 AP Courses', baseDist: 1.2 },
      { name: 'Saint Clement Parish School', categoryLabel: 'Private Catholic Academy (Pre-K-8)', ratingScore: 9.6, highlight: 'National Blue Ribbon School of Excellence award winner', baseDist: 1.6 },
      { name: 'Latin School of Chicago', categoryLabel: 'Elite College Preparatory (JK-12)', ratingScore: 9.9, highlight: 'World-renowned arts and STEM innovation laboratories', baseDist: 2.3 },
    ],
    'Gold Coast': [
      { name: 'Latin School of Chicago Upper Academy', categoryLabel: 'Elite Private Prep (Grades 9-12)', ratingScore: 10.0, highlight: 'Historic gold-standard college prep with 6:1 student ratio', baseDist: 0.3 },
      { name: 'Ogden International School of Chicago', categoryLabel: 'Public Magnet IB Academy (K-12)', ratingScore: 9.7, highlight: 'Dual-campus global international baccalaureate curriculum', baseDist: 0.7 },
      { name: 'Walter Payton College Prep High School', categoryLabel: 'Public Magnet High School • #1 in USA', ratingScore: 10.0, highlight: 'US News Ranked #1 Public High School in Illinois & Top 5 in US', baseDist: 1.1 },
      { name: 'Catherine Cook School', categoryLabel: 'Independent Early Childhood & Middle', ratingScore: 9.8, highlight: 'Inquiry-based progressive STEM and humanities focus', baseDist: 1.5 },
      { name: 'St. Chrysostoms Day School', categoryLabel: 'Premier Early Childhood Academy', ratingScore: 9.5, highlight: 'Historic foundation academy in heart of Gold Coast', baseDist: 2.1 },
    ],
    'West Loop': [
      { name: 'Mark T. Skinner West Elementary', categoryLabel: 'Classical Public Magnet (K-8)', ratingScore: 10.0, highlight: 'Top 5 Classical Gifted & Talented program in Illinois', baseDist: 0.5 },
      { name: 'Whitney M. Young Magnet High School', categoryLabel: 'Public Selective Enrollment High School', ratingScore: 9.9, highlight: 'Nationally recognized powerhouse in STEM, debate and honors', baseDist: 0.9 },
      { name: 'Bennett Day School', categoryLabel: 'Progressive Independent (PK-12)', ratingScore: 9.6, highlight: 'Project-based learning center with cutting-edge engineering labs', baseDist: 1.4 },
      { name: 'Andrew Jackson Language Academy', categoryLabel: 'World Language Magnet (K-8)', ratingScore: 9.7, highlight: 'Intensive immersion in Mandarin, Spanish, French, Japanese', baseDist: 1.9 },
      { name: 'Saint Ignatius College Prep', categoryLabel: 'Historic Jesuit Preparatory (9-12)', ratingScore: 9.8, highlight: 'Founded 1869, 100% four-year university placement', baseDist: 2.4 },
    ],
    'Default': [
      { name: 'Summit Ridge Preparatory Academy', categoryLabel: 'Top Tier Public & Magnet Academy', ratingScore: 9.8, highlight: 'STEM Honors & AP Capstone certified academic curriculum', baseDist: 0.5 },
      { name: 'St. Michael Parish Academy', categoryLabel: 'National Blue Ribbon Private School', ratingScore: 9.7, highlight: 'Accelerated mathematics and dual-language enrichment', baseDist: 0.9 },
      { name: 'Central Metropolitan High School', categoryLabel: 'International Baccalaureate (IB) World School', ratingScore: 9.6, highlight: 'Over 28 Advanced Placement offerings and 98% graduation', baseDist: 1.4 },
      { name: 'Aspen Valley Classical Academy', categoryLabel: 'Charter Classical & Fine Arts (K-8)', ratingScore: 9.5, highlight: 'Comprehensive classical literature and robotics laboratory', baseDist: 2.0 },
      { name: 'University Laboratory High School', categoryLabel: 'Elite Collegiate Preparatory (9-12)', ratingScore: 9.9, highlight: 'Affiliated with top research universities, Nobel laureate alumni', baseDist: 2.8 },
    ]
  };

  const templates = schoolTemplates[neighborhood] || schoolTemplates['Default'];

  return templates.map((t, idx) => {
    const distKm = Number((t.baseDist * (0.8 + (idx * 0.1))).toFixed(1));
    const distMiles = Number((distKm * 0.621371).toFixed(1));
    const walkMin = Math.max(2, Math.round(distKm * 12));
    const driveMin = Math.max(1, Math.round(distKm * 2.5));

    return {
      id: `school_${idx + 1}`,
      type: 'SCHOOL',
      name: t.name,
      categoryLabel: t.categoryLabel,
      distanceKm: distKm,
      distanceMiles: distMiles,
      walkTimeMinutes: walkMin,
      driveTimeMinutes: driveMin,
      ratingScore: t.ratingScore,
      keyHighlight: t.highlight,
    };
  });
}

export function getRankedMallsForProperty(neighborhood: string, baseDistanceKm: number = 0.6): PointOfInterest[] {
  const mallTemplates: Record<string, Array<{ name: string; categoryLabel: string; ratingScore: number; highlight: string; baseDist: number }>> = {
    'Lincoln Park': [
      { name: 'Lincoln Common & Lifestyle Plaza', categoryLabel: 'Luxury Open-Air Lifestyle & Boutique Village', ratingScore: 4.9, highlight: 'Equinox, Velvet Taco, Kohler Signature Store, boutique retail', baseDist: 0.5 },
      { name: 'NEWCITY Shopping Center & Cinema', categoryLabel: 'Premier Urban Retail & Dining Center', ratingScore: 4.8, highlight: 'Whole Foods Market, Apple Store, ArcLight AMC, Kings Dining', baseDist: 0.9 },
      { name: 'Armitage Avenue Luxury Boutique District', categoryLabel: 'High-End Designer Street Fashion Promenade', ratingScore: 4.9, highlight: 'Warby Parker, Bonobos, Allbirds, Serena & Lily, gourmet cafes', baseDist: 1.3 },
      { name: '900 North Michigan Luxury Shops', categoryLabel: 'Seven-Level High-End Luxury Fashion Mall', ratingScore: 4.8, highlight: 'Bloomingdales, Gucci, Max Mara, Sur La Table, luxury food hall', baseDist: 2.2 },
      { name: 'Water Tower Place & Michigan Avenue Galleria', categoryLabel: 'Historic Multi-Story Landmark Shopping Mall', ratingScore: 4.7, highlight: 'American Girl Place, Sephora, Lego Flagship, 100+ stores', baseDist: 2.9 },
    ],
    'Gold Coast': [
      { name: '900 North Michigan Luxury Shops', categoryLabel: 'Premier Multi-Level Luxury Shopping Center', ratingScore: 4.9, highlight: 'Bloomingdales, Montblanc, J.Crew, Aster Hall Luxury Food Court', baseDist: 0.4 },
      { name: 'Oak Street Haute Couture District', categoryLabel: 'World-Renowned Ultra-Luxury Fashion Strip', ratingScore: 5.0, highlight: 'Hermès, Chanel, Prada, Tom Ford, Giorgio Armani, Harry Winston', baseDist: 0.7 },
      { name: 'Water Tower Place Shopping Galleria', categoryLabel: 'Landmark Magnificent Mile Shopping Mall', ratingScore: 4.7, highlight: 'Direct indoor connection to Ritz Carlton, premier beauty & fashion', baseDist: 1.1 },
      { name: 'The Shops at North Bridge', categoryLabel: 'Nordstrom Flagship Shopping Center', ratingScore: 4.8, highlight: 'Nordstrom 4-level flagship, Eataly Italian food emporium', baseDist: 1.6 },
      { name: 'Block 37 Urban Center & Loop Retail', categoryLabel: 'Modern Mixed-Use Shopping & Entertainment', ratingScore: 4.6, highlight: 'AMC Dine-In Theatres, Zara, Anthropologie, Sephora', baseDist: 2.5 },
    ],
    'West Loop': [
      { name: 'Fulton Market Retail Corridor', categoryLabel: 'Artisan Designer & Trendsetting Retail Strip', ratingScore: 4.9, highlight: 'Aesop, Lululemon, Billy Reid, custom denim and luxury eyewear', baseDist: 0.4 },
      { name: 'Randolph Street Gourmet & Specialty Market', categoryLabel: 'Epicurean Food Hall & Lifestyle Boutiques', ratingScore: 4.9, highlight: 'Publican Quality Meats, artisan home goods and design studios', baseDist: 0.8 },
      { name: 'The Maxwell Urban Shopping Center', categoryLabel: 'Spacious Multi-Store Urban Retail Complex', ratingScore: 4.7, highlight: 'Nordstrom Rack, TJ Maxx, Dick’s Sporting Goods, Target', baseDist: 1.5 },
      { name: 'Block 37 Downtown Shopping Center', categoryLabel: 'Premier Center City Mall & Theatres', ratingScore: 4.7, highlight: 'Direct underground Pedway connection, 50+ fashion outlets', baseDist: 1.9 },
      { name: 'Southgate Market Shopping Mall', categoryLabel: 'Big-Box & Specialty Retail Mall', ratingScore: 4.6, highlight: 'Whole Foods, Petco, Guitar Center, 3-level enclosed parking', baseDist: 2.6 },
    ],
    'Default': [
      { name: 'Providence Luxury Promenade & Center', categoryLabel: 'High-End Outdoor Fashion Mall', ratingScore: 4.9, highlight: 'Apple Flagship, Nordstrom, Lululemon, artisan dining patio', baseDist: 0.6 },
      { name: 'Metro Town Center & Lifestyle Mall', categoryLabel: 'Enclosed Regional Shopping Complex', ratingScore: 4.8, highlight: 'Sephora, Williams-Sonoma, Pottery Barn, Cineplex IMAX', baseDist: 1.1 },
      { name: 'Marketplace Square Shopping Center', categoryLabel: 'Specialty Gourmet & Fashion Center', ratingScore: 4.7, highlight: 'Trader Joes, Whole Foods, REI Co-op, boutique fitness clubs', baseDist: 1.8 },
      { name: 'Grand Avenue Fashion Outlets', categoryLabel: 'Luxury Designer Outlet Pavilion', ratingScore: 4.8, highlight: 'Over 130 designer outlet stores and fine dining options', baseDist: 2.5 },
      { name: 'Galleria at the Park Regional Mall', categoryLabel: 'Two-Story Regional Shopping Destination', ratingScore: 4.6, highlight: 'Macy’s, Dillard’s, Apple, food pavilion, 150+ retail stores', baseDist: 3.4 },
    ]
  };

  const templates = mallTemplates[neighborhood] || mallTemplates['Default'];

  return templates.map((t, idx) => {
    const distKm = Number((t.baseDist * (0.8 + (idx * 0.1))).toFixed(1));
    const distMiles = Number((distKm * 0.621371).toFixed(1));
    const walkMin = Math.max(2, Math.round(distKm * 12));
    const driveMin = Math.max(1, Math.round(distKm * 2.5));

    return {
      id: `mall_${idx + 1}`,
      type: 'MALL',
      name: t.name,
      categoryLabel: t.categoryLabel,
      distanceKm: distKm,
      distanceMiles: distMiles,
      walkTimeMinutes: walkMin,
      driveTimeMinutes: driveMin,
      ratingScore: t.ratingScore,
      keyHighlight: t.highlight,
    };
  });
}

export function getEventsAndLifestyleForProperty(neighborhood: string): {
  events: LocalEventItem[];
  nightlife: NightlifePartyItem[];
  community: CommunityTelemetry;
  lighting: SmartCityLightingTelemetry;
  roads: RoadTransitTelemetry;
} {
  return {
    events: [
      { name: `${neighborhood} Annual Summer Street & Arts Festival`, seasonOrFrequency: 'Annual Summer Gala (June)', distanceKm: 0.6, estimatedAttendees: 45000, description: '3-day celebration of fine arts, live indie stages, craft beer, and artisan food trucks.' },
      { name: 'Historic Garden Walk & Architecture Tour', seasonOrFrequency: 'Bi-Annual Showcase (July & Sept)', distanceKm: 0.4, estimatedAttendees: 15000, description: 'Exclusive access to historic courtyards, Victorian estates, and rooftop botanical gardens.' },
      { name: 'Artisan Farmers & Gourmet Harvest Market', seasonOrFrequency: 'Every Saturday (May - Oct)', distanceKm: 0.5, estimatedAttendees: 8500, description: 'Over 60 organic regional growers, heritage cheeses, fresh pastries, and live acoustic music.' },
      { name: 'Holiday Tree Lighting & Winter Wonderland Gala', seasonOrFrequency: 'Annual Holiday Event (Dec)', distanceKm: 0.8, estimatedAttendees: 22000, description: 'Community ice carving exhibitions, illuminated horse carriages, and seasonal holiday cheer.' },
    ],
    nightlife: [
      { name: 'The Violet Room Cocktail Salon & Social Club', category: 'High-End Speakeasy & Mixology', distanceKm: 0.7, ratingScore: 4.9, dressCodeOrVibe: 'Smart Casual • Bespoke Craft Cocktails' },
      { name: 'Skyline Terrace Rooftop Lounge & DJ Patio', category: 'Panoramic Rooftop Party & Lounge', distanceKm: 1.2, ratingScore: 4.8, dressCodeOrVibe: 'Chic Evening Attire • House & Jazz Sets' },
      { name: 'The Brass Peacock Wine Bar & Tapas', category: 'Sommelier Curated Wine & Tapas', distanceKm: 0.5, ratingScore: 4.9, dressCodeOrVibe: 'Relaxed Elegant • 250+ Global Vintages' },
      { name: 'Soho Social Member Club & Parlor', category: 'Private Creative Members Club', distanceKm: 1.5, ratingScore: 4.9, dressCodeOrVibe: 'Exclusive Membership • Networking & Arts' },
    ],
    community: {
      medianHouseholdIncomeUSD: 168400,
      higherEducationPercent: 86.4,
      neighborhoodAssociation: `${neighborhood} Community Preservation League (Est. 1954)`,
      walkScore: 96,
      transitScore: 88,
      bikeScore: 92,
    },
    lighting: {
      streetLightingCoveragePercent: 99.2,
      fixtureType: 'Smart Adaptive Warm LED Luminaires (3000K Dark-Sky Compliant)',
      nightLuminanceLux: 42,
      fiberBroadbandSpeedGbps: 10,
      undergroundPowerGrid: true,
    },
    roads: {
      primaryHighway: 'I-90 / I-94 Kennedy Expressway & Lake Shore Drive Corridors',
      distanceToHighwayKm: 1.6,
      driveTimeToHighwayMinutes: 4,
      rushHourCBDCommuteMinutes: 14,
      pavementConditionIndexPCI: 94,
      evChargingStallsNearbyCount: 28,
    }
  };
}
