const fs = require('fs');
const path = require('path');
const ts = require('typescript');

const tsPath = path.join(__dirname, '..', 'src', 'data', 'chicago-listings.ts');
const tsCode = fs.readFileSync(tsPath, 'utf8');

const jsCode = ts.transpileModule(tsCode, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 }
}).outputText;

const m = { exports: {} };
const fn = new Function('module', 'exports', 'require', jsCode);
fn(m, m.exports, require);

const listings = m.exports.CHICAGO_LISTINGS;
console.log('Transpiled listings count:', listings?.length);

if (listings && listings.length > 0) {
  const jsonPath = path.join(__dirname, '..', 'src', 'data', 'chicago-listings.json');
  fs.writeFileSync(jsonPath, JSON.stringify(listings, null, 2), 'utf8');
  console.log('Saved chicago-listings.json successfully!');
}
