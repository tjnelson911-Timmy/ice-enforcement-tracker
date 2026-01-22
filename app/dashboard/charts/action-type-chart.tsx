'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Incident, INCIDENT_TYPE_COLORS, IncidentType } from '../../lib/supabase/types';

interface ActionTypeChartProps {
  incidents: Incident[];
}

export default function ActionTypeChart({ incidents }: ActionTypeChartProps) {
  const typeCounts: Record<string, number> = {};

  incidents.forEach((incident) => {
    const type = incident.incident_type;
    typeCounts[type] = (typeCounts[type] || 0) + 1;
  });

  const chartData = Object.entries(typeCounts)
    .map(([type, count]) => ({
      name: type,
      value: count,
      color: INCIDENT_TYPE_COLORS[type as IncidentType] || '#6b7280',
    }))
    .sort((a, b) => b.value - a.value);

  if (chartData.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-4 h-64 flex items-center justify-center text-gray-500">
        No data available
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">Incidents by Type</h3>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={70}
              paddingAngle={2}
              dataKey="value"
              isAnimationActive={false}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => [value ?? 0, 'Incidents']} />
            <Legend
              layout="vertical"
              align="right"
              verticalAlign="middle"
              formatter={(value) => <span className="text-xs">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
