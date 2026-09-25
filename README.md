# Ovora — legal pages

The public Privacy Policy and Terms of Use for the Ovora app, served by GitHub Pages.

**This repo is public on purpose and contains no app source.** Ovora itself lives in a private
repository; only these two documents are here, because Apple and Google both require a publicly
reachable privacy policy URL and reviewers click it.

- `privacy.html` — Privacy Policy
- `terms.html` — Terms of Use
- `index.html` — links to both
- `.nojekyll` — serve the files as-is, no Jekyll build

## Before submitting to the App Store

Three boxes are outlined in pink on the published pages. Each is a placeholder that must be
replaced:

1. ~~contact email~~ — done: hi@ovora.app, on both pages
2. governing jurisdiction — on the Terms page (still outstanding)

Edit the HTML directly (GitHub's web editor is fine); changes are live within a minute.

## Keeping it honest

The Privacy Policy was written from Ovora's actual behaviour, not from a template — the anonymous
Firebase auth, the end-to-end encrypted Firestore mirror, RevenueCat, the Gemini Coach calls, and
what "Delete everything" now removes. If the app's data handling changes, change this too: a policy
that disagrees with the App Store privacy label is its own rejection.
