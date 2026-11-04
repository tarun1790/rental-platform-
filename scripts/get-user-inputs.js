const fs = require('fs');
const readline = require('readline');
const path = 'C:/Users/tarun/.gemini/antigravity/brain/1ea36d88-73a8-4968-95c6-6de9568f0d51/.system_generated/logs/transcript.jsonl';

const rl = readline.createInterface({
  input: fs.createReadStream(path),
  crlfDelay: Infinity
});

rl.on('line', (line) => {
  try {
    const data = JSON.parse(line);
    if (data.type === 'USER_INPUT') {
      const clean = (data.content || '').replace(/<[^>]+>/g, '').trim();
      console.log(`[Step ${data.step_index}] ${clean}`);
    }
  } catch (e) {}
});
