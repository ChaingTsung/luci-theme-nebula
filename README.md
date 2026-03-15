# Nebula theme suite for OpenWrt LuCI

This archive contains:

- `themes/luci-theme-nebula`
- `applications/luci-app-nebula-config`

## What it implements

- Login-page image or video background with `object-fit: cover`
- Main-page background with the same full-screen media approach
- Circular 200px login avatar with automatic crop/scale
- Login card translucency through RGBA panel backgrounds (default 0.75)
- Optional signature text; if manual text is empty, the theme can fetch text from an API
- Theme config page built with the client-rendered LuCI JS form API
- YouTube background mode for login and main pages
- Generic API mode for services such as Unsplash (for example `urls.regular`) or your own Pixiv proxy API

## Recommended layout in a source tree

Copy these two directories into the LuCI feed root of your OpenWrt source tree:

- `themes/luci-theme-nebula`
- `applications/luci-app-nebula-config`

Then install/select them in your OpenWrt build as usual.

## Examples

### Unsplash API

Endpoint example:

`https://api.unsplash.com/photos/random?orientation=landscape&query=router,night&client_id=YOUR_ACCESS_KEY`

JSON path example:

`urls.regular`

### YouTube

Paste either:

- a normal URL such as `https://www.youtube.com/watch?v=M7lc1UVf-VE`
- a short URL such as `https://youtu.be/M7lc1UVf-VE`
- or a raw video ID such as `M7lc1UVf-VE`

### Pixiv

Use any browser-accessible image URL or your own API/proxy that returns a final image URL. Direct origin image links are often unsuitable for anonymous browser embedding.
