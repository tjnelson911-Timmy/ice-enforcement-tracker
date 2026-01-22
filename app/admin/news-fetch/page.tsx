'use client';

import { useState } from 'react';
import Link from 'next/link';

interface FetchResult {
  message: string;
  articlesFound?: number;
  incidentsParsed?: number;
  incidentsAdded?: number;
  error?: string;
  details?: string;
}

export default function NewsFetchPage() {
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<FetchResult | null>(null);
  const [savedKey, setSavedKey] = useState(false);

  const handleFetch = async () => {
    if (!apiKey.trim()) {
      setResult({ message: 'Please enter your NewsAPI key', error: 'Missing API key' });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/news/fetch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: apiKey.trim() }),
      });

      const data = await response.json();
      setResult(data);

      if (response.ok && !data.error) {
        // Save API key to localStorage for convenience
        localStorage.setItem('newsapi_key', apiKey.trim());
        setSavedKey(true);
      }
    } catch (error) {
      setResult({
        message: 'Failed to fetch news',
        error: 'Network error',
        details: String(error),
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load saved API key on mount
  useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('newsapi_key');
      if (saved) {
        setApiKey(saved);
        setSavedKey(true);
      }
    }
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/admin" className="text-blue-600 hover:underline text-sm">
            &larr; Back to Admin
          </Link>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Fetch News Articles</h1>
        <p className="text-gray-600 mb-8">
          Automatically fetch ICE enforcement news from major outlets and add to the database.
        </p>

        {/* API Key Setup */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">NewsAPI Configuration</h2>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              NewsAPI Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value);
                setSavedKey(false);
              }}
              placeholder="Enter your NewsAPI key"
              className="w-full border rounded-md px-3 py-2"
            />
            {savedKey && (
              <p className="text-sm text-green-600 mt-1">Key saved locally</p>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
            <h3 className="text-sm font-semibold text-blue-800 mb-2">How to get a NewsAPI key:</h3>
            <ol className="text-sm text-blue-700 list-decimal list-inside space-y-1">
              <li>Go to <a href="https://newsapi.org" target="_blank" rel="noopener noreferrer" className="underline">newsapi.org</a></li>
              <li>Sign up for a free account</li>
              <li>Copy your API key from the dashboard</li>
              <li>Paste it above and click &quot;Fetch News&quot;</li>
            </ol>
            <p className="text-xs text-blue-600 mt-2">
              Free tier: 100 requests/day, articles up to 1 month old
            </p>
          </div>

          <button
            onClick={handleFetch}
            disabled={isLoading || !apiKey.trim()}
            className={`w-full py-3 rounded-md font-medium transition-colors ${
              isLoading || !apiKey.trim()
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Fetching news articles...
              </span>
            ) : (
              'Fetch News'
            )}
          </button>
        </div>

        {/* Results */}
        {result && (
          <div className={`rounded-lg shadow p-6 ${
            result.error ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'
          }`}>
            <h2 className={`text-lg font-semibold mb-4 ${
              result.error ? 'text-red-800' : 'text-green-800'
            }`}>
              {result.error ? 'Error' : 'Success'}
            </h2>

            <p className={result.error ? 'text-red-700' : 'text-green-700'}>
              {result.message}
            </p>

            {!result.error && (
              <div className="mt-4 grid grid-cols-3 gap-4">
                <div className="bg-white rounded-md p-3 text-center">
                  <p className="text-2xl font-bold text-gray-900">{result.articlesFound || 0}</p>
                  <p className="text-xs text-gray-500">Articles Found</p>
                </div>
                <div className="bg-white rounded-md p-3 text-center">
                  <p className="text-2xl font-bold text-gray-900">{result.incidentsParsed || 0}</p>
                  <p className="text-xs text-gray-500">Relevant Incidents</p>
                </div>
                <div className="bg-white rounded-md p-3 text-center">
                  <p className="text-2xl font-bold text-blue-600">{result.incidentsAdded || 0}</p>
                  <p className="text-xs text-gray-500">New Added</p>
                </div>
              </div>
            )}

            {result.details && (
              <p className="mt-4 text-sm text-red-600">{result.details}</p>
            )}
          </div>
        )}

        {/* News Sources */}
        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">News Sources Searched</h2>
          <div className="flex flex-wrap gap-2">
            {['CNN', 'Fox News', 'ABC News', 'CBS News', 'NBC News', 'AP', 'Reuters', 'Washington Post', 'USA Today'].map((source) => (
              <span key={source} className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700">
                {source}
              </span>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-4">
            The system searches for ICE-related keywords like &quot;ICE raid&quot;, &quot;ICE arrests&quot;,
            &quot;immigration enforcement&quot;, and &quot;deportation raid&quot; across these sources.
          </p>
        </div>

        {/* Auto-Update Info */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mt-6">
          <h2 className="text-lg font-semibold text-yellow-800 mb-2">Automatic Updates</h2>
          <p className="text-sm text-yellow-700">
            For continuous automatic updates, set the <code className="bg-yellow-100 px-1 rounded">NEWSAPI_KEY</code> environment
            variable in your deployment. The system will automatically fetch new articles every 6 hours via a cron job.
          </p>
        </div>
      </div>
    </div>
  );
}
