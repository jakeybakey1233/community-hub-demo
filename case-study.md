# Department for Education — community and help-centre work

## Professional context

I worked as a Senior Front End Developer on customer help-centre and community enhancements for the Department for Education. My remit included Zendesk Guide and community interfaces, GDS accessibility work, the ESFA-to-DfE rebrand, and sign-in integration involving DfE Sign-in and Microsoft.

The practical challenge was extending an existing support platform while keeping its navigation and behaviour understandable to its users. Community interfaces also needed to show useful activity without treating every page visit or every reply as a new notification.

## Problems explored in this public reconstruction

The unread-activity requirements include showing indicators beside the specific posts with new activity; avoiding notifications caused solely by a person's own reply; applying moderator-response rules; and clearing the indicator after a post has been read. A parent topic visit must not silently mark all its posts as read.

This repository recreates those interaction problems in independent code using fictional fixtures. The activity model makes each rule inspectable and testable without access to a Zendesk account.

| Public implementation | Engineering purpose |
| --- | --- |
| Pure post-activity decisions | Separate policy from DOM updates and storage |
| Folder/topic aggregation | Explain which individual posts cause a parent indicator |
| Per-post read snapshots | Avoid clearing sibling posts or later replies |
| Member/moderator scenario controls | Make the differences in activity policy visible |
| Preference validation and storage fallback | Keep the interface working with corrupt or unavailable storage |
| Labelled controls and preserved focus | Make filtering and favourites usable with a keyboard |

## Scope of my experience versus this repository

The professional work is the context for this portfolio project. The source here is a newly written public reconstruction, not a copy of the employer's theme or an exact representation of its architecture. No performance figures, adoption metrics or business outcomes are asserted for this demo.

The rebrand, production authentication integrations and wider Zendesk configuration are not implemented here. The role selector changes the demo's unread policy; it cannot grant access to information.

## Trade-offs

A browser-only example makes the behaviours easy to run and inspect. It also limits the read markers to that browser. A production implementation would need verified user identity, service-side access checks, pagination, incremental activity retrieval and a persistence strategy appropriate to the platform.

This example keeps all fixture activity available immediately. It deliberately avoids making a blue dot depend on waiting for multiple network requests. A live integration would need a separate loading and refresh policy so users can distinguish previously known activity from a failed or unfinished update.
