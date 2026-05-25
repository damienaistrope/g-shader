/**
 * useFigmaPlugin — bidirectional bridge between the web app and the Figma plugin sandbox.
 *
 * Architecture:
 *   Web app (ui.html iframe)  ←→  code.js (Figma plugin sandbox)
 *
 *   Outbound:  window.parent.postMessage({ pluginMessage: msg }, '*')
 *   Inbound:   window.addEventListener('message', e => e.data.pluginMessage)
 *
 * When NOT running inside Figma the hook is a no-op (isInPlugin = false).
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { PluginOutboundMessage, PluginInboundMessage, FigmaLayerData } from '../types';

export interface FigmaPluginState {
  isInPlugin: boolean;
  isPluginReady: boolean;
  selectedLayers: FigmaLayerData[];
  lastError: string | null;
  // Actions
  getSelection: () => void;
  exportToFigma: (canvas: HTMLCanvasElement | HTMLElement, layerName?: string) => Promise<void>;
  createFrame: (width: number, height: number, name: string) => void;
  closePlugin: () => void;
}

export function useFigmaPlugin(onLayersReceived?: (layers: FigmaLayerData[]) => void): FigmaPluginState {
  // Detect Figma iframe environment: window.parent !== window AND the URL origin
  const isInPlugin = typeof window !== 'undefined' && window.parent !== window;

  const [isPluginReady, setIsPluginReady] = useState(false);
  const [selectedLayers, setSelectedLayers] = useState<FigmaLayerData[]>([]);
  const [lastError, setLastError] = useState<string | null>(null);
  const pendingExportRef = useRef<{ resolve: () => void; reject: (e: Error) => void } | null>(null);

  // ── Inbound message handler ────────────────────────────────────────────────
  useEffect(() => {
    if (!isInPlugin) return;

    const handleMessage = (event: MessageEvent) => {
      // Figma sends { pluginMessage: {...} } from the sandbox
      const msg: PluginInboundMessage = event.data?.pluginMessage;
      if (!msg) return;

      switch (msg.type) {
        case 'PLUGIN_READY':
          setIsPluginReady(true);
          break;

        case 'SELECTION_DATA':
          setSelectedLayers(msg.layers);
          onLayersReceived?.(msg.layers);
          break;

        case 'EXPORT_COMPLETE':
          pendingExportRef.current?.resolve();
          pendingExportRef.current = null;
          break;

        case 'ERROR':
          setLastError(msg.message);
          pendingExportRef.current?.reject(new Error(msg.message));
          pendingExportRef.current = null;
          break;
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [isInPlugin, onLayersReceived]);

  // ── Outbound helpers ──────────────────────────────────────────────────────
  const send = useCallback((msg: PluginOutboundMessage) => {
    if (!isInPlugin) return;
    window.parent.postMessage({ pluginMessage: msg }, '*');
  }, [isInPlugin]);

  const getSelection = useCallback(() => {
    send({ type: 'GET_SELECTION' });
  }, [send]);

  const exportToFigma = useCallback(async (
    el: HTMLCanvasElement | HTMLElement,
    layerName = 'G→Shader Export'
  ) => {
    let imageData: string;

    if (el instanceof HTMLCanvasElement) {
      imageData = el.toDataURL('image/png');
    } else {
      // Composite via html2canvas-style: find the first canvas child
      const canvas = el.querySelector('canvas') as HTMLCanvasElement | null;
      if (!canvas) throw new Error('No canvas found in element');
      imageData = canvas.toDataURL('image/png');
    }

    const { width, height } = el instanceof HTMLCanvasElement
      ? { width: el.width, height: el.height }
      : { width: el.clientWidth, height: el.clientHeight };

    return new Promise<void>((resolve, reject) => {
      pendingExportRef.current = { resolve, reject };
      send({ type: 'EXPORT_TO_FIGMA', imageData, layerName, width, height });
      // Timeout failsafe
      setTimeout(() => {
        if (pendingExportRef.current) {
          pendingExportRef.current.reject(new Error('Export timed out'));
          pendingExportRef.current = null;
        }
      }, 15000);
    });
  }, [send]);

  const createFrame = useCallback((width: number, height: number, name: string) => {
    send({ type: 'CREATE_FRAME', width, height, name });
  }, [send]);

  const closePlugin = useCallback(() => {
    send({ type: 'CLOSE' });
  }, [send]);

  return {
    isInPlugin, isPluginReady, selectedLayers, lastError,
    getSelection, exportToFigma, createFrame, closePlugin,
  };
}

// ─── Figma code.js generator ──────────────────────────────────────────────────
// This string is embedded into the downloaded plugin ZIP.

export const FIGMA_CODE_JS = `// G→Shader – Figma Plugin Sandbox (code.js)
// This runs in the Figma plugin sandbox and communicates with the iframe UI via postMessage.

figma.showUI(__html__, { width: 1100, height: 780, title: 'G→Shader' });

// Notify UI that plugin is alive
figma.ui.postMessage({ type: 'PLUGIN_READY' });

// Listen for selection changes and push updates to the UI
figma.on('selectionchange', () => {
  sendSelectionData();
});

function sendSelectionData() {
  const layers = figma.currentPage.selection.map(node => ({
    id: node.id,
    name: node.name,
    type: node.type,
    width: 'width' in node ? node.width : 0,
    height: 'height' in node ? node.height : 0,
    x: 'x' in node ? node.x : 0,
    y: 'y' in node ? node.y : 0,
    fills: ('fills' in node && Array.isArray(node.fills))
      ? node.fills.map(f => ({
          type: f.type,
          color: f.type === 'SOLID' ? { r: f.color.r, g: f.color.g, b: f.color.b, a: f.opacity ?? 1 } : undefined
        }))
      : [],
    cornerRadius: ('cornerRadius' in node && typeof node.cornerRadius === 'number') ? node.cornerRadius : 0,
  }));
  figma.ui.postMessage({ type: 'SELECTION_DATA', layers });
}

figma.ui.onmessage = async (msg) => {
  try {
    switch (msg.type) {

      case 'GET_SELECTION':
        sendSelectionData();
        break;

      case 'EXPORT_TO_FIGMA': {
        // Decode base64 PNG and create an image fill on the selected layer (or a new frame)
        const { imageData, layerName, width, height } = msg;
        const base64 = imageData.replace(/^data:image\\/png;base64,/, '');
        const bytes = figma.base64Decode(base64);
        const imageHash = figma.createImage(bytes).hash;

        let targetNode = figma.currentPage.selection[0];

        if (!targetNode || !('fills' in targetNode)) {
          // Create a new frame if nothing is selected
          const frame = figma.createFrame();
          frame.resize(width, height);
          frame.name = layerName;
          frame.x = figma.viewport.center.x - width / 2;
          frame.y = figma.viewport.center.y - height / 2;
          figma.currentPage.appendChild(frame);
          targetNode = frame;
        }

        if ('fills' in targetNode) {
          targetNode.fills = [{
            type: 'IMAGE',
            scaleMode: 'FILL',
            imageHash,
          }];
          targetNode.name = layerName;
          figma.viewport.scrollAndZoomIntoView([targetNode]);
        }

        figma.ui.postMessage({ type: 'EXPORT_COMPLETE', nodeId: targetNode.id });
        break;
      }

      case 'CREATE_FRAME': {
        const { width, height, name } = msg;
        const frame = figma.createFrame();
        frame.resize(width, height);
        frame.name = name;
        frame.x = figma.viewport.center.x - width / 2;
        frame.y = figma.viewport.center.y - height / 2;
        figma.currentPage.appendChild(frame);
        figma.currentPage.selection = [frame];
        figma.viewport.scrollAndZoomIntoView([frame]);
        sendSelectionData();
        break;
      }

      case 'CLOSE':
        figma.closePlugin();
        break;
    }
  } catch (err) {
    figma.ui.postMessage({ type: 'ERROR', message: err.message || String(err) });
  }
};
`;
