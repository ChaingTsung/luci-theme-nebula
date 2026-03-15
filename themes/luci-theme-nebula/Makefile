include $(TOPDIR)/rules.mk

LUCI_TITLE:=Nebula Theme
LUCI_DEPENDS:=+luci-base +luci-theme-bootstrap
PKG_LICENSE:=Apache-2.0


define Package/luci-theme-nebula/postrm
#!/bin/sh
[ -n "$${IPKG_INSTROOT}" ] || {
	uci -q delete luci.themes.Nebula
	uci commit luci
}
endef

include $(TOPDIR)/feeds/luci/luci.mk
