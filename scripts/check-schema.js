const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('data/houses.db');

db.all("PRAGMA table_info(properties)", (err, rows) => {
  if (err) {
    console.error(err);
  } else {
    console.log('Columns in properties table:');
    rows.forEach(r => console.log(` - ${r.name} (${r.type})`));
  }
  
  db.get("SELECT COUNT(*) as total FROM properties", (err, row) => {
    console.log('\nTotal count:', row ? row.total : 0);
    db.close();
  });
});
