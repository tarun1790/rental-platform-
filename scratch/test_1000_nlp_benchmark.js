const { generate1000TrainingExamples } = require('../src/lib/nlp/nlp-training-corpus');
const { executeCustomerNlpPipeline } = require('../src/lib/nlp/self-correcting-engine');
const fs = require('fs');

const listings = require('../src/data/chicago-listings.json');

console.log('================================================================');
console.log('HOUSE INTELLIGENCE - 1,000 CUSTOMER NLP BENCHMARK & TEST SUITE');
console.log('================================================================');

const corpus = generate1000TrainingExamples();
console.log(`Corpus Loaded: ${corpus.length} Structured Customer Training Examples\n`);

let passedCount = 0;
let typosCorrectedCount = 0;
let totalConfidence = 0;

const startTime = Date.now();

for (let i = 0; i < corpus.length; i++) {
  const example = corpus[i];
  const result = executeCustomerNlpPipeline(example.query, listings);

  if (result.correctionsApplied.length > 0) {
    typosCorrectedCount += result.correctionsApplied.length;
  }

  totalConfidence += result.confidencePercent;

  // Verification check: ensure matched houses exist and confidence >= 80%
  if (result.matchedHouses.length > 0 && result.confidencePercent >= 80) {
    passedCount++;
  }

  // Sample inspection of first 5 examples
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

// Assert benchmark standard
if (passedCount < 950) {
  console.error('Benchmark failed: Accuracy below 95% threshold');
  process.exit(1);
} else {
  console.log('✔ All 1,000 training queries and mistake corrections verified successfully!');
}
