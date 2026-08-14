# KaJob — Website Prototype (HTML / CSS / JS)

A static, no-build front-end for KaJob, the location-based piecework
marketplace for Lusaka's informal labour market. Built as a full,
responsive website (sticky navbar, hero section, grids) that scales
from a phone up to a wide desktop screen — not a phone-frame mockup.

## Files
- `login.html` — split-screen layout: emerald brand panel + login form
  (email/password, password visibility toggle, social login placeholders)
- `register.html` — same split layout, with a **Worker / Poster** role
  switch on the form (KaJob is two-sided)
- `home.html` — sticky navbar, hero with stats panel, floating search bar,
  quick-action cards, a "get verified" promo band, category filter chips,
  and a responsive grid of job "ticket" cards (the signature visual — each
  listing looks like a torn ticket stub, since a job post is literally a
  piece of work up for grabs), plus a full footer and mobile nav drawer
- `css/style.css` — shared design tokens and components (mobile-first,
  with breakpoints up to a 1180px desktop container)
- `js/app.js` — shared behaviour: form validation, password toggles, role
  switch, category filtering, mobile drawer, and a mock login/register
  flow using `localStorage`

## How to use it
Just open `login.html` in a browser — no server or build step required.
Registering or logging in (any valid-looking email/password) redirects to
`home.html` and greets you by name. Resize the window to see the layout
adapt from mobile through to full desktop width.

## Design notes
- Palette: deep emerald (`#0B6E4F`) for trust, marigold (`#F2A93B`) as the
  "job is live" accent, warm paper background instead of app-gray — a nod to
  Lusaka market colour rather than a generic transit-app green.
- Type: Fraunces (display) + Inter (body) via Google Fonts CDN.
- All icons are inline SVG — no icon-font or image dependencies.
- To wire this up to KaJob's Django REST backend, replace the `localStorage`
  calls in `js/app.js` with real `fetch()` calls to your auth and jobs endpoints.
