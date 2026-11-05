/**
 * High-Performance Vector Database & Semantic Embedding Engine
 * Provides dense 128-dimensional vector embeddings, cosine similarity search,
 * and semantic nearest-neighbor retrieval for luxury architectural residences.
 */

import { ShikaakPropertyListing, FilterState } from '../../types/property';

export interface VectorSearchResult {
  listing: ShikaakPropertyListing;
  similarityScore: number; // 0.0 to 1.0 (Cosine Similarity)
  matchedFeatures: string[];
}

export class LuxuryVectorDatabase {
  private static instance: LuxuryVectorDatabase;
  private indexedProperties: Map<string, { listing: ShikaakPropertyListing; vector: Float32Array; textCorpus: string }> = new Map();
  private isInitialized = false;

  // Semantic concept vocabulary dictionary for high-dimensional projection (128 dimensions)
  private static VOCABULARY = [
    // Styles & Architecture (Dims 0-24)
    'modern', 'cantilever', 'glass', 'minimalist', 'brutalist', 'organic', 'midcentury', 'contemporary',
    'villa', 'penthouse', 'loft', 'estate', 'mansion', 'pavilion', 'waterfront', 'coastal',
    'desert', 'mountain', 'terrazzo', 'concrete', 'timber', 'sustainable', 'biophilic', 'skylight', 'highceiling',

    // Luxury Amenities & Spaces (Dims 25-49)
    'infinitypool', 'swimmingpool', 'spa', 'terrace', 'balcony', 'patio', 'garden', 'courtyard',
    'winecellar', 'homecinema', 'gym', 'chefkitchen', 'marble', 'fireplace', 'panoramicview', 'sunsetview',
    'oceanview', 'cityview', 'privateelevator', 'smarthome', 'multicar', 'garage', 'guestsuite', 'rooftop', 'solarium',

    // Locations & Premier Metros (Dims 50-74)
    'chicago', 'goldcoast', 'lincolnpark', 'fultonmarket', 'losangeles', 'beverlyhills', 'belair', 'hollywood',
    'newyork', 'manhattan', 'tribeca', 'westvillage', 'soho', 'miami', 'brickell', 'coralgables',
    'austin', 'seattle', 'denver', 'sanfrancisco', 'dallas', 'phoenix', 'atlanta', 'boston', 'waterfront',

    // Lifestyle & Quality Factors (Dims 75-99)
    'greatschools', 'privateschool', 'michelin', 'finedining', 'quiet', 'peaceful', 'security', 'privatedrive',
    'gated', 'walkable', 'park', 'marina', 'yacht', 'nature', 'acoustics', 'luxury', 'ultra',
    'exclusive', 'bespoke', 'curated', 'family', 'executive', 'investment', 'caprate', 'prestige',

    // Financial & Transaction Terms (Dims 100-127)
    'rent', 'lease', 'sale', 'acquisition', 'buy', 'investor', 'cashflow', 'turnkey',
    'furnished', 'unfurnished', 'spacious', 'grand', 'intimate', 'retreat', 'compound', 'residence',
    'underwriting', 'architect', 'designer', 'custom', 'renovated', 'newconstruction', 'trophy', 'heritage',
    'duplex', 'triplex', 'skyline', 'sanctuary'
  ];

  private constructor() {}

  public static getInstance(): LuxuryVectorDatabase {
    if (!LuxuryVectorDatabase.instance) {
      LuxuryVectorDatabase.instance = new LuxuryVectorDatabase();
    }
    return LuxuryVectorDatabase.instance;
  }

  /**
   * Initializes and vector-indexes all properties
   */
  public buildIndex(listings: ShikaakPropertyListing[]): void {
    this.indexedProperties.clear();
    for (const listing of listings) {
      const corpus = this.buildTextCorpus(listing);
      const vector = this.embedText(corpus);
      this.indexedProperties.set(listing.id, { listing, vector, textCorpus: corpus });
    }
    this.isInitialized = true;
  }

  /**
   * Creates a normalized 128-dimensional embedding vector from text
   */
  public embedText(text: string): Float32Array {
    const vector = new Float32Array(LuxuryVectorDatabase.VOCABULARY.length);
    const normalized = text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
    const tokens = normalized.split(/\s+/).filter(Boolean);
    const tokenSet = new Set(tokens);

    for (let i = 0; i < LuxuryVectorDatabase.VOCABULARY.length; i++) {
      const concept = LuxuryVectorDatabase.VOCABULARY[i];
      let weight = 0;

      // Direct match
      if (tokenSet.has(concept)) {
        weight += 2.0;
      }

      // Substring match
      if (normalized.includes(concept)) {
        weight += 1.0;
      }

      // Frequency bonus
      for (const t of tokens) {
        if (t === concept || t.includes(concept)) {
          weight += 0.5;
        }
      }

      vector[i] = weight;
    }

    // Normalize to unit length (L2 norm) for cosine similarity
    let norm = 0;
    for (let i = 0; i < vector.length; i++) {
      norm += vector[i] * vector[i];
    }
    norm = Math.sqrt(norm);
    if (norm > 0) {
      for (let i = 0; i < vector.length; i++) {
        vector[i] /= norm;
      }
    }

    return vector;
  }

  /**
   * Computes cosine similarity between two normalized vectors
   */
  public cosineSimilarity(a: Float32Array, b: Float32Array): number {
    let dot = 0;
    const len = Math.min(a.length, b.length);
    for (let i = 0; i < len; i++) {
      dot += a[i] * b[i];
    }
    return Math.max(0, Math.min(1, dot));
  }

  /**
   * Vector semantic search with optional metadata filters
   */
  public search(
    query: string,
    options: {
      limit?: number;
      minSimilarity?: number;
      filters?: Partial<FilterState>;
      status?: 'ALL' | 'FOR_SALE' | 'FOR_RENT';
    } = {}
  ): VectorSearchResult[] {
    const limit = options.limit || 24;
    const minSim = options.minSimilarity ?? 0.05;
    const queryVector = this.embedText(query);
    const queryTerms = query.toLowerCase().split(/\s+/).filter(Boolean);

    const scored: VectorSearchResult[] = [];

    this.indexedProperties.forEach((item) => {
      const { listing, vector, textCorpus } = item;

      // Status filter
      if (options.status && options.status !== 'ALL' && listing.listingStatus !== options.status) {
        return;
      }
      if (options.filters?.listingStatus && options.filters.listingStatus !== 'ALL' && listing.listingStatus !== options.filters.listingStatus) {
        return;
      }

      // Price filter
      const price = listing.listingStatus === 'FOR_RENT' 
        ? (listing.financials?.inputs?.monthlyGrossRent || 0)
        : (listing.financials?.inputs?.purchasePrice || 0);

      if (options.filters?.priceMin && price < options.filters.priceMin) return;
      if (options.filters?.priceMax && options.filters.priceMax < 5000000 && price > options.filters.priceMax) return;

      // Beds / Baths filter
      if (options.filters?.bedsMin && (listing.specs?.beds || 0) < options.filters.bedsMin) return;
      if (options.filters?.bathsMin && (listing.specs?.baths || 0) < options.filters.bathsMin) return;

      // Cosine vector similarity
      let similarity = this.cosineSimilarity(queryVector, vector);

      // Exact term overlap boost
      const matchedFeatures: string[] = [];
      for (const term of queryTerms) {
        if (textCorpus.includes(term)) {
          similarity += 0.04;
          matchedFeatures.push(term);
        }
      }

      if (similarity >= minSim || queryTerms.length === 0) {
        scored.push({
          listing,
          similarityScore: Math.min(0.99, Number(similarity.toFixed(4))),
          matchedFeatures,
        });
      }
    });

    // Rank descending by similarity score
    scored.sort((a, b) => b.similarityScore - a.similarityScore);
    return scored.slice(0, limit);
  }

  private buildTextCorpus(listing: ShikaakPropertyListing): string {
    const parts = [
      listing.title,
      listing.specs?.architecturalStyle || '',
      listing.propertyAddress?.street || '',
      listing.propertyAddress?.neighborhood || '',
      listing.propertyAddress?.city || '',
      listing.propertyAddress?.state || '',
      listing.listingStatus || '',
      listing.sourcePortal || '',
      `${listing.specs?.beds || 0} bedrooms`,
      `${listing.specs?.baths || 0} bathrooms`,
      `${listing.specs?.finishedSqFt || 0} sqft`,
      (listing as any).description || '',
    ];

    if (listing.amenities) {
      parts.push(...listing.amenities.map(a => `${a.name} ${a.keyAttribute || ''}`));
    }

    return parts.join(' ').toLowerCase();
  }

  public getCount(): number {
    return this.indexedProperties.size;
  }
}
