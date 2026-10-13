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

## Keeping it honest

The Privacy Policy was written from Ovora's actual behaviour, not from a template — the anonymous
Firebase auth, the end-to-end encrypted Firestore mirror, RevenueCat, the Gemini Coach calls, and
what "Delete everything" now removes. If the app's data handling changes, change this too: a policy
that disagrees with the App Store privacy label is its own rejection.
