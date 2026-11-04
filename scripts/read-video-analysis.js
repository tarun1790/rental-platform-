const fs = require('fs');
const readline = require('readline');
const rl = readline.createInterface({
  input: fs.createReadStream('C:/Users/tarun/.gemini/antigravity/brain/1ea36d88-73a8-4968-95c6-6de9568f0d51/.system_generated/logs/transcript.jsonl'),
  crlfDelay: Infinity
});

rl.on('line', (line) => {
  try {
    const data = JSON.parse(line);
    if (data.step_index >= 10351 && data.step_index <= 10450) {
      if (data.thinking) {
        console.log(`[Step ${data.step_index} Thinking]:\n${data.thinking.slice(0, 500)}\n---`);
      }
      if (data.content && data.source === 'MODEL') {
        console.log(`[Step ${data.step_index} Model]:\n${data.content.slice(0, 500)}\n===`);
      }
    }
  } catch (e) {}
});
