'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function UpdateStatsButton() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; details?: string } | null>(null);
  const router = useRouter();

  const handleUpdate = async () => {
    setIsUpdating(true);
    setResult(null);

    let totalIncidents = 0;
    let totalArticles = 0;
    const errors: string[] = [];

    try {
      // Fetch from Google News
      const googleResponse = await fetch('/api/news/google', { method: 'POST' });
      const googleData = await googleResponse.json();

      if (googleResponse.ok && !googleData.error) {
        totalArticles += googleData.articlesFound || 0;
        totalIncidents += googleData.incidentsAdded || 0;
      } else {
        errors.push(`Google News: ${googleData.error || 'Failed'}`);
      }

      // Fetch from NewsAPI
      const newsapiResponse = await fetch('/api/news/fetch', { method: 'POST' });
      const newsapiData = await newsapiResponse.json();

      if (newsapiResponse.ok && !newsapiData.error) {
        totalArticles += newsapiData.articlesFound || 0;
        totalIncidents += newsapiData.incidentsAdded || 0;
      } else {
        errors.push(`NewsAPI: ${newsapiData.error || 'Failed'}`);
      }

      if (totalIncidents > 0 || errors.length === 0) {
        setResult({
          success: true,
          message: `Found ${totalArticles} articles, added ${totalIncidents} new incidents`,
          details: errors.length > 0 ? errors.join('; ') : undefined,
        });
      } else {
        setResult({
          success: false,
          message: errors.join('; ') || 'Failed to fetch news',
        });
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

            {result && (
              <div className={`mb-4 p-4 rounded-lg ${result.success ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
                <p className={`text-sm ${result.success ? 'text-green-700' : 'text-yellow-700'}`}>
                  {result.message}
                </p>
                {result.details && (
                  <p className="text-xs text-gray-500 mt-1">{result.details}</p>
                )}
              </div>
            )}

            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Sources:</h4>
              <div className="flex flex-wrap gap-1">
                {['Google News', 'NewsAPI', 'CNN', 'Fox', 'ABC', 'CBS', 'NBC', 'AP', 'Reuters'].map((s) => (
                  <span key={s} className="px-2 py-0.5 bg-white rounded text-xs text-gray-600 border">
                    {s}
                  </span>
                ))}
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
          </div>
        </div>
      )}
    </>
  );
}
