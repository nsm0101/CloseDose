# cappy-web (Vite + Vanilla JS + Supabase Auth)

This bundle contains a minimal multi-page Vite setup that supports:
- `/cappy/login/` (email magic link)
- `/cappy/app/` (authenticated landing page)
- `/cappy/scan/?token=...` (auth-gated scan page)
- `/cappy/firebase/` (Firebase functional prototype: accounts + families + real-time individuals + NFC tap simulation)

## Local dev
1. Copy env file:
   - `cp .env.example .env`
2. Fill in Supabase vars (existing pages):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Fill in Firebase vars (prototype page):
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_APP_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET` (optional)
   - `VITE_FIREBASE_MESSAGING_SENDER_ID` (optional)
4. Run:
   - `npm install`
   - `npm run dev`

## Firebase prototype quickstart
Open `/cappy/firebase/` and:
1. Create account or sign in.
2. Create a family (generates invite code) or join with invite code.
3. Add family individuals and verify they sync in real-time across clients.
4. Map NFC tag IDs to individuals.
5. Simulate a tap to update the linked profile and append an event.

> Important: This is a functional prototype path and does not replace current Supabase pages yet.

## Firestore security rules (minimum starter)
Use these rules to enforce family-scoped access while prototyping:

```rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function signedIn() {
      return request.auth != null;
    }

    function familyMember(familyId) {
      return signedIn() &&
        exists(/databases/$(database)/documents/families/$(familyId)/members/$(request.auth.uid));
    }

    function familyManager(familyId) {
      return familyMember(familyId) &&
        get(/databases/$(database)/documents/families/$(familyId)/members/$(request.auth.uid)).data.role in ['owner', 'admin'];
    }

    match /families/{familyId} {
      allow read: if familyMember(familyId);
      allow create: if signedIn();
      allow update, delete: if familyManager(familyId);

      match /members/{uid} {
        allow read: if familyMember(familyId);
        allow create: if familyManager(familyId) || request.auth.uid == uid;
        allow update, delete: if familyManager(familyId);
      }

      match /individuals/{individualId} {
        allow read: if familyMember(familyId);
        allow create, update, delete: if familyMember(familyId);
      }

      match /nfcTags/{tagId} {
        allow read: if familyMember(familyId);
        allow create, update, delete: if familyManager(familyId);
      }

      match /events/{eventId} {
        allow read: if familyMember(familyId);
        allow create: if familyMember(familyId);
      }
    }
  }
}
```

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
  - Firebase variables for prototype page (`VITE_FIREBASE_*`)

Then push to `main` and GitHub Actions will deploy to the `gh-pages` branch.

## Supabase settings (required for existing pages)
In Supabase Dashboard:
Authentication → URL configuration:
- Site URL: `https://closedose.com`
- Redirect URLs:
  - `https://closedose.com/cappy/login/`
  - `https://closedose.com/cappy/app/`
  - `https://closedose.com/cappy/scan/`
