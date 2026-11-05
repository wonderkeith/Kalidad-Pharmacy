#!/usr/bin/env bash
set -euo pipefail
root="$(cd "$(dirname "$0")/.." && pwd)"
sdk_root="${ANDROID_HOME:?Set ANDROID_HOME to an SDK containing android-35 and build-tools 35.0.0}"
tools="$sdk_root/build-tools/35.0.0"
platform="$sdk_root/platforms/android-35/android.jar"
output="$root/build"
rm -rf "$output"
mkdir -p "$output/classes" "$output/dex" "$output/stage/assets/www"
cp -R "$root/web/." "$output/stage/assets/www/"
"$tools/aapt2" compile --dir "$root/app/src/main/res" -o "$output/resources.zip"
"$tools/aapt2" link -o "$output/base.apk" -I "$platform" --manifest "$root/app/src/main/AndroidManifest.xml" --java "$output/generated" --min-sdk-version 26 --target-sdk-version 35 --version-code 1 --version-name 1.0.0 "$output/resources.zip"
find "$root/app/src/main/java" "$output/generated" -name '*.java' > "$output/sources.txt"
javac -source 17 -target 17 -classpath "$platform" -d "$output/classes" @"$output/sources.txt"
jar --create --file "$output/classes.jar" -C "$output/classes" .
"$tools/d8" --lib "$platform" --min-api 26 --output "$output/dex" "$output/classes.jar"
cp "$output/dex/classes.dex" "$output/stage/"
cp "$output/base.apk" "$output/kalidad-unsigned.apk"
(cd "$output/stage" && zip -qr "$output/kalidad-unsigned.apk" .)
"$tools/zipalign" -f -p 4 "$output/kalidad-unsigned.apk" "$output/Kalidad-Pharmacy.apk"
if [[ -n "${KALIDAD_KEYSTORE:-}" ]]; then
 "$tools/apksigner" sign --ks "$KALIDAD_KEYSTORE" --ks-key-alias kalidad --ks-pass "file:${KALIDAD_PASSWORD_FILE:?Set password file}" "$output/Kalidad-Pharmacy.apk"
 "$tools/apksigner" verify --verbose "$output/Kalidad-Pharmacy.apk"
fi
