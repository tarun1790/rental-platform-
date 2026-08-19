-- =========================================================================
-- Shikaak (formerly Pillow) Next-Gen Spatial Intelligence Database Schema
-- Database Engine: PostgreSQL 16+ with PostGIS 3.4+ Extension
-- Spatial Reference System: EPSG:4326 (WGS 84 GPS Coordinates)
-- =========================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- 1. ENUM DEFINITIONS
CREATE TYPE property_type_enum AS ENUM (
    'SINGLE_FAMILY',
    'CONDO',
    'MULTI_FAMILY_2_4',
    'TOWNHOUSE'
);

CREATE TYPE liquefaction_risk_enum AS ENUM (
    'VERY_LOW',
    'LOW',
    'MODERATE',
    'HIGH'
);

CREATE TYPE shrink_swell_enum AS ENUM (
    'LOW',
    'MEDIUM',
    'HIGH'
);

CREATE TYPE incident_category_enum AS ENUM (
    'BURGLARY',
    'VEHICLE_THEFT',
    'VANDALISM',
    'VIOLENT_CRIME',
    'COLLISION',
    'OTHER'
);

CREATE TYPE amenity_category_enum AS ENUM (
    'HOSPITAL',
    'FOOD_MICHELIN',
    'SHOPPING_MALL',
    'ENTERTAINMENT',
    'SCHOOL'
);

CREATE TYPE investment_verdict_enum AS ENUM (
    'FAIL_NEGATIVE_FLOW',
    'REVIEW_MARGINAL',
    'PASS_TO_FLOW'
);

-- 2. PROPERTIES TABLE
CREATE TABLE listings (
    id VARCHAR(64) PRIMARY KEY,
    street VARCHAR(255) NOT NULL,
    neighborhood VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL DEFAULT 'Chicago',
    state VARCHAR(2) NOT NULL DEFAULT 'IL',
    zip_code VARCHAR(10) NOT NULL,
    
    -- PostGIS Geometry Point (EPSG:4326)
    location GEOMETRY(Point, 4326) NOT NULL,
    altitude_meters NUMERIC(6, 2) DEFAULT 180.0,
    
    -- Specs
    beds INTEGER NOT NULL,
    baths NUMERIC(3, 1) NOT NULL,
    finished_sqft NUMERIC(8, 2) NOT NULL,
    lot_size_sqft NUMERIC(10, 2),
    year_built INTEGER NOT NULL,
    property_type property_type_enum NOT NULL DEFAULT 'SINGLE_FAMILY',
    
    -- Images & Media
    featured_image_url TEXT NOT NULL,
    gallery_image_urls TEXT[] DEFAULT '{}',
    matterport_3d_url TEXT,
    cad_blueprint_url TEXT,
    
    -- Subsurface Geotechnical Specs
    soil_classification VARCHAR(150) NOT NULL,
    bearing_capacity_psf NUMERIC(8, 2) NOT NULL,
    bedrock_depth_ft NUMERIC(5, 1) NOT NULL,
    water_table_depth_ft NUMERIC(5, 1) NOT NULL,
    liquefaction_risk liquefaction_risk_enum NOT NULL DEFAULT 'VERY_LOW',
    expansive_clay_shrink_swell shrink_swell_enum NOT NULL DEFAULT 'LOW',
    settlement_risk_score NUMERIC(5, 2) NOT NULL DEFAULT 99.0,
    
    -- 20-Year Safety & Incident Timeline
    safety_index_score NUMERIC(5, 2) NOT NULL DEFAULT 95.0,
    theft_free_milestone_years INTEGER NOT NULL DEFAULT 20,
    police_response_avg_min NUMERIC(4, 2) NOT NULL,
    fire_ems_response_avg_min NUMERIC(4, 2) NOT NULL,
    nearest_precinct_name VARCHAR(150) NOT NULL,
    nearest_precinct_dist_mi NUMERIC(4, 2) NOT NULL,
    nearest_precinct_code VARCHAR(50),
    ten_year_pedestrian_incidents INTEGER NOT NULL DEFAULT 0,
    ten_year_vehicular_collisions INTEGER NOT NULL DEFAULT 0,
    speed_zone_limit_mph INTEGER NOT NULL DEFAULT 20,
    traffic_calming_installed BOOLEAN NOT NULL DEFAULT TRUE,
    
    -- Microclimate & Traffic Telemetry
    annual_sun_hours NUMERIC(6, 1) DEFAULT 2450.0,
    wind_buffering_score NUMERIC(5, 2) DEFAULT 85.0,
    peak_noise_decibels_rush_hour NUMERIC(5, 2) DEFAULT 48.0,
    snow_clearance_priority_tier INTEGER DEFAULT 1,
    
    -- Financial Parameters
    purchase_price NUMERIC(12, 2) NOT NULL,
    monthly_gross_rent NUMERIC(10, 2) NOT NULL,
    down_payment_pct NUMERIC(5, 2) NOT NULL DEFAULT 20.0,
    interest_rate_pct NUMERIC(5, 2) NOT NULL DEFAULT 6.5,
    loan_term_years INTEGER NOT NULL DEFAULT 30,
    vacancy_rate_pct NUMERIC(5, 2) NOT NULL DEFAULT 5.0,
    monthly_property_tax NUMERIC(10, 2) NOT NULL DEFAULT 0.0,
    monthly_insurance NUMERIC(10, 2) NOT NULL DEFAULT 0.0,
    monthly_hoa_dues NUMERIC(10, 2) NOT NULL DEFAULT 0.0,
    maintenance_capex_pct NUMERIC(5, 2) NOT NULL DEFAULT 8.0,
    management_fee_pct NUMERIC(5, 2) NOT NULL DEFAULT 8.0,
    
    -- Deterministic Output Cache
    cached_noi_annual NUMERIC(12, 2),
    cached_monthly_cash_flow NUMERIC(10, 2),
    cached_cap_rate_pct NUMERIC(5, 2),
    cached_coc_pct NUMERIC(5, 2),
    cached_dscr NUMERIC(5, 2),
    cached_pass_flow_score NUMERIC(3, 1),
    cached_verdict investment_verdict_enum,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Spatial GIST Index for Sub-Millisecond Bounding Queries
CREATE INDEX idx_listings_location ON listings USING GIST(location);
CREATE INDEX idx_listings_price ON listings(purchase_price);
CREATE INDEX idx_listings_rent ON listings(monthly_gross_rent);
CREATE INDEX idx_listings_pass_flow_score ON listings(cached_pass_flow_score);

-- 3. SAFETY INCIDENTS TIMELINE TABLE
CREATE TABLE safety_incidents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id VARCHAR(64) REFERENCES listings(id) ON DELETE CASCADE,
    incident_year INTEGER NOT NULL,
    category incident_category_enum NOT NULL,
    description TEXT NOT NULL,
    resolved BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. RANKED AMENITIES TABLE
CREATE TABLE ranked_amenities (
    id VARCHAR(64) PRIMARY KEY,
    listing_id VARCHAR(64) REFERENCES listings(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    category amenity_category_enum NOT NULL,
    rank_score NUMERIC(5, 2) NOT NULL,
    distance_miles NUMERIC(5, 2) NOT NULL,
    drive_time_minutes NUMERIC(5, 1) NOT NULL,
    key_attribute VARCHAR(255) NOT NULL,
    hygiene_grade_or_rating VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. ROOM BREAKDOWN TABLE
CREATE TABLE listing_rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id VARCHAR(64) REFERENCES listings(id) ON DELETE CASCADE,
    room_name VARCHAR(100) NOT NULL,
    width_ft NUMERIC(5, 2) NOT NULL,
    length_ft NUMERIC(5, 2) NOT NULL,
    ceiling_height_ft NUMERIC(4, 2) NOT NULL,
    square_footage NUMERIC(6, 2) NOT NULL,
    window_orientation VARCHAR(10) NOT NULL,
    has_en_suite_bath BOOLEAN NOT NULL DEFAULT FALSE
);

-- =========================================================================
-- SPATIAL QUERY BENCHMARK: FREEHAND SCRIBBLE / LASSO CONTAINMENT
-- =========================================================================
-- Example query when the user draws a polygon lasso over Lincoln Park:
--
-- SELECT 
--     id,
--     street,
--     neighborhood,
--     beds,
--     baths,
--     finished_sqft,
--     purchase_price,
--     monthly_gross_rent,
--     cached_pass_flow_score,
--     soil_classification,
--     safety_index_score,
--     theft_free_milestone_years,
--     ST_AsGeoJSON(location) AS coordinates_geojson
-- FROM listings
-- WHERE ST_Contains(
--     ST_SetSRID(
--         ST_GeomFromGeoJSON('{
--             "type": "Polygon",
--             "coordinates": [[
--                 [-87.6500, 41.9180],
--                 [-87.6400, 41.9180],
--                 [-87.6400, 41.9250],
--                 [-87.6500, 41.9250],
--                 [-87.6500, 41.9180]
--             ]]
--         }'),
--         4326
--     ),
--     listings.location
-- )
-- ORDER BY cached_pass_flow_score DESC;
