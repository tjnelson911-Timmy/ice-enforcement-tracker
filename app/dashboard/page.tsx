import { createServerClient } from '../lib/supabase/server';
import { Incident, IncidentDemographic } from '../lib/supabase/types';
import DashboardClient from './dashboard-client';

export const dynamic = 'force-dynamic';

async function fetchAllIncidents(supabase: ReturnType<typeof createServerClient>) {
  const allIncidents: Incident[] = [];
  const pageSize = 1000;
  let page = 0;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .from('incidents')
      .select('*')
      .order('incident_date', { ascending: false })
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (error) {
      console.error('Error fetching incidents:', error);
      break;
    }

    if (data && data.length > 0) {
      allIncidents.push(...(data as Incident[]));
      page++;
      hasMore = data.length === pageSize;
    } else {
      hasMore = false;
    }
  }

  return allIncidents;
}

export default async function DashboardPage() {
  const supabase = createServerClient();

  const incidents = await fetchAllIncidents(supabase);

  const { data: demographicsData, error: demographicsError } = await supabase
    .from('incident_demographics')
    .select('*');

  if (demographicsError) {
    console.error('Error fetching demographics:', demographicsError);
  }

  const demographics = (demographicsData || []) as IncidentDemographic[];

  return <DashboardClient incidents={incidents} demographics={demographics} />;
}
