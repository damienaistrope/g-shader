# G→Shader — Figma Plugin

## Setup

1. Open **Figma Desktop** (the plugin must be loaded locally)
2. Go to **Menu → Plugins → Development → Import plugin from manifest...**
3. Select this folder's `manifest.json`
4. Run the plugin from **Plugins → Development → G→Shader**

## Connecting to the web app

Edit `ui.html` and change the `<iframe src="...">` to point at your running web app:

```html
<!-- Local development -->
<iframe id="app" src="http://localhost:3000" ...>

<!-- Deployed / production -->
<iframe id="app" src="https://your-app.vercel.app" ...>
```

## What the bridge does

| Direction | Message | Effect |
|-----------|---------|--------|
| Figma → App | `PLUGIN_READY` | App shows bridge status bar |
| Figma → App | `SELECTION_DATA` | App auto-sizes selected component to match Figma layer |
| App → Figma | `GET_SELECTION` | Reads selected Figma layers and sends dimensions back |
| App → Figma | `EXPORT_TO_FIGMA` | Sends rendered PNG; Figma applies it as an image fill on the selected node |
| App → Figma | `CREATE_FRAME` | Creates a new Figma frame at the given size |
| App → Figma | `CLOSE` | Closes the plugin |

## Plugin window size

Default: 1100 × 780 px. Change in `code.js`:
```js
figma.showUI(__html__, { width: 1100, height: 780 });
```
