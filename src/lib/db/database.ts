import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';
import { ShikaakPropertyListing } from '../../types/property';

const DB_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DB_DIR, 'houses.db');

let dbInstance: sqlite3.Database | null = null;

/**
 * Initializes and returns the singleton SQLite database instance with WAL mode.
 */
export function getDb(): sqlite3.Database {
  if (dbInstance) {
    return dbInstance;
  }

  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  dbInstance = new sqlite3.Database(DB_PATH);

  // Enable Write-Ahead Logging (WAL) for blazing fast concurrent reads & writes
  dbInstance.run('PRAGMA journal_mode = WAL;');
  dbInstance.run('PRAGMA synchronous = NORMAL;');

  initSchema(dbInstance);
  return dbInstance;
}

/**
 * Creates properties table and performance indices
 */
function initSchema(db: sqlite3.Database): void {
  const schema = `
    CREATE TABLE IF NOT EXISTS properties (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      tagline TEXT,
      listing_status TEXT NOT NULL,
      source_portal TEXT NOT NULL,
      external_url TEXT,
      street TEXT,
      neighborhood TEXT,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      zip_code TEXT,
      latitude REAL,
      longitude REAL,
      property_type TEXT,
      beds INTEGER,
      baths REAL,
      sqft INTEGER,
      year_built INTEGER,
      monthly_rent INTEGER,
      purchase_price INTEGER,
      cap_rate REAL,
      pass_flow_score REAL,
      verdict TEXT,
      featured_image TEXT,
      gallery_json TEXT,
      specs_json TEXT,
      financials_json TEXT,
      poi_json TEXT,
      is_live_crawled INTEGER DEFAULT 1,
      crawled_at TEXT,
      raw_json TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_properties_city ON properties(city);
    CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(listing_status);
    CREATE INDEX IF NOT EXISTS idx_properties_beds ON properties(beds);
    CREATE INDEX IF NOT EXISTS idx_properties_portal ON properties(source_portal);
    CREATE INDEX IF NOT EXISTS idx_properties_rent ON properties(monthly_rent);
    CREATE INDEX IF NOT EXISTS idx_properties_price ON properties(purchase_price);
    CREATE INDEX IF NOT EXISTS idx_properties_lat_lng ON properties(latitude, longitude);

    CREATE VIRTUAL TABLE IF NOT EXISTS properties_fts USING fts5(
      id UNINDEXED,
      title,
      street,
      city,
      state,
      neighborhood,
      source_portal,
      content='properties',
      content_rowid='rowid'
    );
  `;

  db.exec(schema, (err) => {
    if (err) {
      console.error('[DATABASE] Schema initialization error:', err.message);
    }
  });
}

/**
 * Converts a ShikaakPropertyListing object to database row parameters
 */
function listingToRow(p: ShikaakPropertyListing) {
  return [
    p.id,
    p.title || 'Verified Residential Property',
    p.tagline || '',
    p.listingStatus || 'FOR_RENT',
    p.sourcePortal || 'MLS_FEED',
    p.externalUrl || '',
    p.propertyAddress?.street || '',
    p.propertyAddress?.neighborhood || '',
    p.propertyAddress?.city || 'Denver',
    p.propertyAddress?.state || 'CO',
    p.propertyAddress?.zipCode || '',
    p.propertyAddress?.location?.latitude || null,
    p.propertyAddress?.location?.longitude || null,
    p.specs?.propertyType || 'CONDO',
    p.specs?.beds || 0,
    p.specs?.baths || 0,
    p.specs?.finishedSqFt || p.specs?.squareFeet || 0,
    p.specs?.yearBuilt || 2020,
    p.financials?.inputs?.monthlyGrossRent || 0,
    p.financials?.inputs?.purchasePrice || 0,
    p.financials?.outputs?.capRatePercent || 0,
    p.financials?.outputs?.passFlowScore || 0,
    p.financials?.outputs?.verdict || 'PASS',
    p.media?.featuredImage || '',
    JSON.stringify(p.media?.gallery || []),
    JSON.stringify(p.specs || {}),
    JSON.stringify(p.financials || {}),
    JSON.stringify(p.nearbyPointsOfInterest || []),
    p.isLiveCrawled ? 1 : 0,
    p.crawlVerifiedAt || new Date().toISOString(),
    JSON.stringify(p),
  ];
}

/**
 * Converts a database row back to ShikaakPropertyListing
 */
export function rowToListing(row: any): ShikaakPropertyListing {
  if (row.raw_json) {
    try {
      const parsed = JSON.parse(row.raw_json);
      return parsed;
    } catch (e) {}
  }

  let gallery: string[] = [];
  try { gallery = JSON.parse(row.gallery_json || '[]'); } catch (e) {}

  let specs: any = {};
  try { specs = JSON.parse(row.specs_json || '{}'); } catch (e) {}

  let financials: any = {};
  try { financials = JSON.parse(row.financials_json || '{}'); } catch (e) {}

  let poi: any[] = [];
  try { poi = JSON.parse(row.poi_json || '[]'); } catch (e) {}

  return {
    id: row.id,
    title: row.title,
    tagline: row.tagline,
    listingStatus: row.listing_status,
    sourcePortal: row.source_portal,
    externalUrl: row.external_url,
    isLiveCrawled: Boolean(row.is_live_crawled),
    crawlVerifiedAt: row.crawled_at,
    propertyAddress: {
      street: row.street,
      neighborhood: row.neighborhood,
      city: row.city,
      state: row.state,
      zipCode: row.zip_code,
      location: {
        latitude: row.latitude || 0,
        longitude: row.longitude || 0,
      },
    },
    specs: {
      propertyType: row.property_type,
      beds: row.beds,
      baths: row.baths,
      finishedSqFt: row.sqft,
      squareFeet: row.sqft,
      yearBuilt: row.year_built,
      stories: specs.stories || 1,
      parkingSpaces: specs.parkingSpaces || 2,
      architecturalStyle: specs.architecturalStyle || 'Modern Architecture',
    },
    financials: financials.inputs ? financials : {
      inputs: {
        purchasePrice: row.purchase_price,
        monthlyGrossRent: row.monthly_rent,
        downPaymentPercent: 20,
        interestRatePercent: 6.5,
        loanTermYears: 30,
        monthlyPropertyTax: Math.round(row.purchase_price * 0.01 / 12),
        monthlyInsurance: 150,
        monthlyHoaDues: 250,
        propertyManagementPercent: 7,
        maintenanceAndCapExPercent: 5,
        vacancyRatePercent: 4,
      },
      outputs: {
        grossAnnualRevenue: row.monthly_rent * 12,
        netOperatingIncomeAnnual: Math.round(row.monthly_rent * 12 * 0.72),
        monthlyDebtService: Math.round(row.purchase_price * 0.005),
        monthlyOperatingExpenses: Math.round(row.monthly_rent * 0.28),
        monthlyMortgagePI: Math.round(row.purchase_price * 0.005),
        monthlyNetCashFlow: Math.round(row.monthly_rent * 0.12),
        capRatePercent: row.cap_rate || 5.2,
        cashOnCashReturnPercent: 4.8,
        grossRentMultiplier: 12.5,
        debtServiceCoverageRatio: 1.25,
        passFlowScore: row.pass_flow_score || 4.8,
        verdict: row.verdict || 'PASS_TO_FLOW',
        verdictReason: 'Institutional Grade Verified Asset',
      },
    },
    nearbyPointsOfInterest: poi,
    media: {
      featuredImage: row.featured_image,
      gallery: gallery.length > 0 ? gallery : [row.featured_image],
    },
  } as unknown as ShikaakPropertyListing;
}

/**
 * Upserts a single property into SQLite
 */
export function upsertProperty(p: ShikaakPropertyListing): Promise<void> {
  return new Promise((resolve, reject) => {
    const db = getDb();
    const sql = `
      INSERT INTO properties (
        id, title, tagline, listing_status, source_portal, external_url,
        street, neighborhood, city, state, zip_code, latitude, longitude,
        property_type, beds, baths, sqft, year_built, monthly_rent, purchase_price,
        cap_rate, pass_flow_score, verdict, featured_image, gallery_json,
        specs_json, financials_json, poi_json, is_live_crawled, crawled_at, raw_json, updated_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP
      )
      ON CONFLICT(id) DO UPDATE SET
        title = excluded.title,
        tagline = excluded.tagline,
        listing_status = excluded.listing_status,
        source_portal = excluded.source_portal,
        external_url = excluded.external_url,
        street = excluded.street,
        neighborhood = excluded.neighborhood,
        city = excluded.city,
        state = excluded.state,
        zip_code = excluded.zip_code,
        latitude = excluded.latitude,
        longitude = excluded.longitude,
        property_type = excluded.property_type,
        beds = excluded.beds,
        baths = excluded.baths,
        sqft = excluded.sqft,
        monthly_rent = excluded.monthly_rent,
        purchase_price = excluded.purchase_price,
        cap_rate = excluded.cap_rate,
        pass_flow_score = excluded.pass_flow_score,
        featured_image = excluded.featured_image,
        raw_json = excluded.raw_json,
        updated_at = CURRENT_TIMESTAMP;
    `;

    db.run(sql, listingToRow(p), (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

/**
 * Upserts a batch of properties in a single database transaction
 */
export function upsertPropertiesBatch(properties: ShikaakPropertyListing[]): Promise<number> {
  return new Promise((resolve, reject) => {
    if (!properties || properties.length === 0) return resolve(0);
    const db = getDb();

    db.serialize(() => {
      db.run('BEGIN TRANSACTION;');

      const sql = `
        INSERT INTO properties (
          id, title, tagline, listing_status, source_portal, external_url,
          street, neighborhood, city, state, zip_code, latitude, longitude,
          property_type, beds, baths, sqft, year_built, monthly_rent, purchase_price,
          cap_rate, pass_flow_score, verdict, featured_image, gallery_json,
          specs_json, financials_json, poi_json, is_live_crawled, crawled_at, raw_json, updated_at
        ) VALUES (
          ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP
        )
        ON CONFLICT(id) DO UPDATE SET
          title = excluded.title,
          monthly_rent = excluded.monthly_rent,
          purchase_price = excluded.purchase_price,
          raw_json = excluded.raw_json,
          updated_at = CURRENT_TIMESTAMP;
      `;

      const stmt = db.prepare(sql);
      let count = 0;

      for (const p of properties) {
        if (!p.id) continue;
        stmt.run(listingToRow(p));
        count++;
      }

      stmt.finalize();

      db.run('COMMIT;', (err) => {
        if (err) reject(err);
        else resolve(count);
      });
    });
  });
}

/**
 * Searches properties from the local database
 */
export function queryProperties(filters: {
  query?: string;
  city?: string;
  listingStatus?: string;
  portal?: string;
  bedsMin?: number;
  priceMin?: number;
  priceMax?: number;
  limit?: number;
  offset?: number;
}): Promise<{ total: number; properties: ShikaakPropertyListing[] }> {
  return new Promise((resolve, reject) => {
    const db = getDb();
    const conditions: string[] = [];
    const params: any[] = [];

    if (filters.city) {
      conditions.push('LOWER(city) LIKE ?');
      params.push(`%${filters.city.toLowerCase()}%`);
    }

    if (filters.listingStatus && filters.listingStatus !== 'ALL') {
      conditions.push('listing_status = ?');
      params.push(filters.listingStatus);
    }

    if (filters.portal && filters.portal !== 'ALL') {
      conditions.push('source_portal = ?');
      params.push(filters.portal);
    }

    if (filters.bedsMin !== undefined && filters.bedsMin > 0) {
      conditions.push('beds >= ?');
      params.push(filters.bedsMin);
    }

    if (filters.priceMin !== undefined && filters.priceMin > 0) {
      conditions.push('(CASE WHEN listing_status = "FOR_RENT" THEN monthly_rent ELSE purchase_price END) >= ?');
      params.push(filters.priceMin);
    }

    if (filters.priceMax !== undefined && filters.priceMax < 5000000) {
      conditions.push('(CASE WHEN listing_status = "FOR_RENT" THEN monthly_rent ELSE purchase_price END) <= ?');
      params.push(filters.priceMax);
    }

    if (filters.query && filters.query.trim()) {
      const q = `%${filters.query.trim().toLowerCase()}%`;
      conditions.push('(LOWER(title) LIKE ? OR LOWER(street) LIKE ? OR LOWER(city) LIKE ? OR LOWER(neighborhood) LIKE ? OR LOWER(source_portal) LIKE ?)');
      params.push(q, q, q, q, q);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const limit = filters.limit || 100;
    const offset = filters.offset || 0;

    const countSql = `SELECT COUNT(*) as count FROM properties ${whereClause}`;
    const dataSql = `SELECT * FROM properties ${whereClause} ORDER BY pass_flow_score DESC, created_at DESC LIMIT ? OFFSET ?`;

    db.get(countSql, params, (err, countRow: any) => {
      if (err) return reject(err);
      const total = countRow?.count || 0;

      db.all(dataSql, [...params, limit, offset], (err2, rows: any[]) => {
        if (err2) return reject(err2);
        const properties = (rows || []).map(rowToListing);
        resolve({ total, properties });
      });
    });
  });
}

/**
 * Retrieves comprehensive statistics of the local SQLite database
 */
export function getDatabaseStats(): Promise<{
  totalProperties: number;
  dbSizeBytes: number;
  dbPath: string;
  portalBreakdown: Record<string, number>;
  cityBreakdown: Record<string, number>;
  statusBreakdown: Record<string, number>;
}> {
  return new Promise((resolve, reject) => {
    const db = getDb();
    let dbSizeBytes = 0;
    try {
      if (fs.existsSync(DB_PATH)) {
        dbSizeBytes = fs.statSync(DB_PATH).size;
      }
    } catch (e) {}

    const stats: any = {
      totalProperties: 0,
      dbSizeBytes,
      dbPath: DB_PATH,
      portalBreakdown: {},
      cityBreakdown: {},
      statusBreakdown: {},
    };

    db.get('SELECT COUNT(*) as total FROM properties', (err, row: any) => {
      if (err) return reject(err);
      stats.totalProperties = row?.total || 0;

      db.all('SELECT source_portal, COUNT(*) as cnt FROM properties GROUP BY source_portal', (err2, portalRows: any[]) => {
        if (!err2 && portalRows) {
          portalRows.forEach(r => stats.portalBreakdown[r.source_portal] = r.cnt);
        }

        db.all('SELECT city, COUNT(*) as cnt FROM properties GROUP BY city ORDER BY cnt DESC LIMIT 15', (err3, cityRows: any[]) => {
          if (!err3 && cityRows) {
            cityRows.forEach(r => stats.cityBreakdown[r.city] = r.cnt);
          }

          db.all('SELECT listing_status, COUNT(*) as cnt FROM properties GROUP BY listing_status', (err4, statusRows: any[]) => {
            if (!err4 && statusRows) {
              statusRows.forEach(r => stats.statusBreakdown[r.listing_status] = r.cnt);
            }
            resolve(stats);
          });
        });
      });
    });
  });
}

/**
 * Executes a strict read-only SQL query with timing & column metadata
 */
export function executeSafeQuery(sql: string): Promise<{
  columns: string[];
  rows: any[];
  rowCount: number;
  executionTimeMs: number;
}> {
  return new Promise((resolve, reject) => {
    const trimmed = sql.trim();
    if (!/^SELECT\b/i.test(trimmed)) {
      return reject(new Error('Strict Security: Only SELECT queries are permitted in SQL Studio.'));
    }

    const start = Date.now();
    const db = getDb();

    db.all(trimmed, [], (err, rows: any[]) => {
      const executionTimeMs = Date.now() - start;
      if (err) return reject(err);

      const rowList = rows || [];
      const columns = rowList.length > 0 ? Object.keys(rowList[0]) : [];
      resolve({
        columns,
        rows: rowList,
        rowCount: rowList.length,
        executionTimeMs,
      });
    });
  });
}

/**
 * Exports full SQLite database dataset to JSON or CSV format
 */
export function exportDataset(format: 'json' | 'csv' = 'json'): Promise<string> {
  return new Promise((resolve, reject) => {
    const db = getDb();
    db.all('SELECT * FROM properties ORDER BY pass_flow_score DESC', [], (err, rows: any[]) => {
      if (err) return reject(err);
      if (format === 'json') {
        const parsed = (rows || []).map(rowToListing);
        return resolve(JSON.stringify(parsed, null, 2));
      }

      // CSV Generation
      const headers = [
        'id', 'title', 'source_portal', 'listing_status', 'street', 'city', 'state', 'zip_code',
        'beds', 'baths', 'sqft', 'monthly_rent', 'purchase_price', 'cap_rate', 'pass_flow_score', 'external_url'
      ];
      const csvLines = [headers.join(',')];
      for (const r of rows || []) {
        const line = headers.map(h => {
          const val = r[h] !== undefined && r[h] !== null ? String(r[h]) : '';
          return `"${val.replace(/"/g, '""')}"`;
        }).join(',');
        csvLines.push(line);
      }
      resolve(csvLines.join('\n'));
    });
  });
}
