-- ======================================================================================
-- PathClear Database Schema (db.sql)
-- Architecture: Vertical Slice Architecture (PostgreSQL 15+ with PostGIS support)
-- Purpose: Hyper-focused, low-friction accessibility navigation & real-time entrance verification
-- ======================================================================================

-- --------------------------------------------------------------------------------------
-- EXTENSIONS & INITIAL SETUP
-- --------------------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- --------------------------------------------------------------------------------------
-- ENUM TYPES (Domain Value Contracts)
-- --------------------------------------------------------------------------------------
DO $$ BEGIN
    CREATE TYPE mobility_type AS ENUM (
        'wheelchair_manual',
        'wheelchair_power',
        'walker',
        'cane',
        'stroller',
        'visual_guide',
        'limited_stamina'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE door_type AS ENUM (
        'automatic_sliding',
        'automatic_swing',
        'push_button_actuator',
        'manual_light',
        'manual_heavy',
        'revolving_with_accessible_bypass'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE hazard_type AS ENUM (
        'step',
        'curb_lip',
        'steep_slope',
        'gravel_debris',
        'broken_surface',
        'construction_trench',
        'elevator_outage',
        'narrow_passage',
        'audio_signal_broken'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE hazard_severity AS ENUM (
        'low_caution',
        'medium_friction',
        'high_barrier',
        'critical_blocker'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE surface_type AS ENUM (
        'smooth_asphalt',
        'poured_concrete',
        'tactile_pavers',
        'interlocking_tiles',
        'brick_paving',
        'gravel',
        'cobblestone',
        'dirt'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE verification_target_type AS ENUM (
        'entrance',
        'hazard',
        'route_segment',
        'elevator'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE verification_response AS ENUM (
        'clear',
        'blocked',
        'smooth',
        'issue_reported'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- --------------------------------------------------------------------------------------
-- HELPER FUNCTIONS (Timestamp Maintenance & Confidence Decay Math)
-- --------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Exponential time-decay confidence score function:
-- confidence(t) = base_confidence * (0.5 ^ (hours_elapsed / half_life_hours))
CREATE OR REPLACE FUNCTION fn_calculate_decayed_confidence(
    p_base_confidence NUMERIC,
    p_last_verified_at TIMESTAMPTZ,
    p_half_life_hours NUMERIC DEFAULT 24.0
)
RETURNS NUMERIC AS $$
DECLARE
    v_elapsed_hours NUMERIC;
    v_decay_factor NUMERIC;
BEGIN
    IF p_base_confidence IS NULL OR p_last_verified_at IS NULL THEN
        RETURN 0.50;
    END IF;
    
    v_elapsed_hours := GREATEST(0.0, EXTRACT(EPOCH FROM (NOW() - p_last_verified_at)) / 3600.0);
    v_decay_factor := POWER(0.5, v_elapsed_hours / NULLIF(p_half_life_hours, 0.0));
    
    RETURN ROUND((p_base_confidence * v_decay_factor)::NUMERIC, 3);
END;
$$ LANGUAGE plpgsql STABLE;

-- ======================================================================================
-- SLICE 1: USERS & ACCESSIBILITY PROFILES SLICE
-- Manages traveler mobility criteria, slope tolerances, and audio-tactile preferences.
-- ======================================================================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE,
    full_name VARCHAR(150),
    avatar_url TEXT,
    preferred_city_id VARCHAR(50) DEFAULT 'mumbai',
    high_contrast_enabled BOOLEAN DEFAULT FALSE,
    audio_guidance_enabled BOOLEAN DEFAULT TRUE,
    haptic_feedback_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS accessibility_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    profile_name VARCHAR(100) NOT NULL,
    mobility_type mobility_type NOT NULL DEFAULT 'wheelchair_manual',
    max_incline_percent NUMERIC(4, 1) NOT NULL DEFAULT 4.0 CHECK (max_incline_percent >= 0.0 AND max_incline_percent <= 30.0),
    require_step_free BOOLEAN NOT NULL DEFAULT TRUE,
    require_tactile_paving BOOLEAN NOT NULL DEFAULT FALSE,
    require_well_lit BOOLEAN NOT NULL DEFAULT FALSE,
    avoid_broken_surfaces BOOLEAN NOT NULL DEFAULT TRUE,
    avoid_cobblestones BOOLEAN NOT NULL DEFAULT TRUE,
    min_door_width_inches NUMERIC(4, 1) DEFAULT 32.0,
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    metadata JSONB DEFAULT '{}'::jsonb, -- Open extension point for future slice attributes
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_accessibility_profiles_user ON accessibility_profiles(user_id);

CREATE TABLE IF NOT EXISTS user_saved_places (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    label VARCHAR(100) NOT NULL, -- 'Home', 'Office', 'Bandra Clinic'
    address TEXT,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    location_geom GEOMETRY(Point, 4326),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_saved_places_user ON user_saved_places(user_id);
CREATE INDEX IF NOT EXISTS idx_user_saved_places_geom ON user_saved_places USING GIST(location_geom);

-- ======================================================================================
-- SLICE 2: GEOGRAPHY & CITIES SLICE
-- Manages regional domains, transit hubs, and spatial bounds.
-- ======================================================================================
CREATE TABLE IF NOT EXISTS cities (
    id VARCHAR(50) PRIMARY KEY, -- 'mumbai', 'delhi', 'bengaluru', 'pune', 'hyderabad', 'ahmedabad'
    name VARCHAR(100) NOT NULL,
    country_code VARCHAR(3) NOT NULL DEFAULT 'IND',
    center_latitude DOUBLE PRECISION NOT NULL,
    center_longitude DOUBLE PRECISION NOT NULL,
    center_geom GEOMETRY(Point, 4326),
    bounding_box GEOMETRY(Polygon, 4326),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS transit_hubs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    city_id VARCHAR(50) NOT NULL REFERENCES cities(id) ON DELETE RESTRICT,
    name VARCHAR(200) NOT NULL, -- e.g. 'BKC Metro Station Aqua Line 3', 'Bandra West Railway'
    hub_type VARCHAR(50) NOT NULL DEFAULT 'metro', -- 'metro', 'railway', 'bus_terminal', 'ferry'
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    location_geom GEOMETRY(Point, 4326),
    elevator_count INT NOT NULL DEFAULT 1,
    elevators_operational INT NOT NULL DEFAULT 1,
    tactile_paving_present BOOLEAN NOT NULL DEFAULT TRUE,
    all_platforms_step_free BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transit_hubs_city ON transit_hubs(city_id);
CREATE INDEX IF NOT EXISTS idx_transit_hubs_geom ON transit_hubs USING GIST(location_geom);

-- ======================================================================================
-- SLICE 3: DESTINATION BUILDINGS & VENUES SLICE
-- Destination complexes (Malls, Convention Centers, Hospitals, Civic Centers).
-- ======================================================================================
CREATE TABLE IF NOT EXISTS buildings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    city_id VARCHAR(50) NOT NULL REFERENCES cities(id) ON DELETE RESTRICT,
    name VARCHAR(255) NOT NULL, -- 'Jio World Centre', 'Civic Center & Library'
    category VARCHAR(100) NOT NULL DEFAULT 'commercial', -- 'commercial', 'transit', 'civic', 'healthcare'
    formatted_address TEXT NOT NULL,
    street_latitude DOUBLE PRECISION NOT NULL,
    street_longitude DOUBLE PRECISION NOT NULL,
    street_geom GEOMETRY(Point, 4326),
    building_footprint GEOMETRY(Polygon, 4326),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_buildings_city ON buildings(city_id);
CREATE INDEX IF NOT EXISTS idx_buildings_street_geom ON buildings USING GIST(street_geom);

-- ======================================================================================
-- SLICE 4: THE SIGNATURE "LAST 50 FEET" ENTRANCES SLICE
-- Routes directly to the exact accessible door; holds photos, doorway clearances & dimensions.
-- ======================================================================================
CREATE TABLE IF NOT EXISTS building_entrances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    building_id UUID NOT NULL REFERENCES buildings(id) ON DELETE CASCADE,
    entrance_name VARCHAR(150) NOT NULL, -- 'Gate 3 North Concourse', 'West Ramp Accessible Entrance'
    is_primary_accessible BOOLEAN NOT NULL DEFAULT TRUE,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    door_geom GEOMETRY(Point, 4326),
    
    -- Doorway Mechanics & Physical Specifications (from Mockup Screens 1, 4, 8)
    door_type door_type NOT NULL DEFAULT 'automatic_sliding',
    clear_width_inches NUMERIC(4, 1) NOT NULL DEFAULT 36.0, -- e.g. 42.0"
    clear_width_cm NUMERIC(5, 1) GENERATED ALWAYS AS (clear_width_inches * 2.54) STORED,
    sensor_range_meters NUMERIC(3, 1) DEFAULT 2.4, -- Sensor detection cone (Screen 4)
    push_pad_height_inches NUMERIC(3, 1) DEFAULT 34.0, -- Secondary push button height
    
    -- Vertical Thresholds & Steps
    step_count INT NOT NULL DEFAULT 0 CHECK (step_count >= 0),
    threshold_lip_inches NUMERIC(3, 1) NOT NULL DEFAULT 0.0, -- 0.0" Flush Lip
    has_continuous_ramp BOOLEAN NOT NULL DEFAULT TRUE,
    ramp_slope_percent NUMERIC(4, 2) DEFAULT 2.10, -- 2.1% Smooth Ramp
    has_safety_handrails BOOLEAN NOT NULL DEFAULT TRUE,
    has_tactile_paving BOOLEAN NOT NULL DEFAULT TRUE,
    turning_radius_inches NUMERIC(4, 1) DEFAULT 60.0, -- 60" circle ADA turn clearance
    
    -- Visual Preview Media (Signature Feature B)
    primary_photo_url TEXT,
    annotated_photo_url TEXT, -- Annotated diagram showing dimensions
    photo_caption TEXT,
    
    -- Real-Time Freshness & Confidence Metrics
    base_confidence_score NUMERIC(4, 3) NOT NULL DEFAULT 1.000 CHECK (base_confidence_score BETWEEN 0.0 AND 1.0),
    current_confidence_score NUMERIC(4, 3) NOT NULL DEFAULT 1.000,
    confidence_decay_half_life_hours NUMERIC(5, 1) NOT NULL DEFAULT 168.0, -- 7 days for physical doors
    verification_count INT NOT NULL DEFAULT 1,
    last_verified_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Qualitative Accessibility Notes
    guidance_notes TEXT, -- "Automated actuator on the left post. Wide threshold with zero curb."
    metadata JSONB DEFAULT '{}'::jsonb, -- Future slice extensions (e.g. keycard, security clearance)
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_entrances_building ON building_entrances(building_id);
CREATE INDEX IF NOT EXISTS idx_entrances_geom ON building_entrances USING GIST(door_geom);
CREATE INDEX IF NOT EXISTS idx_entrances_confidence ON building_entrances(current_confidence_score);

-- Entrance Visual Callout Pins (Screen 4: "Door B: 42.0" Clear", "Low-push button at 34"")
CREATE TABLE IF NOT EXISTS entrance_dimension_pins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entrance_id UUID NOT NULL REFERENCES building_entrances(id) ON DELETE CASCADE,
    label VARCHAR(100) NOT NULL, -- 'Door B: 42.0" Clear'
    description TEXT, -- 'Wide sensor cone triggers 2.4m prior to arrival.'
    pin_x_percent NUMERIC(4, 1) NOT NULL, -- Relative image X coordinate 0-100%
    pin_y_percent NUMERIC(4, 1) NOT NULL, -- Relative image Y coordinate 0-100%
    pin_type VARCHAR(50) DEFAULT 'doorway', -- 'doorway', 'ramp', 'push_pad', 'tactile'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_entrance_pins ON entrance_dimension_pins(entrance_id);

-- ======================================================================================
-- SLICE 5: HAZARDS & PHYSICAL BARRIERS SLICE
-- Real-time obstacle registry, gravel spills, broken curb drops, construction trenches.
-- ======================================================================================
CREATE TABLE IF NOT EXISTS hazards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    city_id VARCHAR(50) REFERENCES cities(id) ON DELETE SET NULL,
    hazard_type hazard_type NOT NULL,
    severity hazard_severity NOT NULL DEFAULT 'medium_friction',
    title VARCHAR(200) NOT NULL, -- 'Temporary sidewalk construction / gravel obstacle'
    description TEXT NOT NULL, -- 'Previous report marked severe gravel hazard (wheels losing grip)'
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    hazard_geom GEOMETRY(Point, 4326),
    
    -- Obstacle Dimensions
    vertical_lip_inches NUMERIC(4, 1),
    slope_gradient_percent NUMERIC(4, 1),
    passage_width_inches NUMERIC(4, 1),
    
    photo_url TEXT,
    location_description VARCHAR(255), -- 'Near Corner of 4th & Grand'
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    
    -- Time-Decay & Verification Parameters (Screen 1 & Readme: Fast decay for temporary barriers)
    base_confidence_score NUMERIC(4, 3) NOT NULL DEFAULT 1.000,
    current_confidence_score NUMERIC(4, 3) NOT NULL DEFAULT 1.000,
    decay_half_life_hours NUMERIC(5, 1) NOT NULL DEFAULT 24.0, -- Barriers decay quickly (24h)
    verification_count INT NOT NULL DEFAULT 1,
    reported_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_verified_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    
    reported_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hazards_city ON hazards(city_id);
CREATE INDEX IF NOT EXISTS idx_hazards_geom ON hazards USING GIST(hazard_geom);
CREATE INDEX IF NOT EXISTS idx_hazards_active ON hazards(is_active) WHERE is_active = TRUE;

-- ======================================================================================
-- SLICE 6: 1-TAP IN-NAVIGATION VERIFICATIONS SLICE (Freshness Engine)
-- Captures 1-second passive confirmations during travel; updates decaying confidence.
-- ======================================================================================
CREATE TABLE IF NOT EXISTS verifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    target_type verification_target_type NOT NULL,
    target_id UUID NOT NULL, -- References building_entrances(id) or hazards(id)
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    user_response verification_response NOT NULL, -- 'clear', 'blocked'
    
    -- Spatial Context at Verification Moment
    device_latitude DOUBLE PRECISION,
    device_longitude DOUBLE PRECISION,
    device_geom GEOMETRY(Point, 4326),
    accuracy_meters NUMERIC(5, 1),
    
    -- Impact on Target Score
    previous_confidence NUMERIC(4, 3),
    updated_confidence NUMERIC(4, 3),
    
    client_session_id VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_verifications_target ON verifications(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_verifications_created ON verifications(created_at DESC);

-- Automated trigger function to recalibrate confidence upon 1-tap verification
CREATE OR REPLACE FUNCTION fn_on_verification_submitted()
RETURNS TRIGGER AS $$
DECLARE
    v_current_conf NUMERIC;
    v_new_conf NUMERIC;
BEGIN
    IF NEW.target_type = 'hazard' THEN
        SELECT current_confidence_score INTO v_current_conf FROM hazards WHERE id = NEW.target_id;
        IF FOUND THEN
            -- If user confirms "clear" / obstacle gone, drop hazard confidence drastically
            IF NEW.user_response IN ('clear', 'smooth') THEN
                v_new_conf := ROUND(GREATEST(0.0, v_current_conf * 0.35)::NUMERIC, 3);
                -- If confidence drops below 0.15, mark hazard resolved
                IF v_new_conf <= 0.15 THEN
                    UPDATE hazards 
                    SET is_active = FALSE, resolved_at = NOW(), current_confidence_score = v_new_conf, last_verified_at = NOW(), verification_count = verification_count + 1 
                    WHERE id = NEW.target_id;
                ELSE
                    UPDATE hazards 
                    SET current_confidence_score = v_new_conf, last_verified_at = NOW(), verification_count = verification_count + 1 
                    WHERE id = NEW.target_id;
                END IF;
            ELSE -- Still blocked
                v_new_conf := ROUND(LEAST(1.0, v_current_conf + 0.30 * (1.0 - v_current_conf))::NUMERIC, 3);
                UPDATE hazards 
                SET current_confidence_score = v_new_conf, last_verified_at = NOW(), verification_count = verification_count + 1 
                WHERE id = NEW.target_id;
            END IF;
            
            NEW.previous_confidence := v_current_conf;
            NEW.updated_confidence := v_new_conf;
        END IF;
        
    ELSIF NEW.target_type = 'entrance' THEN
        SELECT current_confidence_score INTO v_current_conf FROM building_entrances WHERE id = NEW.target_id;
        IF FOUND THEN
            IF NEW.user_response IN ('clear', 'smooth') THEN
                v_new_conf := ROUND(LEAST(1.0, v_current_conf + 0.20 * (1.0 - v_current_conf))::NUMERIC, 3);
            ELSE -- Issue reported
                v_new_conf := ROUND(GREATEST(0.1, v_current_conf * 0.5)::NUMERIC, 3);
            END IF;
            
            UPDATE building_entrances 
            SET current_confidence_score = v_new_conf, last_verified_at = NOW(), verification_count = verification_count + 1 
            WHERE id = NEW.target_id;
            
            NEW.previous_confidence := v_current_conf;
            NEW.updated_confidence := v_new_conf;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_verification_submitted ON verifications;
CREATE TRIGGER trg_verification_submitted
BEFORE INSERT ON verifications
FOR EACH ROW
EXECUTE FUNCTION fn_on_verification_submitted();

-- ======================================================================================
-- SLICE 7: ROUTES & MICRO-SEGMENTS SLICE
-- Multi-criteria routing engine records, slope profiles, surface strips, and sparkline elevations.
-- ======================================================================================
CREATE TABLE IF NOT EXISTS routes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    profile_id UUID REFERENCES accessibility_profiles(id) ON DELETE SET NULL,
    destination_entrance_id UUID REFERENCES building_entrances(id) ON DELETE SET NULL,
    
    origin_name VARCHAR(200) NOT NULL, -- 'Bandra West (Hill Road)'
    origin_latitude DOUBLE PRECISION NOT NULL,
    origin_longitude DOUBLE PRECISION NOT NULL,
    origin_geom GEOMETRY(Point, 4326),
    
    destination_name VARCHAR(200) NOT NULL, -- 'Jio World Centre'
    destination_latitude DOUBLE PRECISION NOT NULL,
    destination_longitude DOUBLE PRECISION NOT NULL,
    destination_geom GEOMETRY(Point, 4326),
    
    -- Transit Metrology Strip (from Screen 2: 18 min, 3.2 km, 2.4% max incline)
    total_duration_seconds INT NOT NULL,
    total_distance_meters NUMERIC(8, 1) NOT NULL,
    max_incline_percent NUMERIC(4, 2) NOT NULL DEFAULT 2.40,
    stress_score NUMERIC(4, 3) NOT NULL DEFAULT 0.120, -- 0.000 to 1.000 friction index
    
    -- Guarantees
    is_step_free_certified BOOLEAN NOT NULL DEFAULT TRUE,
    step_count INT NOT NULL DEFAULT 0,
    curb_cuts_verified INT NOT NULL DEFAULT 4,
    cobblestone_meters NUMERIC(6, 1) NOT NULL DEFAULT 0.0,
    
    route_geometry GEOMETRY(LineString, 4326),
    elevation_sparkline_svg TEXT, -- Pre-rendered sparkline data
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_routes_user ON routes(user_id);
CREATE INDEX IF NOT EXISTS idx_routes_geom ON routes USING GIST(route_geometry);

CREATE TABLE IF NOT EXISTS route_micro_segments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    route_id UUID NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
    segment_index INT NOT NULL,
    instruction_text VARCHAR(255) NOT NULL, -- 'Turn slightly right onto Grand Avenue Accessible Ramp'
    maneuver_icon VARCHAR(50) DEFAULT 'turn_slight_right',
    distance_meters NUMERIC(6, 1) NOT NULL,
    duration_seconds INT NOT NULL,
    
    -- Micro-segment accessibility features
    incline_percent NUMERIC(4, 2) NOT NULL DEFAULT 1.20,
    surface_type surface_type NOT NULL DEFAULT 'smooth_asphalt',
    is_step_free BOOLEAN NOT NULL DEFAULT TRUE,
    has_tactile_paving BOOLEAN NOT NULL DEFAULT FALSE,
    has_audio_signal BOOLEAN NOT NULL DEFAULT FALSE,
    curb_ramp_verified BOOLEAN NOT NULL DEFAULT TRUE,
    
    segment_geom GEOMETRY(LineString, 4326),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_micro_segments_route ON route_micro_segments(route_id, segment_index);

-- ======================================================================================
-- SLICE 8: LIVE NAVIGATION SESSIONS & TELEMETRY SLICE
-- Real-time GPS session tracking, speed telemetry, battery level, and audio prompt history.
-- ======================================================================================
CREATE TABLE IF NOT EXISTS navigation_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    route_id UUID NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'active', -- 'active', 'completed', 'cancelled', 'rerouted'
    
    -- Live Telemetry Snapshot (Screen 1: Speed 3.4 mph, Battery 84%, Remaining 0.4 mi)
    current_speed_mph NUMERIC(4, 1) DEFAULT 3.4,
    battery_percentage INT CHECK (battery_percentage BETWEEN 0 AND 100),
    distance_remaining_meters NUMERIC(8, 1),
    duration_remaining_seconds INT,
    current_slope_percent NUMERIC(4, 2) DEFAULT 1.20,
    
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_nav_sessions_route ON navigation_sessions(route_id);
CREATE INDEX IF NOT EXISTS idx_nav_sessions_status ON navigation_sessions(status);

CREATE TABLE IF NOT EXISTS navigation_breadcrumbs (
    id BIGSERIAL PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES navigation_sessions(id) ON DELETE CASCADE,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    speed_mph NUMERIC(4, 1),
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_breadcrumbs_session ON navigation_breadcrumbs(session_id, recorded_at);

-- ======================================================================================
-- AUTOMATIC TIMESTAMPS TRIGGERS
-- ======================================================================================
DO $$ BEGIN
    CREATE TRIGGER trg_users_timestamp BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
    CREATE TRIGGER trg_profiles_timestamp BEFORE UPDATE ON accessibility_profiles FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
    CREATE TRIGGER trg_buildings_timestamp BEFORE UPDATE ON buildings FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
    CREATE TRIGGER trg_entrances_timestamp BEFORE UPDATE ON building_entrances FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
    CREATE TRIGGER trg_hazards_timestamp BEFORE UPDATE ON hazards FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ======================================================================================
-- SEED DATA (Directly mapped from UI Mockups & Readme Specifications)
-- ======================================================================================

-- 1. Cities Seed (Screen 3 City Switcher: Mumbai, Delhi NCR, Bengaluru, Pune, Hyderabad)
INSERT INTO cities (id, name, country_code, center_latitude, center_longitude)
VALUES 
    ('mumbai', 'Mumbai', 'IND', 19.0657, 72.8687),
    ('delhi', 'Delhi NCR', 'IND', 28.6139, 77.2090),
    ('bengaluru', 'Bengaluru', 'IND', 12.9716, 77.5946),
    ('pune', 'Pune', 'IND', 18.5204, 73.8567),
    ('hyderabad', 'Hyderabad', 'IND', 17.3850, 78.4867),
    ('ahmedabad', 'Ahmedabad', 'IND', 23.0225, 72.5714)
ON CONFLICT (id) DO NOTHING;

-- 2. Buildings Seed (From Screen 1, 2, 4, 8)
INSERT INTO buildings (id, city_id, name, category, formatted_address, street_latitude, street_longitude)
VALUES 
    (
        'b0000000-0000-0000-0000-000000000001',
        'mumbai',
        'Jio World Centre',
        'commercial',
        'G Block BKC, Bandra Kurla Complex, Bandra East, Mumbai, Maharashtra 400051',
        19.0645,
        72.8680
    ),
    (
        'b0000000-0000-0000-0000-000000000002',
        'mumbai',
        'Asian Heart Institute',
        'healthcare',
        'G-Block, Bandra-Kurla Complex, Bandra East, Mumbai, Maharashtra 400051',
        19.0620,
        72.8610
    )
ON CONFLICT (id) DO NOTHING;

-- 3. Entrances Seed: The "Last 50 Feet" (Exact specs from Mockup Screen 4 & 8)
INSERT INTO building_entrances (
    id,
    building_id,
    entrance_name,
    is_primary_accessible,
    latitude,
    longitude,
    door_type,
    clear_width_inches,
    sensor_range_meters,
    push_pad_height_inches,
    step_count,
    threshold_lip_inches,
    has_continuous_ramp,
    ramp_slope_percent,
    has_safety_handrails,
    has_tactile_paving,
    turning_radius_inches,
    primary_photo_url,
    photo_caption,
    base_confidence_score,
    current_confidence_score,
    confidence_decay_half_life_hours,
    verification_count,
    last_verified_at,
    guidance_notes
)
VALUES 
    (
        'e0000000-0000-0000-0000-000000000001',
        'b0000000-0000-0000-0000-000000000001',
        'South Pavilion Gate · Gate 3 North Concourse',
        TRUE,
        19.0648,
        72.8683,
        'automatic_sliding',
        42.0, -- 42.0" Automatic Door
        2.4,  -- Sensor cone 2.4m
        34.0, -- 34" actuator height
        0,    -- 0 Steps
        0.0,  -- 0.0" Flush Lip
        TRUE,
        2.10, -- 2.1% Smooth Ramp
        TRUE,
        TRUE,
        60.0,
        'https://images.unsplash.com/photo-1541888946425-d0fbb186f5f7?auto=format&fit=crop&w=1200&q=80',
        'Step-free ground entrance with wide automatic sliding doors, step-free textured ramp, safety handrails, and tactile paving',
        0.985,
        0.985,
        168.0,
        42,
        NOW() - INTERVAL '12 minutes',
        'Automatic sliding portal with wide sensor cone. Level threshold with zero curb.'
    )
ON CONFLICT (id) DO NOTHING;

-- Dimension callouts for the entrance (Screen 4)
INSERT INTO entrance_dimension_pins (entrance_id, label, description, pin_x_percent, pin_y_percent, pin_type)
VALUES 
    ('e0000000-0000-0000-0000-000000000001', 'Door B: 42.0″ Clear', 'Automatic Sliding Portal with 2.4m forward sensor detection cone.', 86.0, 28.0, 'doorway'),
    ('e0000000-0000-0000-0000-000000000001', 'Flush Lip: 0.0″', 'Zero threshold elevation change between ramp landing and interior floor.', 50.0, 88.0, 'ramp'),
    ('e0000000-0000-0000-0000-000000000001', 'Ramp Grade: 2.1%', 'Continuous ADA certified slope with stainless steel safety handrails.', 35.0, 72.0, 'ramp')
ON CONFLICT DO NOTHING;

-- 4. Active Hazards Seed (Screen 1 & Screen 7)
INSERT INTO hazards (
    id,
    city_id,
    hazard_type,
    severity,
    title,
    description,
    latitude,
    longitude,
    location_description,
    photo_url,
    base_confidence_score,
    current_confidence_score,
    decay_half_life_hours,
    verification_count,
    reported_at,
    last_verified_at
)
VALUES 
    (
        'a0000000-0000-0000-0000-000000000001',
        'mumbai',
        'construction_trench',
        'high_barrier',
        'Temporary Sidewalk Construction & Gravel Spill',
        'Gravel debris spill near lowered curb cut. Wheels losing traction.',
        19.0632,
        72.8645,
        'Near Corner of Avenue 3 & Grand Blvd, BKC G-Block',
        'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=600&q=80',
        0.920,
        0.920,
        24.0,
        8,
        NOW() - INTERVAL '35 minutes',
        NOW() - INTERVAL '35 minutes'
    )
ON CONFLICT (id) DO NOTHING;

-- ======================================================================================
-- END OF DATABASE SCHEMA
-- ======================================================================================
