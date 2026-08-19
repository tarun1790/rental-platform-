# Antigravity Spec-Driven Data Model: `Shikaak` Platform
**File:** `data-model.spec.md`  
**Specification Version:** `1.0.0`  
**Spatial Reference System:** `EPSG:4326` (WGS 84 GPS Coordinates)  
**Target Environment:** Antigravity Autonomous Agent Runtime / Next.js 14+ / PostgreSQL 16+ (PostGIS 3.4+)

---

## 1. Architectural Invariants & System Directives

1. **Spatial Strictness:** Every freehand scribble lasso polygon must form a closed OGC-compliant LinearRing where `coordinate[0] == coordinate[-1]`. Point-in-polygon queries evaluate containment against the 2D bounding geometry.
2. **Financial Determinism:** Financial outputs (NOI, DSCR, Cap Rate, Cash-on-Cash, Pass/Flow score) must be calculated deterministically via pure mathematical functions without floating approximations.
3. **Data Completeness Rule:** A listing cannot achieve `ACTIVE` status without valid Geotechnical (`bearing_capacity_psf > 0`), Safety (`theft_free_milestone_years >= 0`), and Amenity matrix records.
4. **Design Invariant:** Visual aesthetic uses Crisp White (`#FFFFFF`, `#FAFAFA`) with Bold Cherry/Crimson Red (`#DC2626`, `#B91C1C`) brand primary accents and Emerald Green (`#059669`) for `PASS TO FLOW` investment grades.

---

## 2. Core Domain JSON Schema Definitions

### 2.1 Geospatial & Hand-Drawn Polygon Domain (`geospatial.spec.json`)

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://shikaak.internal/schemas/geospatial.spec.json",
  "title": "GeospatialQuerySpec",
  "type": "object",
  "required": ["query_id", "view_mode", "bounding_geometry"],
  "properties": {
    "query_id": { "type": "string", "format": "uuid" },
    "view_mode": {
      "type": "string",
      "enum": ["2D_VECTOR", "3D_PHOTOREALISTIC_TILES", "SATELLITE_ORBIT"]
    },
    "bounding_geometry": {
      "type": "object",
      "required": ["type", "coordinates"],
      "properties": {
        "type": { "type": "string", "enum": ["Polygon", "MultiPolygon"] },
        "coordinates": {
          "type": "array",
          "items": {
            "type": "array",
            "minItems": 4,
            "items": {
              "type": "array",
              "minItems": 2,
              "maxItems": 3,
              "items": { "type": "number" }
            }
          }
        }
      }
    },
    "isochrone_profile": {
      "type": "object",
      "required": ["origin_lat", "origin_lon", "max_minutes", "travel_mode"],
      "properties": {
        "origin_lat": { "type": "number", "minimum": -90, "maximum": 90 },
        "origin_lon": { "type": "number", "minimum": -180, "maximum": 180 },
        "max_minutes": { "type": "integer", "minimum": 1, "maximum": 120 },
        "travel_mode": {
          "type": "string",
          "enum": ["DRIVING", "TRANSIT", "BICYCLING", "WALKING"]
        }
      }
    }
  }
}
```

### 2.2 Geotechnical Subsurface & Foundation Specs (`geosotechnical.spec.json`)

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://shikaak.internal/schemas/geotechnical.spec.json",
  "title": "GeotechnicalSpecs",
  "type": "object",
  "required": [
    "soil_classification",
    "bearing_capacity_psf",
    "bedrock_depth_ft",
    "water_table_depth_ft",
    "settlement_risk_score"
  ],
  "properties": {
    "soil_classification": { "type": "string" },
    "bearing_capacity_psf": { "type": "number", "minimum": 500, "maximum": 20000 },
    "bedrock_depth_ft": { "type": "number", "minimum": 0 },
    "water_table_depth_ft": { "type": "number", "minimum": 0 },
    "liquefaction_risk_tier": {
      "type": "string",
      "enum": ["VERY_LOW", "LOW", "MODERATE", "HIGH"]
    },
    "expansive_clay_shrink_swell": {
      "type": "string",
      "enum": ["LOW", "MEDIUM", "HIGH"]
    },
    "settlement_risk_score": {
      "type": "number",
      "minimum": 0,
      "maximum": 100,
      "description": "100 indicates zero foundation sinkage probability"
    }
  }
}
```

### 2.3 20-Year Safety, Crime & Emergency Dispatch (`safety.spec.json`)

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://shikaak.internal/schemas/safety.spec.json",
  "title": "SafetyAndDispatchSpecs",
  "type": "object",
  "required": [
    "safety_index_score",
    "theft_free_milestone_years",
    "police_response_avg_min",
    "fire_ems_response_avg_min"
  ],
  "properties": {
    "safety_index_score": { "type": "number", "minimum": 0, "maximum": 100 },
    "theft_free_milestone_years": { "type": "integer", "minimum": 0 },
    "police_response_avg_min": { "type": "number", "minimum": 0 },
    "fire_ems_response_avg_min": { "type": "number", "minimum": 0 },
    "nearest_precinct": {
      "type": "object",
      "required": ["name", "distance_miles", "precinct_code"],
      "properties": {
        "name": { "type": "string" },
        "distance_miles": { "type": "number" },
        "precinct_code": { "type": "string" }
      }
    },
    "traffic_safety": {
      "type": "object",
      "properties": {
        "ten_year_pedestrian_incidents": { "type": "integer" },
        "ten_year_vehicular_collisions": { "type": "integer" },
        "speed_zone_limit_mph": { "type": "integer" },
        "traffic_calming_installed": { "type": "boolean" }
      }
    },
    "incident_log": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["year", "category", "resolved"],
        "properties": {
          "year": { "type": "integer" },
          "category": {
            "type": "string",
            "enum": ["BURGLARY", "VEHICLE_THEFT", "VANDALISM", "COLLISION", "OTHER"]
          },
          "description": { "type": "string" },
          "resolved": { "type": "boolean" }
        }
      }
    }
  }
}
```

### 2.4 Ranked Amenity & Lifestyle Matrix (`amenities.spec.json`)

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://shikaak.internal/schemas/amenities.spec.json",
  "title": "RankedAmenityItem",
  "type": "object",
  "required": [
    "amenity_id",
    "name",
    "category",
    "rank_score",
    "distance_miles",
    "drive_time_minutes"
  ],
  "properties": {
    "amenity_id": { "type": "string" },
    "name": { "type": "string" },
    "category": {
      "type": "string",
      "enum": ["HOSPITAL", "FOOD_MICHELIN", "SHOPPING_MALL", "ENTERTAINMENT", "SCHOOL"]
    },
    "rank_score": { "type": "number", "minimum": 1, "maximum": 100 },
    "distance_miles": { "type": "number", "minimum": 0 },
    "drive_time_minutes": { "type": "number", "minimum": 0 },
    "key_attribute": { "type": "string" },
    "accreditation_or_grade": { "type": "string" }
  }
}
```

### 2.5 Institutional Financial ROI Engine (`financials.spec.json`)

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://shikaak.internal/schemas/financials.spec.json",
  "title": "InvestmentEngineSpecs",
  "type": "object",
  "required": ["inputs", "computed_outputs"],
  "properties": {
    "inputs": {
      "type": "object",
      "required": [
        "purchase_price",
        "down_payment_pct",
        "interest_rate_pct",
        "loan_term_years",
        "monthly_gross_rent"
      ],
      "properties": {
        "purchase_price": { "type": "number", "minimum": 10000 },
        "down_payment_pct": { "type": "number", "minimum": 0, "maximum": 100 },
        "interest_rate_pct": { "type": "number", "minimum": 0, "maximum": 25 },
        "loan_term_years": { "type": "integer", "enum": [15, 20, 30] },
        "monthly_gross_rent": { "type": "number", "minimum": 100 },
        "vacancy_rate_pct": { "type": "number", "default": 5.0 },
        "monthly_property_tax": { "type": "number", "default": 0 },
        "monthly_insurance": { "type": "number", "default": 0 },
        "monthly_hoa_dues": { "type": "number", "default": 0 },
        "maintenance_capex_pct": { "type": "number", "default": 8.0 },
        "management_fee_pct": { "type": "number", "default": 8.0 }
      }
    },
    "computed_outputs": {
      "type": "object",
      "required": [
        "net_operating_income_annual",
        "monthly_debt_service",
        "monthly_net_cash_flow",
        "cap_rate_pct",
        "cash_on_cash_pct",
        "dscr",
        "pass_flow_score",
        "verdict"
      ],
      "properties": {
        "net_operating_income_annual": { "type": "number" },
        "monthly_debt_service": { "type": "number" },
        "monthly_net_cash_flow": { "type": "number" },
        "cap_rate_pct": { "type": "number" },
        "cash_on_cash_pct": { "type": "number" },
        "dscr": { "type": "number" },
        "gross_rent_multiplier": { "type": "number" },
        "pass_flow_score": { "type": "number", "minimum": 1.0, "maximum": 5.0 },
        "verdict": {
          "type": "string",
          "enum": ["FAIL_NEGATIVE_FLOW", "REVIEW_MARGINAL", "PASS_TO_FLOW"]
        }
      }
    }
  }
}
```
