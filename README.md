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
Firebase (Firestore + Anonymous Auth) rather than being fully on-device.

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

1. In the [Firebase console](https://console.firebase.google.com/), open (or
   create) the project this event uses.
2. **Project settings → General → Your apps → Add app → Web** (skip
   Hosting). Copy the `firebaseConfig` values into `.env.local` at the repo
   root — see `.env.example` for the exact variable names.
3. **Authentication → Sign-in method → Anonymous** → enable. Every device
   that opens the app signs in anonymously; there's no email/password.
4. **Firestore Database → Create database** (production mode is fine).
5. Publish `crowd/firestore.rules` to that database (Firebase console →
   Firestore → Rules, paste the file's contents and publish; or via the
   Firebase CLI: `firebase deploy --only firestore:rules`).

Read `crowd/firestore.rules` for exactly what access it grants — in short,
any device that has loaded the app can read/write any data for that event.
That's a deliberate tradeoff for a small trusted team with no backend of its
own; it is not per-person access control.

## Setting up an event

The first person to open the app with no zones yet configured gets a
"set up this event" flow that makes them Captain and creates three zones
(Main Floor, Registration, Exits). From there the Captain can add team
members, promote leads, and add more zones from the Team tab's **Manage
Team** panel. Everyone else picks their name (or adds themselves) the first
time they open the app; that choice is remembered on their device via
`localStorage`, not tied to any login.

To run a new event, change `VITE_ZC_EVENT_ID` in `.env.local` to a new slug
— each slug gets its own roster, zones and messages, scoped under
`/events/{eventId}/` in Firestore.
