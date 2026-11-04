const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('data/houses.db');

db.all("SELECT * FROM properties LIMIT 2", (err, rows) => {
  if (err) {
    console.error(err);
  } else {
    rows.forEach(r => {
      console.log('ID:', r.id);
      console.log('Title:', r.title);
      console.log('Portal:', r.source_portal);
      console.log('Status:', r.listing_status);
      console.log('Price:', r.purchase_price, 'Rent:', r.monthly_rent);
      console.log('Raw JSON preview:', r.raw_json ? r.raw_json.slice(0, 200) : 'null');
      console.log('-------------------------------------------');
    });
  }
  db.close();
});
