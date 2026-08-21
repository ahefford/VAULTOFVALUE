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

## Build

```bash
npm run build
npm run preview
```

## Deploy

Pushing to `main` builds and publishes to GitHub Pages via
`.github/workflows/deploy.yml`. Enable it once under repo Settings → Pages →
Source → GitHub Actions, then the site is live at
`https://<owner>.github.io/VAULTOFVALUE/`.
