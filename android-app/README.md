# Kalidad Pharmacy Android

A branded, offline-capable customer app built from this repository’s existing assets and content. Forest #1E4F3B, deep forest #12291F, lime #C7EF3E, cream #F6F4EC. Five primary screens: Home, Explore, Care, Journal, More. Package com.kalidad.pharmacy, Android 8+ (API 26), target Android 15 (API 35), version 1.0.0.

## What works
- Offline catalogue of 24 product ranges; search, categories, favourites and enquiry basket with quantity controls.
- WhatsApp product and service enquiries with review before sending. Prices, availability, delivery fees and fulfilment are confirmed by staff.
- Five service summaries; seven offline articles with links back to their source pages.
- Kisenyi and Kahungabunyonyi branch information, map links and dialler.
- Local daily medicine reminders with Android notifications, permission flow, cancellation, and reboot/timezone rescheduling. Inexact alarms can be delayed by the OS. Notifications conceal the reminder label.
- Local enquiry draft history. Drafts never claim submission, confirmation or delivery tracking.
- Privacy screen and explicit local-data deletion. No login requirement, analytics or advertising.
- External browser access to existing website pharmacist chat. This is not an embedded authenticated chat client.

## Implementation
A purpose-built mobile UI runs as packaged local content inside a hardened Android WebView, with a small Java layer for reminders, notification permissions and external app handoffs. No network page runs inside the native bridge. Local content is served on a synthetic HTTPS origin; file/content access, mixed content, remote subresources and iframes are blocked. External URLs use an allowlist. Android backup is disabled. The UI uses device system fonts; images and colours come from the repository.

## Source content
Run `python -m pip install beautifulsoup4 pillow` then `python scripts/prepare_assets.py` from this folder after website content changes. `web/asset-provenance.json` maps original asset filenames to optimized bundled files. `web/content.js` retains the website source commit. This snapshot does not automatically sync stock, prices or content.

## Build
Install JDK 17 and Android SDK with platform android-35 and build-tools 35.0.0. Run:

```bash
python -m pip install beautifulsoup4 pillow
python scripts/prepare_assets.py
node --test tests/model.test.cjs
export ANDROID_HOME=/absolute/path/to/android-sdk
export JAVA_HOME=/absolute/path/to/jdk-17
export PATH="$JAVA_HOME/bin:$PATH"
bash scripts/build-apk.sh
```

Output is `build/Kalidad-Pharmacy.apk`. Without signing variables, it is unsigned and cannot be installed. To sign with the privately delivered key, set `KALIDAD_KEYSTORE` and `KALIDAD_PASSWORD_FILE` to absolute paths before building. Key alias: `kalidad`. Never commit the keystore or password. Keep the original key for every future update and increase the version code/name in both AndroidManifest.xml and app/build.gradle.

Alternatively open this folder in Android Studio. Gradle 8.9+ and Android Gradle Plugin 8.7.2 are supported by the supplied configuration. Its release signing configuration is intentionally omitted; configure signing with the private key before distributing.

## Install and verify
Download the signed APK on an Android 8+ phone, allow installation from the browser/file manager when Android asks, then install. Open all five tabs, search and save a range, create a basket enquiry, confirm the WhatsApp message and correct pharmacy recipient, test both map links and the dialler. Enable notifications, set a reminder a few minutes ahead, and verify it after closing the app. Test reboot/timezone change and denial/re-enabling of notifications. Test at larger system font sizes. Never disable Play Protect to force an install; investigate any warning.

## Commercial handover
This is a branded customer enquiry and care app, not a live e-commerce system. A paid handover should include acceptance testing on actual phones, client ownership of the signing key, a support agreement, permission to redistribute the repository images, and the agreed deployment/distribution channel. See HANDOVER.md for a concrete release checklist and future extensions.
