'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Incident } from '../lib/supabase/types';

interface TimelinePlayerProps {
  incidents: Incident[];
  onDateChange: (date: Date | null) => void;
}

export default function TimelinePlayer({ incidents, onDateChange }: TimelinePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [speed, setSpeed] = useState(500); // Default to 2x speed

  // Start date: September 1, 2025
  const START_DATE = new Date('2025-09-01');

  const sortedDates = useMemo(() => {
    return [...new Set(
      incidents
        .filter((i) => new Date(i.incident_date) >= START_DATE)
        .map((i) => i.incident_date)
        .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
    )];
  }, [incidents]);

  const play = useCallback(() => {
    // Reset to beginning when play is clicked
    setCurrentIndex(0);
    setIsPlaying(true);
    // Immediately set the first date
    if (sortedDates[0]) {
      onDateChange(new Date(sortedDates[0]));
    }
  }, [sortedDates, onDateChange]);

  const pause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const reset = useCallback(() => {
    setIsPlaying(false);
    setCurrentIndex(0);
    onDateChange(null);
  }, [onDateChange]);

  useEffect(() => {
    if (!isPlaying || sortedDates.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        if (prev >= sortedDates.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, speed);

    return () => clearInterval(interval);
  }, [isPlaying, sortedDates.length, speed]);

  // Update parent when playing and index changes
  useEffect(() => {
    if (isPlaying && sortedDates[currentIndex]) {
      onDateChange(new Date(sortedDates[currentIndex]));
    }
  }, [currentIndex, isPlaying]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const index = parseInt(e.target.value, 10);
    setCurrentIndex(index);
    if (sortedDates[index]) {
      onDateChange(new Date(sortedDates[index]));
    }
  };

  if (sortedDates.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-3 text-gray-500 text-center text-sm">
        No incidents to display
      </div>
    );
  }

  const currentDate = sortedDates[currentIndex] || sortedDates[0];
  const incidentsUpToDate = incidents.filter(
    (i) => new Date(i.incident_date) <= new Date(currentDate)
  );

  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg shadow-md p-4 text-white">
      {/* Header Row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-sm font-semibold">Timeline Playback</h3>
        </div>
        <select
          value={speed}
          onChange={(e) => setSpeed(parseInt(e.target.value, 10))}
          className="bg-white/20 border border-white/30 rounded px-2 py-1 text-xs text-white focus:outline-none"
        >
          <option value={2000} className="text-gray-900">0.5x</option>
          <option value={1000} className="text-gray-900">1x</option>
          <option value={500} className="text-gray-900">2x</option>
          <option value={250} className="text-gray-900">4x</option>
        </select>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="bg-white/10 rounded px-2 py-1.5 text-center">
          <p className="text-lg font-bold">{incidentsUpToDate.length}</p>
          <p className="text-[10px] text-blue-200">Incidents</p>
        </div>
        <div className="bg-white/10 rounded px-2 py-1.5 text-center">
          <p className="text-lg font-bold">{new Date(currentDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
          <p className="text-[10px] text-blue-200">Date</p>
        </div>
        <div className="bg-white/10 rounded px-2 py-1.5 text-center">
          <p className="text-lg font-bold">{new Date(currentDate).getFullYear()}</p>
          <p className="text-[10px] text-blue-200">Year</p>
        </div>
      </div>

      {/* Controls Row */}
      <div className="flex items-center gap-2 mb-2">
        <button
          onClick={reset}
          className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          title="Reset"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
        <button
          onClick={isPlaying ? pause : play}
          className="p-2 rounded-full bg-white text-blue-600 hover:bg-blue-50 transition-colors shadow"
        >
          {isPlaying ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>
        <div className="flex-1">
          <input
            type="range"
            min={0}
            max={sortedDates.length - 1}
            value={currentIndex}
            onChange={handleSliderChange}
            className="w-full h-2 bg-white/30 rounded-lg appearance-none cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
              [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow
              [&::-webkit-slider-thumb]:cursor-pointer"
          />
        </div>
      </div>

      {/* Date Range */}
      <div className="flex justify-between text-[10px] text-blue-200">
        <span>{new Date(sortedDates[0]).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
        <span className="font-medium text-white">{Math.round((currentIndex / (sortedDates.length - 1)) * 100) || 0}%</span>
        <span>{new Date(sortedDates[sortedDates.length - 1]).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
      </div>
    </div>
  );
}
