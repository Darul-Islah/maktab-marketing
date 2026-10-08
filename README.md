# Maktab marketing website

A standalone, single-page website for Islamic school administrators. Plain HTML, CSS, and JavaScript; no runtime dependencies, bundler, API, or database.

## Run locally

From this directory, run `node preview.cjs` and open http://127.0.0.1:4175.

## Deploy to Render

Create a Static Site from this repository, branch `main`, build command `echo "Static site ready"`, publish directory `public`. Render provides the independent HTTPS URL. No environment variables are required.

Alternatively, use the included `render.yaml` Blueprint in the Luminary AI Solutions workspace. Keep this repository private and grant Render access to this repository if prompted.

## Validation

Site revision `501dcd52960a4b10333cb241da5d73210ef908dd` passed local Chromium checks for tabs and keyboard navigation, FAQ disclosures, image and privacy dialogs, Escape dismissal, email draft feedback, theme switching, mobile navigation, image loading, and internal anchors. No JavaScript or HTTP errors were observed. Layout checks passed at widths 320, 390, 768, 1024, and 1440 pixels. Axe-core WCAG 2 A/AA and 2.1 AA checks reported zero violations in light and dark themes. JavaScript syntax and Git whitespace checks passed.

Deployment has not yet been verified: both Render create-site tools returned HTTP 500 and no new service appeared. Existing services in the selected workspace report a billing suspension. The dashboard requires an authenticated browser session to investigate further.

## Contact

The interest form prepares a `mailto:` draft to `abdullah.siddiki@darulislah.org`. Visitors review and send the message in their email application. It does not pretend to submit an inquiry or store leads. Direct email is always available.

## Assets and design

The user supplied the emerald Maktab logo and Stitch HTML/design references. Product images are real captures from the local Maktab app with synthetic QA school data. No production records or authentication material are shipped. Inter is locally hosted; its license is in `public/assets/OFL.txt`.

The original designer mockup was reworked for readable product evidence, working anchor navigation, accessible tabs/dialogs/FAQs, responsive layouts, dark mode, and accurate product claims. Demo screenshots are explicitly labeled.

App source reference: frontend `fa8957b73f77ca51780e9e3704fe914aa1d0d7dd` with local working changes. This site does not alter the application or depend on its availability.
