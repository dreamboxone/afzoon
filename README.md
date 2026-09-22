# Afzoon

Afzoon 1.0.0 is an offline LuCI application for USB storage discovery, persistent swap, and persistent extroot on OpenWrt.

## Behaviour

- Detects attached USB mass-storage devices through sysfs and refreshes the LuCI view through block hotplug events.
- Shows capacity, vendor/model, partitions, file systems, and negotiated USB link speed. USB generation is derived from the actual negotiated speed.
- Lets the user select swap only, extroot only, or both. The extroot value is automatically proposed from remaining capacity after a 16 MiB safety reserve.
- The Apply action wipes only the selected USB disk after browser confirmation, creates a GPT layout, formats ext4/swap partitions, and records UUID-based `fstab` entries that survive reboot.
- Extroot data are copied before activation. A reboot is required to switch the live overlay to extroot.
- Safe removal stops active swap and unmounts the selected drive. A live extroot cannot be removed; disable extroot, reboot from internal storage, then remove it.
- English is the default UI language; Persian can be selected in the page.

## Scope and requirements

The package is architecture independent, but the generated `.ipk` or `.apk` is not: build it with the exact OpenWrt SDK for each router target. USB host/storage kernel drivers and any required filesystem driver must be installed for the router hardware and media in use.

Required runtime packages are declared by the package: `block-mount`, `e2fsprogs`, `parted`, and `swap-utils`. A router lacking USB host/storage support needs its target-specific kernel packages installed separately.

## Build

From Linux or WSL, obtain and extract the matching OpenWrt SDK, then run:

```sh
./scripts/build-package.sh /path/to/openwrt-sdk
```

The script prints the produced package. OpenWrt SDKs using opkg produce `.ipk`; SDKs using apk-tools produce `.apk`.

## Installation

Install the matching package on the router. For apk-based OpenWrt systems that require unsigned local packages, use the local package policy configured for that router, for example `apk add --allow-untrusted /tmp/luci-app-afzoon_1.0.0-1_all.apk`.

After installation, open **Services → Afzoon** in LuCI.

## Safety

Creating a layout is deliberately destructive: it removes every existing partition and all data on the selected USB device. Do not use a device that contains data you need. Never unplug a USB device while extroot is active.
