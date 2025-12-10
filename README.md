[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/D1D71M8JMY)

# CloseDose

CloseDose is a simple front-end prototype for a pediatric medication dosing calculator. It is built with plain HTML, CSS and JavaScript and is hosted via GitHub Pages. The project uses a responsive layout and adapts to your device's preferred color scheme.

## Supabase integration

The dashboard uses Supabase Auth and stores family data in `public.families` with membership managed through `public.user_families`. SQL migrations live in [`db/migrations`](db/migrations) and include:

- Schema creation for `families` and `user_families`
- RLS policies to enforce member-only access with admin-only updates
- An AFTER INSERT trigger to auto-add the creator as an admin member
- Supporting indexes for fast membership lookups

To apply migrations against your Supabase instance, install the [Supabase CLI](https://supabase.com/docs/guides/cli) and run:

```bash
supabase db push
```

If you need to backfill missing admin memberships for existing rows created before the trigger existed, run [`db/backfill_create_user_families.sql`](db/backfill_create_user_families.sql) using `supabase db execute` or `psql`.

## Logo Files and License

This repository contains several CloseDose logo files in SVG and PNG formats. The logos are the intellectual property of Nickolas Mancini, MD, MBA and are provided solely for use with the CloseDose project. Redistribution or modification of the logo assets is prohibited without express permission. Please see LOGO_LICENSE.md for the full license.

## iOS wrapper app

A SwiftUI skeleton for shipping the site as a standalone iPhone app lives in [`ios/CloseDoseApp`](ios/CloseDoseApp/README.md). It bundles the existing static site inside a `WKWebView` so the mobile experience mirrors the responsive web version while still letting you expand with native capabilities.
