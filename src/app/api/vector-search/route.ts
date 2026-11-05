import { NextRequest, NextResponse } from 'next/server';
import { LuxuryVectorDatabase } from '../../../lib/vector/vector-database';
import LIVE_CRAWLED_DATA from '../../../data/live-crawled-portals.json';
import { ShikaakPropertyListing } from '../../../types/property';

// Lazy singleton initialization with local dataset
const vectorDb = LuxuryVectorDatabase.getInstance();
const listings = LIVE_CRAWLED_DATA as unknown as ShikaakPropertyListing[];
vectorDb.buildIndex(listings);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query = '', limit = 24, filters = {} } = body;

    const results = vectorDb.search(query, {
      limit: Number(limit) || 24,
      filters,
    });

    return NextResponse.json({
      success: true,
      query,
      count: results.length,
      totalIndexed: vectorDb.getCount(),
      results,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Vector search failed', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q') || '';
  const limit = parseInt(searchParams.get('limit') || '24', 10);

  const results = vectorDb.search(query, { limit });

  return NextResponse.json({
    success: true,
    query,
    count: results.length,
    totalIndexed: vectorDb.getCount(),
    results,
  });
}
