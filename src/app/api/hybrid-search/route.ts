import { NextRequest, NextResponse } from 'next/server';
import { LuxuryVectorDatabase } from '../../../lib/vector/vector-database';
import LIVE_CRAWLED_DATA from '../../../data/live-crawled-portals.json';
import { ShikaakPropertyListing } from '../../../types/property';

// Lazy singleton initialization with local dataset
const vectorDb = LuxuryVectorDatabase.getInstance();
const listings = LIVE_CRAWLED_DATA as unknown as ShikaakPropertyListing[];
vectorDb.buildIndex(listings);

/**
 * Two-Stage Hybrid Retrieval & Live-Hydration API Route
 * Combines Stage 1 fast relational pre-filtering with Stage 2 128-D cosine similarity and ROI fusion.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      metro,
      maxPrice,
      minPrice,
      minBeds,
      naturalLanguageQuery = '',
      alpha = 0.8,
      limit = 24,
    } = body;

    const results = vectorDb.executeHybridPropertySearch({
      metro,
      maxPrice,
      minPrice,
      minBeds,
      naturalLanguageQuery,
      alpha,
      limit: Number(limit) || 24,
    });

    return NextResponse.json({
      success: true,
      pipeline: 'TWO_STAGE_HYBRID_RETRIEVAL',
      query: naturalLanguageQuery,
      metro: metro || 'ALL_METROS',
      alpha,
      count: results.length,
      totalIndexed: vectorDb.getCount(),
      results,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Hybrid search failed', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const metro = searchParams.get('metro') || undefined;
  const naturalLanguageQuery = searchParams.get('q') || '';
  const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined;
  const minBeds = searchParams.get('minBeds') ? Number(searchParams.get('minBeds')) : undefined;
  const alpha = searchParams.get('alpha') ? Number(searchParams.get('alpha')) : 0.8;
  const limit = parseInt(searchParams.get('limit') || '24', 10);

  const results = vectorDb.executeHybridPropertySearch({
    metro,
    maxPrice,
    minBeds,
    naturalLanguageQuery,
    alpha,
    limit,
  });

  return NextResponse.json({
    success: true,
    pipeline: 'TWO_STAGE_HYBRID_RETRIEVAL',
    query: naturalLanguageQuery,
    metro: metro || 'ALL_METROS',
    alpha,
    count: results.length,
    totalIndexed: vectorDb.getCount(),
    results,
  });
}
