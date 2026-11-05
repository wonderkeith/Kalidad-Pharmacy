# Validation — 12 October 2026

Passed:
- Java Android release compilation against Android SDK 35, minimum API 26.
- APK zip alignment and APK Signature Scheme v2/v3 verification.
- Five model tests: basket normalization, enquiry content, escaping, next reminder calculation, content/asset completeness.
- Chromium checks on all five screens at 320, 390 and 700px with no horizontal overflow.
- Product search, basket quantity controls and persistence, favourites, reminder save/reload/delete, all seven article readers.
- WhatsApp enquiry draft recipient/content, draft persistence and local data deletion checked with external opening intercepted; no message sent.
- No JavaScript runtime errors during tested navigation and interactions.
- Visual inspection of Home, Explore and Journal using the repository’s brand images.
- Release manifest: non-debuggable, backups disabled, HTTPS-only external links, notifications and boot only beyond internet permission.

Not yet verified:
- Installation and launch on a physical Android phone or emulator.
- Native reminder delivery while backgrounded, after reboot, or under manufacturer battery restrictions; notification denial/re-enabling.
- Native Android insets/keyboard, large system font sizes, and actual WhatsApp/map/dialler/browser handoffs.
- Website live chat response/staff availability. This app opens existing website chat externally.
- Inventory, payments, delivery tracking and prescription handling: these are not implemented in this release.

Enquiry history is explicitly draft history. It does not prove a WhatsApp message was sent, accepted or fulfilled. No real customer enquiry was sent during testing.
