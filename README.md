# G→Shader — Web App

## Quick start

```bash
npm install
npm run dev          # starts Vite dev server + Express API on :3000
```

Open http://localhost:3000

## Environment variables

Copy `.env.example` to `.env` and fill in:

```env
GEMINI_API_KEY=your_key_here   # for AI shader generation
```

Get a key at https://aistudio.google.com/app/apikey

## Build for production

```bash
npm run build    # builds Vite frontend + bundles server
npm start        # runs dist/server.cjs
```

## Project structure

```
src/
  App.tsx                     ← main orchestrator (~760 lines)
  constants.ts                ← M3 states, color libraries, size presets, fonts
  types.ts                    ← all TypeScript types including Figma bridge messages
  presets.ts                  ← built-in GLSL shader presets
  lib/
    m3Styles.ts               ← Material 3 color token resolver
  hooks/
    useToast.ts               ← toast notifications
    useShaderState.ts         ← animated state transitions
    useCanvasComponents.ts    ← component CRUD, drag, resize, state
    useSavedCombinations.ts   ← save / load / share combinations
    useColorLibraries.ts      ← custom color library management
    useFigmaPlugin.ts         ← two-way Figma plugin bridge + code.js generator
  components/
    ShaderRenderer.tsx        ← WebGL2 official Google M3 energy shader
    CustomShaderRenderer.tsx  ← WebGL1 renderer for AI-generated shaders
    ...                       ← Material 3 UI components
  features/
    Canvas.tsx                ← centre canvas with draggable components
    LeftSidebar.tsx           ← layers, backdrop, presets panel
    RightInspector.tsx        ← properties, states, export panel
    modals/
      PluginModal.tsx         ← plugin installer with bridge docs
      SaveComboModal.tsx      ← save combination dialog
server.ts                     ← Express + Gemini API proxy
```

## Figma plugin

See the `../figma-plugin/` folder for the ready-to-import plugin files.
The web app detects when it's running inside the plugin automatically
and shows a purple bridge status bar with Sync / Export buttons.
