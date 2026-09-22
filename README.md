# Afzoon

## راهنمای فارسی

افزون یک برنامهٔ دو‌زبانه برای LuCI است که حافظه‌های USB، سواپ پایدار و افزایش فلش دستگاه را در OpenWrt مدیریت می‌کند. زبان پیش‌فرض رابط انگلیسی است و از بالای صفحه می‌توان آن را به فارسی تغییر داد.

> [!WARNING]
> با زدن دکمهٔ **اعمال تغییرات**، جدول پارتیشن و تمام اطلاعات فلش انتخاب‌شده پاک می‌شود. قبل از ادامه از اطلاعات مهم نسخهٔ پشتیبان بگیرید. فلشی را که سواپ یا افزایش فلش دستگاه فعال دارد ناگهانی جدا نکنید.

### امکانات

- تشخیص خودکار اتصال و جداسازی حافظهٔ USB
- نمایش ظرفیت، برند و مدل، پارتیشن‌ها، فایل‌سیستم و سرعت واقعی ارتباط USB
- امکان ساخت مستقل سواپ، افزایش فلش دستگاه یا هر دو
- تعیین اندازه بر حسب مگابایت با فیلد عددی و پیشنهاد خودکار فضای باقی‌مانده برای افزایش فلش دستگاه
- ثبت تنظیمات بر اساس UUID برای حفظ شدن پس از خاموش و روشن شدن روتر
- حذف امن با جلوگیری از جداسازی دیسک مشغول
- نمایش مدل روتر، نسخهٔ OpenWrt، معماری CPU، فلش داخلی، فضای overlay، RAM و swap
- کارکرد کاملاً محلی و بدون حساب کاربری یا سرویس بیرونی
- استفادهٔ محلی از فونت Vazirmatn در تمام بخش‌های فارسی، بدون دریافت فونت از اینترنت

### پیش‌نیازها

- روتر دارای OpenWrt و LuCI
- درگاه USB و فلش یا دیسک USB
- فضای داخلی کافی برای نصب برنامه و وابستگی‌ها
- پشتیبانی USB mass-storage و ext4 مخصوص نسخه و target دقیق روتر

وابستگی‌های اصلی برنامه عبارت‌اند از `luci-base`، `rpcd`، `rpcd-mod-file`، `jsonfilter`، `block-mount`، `e2fsprogs`، `parted` و `swap-utils`. ممکن است روتر به بسته‌های مخصوص سخت‌افزار مانند `kmod-usb-storage`، `kmod-usb2`، `kmod-usb3` و `kmod-fs-ext4` نیز نیاز داشته باشد.

بستهٔ kernel مربوط به نسخه یا معماری دیگر را نصب نکنید. نسخهٔ kernel module باید دقیقاً با firmware نصب‌شده روی روتر یکسان باشد.

### انتخاب فایل مناسب

فایل‌ها را از صفحهٔ [انتشارهای Afzoon](https://github.com/dreamboxone/afzoon/releases) دریافت کنید:

- برای OpenWrt دارای `opkg` فایل `.ipk` را بگیرید.
- برای OpenWrt دارای `apk` فایل `.apk` را بگیرید.

برای تشخیص package manager در SSH اجرا کنید:

```sh
command -v apk || command -v opkg
```

### نصب نسخهٔ IPK

فایل IPK را با SCP، نرم‌افزار WinSCP یا صفحهٔ نصب بسته در LuCI داخل مسیر `/tmp` روتر قرار دهید و سپس اجرا کنید:

```sh
opkg update
opkg install /tmp/luci-app-afzoon_1.0.2-r1_all.ipk
/etc/init.d/rpcd restart
/etc/init.d/uhttpd restart
```

اگر خطای نبودن پشتیبانی USB یا ext4 دریافت شد، بسته‌های دقیقاً منطبق با روتر را نصب کنید. نمونهٔ رایج:

```sh
opkg update
opkg install kmod-usb-storage kmod-fs-ext4
```

ممکن است کنترلر USB روتر به بستهٔ جداگانهٔ USB 2 یا USB 3 نیاز داشته باشد.

### نصب نسخهٔ APK

فایل APK را داخل `/tmp` روتر کپی و اجرا کنید:

```sh
apk update
apk add --allow-untrusted /tmp/luci-app-afzoon-1.0.2-r1.apk
/etc/init.d/rpcd restart
/etc/init.d/uhttpd restart
```

گزینهٔ `--allow-untrusted` فقط برای نصب همین بستهٔ محلی بدون امضا استفاده می‌شود و بررسی امضای کل سیستم را غیرفعال نمی‌کند.

### ورود به برنامه

پس از نصب وارد LuCI شوید و مسیر زیر را باز کنید:

**Services → Afzoon**

اگر منو دیده نشد، مرورگر را پس از restart کردن `rpcd` و `uhttpd` تازه‌سازی کنید. از دکمهٔ زبان بالای صفحه برای انتخاب فارسی یا انگلیسی استفاده کنید.

### اتصال فلش

1. فلش را به روتر وصل کنید و چند ثانیه منتظر بمانید.
2. صفحهٔ Afzoon را باز یا تازه‌سازی کنید.
3. دستگاه موردنظر را از فهرست انتخاب کنید.
4. پیش از هر تغییر، مسیر دستگاه، برند و ظرفیت آن را با فلش واقعی تطبیق دهید.

سرعتی که برنامه نشان می‌دهد سرعت مذاکره‌شدهٔ واقعی است؛ بنابراین فلش USB 3 متصل به هاب USB 2 به‌درستی با سرعت USB 2 نمایش داده می‌شود.

### ساخت فقط swap

1. فلش صحیح را انتخاب کنید.
2. گزینهٔ **Create persistent swap** را فعال کنید.
3. اندازهٔ موردنظر را بر حسب مگابایت وارد کنید.
4. گزینهٔ افزایش فلش دستگاه را غیرفعال بگذارید.
5. **Apply changes** را بزنید و پاک‌شدن کامل فلش را تأیید کنید.

افزون پارتیشن swap را می‌سازد، UUID آن را در `/etc/config/fstab` ثبت و swap را فعال می‌کند. تنظیم پس از ریبوت نیز باقی می‌ماند.

### فقط افزایش فلش دستگاه

1. فلش صحیح را انتخاب کنید.
2. گزینهٔ **ساخت افزایش فلش دستگاه** را فعال کنید.
3. اندازهٔ پیشنهادی را بپذیرید یا مقدار کوچک‌تری وارد کنید.
4. swap را غیرفعال بگذارید.
5. **Apply changes** را بزنید و هشدار پاک‌شدن اطلاعات را تأیید کنید.
6. پس از پایان عملیات، فلش را جدا نکنید و روتر را ریبوت کنید.
7. دوباره وارد Afzoon شوید و افزایش مقدار **Active overlay** را بررسی کنید.

افزایش فلش دستگاه تا پیش از ریبوت فعال نمی‌شود.

### ساخت هم‌زمان سواپ و افزایش فلش دستگاه

1. هر دو گزینه را فعال کنید.
2. اندازهٔ swap را وارد کنید.
3. برنامه فضای باقی‌مانده را پس از کنارگذاشتن حاشیهٔ ایمنی برای افزایش فلش دستگاه پیشنهاد می‌دهد.
4. در صورت نیاز اندازهٔ افزایش فلش دستگاه را تغییر دهید.
5. **Apply changes** را بزنید، دستگاه را تأیید و پس از پایان روتر را ریبوت کنید.
6. پس از بوت، مقادیر swap و Active overlay را در داشبورد کنترل کنید.

مجموع اندازهٔ دو پارتیشن نباید از فضای قابل استفاده‌ای که برنامه نمایش می‌دهد بیشتر باشد.

### حذف امن فلش

اگر فلش فقط حافظهٔ عادی یا swap است، دکمهٔ **Safely remove** را بزنید. برنامه swap را متوقف، پارتیشن‌ها را unmount، داده‌های کش‌شده را ذخیره و سپس دستگاه را از kernel جدا می‌کند. اگر دستگاه هنوز مشغول باشد، عملیات متوقف می‌شود.

اگر افزایش فلش دستگاه فعال است:

1. دکمهٔ **غیرفعال‌سازی افزایش فلش دستگاه (نیازمند ریبوت)** را بزنید.
2. فلش را متصل نگه دارید و روتر را ریبوت کنید.
3. مطمئن شوید روتر از حافظهٔ داخلی بالا آمده است.
4. وارد Afzoon شوید و **Safely remove** را بزنید.
5. فقط پس از پیام موفقیت، فلش را جدا کنید.

### حذف کامل برنامه

قبل از حذف برنامه باید مطمئن شوید OpenWrt از افزایش فلش دستگاه در حال اجرا نیست.

1. اگر افزایش فلش دستگاه فعال است، آن را از داخل Afzoon غیرفعال کنید و در حالی که فلش متصل است روتر را ریبوت کنید.
2. پس از بوت، منبع overlay را کنترل کنید:

```sh
mount | grep ' /overlay '
```

3. منبع نمایش‌داده‌شده نباید پارتیشن USB مربوط به Afzoon باشد.
4. با دکمهٔ **Safely remove**، swap را متوقف و فلش را جدا کنید.
5. تنظیمات پایدار Afzoon را پاک کنید:

```sh
uci -q delete fstab.afzoon_swap
uci -q delete fstab.afzoon_extroot
uci commit fstab
```

6. روی نسخه‌های opkg برنامه را حذف کنید:

```sh
opkg remove luci-app-afzoon
```

یا روی نسخه‌های apk:

```sh
apk del luci-app-afzoon
```

7. سرویس‌های وب را دوباره راه‌اندازی کنید:

```sh
/etc/init.d/rpcd restart
/etc/init.d/uhttpd restart
```

ممکن است package manager فایل تنظیمات را نگه دارد. اگر دیگر به آن نیاز ندارید:

```sh
rm -f /etc/config/afzoon
```

وابستگی‌های مشترک مانند `block-mount` یا ماژول‌های USB را خودکار حذف نکنید، زیرا ممکن است برنامه‌ها یا قابلیت‌های دیگر OpenWrt از آن‌ها استفاده کنند.

### رفع اشکال سریع

- اگر فلش دیده نمی‌شود، خروجی `dmesg`، توان USB، کابل/هاب و نصب بودن ماژول‌های USB دقیق روتر را بررسی کنید.
- فایل‌سیستم `unknown` می‌تواند نشانهٔ پارتیشن بدون فرمت، خراب، رمزگذاری‌شده یا نبودن driver آن فایل‌سیستم باشد.
- اگر دستگاه مشغول است، اشتراک‌ها و برنامه‌های استفاده‌کننده از فلش را ببندید. افزایش فلش دستگاه فعال ابتدا باید غیرفعال و روتر ریبوت شود.
- اگر افزایش فلش دستگاه پس از بوت فعال نشد، فلش را جدا یا دوباره پارتیشن‌بندی نکنید و این فرمان‌ها را بررسی کنید:

```sh
block info
uci show fstab
logread | grep -Ei 'mount|extroot|overlay|block'
```

ساخته‌شدن موفق بسته به‌تنهایی اثبات نمی‌کند که افزایش فلش دستگاه روی تمام روترها کار می‌کند؛ پشتیبانی نهایی به سخت‌افزار، kernel، توان USB و firmware همان روتر وابسته است.

---

## English user guide

Afzoon is a bilingual LuCI application for managing USB storage, persistent swap, and extroot on OpenWrt. English is the default interface language and Persian can be selected from the Afzoon page.

> [!WARNING]
> Creating swap or extroot erases the complete partition table and **all data** on the selected USB device. Back up the drive before pressing **Apply changes**. Never unplug a drive while swap or extroot is active.

## Features

- Automatic detection of connected and disconnected USB mass-storage devices
- USB capacity, vendor/model, file-system, partition, negotiated speed, and USB-generation display
- Independent creation of swap, extroot, or both
- Numeric size controls in MB and an automatic extroot suggestion based on remaining capacity
- Persistent UUID-based configuration across router restarts
- Safe-removal control with busy-device protection
- Router model, OpenWrt version, CPU architecture, internal/extended storage, RAM, swap, and virtual-memory charts
- English and Persian interface with English selected by default
- Fully local operation without an online account or external service

## Requirements

- A router running OpenWrt with LuCI
- A USB port and a USB mass-storage device
- Enough free space in the router's internal storage to install the package and dependencies
- USB host/storage and ext4 support for the exact OpenWrt target

Afzoon depends on `luci-base`, `rpcd`, `rpcd-mod-file`, `jsonfilter`, `block-mount`, `e2fsprogs`, `parted`, and `swap-utils`. Depending on the router, target-specific packages such as `kmod-usb-storage`, `kmod-usb2`, `kmod-usb3`, and `kmod-fs-ext4` may also be required.

Do not install kernel-module packages downloaded for another OpenWrt release or target. Kernel modules must exactly match the firmware running on the router.

## Choosing the correct package

Download the current release from the [Afzoon Releases page](https://github.com/dreamboxone/afzoon/releases).

- OpenWrt releases using `opkg`: download the `.ipk` file.
- OpenWrt releases using `apk`: download the `.apk` file.

Check the package manager through SSH:

```sh
command -v apk || command -v opkg
```

## Installing the IPK package

Copy the downloaded IPK file to `/tmp` on the router with SCP, WinSCP, or LuCI's package-upload page. Then connect through SSH and run:

```sh
opkg update
opkg install /tmp/luci-app-afzoon_1.0.2-r1_all.ipk
/etc/init.d/rpcd restart
/etc/init.d/uhttpd restart
```

If OpenWrt reports missing USB/ext4 kernel support, install the packages matching the router first. A common configuration is:

```sh
opkg update
opkg install kmod-usb-storage kmod-fs-ext4
```

Some routers additionally require their USB 2 or USB 3 host-controller package. The correct package is hardware- and target-specific.

## Installing the APK package

Copy the downloaded APK file to `/tmp` on the router, connect through SSH, and run:

```sh
apk update
apk add --allow-untrusted /tmp/luci-app-afzoon-1.0.2-r1.apk
/etc/init.d/rpcd restart
/etc/init.d/uhttpd restart
```

`--allow-untrusted` is required for the locally built unsigned release package. It does not disable signature checking globally.

If target-specific USB or ext4 modules are missing, install packages built for the exact firmware release and router target before using Afzoon.

## Opening Afzoon

Sign in to LuCI and open:

**Services → Afzoon**

If the menu is not immediately visible, refresh the browser after restarting `rpcd` and `uhttpd`. The first page load uses English. Use the language button at the top of the page to switch between English and Persian.

## Connecting a USB device

1. Connect the USB flash drive or USB disk to the router.
2. Wait several seconds for the kernel to detect it.
3. Open or refresh **Services → Afzoon**.
4. Select the intended device from the list.
5. Verify its device path, brand/model, and capacity before making changes.

Afzoon reports the speed negotiated by the router and device. For example, a USB 3 drive connected through a USB 2 hub is correctly reported at the USB 2 link speed.

## Creating swap only

1. Select the correct USB device.
2. Enable **Create persistent swap**.
3. Enter the required size in MB with the number box or its up/down controls.
4. Leave extroot disabled.
5. Read the erase warning and press **Apply changes**.
6. Confirm the selected device when prompted.

Afzoon recreates the USB partition table, creates the swap partition, records its UUID in `/etc/config/fstab`, and activates it. The swap configuration remains available after reboot.

## Creating extroot only

1. Select the correct USB device.
2. Enable **Create persistent extroot**.
3. Accept the suggested remaining capacity or enter a smaller size in MB.
4. Leave swap disabled.
5. Press **Apply changes** and confirm the erase warning.
6. Wait until Afzoon reports that preparation has completed.
7. Reboot the router without disconnecting the USB device.
8. Return to Afzoon and verify that **Active overlay** shows the USB-backed capacity.

Afzoon formats the partition as ext4, copies the current overlay data, and adds a UUID-based `/overlay` entry. Extroot becomes active only after reboot.

## Creating swap and extroot together

1. Enable both swap and extroot.
2. Enter the desired swap size.
3. Afzoon proposes the remaining usable space for extroot after keeping a small safety reserve.
4. Adjust the extroot value if required.
5. Press **Apply changes** and confirm the selected device.
6. Reboot after the operation completes.
7. Verify both the swap and active-overlay values on the dashboard.

The sum of the requested partitions must not exceed the usable capacity shown by Afzoon.

## Safe removal

### Drive used for ordinary storage or swap

Press **Safely remove** before unplugging it. Afzoon stops swap, unmounts the partitions, flushes pending writes, and disconnects the device from the kernel. If a filesystem or swap is still busy, removal is refused instead of forcing disconnection.

### Drive currently used as extroot

A live extroot cannot be safely unmounted while OpenWrt is running from it.

1. Press **Disable extroot (reboot required)**.
2. Keep the USB drive connected.
3. Reboot the router.
4. Confirm that OpenWrt has started from internal storage.
5. Open Afzoon and press **Safely remove**.
6. Unplug the drive only after successful confirmation.

Never unplug an active extroot drive to test fallback behaviour. An interrupted write can corrupt the external overlay.

## Removing Afzoon safely

Before uninstalling, make sure OpenWrt is not running from an Afzoon extroot device.

### 1. Disable extroot first

If extroot is active, use **Disable extroot (reboot required)** in Afzoon and reboot while the drive remains attached. After reboot, verify through SSH:

```sh
mount | grep ' /overlay '
```

The displayed overlay source must no longer be the Afzoon USB partition before continuing.

### 2. Stop swap and remove the USB device

Use **Safely remove** in Afzoon. If the device is no longer connected, check that none of its partitions remains in `/proc/swaps`.

### 3. Remove Afzoon's persistent fstab entries

```sh
uci -q delete fstab.afzoon_swap
uci -q delete fstab.afzoon_extroot
uci commit fstab
```

### 4. Uninstall the application

On an opkg-based release:

```sh
opkg remove luci-app-afzoon
```

On an apk-based release:

```sh
apk del luci-app-afzoon
```

Restart the web services:

```sh
/etc/init.d/rpcd restart
/etc/init.d/uhttpd restart
```

The package manager may preserve `/etc/config/afzoon` as a modified configuration file. Remove it only if the settings are no longer needed:

```sh
rm -f /etc/config/afzoon
```

Do not automatically remove shared dependencies such as `block-mount`, ext4 tools, or USB kernel modules; other OpenWrt features may still use them.

## Troubleshooting

### No USB device appears

- Check `dmesg` immediately after connecting the device.
- Confirm that the router provides enough USB power.
- Try another drive, cable, or powered USB hub.
- Verify installation of the exact target's USB host and mass-storage kernel modules.

### The filesystem is shown as unknown

The partition may be unformatted, damaged, encrypted, or use a filesystem unsupported by the installed firmware. Afzoon can only mount filesystems supported by the router's installed kernel modules and tools.

### Apply reports that the device is busy

Unmount shares and applications using the USB device. An active extroot must first be disabled and the router rebooted from internal storage.

### Extroot did not activate after reboot

Keep the drive attached and inspect:

```sh
block info
uci show fstab
logread | grep -Ei 'mount|extroot|overlay|block'
```

Confirm that the UUID stored in `fstab.afzoon_extroot` exists and that ext4 support is loaded. Do not repartition the device until important data has been recovered.

### LuCI reports permission or command errors

Restart `rpcd`, sign out of LuCI, sign in again, and reload the page:

```sh
/etc/init.d/rpcd restart
/etc/init.d/uhttpd restart
```

## Important limitations

- Hardware support depends on the OpenWrt target, kernel modules, USB controller, power supply, and storage device.
- A package building successfully does not prove extroot operation on every router.
- Removing an active extroot device is unsafe and intentionally blocked.
- Afzoon cannot preserve existing partitions when Apply is used; the selected disk is deliberately repartitioned.
