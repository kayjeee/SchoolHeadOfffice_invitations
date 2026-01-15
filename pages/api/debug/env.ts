// pages/api/debug/env.ts
import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({
    nodeEnv: process.env.NODE_ENV,
    apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
    railsApiBase: process.env.RAILS_API_BASE_URL,
    vercelUrl: process.env.VERCEL_URL,
    allEnvKeys: Object.keys(process.env).filter(key =>
      key.includes('API') || key.includes('URL') || key === 'NODE_ENV'
    )
  });
}
