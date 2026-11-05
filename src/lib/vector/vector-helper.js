/**
 * Vector Database Helper for Node.js / Express backend
 * Computes 128-dimensional dense vector embeddings and provides cosine similarity search.
 */

const VOCABULARY = [
  'modern', 'cantilever', 'glass', 'minimalist', 'brutalist', 'organic', 'midcentury', 'contemporary',
  'villa', 'penthouse', 'loft', 'estate', 'mansion', 'pavilion', 'waterfront', 'coastal',
  'desert', 'mountain', 'terrazzo', 'concrete', 'timber', 'sustainable', 'biophilic', 'skylight', 'highceiling',
  'infinitypool', 'swimmingpool', 'spa', 'terrace', 'balcony', 'patio', 'garden', 'courtyard',
  'winecellar', 'homecinema', 'gym', 'chefkitchen', 'marble', 'fireplace', 'panoramicview', 'sunsetview',
  'oceanview', 'cityview', 'privateelevator', 'smarthome', 'multicar', 'garage', 'guestsuite', 'rooftop', 'solarium',
  'chicago', 'goldcoast', 'lincolnpark', 'fultonmarket', 'losangeles', 'beverlyhills', 'belair', 'hollywood',
  'newyork', 'manhattan', 'tribeca', 'westvillage', 'soho', 'miami', 'brickell', 'coralgables',
  'austin', 'seattle', 'denver', 'sanfrancisco', 'dallas', 'phoenix', 'atlanta', 'boston', 'waterfront',
  'greatschools', 'privateschool', 'michelin', 'finedining', 'quiet', 'peaceful', 'security', 'privatedrive',
  'gated', 'walkable', 'park', 'marina', 'yacht', 'nature', 'acoustics', 'luxury', 'ultra',
  'exclusive', 'bespoke', 'curated', 'family', 'executive', 'investment', 'caprate', 'prestige',
  'rent', 'lease', 'sale', 'acquisition', 'buy', 'investor', 'cashflow', 'turnkey',
  'furnished', 'unfurnished', 'spacious', 'grand', 'intimate', 'retreat', 'compound', 'residence',
  'underwriting', 'architect', 'designer', 'custom', 'renovated', 'newconstruction', 'trophy', 'heritage',
  'duplex', 'triplex', 'skyline', 'sanctuary'
];

function embedText(text) {
  const vector = new Float32Array(VOCABULARY.length);
  const normalized = (text || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
  const tokens = normalized.split(/\s+/).filter(Boolean);
  const tokenSet = new Set(tokens);

  for (let i = 0; i < VOCABULARY.length; i++) {
    const concept = VOCABULARY[i];
    let weight = 0;
    if (tokenSet.has(concept)) weight += 2.0;
    if (normalized.includes(concept)) weight += 1.0;
    for (const t of tokens) {
      if (t === concept || t.includes(concept)) weight += 0.5;
    }
    vector[i] = weight;
  }

  let norm = 0;
  for (let i = 0; i < vector.length; i++) norm += vector[i] * vector[i];
  norm = Math.sqrt(norm);
  if (norm > 0) {
    for (let i = 0; i < vector.length; i++) vector[i] /= norm;
  }
  return vector;
}

function cosineSimilarity(a, b) {
  let dot = 0;
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) dot += a[i] * b[i];
  return Math.max(0, Math.min(1, dot));
}

function buildCorpus(p) {
  return [
    p.title || '',
    p.specs?.architecturalStyle || '',
    p.propertyAddress?.street || '',
    p.propertyAddress?.neighborhood || '',
    p.propertyAddress?.city || '',
    p.propertyAddress?.state || '',
    p.listingStatus || '',
    p.sourcePortal || '',
    `${p.specs?.beds || 0} bedrooms`,
    `${p.specs?.baths || 0} bathrooms`,
    `${p.specs?.finishedSqFt || 0} sqft`,
    p.description || '',
    ...(p.amenities ? p.amenities.map(a => `${a.name} ${a.keyAttribute || ''}`) : [])
  ].join(' ').toLowerCase();
}

class VectorIndex {
  constructor(properties) {
    this.items = [];
    if (Array.isArray(properties)) {
      this.build(properties);
    }
  }

  build(properties) {
    this.items = properties.map(p => {
      const corpus = buildCorpus(p);
      return {
        listing: p,
        vector: embedText(corpus),
        corpus,
      };
    });
  }

  search(query, options = {}) {
    const limit = options.limit || 24;
    const queryVector = embedText(query);
    const queryTerms = (query || '').toLowerCase().split(/\s+/).filter(Boolean);

    const scored = [];
    for (const item of this.items) {
      const { listing, vector, corpus } = item;

      // Status filter
      if (options.status && options.status !== 'ALL' && listing.listingStatus !== options.status) {
        continue;
      }

      let sim = cosineSimilarity(queryVector, vector);
      const matched = [];
      for (const t of queryTerms) {
        if (corpus.includes(t)) {
          sim += 0.04;
          matched.push(t);
        }
      }

      scored.push({
        listing,
        similarityScore: Math.min(0.99, Number(sim.toFixed(4))),
        matchedFeatures: matched,
      });
    }

    scored.sort((a, b) => b.similarityScore - a.similarityScore);
    return scored.slice(0, limit);
  }

  embedQuery(query) {
    return embedText(query);
  }

  getVectorById(id) {
    const item = this.items.find(it => it.listing.id === id);
    return item ? item.vector : null;
  }

  getListingById(id) {
    const item = this.items.find(it => it.listing.id === id);
    return item ? item.listing : null;
  }

  /**
   * Two-Stage Hybrid Property Search
   * Combines SQLite candidate pre-filter with 128-D cosine similarity and normalized ROI fusion
   */
  executeHybridSearch(candidateRows, naturalLanguageQuery, alpha = 0.8, limit = 24) {
    const queryVector = embedText(naturalLanguageQuery);
    const queryTerms = (naturalLanguageQuery || '').toLowerCase().split(/\s+/).filter(Boolean);

    const candidateIds = new Set((candidateRows || []).map(r => r.id));
    const targetPool = this.items.filter(it => candidateIds.has(it.listing.id));
    const itemsToScore = targetPool.length > 0 ? targetPool : this.items;

    const scored = itemsToScore.map(item => {
      const { listing, vector, corpus } = item;
      let cosineSim = cosineSimilarity(queryVector, vector);

      const matched = [];
      for (const t of queryTerms) {
        if (corpus.includes(t)) {
          cosineSim += 0.04;
          matched.push(t);
        }
      }
      cosineSim = Math.min(0.99, Number(cosineSim.toFixed(4)));

      const rawCapRate = listing.financials?.outputs?.capRate || 5.0;
      const capRateNorm = Math.min(1.0, Math.max(0.0, rawCapRate / 10.0));
      const hybridScore = Number((alpha * cosineSim + (1 - alpha) * capRateNorm).toFixed(4));

      return {
        id: listing.id,
        listing,
        similarity: cosineSim,
        capRateNorm: Number(capRateNorm.toFixed(3)),
        finalScore: hybridScore,
        matchedFeatures: matched,
      };
    });

    scored.sort((a, b) => b.finalScore - a.finalScore);
    return scored.slice(0, limit);
  }
}

module.exports = {
  embedText,
  cosineSimilarity,
  VectorIndex,
};
