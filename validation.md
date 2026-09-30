# Validation of package v2

Completed with Node.js 24.19.0:

| Check | Result |
| --- | --- |
| Filtering, activity and storage tests | 17 tests passed |
| Preview generation | Built from the same source modules and stylesheet |
| DOM interactions using jsdom | 29 assertions passed |
| HTML identifiers and label references | No duplicate IDs or broken label targets |
| Text contrast calculations | Checked body/description, scenario, moderator/unread badge, footer, link and placeholder pairs; all exceed 4.5:1 |
| JavaScript syntax checks | Passed |

DOM checks cover folder/topic visits preserving unread state, opening one post, own/external replies, an explicit read action, persistence with saved preferences, role switching, reset, search, favourites, focus restoration, unknown links, malformed/blocked storage and safe text rendering.

The measured example contrast ratios are 6.93:1 for resource description text on white, 7.48:1 for unread badge text, and 8.84:1 for footer text. These source-colour checks do not establish complete accessibility conformance.

## Browser checks and screenshot limits

Live visual/browser capture could not be completed in the package-building environment. The cloud browser rejected the local preview route, and local browser startup was unavailable. The original illustrative screenshots were removed because they do not show this version.

`npm run test:browser` and the Browser checks workflow provide actual browser interaction, desktop/mobile/narrow-width overflow checks, axe-core checks and JPEG captures. Those checks are **included but are not reported as passed here**. The workflow uploads the screenshots without changing Git history. Review its results, visual layout and assistive-technology behaviour before treating the demo as accessibility-audited.

The normal app and its offline preview use no network services or cloud accounts. The developer-only browser tooling downloads its test browser when you request installation.
