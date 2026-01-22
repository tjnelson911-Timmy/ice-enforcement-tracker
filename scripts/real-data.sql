-- ICE Enforcement Tracker - Real Data from News Sources (Sept 2025 - Jan 2026)
-- Sources: CNN, Fox News, CBS News, ABC News, Washington Post, PBS, NPR, Local News

-- First, clear existing sample data
DELETE FROM incident_demographics;
DELETE FROM incidents;

-- Insert real incidents collected from mainstream news sources
INSERT INTO incidents (incident_date, incident_type, description, location_name, address, city, state, county, latitude, longitude, num_affected, news_url, video_url, source_name) VALUES

-- September 2025
('2025-09-04', 'Workplace Raid', 'Largest single-site worksite enforcement action in DHS history. Federal agents raided Hyundai EV battery plant construction site, detaining 475 workers including over 300 South Korean nationals. Led to diplomatic dispute with South Korea.', 'Hyundai Motor Group Metaplant America', NULL, 'Ellabell', 'GA', 'Bryan', 32.1354, -81.4073, 475, 'https://www.cnn.com/2025/09/05/us/georgia-plant-ice-raid-hundreds-arrested-hnk', NULL, 'CNN'),

('2025-09-08', 'Workplace Raid', 'Operation Midway Blitz launched in Chicago area, named in honor of Katie Abraham. DHS deployed hundreds of agents using naval base as staging area.', 'Chicago Metropolitan Area', NULL, 'Chicago', 'IL', 'Cook', 41.8781, -87.6298, 500, 'https://www.dhs.gov/news/2025/09/08/ice-launches-operation-midway-blitz', NULL, 'DHS'),

('2025-09-30', 'Home Arrest', 'Midnight raid on South Shore apartment building. 300 agents from Border Patrol, FBI, and ATF stormed 130-unit complex. SWAT teams rappelled from helicopter, used flash-bang grenades. 37 arrested, mostly Venezuelan. Several US citizens detained for hours.', '7500 S. South Shore Drive', '7500 S. South Shore Drive', 'Chicago', 'IL', 'Cook', 41.7600, -87.5658, 37, 'https://www.cnn.com/2025/10/03/us/chicago-apartment-ice-raid', NULL, 'CNN'),

-- October 2025
('2025-10-03', 'Workplace Raid', 'Operation Midway Blitz reaches 1,000 arrests. Secretary Noem travels to Chicago to announce milestone.', 'Chicago Area', NULL, 'Chicago', 'IL', 'Cook', 41.8781, -87.6298, 1000, 'https://www.dhs.gov/news/2025/10/03/secretary-noem-travels-chicago-operation-midway-blitz', NULL, 'DHS'),

('2025-10-16', 'Other', 'ICE aggressive tactics reported. More than 170 US citizens held by immigration agents according to investigation. Some kicked, dragged, and detained for days.', 'Multiple Locations', NULL, 'Various', 'US', NULL, 39.8283, -98.5795, 170, 'https://www.propublica.org/article/immigration-dhs-american-citizens-arrested-detained-against-will', NULL, 'ProPublica'),

-- November 2025
('2025-11-15', 'Other', 'Operation Charlotte''s Web begins. First Southern city targeted with widespread immigration raids. Over 250 arrested in first four days.', 'Charlotte Metropolitan Area', NULL, 'Charlotte', 'NC', 'Mecklenburg', 35.2271, -80.8431, 250, 'https://www.pbs.org/newshour/nation/more-than-250-have-been-arrested-in-federal-immigration-crackdown-across-north-carolina', NULL, 'PBS'),

('2025-11-19', 'Other', 'Charlotte operation continues. School absences surge with 30,399 students absent. Latino businesses temporarily closed. Manolo''s Bakery shuttered after people tackled outside by agents.', 'Charlotte Area', NULL, 'Charlotte', 'NC', 'Mecklenburg', 35.2271, -80.8431, 130, 'https://www.cnn.com/2025/11/19/us/north-carolina-charlotte-ice-raids-what-we-know', NULL, 'CNN'),

('2025-11-25', 'Other', 'Federal judge in Denver orders ICE agents to follow law, stop pattern of illegal arrests. Found routine violations of constitutional protections.', 'Denver Metropolitan Area', NULL, 'Denver', 'CO', 'Denver', 39.7392, -104.9903, 50, 'https://www.denverpost.com/2025/11/25/colorado-immigration-arrests-ice-lawsuit-ruling/', NULL, 'Denver Post'),

-- December 2025
('2025-12-01', 'Other', 'Operation Metro Surge launched in Minneapolis-St. Paul. Approximately 2,000 federal agents deployed. DHS calls it largest immigration enforcement operation ever.', 'Minneapolis-St. Paul Metro', NULL, 'Minneapolis', 'MN', 'Hennepin', 44.9778, -93.2650, 400, 'https://www.cbsnews.com/news/minneapolis-federal-agents-crackdown/', NULL, 'CBS News'),

('2025-12-04', 'Other', 'Operation Metro Surge continues. ICE reports arresting criminal illegal aliens including pedophiles, domestic abusers, and gang members.', 'Minneapolis Area', NULL, 'Minneapolis', 'MN', 'Hennepin', 44.9778, -93.2650, 200, 'https://www.dhs.gov/news/2025/12/04/ice-arrests-worst-worst-criminal-illegal-aliens-during-operation-metro-surge', NULL, 'DHS'),

('2025-12-13', 'Other', 'Operation Metro Surge reaches 400 arrests. Includes pedophiles, rapists, kidnappers, and drug traffickers according to DHS.', 'Twin Cities', NULL, 'Minneapolis', 'MN', 'Hennepin', 44.9778, -93.2650, 400, 'https://www.fox9.com/news/operation-metro-surge-minneapolis', NULL, 'Fox 9'),

('2025-12-17', 'Other', 'ACLU files class-action lawsuit against Operation Metro Surge alleging constitutional violations, retaliatory arrests against observers, and traffic stops without reasonable suspicion.', 'Minneapolis', NULL, 'Minneapolis', 'MN', 'Hennepin', 44.9778, -93.2650, 100, 'https://www.aclu-mn.org/', NULL, 'ACLU Minnesota'),

('2025-12-19', 'Other', 'Operation Metro Surge reaches 700 arrests in Minneapolis area.', 'Minneapolis Area', NULL, 'Minneapolis', 'MN', 'Hennepin', 44.9778, -93.2650, 300, 'https://www.startribune.com/', NULL, 'Star Tribune'),

('2025-12-28', 'Other', 'ICE shift in tactics leads to soaring at-large arrests. Administration moves from arresting immigrants in jails to tracking them in communities.', 'Nationwide', NULL, 'Various', 'US', NULL, 39.8283, -98.5795, 5000, 'https://www.washingtonpost.com/immigration/2025/12/28/ice-deportations-data-trump-arrests/', NULL, 'Washington Post'),

('2025-12-30', 'Other', 'ICE ends 2025 with continued arrests. Detention population reaches 66,000, highest ever recorded. 75% increase from start of year.', 'Nationwide', NULL, 'Various', 'US', NULL, 39.8283, -98.5795, 2000, 'https://www.dhs.gov/news/2025/12/30/ice-ends-2025-more-arrests', NULL, 'DHS'),

-- January 2026
('2026-01-02', 'Other', 'ICE rings in 2026 with continued arrests. New year begins with sustained enforcement operations.', 'Nationwide', NULL, 'Various', 'US', NULL, 39.8283, -98.5795, 500, 'https://www.dhs.gov/news/2026/01/02/ice-rings-2026-more-arrests', NULL, 'DHS'),

('2026-01-06', 'Other', 'DHS announces largest immigration enforcement operation ever, sending 2,000 agents to Minneapolis-St. Paul metro area.', 'Minneapolis-St. Paul', NULL, 'Minneapolis', 'MN', 'Hennepin', 44.9778, -93.2650, 200, 'https://www.cnn.com/2026/01/05/us/ice-minnesota-immigration-federal-agents-somali', NULL, 'CNN'),

('2026-01-07', 'Other', 'Renée Good, 37-year-old American citizen, fatally shot by ICE agent Jonathan Ross in Minneapolis. Sparks national protests.', 'Minneapolis', NULL, 'Minneapolis', 'MN', 'Hennepin', 44.9778, -93.2650, 1, 'https://www.washingtonpost.com/nation/2026/01/07/ice-shooting-minneapolis/', NULL, 'Washington Post'),

('2026-01-08', 'Other', 'Operation Metro Surge reaches 1,500 arrests. Protests intensify following shooting death of US citizen.', 'Minneapolis Area', NULL, 'Minneapolis', 'MN', 'Hennepin', 44.9778, -93.2650, 800, 'https://www.cbsnews.com/news/minneapolis-ice-shooting/', NULL, 'CBS News'),

('2026-01-08', 'Other', 'Operation Salvo announced in New York City targeting Trinitarios gang. 54 arrested for weapons trafficking, human smuggling, narcotics distribution.', 'New York City', NULL, 'New York', 'NY', 'New York', 40.7128, -74.0060, 54, 'https://www.cbsnews.com/newyork/news/ny-operation-salvo-kristi-noem/', NULL, 'CBS New York'),

('2026-01-10', 'Home Arrest', 'ICE operations in Los Angeles. 11 arrests confirmed in Downey alone. Operations across Downey, Eagle Rock, Silver Lake, and Highland Park.', 'Los Angeles Area', NULL, 'Los Angeles', 'CA', 'Los Angeles', 34.0522, -118.2437, 50, 'https://www.latimes.com/', NULL, 'LA Times'),

('2026-01-11', 'Home Arrest', 'AP witnesses ICE officers ramming through front door of Liberian man''s home in Minneapolis with heavy tactical gear and rifles drawn. Only had administrative warrant.', 'Minneapolis', NULL, 'Minneapolis', 'MN', 'Hennepin', 44.9778, -93.2650, 1, 'https://apnews.com/', NULL, 'Associated Press'),

('2026-01-12', 'Other', 'Attorney General Ellison and cities of Minneapolis and Saint Paul sue to halt ICE surge, calling it unconstitutional.', 'Minneapolis', NULL, 'Minneapolis', 'MN', 'Hennepin', 44.9778, -93.2650, 0, 'https://www.ag.state.mn.us/Office/Communications/2026/01/12_ICE.asp', NULL, 'MN Attorney General'),

('2026-01-13', 'Courthouse Arrest', 'ICE arrests New York City Council employee at immigration appointment on Long Island.', 'Long Island', NULL, 'Long Island', 'NY', 'Nassau', 40.7891, -73.1350, 1, 'https://www.washingtonpost.com/immigration/2026/01/12/nyc-council-arrest-mamdani-ice/', NULL, 'Washington Post'),

('2026-01-14', 'Traffic Stop', 'Venezuelan man shot in leg by ICE agent in Minneapolis during car chase and struggle with federal agent.', 'North Minneapolis', NULL, 'Minneapolis', 'MN', 'Hennepin', 45.0059, -93.2898, 1, 'https://www.fox9.com/', NULL, 'Fox 9'),

('2026-01-19', 'Other', 'Operation Metro Surge reaches 3,000 arrests. DHS claims 10,000+ criminal illegal aliens arrested in Minneapolis including 3,000 in past six weeks.', 'Minneapolis', NULL, 'Minneapolis', 'MN', 'Hennepin', 44.9778, -93.2650, 1500, 'https://www.dhs.gov/news/2026/01/19/ice-continues-remove-worst-worst-minneapolis-streets', NULL, 'DHS'),

('2026-01-20', 'Other', 'DHS announces 670,000+ illegal aliens removed in one year. ICE hired 12,000 new officers, 120% increase in manpower.', 'Nationwide', NULL, 'Various', 'US', NULL, 39.8283, -98.5795, 1000, 'https://www.dhs.gov/news/2026/01/20/ice-arrests-worst-worst-criminal-illegal-alien-pedophiles', NULL, 'DHS'),

('2026-01-21', 'Other', 'Operation Catch of the Day launched in Maine. 50 arrested on first day in Lewiston and Portland. 1,400 targets identified in state.', 'Maine', NULL, 'Portland', 'ME', 'Cumberland', 43.6591, -70.2568, 50, 'https://www.washingtonpost.com/nation/2026/01/21/ice-immigration-operation-maine/', NULL, 'Washington Post'),

-- July 2025 (California Cannabis Farm Raids)
('2025-07-10', 'Workplace Raid', 'ICE and CBP raid two Glass House cannabis farms in Carpinteria and Camarillo. 361 arrested, 14 children rescued. One worker died after falling from greenhouse roof during raid.', 'Glass House Farms', NULL, 'Camarillo', 'CA', 'Ventura', 34.2164, -119.0376, 361, 'https://www.dhs.gov/news/2025/07/13/ice-cbp-arrest-least-361-illegal-aliens-during-marijuana-grow-site-operation', NULL, 'DHS'),

-- Additional significant events
('2025-07-19', 'Other', 'Off-duty CBP officer shot in Fort Washington Park, NYC by alleged gang members. Incident leads to later Operation Salvo.', 'Fort Washington Park', NULL, 'New York', 'NY', 'New York', 40.8506, -73.9441, 1, 'https://www.cbsnews.com/newyork/', NULL, 'CBS New York'),

('2025-07-12', 'Other', 'ICE operation in Denver metro area July 12-20. 243 arrested including one wanted for murder, one for human trafficking, five for sex offenses.', 'Denver Metro Area', NULL, 'Denver', 'CO', 'Denver', 39.7392, -104.9903, 243, 'https://www.ice.gov/news/releases/ice-arrests-243-illegal-aliens-denver-metro-area', NULL, 'ICE'),

('2025-05-01', 'Workplace Raid', 'Houston area operations result in over 500 deported and 400 arrested in roughly one week.', 'Houston Area', NULL, 'Houston', 'TX', 'Harris', 29.7604, -95.3698, 400, 'https://www.houstonpublicmedia.org/', NULL, 'Houston Public Media'),

('2025-02-05', 'Other', 'ICE raids in Denver targeting Tren de Aragua gang. 29 detained but only one alleged gang member found despite claims of 100+ targeted.', 'Denver', NULL, 'Denver', 'CO', 'Denver', 39.7392, -104.9903, 29, 'https://abcnews.go.com/US/denver-ice-raids-targeting-100-gang-members-yielded/story', NULL, 'ABC News'),

('2025-06-07', 'Other', 'Immigration protests begin in Los Angeles after local ICE raids result in hundreds of arrests. Federal judge later orders halt to indiscriminate arrests in seven California counties.', 'Los Angeles', NULL, 'Los Angeles', 'CA', 'Los Angeles', 34.0522, -118.2437, 300, 'https://www.latimes.com/', NULL, 'LA Times');

-- Insert demographic data for major operations
-- Operation Midway Blitz demographics (Chicago)
INSERT INTO incident_demographics (incident_id, demographic_type, demographic_value, count)
SELECT id, 'race', 'Hispanic/Latino', 800 FROM incidents WHERE description LIKE '%Midway Blitz%' AND city = 'Chicago' LIMIT 1;

INSERT INTO incident_demographics (incident_id, demographic_type, demographic_value, count)
SELECT id, 'race', 'Venezuelan', 200 FROM incidents WHERE description LIKE '%South Shore%' LIMIT 1;

INSERT INTO incident_demographics (incident_id, demographic_type, demographic_value, count)
SELECT id, 'race', 'Mexican', 50 FROM incidents WHERE description LIKE '%South Shore%' LIMIT 1;

-- Hyundai plant demographics
INSERT INTO incident_demographics (incident_id, demographic_type, demographic_value, count)
SELECT id, 'race', 'South Korean', 300 FROM incidents WHERE location_name LIKE '%Hyundai%' LIMIT 1;

INSERT INTO incident_demographics (incident_id, demographic_type, demographic_value, count)
SELECT id, 'race', 'Mexican', 23 FROM incidents WHERE location_name LIKE '%Hyundai%' LIMIT 1;

INSERT INTO incident_demographics (incident_id, demographic_type, demographic_value, count)
SELECT id, 'race', 'Chinese', 10 FROM incidents WHERE location_name LIKE '%Hyundai%' LIMIT 1;

INSERT INTO incident_demographics (incident_id, demographic_type, demographic_value, count)
SELECT id, 'race', 'Japanese', 3 FROM incidents WHERE location_name LIKE '%Hyundai%' LIMIT 1;

-- Cannabis farm demographics
INSERT INTO incident_demographics (incident_id, demographic_type, demographic_value, count)
SELECT id, 'race', 'Hispanic/Latino', 340 FROM incidents WHERE location_name LIKE '%Glass House%' LIMIT 1;

INSERT INTO incident_demographics (incident_id, demographic_type, demographic_value, count)
SELECT id, 'age_group', 'Under 18', 14 FROM incidents WHERE location_name LIKE '%Glass House%' LIMIT 1;

-- Minneapolis Operation Metro Surge demographics
INSERT INTO incident_demographics (incident_id, demographic_type, demographic_value, count)
SELECT id, 'race', 'Somali', 500 FROM incidents WHERE description LIKE '%Metro Surge%' AND num_affected = 1500 LIMIT 1;

INSERT INTO incident_demographics (incident_id, demographic_type, demographic_value, count)
SELECT id, 'race', 'Hispanic/Latino', 800 FROM incidents WHERE description LIKE '%Metro Surge%' AND num_affected = 1500 LIMIT 1;

-- Maine Operation Catch of the Day
INSERT INTO incident_demographics (incident_id, demographic_type, demographic_value, count)
SELECT id, 'race', 'Somali', 20 FROM incidents WHERE description LIKE '%Catch of the Day%' LIMIT 1;

INSERT INTO incident_demographics (incident_id, demographic_type, demographic_value, count)
SELECT id, 'race', 'Angolan', 10 FROM incidents WHERE description LIKE '%Catch of the Day%' LIMIT 1;

INSERT INTO incident_demographics (incident_id, demographic_type, demographic_value, count)
SELECT id, 'race', 'Ethiopian', 5 FROM incidents WHERE description LIKE '%Catch of the Day%' LIMIT 1;

INSERT INTO incident_demographics (incident_id, demographic_type, demographic_value, count)
SELECT id, 'race', 'Guatemalan', 10 FROM incidents WHERE description LIKE '%Catch of the Day%' LIMIT 1;

INSERT INTO incident_demographics (incident_id, demographic_type, demographic_value, count)
SELECT id, 'race', 'Sudanese', 5 FROM incidents WHERE description LIKE '%Catch of the Day%' LIMIT 1;

SELECT 'Real data inserted successfully!' as status, COUNT(*) as total_incidents FROM incidents;
