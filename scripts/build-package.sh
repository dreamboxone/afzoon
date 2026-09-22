#!/usr/bin/env sh
# Build with the exact OpenWrt SDK matching the router release, target and CPU.
set -eu

SDK=${1:?Usage: build-package.sh /path/to/openwrt-sdk}
SOURCE=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
DEST="$SDK/package/afzoon"

[ -f "$SDK/include/toplevel.mk" ] || { echo "Not an OpenWrt SDK: $SDK" >&2; exit 2; }
rm -rf "$DEST"
mkdir -p "$DEST"
cp -a "$SOURCE/Makefile" "$SOURCE/files" "$DEST/"

make -C "$SDK" defconfig
make -C "$SDK" package/afzoon/clean
make -C "$SDK" package/afzoon/compile CONFIG_PACKAGE_luci-app-afzoon=m V=s

ARTIFACTS=$(find "$SDK/bin/packages" -type f \( -name 'luci-app-afzoon_*.ipk' -o -name 'luci-app-afzoon-*.apk' \) -print)
[ -n "$ARTIFACTS" ] || { echo "Afzoon package was not produced" >&2; exit 1; }
printf '%s\n' "$ARTIFACTS"
