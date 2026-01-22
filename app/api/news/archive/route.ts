import { NextResponse } from 'next/server';
import { createAdminClient } from '../../../lib/supabase/admin';

// Fetch historical ICE enforcement news from web archives
// Uses Wayback Machine CDX API to find archived news articles

interface ArchivedArticle {
  url: string;
  timestamp: string;
  title: string;
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
  'austin': { lat: 30.2672, lng: -97.7431, state: 'TX' },
  'denver': { lat: 39.7392, lng: -104.9903, state: 'CO' },
  'boston': { lat: 42.3601, lng: -71.0589, state: 'MA' },
  'el paso': { lat: 31.7619, lng: -106.4850, state: 'TX' },
  'detroit': { lat: 42.3314, lng: -83.0458, state: 'MI' },
  'atlanta': { lat: 33.7490, lng: -84.3880, state: 'GA' },
  'miami': { lat: 25.7617, lng: -80.1918, state: 'FL' },
  'seattle': { lat: 47.6062, lng: -122.3321, state: 'WA' },
  'newark': { lat: 40.7357, lng: -74.1724, state: 'NJ' },
  'aurora': { lat: 39.7294, lng: -104.8319, state: 'CO' },
  'san francisco': { lat: 37.7749, lng: -122.4194, state: 'CA' },
  'tampa': { lat: 27.9506, lng: -82.4572, state: 'FL' },
  'tucson': { lat: 32.2226, lng: -110.9747, state: 'AZ' },
  'fresno': { lat: 36.7378, lng: -119.7871, state: 'CA' },
  'sacramento': { lat: 38.5816, lng: -121.4944, state: 'CA' },
  'las vegas': { lat: 36.1699, lng: -115.1398, state: 'NV' },
  'portland': { lat: 45.5152, lng: -122.6784, state: 'OR' },
  'oklahoma city': { lat: 35.4676, lng: -97.5164, state: 'OK' },
  'albuquerque': { lat: 35.0844, lng: -106.6504, state: 'NM' },
  'louisville': { lat: 38.2527, lng: -85.7585, state: 'KY' },
  'baltimore': { lat: 39.2904, lng: -76.6122, state: 'MD' },
  'milwaukee': { lat: 43.0389, lng: -87.9065, state: 'WI' },
  'memphis': { lat: 35.1495, lng: -90.0490, state: 'TN' },
  'nashville': { lat: 36.1627, lng: -86.7816, state: 'TN' },
  'raleigh': { lat: 35.7796, lng: -78.6382, state: 'NC' },
  'charlotte': { lat: 35.2271, lng: -80.8431, state: 'NC' },
};

// News sites to search in archive
const NEWS_SITES = [
  'cnn.com',
  'foxnews.com',
  'nbcnews.com',
  'abcnews.go.com',
  'cbsnews.com',
  'reuters.com',
  'apnews.com',
  'washingtonpost.com',
  'nytimes.com',
  'usatoday.com',
];

// Search terms
const SEARCH_TERMS = [
  'ICE+raid',
  'ICE+arrest',
  'immigration+enforcement',
  'deportation+raid',
  'ICE+detention',
];

function extractLocation(text: string): { city: string | null; state: string | null; lat: number | null; lng: number | null } {
  const lowerText = text.toLowerCase();

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

  for (const [stateName, stateCode] of Object.entries(STATE_CODES)) {
    if (lowerText.includes(stateName)) {
      return { city: null, state: stateCode, lat: null, lng: null };
    }
  }

  return { city: null, state: null, lat: null, lng: null };
}

function extractNumber(text: string): number | null {
  const patterns = [
    /(\d+)\s*(?:people|persons|individuals|immigrants|migrants|workers)?\s*(?:were\s+)?(?:arrested|detained|taken into custody)/i,
    /(?:arrested|detained|took into custody)\s*(?:approximately|about|over|more than|nearly)?\s*(\d+)/i,
    /(\d+)\s*arrests/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return parseInt(match[1], 10);
    }
  }
  return null;
}

function extractIncidentType(text: string): string {
  const lowerText = text.toLowerCase();
  if (lowerText.includes('workplace') || lowerText.includes('worksite') || lowerText.includes('factory') || lowerText.includes('plant')) {
    return 'Workplace Raid';
  }
  if (lowerText.includes('home') || lowerText.includes('apartment') || lowerText.includes('residence')) {
    return 'Home Arrest';
  }
  if (lowerText.includes('traffic') || lowerText.includes('checkpoint') || lowerText.includes('highway')) {
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

async function fetchWaybackCDX(site: string, searchTerm: string, fromDate: string, toDate: string): Promise<string[]> {
  // Try multiple URL patterns
  const patterns = [
    `${site}/*ice*`,
    `${site}/*immigration*arrest*`,
    `${site}/*immigration*raid*`,
    `${site}/*deportation*`,
    `${site}/*/ice-*`,
    `${site}/news/*ice*`,
    `${site}/us/*ice*`,
    `${site}/politics/*immigration*`,
  ];

  const allUrls: string[] = [];

  for (const pattern of patterns) {
    const url = `https://web.archive.org/cdx/search/cdx?url=${pattern}&from=${fromDate}&to=${toDate}&output=json&limit=20&filter=statuscode:200&filter=mimetype:text/html&collapse=urlkey`;

    try {
      const response = await fetch(url, {
        headers: { 'User-Agent': 'ICE-Tracker/1.0' }
      });

      if (!response.ok) {
        continue;
      }

      const data = await response.json();

      if (!Array.isArray(data) || data.length <= 1) {
        continue;
      }

      for (let i = 1; i < data.length; i++) {
        const timestamp = data[i][1];
        const originalUrl = data[i][2];
        const waybackUrl = `https://web.archive.org/web/${timestamp}/${originalUrl}`;
        if (!allUrls.includes(waybackUrl)) {
          allUrls.push(waybackUrl);
        }
      }
    } catch (error) {
      console.error(`Error fetching pattern ${pattern}:`, error);
    }
  }

  return allUrls;
}

async function fetchAndParseArticle(waybackUrl: string): Promise<ParsedIncident | null> {
  try {
    const response = await fetch(waybackUrl, {
      headers: { 'User-Agent': 'ICE-Tracker/1.0' }
    });

    if (!response.ok) {
      return null;
    }

    const html = await response.text();

    // Extract title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : '';

    // Extract meta description
    const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i) ||
                      html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']description["']/i);
    const description = descMatch ? descMatch[1].trim() : '';

    // Extract date from wayback URL (format: /web/YYYYMMDDHHMMSS/)
    const dateMatch = waybackUrl.match(/\/web\/(\d{4})(\d{2})(\d{2})/);
    let incidentDate = new Date().toISOString().split('T')[0];
    if (dateMatch) {
      incidentDate = `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}`;
    }

    // Check if article is relevant
    const fullText = `${title} ${description}`.toLowerCase();
    const hasAgency = fullText.includes('ice') || fullText.includes('immigration') ||
                      fullText.includes('cbp') || fullText.includes('border patrol');
    const hasAction = fullText.includes('arrest') || fullText.includes('raid') ||
                      fullText.includes('detain') || fullText.includes('deport');

    if (!hasAgency || !hasAction) {
      return null;
    }

    // Extract original URL from wayback URL
    const originalUrlMatch = waybackUrl.match(/\/web\/\d+\/(.+)$/);
    const originalUrl = originalUrlMatch ? originalUrlMatch[1] : waybackUrl;

    // Extract source name from URL
    const sourceMatch = originalUrl.match(/https?:\/\/(?:www\.)?([^/]+)/);
    const sourceName = sourceMatch ? sourceMatch[1] : 'Archive';

    const location = extractLocation(`${title} ${description}`);
    const numAffected = extractNumber(`${title} ${description}`);
    const incidentType = extractIncidentType(`${title} ${description}`);

    return {
      incident_date: incidentDate,
      incident_type: incidentType,
      description: description || title,
      location_name: null,
      city: location.city,
      state: location.state,
      county: null,
      latitude: location.lat,
      longitude: location.lng,
      num_affected: numAffected,
      news_url: originalUrl.startsWith('http') ? originalUrl : `https://${originalUrl}`,
      source_name: sourceName,
    };
  } catch (error) {
    console.error(`Error parsing article ${waybackUrl}:`, error);
    return null;
  }
}

export async function POST() {
  try {
    const allIncidents: ParsedIncident[] = [];
    const seenUrls = new Set<string>();
    let totalArchiveUrls = 0;

    // Date range: January 20, 2025 to now
    const fromDate = '20250120';
    const toDate = new Date().toISOString().slice(0, 10).replace(/-/g, '');

    console.log(`Searching archives from ${fromDate} to ${toDate}`);

    // Search each news site
    for (const site of NEWS_SITES) {
      console.log(`Searching ${site}...`);

      const waybackUrls = await fetchWaybackCDX(site, '', fromDate, toDate);
      totalArchiveUrls += waybackUrls.length;
      console.log(`Found ${waybackUrls.length} archived URLs for ${site}`);

      // Process URLs
      for (const url of waybackUrls.slice(0, 15)) {
        if (seenUrls.has(url)) continue;
        seenUrls.add(url);

        const incident = await fetchAndParseArticle(url);
        if (incident && !seenUrls.has(incident.news_url)) {
          seenUrls.add(incident.news_url);
          allIncidents.push(incident);
          console.log(`Found incident: ${incident.city || incident.state} - ${incident.incident_type}`);
        }

        // Small delay to be nice to archive.org
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    console.log(`Total archive URLs found: ${totalArchiveUrls}, Incidents parsed: ${allIncidents.length}`);

    if (allIncidents.length === 0) {
      return NextResponse.json({
        message: 'No historical incidents found in archives',
        articlesSearched: seenUrls.size,
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
    const newIncidents = allIncidents.filter(i => !existingUrls.has(i.news_url));

    if (newIncidents.length === 0) {
      return NextResponse.json({
        message: 'All historical incidents already exist in database',
        articlesSearched: seenUrls.size,
        incidentsParsed: allIncidents.length,
        incidentsAdded: 0,
      });
    }

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
      message: 'Successfully fetched historical incidents from archives',
      articlesSearched: seenUrls.size,
      incidentsParsed: allIncidents.length,
      incidentsAdded: data?.length || 0,
    });

  } catch (error) {
    console.error('Error in archive fetch:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'POST to this endpoint to fetch historical ICE enforcement news from web archives',
    dateRange: 'January 20, 2025 to present',
    sources: NEWS_SITES,
  });
}
