# Ovora — legal pages

The public legal and support pages for Ovora. The canonical website is
https://ovora.help/ (served by Vercel).
The previous hosting addresses are superseded.

**This repo is public on purpose and contains no app source.** Ovora itself lives in a private
repository; only public legal/support information is here, because Apple and Google require a publicly
reachable privacy policy URL and reviewers click it.

- `privacy.html` — Privacy Policy
- `terms.html` — Terms of Use, including section 9, the Apple App Store terms Apple requires of a custom EULA
- `support.html` — technical help and public support contact
- `index.html` — legal and support home
- `.nojekyll` — serve the files as-is, no Jekyll build
- `favicon.png` and `apple-touch-icon.png` — existing Ovora rose mark, sized for browsers and saved home-screen links

## Before submitting to the App Store

The published pages once carried pink placeholder boxes. Both are now filled in:

1. ~~contact email~~ — done: hi@ovora.help, on all pages
2. ~~governing jurisdiction~~ — done: England and Wales, with consumers keeping their home-country
   protections and courts

## Store and app URLs

- Legal home: https://ovora.help/
- Privacy: https://ovora.help/privacy.html
- Terms: https://ovora.help/terms.html
- Support: https://ovora.help/support.html
- Contact: hi@ovora.help

Use these addresses in both Android and iOS and their store listings. Relative navigation links
keep previews portable; canonical tags identify the production domain.

Edit the HTML directly. Publishing a Git commit alone does not confirm the production site has
deployed. Verify the hosted HTML, contact links and browser icons after deployment. The app uses
the `.html` addresses: extensionless `/privacy` and `/terms` returned 404 when checked on
13 October 2026.

## Support email

The public support address is `hi@ovora.help`. Its MX record routes incoming mail to Resend in
Ireland. Read incoming messages in the **Tabscan Resend account → Emails → Receiving**. Domain
verification, sending authentication and receiving are configured independently from web hosting.

`POST /api/mail-notify` accepts signed Resend `email.received` events for `@ovora.help` and sends
the configured owner a fixed notification with a private Resend dashboard link. It ignores other
projects' mail. It does not fetch, copy or act on the incoming subject, body or attachments.
Signature/timestamp verification uses the official Resend SDK; retries use an email-specific
idempotency key (Resend's deduplication window is 24 hours). Sending failures return 503 so the
provider can retry. The existing static pages retain their URLs and layout.

Set these **production-only Secret** environment variables in the Vercel `ovora-legal` project:

- `OVORA_MAIL_RESEND_API_KEY`: sending-only key restricted to `ovora.help`.
- `OVORA_MAIL_WEBHOOK_SECRET`: signing secret for this webhook, not the existing Tabscan webhook.
- `OVORA_MAIL_NOTIFY_TO`: the owner's notification address. Keep its value out of this public repo.

Register `https://ovora.help/api/mail-notify` in Resend for **only** `email.received`, and redeploy
after changing Vercel variables. Never place credentials in HTML, source control or notification URLs.
Rotate them independently of other projects. Run `pnpm install --frozen-lockfile` and `pnpm test`
before deploying changes to the handler.

The account stays on Resend Free with paid overages disabled. Incoming mail and outgoing alerts
both use its shared allowance (100 emails/day and 3,000/month when configured on 16 October 2026).
One received message plus its alert uses two emails; other projects use that same allowance. Above
the free limits, delivery/alerts can stop or be delayed; this setup does not enable an upgrade.
There is no additional Vercel plan or email subscription. A mail provider is still required even
though this repository hosts the public support pages.

## Keeping it honest

The Privacy Policy was written from Ovora's actual behaviour, not from a template — the anonymous
Firebase auth, the end-to-end encrypted Firestore mirror, RevenueCat, the Gemini Coach calls, and
what "Delete everything" now removes. If the app's data handling changes, change this too: a policy
that disagrees with the App Store privacy label is its own rejection.
