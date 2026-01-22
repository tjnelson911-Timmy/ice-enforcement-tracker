import { createServerClient } from '../../lib/supabase/server';
import { Incident, IncidentDemographic, INCIDENT_TYPE_COLORS, IncidentType } from '../../lib/supabase/types';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{ id: string }>;
}

function getYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/
  );
  return match ? match[1] : null;
}

// Helper to clean HTML from descriptions
function cleanDescription(text: string): string {
  if (!text) return '';
  return text
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

// Extract domain from URL for display
function getDomain(url: string): string {
  try {
    const domain = new URL(url).hostname.replace('www.', '').replace('news.google.com', 'Google News');
    return domain;
  } catch {
    return 'Source';
  }
}

export default async function IncidentDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = createServerClient();

  const { data: incident, error: incidentError } = await supabase
    .from('incidents')
    .select('*')
    .eq('id', id)
    .single();

  if (incidentError || !incident) {
    notFound();
  }

  const typedIncident = incident as Incident;

  const { data: demographics } = await supabase
    .from('incident_demographics')
    .select('*')
    .eq('incident_id', id);

  const typedDemographics = (demographics || []) as IncidentDemographic[];

  const groupedDemographics = typedDemographics.reduce((acc, d) => {
    if (!acc[d.demographic_type]) {
      acc[d.demographic_type] = [];
    }
    acc[d.demographic_type].push(d);
    return acc;
  }, {} as Record<string, IncidentDemographic[]>);

  const youtubeId = typedIncident.video_url ? getYouTubeId(typedIncident.video_url) : null;
  const cleanedDescription = cleanDescription(typedIncident.description || '');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-blue-900 text-white">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Link
            href="/incidents"
            className="inline-flex items-center gap-2 text-blue-300 hover:text-white transition-colors mb-6"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to all incidents
          </Link>

          <div className="flex items-start gap-4">
            <div
              className="w-4 h-4 rounded-full flex-shrink-0 mt-2"
              style={{ backgroundColor: INCIDENT_TYPE_COLORS[typedIncident.incident_type as IncidentType] }}
            />
            <div className="flex-1">
              <span className="text-xs font-medium text-blue-300 uppercase tracking-wide">
                {typedIncident.incident_type}
              </span>
              <h1 className="text-3xl font-bold mt-1">
                {typedIncident.city ? `${typedIncident.city}, ${typedIncident.state}` : typedIncident.state || 'Unknown Location'}
              </h1>
              <p className="text-blue-200 mt-2">
                {new Date(typedIncident.incident_date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
            {typedIncident.num_affected && (
              <div className="text-right bg-white/10 rounded-xl px-6 py-4">
                <p className="text-4xl font-bold text-red-400">
                  {typedIncident.num_affected}
                </p>
                <p className="text-sm text-blue-200">people affected</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid gap-6">
          {/* Description */}
          {cleanedDescription && (
            <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Description
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {cleanedDescription}
              </p>
            </div>
          )}

          {/* Location Details */}
          <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Location Details
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {typedIncident.location_name && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Location</p>
                  <p className="font-medium text-gray-900 mt-1">{typedIncident.location_name}</p>
                </div>
              )}
              {typedIncident.address && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Address</p>
                  <p className="font-medium text-gray-900 mt-1">{typedIncident.address}</p>
                </div>
              )}
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 uppercase tracking-wide">City</p>
                <p className="font-medium text-gray-900 mt-1">{typedIncident.city || 'N/A'}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 uppercase tracking-wide">State</p>
                <p className="font-medium text-gray-900 mt-1">{typedIncident.state || 'N/A'}</p>
              </div>
              {typedIncident.county && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">County</p>
                  <p className="font-medium text-gray-900 mt-1">{typedIncident.county}</p>
                </div>
              )}
              {typedIncident.latitude && typedIncident.longitude && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Coordinates</p>
                  <p className="font-medium text-gray-900 mt-1">
                    {typedIncident.latitude.toFixed(4)}, {typedIncident.longitude.toFixed(4)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Demographics */}
          {Object.keys(groupedDemographics).length > 0 && (
            <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Demographics
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {groupedDemographics.race && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-3">Race/Ethnicity</h3>
                    <div className="space-y-2">
                      {groupedDemographics.race.map((d) => (
                        <div key={d.id} className="flex justify-between items-center bg-gray-50 rounded-lg px-3 py-2">
                          <span className="text-sm text-gray-700">{d.demographic_value}</span>
                          <span className="text-sm font-semibold text-gray-900">{d.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {groupedDemographics.gender && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-3">Gender</h3>
                    <div className="space-y-2">
                      {groupedDemographics.gender.map((d) => (
                        <div key={d.id} className="flex justify-between items-center bg-gray-50 rounded-lg px-3 py-2">
                          <span className="text-sm text-gray-700">{d.demographic_value}</span>
                          <span className="text-sm font-semibold text-gray-900">{d.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {groupedDemographics.age_group && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-3">Age Group</h3>
                    <div className="space-y-2">
                      {groupedDemographics.age_group.map((d) => (
                        <div key={d.id} className="flex justify-between items-center bg-gray-50 rounded-lg px-3 py-2">
                          <span className="text-sm text-gray-700">{d.demographic_value}</span>
                          <span className="text-sm font-semibold text-gray-900">{d.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Video */}
          {youtubeId && (
            <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Video
              </h2>
              <div className="aspect-video rounded-xl overflow-hidden">
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${youtubeId}`}
                  title="Incident video"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          )}

          {/* Sources */}
          <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              Sources
            </h2>
            <div className="space-y-3">
              {typedIncident.news_url && (
                <a
                  href={typedIncident.news_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors group"
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-blue-900">
                      {typedIncident.source_name || 'News Article'}
                    </p>
                    <p className="text-sm text-blue-600 truncate">
                      {getDomain(typedIncident.news_url)}
                    </p>
                  </div>
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              )}
              {typedIncident.video_url && !youtubeId && (
                <a
                  href={typedIncident.video_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors group"
                >
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-purple-900">Video Source</p>
                    <p className="text-sm text-purple-600 truncate">
                      {getDomain(typedIncident.video_url)}
                    </p>
                  </div>
                  <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              )}
              {!typedIncident.news_url && !typedIncident.video_url && (
                <div className="text-center py-8 text-gray-500">
                  <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  No external sources available
                </div>
              )}
            </div>
          </div>

          {/* Back to Dashboard */}
          <div className="flex justify-center pt-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              View on Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
