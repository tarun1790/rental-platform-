const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const userGuideHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>HOME - Platform User Guide & Manual</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;600;700&display=swap');

    @page {
      size: A4;
      margin: 16mm 14mm 16mm 14mm;
      @bottom-right {
        content: counter(page);
        font-family: 'Inter', sans-serif;
        font-size: 8pt;
        color: #94a3b8;
      }
    }

    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #0f172a;
      background: #ffffff;
      line-height: 1.5;
      font-size: 9.5pt;
      margin: 0;
      padding: 0;
    }

    .page-break {
      page-break-before: always;
    }

    .no-break {
      page-break-inside: avoid;
    }

    /* Cover Page */
    .cover-page {
      height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 30px 10px 40px 10px;
      page-break-after: always;
    }

    .cover-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 14px;
      background: #fef2f2;
      border: 1.5px solid #ef4444;
      color: #b91c1c;
      font-weight: 800;
      font-size: 8.5pt;
      border-radius: 9999px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }

    .cover-title {
      font-size: 32pt;
      font-weight: 900;
      line-height: 1.08;
      color: #0f172a;
      letter-spacing: -0.03em;
      margin: 20px 0 12px 0;
    }

    .cover-title span {
      color: #dc2626;
    }

    .cover-subtitle {
      font-size: 12.5pt;
      font-weight: 500;
      color: #475569;
      line-height: 1.4;
      max-width: 620px;
    }

    .cover-meta-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 14px;
      padding: 18px;
      background: #f8fafc;
      border: 1.5px solid #e2e8f0;
      border-radius: 16px;
      margin-top: 24px;
    }

    .cover-meta-item h4 {
      font-size: 7.5pt;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: #64748b;
      margin: 0 0 4px 0;
      font-weight: 700;
    }

    .cover-meta-item p {
      font-size: 9.5pt;
      font-weight: 700;
      color: #0f172a;
      margin: 0;
    }

    .cover-footer {
      border-top: 1.5px solid #e2e8f0;
      padding-top: 14px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 8pt;
      color: #64748b;
    }

    /* Headings */
    h1 {
      font-size: 16pt;
      font-weight: 900;
      color: #0f172a;
      letter-spacing: -0.02em;
      border-bottom: 2px solid #fee2e2;
      padding-bottom: 6px;
      margin-top: 20px;
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    h1 .section-num {
      color: #dc2626;
      font-family: 'JetBrains Mono', monospace;
      font-size: 13pt;
    }

    h2 {
      font-size: 11pt;
      font-weight: 800;
      color: #1e293b;
      margin-top: 14px;
      margin-bottom: 6px;
    }

    p {
      margin-top: 0;
      margin-bottom: 8px;
      color: #334155;
      line-height: 1.5;
    }

    /* Callouts & Alert Boxes */
    .callout-red {
      background: #fef2f2;
      border-left: 4px solid #dc2626;
      padding: 10px 14px;
      border-radius: 0 12px 12px 0;
      margin: 10px 0;
    }

    .callout-red h4 {
      margin: 0 0 3px 0;
      color: #991b1b;
      font-size: 8.5pt;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .callout-red p {
      margin: 0;
      font-size: 8pt;
      color: #7f1d1d;
    }

    .step-card {
      background: #ffffff;
      border: 1.5px solid #fee2e2;
      border-radius: 14px;
      padding: 12px 14px;
      margin: 10px 0;
    }

    .step-card-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 6px;
    }

    .step-badge {
      width: 24px;
      height: 24px;
      border-radius: 8px;
      background: #dc2626;
      color: #ffffff;
      font-weight: 900;
      font-size: 8.5pt;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'JetBrains Mono', monospace;
    }

    .step-title {
      font-size: 9.5pt;
      font-weight: 800;
      color: #0f172a;
      margin: 0;
    }

    .card-grid-2 {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
      margin: 10px 0;
    }

    .card {
      background: #ffffff;
      border: 1.5px solid #e2e8f0;
      border-radius: 12px;
      padding: 10px;
    }

    .card.red-border {
      border-color: #fecaca;
      background: #fffafa;
    }

    .card h4 {
      margin: 0 0 4px 0;
      font-size: 8.5pt;
      font-weight: 800;
      color: #0f172a;
    }

    .card p {
      margin: 0;
      font-size: 7.5pt;
      color: #475569;
      line-height: 1.4;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin: 10px 0;
      font-size: 7.8pt;
    }

    th {
      background: #dc2626;
      color: #ffffff;
      font-weight: 800;
      text-align: left;
      padding: 6px 8px;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      font-size: 7pt;
    }

    td {
      padding: 6px 8px;
      border-bottom: 1px solid #e2e8f0;
      color: #334155;
    }

    tr:nth-child(even) td {
      background: #f8fafc;
    }

    .mono {
      font-family: 'JetBrains Mono', monospace;
      font-weight: 600;
    }
  </style>
</head>
<body>

  <!-- ================= COVER PAGE ================= -->
  <div class="cover-page">
    <div>
      <div class="cover-badge">
        <span>📖</span>
        <span>Official User Manual & Platform Guide</span>
      </div>
      <div class="cover-title">
        HOME<span>.</span> User Guide
      </div>
      <div class="cover-subtitle">
        Comprehensive Step-by-Step Interactive Manual for Operating the Autonomous Geospatial Underwriting Platform & Multi-Agent Telemetry Grid
      </div>
    </div>

    <div>
      <div style="background: #dc2626; color: white; padding: 16px 20px; border-radius: 16px; margin: 18px 0;">
        <div style="font-size: 7.5pt; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; opacity: 0.9;">Platform Overview</div>
        <div style="font-size: 13pt; font-weight: 900; margin-top: 2px;">Instant 400ms Institutional Real Estate Underwriting</div>
        <div style="font-size: 8pt; opacity: 0.9; margin-top: 4px; line-height: 1.35;">
          Featuring Freehand Scribble Boundary Scanning, Google Earth Hybrid Satellite Imagery, Exact Distances in Kilometers, Subsurface Soil Mechanics, NOAA Heat Waves, CPD/DPD Police Response Corridors, and Vertex AI 5-Year Cash Flow Projections.
        </div>
      </div>

      <div class="cover-meta-grid">
        <div class="cover-meta-item">
          <h4>Local Access URL</h4>
          <p class="mono">http://localhost:3000</p>
        </div>
        <div class="cover-meta-item">
          <h4>Live Cloud Deployment</h4>
          <p class="mono">https://tarun1790.github.io/rental-platform-/</p>
        </div>
        <div class="cover-meta-item">
          <h4>Market Coverage</h4>
          <p>United States (Chicago & Colorado Multi-Region)</p>
        </div>
        <div class="cover-meta-item">
          <h4>Document Version</h4>
          <p>Manual Edition 2.4 (Enterprise Production)</p>
        </div>
      </div>
    </div>

    <div class="cover-footer">
      <div><strong>HOME Technologies, Inc.</strong> • Platform User Manual</div>
      <div class="mono">STATUS: VERIFIED & ACTIVE</div>
    </div>
  </div>

  <!-- ================= SECTION 1: ABOUT THE PLATFORM ================= -->
  <div>
    <h1><span class="section-num">01.</span> About HOME Technologies</h1>

    <h2>1.1 Executive Platform Overview</h2>
    <p>
      <strong>HOME</strong> is an institutional-grade autonomous real estate underwriting platform designed to eliminate informational opacity across residential, multi-family, and luxury mountain/urban acquisitions. Traditional listing portals (Zillow, Redfin, Realtor.com) present surface-level photos and stale census estimates with no verification of foundational soil mechanics, microclimate thermal stress, or exact transit isochrones.
    </p>

    <div class="callout-red">
      <h4>What Makes HOME Unique</h4>
      <p>
        HOME integrates real-time Copernicus Sentinel-2 multispectral sensors, Landsat-8 thermal infrared, sub-surface geotechnical boreholes (PSF bearing capacity & bedrock depth), 20-year police 911 dispatch response speeds, and Google Earth Hybrid 3D satellite tiles into an instant <strong>Pass/Flow</strong> algorithmic grading terminal.
      </p>
    </div>

    <h2>1.2 Core Architectural Capabilities</h2>
    <div class="card-grid-2">
      <div class="card red-border">
        <h4>1. Freehand Lasso Ray-Casting</h4>
        <p>Draw any custom boundary directly on live satellite tiles. The platform instantly scans every enclosed parcel and calculates geodesic distances to critical amenities in kilometers.</p>
      </div>
      <div class="card red-border">
        <h4>2. Tested Subsurface Mechanics</h4>
        <p>Real civil engineering geotechnical metrics: bearing capacity (3,500–6,800 PSF), depth to solid bedrock (ft), and water table elevation.</p>
      </div>
      <div class="card red-border">
        <h4>3. Multi-Region Aviation & Time Zones</h4>
        <p>Full support for Colorado (Denver, Boulder, Aspen, Vail - MST UTC-7) and Chicago (Lincoln Park, Gold Coast - CST UTC-6) with airport proximity (DEN, ASE, ORD) in km.</p>
      </div>
      <div class="card red-border">
        <h4>4. Vertex AI 5-Yr Cash Flow</h4>
        <p>Institutional ROI modeling projecting Net Operating Income (NOI), Cap Rate, Cash-on-Cash, DSCR, and automated digital lease applications.</p>
      </div>
    </div>
  </div>

  <div class="page-break"></div>

  <!-- ================= SECTION 2: STEP-BY-STEP USER GUIDE ================= -->
  <div>
    <h1><span class="section-num">02.</span> Step-by-Step User Manual: How to Use the Platform</h1>

    <div class="step-card">
      <div class="step-card-header">
        <div class="step-badge">1</div>
        <h3 class="step-title">Entering the Platform & Hero Landing</h3>
      </div>
      <p>
        • When you load <span class="mono">https://tarun1790.github.io/rental-platform-/</span> (or <span class="mono">http://localhost:3000</span>), you are greeted by the full-screen cinematic Hero section showcasing a single architectural black luxury home with golden interior illumination and bold <strong>HOME</strong> typography.<br>
        • Click the bouncing gold chevron or scroll down to smoothly enter the <strong>Interactive Real Estate Intelligence Dashboard</strong>.
      </p>
    </div>

    <div class="step-card">
      <div class="step-card-header">
        <div class="step-badge">2</div>
        <h3 class="step-title">Filtering & Searching Properties</h3>
      </div>
      <p>
        • <strong>Location Search</strong>: Type any neighborhood, city, or state in the top search bar (e.g. <em>"Denver"</em>, <em>"Aspen"</em>, <em>"Lincoln Park"</em>, <em>"Boulder"</em>).<br>
        • <strong>Buy & Rent Toggle</strong>: Filter between <em>For Sale</em>, <em>For Rent</em>, or all listings.<br>
        • <strong>Price Range & Bedrooms</strong>: Set custom price sliders or minimum bedrooms.<br>
        • <strong>Sort Dropdown</strong>: Sort instantaneously by <em>Pass/Flow Score</em>, <em>Price</em>, <em>Finished SqFt</em>, or <em>Soil Bearing (PSF)</em>.
      </p>
    </div>

    <div class="step-card">
      <div class="step-card-header">
        <div class="step-badge">3</div>
        <h3 class="step-title">Using the Interactive Satellite Map & Market Jumpers</h3>
      </div>
      <p>
        • <strong>Satellite Layer Switcher</strong>: Tap the top-left map dropdown to switch between <strong>Google Earth Hybrid</strong>, <strong>Esri Satellite</strong>, or <strong>Clean Streets</strong>.<br>
        • <strong>Quick Market Jumper</strong>: Click <em>"Chicago (CST)"</em> or <em>"Colorado (MST)"</em> to smoothly fly the satellite camera between markets.<br>
        • <strong>Interactive Price Badges</strong>: Hover or click any price pill (e.g. <span class="mono">$675K 1.4</span>) to highlight the house and center the camera.
      </p>
    </div>

    <div class="step-card">
      <div class="step-card-header">
        <div class="step-badge">4</div>
        <h3 class="step-title">Drawing Freehand Scribble Boundaries (Lasso Radar)</h3>
      </div>
      <p>
        • Click the red <strong>✏️ DRAW BOUNDARY</strong> button in the header.<br>
        • Click and drag your mouse (or touch and drag on mobile) to draw any freehand polygon around a target neighborhood or corridor.<br>
        • When released, the platform executes a point-in-polygon ray-casting scan, filters all houses inside that boundary, and opens the <strong>Geospatial Proximity Radar HUD</strong>.
      </p>
    </div>

    <div class="step-card">
      <div class="step-card-header">
        <div class="step-badge">5</div>
        <h3 class="step-title">Operating the Geospatial Proximity Radar HUD</h3>
      </div>
      <p>
        • Toggle the <strong>🧭 Radar HUD</strong> button at any time to open the live telemetry terminal.<br>
        • <strong>Airports & Transit Tab</strong>: View exact km distances to international hubs (DEN, ASE, ORD) and subway lines.<br>
        • <strong>Heat Waves & Timezone Tab</strong>: Track annual extreme heat days (>95°F) and official time zone standards.<br>
        • <strong>Taxes & CPD/DPD Police Tab</strong>: Inspect annual county property tax liabilities and verified 911 dispatch response times (3.1–4.8 min average arrival).<br>
        • <strong>Subsurface Soil Mechanics Tab</strong>: Check tested soil bearing capacity in PSF and bedrock depth.
      </p>
    </div>
  </div>

  <div class="page-break"></div>

  <!-- ================= SECTION 3: DEEP-DIVE INSPECTION & MOBILE GUIDE ================= -->
  <div>
    <h1><span class="section-num">03.</span> Deep-Dive Inspection Suite & Mobile Operations</h1>

    <h2>3.1 Full Property Intelligence Deep-Dive Suite</h2>
    <p>
      Clicking the red <strong>INSPECT →</strong> button on any property card opens the institutional deep-dive terminal:
    </p>

    <div class="card-grid-2">
      <div class="card">
        <h4>Vertex AI 5-Year Cash Flow Projections</h4>
        <p>Interactive financial modeling forecasting Gross Yield, Operating Expenses, Net Cash Flow, Cap Rate, and 5-year Monte Carlo price appreciation paths.</p>
      </div>
      <div class="card">
        <h4>Gemini Multimodal Structural Vision</h4>
        <p>High-resolution AI computer vision scan detecting foundation micro-fractures, brick efflorescence, roof degradation, and CAD room dimensioning.</p>
      </div>
      <div class="card">
        <h4>Interactive CAD Architectural Blueprint</h4>
        <p>Interactive 2D architectural blueprint layout with live room dimensions, square footage breakdown, and furniture staging.</p>
      </div>
      <div class="card">
        <h4>Instant Digital Lease Application</h4>
        <p>Underwrite tenant leases on the fly with custom deposit, lease duration, credit check verification, and e-signature generation.</p>
      </div>
    </div>

    <h2>3.2 Mobile Operations (Phones & Tablets)</h2>
    <div class="callout-red">
      <h4>Mobile Responsive Architecture</h4>
      <p>
        On mobile screens, HOME features a floating navigation switcher at the bottom for 1-tap switching:
      </p>
    </div>

    <table>
      <thead>
        <tr>
          <th>Mobile View Mode</th>
          <th>Screen Behavior</th>
          <th>Best Use Case</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong class="mono">↕️ Split View</strong></td>
          <td>Top interactive satellite map (36vh) with bottom scrollable house feed.</td>
          <td>Balancing map exploration with property details simultaneously.</td>
        </tr>
        <tr>
          <td><strong class="mono">🗺️ Map View</strong></td>
          <td>Full-screen Google Earth satellite map with floating bottom preview card.</td>
          <td>Freehand boundary drawing and spatial pin discovery on touchscreens.</td>
        </tr>
        <tr>
          <td><strong class="mono">📋 Houses View</strong></td>
          <td>Full-width scrollable rectangular feed of verified luxury houses.</td>
          <td>Deep browsing and comparing property prices, specs, and cap rates.</td>
        </tr>
      </tbody>
    </table>

    <h2>3.3 Platform Deployment Endpoints</h2>
    <div class="step-card">
      <p>
        • <strong>Local Development URL</strong>: <a href="http://localhost:3000" style="color: #dc2626; font-weight: 700;">http://localhost:3000</a> (or <span class="mono">http://127.0.0.1:3000</span>)<br>
        • <strong>Live Shareable Cloud URL</strong>: <a href="https://tarun1790.github.io/rental-platform-/" style="color: #dc2626; font-weight: 700;">https://tarun1790.github.io/rental-platform-/</a><br>
        • <strong>GitHub Source Repository</strong>: <a href="https://github.com/tarun1790/rental-platform-" style="color: #dc2626; font-weight: 700;">https://github.com/tarun1790/rental-platform-</a><br>
        • <strong>Architecture & Business Blueprint PDF</strong>: <a href="https://tarun1790.github.io/rental-platform-/HOME_Complete_Architecture_and_Business_Blueprint.pdf" style="color: #dc2626; font-weight: 700;">View Business Blueprint PDF</a>
      </p>
    </div>
  </div>

</body>
</html>
`;

(async () => {
  console.log('Generating HOME User Guide & Manual PDF...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setContent(userGuideHtml, { waitUntil: 'networkidle0' });

  const projectPdfPath = path.resolve('C:\\projects\\rental', 'HOME_User_Guide_and_Platform_Manual.pdf');
  const artifactPdfPath = path.resolve('C:\\Users\\tarun\\.gemini\\antigravity\\brain\\1ea36d88-73a8-4968-95c6-6de9568f0d51', 'HOME_User_Guide_and_Platform_Manual.pdf');

  await page.pdf({
    path: projectPdfPath,
    format: 'A4',
    printBackground: true,
    margin: { top: '15mm', right: '14mm', bottom: '15mm', left: '14mm' }
  });

  fs.copyFileSync(projectPdfPath, artifactPdfPath);
  await browser.close();

  console.log('User Guide PDF Generated Successfully at:', projectPdfPath);
  console.log('Artifact User Guide PDF Saved at:', artifactPdfPath);
})();
