# Auth & Networking Recovery Terminal Commands

To recover the authenticated state and stable networking configuration from the stable dashboard branch while preserving your new UI work, run the following commands:

```bash
# 1. Bring over the core stable configuration files from the dashboard shell branch
git checkout feat/admin-dashboard-shell-15941626097990010856 -- next.config.mjs lib/api/api-client.ts

# 2. Unify local networking to use 127.0.0.1 (preferred for WSL stability)
sed -i 's/localhost:4000/127.0.0.1:4000/g' pages/api/admin/*.ts lib/api/api-client.ts next.config.mjs

# 3. Verify Auth0 secret alignment in .env.local (Manual Check Required)
# Ensure the following keys match the backend exactly:
# AUTH0_SECRET, AUTH0_BASE_URL, AUTH0_ISSUER_BASE_URL, AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET
```

### Verification Checklist
- [ ] **Next.js API Proxy:** Check `pages/api/admin/*.ts` files to ensure they use `getSession(req, res)` and forward the `accessToken` to the backend.
- [ ] **Rewrites:** Ensure `next.config.mjs` contains the `/api/:path*` rewrite pointing to `http://127.0.0.1:4000/api/:path*`.
- [ ] **Client Base URL:** Verify `lib/api/api-client.ts` returns `/api/v1` for client-side calls to leverage the rewrite/proxy.
- [ ] **Cookie Persistence:** Ensure browser cookies for Auth0 session are being passed to the Next.js API routes.
