export default async function handler(req, res) {
    if (req.method === 'POST') {
      const url = 'https://dev-t0o26rre86m7t8lo.us.auth0.com/oauth/token';
  
      const body = {
        client_id: process.env.AUTH0_CLIENT_ID,
        client_secret: process.env.AUTH0_CLIENT_SECRET,
        audience: 'https://dev-t0o26rre86m7t8lo.us.auth0.com/api/v2/',
        grant_type: 'client_credentials',
      };
  
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          return res.status(response.status).json({ error: errorData });
        }
  
        const data = await response.json();
        return res.status(200).json({ accessToken: data.access_token });
      } catch (error) {
        return res.status(500).json({ error: 'Internal Server Error' });
      }
    } else {
      res.setHeader('Allow', ['POST']);
      res.status(405).end('Method Not Allowed');
    }
  }
  