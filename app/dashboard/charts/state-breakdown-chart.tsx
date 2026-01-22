'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Incident } from '../../lib/supabase/types';

interface StateBreakdownChartProps {
  incidents: Incident[];
}

export default function StateBreakdownChart({ incidents }: StateBreakdownChartProps) {
  const stateCounts: Record<string, { count: number; affected: number }> = {};

  incidents.forEach((incident) => {
    const state = incident.state || 'Unknown';
    if (!stateCounts[state]) {
      stateCounts[state] = { count: 0, affected: 0 };
    }
    stateCounts[state].count += 1;
    stateCounts[state].affected += incident.num_affected || 0;
  });

  const chartData = Object.entries(stateCounts)
    .map(([state, data]) => ({
      state,
      incidents: data.count,
      affected: data.affected,
    }))
    .sort((a, b) => b.incidents - a.incidents)
    .slice(0, 10);

  if (chartData.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-4 h-64 flex items-center justify-center text-gray-500">
        No data available
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">Top States</h3>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" tick={{ fontSize: 10 }} />
            <YAxis
              type="category"
              dataKey="state"
              tick={{ fontSize: 10 }}
              width={40}
            />
            <Tooltip formatter={(value) => [value ?? 0, '']} />
            <Bar dataKey="incidents" fill="#3b82f6" name="Incidents" radius={[0, 4, 4, 0]} isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
