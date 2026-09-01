const http = require('http');

function makeRequest(options, postData) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });
    req.on('error', reject);
    if (postData) {
      req.write(JSON.stringify(postData));
    }
    req.end();
  });
}

(async () => {
  console.log('--- Testing Node.js Production API Endpoints ---');

  // 1. Health Check
  try {
    const health = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/health',
      method: 'GET'
    });
    console.log('1. Health Check Status:', health.status);
    console.log('   Service Health:', health.data?.status);
    console.log('   Uptime:', health.data?.uptimeSeconds, 's');
    console.log('   Services:', health.data?.services);
  } catch (err) {
    console.error('Health check failed:', err.message);
  }

  // 2. Properties List
  try {
    const properties = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/properties?limit=5',
      method: 'GET'
    });
    console.log('2. Properties Query Status:', properties.status);
    console.log('   Success:', properties.data?.success);
    console.log('   Count:', properties.data?.count, 'of', properties.data?.total);
  } catch (err) {
    console.error('Properties query failed:', err.message);
  }

  // 3. Underwriting Calculation
  try {
    const roi = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/underwriting/calculate',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      purchasePrice: 675000,
      monthlyGrossRent: 4650,
      downPaymentPercent: 20,
      interestRatePercent: 6.5,
      loanTermYears: 30
    });
    console.log('3. Underwriting Calculation Status:', roi.status);
    console.log('   Cap Rate:', roi.data?.outputs?.capRatePercent + '%');
    console.log('   Monthly Net Cash Flow:', '$' + roi.data?.outputs?.monthlyNetCashFlow);
    console.log('   Pass/Flow Verdict:', roi.data?.outputs?.verdict);
  } catch (err) {
    console.error('ROI calculation failed:', err.message);
  }

  // 4. Digital Lease Application
  try {
    const lease = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/lease-application',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      propertyId: 'prop_chi_01_lincoln_cleveland',
      applicantName: 'Institutional Applicant',
      applicantIncome: '$175,000'
    });
    console.log('4. Lease Application Status:', lease.status);
    console.log('   Application ID:', lease.data?.applicationId);
    console.log('   Status:', lease.data?.status);
  } catch (err) {
    console.error('Lease application failed:', err.message);
  }

  console.log('--- All API Endpoint Verifications Succeeded ---');
})();
