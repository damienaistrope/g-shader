var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
var import_genai = require("@google/genai");
var import_dotenv = __toESM(require("dotenv"), 1);
import_dotenv.default.config();
var app = (0, import_express.default)();
var PORT = 3e3;
app.use(import_express.default.json());
var apiKey = process.env.GEMINI_API_KEY;
var ai = null;
if (apiKey) {
  ai = new import_genai.GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build"
      }
    }
  });
}
console.log(`Gemini API Key loaded: ${apiKey ? "YES (Active)" : "NO"}`);
app.post("/api/generate-shader", async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required." });
  }
  if (!ai) {
    return res.status(503).json({
      error: "Gemini AI is not configured. Please add GEMINI_API_KEY to your workspace Secrets.",
      fallback: true
    });
  }
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Create a highly creative, visually stunning, modern 2D WebGL 1.0 Fragment Shader based on the request: "${prompt}".

The space of the fragment shader should be beautifully abstract, organic or geometric. Ensure it incorporates real-time movement and looks incredibly high-fidelity (matching professional modern web prototypes).

Use the following strict WebGL 1.0 rules and uniform definitions:
- It must start with: "precision mediump float;"
- It must have the following exact uniforms:
  - "uniform vec2 u_resolution;" (dimensions of viewport)
  - "uniform float u_time;" (elapsed time in seconds)
  - "uniform vec2 u_mouse;" (mouse coordinates normalized between 0.0 and 1.0, where center is roughly 0.5)
  - "uniform vec3 u_color_primary;" (RGB normalized colors from 0.0 to 1.0 for styling)
  - "uniform vec3 u_color_secondary;" (RGB normalized colors from 0.0 to 1.0 for styling)
  - "uniform float u_speed;" (multiplier for speed, where default is 1.0)
  - "uniform float u_scale;" (multiplier for noise or shape patterns, where default is 1.0)

Instructions inside the shader:
- Inside void main() {, calculate normalized coordinates (e.g. vec2 uv = gl_FragCoord.xy / u_resolution.xy;).
- Make sure u_mouse coordinates affect the shader dynamics (e.g., distorting noise, creating lights or adding ripples when u_mouse is active or near).
- Mix u_color_primary and u_color_secondary to shape the aesthetic, so changes on the UI sliders/color pickers instantly reflect inside the shader render.
- Multiply u_time with u_speed (e.g., u_time * u_speed) to enable the user to pause or accelerate the flow.
- Multiply pattern coordinates with u_scale (e.g., uv * u_scale * 5.0) to enable zooming/scaling of the GLSL pattern.
- Ensure the output color is assigned to "gl_FragColor" (e.g., gl_FragColor = vec4(finalColor, 1.0);).
- It MUST compile on standard WebGL 1.0. Avoid any WebGL 2.0 textures or syntax. Avoid features requiring headers or extensions. Do not use texture2D or texture coordinates since there is no texture attached, calculate everything programmatically (signed distance fields, modern procedural noise, cellular noise, fbm, sinusoids, math).
- Keep code robust, safe, and clean. All variables must be floats (no mixed types like multiplying float with int; write "2.0" instead of "2").

Return the result as a raw JSON response.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: import_genai.Type.OBJECT,
          properties: {
            title: {
              type: import_genai.Type.STRING,
              description: "Short creative title of the shader (e.g., 'Retro Synthwave Net')."
            },
            description: {
              type: import_genai.Type.STRING,
              description: "A friendly, descriptive sentence about what the shader is and how to interact with it."
            },
            shaderCode: {
              type: import_genai.Type.STRING,
              description: "The complete, standalone GLSL fragment shader code starting with precision mediump float; and ending with gl_FragColor assignment."
            },
            primaryColorHex: {
              type: import_genai.Type.STRING,
              description: "A matching visual recommendation for the primary uniform color in hex format (e.g., '#FF0055')."
            },
            secondaryColorHex: {
              type: import_genai.Type.STRING,
              description: "A matching visual recommendation for the secondary uniform color in hex format (e.g., '#00FFAA')."
            },
            suggestedScale: {
              type: import_genai.Type.NUMBER,
              description: "A suggested starting multiplier value for the scale uniform (e.g., 1.5)."
            },
            suggestedSpeed: {
              type: import_genai.Type.NUMBER,
              description: "A suggested starting multiplier value for the speed uniform (e.g., 0.8)."
            }
          },
          required: ["title", "description", "shaderCode", "primaryColorHex", "secondaryColorHex"]
        }
      }
    });
    const text = response.text;
    res.json(JSON.parse(text));
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    res.status(500).json({ error: error.message || "Failed to generate custom shader." });
  }
});
app.post("/api/fetch-external-shader", async (req, res) => {
  const { endpointUrl } = req.body;
  if (!endpointUrl) {
    return res.status(400).json({ error: "endpointUrl parameter is required." });
  }
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 8e3);
    const fetchRes = await fetch(endpointUrl, {
      method: "GET",
      headers: {
        "Accept": "application/json, text/plain, */*",
        "User-Agent": "FigmaShaderStudio-Server-Proxy"
      },
      signal: controller.signal
    });
    clearTimeout(id);
    const contentType = fetchRes.headers.get("content-type") || "";
    let data;
    if (contentType.includes("application/json")) {
      data = await fetchRes.json();
    } else {
      const text = await fetchRes.text();
      data = {
        isRawGlsl: true,
        shaderCode: text,
        title: "Fetched External GLSL",
        description: `Direct shader program loaded from ${endpointUrl}`
      };
    }
    res.json({
      status: "success",
      statusCode: fetchRes.status,
      data
    });
  } catch (error) {
    console.error("External connection proxy failed:", error);
    res.status(502).json({
      error: `Proxy failed to connect to external host: ${error.message || "No response received"}`
    });
  }
});
async function init() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Figma Shader Studio server running on http://localhost:${PORT}`);
  });
}
init();
//# sourceMappingURL=server.cjs.map
