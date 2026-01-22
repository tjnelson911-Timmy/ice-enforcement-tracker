'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function UpdateStatsButton() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; count?: number } | null>(null);
  const [source, setSource] = useState<'google' | 'newsapi'>('google');
  const router = useRouter();

  const handleUpdate = async () => {
    setIsUpdating(true);
    setResult(null);

    try {
      if (source === 'google') {
        // Use Google News (no API key required)
        const response = await fetch('/api/news/google', {
          method: 'POST',
        });

        const data = await response.json();

        if (response.ok && !data.error) {
          setResult({
            success: true,
            message: `Found ${data.articlesFound} articles, added ${data.incidentsAdded} new incidents`,
            count: data.incidentsAdded,
          });
        } else {
          setResult({
            success: false,
            message: data.error || 'Failed to fetch news',
          });
        }
      } else {
        // Use NewsAPI (requires API key)
        const apiKey = localStorage.getItem('newsapi_key');

        if (apiKey) {
          const response = await fetch('/api/news/fetch', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ apiKey }),
          });

          const data = await response.json();

          if (response.ok && !data.error) {
            setResult({
              success: true,
              message: `Found ${data.articlesFound} articles, added ${data.incidentsAdded} new incidents`,
              count: data.incidentsAdded,
            });
          } else {
            setResult({
              success: false,
              message: data.error || 'Failed to fetch news',
            });
          }
        } else {
          setResult({
            success: false,
            message: 'No API key configured. Visit Admin > Fetch News to set up.',
          });
        }
      }

      // Refresh the page data
      router.refresh();
    } catch (error) {
      setResult({
        success: false,
        message: 'Network error occurred',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Update Statistics
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Update Statistics</h3>
                <p className="text-sm text-gray-500">Search news sources for new incidents</p>
              </div>
            </div>

            {/* Source Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Source:</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setSource('google')}
                  className={`p-3 rounded-lg border-2 text-left transition-all ${
                    source === 'google'
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">🔍</span>
                    <span className="font-semibold text-gray-900">Google News</span>
                  </div>
                  <p className="text-xs text-gray-500">No API key needed. Searches all news sources including local stations.</p>
                </button>
                <button
                  onClick={() => setSource('newsapi')}
                  className={`p-3 rounded-lg border-2 text-left transition-all ${
                    source === 'newsapi'
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">📰</span>
                    <span className="font-semibold text-gray-900">NewsAPI</span>
                  </div>
                  <p className="text-xs text-gray-500">Requires API key. Major national outlets only.</p>
                </button>
              </div>
            </div>

            {result && (
              <div className={`mb-4 p-4 rounded-lg ${result.success ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
                <p className={`text-sm ${result.success ? 'text-green-700' : 'text-yellow-700'}`}>
                  {result.message}
                </p>
                {result.success && result.count !== undefined && result.count > 0 && (
                  <p className="text-sm font-semibold text-green-800 mt-1">
                    +{result.count} new incidents added!
                  </p>
                )}
              </div>
            )}

            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">
                {source === 'google' ? 'Google News searches:' : 'NewsAPI sources:'}
              </h4>
              <div className="flex flex-wrap gap-1">
                {source === 'google' ? (
                  ['All Local News', 'National Media', 'Regional Papers', 'TV Stations', 'Online News'].map((s) => (
                    <span key={s} className="px-2 py-0.5 bg-white rounded text-xs text-gray-600 border">
                      {s}
                    </span>
                  ))
                ) : (
                  ['CNN', 'Fox News', 'ABC', 'CBS', 'NBC', 'AP', 'Reuters', 'WaPo'].map((s) => (
                    <span key={s} className="px-2 py-0.5 bg-white rounded text-xs text-gray-600 border">
                      {s}
                    </span>
                  ))
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setResult(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              <button
                onClick={handleUpdate}
                disabled={isUpdating}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                  isUpdating
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {isUpdating ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Searching...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Search Now
                  </>
                )}
              </button>
            </div>

            {source === 'newsapi' && (
              <p className="text-xs text-gray-400 mt-3 text-center">
                No API key? <a href="/admin/news-fetch" className="text-blue-500 hover:underline">Configure in Admin</a>
              </p>
            )}
            {source === 'google' && (
              <p className="text-xs text-gray-400 mt-3 text-center">
                Google News provides broader coverage including local stations
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
