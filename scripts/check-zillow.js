const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('data/houses.db');

db.serialize(() => {
  db.get('SELECT COUNT(*) as total FROM properties', (err, row) => {
    console.log('Total Properties in DB:', row ? row.total : err);
  });
  db.get("SELECT COUNT(*) as zillowTotal FROM properties WHERE source_portal = 'ZILLOW'", (err, row) => {
    console.log('Total Zillow Properties:', row ? row.zillowTotal : err);
  });
  db.all('SELECT source_portal, COUNT(*) as count FROM properties GROUP BY source_portal ORDER BY count DESC', (err, rows) => {
    console.log('Breakdown by Portal:', rows);
  });
  db.all("SELECT city, COUNT(*) as count FROM properties WHERE source_portal = 'ZILLOW' GROUP BY city ORDER BY count DESC", (err, rows) => {
    console.log('Zillow by City:', rows);
  });
  db.all("SELECT listing_status, COUNT(*) as count FROM properties WHERE source_portal = 'ZILLOW' GROUP BY listing_status", (err, rows) => {
    console.log('Zillow by Status (Rent vs Sale):', rows);
  });
  db.all("SELECT id, street, city, state, purchase_price, monthly_rent, beds, baths, external_url FROM properties WHERE source_portal = 'ZILLOW' LIMIT 4", (err, rows) => {
    console.log('Sample Zillow Listings:', rows);
  });
});
