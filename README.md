# Ovora — legal pages

The public legal and support pages for Ovora. The canonical website is
https://ovora-legal.goldfiverr91.workers.dev/ (Cloudflare Workers).

**This repo is public on purpose and contains no app source.** Ovora itself lives in a private
repository; only public legal/support information is here, because Apple and Google require a publicly
reachable privacy policy URL and reviewers click it.

- `privacy.html` — Privacy Policy
- `terms.html` — Terms of Use
- `support.html` — technical help and public support contact
- `index.html` — legal and support home
- `.nojekyll` — serve the files as-is, no Jekyll build

## Before submitting to the App Store

The published pages once carried pink placeholder boxes. Both are now filled in:

1. ~~contact email~~ — done: hi@ovora.app, on both pages
2. ~~governing jurisdiction~~ — done: England and Wales, with consumers keeping their home-country
   protections and courts

## Store and app URLs

- Legal home: https://ovora-legal.goldfiverr91.workers.dev/
- Privacy: https://ovora-legal.goldfiverr91.workers.dev/privacy.html
- Terms: https://ovora-legal.goldfiverr91.workers.dev/terms.html
- Support: https://ovora-legal.goldfiverr91.workers.dev/support.html

Use these addresses in both Android and iOS and their store listings. Relative navigation links
keep previews portable; canonical tags identify the production Cloudflare URL.

Edit the HTML directly. This repository has no Cloudflare deployment workflow/configuration;
publishing a Git commit does not confirm the Workers site has deployed. Deploy through the
configured Cloudflare integration, then verify all four URLs before changing store metadata.

## Keeping it honest

The Privacy Policy was written from Ovora's actual behaviour, not from a template — the anonymous
Firebase auth, the end-to-end encrypted Firestore mirror, RevenueCat, the Gemini Coach calls, and
what "Delete everything" now removes. If the app's data handling changes, change this too: a policy
that disagrees with the App Store privacy label is its own rejection.
