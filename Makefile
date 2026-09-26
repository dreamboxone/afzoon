include $(TOPDIR)/rules.mk

PKG_NAME:=luci-app-afzoon
PKG_VERSION:=1.0.4
PKG_RELEASE:=1
PKG_LICENSE:=MIT
PKG_MAINTAINER:=dreamboxone

include $(INCLUDE_DIR)/package.mk

define Package/luci-app-afzoon
  SECTION:=luci
  CATEGORY:=LuCI
  SUBMENU:=3. Applications
  TITLE:=Afzoon USB storage, swap and extroot manager
  PKGARCH:=all
  DEPENDS:=+luci-base +rpcd +rpcd-mod-file +jsonfilter +block-mount +e2fsprogs +parted +swap-utils
endef

define Package/luci-app-afzoon/description
Persian and English LuCI management for USB storage, persistent swap and extroot.
endef

define Build/Compile
endef

define Build/Prepare
	mkdir -p $(PKG_BUILD_DIR)
endef

define Package/luci-app-afzoon/conffiles
/etc/config/afzoon
endef

define Package/luci-app-afzoon/install
	$(INSTALL_DIR) $(1)/etc/config $(1)/etc/hotplug.d/block $(1)/etc/init.d
	$(INSTALL_DIR) $(1)/usr/sbin $(1)/www/luci-static/resources/view/afzoon/fonts
	$(INSTALL_DIR) $(1)/usr/share/rpcd/acl.d $(1)/usr/share/luci/menu.d
	$(INSTALL_CONF) ./files/etc/config/afzoon $(1)/etc/config/afzoon
	$(INSTALL_BIN) ./files/usr/sbin/afzoonctl $(1)/usr/sbin/afzoonctl
	$(INSTALL_BIN) ./files/etc/hotplug.d/block/99-afzoon $(1)/etc/hotplug.d/block/99-afzoon
	$(INSTALL_BIN) ./files/etc/init.d/afzoon $(1)/etc/init.d/afzoon
	$(INSTALL_DATA) ./files/usr/share/rpcd/acl.d/luci-app-afzoon.json $(1)/usr/share/rpcd/acl.d/luci-app-afzoon.json
	$(INSTALL_DATA) ./files/usr/share/luci/menu.d/luci-app-afzoon.json $(1)/usr/share/luci/menu.d/luci-app-afzoon.json
	$(INSTALL_DATA) ./files/www/luci-static/resources/view/afzoon/overview.js $(1)/www/luci-static/resources/view/afzoon/overview.js
	$(INSTALL_DATA) ./files/www/luci-static/resources/view/afzoon/fonts/Vazirmatn.woff2 $(1)/www/luci-static/resources/view/afzoon/fonts/Vazirmatn.woff2
	$(INSTALL_DATA) ./files/www/luci-static/resources/view/afzoon/fonts/OFL.txt $(1)/www/luci-static/resources/view/afzoon/fonts/OFL.txt
endef

$(eval $(call BuildPackage,luci-app-afzoon))
