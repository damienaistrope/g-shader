// G→Shader – Figma Plugin Sandbox (code.js)
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
