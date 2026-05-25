// ─── Core shader & preset types ───────────────────────────────────────────────

export interface ShaderStateConfig {
  shaderCode: string;
  primaryColorHex: string;
  secondaryColorHex: string;
  scale: number;
  speed: number;
}

export interface InteractionStates {
  listening: ShaderStateConfig;
  responding: ShaderStateConfig;
  processing: ShaderStateConfig;
  anticipating: ShaderStateConfig;
}

export interface ShaderPreset {
  id: string;
  title: string;
  description: string;
  author: 'system' | 'ai' | 'user' | 'api';
  shaderCode: string;
  primaryColorHex: string;
  secondaryColorHex: string;
  suggestedScale: number;
  suggestedSpeed: number;
  states?: InteractionStates;
}

// ─── Canvas component types ───────────────────────────────────────────────────

export interface ComponentInstance {
  id: string;
  name: string;
  type: 'card' | 'button' | 'chip' | 'fab' | 'dialog' | 'badge' | 'sheets' | 'avatar' | 'progress';
  width: number;
  height: number;
  borderRadius: number;
  containerType: 'surface' | 'primary' | 'secondary';
  title: string;
  subtitle: string;
  text: string;
  x: number;
  y: number;
  activeIcon: string;
  sizePreset: 'xsmall' | 'small' | 'medium' | 'large' | 'xlarge';
  fontStyleTitle: string;
  fontStyleText: string;
  colorLibrary: string;
  configShowIcon: boolean;
  configShowTitle: boolean;
  configShowSubtitle: boolean;
  configShowDescription: boolean;
  configShowActions: boolean;
  blurredEdges?: boolean;
  variant?: string;
  activeState?: number;
  previousState?: number;
  transitionVal?: number;
  sizeMode?: 'fixed' | 'auto';
  heightMode?: 'fixed' | 'auto';
  iconBgColor?: string;
  iconImage?: string;
  avatarType?: 'icon' | 'initials' | 'image';
  avatarInitials?: string;
}

// ─── Workspace persistence ────────────────────────────────────────────────────

export interface LinkedFigmaFile {
  id: string;
  name: string;
  url: string;
}

export interface SavedCombination {
  id: string;
  name: string;
  figmaFileId: string;
  components: ComponentInstance[];
  activeBackdrop: string;
  liveFrameUrl: string;
  uploadedFrameUrl: string | null;
  uploadedFrameName: string | null;
  backdropOpacity: number;
  backdropScale: number;
  isBackdropVisible: boolean;
  canvasBgMode: 'dark' | 'light';
  globalColorLibrary: string;
  activeState: number;
}

// ─── UI metadata ──────────────────────────────────────────────────────────────

export interface M3StateMeta {
  id: number;
  label: string;
  icon: any;
  defaultMid: string;
  defaultEnd: string;
  badgeText: string;
  description: string;
}

export interface InteractiveClick {
  id: string;
  x: number;
  y: number;
  time: string;
  timestamp?: number;
}

// ─── Figma plugin bridge ──────────────────────────────────────────────────────

/** Messages sent FROM the web app TO code.js (via parent.postMessage) */
export type PluginOutboundMessage =
  | { type: 'GET_SELECTION' }
  | { type: 'EXPORT_TO_FIGMA'; imageData: string; layerName: string; width: number; height: number }
  | { type: 'CREATE_FRAME'; width: number; height: number; name: string }
  | { type: 'CLOSE' };

/** Messages sent FROM code.js TO the web app (via figma.ui.postMessage) */
export type PluginInboundMessage =
  | { type: 'SELECTION_DATA'; layers: FigmaLayerData[] }
  | { type: 'EXPORT_COMPLETE'; nodeId: string }
  | { type: 'ERROR'; message: string }
  | { type: 'PLUGIN_READY' };

export interface FigmaLayerData {
  id: string;
  name: string;
  type: string;
  width: number;
  height: number;
  x: number;
  y: number;
  fills: Array<{ type: string; color?: { r: number; g: number; b: number; a: number } }>;
  cornerRadius: number;
}
