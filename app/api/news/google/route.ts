import { NextResponse } from 'next/server';
import { createAdminClient } from '../../../lib/supabase/admin';

// Google News RSS search queries
const SEARCH_QUERIES = [
  'ICE raid',
  'ICE arrests',
  'ICE detention',
  'immigration raid',
  'immigration enforcement arrest',
  'deportation raid',
  'ICE operation',
  'border patrol arrest',
  'CBP arrest',
  'immigration crackdown',
  'ICE agents arrest',
  'workplace immigration raid',
  'undocumented workers arrested',
  'immigration sweep',
];

interface RSSItem {
  title: string;
  link: string;
  pubDate: string;
  source: string;
  description: string;
}

interface ParsedIncident {
  incident_date: string;
  incident_type: string;
  description: string;
  location_name: string | null;
  city: string | null;
  state: string | null;
  county: string | null;
  latitude: number | null;
  longitude: number | null;
  num_affected: number | null;
  news_url: string;
  source_name: string;
}

const STATE_CODES: Record<string, string> = {
  'alabama': 'AL', 'alaska': 'AK', 'arizona': 'AZ', 'arkansas': 'AR', 'california': 'CA',
  'colorado': 'CO', 'connecticut': 'CT', 'delaware': 'DE', 'florida': 'FL', 'georgia': 'GA',
  'hawaii': 'HI', 'idaho': 'ID', 'illinois': 'IL', 'indiana': 'IN', 'iowa': 'IA',
  'kansas': 'KS', 'kentucky': 'KY', 'louisiana': 'LA', 'maine': 'ME', 'maryland': 'MD',
  'massachusetts': 'MA', 'michigan': 'MI', 'minnesota': 'MN', 'mississippi': 'MS', 'missouri': 'MO',
  'montana': 'MT', 'nebraska': 'NE', 'nevada': 'NV', 'new hampshire': 'NH', 'new jersey': 'NJ',
  'new mexico': 'NM', 'new york': 'NY', 'north carolina': 'NC', 'north dakota': 'ND', 'ohio': 'OH',
  'oklahoma': 'OK', 'oregon': 'OR', 'pennsylvania': 'PA', 'rhode island': 'RI', 'south carolina': 'SC',
  'south dakota': 'SD', 'tennessee': 'TN', 'texas': 'TX', 'utah': 'UT', 'vermont': 'VT',
  'virginia': 'VA', 'washington': 'WA', 'west virginia': 'WV', 'wisconsin': 'WI', 'wyoming': 'WY',
  'district of columbia': 'DC',
};

const CITY_COORDS: Record<string, { lat: number; lng: number; state: string }> = {
  'new york': { lat: 40.7128, lng: -74.0060, state: 'NY' },
  'los angeles': { lat: 34.0522, lng: -118.2437, state: 'CA' },
  'chicago': { lat: 41.8781, lng: -87.6298, state: 'IL' },
  'houston': { lat: 29.7604, lng: -95.3698, state: 'TX' },
  'phoenix': { lat: 33.4484, lng: -112.0740, state: 'AZ' },
  'philadelphia': { lat: 39.9526, lng: -75.1652, state: 'PA' },
  'san antonio': { lat: 29.4241, lng: -98.4936, state: 'TX' },
  'san diego': { lat: 32.7157, lng: -117.1611, state: 'CA' },
  'dallas': { lat: 32.7767, lng: -96.7970, state: 'TX' },
  'san jose': { lat: 37.3382, lng: -121.8863, state: 'CA' },
  'austin': { lat: 30.2672, lng: -97.7431, state: 'TX' },
  'jacksonville': { lat: 30.3322, lng: -81.6557, state: 'FL' },
  'fort worth': { lat: 32.7555, lng: -97.3308, state: 'TX' },
  'columbus': { lat: 39.9612, lng: -82.9988, state: 'OH' },
  'charlotte': { lat: 35.2271, lng: -80.8431, state: 'NC' },
  'san francisco': { lat: 37.7749, lng: -122.4194, state: 'CA' },
  'indianapolis': { lat: 39.7684, lng: -86.1581, state: 'IN' },
  'seattle': { lat: 47.6062, lng: -122.3321, state: 'WA' },
  'denver': { lat: 39.7392, lng: -104.9903, state: 'CO' },
  'boston': { lat: 42.3601, lng: -71.0589, state: 'MA' },
  'el paso': { lat: 31.7619, lng: -106.4850, state: 'TX' },
  'nashville': { lat: 36.1627, lng: -86.7816, state: 'TN' },
  'detroit': { lat: 42.3314, lng: -83.0458, state: 'MI' },
  'portland': { lat: 45.5152, lng: -122.6784, state: 'OR' },
  'memphis': { lat: 35.1495, lng: -90.0490, state: 'TN' },
  'oklahoma city': { lat: 35.4676, lng: -97.5164, state: 'OK' },
  'las vegas': { lat: 36.1699, lng: -115.1398, state: 'NV' },
  'louisville': { lat: 38.2527, lng: -85.7585, state: 'KY' },
  'baltimore': { lat: 39.2904, lng: -76.6122, state: 'MD' },
  'milwaukee': { lat: 43.0389, lng: -87.9065, state: 'WI' },
  'albuquerque': { lat: 35.0844, lng: -106.6504, state: 'NM' },
  'tucson': { lat: 32.2226, lng: -110.9747, state: 'AZ' },
  'fresno': { lat: 36.7378, lng: -119.7871, state: 'CA' },
  'sacramento': { lat: 38.5816, lng: -121.4944, state: 'CA' },
  'atlanta': { lat: 33.7490, lng: -84.3880, state: 'GA' },
  'miami': { lat: 25.7617, lng: -80.1918, state: 'FL' },
  'minneapolis': { lat: 44.9778, lng: -93.2650, state: 'MN' },
  'cleveland': { lat: 41.4993, lng: -81.6944, state: 'OH' },
  'tampa': { lat: 27.9506, lng: -82.4572, state: 'FL' },
  'st. louis': { lat: 38.6270, lng: -90.1994, state: 'MO' },
  'pittsburgh': { lat: 40.4406, lng: -79.9959, state: 'PA' },
  'cincinnati': { lat: 39.1031, lng: -84.5120, state: 'OH' },
  'raleigh': { lat: 35.7796, lng: -78.6382, state: 'NC' },
  'newark': { lat: 40.7357, lng: -74.1724, state: 'NJ' },
  'aurora': { lat: 39.7294, lng: -104.8319, state: 'CO' },
  'orlando': { lat: 28.5383, lng: -81.3792, state: 'FL' },
  'new orleans': { lat: 29.9511, lng: -90.0715, state: 'LA' },
  'bakersfield': { lat: 35.3733, lng: -119.0187, state: 'CA' },
  'riverside': { lat: 33.9533, lng: -117.3962, state: 'CA' },
  'stockton': { lat: 37.9577, lng: -121.2908, state: 'CA' },
  'corpus christi': { lat: 27.8006, lng: -97.3964, state: 'TX' },
  'irvine': { lat: 33.6846, lng: -117.8265, state: 'CA' },
  'anaheim': { lat: 33.8366, lng: -117.9143, state: 'CA' },
  'santa ana': { lat: 33.7455, lng: -117.8677, state: 'CA' },
  'henderson': { lat: 36.0395, lng: -114.9817, state: 'NV' },
  'greensboro': { lat: 36.0726, lng: -79.7920, state: 'NC' },
  'plano': { lat: 33.0198, lng: -96.6989, state: 'TX' },
  'lincoln': { lat: 40.8258, lng: -96.6852, state: 'NE' },
  'buffalo': { lat: 42.8864, lng: -78.8784, state: 'NY' },
  'jersey city': { lat: 40.7178, lng: -74.0431, state: 'NJ' },
  'chandler': { lat: 33.3062, lng: -111.8413, state: 'AZ' },
  'st. paul': { lat: 44.9537, lng: -93.0900, state: 'MN' },
  'norfolk': { lat: 36.8508, lng: -76.2859, state: 'VA' },
  'laredo': { lat: 27.5306, lng: -99.4803, state: 'TX' },
  'madison': { lat: 43.0731, lng: -89.4012, state: 'WI' },
  'durham': { lat: 35.9940, lng: -78.8986, state: 'NC' },
  'lubbock': { lat: 33.5779, lng: -101.8552, state: 'TX' },
  'garland': { lat: 32.9126, lng: -96.6389, state: 'TX' },
  'glendale': { lat: 33.5387, lng: -112.1860, state: 'AZ' },
  'hialeah': { lat: 25.8576, lng: -80.2781, state: 'FL' },
  'reno': { lat: 39.5296, lng: -119.8138, state: 'NV' },
  'chesapeake': { lat: 36.7682, lng: -76.2875, state: 'VA' },
  'gilbert': { lat: 33.3528, lng: -111.7890, state: 'AZ' },
  'baton rouge': { lat: 30.4515, lng: -91.1871, state: 'LA' },
  'irving': { lat: 32.8140, lng: -96.9489, state: 'TX' },
  'scottsdale': { lat: 33.4942, lng: -111.9261, state: 'AZ' },
  'north las vegas': { lat: 36.1989, lng: -115.1175, state: 'NV' },
  'fremont': { lat: 37.5485, lng: -121.9886, state: 'CA' },
  'boise': { lat: 43.6150, lng: -116.2023, state: 'ID' },
  'richmond': { lat: 37.5407, lng: -77.4360, state: 'VA' },
  'san bernardino': { lat: 34.1083, lng: -117.2898, state: 'CA' },
  'birmingham': { lat: 33.5207, lng: -86.8025, state: 'AL' },
  'spokane': { lat: 47.6588, lng: -117.4260, state: 'WA' },
  'rochester': { lat: 43.1566, lng: -77.6088, state: 'NY' },
  'des moines': { lat: 41.5868, lng: -93.6250, state: 'IA' },
  'modesto': { lat: 37.6391, lng: -120.9969, state: 'CA' },
  'fayetteville': { lat: 36.0626, lng: -94.1574, state: 'AR' },
  'tacoma': { lat: 47.2529, lng: -122.4443, state: 'WA' },
  'oxnard': { lat: 34.1975, lng: -119.1771, state: 'CA' },
  'fontana': { lat: 34.0922, lng: -117.4350, state: 'CA' },
  'columbus ga': { lat: 32.4610, lng: -84.9877, state: 'GA' },
  'montgomery': { lat: 32.3668, lng: -86.3000, state: 'AL' },
  'moreno valley': { lat: 33.9425, lng: -117.2297, state: 'CA' },
  'shreveport': { lat: 32.5252, lng: -93.7502, state: 'LA' },
  'aurora il': { lat: 41.7606, lng: -88.3201, state: 'IL' },
  'yonkers': { lat: 40.9312, lng: -73.8987, state: 'NY' },
  'akron': { lat: 41.0814, lng: -81.5190, state: 'OH' },
  'huntington beach': { lat: 33.6595, lng: -117.9988, state: 'CA' },
  'little rock': { lat: 34.7465, lng: -92.2896, state: 'AR' },
  'augusta': { lat: 33.4735, lng: -82.0105, state: 'GA' },
  'amarillo': { lat: 35.2220, lng: -101.8313, state: 'TX' },
  'glendale ca': { lat: 34.1425, lng: -118.2551, state: 'CA' },
  'mobile': { lat: 30.6954, lng: -88.0399, state: 'AL' },
  'grand rapids': { lat: 42.9634, lng: -85.6681, state: 'MI' },
  'salt lake city': { lat: 40.7608, lng: -111.8910, state: 'UT' },
  'tallahassee': { lat: 30.4383, lng: -84.2807, state: 'FL' },
  'huntsville': { lat: 34.7304, lng: -86.5861, state: 'AL' },
  'grand prairie': { lat: 32.7460, lng: -96.9978, state: 'TX' },
  'knoxville': { lat: 35.9606, lng: -83.9207, state: 'TN' },
  'worcester': { lat: 42.2626, lng: -71.8023, state: 'MA' },
  'newport news': { lat: 37.0871, lng: -76.4730, state: 'VA' },
  'brownsville': { lat: 25.9017, lng: -97.4975, state: 'TX' },
  'overland park': { lat: 38.9822, lng: -94.6708, state: 'KS' },
  'santa clarita': { lat: 34.3917, lng: -118.5426, state: 'CA' },
  'providence': { lat: 41.8240, lng: -71.4128, state: 'RI' },
  'garden grove': { lat: 33.7739, lng: -117.9414, state: 'CA' },
  'chattanooga': { lat: 35.0456, lng: -85.3097, state: 'TN' },
  'oceanside': { lat: 33.1959, lng: -117.3795, state: 'CA' },
  'jackson': { lat: 32.2988, lng: -90.1848, state: 'MS' },
  'fort lauderdale': { lat: 26.1224, lng: -80.1373, state: 'FL' },
  'santa rosa': { lat: 38.4405, lng: -122.7144, state: 'CA' },
  'rancho cucamonga': { lat: 34.1064, lng: -117.5931, state: 'CA' },
  'port st. lucie': { lat: 27.2730, lng: -80.3582, state: 'FL' },
  'tempe': { lat: 33.4255, lng: -111.9400, state: 'AZ' },
  'ontario ca': { lat: 34.0633, lng: -117.6509, state: 'CA' },
  'vancouver': { lat: 45.6387, lng: -122.6615, state: 'WA' },
  'cape coral': { lat: 26.5629, lng: -81.9495, state: 'FL' },
  'sioux falls': { lat: 43.5446, lng: -96.7311, state: 'SD' },
  'springfield mo': { lat: 37.2090, lng: -93.2923, state: 'MO' },
  'peoria': { lat: 33.5806, lng: -112.2374, state: 'AZ' },
  'pembroke pines': { lat: 26.0128, lng: -80.2239, state: 'FL' },
  'elk grove': { lat: 38.4088, lng: -121.3716, state: 'CA' },
  'salem': { lat: 44.9429, lng: -123.0351, state: 'OR' },
  'lancaster ca': { lat: 34.6868, lng: -118.1542, state: 'CA' },
  'corona': { lat: 33.8753, lng: -117.5664, state: 'CA' },
  'eugene': { lat: 44.0521, lng: -123.0868, state: 'OR' },
  'palmdale': { lat: 34.5794, lng: -118.1165, state: 'CA' },
  'salinas': { lat: 36.6777, lng: -121.6555, state: 'CA' },
  'springfield ma': { lat: 42.1015, lng: -72.5898, state: 'MA' },
  'pasadena tx': { lat: 29.6911, lng: -95.2091, state: 'TX' },
  'fort collins': { lat: 40.5853, lng: -105.0844, state: 'CO' },
  'hayward': { lat: 37.6688, lng: -122.0808, state: 'CA' },
  'pomona': { lat: 34.0551, lng: -117.7500, state: 'CA' },
  'cary': { lat: 35.7915, lng: -78.7811, state: 'NC' },
  'rockford': { lat: 42.2711, lng: -89.0940, state: 'IL' },
  'alexandria': { lat: 38.8048, lng: -77.0469, state: 'VA' },
  'escondido': { lat: 33.1192, lng: -117.0864, state: 'CA' },
  'mckinney': { lat: 33.1972, lng: -96.6397, state: 'TX' },
  'kansas city ks': { lat: 39.1142, lng: -94.6275, state: 'KS' },
  'joliet': { lat: 41.5250, lng: -88.0817, state: 'IL' },
  'sunnyvale': { lat: 37.3688, lng: -122.0363, state: 'CA' },
  'torrance': { lat: 33.8358, lng: -118.3406, state: 'CA' },
  'bridgeport': { lat: 41.1865, lng: -73.1952, state: 'CT' },
  'lakewood': { lat: 39.7047, lng: -105.0814, state: 'CO' },
  'hollywood': { lat: 26.0112, lng: -80.1495, state: 'FL' },
  'paterson': { lat: 40.9168, lng: -74.1718, state: 'NJ' },
  'naperville': { lat: 41.7508, lng: -88.1535, state: 'IL' },
  'syracuse': { lat: 43.0481, lng: -76.1474, state: 'NY' },
  'mesquite': { lat: 32.7668, lng: -96.5992, state: 'TX' },
  'dayton': { lat: 39.7589, lng: -84.1916, state: 'OH' },
  'savannah': { lat: 32.0809, lng: -81.0912, state: 'GA' },
  'clarksville': { lat: 36.5298, lng: -87.3595, state: 'TN' },
  'orange': { lat: 33.7879, lng: -117.8531, state: 'CA' },
  'pasadena ca': { lat: 34.1478, lng: -118.1445, state: 'CA' },
  'fullerton': { lat: 33.8703, lng: -117.9253, state: 'CA' },
  'killeen': { lat: 31.1171, lng: -97.7278, state: 'TX' },
  'frisco': { lat: 33.1507, lng: -96.8236, state: 'TX' },
  'hampton': { lat: 37.0299, lng: -76.3452, state: 'VA' },
  'mcallen': { lat: 26.2034, lng: -98.2300, state: 'TX' },
  'warren': { lat: 42.5145, lng: -83.0147, state: 'MI' },
  'bellevue': { lat: 47.6101, lng: -122.2015, state: 'WA' },
  'west valley city': { lat: 40.6916, lng: -112.0011, state: 'UT' },
  'columbia sc': { lat: 34.0007, lng: -81.0348, state: 'SC' },
  'olathe': { lat: 38.8814, lng: -94.8191, state: 'KS' },
  'sterling heights': { lat: 42.5803, lng: -83.0302, state: 'MI' },
  'new haven': { lat: 41.3082, lng: -72.9251, state: 'CT' },
  'miramar': { lat: 25.9860, lng: -80.3036, state: 'FL' },
  'waco': { lat: 31.5493, lng: -97.1467, state: 'TX' },
  'thousand oaks': { lat: 34.1706, lng: -118.8376, state: 'CA' },
  'cedar rapids': { lat: 41.9779, lng: -91.6656, state: 'IA' },
  'charleston': { lat: 32.7765, lng: -79.9311, state: 'SC' },
  'visalia': { lat: 36.3302, lng: -119.2921, state: 'CA' },
  'topeka': { lat: 39.0473, lng: -95.6752, state: 'KS' },
  'elizabeth': { lat: 40.6640, lng: -74.2107, state: 'NJ' },
  'gainesville': { lat: 29.6516, lng: -82.3248, state: 'FL' },
  'thornton': { lat: 39.8680, lng: -104.9719, state: 'CO' },
  'roseville': { lat: 38.7521, lng: -121.2880, state: 'CA' },
  'carrollton': { lat: 32.9537, lng: -96.8903, state: 'TX' },
  'coral springs': { lat: 26.2712, lng: -80.2706, state: 'FL' },
  'stamford': { lat: 41.0534, lng: -73.5387, state: 'CT' },
  'simi valley': { lat: 34.2694, lng: -118.7815, state: 'CA' },
  'concord': { lat: 37.9780, lng: -122.0311, state: 'CA' },
  'hartford': { lat: 41.7658, lng: -72.6734, state: 'CT' },
  'kent': { lat: 47.3809, lng: -122.2348, state: 'WA' },
  'lafayette': { lat: 30.2241, lng: -92.0198, state: 'LA' },
  'midland': { lat: 31.9973, lng: -102.0779, state: 'TX' },
  'surprise': { lat: 33.6292, lng: -112.3679, state: 'AZ' },
  'denton': { lat: 33.2148, lng: -97.1331, state: 'TX' },
  'victorville': { lat: 34.5362, lng: -117.2928, state: 'CA' },
  'evansville': { lat: 37.9716, lng: -87.5711, state: 'IN' },
  'santa clara': { lat: 37.3541, lng: -121.9552, state: 'CA' },
  'abilene': { lat: 32.4487, lng: -99.7331, state: 'TX' },
  'athens': { lat: 33.9519, lng: -83.3576, state: 'GA' },
  'vallejo': { lat: 38.1041, lng: -122.2566, state: 'CA' },
  'allentown': { lat: 40.6023, lng: -75.4714, state: 'PA' },
  'norman': { lat: 35.2226, lng: -97.4395, state: 'OK' },
  'beaumont': { lat: 30.0802, lng: -94.1266, state: 'TX' },
  'independence': { lat: 39.0911, lng: -94.4155, state: 'MO' },
  'murfreesboro': { lat: 35.8456, lng: -86.3903, state: 'TN' },
  'ann arbor': { lat: 42.2808, lng: -83.7430, state: 'MI' },
  'springfield il': { lat: 39.7817, lng: -89.6501, state: 'IL' },
  'berkeley': { lat: 37.8716, lng: -122.2727, state: 'CA' },
  'peoria il': { lat: 40.6936, lng: -89.5890, state: 'IL' },
  'provo': { lat: 40.2338, lng: -111.6585, state: 'UT' },
  'el monte': { lat: 34.0686, lng: -118.0276, state: 'CA' },
  'columbia mo': { lat: 38.9517, lng: -92.3341, state: 'MO' },
  'lansing': { lat: 42.7325, lng: -84.5555, state: 'MI' },
  'fargo': { lat: 46.8772, lng: -96.7898, state: 'ND' },
  'downey': { lat: 33.9401, lng: -118.1332, state: 'CA' },
  'costa mesa': { lat: 33.6411, lng: -117.9187, state: 'CA' },
  'wilmington': { lat: 34.2257, lng: -77.9447, state: 'NC' },
  'arvada': { lat: 39.8028, lng: -105.0875, state: 'CO' },
  'inglewood': { lat: 33.9617, lng: -118.3531, state: 'CA' },
  'miami gardens': { lat: 25.9420, lng: -80.2456, state: 'FL' },
  'carlsbad': { lat: 33.1581, lng: -117.3506, state: 'CA' },
  'westminster co': { lat: 39.8367, lng: -105.0372, state: 'CO' },
  'rochester mn': { lat: 44.0121, lng: -92.4802, state: 'MN' },
  'odessa': { lat: 31.8457, lng: -102.3676, state: 'TX' },
  'manchester': { lat: 42.9956, lng: -71.4548, state: 'NH' },
  'elgin': { lat: 42.0354, lng: -88.2826, state: 'IL' },
  'west jordan': { lat: 40.6097, lng: -111.9391, state: 'UT' },
  'round rock': { lat: 30.5083, lng: -97.6789, state: 'TX' },
  'clearwater': { lat: 27.9659, lng: -82.8001, state: 'FL' },
  'waterbury': { lat: 41.5582, lng: -73.0515, state: 'CT' },
  'gresham': { lat: 45.4983, lng: -122.4310, state: 'OR' },
  'fairfield': { lat: 38.2494, lng: -122.0400, state: 'CA' },
  'billings': { lat: 45.7833, lng: -108.5007, state: 'MT' },
  'lowell': { lat: 42.6334, lng: -71.3162, state: 'MA' },
  'san buenaventura': { lat: 34.2746, lng: -119.2290, state: 'CA' },
  'pueblo': { lat: 38.2545, lng: -104.6091, state: 'CO' },
  'high point': { lat: 35.9557, lng: -80.0053, state: 'NC' },
  'west covina': { lat: 34.0686, lng: -117.9390, state: 'CA' },
  'richmond ca': { lat: 37.9358, lng: -122.3478, state: 'CA' },
  'murrieta': { lat: 33.5539, lng: -117.2139, state: 'CA' },
  'cambridge': { lat: 42.3736, lng: -71.1097, state: 'MA' },
  'antioch': { lat: 38.0049, lng: -121.8058, state: 'CA' },
  'temecula': { lat: 33.4936, lng: -117.1484, state: 'CA' },
  'norwalk': { lat: 33.9022, lng: -118.0817, state: 'CA' },
  'centennial': { lat: 39.5791, lng: -104.8769, state: 'CO' },
  'everett': { lat: 47.9790, lng: -122.2021, state: 'WA' },
  'palm bay': { lat: 28.0345, lng: -80.5887, state: 'FL' },
  'wichita falls': { lat: 33.9137, lng: -98.4934, state: 'TX' },
  'green bay': { lat: 44.5133, lng: -88.0133, state: 'WI' },
  'daly city': { lat: 37.6879, lng: -122.4702, state: 'CA' },
  'burbank': { lat: 34.1808, lng: -118.3090, state: 'CA' },
  'richardson': { lat: 32.9483, lng: -96.7299, state: 'TX' },
  'pompano beach': { lat: 26.2379, lng: -80.1248, state: 'FL' },
  'north charleston': { lat: 32.8546, lng: -79.9748, state: 'SC' },
  'broken arrow': { lat: 36.0609, lng: -95.7975, state: 'OK' },
  'boulder': { lat: 40.0150, lng: -105.2705, state: 'CO' },
  'west palm beach': { lat: 26.7153, lng: -80.0534, state: 'FL' },
  'santa maria': { lat: 34.9530, lng: -120.4357, state: 'CA' },
  'el cajon': { lat: 32.7948, lng: -116.9625, state: 'CA' },
  'davenport': { lat: 41.5236, lng: -90.5776, state: 'IA' },
  'rialto': { lat: 34.1064, lng: -117.3703, state: 'CA' },
  'las cruces': { lat: 32.3199, lng: -106.7637, state: 'NM' },
  'san mateo': { lat: 37.5630, lng: -122.3255, state: 'CA' },
  'lewisville': { lat: 33.0462, lng: -96.9942, state: 'TX' },
  'south bend': { lat: 41.6764, lng: -86.2520, state: 'IN' },
  'lakeland': { lat: 28.0395, lng: -81.9498, state: 'FL' },
  'erie': { lat: 42.1292, lng: -80.0851, state: 'PA' },
  'tyler': { lat: 32.3513, lng: -95.3011, state: 'TX' },
  'pearland': { lat: 29.5636, lng: -95.2860, state: 'TX' },
  'college station': { lat: 30.6280, lng: -96.3344, state: 'TX' },
  'kenosha': { lat: 42.5847, lng: -87.8212, state: 'WI' },
  'sandy springs': { lat: 33.9304, lng: -84.3733, state: 'GA' },
  'clovis': { lat: 36.8252, lng: -119.7029, state: 'CA' },
  'flint': { lat: 43.0125, lng: -83.6875, state: 'MI' },
  'roanoke': { lat: 37.2710, lng: -79.9414, state: 'VA' },
  'albany': { lat: 42.6526, lng: -73.7562, state: 'NY' },
  'jurupa valley': { lat: 33.9972, lng: -117.4855, state: 'CA' },
  'compton': { lat: 33.8958, lng: -118.2201, state: 'CA' },
  'san angelo': { lat: 31.4638, lng: -100.4370, state: 'TX' },
  'hillsboro': { lat: 45.5229, lng: -122.9898, state: 'OR' },
  'lawton': { lat: 34.6036, lng: -98.3959, state: 'OK' },
  'renton': { lat: 47.4829, lng: -122.2171, state: 'WA' },
  'vista': { lat: 33.2000, lng: -117.2425, state: 'CA' },
  'greeley': { lat: 40.4233, lng: -104.7091, state: 'CO' },
  'mission viejo': { lat: 33.6000, lng: -117.6720, state: 'CA' },
  'davie': { lat: 26.0765, lng: -80.2521, state: 'FL' },
  'asheville': { lat: 35.5951, lng: -82.5515, state: 'NC' },
  'allen': { lat: 33.1032, lng: -96.6706, state: 'TX' },
};

function extractIncidentType(text: string): string {
  const lowerText = text.toLowerCase();
  if (lowerText.includes('workplace') || lowerText.includes('worksite') || lowerText.includes('factory') || lowerText.includes('plant') || lowerText.includes('business')) {
    return 'Workplace Raid';
  }
  if (lowerText.includes('home') || lowerText.includes('apartment') || lowerText.includes('residence') || lowerText.includes('house')) {
    return 'Home Arrest';
  }
  if (lowerText.includes('traffic') || lowerText.includes('checkpoint') || lowerText.includes('highway') || lowerText.includes('vehicle')) {
    return 'Traffic Stop';
  }
  if (lowerText.includes('courthouse') || lowerText.includes('court')) {
    return 'Courthouse Arrest';
  }
  if (lowerText.includes('school')) {
    return 'School Vicinity';
  }
  if (lowerText.includes('hospital') || lowerText.includes('clinic') || lowerText.includes('medical')) {
    return 'Hospital/Clinic';
  }
  if (lowerText.includes('church') || lowerText.includes('mosque') || lowerText.includes('worship')) {
    return 'Church/Place of Worship';
  }
  return 'Other';
}

function extractNumber(text: string): number | null {
  const patterns = [
    /(\d+)\s*(?:people|persons|individuals|immigrants|migrants|workers)?\s*(?:were\s+)?(?:arrested|detained|taken into custody)/i,
    /(?:arrested|detained|took into custody)\s*(?:approximately|about|over|more than|nearly)?\s*(\d+)/i,
    /(\d+)\s*arrests/i,
    /(\d+)\s*(?:undocumented|illegal)\s*(?:immigrants?|workers?|migrants?)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > 0 && num < 10000) { // Sanity check
        return num;
      }
    }
  }
  return null;
}

function extractLocation(text: string): { city: string | null; state: string | null; lat: number | null; lng: number | null } {
  const lowerText = text.toLowerCase();

  // Check for known cities
  for (const [city, coords] of Object.entries(CITY_COORDS)) {
    if (lowerText.includes(city)) {
      return {
        city: city.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        state: coords.state,
        lat: coords.lat,
        lng: coords.lng,
      };
    }
  }

  // Check for state names
  for (const [stateName, stateCode] of Object.entries(STATE_CODES)) {
    if (lowerText.includes(stateName)) {
      return { city: null, state: stateCode, lat: null, lng: null };
    }
  }

  return { city: null, state: null, lat: null, lng: null };
}

function parseXMLValue(xml: string, tag: string): string {
  const regex = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([^\\]]*?)\\]\\]></${tag}>|<${tag}[^>]*>([^<]*)</${tag}>`, 'i');
  const match = xml.match(regex);
  if (match) {
    return (match[1] || match[2] || '').trim();
  }
  return '';
}

function parseRSSItems(xml: string): RSSItem[] {
  const items: RSSItem[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match;

  while ((match = itemRegex.exec(xml)) !== null) {
    const itemXml = match[1];
    const title = parseXMLValue(itemXml, 'title');
    const link = parseXMLValue(itemXml, 'link');
    const pubDate = parseXMLValue(itemXml, 'pubDate');
    const description = parseXMLValue(itemXml, 'description');

    // Extract source from Google News format
    const sourceMatch = itemXml.match(/<source[^>]*>([^<]*)<\/source>/i);
    const source = sourceMatch ? sourceMatch[1].trim() : 'Unknown';

    if (title && link) {
      items.push({ title, link, pubDate, source, description });
    }
  }

  return items;
}

function parseItemToIncident(item: RSSItem): ParsedIncident | null {
  const fullText = `${item.title} ${item.description || ''}`;
  const lowerText = fullText.toLowerCase();

  // Check if it's actually about ICE/CBP enforcement
  const hasAgency = lowerText.includes('ice') ||
    lowerText.includes('immigration') ||
    lowerText.includes('customs and border') ||
    lowerText.includes('cbp') ||
    lowerText.includes('border patrol');
  const hasAction = lowerText.includes('arrest') ||
    lowerText.includes('raid') ||
    lowerText.includes('detain') ||
    lowerText.includes('deport') ||
    lowerText.includes('apprehend') ||
    lowerText.includes('sweep');

  if (!hasAgency || !hasAction) {
    return null;
  }

  const location = extractLocation(fullText);
  const numAffected = extractNumber(fullText);
  const incidentType = extractIncidentType(fullText);

  // Parse date
  let incidentDate: string;
  try {
    const date = new Date(item.pubDate);
    incidentDate = date.toISOString().split('T')[0];
  } catch {
    incidentDate = new Date().toISOString().split('T')[0];
  }

  // Clean up description - remove HTML tags
  const cleanDescription = (item.description || item.title)
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .substring(0, 500);

  return {
    incident_date: incidentDate,
    incident_type: incidentType,
    description: cleanDescription,
    location_name: null,
    city: location.city,
    state: location.state,
    county: null,
    latitude: location.lat,
    longitude: location.lng,
    num_affected: numAffected,
    news_url: item.link,
    source_name: item.source,
  };
}

async function fetchGoogleNews(): Promise<RSSItem[]> {
  const allItems: RSSItem[] = [];
  const seenUrls = new Set<string>();

  for (const query of SEARCH_QUERIES) {
    try {
      const encodedQuery = encodeURIComponent(query);
      const url = `https://news.google.com/rss/search?q=${encodedQuery}&hl=en-US&gl=US&ceid=US:en`;

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; NewsBot/1.0)',
        },
      });

      if (!response.ok) {
        console.error(`Google News error for query "${query}":`, response.status);
        continue;
      }

      const xml = await response.text();
      const items = parseRSSItems(xml);

      for (const item of items) {
        if (!seenUrls.has(item.link)) {
          seenUrls.add(item.link);
          allItems.push(item);
        }
      }

      // Small delay between requests to be polite
      await new Promise(resolve => setTimeout(resolve, 200));
    } catch (error) {
      console.error(`Error fetching Google News for query "${query}":`, error);
    }
  }

  return allItems;
}

export async function POST() {
  try {
    // Fetch news from Google News RSS
    const items = await fetchGoogleNews();

    if (items.length === 0) {
      return NextResponse.json({
        message: 'No articles found from Google News',
        articlesFound: 0,
        incidentsAdded: 0,
      });
    }

    // Parse items into incidents
    const incidents: ParsedIncident[] = [];
    for (const item of items) {
      const incident = parseItemToIncident(item);
      if (incident) {
        incidents.push(incident);
      }
    }

    if (incidents.length === 0) {
      return NextResponse.json({
        message: 'No relevant incidents found in articles',
        articlesFound: items.length,
        incidentsAdded: 0,
      });
    }

    // Insert into Supabase
    const supabase = createAdminClient();

    // Get existing URLs to avoid duplicates
    const { data: existingIncidents } = await supabase
      .from('incidents')
      .select('news_url');

    const existingUrls = new Set(existingIncidents?.map(i => i.news_url) || []);

    // Filter out duplicates
    const newIncidents = incidents.filter(i => !existingUrls.has(i.news_url));

    if (newIncidents.length === 0) {
      return NextResponse.json({
        message: 'All incidents already exist in database',
        articlesFound: items.length,
        incidentsParsed: incidents.length,
        incidentsAdded: 0,
      });
    }

    // Insert new incidents
    const { data, error } = await supabase
      .from('incidents')
      .insert(newIncidents)
      .select();

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json(
        { error: 'Failed to insert incidents', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Successfully fetched and added incidents from Google News',
      articlesFound: items.length,
      incidentsParsed: incidents.length,
      incidentsAdded: data?.length || 0,
      newIncidents: data,
    });

  } catch (error) {
    console.error('Error in Google News fetch:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST to fetch news from Google News RSS feeds',
    description: 'This endpoint searches Google News for ICE enforcement related articles and adds them to the database.',
  });
}
