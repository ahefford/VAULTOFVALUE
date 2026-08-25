# The Vault of Value

A personal networking app for working an event: scan or type in a badge, sort
the person into a deal, a referral or a contact, and it lands in your book
before you shake the next hand. Everything is stored on-device — nothing is
sent anywhere unless you add your own Anthropic API key for the concierge.

## Features

- **Book** — your contacts, searchable, viewable as a flat ledger, grouped by
  bucket (deal/referral/contact), or filtered to just today.
- **Scan** — a fast manual add form, plus live camera QR scanning (via the
  browser's `BarcodeDetector`) that prefills a badge's vCard/JSON/email data
  when the badge has a QR code.
- **Pipeline** — deals grouped by stage (New → Qualified → Proposal → Won)
  with one-tap advance.
- **Rooms** — an editable agenda; mark which session you're in so your book
  and the concierge both know.
- **Daily** — editable goals with counters and progress bars, open
  follow-ups with due labels.
- **Me** — your profile with a real, scannable QR vCard, editable outreach
  channels, CSV export of your whole book, and settings.
- **Ask** — a concierge that answers from your own agenda/book/uploads fully
  offline; optionally add an Anthropic API key (stored only on-device) for
  open-ended answers via Claude.
- Installable as a PWA (works offline, add to your phone's home screen).

## Development

```bash
npm install
npm run dev
```

This is a Vite multi-page project: the dev server serves Vault of Value at
`/` and [Crowd Control](#crowd-control-zonecall) at `/crowd/`.

## Build

```bash
npm run build
npm run preview
```

One build produces both apps' bundles into `dist/` (`dist/index.html` and
`dist/crowd/index.html`).

## Deploy

Pushing to `main` builds and publishes to GitHub Pages via
`.github/workflows/deploy.yml`. Enable it once under repo Settings → Pages →
Source → GitHub Actions, then Vault of Value is live at
`https://<owner>.github.io/VAULTOFVALUE/` and Crowd Control at
`https://<owner>.github.io/VAULTOFVALUE/crowd/`.

---

# Crowd Control (Zonecall)

A separate app in this same repo, at `/crowd/`, for coordinating event floor
staff in real time: everyone's zone status, a captain's live headcount and
broadcasts, an incident/escalation flow, and radio-style team chat — all
synced across phones. Unlike Vault of Value, this one needs a live backend
(status has to be visible to *other people's* phones), so it's backed by
Firebase — Firestore for data, and Authentication (email/password) for
real per-person identity, which `crowd/firestore.rules` uses to scope
writes to "yourself" or "the Captain."

## Roles

- **Team member** — confirms in position, requests breaks, sees team duties
  for their zone, reports incidents.
- **Team lead** — sees their zone's live headcount and roster, approves or
  holds break requests, checks in with the Captain.
- **Captain** — sees every zone's status at a glance, broadcasts messages or
  a flashing emergency alert to every phone, and triages open incidents.

Everyone shares Zone/Ops, Map, Team, Radio and Book tabs; what's on the Zone
tab depends on role.

## One-time Firebase setup

The web app config for the `zonecall-83044` Firebase project is already
committed in `.env.production` (a Firebase web config isn't a secret — it
ships in every visitor's JS bundle regardless; real access control is in
`crowd/firestore.rules`, enforced server-side via Firebase Auth). Two
things still need doing once, in the [Firebase console](https://console.firebase.google.com/project/zonecall-83044):

1. **Authentication → Sign-in method → Email/Password** → enable. Every
   team member creates their own account with an email and password —
   there's no admin-provisioned login and no magic links.
2. **Firestore Database → Create database** (production mode is fine, any
   region), then publish `crowd/firestore.rules` to it (Firestore → Rules
   tab, paste the file's contents and publish; or via the Firebase CLI:
   `firebase deploy --only firestore:rules`).

Read `crowd/firestore.rules` for exactly what access it grants. Every
person document's ID is that user's Firebase Auth UID, so rules can and do
check "is this your own document" or "is the requester the Captain" — it's
real per-person access control, not just an open-to-anyone-signed-in gate.

To point this app at a **different** Firebase project (a different event
organization, local development against your own sandbox project, etc.),
copy `.env.example` to a gitignored `.env.local` and fill in that
project's own web config — `.env.local` always wins over `.env.production`.

## Setting up an event

Sign up (email + password) to get in at all. The first person to do so for
a fresh event gets a "set up this event" flow that makes them Captain and
creates three zones (Main Floor, Registration, Exits). Everyone after that
signs up themselves and fills in their name, zone and post — there's no
"add a team member" form because each person's identity has to be their
own real login; the Captain can only reassign zone/role or remove someone
from the Team tab's **Manage Team** panel afterward, not create their
account for them.

To run a new event on the same Firebase project, change `VITE_ZC_EVENT_ID`
in `.env.production` (or a local-only `.env.local` override) to a new slug
— each slug gets its own roster, zones and messages, scoped under
`/events/{eventId}/` in Firestore.
