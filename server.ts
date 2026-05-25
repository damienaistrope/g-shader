import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: { headers: { "User-Agent": "aistudio-build" } },
  });
}

console.log(`Gemini API Key loaded: ${apiKey ? "YES (Active)" : "NO"}`);

// ─── Shader generation ──────────────────────────────────────────────────────
app.post("/api/generate-shader", async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: "Prompt is required." });

  if (!ai) {
    return res.status(503).json({
      error:
        "Gemini AI is not configured. Add GEMINI_API_KEY to your workspace secrets.",
      fallback: true,
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", // fixed: was gemini-3.5-flash (does not exist)
      contents: `Create a highly creative, visually stunning, modern 2D WebGL 1.0 Fragment Shader based on the request: "${prompt}".

The shader should be beautifully abstract, organic or geometric with real-time movement and high visual fidelity.

Strict WebGL 1.0 rules:
- Start with: "precision mediump float;"
- Exact uniforms required:
  - "uniform vec2 u_resolution;"
  - "uniform float u_time;"
  - "uniform vec2 u_mouse;"  (normalized 0.0–1.0)
  - "uniform vec3 u_color_primary;"
  - "uniform vec3 u_color_secondary;"
  - "uniform float u_speed;"
  - "uniform float u_scale;"
- Calculate normalized UV inside void main(): vec2 uv = gl_FragCoord.xy / u_resolution.xy;
- Use u_mouse to distort/ripple the shader dynamically
- Mix u_color_primary and u_color_secondary throughout
- Multiply u_time * u_speed and coordinates * u_scale
- Assign output to gl_FragColor (NOT fragColor — this is WebGL 1.0)
- No WebGL 2.0 syntax, no texture2D, no #version directive
- All literals must be floats: write 2.0 not 2

Return raw JSON only.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            shaderCode: { type: Type.STRING },
            primaryColorHex: { type: Type.STRING },
            secondaryColorHex: { type: Type.STRING },
            suggestedScale: { type: Type.NUMBER },
            suggestedSpeed: { type: Type.NUMBER },
          },
          required: [
            "title",
            "description",
            "shaderCode",
            "primaryColorHex",
            "secondaryColorHex",
          ],
        },
      },
    });

    res.json(JSON.parse(response.text));
  } catch (error: any) {
    console.error("Gemini Generation Error:", error);
    res.status(500).json({ error: error.message || "Failed to generate shader." });
  }
});

// ─── External shader proxy ───────────────────────────────────────────────────
app.post("/api/fetch-external-shader", async (req, res) => {
  const { endpointUrl } = req.body;
  if (!endpointUrl)
    return res.status(400).json({ error: "endpointUrl is required." });

  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 8000);
    const fetchRes = await fetch(endpointUrl, {
      method: "GET",
      headers: { Accept: "application/json, text/plain, */*", "User-Agent": "GShader-Server-Proxy" },
      signal: controller.signal,
    });
    clearTimeout(id);

    const contentType = fetchRes.headers.get("content-type") || "";
    let data: any;
    if (contentType.includes("application/json")) {
      data = await fetchRes.json();
    } else {
      const text = await fetchRes.text();
      data = { isRawGlsl: true, shaderCode: text, title: "Fetched GLSL", description: `Loaded from ${endpointUrl}` };
    }
    res.json({ status: "success", statusCode: fetchRes.status, data });
  } catch (error: any) {
    res.status(502).json({ error: `Proxy failed: ${error.message}` });
  }
});

// ─── Dev / prod serving ──────────────────────────────────────────────────────
async function init() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => res.sendFile(path.join(distPath, "index.html")));
  }
  app.listen(PORT, "0.0.0.0", () =>
    console.log(`G→Shader server running on http://localhost:${PORT}`)
  );
}

init();
