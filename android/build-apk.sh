#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
# Campus Clock – Android APK build
#
# Builds a signed WebView APK without Gradle. Requirements:
#   • JDK 17      ($JAVA_HOME)
#   • Android SDK ($ANDROID_SDK) with build-tools 34 and platform 34
#
# Usage:  ANDROID_SDK=... JAVA_HOME=... ./android/build-apk.sh
# ─────────────────────────────────────────────────────────────
set -euo pipefail

HERE="$(cd "$(dirname "$0")" && pwd)"
SDK="${ANDROID_SDK:-$HOME/.cc-android/sdk}"
JDK="${JAVA_HOME:-$HOME/.cc-android/jdk/jdk-17.0.20.1+1}"
BUILD_TOOLS="$SDK/build-tools/34.0.0"
PLATFORM="$SDK/platforms/android-34/android.jar"

for tool in "$BUILD_TOOLS/aapt2.exe" "$BUILD_TOOLS/d8.bat" "$BUILD_TOOLS/zipalign.exe" "$BUILD_TOOLS/apksigner.bat" "$PLATFORM"; do
  if [ ! -f "$tool" ]; then
    echo "Missing build tool: $tool" >&2
    exit 1
  fi
done

OUT="$HERE/build"
rm -rf "$OUT"
mkdir -p "$OUT/res" "$OUT/gen" "$OUT/classes" "$OUT/dex"

echo "› Compiling resources"
"$BUILD_TOOLS/aapt2.exe" compile --dir "$HERE/app/res" -o "$OUT/res/compiled.zip"

echo "› Linking base APK"
"$BUILD_TOOLS/aapt2.exe" link \
  -o "$OUT/base.apk" \
  -I "$PLATFORM" \
  --manifest "$HERE/app/AndroidManifest.xml" \
  -R "$OUT/res/compiled.zip" \
  --java "$OUT/gen" \
  --min-sdk-version 23 \
  --target-sdk-version 34 \
  --version-code 1 \
  --version-name 1.0 \
  --auto-add-overlay

echo "› Compiling Java"
"$JDK/bin/javac" \
  -source 8 -target 8 \
  -bootclasspath "$PLATFORM" \
  -classpath "$OUT/gen" \
  -encoding UTF-8 \
  -d "$OUT/classes" \
  $(find "$HERE/app/src" -name '*.java') \
  "$OUT/gen/com/campusclock/app/R.java" 2>&1 | grep -v "bootstrap class path" || true

echo "› Dexing"
JAVA_HOME="$JDK" "$BUILD_TOOLS/d8.bat" \
  --min-api 23 \
  --lib "$PLATFORM" \
  --output "$OUT/dex" \
  $(find "$OUT/classes" -name '*.class')

echo "› Packaging"
cp "$OUT/base.apk" "$OUT/unsigned.apk"
# Git Bash on Windows has no zip binary, so add the dex with Python's zipfile.
python - "$OUT/unsigned.apk" "$OUT/dex/classes.dex" <<'PY'
import sys, zipfile
apk, dex = sys.argv[1], sys.argv[2]
with zipfile.ZipFile(apk, 'a', zipfile.ZIP_DEFLATED) as bundle:
    bundle.write(dex, 'classes.dex')
PY

"$BUILD_TOOLS/zipalign.exe" -f 4 "$OUT/unsigned.apk" "$OUT/aligned.apk"

KEYSTORE="$HERE/.android-signing.keystore"
if [ ! -f "$KEYSTORE" ]; then
  echo "› Creating local signing key (not committed)"
  "$JDK/bin/keytool" -genkeypair \
    -keystore "$KEYSTORE" \
    -storepass campusclock \
    -keypass campusclock \
    -alias campusclock \
    -keyalg RSA -keysize 2048 -validity 10000 \
    -dname "CN=Campus Clock, OU=Mobile, O=Campus Clock, L=Mumbai, C=IN" >/dev/null 2>&1
fi

echo "› Signing"
"$BUILD_TOOLS/apksigner.bat" sign \
  --ks "$KEYSTORE" \
  --ks-pass pass:campusclock \
  --key-pass pass:campusclock \
  --out "$HERE/CampusClock.apk" \
  "$OUT/aligned.apk"

"$BUILD_TOOLS/apksigner.bat" verify --verbose "$HERE/CampusClock.apk" | head -5

echo "✓ $HERE/CampusClock.apk"
ls -lh "$HERE/CampusClock.apk"
