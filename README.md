# Community Hub — support portal and activity tracking

[![Tests](https://github.com/jakeybakey1233/community-hub-demo/actions/workflows/tests.yml/badge.svg)](https://github.com/jakeybakey1233/community-hub-demo/actions/workflows/tests.yml)
[![Browser checks](https://github.com/jakeybakey1233/community-hub-demo/actions/workflows/browser.yml/badge.svg)](https://github.com/jakeybakey1233/community-hub-demo/actions/workflows/browser.yml)

A public reconstruction of community-interface problems relevant to my Zendesk work at the **Department for Education**. Explore articles, open community folders and topics, and see which individual posts have new activity.

**[Live demo](https://jakeybakey1233.github.io/community-hub-demo/)** · [Experience case study](docs/case-study.md) · [Technical decisions](docs/architecture.md)

The live URL becomes available after this repository is uploaded and GitHub Pages is enabled. For an immediate offline preview, download the repository and open **`preview.html`**.

## What you can try

- Search articles and discussions; combine content-type and audience filters.
- Navigate from a **folder → topic → specific post**, with aggregate unread counts at each level.
- Open a topic without clearing its posts. Open a post to save a read snapshot for that post only.
- Add a reply as **another member**, **yourself**, or **a moderator** using the scenario controls.
- Switch between member and moderator views. Your identity stays the same; the activity policy changes.
- Save resources to favourites. Preferences and read markers persist across refreshes where browser storage is available.
- Open actual article and post views, including the fictional discussion replies.

## Activity rules

| Situation | Member view | Moderator view |
| --- | --- | --- |
| Another member replies after the saved read snapshot | New activity | New activity, unless a moderator has already replied |
| You add your own reply | Does not create unread activity | Does not create unread activity |
| Your own reply follows somebody else's unseen reply | The unseen activity stays new | The moderation rule still applies |
| A moderator has responded | Does not automatically clear another member's unread activity | Suppresses the post's unread queue indicator |
| You open a folder or topic | Read markers stay unchanged | Read markers stay unchanged |
| You open a post | Records that post's visible activity as read | Records that post's visible activity as read |
| Another reply arrives after the post was opened | New again until explicitly read | New again, subject to the moderation rule |

The demo starts with a fictional read baseline of 22 September 2026. Seeded replies make each rule observable immediately. Reset the demo to return to this state.

## Run locally

Recommended: Node.js 24 (24.15 or newer), or Node.js 22 (22.22.2 or newer). These versions also support the optional development checks. The application and unit tests need no package installation.

```bash
npm run serve
```

Open `http://127.0.0.1:8000`. Stop the server with Ctrl+C.

Alternatively, open `preview.html` directly. It is generated from the **same source modules and stylesheet**, without external assets. Storage support for `file://` pages varies by browser; use the server for consistent persistent-state behaviour.

```bash
npm run build:preview
```

Regenerate the offline preview whenever you change the source.

## Tests and accessibility checks

```bash
npm test
```

This runs pure filtering, activity and storage regressions. To run the DOM and browser checks:

```bash
npm ci
npm run test:dom
npx playwright install chromium
npm run test:browser
```

The browser check exercises navigation, unread activity, favourites, reload persistence and keyboard focus; checks desktop and mobile layouts; runs axe-core; and captures real screenshots to `screenshots/`. Its GitHub Actions workflow uploads those captures as a downloadable artifact. See [validation notes](docs/validation.md) for the checks completed in this package and their limits.

Accessibility choices include labelled native controls, visible focus, text alongside blue activity dots, live result announcements, a skip link, readable contrast and focus preservation when a favourite button is rebuilt. Automated checks supplement manual assistive-technology review; they do not establish complete WCAG conformance.

## Engineering decisions

- **Pure activity rules:** `src/activity.js` has no DOM or storage dependency. Folder and topic summaries reuse the post decisions.
- **Read snapshots:** viewing one post records the latest visible activity timestamp, without clearing siblings or future replies.
- **Predictable state:** stored preferences are validated; corrupt or blocked storage has an in-memory fallback.
- **Safe rendering:** titles, descriptions and reply text use `textContent` rather than interpolated HTML.
- **Working navigation:** fragment routes support browser back/forward and direct links without a backend or Pages rewrite rules.
- **Small runtime:** vanilla ES modules and CSS keep the application independent of a framework or build service.

## Repository layout

```text
index.html                   Main module-based interface
preview.html                 Generated offline preview
src/activity.js              Unread and read-snapshot decisions
src/filters.js               Validated search and filtering
src/storage.js               Optional browser preference storage
src/data.js                  Fictional folders, topics and content
src/main.js                  Navigation, events and DOM rendering
src/styles.css               Responsive presentation
scripts/                     Local server, preview builder and checks
tests/                       Domain regressions
docs/                        Experience, architecture and validation
```

## Experience and provenance

I worked on DfE customer help-centre and community enhancements, including Zendesk customisation, accessibility, rebranding and sign-in integration. This repository demonstrates a **subset of related interaction problems**; it does not implement the production DfE service, SSO or Zendesk theme APIs.

This independent implementation was developed with AI assistance. The design, data and example identities are fictional. No employer source, private endpoints or customer records are included. Role switching is a demonstration control, not authorisation. MIT applies to this independent example code; no DfE or vendor endorsement is implied.
