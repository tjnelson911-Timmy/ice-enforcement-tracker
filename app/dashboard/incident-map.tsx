'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Map, { Marker, Popup, Source, Layer, type MapRef } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Incident, INCIDENT_TYPE_COLORS } from '../lib/supabase/types';

interface IncidentMapProps {
  incidents: Incident[];
  selectedIncident: Incident | null;
  onSelectIncident: (incident: Incident | null) => void;
}

export default function IncidentMap({ incidents, selectedIncident, onSelectIncident }: IncidentMapProps) {
  const mapRef = useRef<MapRef>(null);
  const [viewMode, setViewMode] = useState<'markers' | 'heatmap'>('markers');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleMapLoad = useCallback(() => {
    // Zoom out more on mobile so all dots are visible
    if (window.innerWidth < 768 && mapRef.current) {
      mapRef.current.setZoom(2.0);
    }
  }, []);

  const validIncidents = incidents.filter(
    (i) => i.latitude !== null && i.longitude !== null
  );

  const geojsonData = {
    type: 'FeatureCollection' as const,
    features: validIncidents.map((incident) => ({
      type: 'Feature' as const,
      properties: {
        id: incident.id,
        type: incident.incident_type,
        affected: incident.num_affected || 1,
      },
      geometry: {
        type: 'Point' as const,
        coordinates: [incident.longitude!, incident.latitude!],
      },
    })),
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const heatmapLayer: any = {
    id: 'incidents-heat',
    type: 'heatmap',
    paint: {
      'heatmap-weight': ['interpolate', ['linear'], ['get', 'affected'], 0, 0.3, 10, 1, 50, 1.5],
      'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 0, 2, 5, 4, 9, 6],
      'heatmap-color': [
        'interpolate',
        ['linear'],
        ['heatmap-density'],
        0, 'rgba(0,0,0,0)',
        0.1, 'rgba(255,255,0,0.6)',
        0.3, 'rgba(255,200,0,0.8)',
        0.5, 'rgba(255,120,0,0.9)',
        0.7, 'rgba(255,50,0,1)',
        0.9, 'rgba(220,0,0,1)',
        1, 'rgba(180,0,50,1)',
      ],
      'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 8, 5, 25, 9, 45],
      'heatmap-opacity': 0.9,
    },
  };

  const flyToIncident = useCallback((incident: Incident) => {
    if (incident.latitude && incident.longitude && mapRef.current) {
      mapRef.current.flyTo({
        center: [incident.longitude, incident.latitude],
        zoom: 10,
        duration: 1500,
      });
    }
  }, []);

  const handleMarkerClick = (incident: Incident, e: { originalEvent: MouseEvent }) => {
    e.originalEvent.stopPropagation();
    onSelectIncident(incident);
    flyToIncident(incident);
  };

  return (
    <div className="relative h-full w-full" style={{ minHeight: '500px' }}>
      <div className="absolute top-4 left-4 z-10 bg-white rounded-lg shadow-lg p-2 flex gap-2">
        <button
          className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
            viewMode === 'markers'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          onClick={() => setViewMode('markers')}
        >
          Markers
        </button>
        <button
          className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
            viewMode === 'heatmap'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          onClick={() => setViewMode('heatmap')}
        >
          Heatmap
        </button>
      </div>

      <Map
        ref={mapRef}
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
        initialViewState={{
          longitude: -98.5795,
          latitude: 39.8283,
          zoom: 3.5,
        }}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/light-v11"
        onClick={() => onSelectIncident(null)}
        onLoad={handleMapLoad}
      >
        {viewMode === 'heatmap' ? (
          <Source id="incidents" type="geojson" data={geojsonData}>
            <Layer {...heatmapLayer} />
          </Source>
        ) : (
          validIncidents.map((incident) => (
            <Marker
              key={incident.id}
              longitude={incident.longitude!}
              latitude={incident.latitude!}
              anchor="bottom"
              onClick={(e) => handleMarkerClick(incident, e)}
            >
              <div
                className="w-6 h-6 rounded-full border-2 border-white shadow-lg cursor-pointer transform hover:scale-110 transition-transform"
                style={{ backgroundColor: INCIDENT_TYPE_COLORS[incident.incident_type] }}
                title={incident.incident_type}
              />
            </Marker>
          ))
        )}

        {selectedIncident && selectedIncident.latitude && selectedIncident.longitude && (
          <Popup
            longitude={selectedIncident.longitude}
            latitude={selectedIncident.latitude}
            anchor="bottom"
            onClose={() => onSelectIncident(null)}
            closeOnClick={false}
            className="incident-popup"
          >
            <div className="p-2 max-w-xs">
              <h3 className="font-bold text-gray-900">{selectedIncident.incident_type}</h3>
              <p className="text-sm text-gray-600 mt-1">
                {selectedIncident.city}, {selectedIncident.state}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {new Date(selectedIncident.incident_date).toLocaleDateString()}
              </p>
              {selectedIncident.num_affected && (
                <p className="text-sm font-medium text-red-600 mt-1">
                  {selectedIncident.num_affected} people affected
                </p>
              )}
              {selectedIncident.description && (
                <p className="text-xs text-gray-600 mt-2 line-clamp-3">
                  {selectedIncident.description}
                </p>
              )}
              <a
                href={`/incidents/${selectedIncident.id}`}
                className="text-xs text-blue-600 hover:underline mt-2 block"
              >
                View details →
              </a>
            </div>
          </Popup>
        )}
      </Map>

      <div className="absolute bottom-4 left-4 z-10 bg-white rounded-lg shadow-lg p-3">
        <h4 className="text-xs font-semibold text-gray-700 mb-2">Incident Types</h4>
        <div className="grid grid-cols-2 gap-1">
          {Object.entries(INCIDENT_TYPE_COLORS).slice(0, 6).map(([type, color]) => (
            <div key={type} className="flex items-center gap-1">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span className="text-xs text-gray-600">{type}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
