import { initAuth0 } from '@auth0/nextjs-auth0';

const auth0 = initAuth0({
  secret: process.env.AUTH0_SECRET || 'a-very-long-secret-at-least-32-characters-long',
  baseURL: process.env.AUTH0_BASE_URL || 'http://localhost:3000',
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL || 'https://dummy.auth0.com',
  clientID: process.env.AUTH0_CLIENT_ID || 'dummy-client-id',
  clientSecret: process.env.AUTH0_CLIENT_SECRET || 'dummy-client-secret',
});

export const GET = auth0.handleAuth();
export const POST = auth0.handleAuth();
