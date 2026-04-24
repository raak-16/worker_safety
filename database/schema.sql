-- Worker Safety Database Setup Script
-- Run this in your Supabase PostgreSQL database

-- Create sensor_readings table
CREATE TABLE IF NOT EXISTS sensor_readings (
    id SERIAL PRIMARY KEY,
    temperature DECIMAL(5,2),
    humidity DECIMAL(5,2),
    gas_analog INTEGER,
    gas_digital BOOLEAN,
    is_alert BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create alerts table
CREATE TABLE IF NOT EXISTS alerts (
    id SERIAL PRIMARY KEY,
    type VARCHAR(50),
    severity VARCHAR(20),
    message TEXT,
    sensor_reading_id INTEGER REFERENCES sensor_readings(id),
    acknowledged BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_readings_created_at ON sensor_readings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_created_at ON alerts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_acknowledged ON alerts(acknowledged) WHERE acknowledged = false;

-- Enable Row Level Security (optional - for additional security)
ALTER TABLE sensor_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow public read access (modify as needed)
CREATE POLICY "Allow public access" ON sensor_readings FOR SELECT USING (true);
CREATE POLICY "Allow public access" ON alerts FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON sensor_readings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert" ON alerts FOR INSERT WITH CHECK (true);

-- Create function to auto-create tables on first connection
CREATE OR REPLACE FUNCTION init_worker_safety()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Tables are created above, this is a placeholder for any initialization
    RAISE NOTICE 'Worker Safety Database initialized successfully';
END;
$$;

-- Run initialization
SELECT init_worker_safety();

-- Query to check setup
SELECT 'sensor_readings' as table_name, count(*) as rows FROM sensor_readings
UNION ALL
SELECT 'alerts', count(*) FROM alerts;