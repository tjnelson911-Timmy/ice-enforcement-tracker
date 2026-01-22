'use client';

import dynamic from 'next/dynamic';
import { Incident } from '../lib/supabase/types';

const IncidentMap = dynamic(() => import('./incident-map'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-gray-100 animate-pulse flex items-center justify-center">
      <span className="text-gray-500">Loading map...</span>
    </div>
  ),
});

interface DashboardMapsProps {
  incidents: Incident[];
  selectedIncident: Incident | null;
  onSelectIncident: (incident: Incident | null) => void;
}

export default function DashboardMaps({ incidents, selectedIncident, onSelectIncident }: DashboardMapsProps) {
  return (
    <IncidentMap
      incidents={incidents}
      selectedIncident={selectedIncident}
      onSelectIncident={onSelectIncident}
    />
  );
}
