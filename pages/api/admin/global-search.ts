import { getSession } from '@auth0/nextjs-auth0';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handleGlobalSearch(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await getSession(req, res);

    if (!session) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const internalApiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:4000/api/v1';
    const { schoolId, q } = req.query;

    const response = await fetch(`${internalApiUrl}/schools/${schoolId}/global_search?q=${encodeURIComponent(q as string)}`, {
      headers: {
        'Authorization': `Bearer ${session.accessToken || ''}`,
        'Accept': 'application/json',
      },
    });

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      res.status(response.status).json(data);
    } else {
      const text = await response.text();
      console.error(`🔥 Upstream HTML Error [GET /api/admin/global-search]:`, text);
      res.status(response.status).json({
        success: false,
        error: `Upstream server returned ${response.status}`,
        details: text.substring(0, 500)
      });
    }
  } catch (error: any) {
    console.error('❌ Local Proxy Error [GET /api/admin/global-search]:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}
