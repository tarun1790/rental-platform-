// =========================================================================
// EXA.AI NEURAL CRAWLER & PORTAL INGESTION TEST SUITE
// Validates conversion of live search results from Zillow, Redfin, Realtor,
// Apartments.com, and Trulia into enterprise Shikaak property listings.
// =========================================================================

const fs = require('fs');
const path = require('path');
const ts = require('typescript');

function loadTsModule(absPath) {
  const code = fs.readFileSync(absPath, 'utf8');
  const js = ts.transpileModule(code, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 }
  }).outputText;

  const m = { exports: {} };
  const customRequire = (p) => {
    if (p.startsWith('.')) {
      const resolved = path.resolve(path.dirname(absPath), p);
      if (fs.existsSync(resolved + '.ts')) return loadTsModule(resolved + '.ts');
      if (fs.existsSync(resolved + '.json')) return require(resolved + '.json');
      if (fs.existsSync(resolved + '.js')) return require(resolved + '.js');
      if (fs.existsSync(resolved)) return require(resolved);
    }
    return require(p);
  };

  const fn = new Function('module', 'exports', 'require', '__dirname', '__filename', js);
  fn(m, m.exports, customRequire, path.dirname(absPath), absPath);
  return m.exports;
}

const multiPortalCrawler = loadTsModule(path.resolve('src/lib/crawler/multi-portal-crawler.ts'));
const { convertExaResultToProperty } = multiPortalCrawler;
const { resolveUsMetro } = loadTsModule(path.resolve('src/lib/geo/us-metro-registry.ts'));

let passed = 0;
let total = 0;

function assert(condition, message) {
  total++;
  if (condition) {
    passed++;
    console.log('  [PASS] ' + message);
  } else {
    console.error('  [FAIL] ' + message);
  }
}

console.log('================================================================');
console.log('  EXA.AI NEURAL CRAWLER INGESTION SUITE');
console.log('================================================================');

const metroChicago = resolveUsMetro('Chicago');
const mockWeather = { tempF: 74, tempC: 23, humidity: 48, wind: 9 };

// --- TEST 1: Zillow Rental Ingestion ---
console.log('\n--- TEST 1: Zillow Rental Property Conversion ---');
const zillowResult = {
  id: 'zillow_123',
  url: 'https://www.zillow.com/homedetails/2124-N-Halsted-St-Chicago-IL-60614/3855140_zpid/',
  title: '2124 N Halsted St, Chicago, IL 60614 | Zillow',
  text: '$3,450 / mo - 3 beds 2 baths 1,850 sq ft luxury apartment in Lincoln Park Chicago IL. Features modern kitchen, in-unit washer dryer.',
  highlights: ['$3,450/mo rent for 3 beds 2 baths in Lincoln Park', 'Steps to red line and shopping']
};

const zillowProp = convertExaResultToProperty(zillowResult, 0, metroChicago, mockWeather, 'FOR_RENT');
assert(zillowProp.sourcePortal === 'ZILLOW', 'Source portal correctly tagged as ZILLOW');
assert(zillowProp.externalUrl === zillowResult.url, 'External URL preserved for authentic link navigation');
assert(zillowProp.isLiveCrawled === true, 'isLiveCrawled flag set to true');
assert(zillowProp.listingStatus === 'FOR_RENT', 'Listing status recognized as FOR_RENT');
assert(zillowProp.specs.beds === 3, 'Bedrooms parsed as 3');
assert(zillowProp.specs.baths === 2, 'Bathrooms parsed as 2');
assert(zillowProp.financials.inputs.monthlyGrossRent === 3450, 'Monthly rent parsed accurately: $3,450');
assert(zillowProp.financials.outputs.capRatePercent > 0, 'Cap rate calculated: ' + zillowProp.financials.outputs.capRatePercent + '%');
assert(zillowProp.climateTelemetry.surfaceTempF === 74, 'Live weather telemetry attached: 74°F');
assert(zillowProp.propertyAddress.street.includes('Halsted'), 'Street parsed from title: ' + zillowProp.propertyAddress.street);

// --- TEST 2: Redfin Sale Property Conversion ---
console.log('\n--- TEST 2: Redfin Sale Property Conversion ---');
const redfinResult = {
  id: 'redfin_456',
  url: 'https://www.redfin.com/IL/Chicago/1420-N-Astor-St-60610/home/12345678',
  title: '1420 N Astor St, Chicago, IL 60610 - 4 beds 3.5 baths | Redfin',
  text: '$875,000 Single Family Home for sale. 4 beds, 3.5 baths, 3,200 sqft. Located in Gold Coast historic neighborhood.',
  highlights: ['$875,000 active for-sale property', '3,200 sqft with 2-car garage']
};

const redfinProp = convertExaResultToProperty(redfinResult, 1, metroChicago, mockWeather, 'FOR_SALE');
assert(redfinProp.sourcePortal === 'REDFIN', 'Source portal correctly tagged as REDFIN');
assert(redfinProp.externalUrl === redfinResult.url, 'Direct Redfin URL retained');
assert(redfinProp.listingStatus === 'FOR_SALE', 'Listing status recognized as FOR_SALE');
assert(redfinProp.specs.beds === 4, 'Bedrooms parsed as 4');
assert(redfinProp.specs.baths === 3.5, 'Bathrooms parsed as 3.5');
assert(redfinProp.specs.finishedSqFt === 3200, 'Finished square footage parsed: 3,200');
assert(redfinProp.financials.inputs.purchasePrice === 875000, 'Purchase price parsed accurately: $875,000');
assert(redfinProp.propertyAddress.street.includes('Astor'), 'Street parsed from title: ' + redfinProp.propertyAddress.street);

// --- TEST 3: Realtor.com Ingestion ---
console.log('\n--- TEST 3: Realtor.com Ingestion ---');
const realtorResult = {
  id: 'realtor_789',
  url: 'https://www.realtor.com/realestateandhomes-detail/1850-N-Orchard-St_Chicago_IL_60614_M1234',
  title: '1850 N Orchard St, Chicago, IL 60614 | Realtor.com',
  text: 'Condo for sale: $620,000 with 2 beds and 2 baths, 1,450 sqft contemporary residence.',
  highlights: ['$620,000 condo in Lincoln Park']
};

const realtorProp = convertExaResultToProperty(realtorResult, 2, metroChicago, mockWeather, 'FOR_SALE');
assert(realtorProp.sourcePortal === 'REALTOR', 'Source portal correctly tagged as REALTOR');
assert(realtorProp.specs.propertyType === 'CONDO', 'Property type recognized as CONDO');
assert(realtorProp.financials.inputs.purchasePrice === 620000, 'Purchase price parsed: $620,000');

// --- TEST 4: Apartments.com Ingestion ---
console.log('\n--- TEST 4: Apartments.com Ingestion ---');
const aptsResult = {
  id: 'apts_101',
  url: 'https://www.apartments.com/1122-n-clark-st-chicago-il/xyz123/',
  title: '1122 N Clark St - Apartments for Rent | Apartments.com',
  text: '$2,250/mo. Studio to 2 bedroom units available. Contemporary downtown loft living.',
  highlights: ['$2,250 per month', 'In-unit amenities included']
};

const aptsProp = convertExaResultToProperty(aptsResult, 3, metroChicago, mockWeather, 'FOR_RENT');
assert(aptsProp.sourcePortal === 'APARTMENTS_COM', 'Source portal correctly tagged as APARTMENTS_COM');
assert(aptsProp.listingStatus === 'FOR_RENT', 'Identified as rental property');
assert(aptsProp.financials.inputs.monthlyGrossRent === 2250, 'Rent parsed: $2,250/mo');

// --- TEST 5: Trulia Ingestion ---
console.log('\n--- TEST 5: Trulia Ingestion ---');
const truliaResult = {
  id: 'trulia_202',
  url: 'https://www.trulia.com/p/il/chicago/2400-n-lake-view-ave-chicago-il-60614--123',
  title: '2400 N Lake View Ave, Chicago, IL 60614 | Trulia',
  text: 'Multi-family townhouse for sale at $1,450,000. 5 beds, 4 baths.',
  highlights: ['$1,450,000 multi-unit estate']
};

const truliaProp = convertExaResultToProperty(truliaResult, 4, metroChicago, mockWeather, 'FOR_SALE');
assert(truliaProp.sourcePortal === 'TRULIA', 'Source portal correctly tagged as TRULIA');
assert(truliaProp.specs.beds === 5, 'Bedrooms parsed as 5');
assert(truliaProp.specs.baths === 4, 'Bathrooms parsed as 4');

console.log('\n================================================================');
console.log('  RESULTS: ' + passed + '/' + total + ' TESTS PASSED (' + ((passed / total) * 100).toFixed(1) + '%)');
console.log('================================================================');

if (passed !== total) {
  process.exit(1);
}
