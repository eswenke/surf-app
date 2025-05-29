CREATE TABLE IF NOT EXISTS spots (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  latitude FLOAT NOT NULL,
  longitude FLOAT NOT NULL,
  description TEXT,
  location TEXT,
  difficulty TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- Create index on location for faster lookups
CREATE INDEX IF NOT EXISTS spots_location_idx ON spots(location);

-- Set up Row Level Security (RLS)
ALTER TABLE spots ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view spots
CREATE POLICY "Spots are viewable by everyone" 
    ON spots FOR SELECT 
    USING (true);

-- Policy: Only authenticated users can insert spots
CREATE POLICY "Authenticated users can insert spots" 
    ON spots FOR INSERT 
    WITH CHECK (auth.role() = 'authenticated');

-- Policy: Only authenticated users can update spots
CREATE POLICY "Authenticated users can update spots" 
    ON spots FOR UPDATE 
    USING (auth.role() = 'authenticated');

CREATE TABLE IF NOT EXISTS forecasts (
  id SERIAL PRIMARY KEY,
  spot_id INTEGER REFERENCES spots(id) ON DELETE CASCADE,
  forecast_data JSONB NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on spot_id and timestamp for faster lookups
CREATE INDEX IF NOT EXISTS forecasts_spot_timestamp_idx ON forecasts(spot_id, timestamp);

-- Set up Row Level Security (RLS)
ALTER TABLE forecasts ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view forecasts
CREATE POLICY "Forecasts are viewable by everyone" 
    ON forecasts FOR SELECT 
    USING (true);

-- Policy: Only authenticated users can insert forecasts
CREATE POLICY "Authenticated users can insert forecasts" 
    ON forecasts FOR INSERT 
    WITH CHECK (auth.role() = 'authenticated');

-- Comment on tables
COMMENT ON TABLE spots IS 'Stores surf spot information including location and description';
COMMENT ON TABLE forecasts IS 'Stores surf forecasts for spots';