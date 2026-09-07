// =========================================================================
// HOUSE INTELLIGENCE - 1,000 Customer NLP Training & Benchmark Corpus
// Comprehensive dataset covering budget, location, typos, ROI, and specs
// =========================================================================

export interface TrainingExample {
  id: number;
  category: 'PRICE_BUDGET' | 'LOCATION_GEO' | 'BEDS_SPECS' | 'ROI_FINANCIAL' | 'LIFESTYLE_AMENITY' | 'COMPLEX_MULTI_CRITERIA' | 'MISTAKE_CORRECTION';
  query: string;
  expected: {
    city?: string;
    neighborhood?: string;
    maxPrice?: number;
    minPrice?: number;
    beds?: number;
    baths?: number;
    minCapRate?: number;
    amenityKeywords?: string[];
  };
  commonMistakeType?: 'PHONETIC_TYPO' | 'BOUND_COLLISION' | 'SLANG_SHORTHAND' | 'NEGATIVE_CONSTRAINT' | 'UNUSUAL_WORD_ORDER';
  selfCorrectionRule: string;
}

// Deterministically generate 1,000 structured real-world training examples
export function generate1000TrainingExamples(): TrainingExample[] {
  const examples: TrainingExample[] = [];

  const locations = [
    { name: 'Lincoln Park', typos: ['lincon park', 'lincoln prk', 'lincolnpark', 'linkoln park'] },
    { name: 'Gold Coast', typos: ['goldcoast', 'gold coast', 'gold cost', 'the gold coast'] },
    { name: 'West Loop', typos: ['westloop', 'west loop', 'fulton market', 'w loop'] },
    { name: 'Lakeview', typos: ['lake view', 'lakeview', 'wrigleyville', 'lakevieuw'] },
    { name: 'Wicker Park', typos: ['wickerpark', 'wicker prk', 'bucktown', 'wiker park'] },
    { name: 'Streeterville', typos: ['streeterville', 'streeter ville', 'mag mile', 'streterville'] },
    { name: 'South Loop', typos: ['southloop', 'south loop', 'printers row', 's loop'] },
    { name: 'Hyde Park', typos: ['hydepark', 'hyde park', 'uchicago', 'hide park'] },
    { name: 'Logan Square', typos: ['logansquare', 'logan square', 'logan sq'] },
    { name: 'River North', typos: ['rivernorth', 'river north', 'rvr north'] },
    { name: 'Old Town', typos: ['oldtown', 'old town', 'historic old town'] },
    { name: 'Denver', typos: ['denver co', 'denver', 'cherry creek', 'dnver'] },
    { name: 'Boulder', typos: ['boulder co', 'boulder', 'chautauqua', 'bolder'] },
    { name: 'Aspen', typos: ['aspen co', 'aspen', 'red mountain', 'aspin'] },
  ];

  const priceBands = [
    { text: 'under 600k', max: 600000, typos: ['undr 600k', 'below 600,000', 'cheaper than 600k', '<600k'] },
    { text: 'under 800k', max: 800000, typos: ['undr 800k', 'less than 800k', 'max 800000', 'within 800k'] },
    { text: 'under 1m', max: 1000000, typos: ['below 1m', 'under 1 million', '< 1M', 'under 1000k'] },
    { text: 'under 1.2m', max: 1200000, typos: ['under 1.2 million', 'less than 1.2M', 'under 1200k', 'max 1.2m'] },
    { text: 'between 500k and 750k', min: 500000, max: 750000, typos: ['500k to 750k', '500k-750k', 'from 500k to 750k'] },
    { text: 'around 700k', max: 750000, min: 650000, typos: ['approx 700k', '~700k', 'near 700 thousand'] },
  ];

  const bedConfigs = [
    { text: '2 bed', beds: 2, typos: ['2bed', '2 bedroom', '2br', '2 bd', 'two beds'] },
    { text: '3 bed', beds: 3, typos: ['3bed', '3 bedroom', '3br', '3 bd', 'three beds'] },
    { text: '4 bed', beds: 4, typos: ['4bed', '4 bedroom', '4br', '4 bd', 'four beds'] },
    { text: 'studio', beds: 1, typos: ['studio apt', '1 bed or studio', 'studio unit'] },
  ];

  const roiTargets = [
    { text: 'cap rate > 5%', minCap: 5.0, typos: ['cap rate 5%', 'cap rate over 5%', '5% cap rate', 'min 5% cap'] },
    { text: 'cap rate > 6%', minCap: 6.0, typos: ['cap rate 6%', 'cap rate over 6%', '6% cap rate', 'at least 6% cap'] },
    { text: 'positive cash flow', minCap: 4.5, typos: ['positive cashflow', 'good cash flow', 'cash flow positive', 'high cashflow'] },
    { text: 'high roi', minCap: 5.5, typos: ['strong roi', 'high return', 'investment grade roi', 'top roi'] },
  ];

  const amenities = [
    { text: 'near top elementary school', tag: 'SCHOOL', typos: ['close to elementary', 'near top school', 'great schools nearby'] },
    { text: 'close to shopping malls', tag: 'MALL', typos: ['near luxury mall', 'walk to whole foods', 'close to retail shops'] },
    { text: 'near quiet park and green space', tag: 'PARK', typos: ['near forest reserve', 'quiet streets near park', 'park nearby'] },
    { text: 'fast commute to transit', tag: 'TRANSIT', typos: ['near cta train', 'close to metro', 'quick highway access'] },
  ];

  let id = 1;

  // 1. Group A: Clean Multi-Criteria Queries (200 examples)
  for (let i = 0; i < 200; i++) {
    const loc = locations[i % locations.length];
    const pb = priceBands[i % priceBands.length];
    const bed = bedConfigs[i % bedConfigs.length];
    const roi = roiTargets[i % roiTargets.length];
    const query = `${bed.text} modern house in ${loc.name} ${pb.text} with ${roi.text}`;

    examples.push({
      id: id++,
      category: 'COMPLEX_MULTI_CRITERIA',
      query,
      expected: {
        neighborhood: loc.name,
        maxPrice: pb.max,
        minPrice: pb.min,
        beds: bed.beds,
        minCapRate: roi.minCap,
      },
      selfCorrectionRule: 'Standard semantic composition: verify token bounds and assign clean entity boundaries.',
    });
  }

  // 2. Group B: Typo & Phonetic Mistake Correction (250 examples)
  for (let i = 0; i < 250; i++) {
    const loc = locations[i % locations.length];
    const typoLoc = loc.typos[i % loc.typos.length];
    const pb = priceBands[i % priceBands.length];
    const typoPb = pb.typos[i % pb.typos.length];
    const bed = bedConfigs[i % bedConfigs.length];
    const typoBed = bed.typos[i % bed.typos.length];
    const query = `looking for ${typoBed} in ${typoLoc} ${typoPb}`;

    examples.push({
      id: id++,
      category: 'MISTAKE_CORRECTION',
      query,
      expected: {
        neighborhood: loc.name,
        maxPrice: pb.max,
        minPrice: pb.min,
        beds: bed.beds,
      },
      commonMistakeType: 'PHONETIC_TYPO',
      selfCorrectionRule: `Fuzzy distance mapping: resolve phonetic typo "${typoLoc}" -> "${loc.name}", parse numerical suffix "${typoPb}".`,
    });
  }

  // 3. Group C: Financial & ROI Inquiries (150 examples)
  for (let i = 0; i < 150; i++) {
    const loc = locations[i % locations.length];
    const roi = roiTargets[i % roiTargets.length];
    const typoRoi = roi.typos[i % roi.typos.length];
    const pb = priceBands[i % priceBands.length];
    const query = `show high yield rental investment in ${loc.name} with ${typoRoi} ${pb.text}`;

    examples.push({
      id: id++,
      category: 'ROI_FINANCIAL',
      query,
      expected: {
        neighborhood: loc.name,
        minCapRate: roi.minCap,
        maxPrice: pb.max,
      },
      commonMistakeType: 'SLANG_SHORTHAND',
      selfCorrectionRule: `Financial intent calibration: recognize "${typoRoi}" as strict Cap Rate threshold ≥ ${roi.minCap}%.`,
    });
  }

  // 4. Group D: Lifestyle, Family & Schools Proximity (150 examples)
  for (let i = 0; i < 150; i++) {
    const loc = locations[i % locations.length];
    const amen = amenities[i % amenities.length];
    const typoAmen = amen.typos[i % amen.typos.length];
    const bed = bedConfigs[i % bedConfigs.length];
    const query = `family home with ${bed.text} in ${loc.name} ${typoAmen}`;

    examples.push({
      id: id++,
      category: 'LIFESTYLE_AMENITY',
      query,
      expected: {
        neighborhood: loc.name,
        beds: bed.beds,
        amenityKeywords: [amen.tag],
      },
      selfCorrectionRule: `Amenity entity extraction: map phrase "${typoAmen}" to proximity category ${amen.tag}.`,
    });
  }

  // 5. Group E: Slang, Shorthand & Bound Collisions (150 examples)
  for (let i = 0; i < 150; i++) {
    const loc = locations[i % locations.length];
    const bed = bedConfigs[i % bedConfigs.length];
    // Formats like: "3br 2ba 800k max lincoln"
    const query = `${bed.beds}br house max 850k ${loc.typos[0]}`;

    examples.push({
      id: id++,
      category: 'MISTAKE_CORRECTION',
      query,
      expected: {
        neighborhood: loc.name,
        beds: bed.beds,
        maxPrice: 850000,
      },
      commonMistakeType: 'BOUND_COLLISION',
      selfCorrectionRule: `Bound collision handler: separate adjacent numeric tokens (${bed.beds}br vs 850k) without digit cross-contamination.`,
    });
  }

  // 6. Group F: Negative Constraints & Outlier Formats (100 examples)
  for (let i = 0; i < 100; i++) {
    const loc = locations[i % locations.length];
    const query = `house near ${loc.name} not exceeding 950 thousand with at least 3 bedrooms`;

    examples.push({
      id: id++,
      category: 'PRICE_BUDGET',
      query,
      expected: {
        neighborhood: loc.name,
        maxPrice: 950000,
        beds: 3,
      },
      commonMistakeType: 'NEGATIVE_CONSTRAINT',
      selfCorrectionRule: `Negative constraint resolution: "not exceeding X thousand" -> maxPrice: X000.`,
    });
  }

  return examples;
}

// Pre-computed 1,000 training examples corpus
export const NLP_1000_TRAINING_CORPUS = generate1000TrainingExamples();
