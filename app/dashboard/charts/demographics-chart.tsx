'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { IncidentDemographic } from '../../lib/supabase/types';

interface DemographicsChartProps {
  demographics: IncidentDemographic[];
  type: 'race' | 'age_group' | 'gender';
  title: string;
}

const COLORS: Record<string, string> = {
  race: '#3b82f6',
  age_group: '#22c55e',
  gender: '#f97316',
};

export default function DemographicsChart({ demographics, type, title }: DemographicsChartProps) {
  const filtered = demographics.filter((d) => d.demographic_type === type);

  const aggregated: Record<string, number> = {};
  filtered.forEach((d) => {
    aggregated[d.demographic_value] = (aggregated[d.demographic_value] || 0) + d.count;
  });

  const chartData = Object.entries(aggregated)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  if (chartData.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-4 h-48 flex items-center justify-center text-gray-500">
        No {title.toLowerCase()} data available
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">{title}</h3>
      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" tick={{ fontSize: 10 }} />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 10 }}
              width={80}
            />
            <Tooltip formatter={(value) => [value ?? 0, 'Count']} />
            <Bar dataKey="value" fill={COLORS[type]} radius={[0, 4, 4, 0]} isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
