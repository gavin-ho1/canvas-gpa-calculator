# Canvas GPA Calculator — website

Marketing site for the [Canvas GPA Calculator](https://github.com/gavin-ho1/canvas-gpa-calculator) browser extension: `index.html`, `about.html`, `install.html`, plus a live product demo under `demo/`.

## What changed in this redesign

### Visual redesign
- Replaced the old hidden-sidebar navigation with a standard sticky top navbar (Home / About / Install / GitHub + a "Get the Extension" CTA), with a proper mobile hamburger menu.
- Removed dark mode entirely, including the dark-mode glow/text-shadow effect that was applied to nearly every element — it read as gimmicky rather than professional. Single light theme now.
- New hero section: badge, gradient-accented headline, stat cards, feature cards with icon tiles (hover lift), and a gradient CTA banner before the footer.
- `about.html` / `install.html` restyled to match (page header + card layout instead of the old sidebar page).
- Fixed a missing `<!DOCTYPE html>` on `about.html`, bumped the footer copyright year, tightened copy (e.g. "sleek Chrome extension" → "sleek browser extension" since it also ships for Firefox/Edge).

### Install flow
- `install.html` and the homepage hero both **detect the visitor's browser** (`navigator.userAgent`) and lead with a single "Add to \<Browser\>" button pointing straight at the right store listing, instead of showing all three download buttons at once. The other two browsers are demoted into a secondary "Other Browsers" / "Other browsers" list.
- Supports Chrome, Firefox, and Edge detection (`script.js` / inline script in `index.html`).

### `demo/` — a live, faithful product demo
Two standalone pages, not (currently) linked from the main nav, plus an embed of the first one on the homepage:

- **`demo/animation.html`** — a scripted, looping walkthrough: a cursor glides to the toolbar extension icon, opens the popup, flips "Enable Extension," and the grade appears on the Canvas page — fully automatic, no user interaction required.
- **`demo/interactive.html`** — the same setup, but the visitor clicks the icon and flips the toggle themselves.
- **`demo/popup/`** — the **real, unmodified** `options.html` / `options.css` / `options.js` copied verbatim from `extension/menus/` in the main repo (not a mockup). `storage-shim.js` stands in for `browser.storage` / `browser.tabs` so the real popup code runs outside an actual extension context; it also blocks all link clicks inside the popup (the real popup has hrefs to GitHub/store review pages that would otherwise navigate away from or break the embedded demo).
- **`demo/canvas/canvas-page.html`** — a real captured Canvas grades page (sanitized of any real student data), sourced from `canvas-gpa-calculator-promo/sources/`. The demo performs the exact same DOM mutation the extension's `content.js` content script performs (hide `#student-grades-final`, inject `#gpa-grades-display` with `Total: 91.67% (A-)`) directly against this real markup — not a redrawn approximation.
- An `.iframe-shield` transparent overlay sits over the Canvas iframe in both demo pages so none of its links/dropdowns/buttons are reachable (the page is a static snapshot — none of its links resolve, and clicking them used to 404).
- Both demo pages detect the visitor's OS (`navigator.userAgentData` / `navigator.platform`) and render the matching window chrome: macOS traffic lights (left) or Windows/Linux caption buttons (right).
- `demo/interactive.html` closes its popup on any outside click, matching real extension-popup behavior.

### Homepage embed ("See it in action")
- `index.html` embeds `demo/animation.html?embed=1` (an `embed` mode that hides the demo page's own header/footer) inside a card between "Key features" and the closing CTA banner.
- The embedded iframe is always rendered at its real desktop width (1560px — the width Canvas's own responsive CSS needs to avoid collapsing the grades sidebar) and then **visually scaled down** with `transform: scale()` to fit the homepage card, so the full grades page (including the sidebar) is always visible, never cropped, and stays correct on resize.

## Structure

```
index.html          Home — hero, features, live demo embed, CTA
about.html           About — what it is / how it works / safety
install.html          Install — browser-detected primary download + all options
styles.css              Shared stylesheet for the three pages above
script.js                 Shared JS: nav, browser detection, metrics counters, scroll-to-top
demo/
  animation.html       Autoplaying demo (real popup + real Canvas page)
  interactive.html     Same, but user-driven
  canvas/
    canvas-page.html      Real captured Canvas grades page
  popup/
    options.html            Real extension popup markup (copied from extension/menus/)
    options.css               Real extension popup styles (copied)
    options.js                  Real extension popup logic (copied, unmodified)
    storage-shim.js           Demo-only stand-in for browser.storage/browser.tabs
```

## Local preview

```
python3 -m http.server 8934
```

Then open `http://localhost:8934/index.html`.
