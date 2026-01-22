import { NextResponse } from 'next/server';
import { createAdminClient } from '../../../lib/supabase/admin';

// News sources to search - National outlets
const NEWS_SOURCES = [
  'cnn',
  'fox-news',
  'abc-news',
  'cbs-news',
  'nbc-news',
  'associated-press',
  'reuters',
  'the-washington-post',
  'usa-today',
  'the-wall-street-journal',
  'nbc-news',
  'msnbc',
  'the-new-york-times',
  'politico',
  'the-hill',
  'newsweek',
  'time',
  'npr',
];

// Keywords to search for ICE-related news
const SEARCH_QUERIES = [
  'ICE raid',
  'ICE arrests',
  'ICE detention',
  'ICE operation',
  'ICE enforcement',
  'immigration enforcement',
  'immigration raid',
  'deportation raid',
  'deportation operation',
  'border patrol arrest',
  'Customs and Border Protection arrest',
  'CBP arrest',
  'CBP detention',
  'immigration detention',
  'undocumented immigrant arrest',
  'ICE agents',
  'immigration crackdown',
  'workplace immigration raid',
  'immigration sweep',
  'migrant arrest',
  'deportation arrest',
];

interface NewsArticle {
  title: string;
  description: string;
  url: string;
  source: { name: string };
  publishedAt: string;
  content?: string;
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

// Simple state name to code mapping
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

// Major city coordinates
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
};

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

function extractNumber(text: string): number | null {
  // Look for patterns like "X arrested", "X detained", "X people"
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

function parseArticleToIncident(article: NewsArticle): ParsedIncident | null {
  const fullText = `${article.title} ${article.description || ''} ${article.content || ''}`;

  // Check if it's actually about ICE/CBP enforcement
  const lowerText = fullText.toLowerCase();
  const hasAgency = lowerText.includes('ice') ||
    lowerText.includes('immigration') ||
    lowerText.includes('customs and border') ||
    lowerText.includes('cbp') ||
    lowerText.includes('border patrol');
  const hasAction = lowerText.includes('arrest') ||
    lowerText.includes('raid') ||
    lowerText.includes('detain') ||
    lowerText.includes('deport') ||
    lowerText.includes('apprehend');
  const isRelevant = hasAgency && hasAction;

  if (!isRelevant) {
    return null;
  }

  const location = extractLocation(fullText);
  const numAffected = extractNumber(fullText);
  const incidentType = extractIncidentType(fullText);

  // Use article publish date as incident date
  const publishDate = new Date(article.publishedAt);
  const incidentDate = publishDate.toISOString().split('T')[0];

  return {
    incident_date: incidentDate,
    incident_type: incidentType,
    description: article.description || article.title,
    location_name: null,
    city: location.city,
    state: location.state,
    county: null,
    latitude: location.lat,
    longitude: location.lng,
    num_affected: numAffected,
    news_url: article.url,
    source_name: article.source.name,
  };
}

async function fetchNewsFromAPI(apiKey: string): Promise<NewsArticle[]> {
  const allArticles: NewsArticle[] = [];
  const seenUrls = new Set<string>();

  // Start date: September 1, 2025
  const fromDate = '2025-09-01';

  // Primary queries for national sources
  const primaryQueries = SEARCH_QUERIES.slice(0, 8);
  // Additional queries for broader search (local news)
  const localQueries = [
    'ICE raid',
    'ICE arrests immigration',
    'immigration enforcement arrest',
    'deportation raid local',
    'ICE detention center',
  ];

  // First: Search national sources
  for (const query of primaryQueries) {
    try {
      const response = await fetch(
        `https://newsapi.org/v2/everything?` +
        `q=${encodeURIComponent(query)}&` +
        `sources=${NEWS_SOURCES.join(',')}&` +
        `from=${fromDate}&` +
        `sortBy=publishedAt&` +
        `pageSize=100&` +
        `apiKey=${apiKey}`
      );

      if (!response.ok) {
        console.error(`NewsAPI error for query "${query}":`, response.status);
        continue;
      }

      const data = await response.json();

      for (const article of data.articles || []) {
        if (!seenUrls.has(article.url)) {
          seenUrls.add(article.url);
          allArticles.push(article);
        }
      }
    } catch (error) {
      console.error(`Error fetching news for query "${query}":`, error);
    }
  }

  // Second: Search ALL sources (captures local affiliates) - US only, English
  for (const query of localQueries) {
    try {
      const response = await fetch(
        `https://newsapi.org/v2/everything?` +
        `q=${encodeURIComponent(query)}&` +
        `language=en&` +
        `from=${fromDate}&` +
        `sortBy=publishedAt&` +
        `pageSize=100&` +
        `apiKey=${apiKey}`
      );

      if (!response.ok) {
        console.error(`NewsAPI error for local query "${query}":`, response.status);
        continue;
      }

      const data = await response.json();

      for (const article of data.articles || []) {
        if (!seenUrls.has(article.url)) {
          seenUrls.add(article.url);
          allArticles.push(article);
        }
      }
    } catch (error) {
      console.error(`Error fetching local news for query "${query}":`, error);
    }
  }

  return allArticles;
}

export async function POST() {
  try {
    // Use environment variable for API key
    const apiKey = process.env.NEWSAPI_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'NewsAPI key not configured' },
        { status: 400 }
      );
    }

    // Fetch news articles
    const articles = await fetchNewsFromAPI(apiKey);

    if (articles.length === 0) {
      return NextResponse.json({
        message: 'No articles found',
        articlesFound: 0,
        incidentsAdded: 0,
      });
    }

    // Parse articles into incidents
    const incidents: ParsedIncident[] = [];
    for (const article of articles) {
      const incident = parseArticleToIncident(article);
      if (incident) {
        incidents.push(incident);
      }
    }

    if (incidents.length === 0) {
      return NextResponse.json({
        message: 'No relevant incidents found in articles',
        articlesFound: articles.length,
        incidentsAdded: 0,
      });
    }

    // Insert into Supabase, avoiding duplicates by URL
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
        articlesFound: articles.length,
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
      message: 'Successfully fetched and added incidents',
      articlesFound: articles.length,
      incidentsParsed: incidents.length,
      incidentsAdded: data?.length || 0,
      newIncidents: data,
    });

  } catch (error) {
    console.error('Error in news fetch:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST with { "apiKey": "your-newsapi-key" } to fetch news',
    instructions: [
      '1. Get a free API key from https://newsapi.org',
      '2. POST to this endpoint with your API key',
      '3. The system will fetch ICE-related news and add to database',
    ],
  });
}
