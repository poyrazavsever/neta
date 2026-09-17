#!/bin/sh

set -eu

RUBY_ROOT="/opt/homebrew/opt/ruby@3.4"
if [ -x "$RUBY_ROOT/bin/bundle" ]; then
  BUNDLE_BIN="$RUBY_ROOT/bin/bundle"
else
  BUNDLE_BIN="$(command -v bundle || true)"
fi

if [ ! -x "$BUNDLE_BIN" ]; then
  echo "Ruby 3.4 ve Gemfile.lock ile uyumlu Bundler gerekli; PATH veya Homebrew kurulumunu kontrol edin." >&2
  exit 1
fi

cd "$(dirname "$0")/.."

if [ ! -f ios/Podfile ]; then
  pnpm exec expo prebuild --platform ios --no-install
fi

"$BUNDLE_BIN" config set --local path vendor/bundle
"$BUNDLE_BIN" check || "$BUNDLE_BIN" install

cd ios
"$BUNDLE_BIN" exec pod install
