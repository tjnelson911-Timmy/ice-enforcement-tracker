import { NextResponse } from 'next/server';

// This route is called by Vercel Cron every 5 minutes
// It fetches from both Google News and NewsAPI

export async function GET(request: Request) {
  // Verify cron secret for security (optional)
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3000';

  let googleResult = { articlesFound: 0, incidentsAdded: 0, error: null as string | null };
  let newsapiResult = { articlesFound: 0, incidentsAdded: 0, error: null as string | null };

  try {
    // Fetch from Google News
    const googleResponse = await fetch(`${baseUrl}/api/news/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    const googleData = await googleResponse.json();

    if (googleResponse.ok && !googleData.error) {
      googleResult.articlesFound = googleData.articlesFound || 0;
      googleResult.incidentsAdded = googleData.incidentsAdded || 0;
    } else {
      googleResult.error = googleData.error || 'Failed';
    }
  } catch (error) {
    googleResult.error = String(error);
  }

  try {
    // Fetch from NewsAPI
    const newsapiResponse = await fetch(`${baseUrl}/api/news/fetch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    const newsapiData = await newsapiResponse.json();

    if (newsapiResponse.ok && !newsapiData.error) {
      newsapiResult.articlesFound = newsapiData.articlesFound || 0;
      newsapiResult.incidentsAdded = newsapiData.incidentsAdded || 0;
    } else {
      newsapiResult.error = newsapiData.error || 'Failed';
    }
  } catch (error) {
    newsapiResult.error = String(error);
  }

  const totalArticles = googleResult.articlesFound + newsapiResult.articlesFound;
  const totalIncidents = googleResult.incidentsAdded + newsapiResult.incidentsAdded;

  console.log(`Cron job completed: Found ${totalArticles} articles, added ${totalIncidents} incidents`);

  return NextResponse.json({
    message: 'Cron job completed',
    timestamp: new Date().toISOString(),
    totalArticlesFound: totalArticles,
    totalIncidentsAdded: totalIncidents,
    googleNews: googleResult,
    newsApi: newsapiResult,
  });
}
