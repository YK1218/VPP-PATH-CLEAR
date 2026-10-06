-- Supabase Schema for PathClear

-- Enable PostGIS extension for spatial data
CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE,
    name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. accessibility_profiles
CREATE TABLE accessibility_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    mobility_constraints JSONB DEFAULT '{}', -- e.g. {"wheelchair": true, "max_slope": 5, "step_free": true}
    vision_constraints JSONB DEFAULT '{}',
    hearing_constraints JSONB DEFAULT '{}',
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. hazards
CREATE TABLE hazards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type TEXT NOT NULL,
    geometry geometry(Point, 4326) NOT NULL, -- Point location
    severity TEXT,
    confidence FLOAT DEFAULT 0.5,
    source TEXT,
    status TEXT DEFAULT 'active',
    reported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    verified_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE
);

-- 4. entrances
CREATE TABLE entrances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    building_id TEXT, -- Refers to OSM building id or internal ID
    geometry geometry(Point, 4326) NOT NULL,
    step_free BOOLEAN,
    ramp BOOLEAN,
    ramp_slope FLOAT,
    door_type TEXT,
    door_width FLOAT,
    tactile BOOLEAN,
    photo_url TEXT,
    confidence FLOAT DEFAULT 0.5
);

-- 5. stations
CREATE TABLE stations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    external_id TEXT,
    name TEXT NOT NULL,
    geometry geometry(Point, 4326) NOT NULL,
    operator TEXT,
    accessibility_status TEXT,
    confidence FLOAT DEFAULT 0.5
);

-- 6. navigation_sessions
CREATE TABLE navigation_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    origin geometry(Point, 4326),
    destination geometry(Point, 4326),
    route_id TEXT,
    status TEXT DEFAULT 'started',
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);
