import { initAuth0 } from '@auth0/nextjs-auth0';

export default initAuth0({
  secret: process.env.AUTH0_SECRET,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
  baseURL: process.env.AUTH0_BASE_URL,
  clientID: process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
  routes: {
    callback: process.env.AUTH0_REDIRECT_URI || '/api/auth/callback',
    postLogoutRedirect: process.env.NEXTAUTH_URL || process.env.AUTH0_BASE_URL
  },
  session: {
    cookie: {
      domain: process.env.NODE_ENV === 'production' ? '.schoolheadoffice.com' : undefined,
      path: '/',
      transient: false,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    }
  }
});