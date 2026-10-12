# Maktab marketing website

A standalone, single-page website for Islamic school administrators. Plain HTML, CSS, and JavaScript; no runtime dependencies, bundler, API, or database.

## Run locally

From this directory, run `node preview.cjs` and open http://127.0.0.1:4175.

## Hosting

The website is served by Cloudflare Workers static assets at https://maktab-marketing.luminarysolutions.ai (configured in `wrangler.jsonc`; `/features` serves `features.html`, unknown paths get `404.html`). Deploy from this directory after `npx wrangler@4.140.0 login`:

```bash
npx wrangler@4.140.0 deploy
```

The custom domain is attached by the `routes` entry on deploy. `public/_headers` sets security and cache headers. The old GitHub Pages copy at https://darul-islah.github.io/maktab-marketing/ is superseded.

## Pages

- `index.html`: the landing page.
- `features.html`: every feature area with real staging screens (captured 2026-10-12, demo school data), each claim checked against the marketing briefs in the Maktab repository (`docs/marketing/01`–`09`).

## Validation

Site revision `501dcd52960a4b10333cb241da5d73210ef908dd` passed local Chromium checks for tabs and keyboard navigation, FAQ disclosures, image and privacy dialogs, Escape dismissal, email draft feedback, theme switching, mobile navigation, image loading, and internal anchors. No JavaScript or HTTP errors were observed. Layout checks passed at widths 320, 390, 768, 1024, and 1440 pixels. Axe-core WCAG 2 A/AA and 2.1 AA checks reported zero violations in light and dark themes. JavaScript syntax and Git whitespace checks passed.

The same browser interaction and responsive checks passed after adapting assets for GitHub Pages. Render deployment was superseded by the user's request to host on GitHub.

## Contact

The interest form prepares a `mailto:` draft to `abdullah.siddiki@darulislah.org`. Visitors review and send the message in their email application. It does not pretend to submit an inquiry or store leads. Direct email is always available.

## Assets and design

The user supplied the emerald Maktab logo and Stitch HTML/design references. Product images are real captures from the local Maktab app with synthetic QA school data. No production records or authentication material are shipped. Inter is locally hosted; its license is in `public/assets/OFL.txt`.

The original designer mockup was reworked for readable product evidence, working anchor navigation, accessible tabs/dialogs/FAQs, responsive layouts, dark mode, and accurate product claims. Demo screenshots are explicitly labeled.

App source reference: frontend `a939d28d3ce65eaa436bc81e8d16db01c254e4df` with local working changes (refreshed look and logo, captured 2026-10-08 with the React Query devtools button hidden). This site does not alter the application or depend on its availability.
