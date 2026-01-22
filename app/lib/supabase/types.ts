export type IncidentType =
  | 'Workplace Raid'
  | 'Home Arrest'
  | 'Traffic Stop'
  | 'Courthouse Arrest'
  | 'School Vicinity'
  | 'Hospital/Clinic'
  | 'Church/Place of Worship'
  | 'Public Transportation'
  | 'Other';

export interface Incident {
  id: string;
  incident_date: string;
  incident_type: IncidentType;
  description: string | null;
  location_name: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  county: string | null;
  latitude: number | null;
  longitude: number | null;
  num_affected: number | null;
  news_url: string | null;
  video_url: string | null;
  source_name: string | null;
  created_at: string;
}

export interface IncidentDemographic {
  id: string;
  incident_id: string;
  demographic_type: 'race' | 'age_group' | 'gender';
  demographic_value: string;
  count: number;
}

export const INCIDENT_TYPE_COLORS: Record<IncidentType, string> = {
  'Workplace Raid': '#ef4444',
  'Home Arrest': '#f97316',
  'Traffic Stop': '#eab308',
  'Courthouse Arrest': '#22c55e',
  'School Vicinity': '#3b82f6',
  'Hospital/Clinic': '#8b5cf6',
  'Church/Place of Worship': '#ec4899',
  'Public Transportation': '#06b6d4',
  'Other': '#6b7280',
};

export const INCIDENT_TYPES: IncidentType[] = [
  'Workplace Raid',
  'Home Arrest',
  'Traffic Stop',
  'Courthouse Arrest',
  'School Vicinity',
  'Hospital/Clinic',
  'Church/Place of Worship',
  'Public Transportation',
  'Other',
];
