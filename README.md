# Community Hub — accessible support portal demo

![Illustrative layout preview of the Community Hub demonstration](./screenshots/community-hub-desktop.png)

*Illustrative layout preview using fictional data; run the project or visit its GitHub Pages deployment for the live interface.*

[![Tests](https://img.shields.io/badge/tests-Node.js-265c54)](#run-tests) [![HTML](https://img.shields.io/badge/frontend-HTML%20%2F%20CSS%20%2F%20JS-355d76)](#stack)

An **original, AI-assisted portfolio demonstration** of a multi-community support portal. It illustrates problems encountered when extending customer-support platforms: reusable navigation, audience-aware search, consistent filtering, discoverability, favourites and moderation indicators.

> **Important:** This is an **independent demonstration**, not an official service or vendor product. It does not contain employer source code, customer records, real community data or third-party credentials. All example content is fictional. It is a simplified standalone demonstration rather than a production Zendesk theme.

## Features

- Search help articles and community discussions by title, topic and description.
- **All audiences** filter works with both content types; narrow to customers, partners or internal teams.
- Persistent filters and client-side favourites using browser local storage; safe fallback when storage is blocked.
- Community-aware breadcrumb, chronological / alphabetical sorting and reset controls.
- Example moderator-replied indicators populated from fictional fixtures.
- Responsive, semantic HTML and labelled controls with focus states and a skip link.
- Testable filtering business logic with Node's built-in test runner.

## Try it

1. Clone this repository, or download its files.
2. From the repository directory, run `python3 -m http.server 8000` (on Windows, `py -m http.server 8000`).
3. Open **http://localhost:8000**. Search for `data`, filter to **Community posts**, select **All audiences**, and try starring a result.

Because this project uses JavaScript modules, run it via a local HTTP server rather than opening the HTML with the `file://` protocol.

### Host on GitHub Pages

This is a static website, so it requires no build step. In the repository's **Settings → Pages**, choose **Deploy from a branch**, branch **main**, folder **/(root)**, and save. Once published, GitHub supplies a URL for your live demo.

## Run tests

Requirements: Node.js 20+; **no package installation needed**.

```bash
npm test
```

## Stack

Vanilla JavaScript ES modules, HTML5, CSS3 and Node.js built-in tests. No framework, backend, credentials or production service access is required. The visual design is an original reconstruction, does not reuse any employer branding, and uses system fonts without external CSS dependencies.

## Repository structure

```text
├── index.html              # Accessible, responsive page
├── src/
│   ├── main.js             # Event handling, state, rendering
│   ├── filters.js          # Pure filtering and validation functions
│   ├── data.js             # Fictional example resources
│   └── styles.css          # Responsive UI
├── tests/filters.test.js   # Filtering regression tests
├── docs/architecture.md   # Technical decisions and data flow
└── screenshots/           # Illustrative layout previews of the standalone demo
```

## Design notes

- Filtering functions are independent of browser DOM code, making them testable.
- Resource content is inserted with `textContent`, not interpolated HTML.
- Local storage holds **only** demo filters and fictional resource identifiers.
- A moderator badge demonstrates a *presentation pattern*, not real Zendesk moderation detection.
- A real Zendesk implementation would use its theme templates and APIs, with **server-enforced** authorisation for sensitive user metadata.

See [architecture and future extensions](./docs/architecture.md) for a more detailed breakdown.

## Licence

MIT for this original demonstration code. Third-party platforms and trademarks belong to their respective owners.
