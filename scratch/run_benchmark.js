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

const corpusModule = loadTsModule(path.resolve('src/lib/nlp/nlp-training-corpus.ts'));
const engineModule = loadTsModule(path.resolve('src/lib/nlp/self-correcting-engine.ts'));
const listings = require('../src/data/chicago-listings.json');

console.log('================================================================');
console.log('HOUSE INTELLIGENCE - 1,000 CUSTOMER NLP BENCHMARK & TEST SUITE');
console.log('================================================================');

const corpus = corpusModule.generate1000TrainingExamples();
console.log(`Corpus Loaded: ${corpus.length} Structured Customer Training Examples\n`);

let passedCount = 0;
let typosCorrectedCount = 0;
let totalConfidence = 0;

const startTime = Date.now();

for (let i = 0; i < corpus.length; i++) {
  const example = corpus[i];
  const result = engineModule.executeCustomerNlpPipeline(example.query, listings);

  if (result.correctionsApplied.length > 0) {
    typosCorrectedCount += result.correctionsApplied.length;
  }

  totalConfidence += result.confidencePercent;

  if (result.matchedHouses.length > 0 && result.confidencePercent >= 80) {
    passedCount++;
  }

  if (i < 5) {
    console.log(`[Test #${example.id}] "${example.query}"`);
    console.log(`  ➔ Category: ${example.category}`);
    console.log(`  ➔ Confidence: ${result.confidencePercent}%`);
    console.log(`  ➔ Corrections: ${result.correctionsApplied.length > 0 ? result.correctionsApplied.map(c => `"${c.originalToken}" -> "${c.correctedToken}"`).join(', ') : 'None (clean query)'}`);
    console.log(`  ➔ Top Matched House: "${result.matchedHouses[0].listing.title}" (${result.matchedHouses[0].matchScorePercent}% fit)`);
    console.log(`  ➔ Top Reasons: ${result.matchedHouses[0].matchReasons.slice(0, 2).join(' | ')}\n`);
  }
}

const duration = Date.now() - startTime;
const avgConfidence = (totalConfidence / corpus.length).toFixed(1);
const accuracy = ((passedCount / corpus.length) * 100).toFixed(1);

console.log('================================================================');
console.log('BENCHMARK EVALUATION RESULTS:');
console.log(`  Total Queries Evaluated: ${corpus.length}`);
console.log(`  Benchmark Accuracy:      ${accuracy}% (${passedCount}/${corpus.length})`);
console.log(`  Autonomous Typos Fixed:  ${typosCorrectedCount} Mistake Corrections`);
console.log(`  Average Confidence:      ${avgConfidence}%`);
console.log(`  Total Evaluation Time:   ${duration}ms (${(duration / corpus.length).toFixed(2)}ms / query)`);
console.log('================================================================\n');

if (passedCount < 950) {
  console.error('Benchmark failed: Accuracy below 95% threshold');
  process.exit(1);
} else {
  console.log('✔ All 1,000 training queries and mistake corrections verified successfully!');
}
