const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data', 'houses.db');
const db = new sqlite3.Database(DB_PATH);

async function audit() {
  console.log('[STRIKE RATE AUDITOR] Running complete database field integrity audit...');

  db.all("SELECT * FROM properties", (err, rows) => {
    if (err) {
      console.error('Audit failed:', err);
      process.exit(1);
    }

    const total = rows.length;
    console.log(`Auditing ${total} total property records across all portals...\n`);

    const metrics = {
      total,
      validId: 0,
      validTitle: 0,
      validPortal: 0,
      validStatus: 0,
      validUrl: 0,
      validStreet: 0,
      validCity: 0,
      validState: 0,
      validZip: 0,
      validCoords: 0,
      validPrice: 0,
      validRent: 0,
      validSpecs: 0,
      validMedia: 0,
      validFinancials: 0,
      validGeotechnical: 0,
      validSafety: 0,
      validAmenities: 0,
      validBlueprint: 0,
      validTaxes: 0,
      validOkf: 0,
    };

    const portalBreakdown = {};

    rows.forEach(r => {
      // Portal breakdown
      portalBreakdown[r.source_portal] = (portalBreakdown[r.source_portal] || 0) + 1;

      if (r.id && r.id.length > 3) metrics.validId++;
      if (r.title && r.title.length > 5) metrics.validTitle++;
      if (r.source_portal && ['ZILLOW', 'REDFIN', 'REALTOR', 'APARTMENTS_COM', 'TRULIA', 'MLS_FEED', 'HOTPADS'].includes(r.source_portal)) metrics.validPortal++;
      if (r.listing_status && ['FOR_RENT', 'FOR_SALE'].includes(r.listing_status)) metrics.validStatus++;
      if (r.external_url && r.external_url.startsWith('http')) metrics.validUrl++;
      if (r.street && r.street.length > 3) metrics.validStreet++;
      if (r.city && r.city.length > 2) metrics.validCity++;
      if (r.state && r.state.length === 2) metrics.validState++;
      if (r.zip_code && r.zip_code.length >= 5) metrics.validZip++;
      if (r.latitude && r.longitude && r.latitude > 20 && r.latitude < 55 && r.longitude < -65 && r.longitude > -130) metrics.validCoords++;
      if (r.purchase_price && r.purchase_price > 50000) metrics.validPrice++;
      if (r.monthly_rent && r.monthly_rent > 500) metrics.validRent++;

      if (r.raw_json) {
        try {
          const parsed = JSON.parse(r.raw_json);
          if (parsed.specs && parsed.specs.beds > 0 && parsed.specs.baths > 0 && parsed.specs.finishedSqFt > 0) metrics.validSpecs++;
          if (parsed.media && parsed.media.featuredImage && parsed.media.gallery && parsed.media.gallery.length > 0) metrics.validMedia++;
          if (parsed.financials && parsed.financials.inputs && parsed.financials.outputs && parsed.financials.outputs.capRatePercent > 0) metrics.validFinancials++;
          if (parsed.geotechnical && parsed.geotechnical.bearingCapacityPSF > 0 && parsed.geotechnical.bedrockDepthFeet > 0) metrics.validGeotechnical++;
          if (parsed.safety && parsed.safety.safetyIndexScore > 0 && parsed.safety.theftFreeMilestoneYears > 0) metrics.validSafety++;
          if (parsed.amenities && parsed.amenities.length >= 2) metrics.validAmenities++;
          if (parsed.blueprint && parsed.blueprint.roomsBreakdown && parsed.blueprint.roomsBreakdown.totalRooms > 0) metrics.validBlueprint++;
          if (parsed.propertyTaxes && parsed.propertyTaxes.annualAmountUSD > 0) metrics.validTaxes++;
          if (parsed.id && parsed.propertyAddress && parsed.specs && parsed.financials) metrics.validOkf++;
        } catch (e) {}
      }
    });

    console.log('FIELD-BY-FIELD COMPLETION STRIKE RATE:');
    console.log('----------------------------------------------------');
    for (const [key, val] of Object.entries(metrics)) {
      if (key === 'total') continue;
      const pct = ((val / total) * 100).toFixed(2);
      console.log(` - ${key.padEnd(20)}: ${val}/${total} (${pct}%)`);
    }

    console.log('\nPORTAL INVENTORY BREAKDOWN:');
    console.log('----------------------------------------------------');
    for (const [p, c] of Object.entries(portalBreakdown)) {
      console.log(` - ${p.padEnd(16)}: ${c} residences`);
    }

    const overallStrikeRate = (
      (metrics.validId + metrics.validTitle + metrics.validPortal + metrics.validStatus +
       metrics.validUrl + metrics.validStreet + metrics.validCity + metrics.validState +
       metrics.validZip + metrics.validCoords + metrics.validPrice + metrics.validRent +
       metrics.validSpecs + metrics.validMedia + metrics.validFinancials + metrics.validGeotechnical +
       metrics.validSafety + metrics.validAmenities + metrics.validBlueprint + metrics.validTaxes + metrics.validOkf) /
      (total * 21) * 100
    ).toFixed(2);

    console.log(`\n====================================================`);
    console.log(`OVERALL DATASET INTEGRITY & STRIKE RATE: ${overallStrikeRate}%`);
    console.log(`====================================================`);

    db.close();
  });
}

audit();
