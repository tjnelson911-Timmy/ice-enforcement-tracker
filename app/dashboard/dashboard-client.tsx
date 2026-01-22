'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Incident, IncidentDemographic, INCIDENT_TYPES, IncidentType } from '../lib/supabase/types';
import DashboardMaps from './dashboard-maps';
import TimelinePlayer from './timeline-player';
import IncidentsOverTime from './charts/incidents-over-time';
import ActionTypeChart from './charts/action-type-chart';
import DemographicsChart from './charts/demographics-chart';
import StateBreakdownChart from './charts/state-breakdown-chart';
import UpdateStatsButton from '../components/update-stats-button';

interface DashboardClientProps {
  incidents: Incident[];
  demographics: IncidentDemographic[];
}

export default function DashboardClient({ incidents, demographics }: DashboardClientProps) {
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [selectedType, setSelectedType] = useState<IncidentType | 'all'>('all');
  const [selectedState, setSelectedState] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [timelineDate, setTimelineDate] = useState<Date | null>(null);

  const states = useMemo(() => {
    const stateSet = new Set(incidents.map((i) => i.state).filter(Boolean));
    return Array.from(stateSet).sort();
  }, [incidents]);

  const years = useMemo(() => {
    const yearSet = new Set(incidents.map((i) => new Date(i.incident_date).getFullYear()));
    return Array.from(yearSet).sort((a, b) => b - a);
  }, [incidents]);

  const months = [
    { value: '01', label: 'January' },
    { value: '02', label: 'February' },
    { value: '03', label: 'March' },
    { value: '04', label: 'April' },
    { value: '05', label: 'May' },
    { value: '06', label: 'June' },
    { value: '07', label: 'July' },
    { value: '08', label: 'August' },
    { value: '09', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
  ];

  // Base filtered incidents (without timeline filter) - used for timeline player
  const baseFilteredIncidents = useMemo(() => {
    let filtered = incidents;

    if (selectedType !== 'all') {
      filtered = filtered.filter((i) => i.incident_type === selectedType);
    }

    if (selectedState !== 'all') {
      filtered = filtered.filter((i) => i.state === selectedState);
    }

    if (selectedYear !== 'all') {
      filtered = filtered.filter((i) => {
        const year = new Date(i.incident_date).getFullYear();
        return year === parseInt(selectedYear);
      });
    }

    if (selectedMonth !== 'all') {
      filtered = filtered.filter((i) => {
        const month = String(new Date(i.incident_date).getMonth() + 1).padStart(2, '0');
        return month === selectedMonth;
      });
    }

    if (startDate) {
      filtered = filtered.filter((i) => new Date(i.incident_date) >= new Date(startDate));
    }

    if (endDate) {
      filtered = filtered.filter((i) => new Date(i.incident_date) <= new Date(endDate));
    }

    return filtered;
  }, [incidents, selectedType, selectedState, selectedYear, selectedMonth, startDate, endDate]);

  // Full filtered incidents (with timeline filter) - used for map and charts
  const filteredIncidents = useMemo(() => {
    if (!timelineDate) {
      return baseFilteredIncidents;
    }
    return baseFilteredIncidents.filter(
      (i) => new Date(i.incident_date) <= timelineDate
    );
  }, [baseFilteredIncidents, timelineDate]);

  const stats = useMemo(() => {
    const totalIncidents = filteredIncidents.length;
    const totalAffected = filteredIncidents.reduce(
      (sum, i) => sum + (i.num_affected || 0),
      0
    );
    const statesAffected = new Set(filteredIncidents.map((i) => i.state).filter(Boolean)).size;
    const mostActiveState = Object.entries(
      filteredIncidents.reduce((acc, i) => {
        if (i.state) {
          acc[i.state] = (acc[i.state] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>)
    ).sort((a, b) => b[1] - a[1])[0];

    return {
      totalIncidents,
      totalAffected,
      statesAffected,
      mostActiveState: mostActiveState ? mostActiveState[0] : 'N/A',
    };
  }, [filteredIncidents]);

  const filteredDemographics = useMemo(() => {
    const incidentIds = new Set(filteredIncidents.map((i) => i.id));
    return demographics.filter((d) => incidentIds.has(d.incident_id));
  }, [filteredIncidents, demographics]);

  const resetFilters = () => {
    setSelectedType('all');
    setSelectedState('all');
    setSelectedYear('all');
    setSelectedMonth('all');
    setStartDate('');
    setEndDate('');
    setTimelineDate(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">ICE Enforcement Tracker</h1>
            <p className="text-gray-600">Tracking enforcement actions since September 1, 2025</p>
          </div>
          <UpdateStatsButton />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">Total Incidents</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalIncidents}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">People Affected</p>
            <p className="text-2xl font-bold text-red-600">{stats.totalAffected.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">States</p>
            <p className="text-2xl font-bold text-gray-900">{stats.statesAffected}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">Most Active State</p>
            <p className="text-2xl font-bold text-blue-600">{stats.mostActiveState}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Filters</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Type
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as IncidentType | 'all')}
                className="w-full border rounded-md px-2 py-1.5 text-sm"
              >
                <option value="all">All Types</option>
                {INCIDENT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                State
              </label>
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="w-full border rounded-md px-2 py-1.5 text-sm"
              >
                <option value="all">All States</option>
                {states.map((state) => (
                  <option key={state} value={state!}>
                    {state}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Year
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full border rounded-md px-2 py-1.5 text-sm"
              >
                <option value="all">All Years</option>
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Month
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full border rounded-md px-2 py-1.5 text-sm"
              >
                <option value="all">All Months</option>
                {months.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full border rounded-md px-2 py-1.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full border rounded-md px-2 py-1.5 text-sm"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={resetFilters}
                className="w-full px-3 py-1.5 text-sm text-white bg-gray-600 hover:bg-gray-700 rounded-md"
              >
                Reset All
              </button>
            </div>
          </div>
        </div>

        {/* Map and Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 mb-4">
          <div className="lg:col-span-2 bg-white rounded-lg shadow overflow-hidden h-[350px] sm:h-[400px] lg:h-[500px]">
            <DashboardMaps
              incidents={filteredIncidents}
              selectedIncident={selectedIncident}
              onSelectIncident={setSelectedIncident}
            />
          </div>
          <div className="space-y-4">
            <ActionTypeChart incidents={filteredIncidents} />
          </div>
        </div>

        {/* Timeline Player - Below Map */}
        <div className="mb-6 w-full lg:w-2/3">
          <TimelinePlayer
            incidents={baseFilteredIncidents}
            onDateChange={setTimelineDate}
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <IncidentsOverTime incidents={filteredIncidents} />
          <StateBreakdownChart incidents={filteredIncidents} />
          <DemographicsChart
            demographics={filteredDemographics}
            type="race"
            title="Race/Ethnicity"
          />
        </div>
      </div>
    </div>
  );
}
