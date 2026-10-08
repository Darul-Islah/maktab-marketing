# Maktab marketing website

A standalone, single-page website for Islamic school administrators. Plain HTML, CSS, and JavaScript; no runtime dependencies, bundler, API, or database.

## Run locally

From this directory, run `node preview.cjs` and open http://127.0.0.1:4175.

## GitHub Pages

The public website is hosted at https://darul-islah.github.io/maktab-marketing/. GitHub Pages publishes the root of the `gh-pages` branch, which contains only `public` assets.

After changing the website, commit the changes on `main`, run `git subtree split --prefix=public -b pages-update`, then `git push origin pages-update:gh-pages` and `git branch -D pages-update`. GitHub rebuilds the site automatically. Asset URLs are relative so the project URL works correctly.

## Optional Render deployment

Create a Static Site from this repository, branch `main`, build command `echo "Static site ready"`, publish directory `public`. Render provides the independent HTTPS URL. No environment variables are required.

Alternatively, use the included `render.yaml` Blueprint in the Luminary AI Solutions workspace. Keep this repository private and grant Render access to this repository if prompted.

## Validation

Site revision `501dcd52960a4b10333cb241da5d73210ef908dd` passed local Chromium checks for tabs and keyboard navigation, FAQ disclosures, image and privacy dialogs, Escape dismissal, email draft feedback, theme switching, mobile navigation, image loading, and internal anchors. No JavaScript or HTTP errors were observed. Layout checks passed at widths 320, 390, 768, 1024, and 1440 pixels. Axe-core WCAG 2 A/AA and 2.1 AA checks reported zero violations in light and dark themes. JavaScript syntax and Git whitespace checks passed.

The same browser interaction and responsive checks passed after adapting assets for GitHub Pages. Render deployment was superseded by the user's request to host on GitHub.

## Contact

The interest form prepares a `mailto:` draft to `abdullah.siddiki@darulislah.org`. Visitors review and send the message in their email application. It does not pretend to submit an inquiry or store leads. Direct email is always available.

## Assets and design

The user supplied the emerald Maktab logo and Stitch HTML/design references. Product images are real captures from the local Maktab app with synthetic QA school data. No production records or authentication material are shipped. Inter is locally hosted; its license is in `public/assets/OFL.txt`.

The original designer mockup was reworked for readable product evidence, working anchor navigation, accessible tabs/dialogs/FAQs, responsive layouts, dark mode, and accurate product claims. Demo screenshots are explicitly labeled.

App source reference: frontend `a939d28d3ce65eaa436bc81e8d16db01c254e4df` with local working changes (refreshed look and logo, captured 2026-10-08 with the React Query devtools button hidden). This site does not alter the application or depend on its availability.
