'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase/client';
import { INCIDENT_TYPES, IncidentType } from '../../lib/supabase/types';

export default function AddIncidentForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    incident_date: '',
    incident_type: 'Workplace Raid' as IncidentType,
    description: '',
    location_name: '',
    address: '',
    city: '',
    state: '',
    county: '',
    latitude: '',
    longitude: '',
    num_affected: '',
    news_url: '',
    video_url: '',
    source_name: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: insertError } = await supabase.from('incidents').insert({
        incident_date: formData.incident_date,
        incident_type: formData.incident_type,
        description: formData.description || null,
        location_name: formData.location_name || null,
        address: formData.address || null,
        city: formData.city || null,
        state: formData.state || null,
        county: formData.county || null,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        num_affected: formData.num_affected ? parseInt(formData.num_affected, 10) : null,
        news_url: formData.news_url || null,
        video_url: formData.video_url || null,
        source_name: formData.source_name || null,
      });

      if (insertError) throw insertError;

      router.push('/incidents');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg">{error}</div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date *
          </label>
          <input
            type="date"
            name="incident_date"
            value={formData.incident_date}
            onChange={handleChange}
            required
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Incident Type *
          </label>
          <select
            name="incident_type"
            value={formData.incident_type}
            onChange={handleChange}
            required
            className="w-full border rounded-lg px-3 py-2"
          >
            {INCIDENT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={4}
          className="w-full border rounded-lg px-3 py-2"
          placeholder="Describe what happened..."
        />
      </div>

      <div className="border-t pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Location</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location Name
            </label>
            <input
              type="text"
              name="location_name"
              value={formData.location_name}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
              placeholder="e.g., Tyson Foods Plant"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
              placeholder="Street address"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City
            </label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              State
            </label>
            <input
              type="text"
              name="state"
              value={formData.state}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
              placeholder="e.g., CA"
              maxLength={2}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              County
            </label>
            <input
              type="text"
              name="county"
              value={formData.county}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              People Affected
            </label>
            <input
              type="number"
              name="num_affected"
              value={formData.num_affected}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
              min="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Latitude
            </label>
            <input
              type="text"
              name="latitude"
              value={formData.latitude}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
              placeholder="e.g., 34.0522"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Longitude
            </label>
            <input
              type="text"
              name="longitude"
              value={formData.longitude}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
              placeholder="e.g., -118.2437"
            />
          </div>
        </div>
      </div>

      <div className="border-t pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Sources</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              News URL
            </label>
            <input
              type="url"
              name="news_url"
              value={formData.news_url}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
              placeholder="https://..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Video URL
            </label>
            <input
              type="url"
              name="video_url"
              value={formData.video_url}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
              placeholder="YouTube or other video URL"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Source Name
            </label>
            <input
              type="text"
              name="source_name"
              value={formData.source_name}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
              placeholder="e.g., LA Times"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-4 border-t">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 text-gray-600 hover:text-gray-900"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Incident'}
        </button>
      </div>
    </form>
  );
}
