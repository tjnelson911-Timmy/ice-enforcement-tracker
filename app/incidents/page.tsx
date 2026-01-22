import { createServerClient } from '../lib/supabase/server';
import { Incident, INCIDENT_TYPE_COLORS, IncidentType } from '../lib/supabase/types';
import Link from 'next/link';
import UpdateStatsButton from '../components/update-stats-button';

export const dynamic = 'force-dynamic';

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
    .replace(/&apos;/g, "'")
    .replace(/https?:\/\/[^\s]+/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 180);
}

function getDomain(url: string): string {
  try {
    const domain = new URL(url).hostname
      .replace('www.', '')
      .replace('news.google.com', 'Google News');
    return domain;
  } catch {
    return 'Source';
  }
}

export default async function IncidentsPage() {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('incidents')
    .select('*')
    .order('incident_date', { ascending: false });

  if (error) {
    console.error('Error fetching incidents:', error);
  }

  const incidents = (data || []) as Incident[];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <Link href="/" className="text-slate-400 hover:text-white text-sm mb-2 inline-block">
                &larr; Back to Home
              </Link>
              <h1 className="text-3xl font-bold">All Incidents</h1>
              <p className="text-slate-300 mt-1">{incidents.length.toLocaleString()} incidents recorded</p>
            </div>
            <div className="flex items-center gap-3">
              <UpdateStatsButton />
              <Link
                href="/dashboard"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
              >
                View Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Incidents List */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid gap-4">
          {incidents.map((incident) => {
            const cleanedDesc = cleanDescription(incident.description || '');
            const typeColor = INCIDENT_TYPE_COLORS[incident.incident_type as IncidentType] || '#6B7280';

            return (
              <Link
                key={incident.id}
                href={`/incidents/${incident.id}`}
                className="block bg-white rounded-xl shadow-sm hover:shadow-lg transition-all border border-slate-200 hover:border-slate-300"
              >
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    {/* Type indicator */}
                    <div
                      className="w-3 h-3 rounded-full mt-2 flex-shrink-0 ring-4 ring-opacity-20"
                      style={{
                        backgroundColor: typeColor,
                        boxShadow: `0 0 0 4px ${typeColor}33`
                      }}
                    />

                    <div className="flex-1 min-w-0">
                      {/* Top row: Type and Date */}
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div>
                          <span
                            className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold text-white mb-2"
                            style={{ backgroundColor: typeColor }}
                          >
                            {incident.incident_type}
                          </span>
                          <h2 className="font-semibold text-slate-900 text-lg">
                            {incident.city}, {incident.state}
                          </h2>
                          {incident.location_name && (
                            <p className="text-sm text-slate-500">{incident.location_name}</p>
                          )}
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm font-semibold text-slate-700">
                            {new Date(incident.incident_date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </p>
                          {incident.num_affected && incident.num_affected > 0 && (
                            <p className="text-sm font-medium text-red-600 mt-1">
                              {incident.num_affected} people affected
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Description */}
                      {cleanedDesc && (
                        <p className="text-sm text-slate-600 leading-relaxed mb-3">
                          {cleanedDesc}{cleanedDesc.length >= 177 ? '...' : ''}
                        </p>
                      )}

                      {/* Footer: Source and badges */}
                      <div className="flex items-center flex-wrap gap-2 pt-2 border-t border-slate-100">
                        {incident.source_name && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 rounded-full text-xs text-slate-600">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                            </svg>
                            {incident.source_name}
                          </span>
                        )}
                        {incident.news_url && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 rounded-full text-xs text-blue-600">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                            {getDomain(incident.news_url)}
                          </span>
                        )}
                        {incident.video_url && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-purple-50 rounded-full text-xs text-purple-600">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            Video
                          </span>
                        )}
                        <span className="ml-auto text-xs text-blue-600 font-medium flex items-center gap-1">
                          View details
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}

          {incidents.length === 0 && (
            <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-slate-200">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="text-slate-600 text-lg font-medium">No incidents recorded yet</p>
              <p className="text-slate-400 mt-1 mb-4">Be the first to document an incident</p>
              <Link
                href="/admin/add-incident"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add the first incident
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
