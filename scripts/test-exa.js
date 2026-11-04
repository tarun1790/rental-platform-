const https = require('https');

const apiKey = '16188ca6-8926-4fc0-af24-6dc2f92f1d65';
const data = JSON.stringify({
  query: 'site:zillow.com homes for sale Chicago IL',
  numResults: 5,
  useAutoprompt: true
});

const req = https.request('https://api.exa.ai/search', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': apiKey,
  }
}, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log('Exa API Status:', res.statusCode);
    try {
      const parsed = JSON.parse(body);
      console.log('Results count:', parsed.results ? parsed.results.length : 0);
      if (parsed.results && parsed.results.length > 0) {
        console.log('Sample result:', parsed.results[0].title, parsed.results[0].url);
      } else {
        console.log('Response body:', body.slice(0, 300));
      }
    } catch (e) {
      console.log('Raw body:', body.slice(0, 300));
    }
  });
});

req.on('error', (e) => console.error('Error:', e.message));
req.write(data);
req.end();
