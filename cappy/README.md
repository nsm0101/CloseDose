# cappy-web (Vite + Vanilla JS + Supabase Auth)

This bundle contains a minimal multi-page Vite setup that supports:
- `/cappy/login/` (email magic link)
- `/cappy/app/` (authenticated landing page)
- `/cappy/scan/?token=...` (auth-gated scan page)

## Local dev
1. Copy env file:
   - `cp .env.example .env`
2. Fill in:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Run:
   - `npm install`
   - `npm run dev`

## Production (GitHub Pages)
This project assumes your site is hosted at:
- https://closedose.com/cappy/

Vite is configured with:
- `base: "/cappy/"`

Deploy workflow:
- `.github/workflows/deploy.yml`
- Set repo secrets:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`

Then push to `main` and GitHub Actions will deploy to the `gh-pages` branch.

## Supabase settings (required)
In Supabase Dashboard:
Authentication → URL configuration:
- Site URL: `https://closedose.com`
- Redirect URLs:
  - `https://closedose.com/cappy/login/`
  - `https://closedose.com/cappy/app/`
  - `https://closedose.com/cappy/scan/`
