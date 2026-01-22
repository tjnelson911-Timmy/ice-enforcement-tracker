-- ICE Enforcement Tracker Database Setup
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/avmebzeuryychbwsmaur/sql)

-- Create incidents table
CREATE TABLE IF NOT EXISTS incidents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  incident_date DATE NOT NULL,
  incident_type TEXT NOT NULL,
  description TEXT,
  location_name TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  county TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  num_affected INTEGER,
  news_url TEXT,
  video_url TEXT,
  source_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create incident_demographics table
CREATE TABLE IF NOT EXISTS incident_demographics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  incident_id UUID REFERENCES incidents(id) ON DELETE CASCADE,
  demographic_type TEXT NOT NULL,
  demographic_value TEXT NOT NULL,
  count INTEGER DEFAULT 1
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_incidents_date ON incidents(incident_date DESC);
CREATE INDEX IF NOT EXISTS idx_incidents_state ON incidents(state);
CREATE INDEX IF NOT EXISTS idx_incidents_type ON incidents(incident_type);
CREATE INDEX IF NOT EXISTS idx_demographics_incident ON incident_demographics(incident_id);

-- Enable Row Level Security (but allow all access for now)
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE incident_demographics ENABLE ROW LEVEL SECURITY;

-- Create policies to allow public read access
CREATE POLICY "Allow public read access on incidents" ON incidents
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access on demographics" ON incident_demographics
  FOR SELECT USING (true);

-- Create policies to allow insert/update (you may want to restrict this later)
CREATE POLICY "Allow public insert on incidents" ON incidents
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public insert on demographics" ON incident_demographics
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update on incidents" ON incidents
  FOR UPDATE USING (true);

CREATE POLICY "Allow public update on demographics" ON incident_demographics
  FOR UPDATE USING (true);

-- Insert sample data
INSERT INTO incidents (incident_date, incident_type, description, location_name, address, city, state, county, latitude, longitude, num_affected, news_url, video_url, source_name) VALUES
('2025-01-15', 'Workplace Raid', 'ICE agents conducted a raid at a meatpacking plant, detaining workers during morning shift change.', 'Tyson Foods Plant', '123 Industrial Blvd', 'Lexington', 'NE', 'Dawson', 40.7808, -99.7415, 45, 'https://example.com/news/1', NULL, 'Local News 5'),
('2025-01-12', 'Home Arrest', 'Early morning home arrest in residential neighborhood. Family members reported agents did not present warrant initially.', NULL, '456 Oak Street', 'Phoenix', 'AZ', 'Maricopa', 33.4484, -112.0740, 3, 'https://example.com/news/2', 'https://youtube.com/watch?v=example1', 'Arizona Republic'),
('2025-01-10', 'Traffic Stop', 'Vehicle stopped at checkpoint resulted in detention of driver and two passengers.', 'I-10 Checkpoint', 'Interstate 10 Mile Marker 42', 'Las Cruces', 'NM', 'Dona Ana', 32.3199, -106.7637, 3, 'https://example.com/news/3', NULL, 'El Paso Times'),
('2025-01-08', 'Courthouse Arrest', 'Individual detained after appearing for unrelated civil matter at county courthouse.', 'Harris County Courthouse', '201 Caroline St', 'Houston', 'TX', 'Harris', 29.7604, -95.3698, 1, 'https://example.com/news/4', NULL, 'Houston Chronicle'),
('2025-01-05', 'Workplace Raid', 'Landscaping company raided during business hours. Multiple workers detained.', 'Green Valley Landscaping', '789 Commerce Dr', 'Atlanta', 'GA', 'Fulton', 33.7490, -84.3880, 12, 'https://example.com/news/5', 'https://youtube.com/watch?v=example2', 'Atlanta Journal'),
('2025-01-03', 'Home Arrest', 'Pre-dawn arrest at apartment complex. Witnesses report heavy law enforcement presence.', 'Sunset Apartments', '321 Sunset Blvd', 'Los Angeles', 'CA', 'Los Angeles', 34.0522, -118.2437, 2, 'https://example.com/news/6', NULL, 'LA Times'),
('2024-12-28', 'School Vicinity', 'Parents detained near elementary school during morning drop-off.', 'Lincoln Elementary School', '555 School Lane', 'Chicago', 'IL', 'Cook', 41.8781, -87.6298, 2, 'https://example.com/news/7', NULL, 'Chicago Tribune'),
('2024-12-22', 'Workplace Raid', 'Construction site raid resulted in multiple detentions. Work halted for the day.', 'Metro Construction Site', '999 Development Ave', 'Denver', 'CO', 'Denver', 39.7392, -104.9903, 28, 'https://example.com/news/8', NULL, 'Denver Post'),
('2024-12-18', 'Traffic Stop', 'Routine traffic stop led to detention of vehicle occupants.', NULL, 'Highway 101', 'San Jose', 'CA', 'Santa Clara', 37.3382, -121.8863, 4, 'https://example.com/news/9', NULL, 'Mercury News'),
('2024-12-15', 'Hospital/Clinic', 'Individual detained after seeking medical care at community clinic.', 'Community Health Clinic', '777 Health Way', 'Miami', 'FL', 'Miami-Dade', 25.7617, -80.1918, 1, 'https://example.com/news/10', NULL, 'Miami Herald');

-- Insert sample demographics data
INSERT INTO incident_demographics (incident_id, demographic_type, demographic_value, count)
SELECT id, 'race', 'Hispanic/Latino', 40 FROM incidents WHERE city = 'Lexington'
UNION ALL
SELECT id, 'race', 'Other', 5 FROM incidents WHERE city = 'Lexington'
UNION ALL
SELECT id, 'gender', 'Male', 35 FROM incidents WHERE city = 'Lexington'
UNION ALL
SELECT id, 'gender', 'Female', 10 FROM incidents WHERE city = 'Lexington'
UNION ALL
SELECT id, 'age_group', '18-30', 20 FROM incidents WHERE city = 'Lexington'
UNION ALL
SELECT id, 'age_group', '31-45', 18 FROM incidents WHERE city = 'Lexington'
UNION ALL
SELECT id, 'age_group', '46+', 7 FROM incidents WHERE city = 'Lexington';

SELECT 'Database setup complete!' as status;
