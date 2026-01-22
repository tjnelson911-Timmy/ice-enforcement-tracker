'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Incident } from '../../lib/supabase/types';

interface IncidentsOverTimeProps {
  incidents: Incident[];
}

export default function IncidentsOverTime({ incidents }: IncidentsOverTimeProps) {
  const sortedIncidents = [...incidents].sort(
    (a, b) => new Date(a.incident_date).getTime() - new Date(b.incident_date).getTime()
  );

  const dataByMonth: Record<string, { count: number; affected: number }> = {};

  sortedIncidents.forEach((incident) => {
    const date = new Date(incident.incident_date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    if (!dataByMonth[monthKey]) {
      dataByMonth[monthKey] = { count: 0, affected: 0 };
    }
    dataByMonth[monthKey].count += 1;
    dataByMonth[monthKey].affected += incident.num_affected || 0;
  });

  const chartData = Object.entries(dataByMonth).map(([month, data]) => ({
    month,
    incidents: data.count,
    affected: data.affected,
  }));

  if (chartData.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-4 h-64 flex items-center justify-center text-gray-500">
        No data available
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">Incidents Over Time</h3>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 10 }}
              tickFormatter={(value) => {
                const [year, month] = value.split('-');
                return `${month}/${year.slice(2)}`;
              }}
            />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip
              formatter={(value) => [value ?? 0, '']}
              labelFormatter={(label) => {
                const [year, month] = label.split('-');
                const date = new Date(parseInt(year), parseInt(month) - 1);
                return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
              }}
            />
            <Area
              type="monotone"
              dataKey="incidents"
              stackId="1"
              stroke="#3b82f6"
              fill="#93c5fd"
              name="Incidents"
              isAnimationActive={false}
            />
            <Area
              type="monotone"
              dataKey="affected"
              stackId="2"
              stroke="#ef4444"
              fill="#fca5a5"
              name="People Affected"
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
