import React from 'react';
import JSZip from 'jszip';
import { X, Sparkles, Download, Layers, Upload, CheckCircle2 } from 'lucide-react';
import { FIGMA_CODE_JS } from '../../hooks/useFigmaPlugin';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  showToast: (msg: string) => void;
}

export default function PluginModal({ isOpen, onClose, showToast }: Props) {
  if (!isOpen) return null;

  const handleDownload = async () => {
    try {
      const zip = new JSZip();

      zip.file('manifest.json', JSON.stringify({
        name: 'G→Shader',
        id: 'g-shader-plugin',
        api: '1.0.0',
        main: 'code.js',
        ui: 'ui.html',
        editorType: ['figma'],
        permissions: ['currentuser'],
      }, null, 2));

      zip.file('code.js', FIGMA_CODE_JS);

      // ui.html — thin iframe shell pointing at the hosted web app
      // The postMessage bridge is handled by useFigmaPlugin on the web app side.
      zip.file('ui.html', `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 100%; height: 100%; background: #1E1E1E; overflow: hidden; }
    iframe { width: 100%; height: 100%; border: 0; display: block; }
    #loading {
      position: fixed; inset: 0; background: #1E1E1E;
      display: flex; align-items: center; justify-content: center;
      flex-direction: column; gap: 12px; color: #E6E6E6; font-family: sans-serif;
      font-size: 13px; transition: opacity 0.4s;
    }
    .spinner {
      width: 28px; height: 28px; border: 2px solid #333;
      border-top-color: #18A0FB; border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  </style>
</head>
<body>
  <div id="loading">
    <div class="spinner"></div>
    <span>Loading G→Shader…</span>
  </div>
  <iframe
    id="app"
    src="${window.location.origin}"
    allow="camera; microphone"
    onload="document.getElementById('loading').style.opacity='0';setTimeout(()=>document.getElementById('loading').remove(),400)"
  ></iframe>
  <script>
    // Relay messages between Figma sandbox and the iframe app
    window.addEventListener('message', function(e) {
      var iframe = document.getElementById('app');
      if (!iframe) return;
      // Figma → iframe
      if (e.source === window.parent && e.data && e.data.pluginMessage) {
        iframe.contentWindow.postMessage(e.data, '*');
      }
      // iframe → Figma
      if (e.source === iframe.contentWindow && e.data && e.data.pluginMessage) {
        window.parent.postMessage(e.data, '*');
      }
    });
  </script>
</body>
</html>`);

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'g-shader-plugin.zip';
      a.click();
      URL.revokeObjectURL(url);
      showToast('Plugin ZIP downloaded — import manifest.json in Figma Desktop!');
    } catch (err: any) {
      showToast(`Download failed: ${err.message}`);
    }
  };

  const STEPS = [
    {
      num: 1, title: 'Download the plugin ZIP',
      body: 'Click the button below to download the complete plugin package. It contains manifest.json, code.js (Figma sandbox), and ui.html (iframe shell).',
      highlight: null,
    },
    {
      num: 2, title: 'Import into Figma Desktop',
      body: 'Open Figma Desktop → Menu → Plugins → Development → Import plugin from manifest… → select the manifest.json inside the ZIP.',
      highlight: null,
    },
    {
      num: 3, title: 'Plugin ↔ App bridge',
      body: 'Once open, the plugin reads your selected Figma layers and sends their dimensions/colors to G→Shader. Use "Export to Figma" to push the rendered shader back as an image fill on your selected layer.',
      highlight: null,
    },
    {
      num: 4, title: 'What the bridge supports',
      body: null,
      bullets: [
        'Read selected layer dimensions & corner radius → auto-size canvas components',
        'Push rendered PNG back as image fill on the selected Figma node',
        'Create a new Figma frame from canvas size',
        'Live selection sync — changing your Figma selection updates the app',
      ],
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-[#2C2C2C] w-full max-w-2xl border border-neutral-700/80 rounded-xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-neutral-100 font-sans">

        {/* Header */}
        <div className="p-4 border-b border-[#333] flex justify-between items-center bg-[#222]">
          <div className="flex items-center gap-2.5">
            <Layers className="w-5 h-5 text-[#A259FF]" />
            <div>
              <h3 className="text-sm font-bold tracking-wide">G→Shader Figma Plugin</h3>
              <p className="text-[10px] text-neutral-400">Real bidirectional plugin bridge</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer border-none outline-none">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4 text-xs leading-relaxed">

          <div className="bg-[#18A0FB]/10 border border-[#18A0FB]/30 p-3 rounded text-[11px] text-[#18A0FB] flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              This plugin includes a <strong>live two-way bridge</strong>: select Figma layers to auto-size your canvas, and push your rendered shader frames back as image fills — no copy-paste needed.
            </span>
          </div>

          {STEPS.map(step => (
            <div key={step.num} className="space-y-1.5 pb-3 border-b border-white/5 last:border-0">
              <div className="font-bold text-neutral-200 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-[#18A0FB] text-white text-[9px] font-mono flex items-center justify-center font-bold shrink-0">
                  {step.num}
                </span>
                <span>{step.title}</span>
              </div>
              {step.body && <p className="text-neutral-400 text-[10.5px] pl-7">{step.body}</p>}
              {step.bullets && (
                <ul className="pl-7 space-y-1">
                  {step.bullets.map((b, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-neutral-400 text-[10.5px]">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />
                      {b}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}

          {/* code.js preview */}
          <div className="space-y-1.5">
            <span className="text-[9px] uppercase font-bold text-neutral-400 tracking-wider block">Generated code.js preview</span>
            <pre className="bg-[#1E1E1E] p-3 rounded font-mono text-[9.5px] text-amber-400 overflow-x-auto border border-neutral-800 max-h-40">
{FIGMA_CODE_JS.slice(0, 600)}…
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#1A1A1A] border-t border-[#333] flex justify-end gap-2 shrink-0">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-[10px] uppercase font-bold text-neutral-200 transition-colors cursor-pointer border-none outline-none"
          >
            Close
          </button>
          <button
            onClick={handleDownload}
            className="px-4 py-1.5 rounded bg-[#18A0FB] hover:bg-[#158CDD] text-[10.5px] uppercase font-bold text-white transition-colors cursor-pointer border-none outline-none flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            Download Plugin ZIP
          </button>
        </div>
      </div>
    </div>
  );
}
