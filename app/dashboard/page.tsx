import { createServerClient } from '../lib/supabase/server';
import { Incident, IncidentDemographic } from '../lib/supabase/types';
import DashboardClient from './dashboard-client';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const supabase = createServerClient();

  const { data: incidentsData, error: incidentsError } = await supabase
    .from('incidents')
    .select('*')
    .order('incident_date', { ascending: false })
    .limit(10000);

  const { data: demographicsData, error: demographicsError } = await supabase
    .from('incident_demographics')
    .select('*');

  if (incidentsError) {
    console.error('Error fetching incidents:', incidentsError);
  }
  if (demographicsError) {
    console.error('Error fetching demographics:', demographicsError);
  }

  const incidents = (incidentsData || []) as Incident[];
  const demographics = (demographicsData || []) as IncidentDemographic[];

  return <DashboardClient incidents={incidents} demographics={demographics} />;
}
