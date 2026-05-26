import React, { useState, useEffect, useRef } from 'react';
import JSZip from 'jszip';
// @ts-ignore
import gifshot from 'gifshot';
import ShaderRenderer from './components/ShaderRenderer';
import { Button as M3Button } from './components/Button/Button';
import { Card as M3Card, CardHeader as M3CardHeader, CardContent as M3CardContent, CardActions as M3CardActions, CardMedia as M3CardMedia } from './components/Card/Card';
import { Chip as M3Chip } from './components/Chips/Chip';
import { FAB as M3FAB } from './components/Button/FAB';
import { Dialog as M3Dialog } from './components/Dialog/Dialog';
import { Badge as M3Badge } from './components/Badge/Badge';
import { BottomSheet as M3BottomSheet, SideSheet as M3SideSheet } from './components/Sheets/Sheet';
import { Avatar as M3Avatar } from './components/Avatar/Avatar';
import { LinearProgress as M3LinearProgress, CircularProgress as M3CircularProgress } from './components/Progress/Progress';
import { Icon as M3Icon } from './components/Icon/Icon';
import { 
  Volume2, 
  Brain, 
  MessageSquare, 
  Sparkles, 
  Play, 
  Pause, 
  Activity, 
  Layers, 
  Download, 
  MousePointer2, 
  Hand, 
  Maximize2, 
  Grid, 
  Sun, 
  Moon, 
  CheckCircle2, 
  SlidersHorizontal, 
  Upload, 
  Image as ImageIcon, 
  Move, 
  RotateCcw,
  Sparkle,
  X,
  Focus,
  Plus,
  ChevronDown,
  ChevronUp,
  Copy,
  Trash2,
  Share2,
  Link2,
  ExternalLink,
  Save,
  FolderHeart,
  Square,
  Check,
  Pencil
} from 'lucide-react';

interface LinkedFigmaFile {
  id: string;
  name: string;
  url: string;
}

interface SavedCombination {
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

interface M3StateMeta {
  id: number;
  label: string;
  icon: any;
  defaultMid: string;
  defaultEnd: string;
  badgeText: string;
  description: string;
}

const OFFICIAL_STATES: M3StateMeta[] = [
  { 
    id: 0, 
    label: 'Neutral Default', 
    icon: Moon,
    defaultMid: '#121212',
    defaultEnd: '#1A1A1A',
    badgeText: 'Sleeping Mode',
    description: 'Pristine resting energy state'
  },
  { 
    id: 2, 
    label: 'Listening', 
    icon: Volume2,
    defaultMid: '#4285F4',
    defaultEnd: '#24D6FF',
    badgeText: 'Live Audio Stream',
    description: 'Dynamic reactive fluid listening state'
  },
  { 
    id: 3, 
    label: 'Responding', 
    icon: MessageSquare,
    defaultMid: '#FF1F7E',
    defaultEnd: '#4285F4',
    badgeText: 'Modulating Feedback',
    description: 'Vocal production waveforms & synthetic voice loops'
  },
  { 
    id: 4, 
    label: 'Processing', 
    icon: Brain,
    defaultMid: '#9C27B0',
    defaultEnd: '#24D6FF',
    badgeText: 'Thinking Mode',
    description: 'Active core compute thread simulation'
  },
  { 
    id: 5, 
    label: 'Anticipating', 
    icon: Sparkles,
    defaultMid: '#3F51B5',
    defaultEnd: '#FF1F7E',
    badgeText: 'Heuristic Model',
    description: 'Predictive neural model anticipating queries'
  }
];

// Utility to cleanly interpolate hex colors for fluid/energy state transitions
const interpolateHexColors = (colorA: string, colorB: string, fraction: number): string => {
  if (!colorA || !colorB) return colorA || colorB || '#121212';
  try {
    const rA = parseInt(colorA.slice(1, 3), 16);
    const gA = parseInt(colorA.slice(3, 5), 16);
    const bA = parseInt(colorA.slice(5, 7), 16);
    
    const rB = parseInt(colorB.slice(1, 3), 16);
    const gB = parseInt(colorB.slice(3, 5), 16);
    const bB = parseInt(colorB.slice(5, 7), 16);
    
    const r = Math.round(rA + (rB - rA) * fraction);
    const g = Math.round(gA + (gB - gA) * fraction);
    const b = Math.round(bA + (bB - bA) * fraction);
    
    const rHex = r.toString(16).padStart(2, '0');
    const gHex = g.toString(16).padStart(2, '0');
    const bHex = b.toString(16).padStart(2, '0');
    
    return `#${rHex}${gHex}${bHex}`;
  } catch (e) {
    return colorB;
  }
};

interface ComponentInstance {
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

const M3_COLOR_LIBRARIES: Record<string, {
  name: string;
  colors: Record<'light' | 'dark', Record<'primary' | 'secondary' | 'surface', { bg: string; text: string; subtext: string; label: string }>>
}> = {
  'baseline-blue': {
    name: 'Material Baseline Blue',
    colors: {
      light: {
        primary: { bg: '#0061A4', text: '#FFFFFF', subtext: '#D1E4FF', label: 'Primary blue' },
        secondary: { bg: '#D7E3F7', text: '#101C2B', subtext: '#3B4858', label: 'Secondary container' },
        surface: { bg: '#F8FAFD', text: '#1A1C1E', subtext: '#44474E', label: 'Surface container' }
      },
      dark: {
        primary: { bg: '#A4C9FE', text: '#003258', subtext: '#D1E4FF', label: 'Primary dark blue' },
        secondary: { bg: '#3C4858', text: '#D7E3F7', subtext: '#BCC7DB', label: 'Secondary dark container' },
        surface: { bg: '#111318', text: '#E2E2E9', subtext: '#C4C6CF', label: 'Surface dark container' }
      }
    }
  },
  'default-purple': {
    name: 'Material Baseline Purple',
    colors: {
      light: {
        primary: { bg: '#6750A4', text: '#FFFFFF', subtext: '#EADDFF', label: 'Primary filled purple' },
        secondary: { bg: '#E8DEF8', text: '#1D192B', subtext: '#49454F', label: 'Secondary container' },
        surface: { bg: '#FEF7FF', text: '#1D1B20', subtext: '#49454F', label: 'Surface container' }
      },
      dark: {
        primary: { bg: '#D0BCFF', text: '#381E72', subtext: '#381E72', label: 'Primary dark purple' },
        secondary: { bg: '#332D41', text: '#E8DEF8', subtext: '#CCC2DC', label: 'Secondary dark container' },
        surface: { bg: '#141218', text: '#E6E1E5', subtext: '#938F99', label: 'Surface dark container' }
      }
    }
  },
  'terra-cotta': {
    name: 'Material Terracotta Rose',
    colors: {
      light: {
        primary: { bg: '#9C423B', text: '#FFFFFF', subtext: '#FFDAD6', label: 'Primary Warm Red' },
        secondary: { bg: '#FFDAD6', text: '#410002', subtext: '#5D1110', label: 'Secondary Clay' },
        surface: { bg: '#FFF8F7', text: '#231A19', subtext: '#534341', label: 'Warm Earth Surface' }
      },
      dark: {
        primary: { bg: '#FFB4AB', text: '#5D1110', subtext: '#80100D', label: 'Dark Clay Red' },
        secondary: { bg: '#5D1110', text: '#FFDAD6', subtext: '#FFB4AB', label: 'Dark Clay Container' },
        surface: { bg: '#1D1514', text: '#EDE0DE', subtext: '#A08C8A', label: 'Dark Earth Surface' }
      }
    }
  },
  'forest-jade': {
    name: 'Material Emerald Forest',
    colors: {
      light: {
        primary: { bg: '#386A20', text: '#FFFFFF', subtext: '#DFE8D8', label: 'Primary Jade' },
        secondary: { bg: '#E8F5E9', text: '#0C140E', subtext: '#1B5E20', label: 'Secondary Lime' },
        surface: { bg: '#F1FBF0', text: '#191E19', subtext: '#434943', label: 'Forest Mint Surface' }
      },
      dark: {
        primary: { bg: '#B2D0AC', text: '#1A330E', subtext: '#1A330E', label: 'Dark Basil Green' },
        secondary: { bg: '#334D2E', text: '#E8F5E9', subtext: '#B2D0AC', label: 'Dark Eco Container' },
        surface: { bg: '#0C140E', text: '#E2E3DD', subtext: '#8E928C', label: 'Dark Moss Surface' }
      }
    }
  },
  'ocean-azure': {
    name: 'Material Ocean Azure',
    colors: {
      light: {
        primary: { bg: '#00658B', text: '#FFFFFF', subtext: '#C9E6FF', label: 'Primary Blue' },
        secondary: { bg: '#C9E6FF', text: '#001E2E', subtext: '#004C6A', label: 'Secondary Lagoon' },
        surface: { bg: '#F7FAFC', text: '#191C1E', subtext: '#41484D', label: 'Soft Slate Surface' }
      },
      dark: {
        primary: { bg: '#80CFFF', text: '#00344A', subtext: '#004C6A', label: 'Dark Ocean Blue' },
        secondary: { bg: '#00354C', text: '#C9E6FF', subtext: '#80CFFF', label: 'Dark Lagoon Container' },
        surface: { bg: '#0A1318', text: '#E2E2E5', subtext: '#8B9197', label: 'Dark Abyssal Surface' }
      }
    }
  },
  'golden-amber': {
    name: 'Material Golden Amber',
    colors: {
      light: {
        primary: { bg: '#765B00', text: '#FFFFFF', subtext: '#FFE082', label: 'Primary Golden Yellow' },
        secondary: { bg: '#FFE082', text: '#241A00', subtext: '#523E00', label: 'Secondary Maize' },
        surface: { bg: '#FFFDF6', text: '#1D1B16', subtext: '#4B473E', label: 'Soft Alabaster Surface' }
      },
      dark: {
        primary: { bg: '#E9C400', text: '#3E3000', subtext: '#523E00', label: 'Dark Marigold' },
        secondary: { bg: '#3D2F00', text: '#FFE082', subtext: '#E9C400', label: 'Dark Maize Container' },
        surface: { bg: '#1C1B12', text: '#E6E2D8', subtext: '#969185', label: 'Dark Amber Surface' }
      }
    }
  },
  'electric-neon': {
    name: 'Material Cyber Violet',
    colors: {
      light: {
        primary: { bg: '#A00078', text: '#FFFFFF', subtext: '#FFD8EC', label: 'Primary Cyber Magenta' },
        secondary: { bg: '#FFD8EC', text: '#3B002A', subtext: '#700053', label: 'Secondary Lavender Rose' },
        surface: { bg: '#FFF8F9', text: '#201A1D', subtext: '#4F4349', label: 'Neon Orchid Surface' }
      },
      dark: {
        primary: { bg: '#FFADE3', text: '#5E0045', subtext: '#7A005B', label: 'Dark Laser Pink' },
        secondary: { bg: '#40002F', text: '#FFD8EC', subtext: '#FFADE3', label: 'Dark Orchid Container' },
        surface: { bg: '#181216', text: '#EBE0E4', subtext: '#9B8E93', label: 'Dark Synthwave Surface' }
      }
    }
  },
  'stormy-graphite': {
    name: 'Material Monochrome Slate',
    colors: {
      light: {
        primary: { bg: '#1A1A1A', text: '#FFFFFF', subtext: '#EBEBEB', label: 'Primary Obsidian Jet' },
        secondary: { bg: '#E5E5E5', text: '#111111', subtext: '#555555', label: 'Secondary Platinum' },
        surface: { bg: '#FAFAFA', text: '#222222', subtext: '#666666', label: 'Minimalist Frost White' }
      },
      dark: {
        primary: { bg: '#FFFFFF', text: '#111111', subtext: '#CDCDCD', label: 'Dark Silver Solid' },
        secondary: { bg: '#2D2D2D', text: '#FFFFFF', subtext: '#8E8E8E', label: 'Dark Platinum Container' },
        surface: { bg: '#121212', text: '#E5E5E5', subtext: '#9A9A9A', label: 'Dark Obsidian Surface' }
      }
    }
  }
};

const M3_FONT_STYLES: Record<string, { name: string; class: string }> = {
  displayLarge: { name: 'Display Large (57px)', class: 'text-3xl md:text-[38px] lg:text-[44px] font-normal tracking-[-0.04em] leading-none font-sans' },
  headlineMedium: { name: 'Headline Medium (28px)', class: 'text-xl md:text-[24px] lg:text-[28px] font-semibold tracking-normal leading-tight font-sans' },
  headlineSmall: { name: 'Headline Small (24px)', class: 'text-[24px] font-semibold tracking-normal leading-tight font-sans' },
  titleLarge: { name: 'Title Large (22px)', class: 'text-lg md:text-[20px] font-bold tracking-normal leading-snug font-sans' },
  titleMedium: { name: 'Title Medium (16px)', class: 'text-[16px] font-medium tracking-[0.15px] leading-snug font-sans' },
  titleSmall: { name: 'Title Small (14px)', class: 'text-[14px] font-bold tracking-[0.01em] leading-normal font-sans' },
  bodyLarge: { name: 'Body Large (16px)', class: 'text-[15px] font-normal tracking-[0.02em] leading-relaxed font-sans opacity-95' },
  bodyMedium: { name: 'Body Medium (14px)', class: 'text-[13px] font-normal tracking-[0.01em] leading-relaxed font-sans opacity-85' },
  bodySmall: { name: 'Body Small (12px)', class: 'text-[12px] font-normal tracking-[0.4px] leading-normal font-sans opacity-80' },
  labelLarge: { name: 'Label Large Button (14px)', class: 'text-[13px] font-bold uppercase tracking-wider font-sans' },
  labelMedium: { name: 'Label Medium (12px)', class: 'text-[11.5px] font-medium tracking-[0.02em] font-sans' },
  subtextMicro: { name: 'Subtext Micro (10px)', class: 'text-[9.5px] font-sans tracking-wider opacity-80' },
};

const M3_SIZE_PRESETS = {
  button: {
    xsmall: { width: 90, height: 26, borderRadius: 13 },
    small: { width: 120, height: 32, borderRadius: 16 },
    medium: { width: 160, height: 40, borderRadius: 20 },
    large: { width: 220, height: 56, borderRadius: 28 },
    xlarge: { width: 260, height: 64, borderRadius: 32 }
  },
  chip: {
    xsmall: { width: 80, height: 24, borderRadius: 6 },
    small: { width: 100, height: 28, borderRadius: 8 },
    medium: { width: 120, height: 32, borderRadius: 8 },
    large: { width: 140, height: 36, borderRadius: 8 },
    xlarge: { width: 160, height: 44, borderRadius: 10 }
  },
  fab: {
    xsmall: { width: 32, height: 32, borderRadius: 10 },
    small: { width: 40, height: 40, borderRadius: 12 },
    medium: { width: 56, height: 56, borderRadius: 16 },
    large: { width: 96, height: 96, borderRadius: 28 },
    xlarge: { width: 120, height: 120, borderRadius: 36 }
  },
  badge: {
    xsmall: { width: 10, height: 10, borderRadius: 5 },
    small: { width: 16, height: 16, borderRadius: 8 },
    medium: { width: 32, height: 16, borderRadius: 8 },
    large: { width: 56, height: 16, borderRadius: 8 },
    xlarge: { width: 72, height: 22, borderRadius: 11 }
  },
  sheets: {
    xsmall: { width: 180, height: 120, borderRadius: 12 },
    small: { width: 240, height: 180, borderRadius: 16 },
    medium: { width: 300, height: 240, borderRadius: 16 },
    large: { width: 360, height: 300, borderRadius: 20 },
    xlarge: { width: 420, height: 360, borderRadius: 24 }
  },
  avatar: {
    xsmall: { width: 24, height: 24, borderRadius: 12 },
    small: { width: 32, height: 32, borderRadius: 16 },
    medium: { width: 44, height: 44, borderRadius: 22 },
    large: { width: 64, height: 64, borderRadius: 32 },
    xlarge: { width: 96, height: 96, borderRadius: 48 }
  },
  progress: {
    xsmall: { width: 120, height: 4, borderRadius: 2 },
    small: { width: 160, height: 4, borderRadius: 2 },
    medium: { width: 200, height: 8, borderRadius: 4 },
    large: { width: 240, height: 8, borderRadius: 4 },
    xlarge: { width: 280, height: 12, borderRadius: 6 }
  },
  card: {
    xsmall: { width: 180, height: 100, borderRadius: 8 },
    small: { width: 240, height: 140, borderRadius: 12 },
    medium: { width: 300, height: 180, borderRadius: 12 },
    large: { width: 360, height: 220, borderRadius: 12 },
    xlarge: { width: 420, height: 260, borderRadius: 16 }
  },
  dialog: {
    xsmall: { width: 240, height: 120, borderRadius: 20 },
    small: { width: 280, height: 160, borderRadius: 28 },
    medium: { width: 320, height: 200, borderRadius: 28 },
    large: { width: 400, height: 260, borderRadius: 28 },
    xlarge: { width: 480, height: 320, borderRadius: 32 }
  }
};

interface InteractiveClick {
  id: string;
  x: number;
  y: number;
  time: string;
  timestamp?: number;
}

export default function App() {
  const [canvasComponents, setCanvasComponents] = useState<ComponentInstance[]>([]);
  const [selectedComponentId, setSelectedComponentId] = useState<string>('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [dragSelect, setDragSelect] = useState<{startX:number;startY:number;curX:number;curY:number} | null>(null);
  const activeComp = canvasComponents.find(c => c.id === selectedComponentId) as ComponentInstance | undefined;
  const [globalColorLibrary, setGlobalColorLibrary] = useState<string>('baseline-blue');

  // --- FIGMA FILES LINKING & VIEWS ---
  const [linkedFigmaFiles, setLinkedFigmaFiles] = useState<LinkedFigmaFile[]>(() => {
    const stored = localStorage.getItem('m3_linked_figma_files');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error(e);
      }
    }
    return [
      { id: 'fig-1', name: 'material_3_fluid_energy_spec.fig', url: 'https://figma.com/file/material_3_fluid_energy_spec' },
      { id: 'fig-2', name: 'm3_cyberpunk_mobile_layouts.fig', url: 'https://figma.com/file/cyberpunk_m3_frames' }
    ];
  });

  const [selectedFigmaFileId, setSelectedFigmaFileId] = useState<string>('none');

  // Load saved configurations
  const [savedCombinations, setSavedCombinations] = useState<SavedCombination[]>(() => {
    const stored = localStorage.getItem('m3_saved_combinations');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error(e);
      }
    }
    // Starts completely empty, with no unrequested demo files or combinations
    return [];
  });

  const [activeCombinationId, setActiveCombinationId] = useState<string | null>(null);

  // Modal forms management
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [sharedImportCombination, setSharedImportCombination] = useState<SavedCombination | null>(null);

  const [isSettingFigmaModalOpen, setIsSettingFigmaModalOpen] = useState(false);
  const [newFigmaName, setNewFigmaName] = useState('');
  const [newFigmaUrl, setNewFigmaUrl] = useState('');

  const [newComboName, setNewComboName] = useState('');
  const [newComboFileId, setNewComboFileId] = useState('fig-1');
  const [isSaveComboModalOpen, setIsSaveComboModalOpen] = useState(false);

  // Figma custom layer link configuration dialog states
  const [activeLinkCombination, setActiveLinkCombination] = useState<SavedCombination | null>(null);
  const [isLayerLinkModalOpen, setIsLayerLinkModalOpen] = useState<boolean>(false);
  const [modalFigmaName, setModalFigmaName] = useState<string>('');
  const [modalFigmaUrl, setModalFigmaUrl] = useState<string>('');

  useEffect(() => {
    if (activeLinkCombination && activeLinkCombination.figmaFileId && activeLinkCombination.figmaFileId !== 'none') {
      const currentFile = linkedFigmaFiles.find(f => f.id === activeLinkCombination.figmaFileId);
      if (currentFile) {
        setModalFigmaName(currentFile.name);
        setModalFigmaUrl(currentFile.url);
      } else {
        setModalFigmaName('');
        setModalFigmaUrl('');
      }
    } else {
      setModalFigmaName('');
      setModalFigmaUrl('');
    }
  }, [activeLinkCombination, linkedFigmaFiles]);

  // Persistence triggers
  useEffect(() => {
    localStorage.setItem('m3_linked_figma_files', JSON.stringify(linkedFigmaFiles));
  }, [linkedFigmaFiles]);

  useEffect(() => {
    localStorage.setItem('m3_saved_combinations', JSON.stringify(savedCombinations));
  }, [savedCombinations]);

  // Listen for delete/backspace key globally to delete selected component
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid deleting when user is typing inside input, select, or textarea
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'SELECT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }

      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedComponentId) {
        handleDeleteComponent(selectedComponentId);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedComponentId, canvasComponents]);

  // URL Shared spec parser
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const importCode = params.get('import');
    if (importCode) {
      try {
        const decoded = decodeURIComponent(escape(atob(importCode)));
        const parsed = JSON.parse(decoded);
        if (parsed && typeof parsed === 'object' && parsed.name && Array.isArray(parsed.components)) {
          setSharedImportCombination(parsed);
          setIsImportModalOpen(true);
        }
      } catch (err) {
        console.error("Failed to parse imported combination layout:", err);
      }
    }
  }, []);

  const handleSaveCurrentCombination = (name: string, figmaFileId: string) => {
    if (!name.trim()) {
      showToast("Please enter a valid configuration name.");
      return;
    }
    const newCombo: SavedCombination = {
      id: `combo-${Math.random().toString(36).substring(2, 9)}`,
      name: name.trim(),
      figmaFileId,
      components: JSON.parse(JSON.stringify(canvasComponents)),
      activeBackdrop,
      liveFrameUrl,
      uploadedFrameUrl,
      uploadedFrameName,
      backdropOpacity,
      backdropScale,
      isBackdropVisible,
      canvasBgMode,
      globalColorLibrary,
      activeState
    };

    setSavedCombinations(prev => {
      const filtered = prev.filter(c => c.name.toLowerCase() !== name.trim().toLowerCase());
      return [...filtered, newCombo];
    });
    setActiveCombinationId(newCombo.id);
    setSelectedFigmaFileId(figmaFileId);
    setIsSaveComboModalOpen(false);
    showToast(`Saved layout "${name.trim()}" successfully!`);
  };

  const handleDeleteCombination = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSavedCombinations(prev => prev.filter(c => c.id !== id));
    if (activeCombinationId === id) {
      setActiveCombinationId(null);
    }
    showToast("Layout combination removed.");
  };

  const handleShareCombination = (comb: SavedCombination, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const ser = JSON.stringify(comb);
      const encoded = btoa(unescape(encodeURIComponent(ser)));
      const shareUrl = `${window.location.origin}${window.location.pathname}?import=${encoded}`;
      
      navigator.clipboard.writeText(shareUrl)
        .then(() => {
          showToast(`Copied shareable layout URL! Share this link with your team.`);
        })
        .catch(() => {
          const tempInput = document.createElement('textarea');
          tempInput.value = shareUrl;
          document.body.appendChild(tempInput);
          tempInput.select();
          document.execCommand('copy');
          document.body.removeChild(tempInput);
          showToast(`Copied share link (fallback approach)!`);
        });
    } catch (err) {
      showToast("Share failed: Cannot serialize custom layout specs.");
    }
  };

  const handleLoadCombination = (comb: SavedCombination) => {
    setCanvasComponents(JSON.parse(JSON.stringify(comb.components)));
    setActiveBackdrop(comb.activeBackdrop);
    setLiveFrameUrl(comb.liveFrameUrl || 'https://example.com');
    setUploadedFrameUrl(comb.uploadedFrameUrl || null);
    setUploadedFrameName(comb.uploadedFrameName || null);
    setBackdropOpacity(comb.backdropOpacity ?? 0.65);
    setBackdropScale(comb.backdropScale ?? 100);
    setIsBackdropVisible(comb.isBackdropVisible ?? true);
    setCanvasBgMode(comb.canvasBgMode || 'dark');
    setGlobalColorLibrary(comb.globalColorLibrary || 'baseline-blue');
    setActiveState(comb.activeState || 2);
    setSelectedFigmaFileId(comb.figmaFileId || 'fig-1');
    setActiveCombinationId(comb.id);
    if (comb.components.length > 0) {
      setSelectedComponentId(comb.components[0].id);
    } else {
      setSelectedComponentId('');
    }
    showToast(`Loaded combination blueprint: "${comb.name}"`);
  };

  const handleStartNewViewScratch = () => {
    setNewScratchName('New Custom Project');
    setNewScratchFileId('none');
    setIsNewFromScratchModalOpen(true);
  };

  const handleCreateCustomScratch = () => {
    setCanvasComponents([]);
    setSelectedComponentId('');
    setActiveCombinationId(null);
    setActiveBackdrop('none');
    setUploadedFrameUrl(null);
    setUploadedFrameName(null);
    setLiveFrameUrl('https://example.com');
    if (newScratchFileId && newScratchFileId !== 'none') {
      setSelectedFigmaFileId(newScratchFileId);
      const matched = linkedFigmaFiles.find(f => f.id === newScratchFileId);
      showToast(`Started "${newScratchName}" linked to ${matched ? matched.name : 'external file'}!`);
    } else {
      showToast(`Started a brand new project "${newScratchName}" from scratch!`);
    }
    setIsNewFromScratchModalOpen(false);
  };

  const handleCreateNewCanvas = () => {
    setCanvasComponents([]);
    setSelectedComponentId('');
    setActiveCombinationId(null);
    setActiveBackdrop('none');
    setUploadedFrameUrl(null);
    setUploadedFrameName(null);
    setLiveFrameUrl('https://example.com');
    showToast("Cleared workspace canvas. Ready for new specimens!");
  };

  const handleSelectColorLibrary = (libraryId: string) => {
    setGlobalColorLibrary(libraryId);
    setCanvasComponents(prev => prev.map(c => ({
      ...c,
      colorLibrary: libraryId
    })));
    showToast(`Figma theme updated to: ${(customLibraries[libraryId] || M3_COLOR_LIBRARIES[libraryId])?.name || libraryId}`);
  };

  const handleToggleFooterButtonSize = (compId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCanvasComponents(prev => prev.map(c => {
      if (c.id === compId) {
        // @ts-ignore
        const current = c.footerButtonSize || 'medium';
        const next: 'small' | 'medium' | 'large' = current === 'small' ? 'medium' : current === 'medium' ? 'large' : 'small';
        showToast(`Action buttons resized to ${next.toUpperCase()}`);
        return { ...c, footerButtonSize: next };
      }
      return c;
    }));
  };

  const handleRenameCombination = (id: string, newName: string) => {
    setEditingCombinationId(null);
    if (!newName.trim()) return;
    setSavedCombinations(prev => prev.map(c => {
      if (c.id === id) {
        return { ...c, name: newName.trim() };
      }
      return c;
    }));
    showToast("Combination renamed successfully.");
  };

  const handleDownloadFigmaPluginZip = async () => {
    try {
      const zip = new JSZip();
      
      // manifest.json
      zip.file('manifest.json', JSON.stringify({
        name: "M3 Shape Spec Motion Simulator",
        id: "m3-shape-spec-motion",
        api: "1.0.0",
        main: "code.js",
        ui: "ui.html",
        editorType: ["figma"]
      }, null, 2));

      // code.js
      zip.file('code.js', `figma.showUI(__html__, { width: 980, height: 750 });
figma.ui.onmessage = (msg) => {
  if (msg.type === "close") {
    figma.closePlugin();
  }
};`);

      // ui.html
      zip.file('ui.html', `<!DOCTYPE html>
<html>
<head>
  <style>
    body, html { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; background: #1E1E1E; }
    iframe { width: 100%; height: 100%; border: 0; }
  </style>
</head>
<body>
  <iframe src="${window.location.origin}"></iframe>
</body>
</html>`);

      const blob = await zip.generateAsync({ type: 'blob' });
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = 'm3-motion-tracker-plugin.zip';
      link.click();
      URL.revokeObjectURL(blobUrl);
      
      showToast("Downloaded installable Figma package list ZIP successfully!");
    } catch (err: any) {
      showToast(`Package packing failed: ${err.message}`);
    }
  };

  const handleAddFigmaFile = (name: string, url: string) => {
    if (!name.trim()) return;
    const newFile: LinkedFigmaFile = {
      id: `fig-${Math.random().toString(36).substring(2, 9)}`,
      name: name.trim(),
      url: url.trim() || 'https://figma.com/file/unnamed'
    };
    setLinkedFigmaFiles(prev => [...prev, newFile]);
    setSelectedFigmaFileId(newFile.id);
    setNewFigmaName('');
    setNewFigmaUrl('');
    setIsSettingFigmaModalOpen(false);
    showToast(`Linked Figma file: "${name}"`);
  };

  const handleDeleteFigmaFile = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (id === 'fig-1') {
      showToast("Cannot remove default M3 guidelines specification.");
      return;
    }
    setLinkedFigmaFiles(prev => prev.filter(f => f.id !== id));
    if (selectedFigmaFileId === id) {
      setSelectedFigmaFileId('fig-1');
    }
    showToast("Linked Figma design referential frame removed.");
  };

  // Dynamic component lifecycle helpers
  const handleAddNewComponent = (type: ComponentInstance['type']) => {
    const id = `comp-${Math.random().toString(36).substring(2, 9)}`;
    // Assign sensible defaults by component type
    let name = `❖ Custom ${type.toUpperCase()}`;
    let width = 240;
    let height = 100;
    let borderRadius = 16;
    let text = "Custom specimen";
    let title = "Custom Title";
    let containerType: 'primary' | 'secondary' | 'surface' = 'surface';
    let icon = 'volume_up';

    if (type === 'button') {
      name = `🏆 Button ${Math.floor(Math.random() * 90) + 10}`;
      width = 160;
      height = 40;
      borderRadius = 9999;
      text = "Action";
      containerType = 'surface';
      icon = 'touch_app';
    } else if (type === 'card') {
      name = `❖ Card ${Math.floor(Math.random() * 90) + 10}`;
      width = 300;
      height = 360;
      borderRadius = 16;
      text = "Continuous wave rendering is active.";
      title = "Card Title";
      containerType = 'surface';
      icon = 'layers';
    } else if (type === 'chip') {
      name = `🏷️ Chip ${Math.floor(Math.random() * 90) + 10}`;
      width = 120;
      height = 32;
      borderRadius = 8;
      text = "Interactive";
      containerType = 'surface';
      icon = 'tag';
    } else if (type === 'fab') {
      name = `✨ FAB ${Math.floor(Math.random() * 90) + 10}`;
      width = 56;
      height = 56;
      borderRadius = 16;
      text = "";
      containerType = 'surface';
      icon = 'add';
    } else if (type === 'dialog') {
      name = `💬 Dialog ${Math.floor(Math.random() * 90) + 10}`;
      width = 320;
      height = 200;
      borderRadius = 28;
      text = "Apply these changes to the canvas layout?";
      title = "Dialog Title";
      containerType = 'surface';
      icon = 'warning';
    } else if (type === 'badge') {
      name = `📟 Badge ${Math.floor(Math.random() * 90) + 10}`;
      width = 48;
      height = 20;
      borderRadius = 10;
      text = "Live";
      containerType = 'surface';
      icon = 'campaign';
    } else if (type === 'sheets') {
      name = `📄 Page Sheet ${Math.floor(Math.random() * 90) + 10}`;
      width = 300;
      height = 240;
      borderRadius = 16;
      title = "Sheet Layout Info";
      text = "This sheets component offers additional details, dynamic context, or quick-access settings.";
      containerType = 'surface';
      icon = 'info';
    } else if (type === 'avatar') {
      name = `👤 Avatar ${Math.floor(Math.random() * 90) + 10}`;
      width = 44;
      height = 44;
      borderRadius = 22;
      text = "JD";
      containerType = 'surface';
      icon = 'person';
    } else if (type === 'progress') {
      name = `⏳ Progress ${Math.floor(Math.random() * 90) + 10}`;
      width = 200;
      height = 8;
      borderRadius = 4;
      text = "";
      containerType = 'primary';
      icon = 'bolt';
    }

    const newComp: ComponentInstance = {
      id,
      name,
      type,
      width,
      height,
      borderRadius,
      containerType,
      title,
      subtitle: 'Subtitle',
      text,
      x: Math.floor(Math.random() * 120) - 60,
      y: Math.floor(Math.random() * 100) - 50,
      activeIcon: icon,
      sizePreset: 'medium',
      fontStyleTitle: 'titleLarge',
      fontStyleText: 'bodyMedium',
      colorLibrary: globalColorLibrary,
      configShowIcon: true,
      configShowTitle: true,
      configShowSubtitle: true,
      configShowDescription: true,
      configShowActions: true,
      blurredEdges: false,
      avatarType: 'icon',
      variant: type === 'button' ? 'filled' : type === 'card' ? 'elevated' : type === 'chip' ? 'assist' : type === 'fab' ? 'primary' : type === 'dialog' ? 'standard' : 'standard',
      sizeMode: 'auto',
      heightMode: 'auto',
      activeState: 0,
      previousState: 0,
      transitionVal: 1.0,
    };

    setCanvasComponents(prev => [...prev, newComp]);
    setSelectedComponentId(id);
    showToast(`Added new ${type} "${name}" to canvas!`);
  };

  const handleDeleteComponent = (id: string) => {
    setCanvasComponents(prev => {
      const remaining = prev.filter(c => c.id !== id);
      if (selectedComponentId === id) {
        if (remaining.length > 0) {
          setSelectedComponentId(remaining[remaining.length - 1].id);
        } else {
          setSelectedComponentId('');
        }
      }
      return remaining;
    });
    showToast("Component deleted successfully.");
  };

  const handleDuplicateComponent = (id: string) => {
    const orig = canvasComponents.find(c => c.id === id);
    if (!orig) return;
    const copiedId = `comp-${Math.random().toString(36).substring(2, 9)}`;
    const copy: ComponentInstance = {
      ...orig,
      id: copiedId,
      name: `${orig.name} (Copy)`,
      x: orig.x + 30, // offset
      y: orig.y + 30
    };
    setCanvasComponents(prev => [...prev, copy]);
    setSelectedComponentId(copiedId);
    showToast(`Duplicated component metadata.`);
  };

  const handleMoveLayer = (id: string, direction: 'up' | 'down') => {
    const index = canvasComponents.findIndex(c => c.id === id);
    if (index === -1) return;
    const newIdx = direction === 'up' ? index + 1 : index - 1;
    if (newIdx < 0 || newIdx >= canvasComponents.length) return;

    setCanvasComponents(prev => {
      const arr = [...prev];
      const [moved] = arr.splice(index, 1);
      arr.splice(newIdx, 0, moved);
      return arr;
    });
  };

  const handleApplyPresetScene = (sceneType: 'assistant' | 'dialog' | 'dashboard') => {
    if (sceneType === 'assistant') {
      const cardId = 'scene-card-assistant';
      const buttonId = 'scene-btn-assistant';
      const chipId = 'scene-chip-assistant';
      const newComponents: ComponentInstance[] = [
        {
          id: cardId,
          name: '❖ Assistant Terminal',
          type: 'card',
          width: 320,
          height: 190,
          borderRadius: 24,
          containerType: 'primary',
          title: 'Smart AI Companion',
          subtitle: 'KINETIC STATE ACTIVE',
          text: 'Wave motion fluid energy rendering continuous interactive vectors.',
          x: -120,
          y: -40,
          activeIcon: 'chat',
          sizePreset: 'medium',
          fontStyleTitle: 'titleLarge',
          fontStyleText: 'bodyMedium',
          colorLibrary: globalColorLibrary,
          configShowIcon: true,
          configShowTitle: true,
          configShowSubtitle: true,
          configShowDescription: true,
          configShowActions: true
        },
        {
          id: buttonId,
          name: '🏆 Send Command Button',
          type: 'button',
          width: 180,
          height: 50,
          borderRadius: 25,
          containerType: 'primary',
          title: '',
          subtitle: '',
          text: 'SEND SPECIES COMMAND',
          x: 150,
          y: 60,
          activeIcon: 'near_me',
          sizePreset: 'medium',
          fontStyleTitle: 'labelMedium',
          fontStyleText: 'labelMedium',
          colorLibrary: globalColorLibrary,
          configShowIcon: true,
          configShowTitle: false,
          configShowSubtitle: false,
          configShowDescription: true,
          configShowActions: false
        },
        {
          id: chipId,
          name: '🏷️ AI Sensor Chip',
          type: 'chip',
          width: 140,
          height: 36,
          borderRadius: 8,
          containerType: 'secondary',
          title: '',
          subtitle: '',
          text: 'Sensor Active',
          x: 150,
          y: -10,
          activeIcon: 'radar',
          sizePreset: 'medium',
          fontStyleTitle: 'labelSmall',
          fontStyleText: 'labelSmall',
          colorLibrary: globalColorLibrary,
          configShowIcon: true,
          configShowTitle: false,
          configShowSubtitle: false,
          configShowDescription: true,
          configShowActions: false
        }
      ];
      setCanvasComponents(newComponents);
      setSelectedComponentId(cardId);
      showToast("Applied M3 Voice Assistant Preset Scene!");
    } else if (sceneType === 'dialog') {
      const dId = 'scene-dialog-prompt';
      const bId = 'scene-badge-p';
      const newComponents: ComponentInstance[] = [
        {
          id: dId,
          name: '💬 Core Prompt Dialog',
          type: 'dialog',
          width: 320,
          height: 200,
          borderRadius: 28,
          containerType: 'surface',
          title: 'Save dynamic parameters?',
          subtitle: 'SYSTEM CHECK',
          text: 'Commit these interactive shader motion specifications directly to the Figma workspace draft?',
          x: -40,
          y: 20,
          activeIcon: 'warning',
          sizePreset: 'medium',
          fontStyleTitle: 'titleLarge',
          fontStyleText: 'bodyMedium',
          colorLibrary: globalColorLibrary,
          configShowIcon: true,
          configShowTitle: true,
          configShowSubtitle: false,
          configShowDescription: true,
          configShowActions: true
        },
        {
          id: bId,
          name: '⏳ Progress Indicator',
          type: 'progress',
          width: 200,
          height: 8,
          borderRadius: 4,
          containerType: 'secondary',
          title: '',
          subtitle: '',
          text: 'Loading Sync...',
          x: -40,
          y: -120,
          activeIcon: 'bolt',
          sizePreset: 'medium',
          fontStyleTitle: 'labelSmall',
          fontStyleText: 'labelSmall',
          colorLibrary: globalColorLibrary,
          configShowIcon: false,
          configShowTitle: false,
          configShowSubtitle: false,
          configShowDescription: true,
          configShowActions: false
        }
      ];
      setCanvasComponents(newComponents);
      setSelectedComponentId(dId);
      showToast("Applied Dialog Prompt Preset Scene!");
    } else if (sceneType === 'dashboard') {
      const chip1Id = 'scene-dash-c1';
      const chip2Id = 'scene-dash-c2';
      const btnId = 'scene-dash-btn';
      const fabId = 'scene-dash-fab';
      const newComponents: ComponentInstance[] = [
        {
          id: chip1Id,
          name: '🏷️ Activity Chip',
          type: 'chip',
          width: 140,
          height: 36,
          borderRadius: 8,
          containerType: 'primary',
          title: '',
          subtitle: '',
          text: 'Activity: 94%',
          x: -160,
          y: -60,
          activeIcon: 'trending_up',
          sizePreset: 'medium',
          fontStyleTitle: 'labelSmall',
          fontStyleText: 'labelSmall',
          colorLibrary: globalColorLibrary,
          configShowIcon: true,
          configShowTitle: false,
          configShowSubtitle: false,
          configShowDescription: true,
          configShowActions: false
        },
        {
          id: chip2Id,
          name: '🏷️ Thermal Chip',
          type: 'chip',
          width: 140,
          height: 36,
          borderRadius: 8,
          containerType: 'secondary',
          title: '',
          subtitle: '',
          text: 'Temp: stable',
          x: -160,
          y: -10,
          activeIcon: 'thermostat',
          sizePreset: 'medium',
          fontStyleTitle: 'labelSmall',
          fontStyleText: 'labelSmall',
          colorLibrary: globalColorLibrary,
          configShowIcon: true,
          configShowTitle: false,
          configShowSubtitle: false,
          configShowDescription: true,
          configShowActions: false
        },
        {
          id: btnId,
          name: '🏆 Core Run Button',
          type: 'button',
          width: 200,
          height: 52,
          borderRadius: 26,
          containerType: 'surface',
          title: '',
          subtitle: '',
          text: 'LAUNCH WAVE SEQUENCE',
          x: 80,
          y: -30,
          activeIcon: 'rocket_launch',
          sizePreset: 'medium',
          fontStyleTitle: 'labelMedium',
          fontStyleText: 'labelMedium',
          colorLibrary: globalColorLibrary,
          configShowIcon: true,
          configShowTitle: false,
          configShowSubtitle: false,
          configShowDescription: true,
          configShowActions: false
        },
        {
          id: fabId,
          name: '✨ Kinetic Action FAB',
          type: 'fab',
          width: 64,
          height: 64,
          borderRadius: 16,
          containerType: 'primary',
          title: '',
          subtitle: '',
          text: '',
          x: 80,
          y: 50,
          activeIcon: 'add',
          sizePreset: 'medium',
          fontStyleTitle: 'bodyMedium',
          fontStyleText: 'bodyMedium',
          colorLibrary: globalColorLibrary,
          configShowIcon: true,
          configShowTitle: false,
          configShowSubtitle: false,
          configShowDescription: false,
          configShowActions: false
        }
      ];
      setCanvasComponents(newComponents);
      setSelectedComponentId(btnId);
      showToast("Applied M3 Cyber dashboard Scene Preset!");
    }
  };

  const [activeState, setActiveState] = useState<number>(2);
  const [previousState, setPreviousState] = useState<number>(2);
  const [transitionVal, setTransitionVal] = useState<number>(1.0);

  // Real-time gesture interaction logging
  const [recordedClicks, setRecordedClicks] = useState<InteractiveClick[]>([]);

  // Core configurable variables
  const [intensity, setIntensity] = useState<number>(0.85);
  const [isAnimationActive, setIsAnimationActive] = useState<boolean>(true);
  const [canvasBgMode, setCanvasBgMode] = useState<'dark' | 'light'>('light');
  const [gridVisible, setGridVisible] = useState<boolean>(true);
  const [isPluginModalOpen, setIsPluginModalOpen] = useState<boolean>(false);

  // Design backdrop features (Placing actual mockup layouts behind component)
  const [isBackdropVisible, setIsBackdropVisible] = useState<boolean>(true);
  const [activeBackdrop, setActiveBackdrop] = useState<string>('solid');
  const [uploadedFrameUrl, setUploadedFrameUrl] = useState<string | null>(null);
  const [uploadedFrameName, setUploadedFrameName] = useState<string | null>(null);
  const [liveFrameUrl, setLiveFrameUrl] = useState<string>('https://example.com');
  const [backdropOpacity, setBackdropOpacity] = useState<number>(0.65);
  const [backdropScale, setBackdropScale] = useState<number>(100);
  const [backdropSolidColor, setBackdropSolidColor] = useState<string>('#FEF7FF');
  const [hasCustomColorDefined, setHasCustomColorDefined] = useState<boolean>(false);

  // Custom User Color Libraries
  const [customLibraries, setCustomLibraries] = useState<Record<string, any>>(() => {
    try {
      const saved = localStorage.getItem('m3_custom_color_libraries');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });
  
  // Persistent API reference link
  const [apiUrl, setApiUrl] = useState<string>(() => {
    return localStorage.getItem('m3_api_url') || 'https://serve-dot-zipline.googleplex.com/asset/ac3dc997-fbb3-5e10-8d08-fd2b37b4f0b9/energy.glsl';
  });
  const [isEditingApiUrl, setIsEditingApiUrl] = useState<boolean>(false);

  const [showAddLibraryForm, setShowAddLibraryForm] = useState<boolean>(false);
  const [newLibName, setNewLibName] = useState<string>('');
  
  // Custom Library Quick color pickers
  const [newLibPrimaryLight, setNewLibPrimaryLight] = useState<string>('#6750A4');
  const [newLibSecondaryLight, setNewLibSecondaryLight] = useState<string>('#E8DEF8');
  const [newLibSurfaceLight, setNewLibSurfaceLight] = useState<string>('#FEF7FF');

  const [newLibPrimaryDark, setNewLibPrimaryDark] = useState<string>('#D0BCFF');
  const [newLibSecondaryDark, setNewLibSecondaryDark] = useState<string>('#332D41');
  const [newLibSurfaceDark, setNewLibSurfaceDark] = useState<string>('#141218');
  
  const [pastedJson, setPastedJson] = useState<string>('');

  const getContrastColor = (hex: string) => {
    const cleanHex = hex.replace('#', '');
    if (cleanHex.length < 6) return '#FFFFFF';
    const r = parseInt(cleanHex.substr(0, 2), 16);
    const g = parseInt(cleanHex.substr(2, 2), 16);
    const b = parseInt(cleanHex.substr(4, 2), 16);
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return (yiq >= 128) ? '#1E1E1E' : '#FFFFFF';
  };

  const handleAddCustomLibrary = () => {
    if (!newLibName.trim()) {
      showToast("Please provide a name for your custom library.");
      return;
    }

    try {
      let colorsObj;
      if (pastedJson.trim()) {
        const parsed = JSON.parse(pastedJson);
        if (!parsed.colors || !parsed.colors.light || !parsed.colors.dark) {
          throw new Error("Invalid format. Must contain colors.light and colors.dark object definitions.");
        }
        colorsObj = parsed.colors;
      } else {
        colorsObj = {
          light: {
            primary: { bg: newLibPrimaryLight, text: getContrastColor(newLibPrimaryLight), subtext: newLibPrimaryLight + '30', label: 'Primary' },
            secondary: { bg: newLibSecondaryLight, text: getContrastColor(newLibSecondaryLight), subtext: newLibSecondaryLight + '30', label: 'Secondary' },
            surface: { bg: newLibSurfaceLight, text: getContrastColor(newLibSurfaceLight), subtext: newLibSurfaceLight + '30', label: 'Surface' }
          },
          dark: {
            primary: { bg: newLibPrimaryDark, text: getContrastColor(newLibPrimaryDark), subtext: newLibPrimaryDark + '30', label: 'Primary Dark' },
            secondary: { bg: newLibSecondaryDark, text: getContrastColor(newLibSecondaryDark), subtext: newLibSecondaryDark + '30', label: 'Secondary Dark' },
            surface: { bg: newLibSurfaceDark, text: getContrastColor(newLibSurfaceDark), subtext: newLibSurfaceDark + '30', label: 'Surface Dark' }
          }
        };
      }

      const libraryId = `custom-${Date.now()}`;
      const updated = {
        ...customLibraries,
        [libraryId]: {
          name: newLibName.trim(),
          colors: colorsObj
        }
      };

      setCustomLibraries(updated);
      localStorage.setItem('m3_custom_color_libraries', JSON.stringify(updated));

      // Auto update active theme or component
      if (activeComp) {
        updateActiveComponentField('colorLibrary', libraryId);
      } else {
        setGlobalColorLibrary(libraryId);
      }

      setNewLibName('');
      setPastedJson('');
      setShowAddLibraryForm(false);
      showToast(`Custom colors "${newLibName.trim()}" successfully attached!`);
    } catch (err: any) {
      showToast(`Attach error: ${err.message}`);
    }
  };

  // Dragging and Resizing interaction variables
  const startDragRef = useRef<{ startX: number; startY: number; startPosX: number; startPosY: number; startWidth: number; startHeight: number } | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [draggingComponentId, setDraggingComponentId] = useState<string | null>(null);
  
  const [isResizing, setIsResizing] = useState<string | null>(null); // 'se' | 's' | 'e'
  const [resizingComponentId, setResizingComponentId] = useState<string | null>(null);

  // Interactive capture states
  const [exportFormat, setExportFormat] = useState<'png' | 'mp4' | 'gif'>('mp4');
  const [exportDuration, setExportDuration] = useState<number>(3);
  const [perfectLoop, setPerfectLoop] = useState<boolean>(true);
  const [exportStatus, setExportStatus] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingCount, setRecordingCount] = useState<number>(0);
  const [isRecordOptionsDialogOpen, setIsRecordOptionsDialogOpen] = useState<boolean>(false);
  const [compiledFile, setCompiledFile] = useState<{ url: string; filename: string; extension: string } | null>(null);

  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Crop & Recording Area Custom Configs
  const [isCropActive, setIsCropActive] = useState<boolean>(false);
  const [isAreaSelectionMode, setIsAreaSelectionMode] = useState<boolean>(false);
  const [recordingCountdown, setRecordingCountdown] = useState<number | null>(null);
  const [isRecordingPaused, setIsRecordingPaused] = useState<boolean>(false);

  // Recording workflow refs for external early termination, pausing, and snapshot storage
  const isRecordingPausedRef = useRef<boolean>(false);
  const activeMediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordIntervalRef = useRef<any>(null);
  const stopRecordingCallbackRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    isRecordingPausedRef.current = isRecordingPaused;
  }, [isRecordingPaused]);

  useEffect(() => {
    return () => {
      if (recordIntervalRef.current) clearInterval(recordIntervalRef.current);
    };
  }, []);

  const [cropRect, setCropRect] = useState<{ x: number; y: number; width: number; height: number }>({ x: 0, y: 0, width: 300, height: 200 });
  const [isResizingCrop, setIsResizingCrop] = useState<string | null>(null); // 'n' | 's' | 'e' | 'w' | 'nw' | 'ne' | 'se' | 'sw' | 'move' | 'marquee'
  const startCropDragRef = useRef<{ startX: number; startY: number; startXOffset: number; startYOffset: number; startWidth: number; startHeight: number } | null>(null);

  // Exporter Quality & Performance Controls
  const [recordFPS, setRecordFPS] = useState<number>(30); // 15 | 30 | 60
  const [recordResolutionMultiplier, setRecordResolutionMultiplier] = useState<number>(2.0); // Default to 2.0 (High quality Retina)
  const [recordBps, setRecordBps] = useState<number>(8000000); // 8 Mbps default bitrate for extreme clarity

  // Recording Option Flags
  const [recordShowClicks, setRecordShowClicks] = useState<boolean>(true);
  const [recordShowCursor, setRecordShowCursor] = useState<boolean>(true);
  const [recordInteractionsOnly, setRecordInteractionsOnly] = useState<boolean>(true);

  // Live cursor offset on active specimen for recording overlay
  const [recMousePos, setRecMousePos] = useState<{ x: number; y: number }>({ x: -100, y: -100 });

  // Inline/layer editing states
  const [editingCombinationId, setEditingCombinationId] = useState<string | null>(null);
  const [editingCombinationName, setEditingCombinationName] = useState<string>('');

  // From Scratch option dialog
  const [isNewFromScratchModalOpen, setIsNewFromScratchModalOpen] = useState<boolean>(false);
  const [newScratchName, setNewScratchName] = useState<string>('New Custom Specimen');
  const [newScratchFileId, setNewScratchFileId] = useState<string>('none');

  // Automatically clamp crop outline to chosen activeComp properties
  useEffect(() => {
    if (activeComp) {
      const canvasEl = document.getElementById('figma-editor-canvas');
      const w = canvasEl?.getBoundingClientRect().width || 1200;
      const h = canvasEl?.getBoundingClientRect().height || 800;
      const centerX = w / 2;
      const centerY = h / 2;
      const compLeft = centerX + activeComp.x - activeComp.width / 2;
      const compTop = centerY + activeComp.y - activeComp.height / 2;
      
      // Add a safe bleed padding around the component to prevent glows, glows, blooms, and active kinetic energy structures from being cropped
      const bleed = 85;
      setCropRect({
        x: Math.round(compLeft - bleed),
        y: Math.round(compTop - bleed),
        width: activeComp.width + (bleed * 2),
        height: activeComp.height + (bleed * 2)
      });
    } else {
      setCropRect({
        x: 100,
        y: 100,
        width: 600,
        height: 400
      });
    }
  }, [selectedComponentId, activeComp?.id, activeComp?.width, activeComp?.height]);

  // Support deleting the active selected component on preview using 'Delete' key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid intercepting when user is focused inside text input or select
      const activeEl = document.activeElement;
      if (activeEl && (
        activeEl.tagName === 'INPUT' || 
        activeEl.tagName === 'TEXTAREA' || 
        activeEl.getAttribute('contenteditable') === 'true'
      )) {
        return;
      }
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedComponentId) {
        handleDeleteComponent(selectedComponentId);
      }
      if (e.key === 'Escape') {
        setSelectedComponentId('');
        setActiveState(0);
        showToast("Cleared selection and deactivated M3 kinetic state (Esc)");
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedComponentId, canvasComponents]);

  // Transition controller between shader categories
  const handleStateClick = (stateId: number) => {
    if (selectedComponentId) {
      setCanvasComponents(prev => prev.map(c => {
        if (c.id === selectedComponentId) {
          const currentActive = c.activeState !== undefined ? c.activeState : 0;
          if (currentActive === stateId) {
            showToast("Returned selected specimen to state: Neutral Default");
            return {
              ...c,
              previousState: currentActive,
              activeState: 0,
              transitionVal: 0.0
            };
          } else {
            const stateObj = OFFICIAL_STATES.find(s => s.id === stateId);
            showToast(`Activated state: ${stateObj?.label || 'Custom'} on selected specimen`);
            return {
              ...c,
              previousState: currentActive,
              activeState: stateId,
              transitionVal: 0.0
            };
          }
        }
        return c;
      }));
    } else {
      if (stateId === activeState) {
        setPreviousState(activeState);
        setActiveState(0);
        setTransitionVal(0.0);
        showToast("Returned components to state: Neutral Default");
        return;
      }
      setPreviousState(activeState);
      setActiveState(stateId);
      setTransitionVal(0.0);
    }
  };

  useEffect(() => {
    if (transitionVal < 1.0) {
      let animFrameId: number;
      const startTime = performance.now();
      const duration = 650;

      const tick = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(1.0, elapsed / duration);
        const ease = 0.5 - 0.5 * Math.cos(progress * Math.PI);
        setTransitionVal(ease);

        if (progress < 1.0) {
          animFrameId = requestAnimationFrame(tick);
        } else {
          setTransitionVal(1.0);
        }
      };

      animFrameId = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(animFrameId);
    }
  }, [activeState]);

  // Component-specific transition animator
  useEffect(() => {
    let animFrameId: number;
    let lastTime = performance.now();

    const checkAndAnimateComponents = () => {
      const now = performance.now();
      const dt = now - lastTime;
      lastTime = now;

      setCanvasComponents(prev => {
        const hasTransitioning = prev.some(c => c.transitionVal !== undefined && c.transitionVal < 1.0);
        if (!hasTransitioning) return prev;

        return prev.map(c => {
          if (c.transitionVal !== undefined && c.transitionVal < 1.0) {
            const nextProgress = Math.min(1.0, c.transitionVal + dt / 650);
            return {
              ...c,
              transitionVal: nextProgress
            };
          }
          return c;
        });
      });

      animFrameId = requestAnimationFrame(checkAndAnimateComponents);
    };

    animFrameId = requestAnimationFrame(checkAndAnimateComponents);
    return () => cancelAnimationFrame(animFrameId);
  }, []);

  // Global Drag/Resize tracking effect
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      // 1. Standard specimen dragging and resizing
      const dragData = startDragRef.current;
      if (dragData) {
        const deltaX = e.clientX - dragData.startX;
        const deltaY = e.clientY - dragData.startY;
        const startPosX = dragData.startPosX;
        const startPosY = dragData.startPosY;
        const startWidth = dragData.startWidth;
        const startHeight = dragData.startHeight;

        if (isDragging && draggingComponentId) {
          setCanvasComponents(prev => prev.map(c => {
            if (c.id === draggingComponentId) {
              return {
                ...c,
                x: startPosX + deltaX,
                y: startPosY + deltaY
              };
            }
            return c;
          }));
        } else if (isResizing && resizingComponentId) {
          setCanvasComponents(prev => prev.map(c => {
            if (c.id === resizingComponentId) {
              const updated: Partial<ComponentInstance> = {};
              if (isResizing.includes('e')) {
                updated.width = Math.max(80, Math.min(650, startWidth + deltaX));
                updated.sizeMode = 'fixed';
              }
              if (isResizing.includes('s')) {
                updated.height = Math.max(28, Math.min(500, startHeight + deltaY));
                updated.heightMode = 'fixed';
              }
              return {
                ...c,
                ...updated
              };
            }
            return c;
          }));
        }
      }

      // 2. Custom crop box dragging and resizing
      if (startCropDragRef.current && isResizingCrop) {
        const deltaX = e.clientX - startCropDragRef.current.startX;
        const deltaY = e.clientY - startCropDragRef.current.startY;

        const startX = startCropDragRef.current.startXOffset;
        const startY = startCropDragRef.current.startYOffset;
        const startW = startCropDragRef.current.startWidth;
        const startH = startCropDragRef.current.startHeight;

        let nextX = startX;
        let nextY = startY;
        let nextW = startW;
        let nextH = startH;

        const canvasEl = document.getElementById('figma-editor-canvas');
        const maxW = canvasEl?.getBoundingClientRect().width || 1200;
        const maxH = canvasEl?.getBoundingClientRect().height || 800;

        if (isResizingCrop === 'move') {
          nextX = Math.max(0, Math.min(maxW - startW, startX + deltaX));
          nextY = Math.max(0, Math.min(maxH - startH, startY + deltaY));
        } else if (isResizingCrop === 'marquee') {
          let nextW_marquee = Math.abs(deltaX);
          let nextH_marquee = Math.abs(deltaY);

          if (deltaX < 0) {
            nextX = Math.max(0, startX + deltaX);
          }
          if (deltaY < 0) {
            nextY = Math.max(0, startY + deltaY);
          }
          nextW = Math.min(maxW - nextX, nextW_marquee);
          nextH = Math.min(maxH - nextY, nextH_marquee);
        } else {
          // Edges & Corners sizing blocks
          if (isResizingCrop.includes('e')) {
            nextW = Math.max(10, Math.min(maxW - startX, startW + deltaX));
          }
          if (isResizingCrop.includes('s')) {
            nextH = Math.max(10, Math.min(maxH - startY, startH + deltaY));
          }
          if (isResizingCrop.includes('w')) {
            const shiftX = Math.min(deltaX, startW - 10);
            nextX = Math.max(0, Math.min(maxW - 10, startX + shiftX));
            nextW = startW - (nextX - startX);
          }
          if (isResizingCrop.includes('n')) {
            const shiftY = Math.min(deltaY, startH - 10);
            nextY = Math.max(0, Math.min(maxH - 10, startY + shiftY));
            nextH = startH - (nextY - startY);
          }
        }

        setCropRect({
          x: Math.round(nextX),
          y: Math.round(nextY),
          width: Math.round(nextW),
          height: Math.round(nextH)
        });
      }
    };

    const handleGlobalMouseUp = () => {
      setIsDragging(false);
      setIsResizing(null);
      setDraggingComponentId(null);
      setResizingComponentId(null);
      startDragRef.current = null;

      setIsResizingCrop(null);
      startCropDragRef.current = null;
    };

    if (isDragging || isResizing || isResizingCrop) {
      window.addEventListener('mousemove', handleGlobalMouseMove);
      window.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging, isResizing, draggingComponentId, resizingComponentId, isResizingCrop, activeComp]);

  const handleCropResizeStart = (e: React.MouseEvent, direction: string) => {
    e.stopPropagation();
    e.preventDefault();

    setIsResizingCrop(direction);
    startCropDragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startXOffset: cropRect.x,
      startYOffset: cropRect.y,
      startWidth: cropRect.width,
      startHeight: cropRect.height
    };
  };

  const handleMarqueeStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    const rect = e.currentTarget.getBoundingClientRect();
    const startX = Math.round(e.clientX - rect.left);
    const startY = Math.round(e.clientY - rect.top);

    setCropRect({
      x: startX,
      y: startY,
      width: 10,
      height: 10
    });

    setIsResizingCrop('marquee');
    startCropDragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startXOffset: startX,
      startYOffset: startY,
      startWidth: 10,
      startHeight: 10
    };
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const drawSpecimenToCanvas = (
    ctx: CanvasRenderingContext2D,
    comp: ComponentInstance,
    themeMode: 'dark' | 'light',
    webglCanvas: HTMLCanvasElement,
    cropX: number,
    cropY: number,
    recordedClicksBatch: any[],
    mousePos: { x: number, y: number },
    showCursorFlag: boolean,
    showClicksFlag: boolean
  ) => {
    const colors = getM3SpecificStyles(comp, themeMode);

    const isStateBlurred = activeState === 2 || activeState === 3 || activeState === 4 || activeState === 5 || activeState === 6 || activeState === 7;

    // Draw dynamic backdrop blur on 2D canvas context if state is blurred!
    if (isStateBlurred) {
      ctx.save();
      if ("filter" in ctx) {
        (ctx as any).filter = `blur(${intensity * 32 + 18}px) saturate(1.8) opacity(0.8)`;
      }
      // Draw background WebGL canvas offset by -100px so it bleeds outwards nicely in the exported image!
      ctx.drawImage(webglCanvas, -cropX - 100, -cropY - 100, comp.width + 200, comp.height + 200);
      ctx.restore();
    }

    // Draw card background color and clip to rounded corners
    ctx.save();
    if (!isStateBlurred) {
      if (comp.borderRadius > 0) {
        ctx.beginPath();
        const rx = -cropX;
        const ry = -cropY;
        const rw = comp.width;
        const rh = comp.height;
        const r = Math.min(comp.borderRadius, Math.min(rw / 2, rh / 2));
        ctx.moveTo(rx + r, ry);
        ctx.lineTo(rx + rw - r, ry);
        ctx.quadraticCurveTo(rx + rw, ry, rx + rw, ry + r);
        ctx.lineTo(rx + rw, ry + rh - r);
        ctx.quadraticCurveTo(rx + rw, ry + rh, rx + rw - r, ry + rh);
        ctx.lineTo(rx + r, ry + rh);
        ctx.quadraticCurveTo(rx, ry + rh, rx, ry + rh - r);
        ctx.lineTo(rx, ry + r);
        ctx.quadraticCurveTo(rx, ry, rx + r, ry);
        ctx.closePath();
        
        ctx.fillStyle = colors.bg;
        ctx.fill();

        if (colors.borderColor && colors.borderColor !== 'transparent') {
          ctx.strokeStyle = colors.borderColor;
          ctx.lineWidth = 1.5;
        } else {
          ctx.strokeStyle = themeMode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)';
          ctx.lineWidth = 1;
        }
        ctx.stroke();

        ctx.clip();
      } else {
        ctx.fillStyle = colors.bg;
        ctx.fillRect(-cropX, -cropY, comp.width, comp.height);
      }
    }

    // Draw source WebGL canvas offset
    if (isStateBlurred) {
      ctx.drawImage(webglCanvas, -cropX - 80, -cropY - 80, comp.width + 160, comp.height + 160);
    } else {
      ctx.drawImage(webglCanvas, -cropX, -cropY, comp.width, comp.height);
    }
    ctx.restore();
    const textColor = colors.text;
    const subtextColor = colors.subtext;

    const localIcon = comp.activeIcon || 'volume_up';
    const resolvedLocalIcon = (localIcon === 'sparkles' || localIcon === 'sparkle' || localIcon === 'auto_awesome') ? 'auto_awesome' : localIcon;
    const iconCharMap: Record<string, string> = {
      sparkles: '✦',
      sparkle: '✦',
      auto_awesome: '✦',
      favorite: '♥',
      settings: '⚙',
      info: 'i',
      shopping_cart: '⛃',
      search: '⌕',
      person: '⚇',
      home: '⌂',
      notifications: '⭘',
      star: '★',
      share: '⤯',
      play_arrow: '▶',
      volume_up: 'v',
      mic: 'm',
      fingerprint: 'f',
      lightbulb: 'l',
      extension: 'e',
      bolt: 'b',
      warning: '⚠'
    };
    const iconStr = iconCharMap[resolvedLocalIcon] || '✦';

    ctx.save();
    // Translate out of crop
    ctx.translate(-cropX, -cropY);

    if (comp.type === 'button') {
      ctx.fillStyle = textColor;
      ctx.font = '600 12px "Inter", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      if (comp.configShowIcon) {
        ctx.fillText(iconStr, comp.width / 2 - 25, comp.height / 2);
        ctx.fillText(comp.text, comp.width / 2 + 10, comp.height / 2);
      } else {
        ctx.fillText(comp.text, comp.width / 2, comp.height / 2);
      }
    } 
    else if (comp.type === 'card') {
      let currentY = 24;
      let startX = 20;

      if (comp.configShowIcon || comp.configShowTitle || comp.configShowSubtitle) {
        if (comp.configShowIcon) {
          ctx.fillStyle = 'rgba(0,0,0,0.15)';
          ctx.beginPath();
          ctx.arc(startX + 18, currentY + 18, 18, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#ffffff';
          ctx.font = '14px "Inter"';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(iconStr, startX + 18, currentY + 18);
          startX += 48;
        }

        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';

        if (comp.configShowTitle) {
          ctx.fillStyle = textColor;
          ctx.font = 'bold 13.5px "Inter", sans-serif';
          ctx.fillText(comp.title, startX, currentY);
          currentY += 18;
        }

        if (comp.configShowSubtitle) {
          ctx.fillStyle = subtextColor;
          ctx.font = 'bold 8.5px "Inter", sans-serif';
          ctx.fillText(comp.subtitle.toUpperCase(), startX, currentY);
          currentY += 14;
        }
      }

      if (comp.configShowDescription) {
        ctx.fillStyle = textColor;
        ctx.font = '11px "Inter", sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        
        const words = comp.text.split(' ');
        let line = '';
        let textY = Math.max(currentY + 10, 70);
        const maxWidth = comp.width - 40;
        const lineHeight = 16;

        for (let n = 0; n < words.length; n++) {
          let testLine = line + words[n] + ' ';
          let metrics = ctx.measureText(testLine);
          if (metrics.width > maxWidth && n > 0) {
            ctx.fillText(line, 20, textY);
            line = words[n] + ' ';
            textY += lineHeight;
          } else {
            line = testLine;
          }
        }
        ctx.fillText(line, 20, textY);
      }

      if (comp.configShowActions) {
        ctx.strokeStyle = 'rgba(255,255,255,0.05)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(12, comp.height - 40);
        ctx.lineTo(comp.width - 12, comp.height - 40);
        ctx.stroke();

        ctx.fillStyle = textColor;
        ctx.font = 'bold 9.5px "Inter", sans-serif';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText('Action', comp.width - 24, comp.height - 20);

        ctx.globalAlpha = 0.6;
        ctx.fillText('Dismiss', comp.width - 80, comp.height - 20);
        ctx.globalAlpha = 1.0;
      }
    } 
    else if (comp.type === 'chip') {
      ctx.fillStyle = textColor;
      ctx.font = '500 12.5px "Inter", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      if (comp.configShowIcon) {
        ctx.fillText(iconStr, comp.width / 2 - 22, comp.height / 2);
        ctx.fillText(comp.text, comp.width / 2 + 12, comp.height / 2);
      } else {
        ctx.fillText(comp.text, comp.width / 2, comp.height / 2);
      }
    } 
    else if (comp.type === 'fab') {
      ctx.fillStyle = textColor;
      ctx.font = '18px "Inter"';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(iconStr, comp.width / 2, comp.height / 2);
    } 
    else if (comp.type === 'dialog') {
      let currentY = 24;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';

      if (comp.configShowIcon) {
        ctx.fillStyle = '#A259FF';
        ctx.font = '20px "Inter"';
        ctx.fillText(iconStr, 20, currentY);
        currentY += 28;
      }

      if (comp.configShowTitle) {
        ctx.fillStyle = textColor;
        ctx.font = 'bold 15px "Inter", sans-serif';
        ctx.fillText(comp.title, 20, currentY);
        currentY += 22;
      }

      if (comp.configShowDescription) {
        ctx.fillStyle = textColor;
        ctx.font = '11.5px "Inter", sans-serif';
        const words = comp.text.split(' ');
        let line = '';
        let textY = currentY + 4;
        const maxWidth = comp.width - 40;
        const lineHeight = 15;

        for (let n = 0; n < words.length; n++) {
          let testLine = line + words[n] + ' ';
          let metrics = ctx.measureText(testLine);
          if (metrics.width > maxWidth && n > 0) {
            ctx.fillText(line, 20, textY);
            line = words[n] + ' ';
            textY += lineHeight;
          } else {
            line = testLine;
          }
        }
        ctx.fillText(line, 20, textY);
      }

      if (comp.configShowActions) {
        ctx.strokeStyle = 'rgba(255,255,255,0.05)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(12, comp.height - 40);
        ctx.lineTo(comp.width - 12, comp.height - 40);
        ctx.stroke();

        ctx.fillStyle = textColor;
        ctx.font = 'bold 10px "Inter", sans-serif';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText('Confirm', comp.width - 24, comp.height - 20);

        ctx.globalAlpha = 0.6;
        ctx.fillText('Cancel', comp.width - 85, comp.height - 20);
        ctx.globalAlpha = 1.0;
      }
    } 
    else if (comp.type === 'badge') {
      ctx.fillStyle = textColor;
      ctx.font = 'bold 10px "Inter", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      if (comp.configShowIcon) {
        ctx.fillText(iconStr, comp.width / 2 - 15, comp.height / 2);
        ctx.fillText(comp.text, comp.width / 2 + 10, comp.height / 2);
      } else {
        ctx.fillText(comp.text, comp.width / 2, comp.height / 2);
      }
    }
    else if (comp.type === 'sheets') {
      ctx.fillStyle = textColor;
      ctx.font = 'bold 12px "Inter", sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(comp.title || 'Sheet Header', 16, 16);
      ctx.font = '500 10.5px "Inter", sans-serif';
      ctx.fillStyle = subtextColor || 'rgba(255,255,255,0.7)';
      ctx.fillText(comp.text || 'Context Body', 16, 38);
    }
    else if (comp.type === 'avatar') {
      ctx.fillStyle = colors.bg;
      ctx.beginPath();
      ctx.arc(comp.width / 2, comp.height / 2, Math.min(comp.width, comp.height) / 2 - 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = textColor;
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = textColor;
      ctx.font = 'bold 11px "Inter", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(comp.text || 'JD', comp.width / 2, comp.height / 2);
    }
    else if (comp.type === 'progress') {
      ctx.fillStyle = 'rgba(255,255,255,0.15)';
      ctx.fillRect(12, comp.height / 2 - 3, comp.width - 24, 6);
      ctx.fillStyle = '#18A0FB';
      ctx.fillRect(12, comp.height / 2 - 3, (comp.width - 24) * 0.7, 6);
    }

    // Draw recorded clicks custom visual tracking indicator
    if (showClicksFlag) {
      const now = Date.now();
      for (const cl of recordedClicksBatch) {
        const elapsed = now - (cl.timestamp || now); // resolve timing accurately
        if (elapsed < 1200) {
          const ratio = elapsed / 1200;
          const alpha = Math.max(0, 1 - ratio);
          
          // Outer ripple ring
          ctx.strokeStyle = `rgba(24, 160, 251, ${alpha * 0.4})`;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(cl.x, cl.y, ratio * 22 + 4, 0, Math.PI * 2);
          ctx.stroke();

          // Soft inner filled background
          ctx.fillStyle = `rgba(24, 160, 251, ${alpha * 0.08})`;
          ctx.beginPath();
          ctx.arc(cl.x, cl.y, ratio * 22 + 4, 0, Math.PI * 2);
          ctx.fill();

          // Elegant solid inner dot that also fades nicely
          ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.95})`;
          ctx.strokeStyle = `rgba(24, 160, 251, ${alpha * 0.8})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(cl.x, cl.y, 4 * (1 - ratio * 0.3), 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        }
      }
    }

    // Draw custom visual tracking arrow cursor
    if (showCursorFlag && mousePos && mousePos.x >= 0 && mousePos.x <= comp.width && mousePos.y >= 0 && mousePos.y <= comp.height) {
      const cx = mousePos.x;
      const cy = mousePos.y;
      
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.4)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 2;

      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + 12, cy + 12);
      ctx.lineTo(cx + 5, cy + 13);
      ctx.lineTo(cx + 8, cy + 20);
      ctx.lineTo(cx + 5, cy + 21);
      ctx.lineTo(cx + 2, cy + 14);
      ctx.lineTo(cx, cy + 17);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore();
  };

  // Dimensional and field updates
  const updateComponentField = (id: string, field: keyof ComponentInstance, value: any) => {
    setCanvasComponents(prev => prev.map(c => {
      if (c.id === id) {
        return {
          ...c,
          [field]: value
        };
      }
      return c;
    }));
  };

  // Resolve colors dynamically by component or defaults
  const getComponentColors = (c: ComponentInstance, mode: 'light' | 'dark') => {
    const libKey = c.colorLibrary || globalColorLibrary || 'baseline-blue';
    const lib = (customLibraries[libKey] || M3_COLOR_LIBRARIES[libKey]) || M3_COLOR_LIBRARIES['baseline-blue'];
    return lib.colors[mode][c.containerType];
  };

  const getM3SpecificStyles = (comp: ComponentInstance, mode: 'light' | 'dark') => {
    const libKey = comp.colorLibrary || globalColorLibrary || 'baseline-blue';
    const lib = (customLibraries[libKey] || M3_COLOR_LIBRARIES[libKey]) || M3_COLOR_LIBRARIES['baseline-blue'];
    const libColors = lib.colors[mode];
    
    let bg = libColors[comp.containerType]?.bg || '#ffffff';
    let text = libColors[comp.containerType]?.text || '#121212';
    let subtext = libColors[comp.containerType]?.subtext || '#666666';
    let borderColor = 'transparent';
    let shadow = 'none';
    let hasBaseShaderBg = true;
    
    const variant = comp.variant || 'filled';
    
    if (comp.type === 'button') {
      if (variant === 'filled') {
        bg = libColors.primary.bg;
        text = libColors.primary.text;
        borderColor = 'transparent';
        shadow = 'none';
        hasBaseShaderBg = true;
      } else if (variant === 'tonal') {
        bg = libColors.secondary.bg;
        text = libColors.secondary.text;
        borderColor = 'transparent';
        shadow = 'none';
        hasBaseShaderBg = true;
      } else if (variant === 'elevated') {
        bg = mode === 'dark' ? '#211F26' : '#F7F2FA';
        text = libColors.primary.bg;
        borderColor = 'transparent';
        shadow = '0px 1px 3px rgba(0,0,0,0.12), 0px 1px 2px rgba(0,0,0,0.24)';
        hasBaseShaderBg = true;
      } else if (variant === 'outlined') {
        bg = 'transparent';
        text = libColors.primary.bg;
        borderColor = mode === 'dark' ? 'rgba(255,255,255,0.24)' : 'rgba(0,0,0,0.24)';
        shadow = 'none';
        hasBaseShaderBg = false;
      } else if (variant === 'text') {
        bg = 'transparent';
        text = libColors.primary.bg;
        borderColor = 'transparent';
        shadow = 'none';
        hasBaseShaderBg = false;
      }
    }
    else if (comp.type === 'card') {
      if (variant === 'elevated') {
        bg = libColors.surface.bg;
        text = libColors.surface.text;
        subtext = libColors.surface.subtext;
        borderColor = 'transparent';
        shadow = '0px 1px 5px rgba(0, 0, 0, 0.15)';
        hasBaseShaderBg = true;
      } else if (variant === 'filled') {
        bg = libColors.secondary.bg;
        text = libColors.secondary.text;
        subtext = libColors.secondary.subtext;
        borderColor = 'transparent';
        shadow = 'none';
        hasBaseShaderBg = true;
      } else if (variant === 'outlined') {
        bg = libColors.surface.bg;
        text = libColors.surface.text;
        subtext = libColors.surface.subtext;
        borderColor = mode === 'dark' ? 'rgba(255, 255, 255, 0.24)' : 'rgba(0, 0, 0, 0.24)';
        shadow = 'none';
        hasBaseShaderBg = false;
      }
    }
    else if (comp.type === 'chip') {
      if (variant === 'assist') {
        bg = 'transparent';
        text = libColors.primary.bg;
        borderColor = mode === 'dark' ? 'rgba(255, 255, 255, 0.24)' : 'rgba(0, 0, 0, 0.24)';
        shadow = 'none';
        hasBaseShaderBg = false;
      } else if (variant === 'filled') {
        bg = libColors.secondary.bg;
        text = libColors.secondary.text;
        borderColor = 'transparent';
        shadow = 'none';
        hasBaseShaderBg = true;
      } else if (variant === 'elevated') {
        bg = libColors.surface.bg;
        text = libColors.surface.text;
        borderColor = mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)';
        shadow = '0px 1px 2px rgba(0,0,0,0.1)';
        hasBaseShaderBg = true;
      }
    }
    else if (comp.type === 'fab') {
      if (variant === 'primary') {
        bg = libColors.primary.bg;
        text = libColors.primary.text;
        shadow = '0px 3px 6px rgba(0, 0, 0, 0.15)';
        hasBaseShaderBg = true;
      } else if (variant === 'secondary') {
        bg = libColors.secondary.bg;
        text = libColors.secondary.text;
        shadow = '0px 3px 6px rgba(0, 0, 0, 0.15)';
        hasBaseShaderBg = true;
      } else if (variant === 'surface') {
        bg = libColors.surface.bg;
        text = libColors.primary.bg;
        shadow = '0px 3px 6px rgba(0, 0, 0, 0.15)';
        hasBaseShaderBg = true;
      }
    }
    else if (comp.type === 'dialog') {
      bg = libColors.surface.bg;
      text = libColors.surface.text;
      subtext = libColors.surface.subtext;
      shadow = '0px 24px 38px rgba(0,0,0,0.3)';
      borderColor = variant === 'alert' 
        ? (mode === 'dark' ? 'rgba(244, 67, 54, 0.3)' : 'rgba(244, 67, 54, 0.5)')
        : 'transparent';
      hasBaseShaderBg = true;
    }
    else if (comp.type === 'badge') {
      if (variant === 'dot') {
        bg = mode === 'dark' ? '#F44336' : '#D11D12';
        text = '#FFFFFF';
        borderColor = 'transparent';
        shadow = 'none';
        hasBaseShaderBg = false;
      } else {
        bg = libColors.secondary.bg;
        text = libColors.secondary.text;
        borderColor = 'transparent';
        shadow = 'none';
        hasBaseShaderBg = true;
      }
    }
    else if (comp.type === 'sheets') {
      bg = libColors.surface.bg;
      text = libColors.surface.text;
      subtext = libColors.surface.subtext;
      shadow = '0px 16px 24px rgba(0,0,0,0.2)';
      borderColor = 'transparent';
      hasBaseShaderBg = true;
    }
    else if (comp.type === 'avatar') {
      bg = libColors.primary.bg;
      text = libColors.primary.text;
      borderColor = 'transparent';
      shadow = '0px 2px 6px rgba(0,0,0,0.15)';
      hasBaseShaderBg = true;
    }
    else if (comp.type === 'progress') {
      bg = 'transparent';
      text = libColors.primary.bg;
      borderColor = 'transparent';
      shadow = 'none';
      hasBaseShaderBg = true;
    }

    return { bg, text, subtext, borderColor, shadow, hasBaseShaderBg };
  };

  const updateActiveComponentField = (field: keyof ComponentInstance, value: any) => {
    updateComponentField(selectedComponentId, field, value);
  };

  const compBgColor = activeComp ? getM3SpecificStyles(activeComp, canvasBgMode).bg : '#121212';
  
  const stateMeta = OFFICIAL_STATES.find(s => s.id === activeState) || OFFICIAL_STATES[0];
  const midColor = stateMeta.defaultMid;
  const endColor = stateMeta.defaultEnd;

  // Image upload triggers
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      setUploadedFrameUrl(url);
      setUploadedFrameName(file.name);
      setActiveBackdrop('uploaded');
      showToast(`Loaded layout frame: ${file.name}`);
    }
  };

  // Frame reset to viewport center
  const handleResetAlignment = () => {
    setCanvasComponents(prev => prev.map(c => {
      if (c.id === selectedComponentId) {
        return { ...c, x: 0, y: 0 };
      }
      return c;
    }));
    showToast(`Centered chosen element "${activeComp?.name}".`);
  };

  const handleSpecimenClick = (e: React.MouseEvent<HTMLDivElement>, componentId: string) => {
    const canvasEl = document.getElementById('figma-editor-canvas');
    const canvasRect = canvasEl?.getBoundingClientRect();
    if (canvasRect) {
      const x = Math.round(e.clientX - canvasRect.left);
      const y = Math.round(e.clientY - canvasRect.top);
      
      const clickId = Math.random().toString(36).substring(2, 9);
      const newClick: InteractiveClick = {
        id: clickId,
        x,
        y,
        timestamp: Date.now(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      };
      
      setRecordedClicks(prev => [...prev.slice(-9), newClick]); // Keep last 10 interactions
      
      // Automatically expire
      setTimeout(() => {
        setRecordedClicks(prev => prev.filter(c => c.id !== clickId));
      }, 1200);
    }
  };

  const handleMoveStart = (e: React.MouseEvent, componentId: string) => {
    e.stopPropagation();
    if (isRecording || recordingCountdown !== null) return; // Prevent selection/dragging during active capturing
    const comp = canvasComponents.find(c => c.id === componentId);
    if (!comp) return;
    setSelectedComponentId(componentId);
    setIsDragging(true);
    setDraggingComponentId(componentId);
    startDragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startPosX: comp.x,
      startPosY: comp.y,
      startWidth: comp.width,
      startHeight: comp.height
    };
  };

  const handleResizeStart = (e: React.MouseEvent, componentId: string, handle: string) => {
    e.stopPropagation();
    e.preventDefault();
    const comp = canvasComponents.find(c => c.id === componentId);
    if (!comp) return;
    setSelectedComponentId(componentId);
    setIsResizing(handle);
    setResizingComponentId(componentId);
    startDragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startPosX: comp.x,
      startPosY: comp.y,
      startWidth: comp.width,
      startHeight: comp.height
    };
  };

  // Interactive Recording & Early Stop Session Control Handlers
  const handlePauseVideoRecording = () => {
    if (exportFormat === 'mp4' && activeMediaRecorderRef.current) {
      if (activeMediaRecorderRef.current.state === 'recording') {
        activeMediaRecorderRef.current.pause();
        setIsRecordingPaused(true);
        showToast("Recording paused.");
      }
    } else if (exportFormat === 'gif') {
      setIsRecordingPaused(true);
      showToast("Snapshot capture paused.");
    }
  };

  const handleResumeVideoRecording = () => {
    if (exportFormat === 'mp4' && activeMediaRecorderRef.current) {
      if (activeMediaRecorderRef.current.state === 'paused') {
        activeMediaRecorderRef.current.resume();
        setIsRecordingPaused(false);
        showToast("Recording resumed.");
      }
    } else if (exportFormat === 'gif') {
      setIsRecordingPaused(false);
      showToast("Snapshot capture resumed.");
    }
  };

  const handleStopVideoRecordingEarly = () => {
    if (stopRecordingCallbackRef.current) {
      stopRecordingCallbackRef.current();
    }
  };

  const startRecordingAfterCountdown = () => {
    setRecordingCountdown(3);
    showToast("Starting capture countdown...");
    
    let currentCount = 3;
    const countInterval = setInterval(() => {
      currentCount--;
      if (currentCount <= 0) {
        clearInterval(countInterval);
        setRecordingCountdown(null);
        actuallyStartRecording();
      } else {
        setRecordingCountdown(currentCount);
      }
    }, 1000);
  };

  const actuallyStartRecording = async () => {
    // Reset snap arrays & chunks
    setIsRecordingPaused(false);

    // Try finding canvas using exact Specimen ID, and fallback to type-based ID if activeComp is present
    let canvas: HTMLCanvasElement | null = null;
    if (activeComp) {
      let canvasId = `canvas-for-${activeComp.id}`;
      canvas = document.getElementById(canvasId) as HTMLCanvasElement;
      if (!canvas) {
        canvasId = `canvas-for-${activeComp.type}`;
        canvas = document.getElementById(canvasId) as HTMLCanvasElement;
      }
    }

    // Capture geometry bounds
    const baseW = isCropActive ? cropRect.width : (activeComp ? activeComp.width : 600);
    const baseH = isCropActive ? cropRect.height : (activeComp ? activeComp.height : 400);

    let cropX = 0;
    let cropY = 0;
    if (isCropActive) {
      if (activeComp) {
        const canvasEl = document.getElementById('figma-editor-canvas');
        if (canvasEl) {
          const sRect = canvasEl.getBoundingClientRect();
          const centerX = sRect.width / 2;
          const centerY = sRect.height / 2;
          const compLeft = centerX + activeComp.x - activeComp.width / 2;
          const compTop = centerY + activeComp.y - activeComp.height / 2;
          cropX = cropRect.x - compLeft;
          cropY = cropRect.y - compTop;
        } else {
          cropX = cropRect.x;
          cropY = cropRect.y;
        }
      } else {
        cropX = cropRect.x;
        cropY = cropRect.y;
      }
    }

    // Apply high-fidelity resolution multipliers
    const finalW = Math.round(baseW * recordResolutionMultiplier);
    const finalH = Math.round(baseH * recordResolutionMultiplier);

    // Initialise Composite drawing canvas
    const compositeCanvas = document.createElement('canvas');
    compositeCanvas.width = finalW;
    compositeCanvas.height = finalH;
    const ctx = compositeCanvas.getContext('2d')!;

    const finalType = activeComp ? activeComp.type : 'canvas';

    // Perform drawing routine on composite canvas
    const renderCompFrame = () => {
      ctx.clearRect(0, 0, finalW, finalH);
      
      // Paint standard figma theme backdrops or backdropSolidColor if active
      let bgFill = canvasBgMode === 'dark' ? '#1E1E1E' : '#EAEAEA';
      if (isBackdropVisible && activeBackdrop === 'solid') {
        bgFill = backdropSolidColor;
      }
      ctx.fillStyle = bgFill;
      ctx.fillRect(0, 0, finalW, finalH);

      ctx.save();
      // Apply resolution upscaling
      ctx.scale(recordResolutionMultiplier, recordResolutionMultiplier);

      if (activeComp && canvas) {
        const canvasEl = document.getElementById('figma-editor-canvas');
        const sRect = canvasEl?.getBoundingClientRect();
        const centerX = sRect ? sRect.width / 2 : 600;
        const centerY = sRect ? sRect.height / 2 : 400;
        const compLeft = centerX + activeComp.x - activeComp.width / 2;
        const compTop = centerY + activeComp.y - activeComp.height / 2;

        const relativeClicks = recordedClicks.map(cl => ({
          ...cl,
          x: cl.x - compLeft,
          y: cl.y - compTop
        }));

        drawSpecimenToCanvas(
          ctx,
          activeComp,
          canvasBgMode,
          canvas,
          cropX,
          cropY,
          relativeClicks,
          recMousePos,
          recordShowCursor,
          recordShowClicks
        );
      } else {
        // Draw the full canvas with any visible components
        const viewportW = 1200;
        const viewportH = 800;
        const centerX = viewportW / 2;
        const centerY = viewportH / 2;

        canvasComponents.forEach((c) => {
          const cCanvas = document.getElementById(`canvas-for-${c.id}`) as HTMLCanvasElement ||
                          document.getElementById(`canvas-for-${c.type}`) as HTMLCanvasElement;
          if (cCanvas) {
            const compLeft = centerX + c.x - c.width / 2;
            const compTop = centerY + c.y - c.height / 2;
            
            ctx.save();
            ctx.translate(compLeft - cropX, compTop - cropY);
            
            // Draw this component's webgl background
            // ctx.drawImage(cCanvas, 0, 0); // Removed to allow drawSpecimenToCanvas to draw WebGL background with rounded masking

            // Translate and draw specimen controls/text
            drawSpecimenToCanvas(
              ctx,
              c,
              canvasBgMode,
              cCanvas,
              0,
              0,
              [],
              { x: -100, y: -100 },
              false,
              false
            );

            ctx.restore();
          }
        });

        // Draw clicks in full canvas coordinates
        if (recordShowClicks && recordedClicks.length > 0) {
          recordedClicks.forEach((click) => {
            const clickAge = Date.now() - click.timestamp;
            if (clickAge < 1200) {
              const ratio = clickAge / 1200;
              const alpha = Math.max(0, 1 - ratio);
              const radius = 22 * ratio + 4;
              
              ctx.save();
              // Outer ripple ring
              ctx.strokeStyle = `rgba(24, 160, 251, ${alpha * 0.4})`;
              ctx.lineWidth = 1.5;
              ctx.beginPath();
              ctx.arc(click.x - cropX, click.y - cropY, radius, 0, Math.PI * 2);
              ctx.stroke();

              // Soft inner filled background
              ctx.fillStyle = `rgba(24, 160, 251, ${alpha * 0.08})`;
              ctx.beginPath();
              ctx.arc(click.x - cropX, click.y - cropY, radius, 0, Math.PI * 2);
              ctx.fill();

              // Elegant solid inner dot that also fades nicely
              ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.95})`;
              ctx.strokeStyle = `rgba(24, 160, 251, ${alpha * 0.8})`;
              ctx.lineWidth = 1;
              ctx.beginPath();
              ctx.arc(click.x - cropX, click.y - cropY, 4 * (1 - ratio * 0.3), 0, Math.PI * 2);
              ctx.fill();
              ctx.stroke();
              ctx.restore();
            }
          });
        }
      }

      ctx.restore();
    };

    if (exportFormat === 'png') {
      try {
        setExportStatus('Rendering custom frame...');
        renderCompFrame();

        const dataUrl = compositeCanvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `m3-specimen-${finalType}-${finalW}x${finalH}-${(Date.now() % 1000)}.png`;
        link.click();
        
        setExportStatus(null);
        setIsCropActive(false);
        setIsAreaSelectionMode(false);
        showToast(`Successfully exported crisp custom PNG (${finalW}x${finalH})!`);
      } catch (err: any) {
        setExportStatus(null);
        showToast(`Capture error: ${err.message}`);
      }
    } 
    else if (exportFormat === 'mp4') {
      try {
        setExportStatus('Arming video recording stream...');
        setIsRecording(true);
        setRecordingCount(0);

        // Render first frame
        renderCompFrame();

        const canvasStream = (compositeCanvas as any).captureStream
          ? (compositeCanvas as any).captureStream(recordFPS)
          : (compositeCanvas as any).mozCaptureStream ? (compositeCanvas as any).mozCaptureStream(recordFPS) : null;

        if (!canvasStream) {
          throw new Error('Canvas recording streams are not supported in this browser environment.');
        }

        const options = { mimeType: 'video/webm' };
        const recordTypes = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm', 'video/mp4'];
        for (const type of recordTypes) {
          if (MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(type)) {
            options.mimeType = type;
            break;
          }
        }

        const dataChunks: BlobPart[] = [];
        const recorder = new MediaRecorder(canvasStream, {
          mimeType: options.mimeType,
          videoBitsPerSecond: recordBps
        });
        activeMediaRecorderRef.current = recorder;

        recorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            dataChunks.push(event.data);
          }
        };

        const handleStopExport = () => {
          const extension = options.mimeType.includes('mp4') ? 'mp4' : 'webm';
          const fileBlob = new Blob(dataChunks, { type: options.mimeType });
          const urlBlob = URL.createObjectURL(fileBlob);
          
          setExportStatus(null);
          setIsRecording(false);
          setIsRecordingPaused(false);
          activeMediaRecorderRef.current = null;
          
          // Clear active area selection overlay masks
          setIsCropActive(false);
          setIsAreaSelectionMode(false);
          
          setCompiledFile({
            url: urlBlob,
            filename: `specimen-${finalType}-interaction-${finalW}x${finalH}.${extension}`,
            extension: extension.toUpperCase()
          });
          showToast(`Recording compiled successfully!`);
        };

        recorder.onstop = handleStopExport;
        stopRecordingCallbackRef.current = () => {
          if (recordIntervalRef.current) clearInterval(recordIntervalRef.current);
          if (recorder.state !== 'inactive') {
            recorder.stop();
          }
        };

        recorder.start();

        const intervalDelay = 1000 / recordFPS;
        const totalFramesCount = recordFPS * exportDuration;
        let elapsedFrames = 0;

        if (recordIntervalRef.current) clearInterval(recordIntervalRef.current);
        recordIntervalRef.current = setInterval(() => {
          if (isRecordingPausedRef.current) {
            return; // skip ticks if paused
          }
          renderCompFrame();
          elapsedFrames++;
          
          setRecordingCount(elapsedFrames / recordFPS);
          setExportStatus(`Capturing GPU frames... Interact on component now! ${Math.round((elapsedFrames / totalFramesCount) * 100)}%`);
          
          if (elapsedFrames >= totalFramesCount) {
            if (recordIntervalRef.current) clearInterval(recordIntervalRef.current);
            if (recorder.state !== 'inactive') {
              recorder.stop();
            }
          }
        }, intervalDelay);

      } catch (err: any) {
        setExportStatus(null);
        showToast(`Recording failure: ${err.message}`);
        setIsRecording(false);
        setIsRecordingPaused(false);
      }
    } 
    else if (exportFormat === 'gif') {
      try {
        setExportStatus('Recording snapshots...');
        setIsRecording(true);
        setRecordingCount(0);

        const snapshots: string[] = [];
        const totalFramesCount = Math.round(recordFPS * exportDuration);
        const intervalDelay = 1000 / recordFPS;
        let elapsedFrames = 0;

        const handleStopExportGif = () => {
          if (recordIntervalRef.current) clearInterval(recordIntervalRef.current);
          setIsCropActive(false);
          setIsAreaSelectionMode(false);
          if (snapshots.length === 0) {
            setExportStatus(null);
            setIsRecording(false);
            showToast('No frames recorded to compile GIF.');
            return;
          }
          setExportStatus('Compiling animated GIF loop...');

          gifshot.createGIF({
            images: snapshots,
            gifWidth: finalW,
            gifHeight: finalH, 
            interval: 1 / recordFPS,
            numFrames: snapshots.length,
            sampleInterval: 2
          }, (obj: any) => {
            if (obj.error) {
              setExportStatus(null);
              showToast(`GIF Compilation Error: ${obj.errorMessage}`);
              setIsRecording(false);
              setIsRecordingPaused(false);
            } else {
              setExportStatus(null);
              setIsRecording(false);
              setIsRecordingPaused(false);
              setCompiledFile({
                url: obj.image,
                filename: `m3-specimen-interaction-${finalType}-${finalW}x${finalH}.gif`,
                extension: 'GIF'
              });
              showToast(`GIF compiled successfully!`);
            }
          });
        };

        stopRecordingCallbackRef.current = handleStopExportGif;

        if (recordIntervalRef.current) clearInterval(recordIntervalRef.current);
        recordIntervalRef.current = setInterval(() => {
          if (isRecordingPausedRef.current) {
            return; // skip ticks if paused
          }
          renderCompFrame();

          const dataUrl = compositeCanvas.toDataURL('image/png');
          snapshots.push(dataUrl);

          elapsedFrames++;
          setRecordingCount(elapsedFrames / recordFPS);
          setExportStatus(`Snap ${elapsedFrames}/${totalFramesCount} - Move cursor to record! (${Math.round((elapsedFrames / totalFramesCount) * 100)}%)`);

          if (elapsedFrames >= totalFramesCount) {
            handleStopExportGif();
          }
        }, intervalDelay);

      } catch (err: any) {
        setExportStatus(null);
        showToast(`GIF error: ${err.message}`);
        setIsRecording(false);
        setIsRecordingPaused(false);
      }
    }
  };

  // Direct Exporter logic
  const handleDirectExport = async () => {
    if (!isRecording && !isAreaSelectionMode) {
      if (!activeComp) {
        // Position HD-aspect ratio crop box in the middle of standard viewport bounds
        setCropRect({
          x: 300,
          y: 200,
          width: 600,
          height: 400
        });
      }
      setIsAreaSelectionMode(true);
      setIsCropActive(true);
      showToast(activeComp ? 'Define capture area of specimen, then click Confirm!' : 'Define canvas recording area, then click Confirm!');
    }
  };

  const handleButtonClick = () => {
    if (!activeComp) return;
    showToast(`Interact payload: Dispatched ${activeComp.name} event triggers!`);
  };

  return (
    <div className="h-screen w-full bg-[#1E1E1E] text-[#E6E6E6] font-sans flex flex-col overflow-hidden relative select-none" id="figma-desktop-shell">
      
      {/* ================= MAIN INTERACTIVE WORKSPACE ================= */}
      <div className="flex-1 flex overflow-hidden w-full relative" id="figma-workspace-core">

        {/* ================= FIGMA LAYERS & WORKSPACE TOOLKIT (LEFT SIDEBAR) ================= */}
        <aside className="w-64 bg-[#2C2C2C] border-r border-[#1C1C1C] flex flex-col h-full select-none text-[#E6E6E6] shrink-0 z-30 overflow-y-auto" id="figma-left-control-sidebar">
          
          {/* Section 0: Connected Figma File Context & Saved Specs & Shared Views */}
          <div className="p-4 border-b border-[#1C1C1C] flex flex-col gap-3 shrink-0" id="figma-saved-viewport-module">
            
            {/* Action buttons list placed UNDER file title */}
            <div className="flex gap-1.5 pt-0.5">
              <button
                onClick={handleCreateNewCanvas}
                className="flex-1 text-[10px] text-neutral-300 hover:text-white bg-[#1E1E1E] hover:bg-neutral-800 p-1.5 rounded flex items-center justify-center gap-1 transition-all cursor-pointer font-bold border border-neutral-800/80 outline-none"
                title="Start a new blank spec view"
              >
                <Plus className="w-3 h-3 text-[#18A0FB]" />
                <span>New</span>
              </button>
              <button
                onClick={() => setIsSaveComboModalOpen(true)}
                className="flex-1 text-[10px] text-neutral-300 hover:text-white bg-[#1E1E1E] hover:bg-[#1E1E1E]/80 hover:bg-neutral-800 p-1.5 rounded flex items-center justify-center gap-1 transition-all cursor-pointer font-bold border border-neutral-800/80 outline-none"
                title="Save current layout block as combination"
              >
                <Save className="w-3 h-3 text-[#18A0FB]" />
                <span>Save</span>
              </button>
            </div>

            {/* Saved Layout Combinations scrollable inline list */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-sans text-neutral-450 font-bold uppercase tracking-wider block">Saved</span>
              {savedCombinations.length === 0 ? (
                <div className="text-[10.5px] p-2 bg-[#1E1E1E]/50 border border-neutral-800 rounded text-neutral-500 text-[#18A0FB]/40 text-center italic">
                  No saved setups found yet.
                </div>
              ) : (
                <div className="flex flex-col gap-1 max-h-[140px] overflow-y-auto pr-1">
                  {savedCombinations.map((comb) => {
                    const isActive = activeCombinationId === comb.id;
                    const fileObj = linkedFigmaFiles.find(f => f.id === comb.figmaFileId);
                    const isNameEditing = editingCombinationId === comb.id;

                    return (
                      <div 
                        key={comb.id}
                        onClick={() => {
                          if (!isNameEditing) handleLoadCombination(comb);
                        }}
                        className={`group/combo flex items-center justify-between h-8 px-2 rounded text-xs transition-colors cursor-pointer border ${
                          isActive 
                            ? 'bg-[#18A0FB]/10 border-[#18A0FB]/40 text-white font-semibold' 
                            : 'bg-[#1E1E1E] hover:bg-neutral-800 border-neutral-800/40 text-neutral-300'
                        }`}
                      >
                        <div className="truncate flex-1 pr-1.5 flex items-center gap-1.5">
                          {isNameEditing ? (
                            <input
                              type="text"
                              value={editingCombinationName}
                              onChange={(e) => setEditingCombinationName(e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleRenameCombination(comb.id, editingCombinationName);
                                  setEditingCombinationId(null);
                                } else if (e.key === 'Escape') {
                                  setEditingCombinationId(null);
                                }
                              }}
                              onBlur={() => {
                                handleRenameCombination(comb.id, editingCombinationName);
                                setEditingCombinationId(null);
                              }}
                              autoFocus
                              className="bg-[#2C2C2C] text-white border border-[#18A0FB] rounded px-1 text-[10.5px] w-full focus:outline-none py-0.5 font-sans"
                            />
                          ) : (
                            <>
                              {/* Open link manager modal on clicking the link icon */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveLinkCombination(comb);
                                  setIsLayerLinkModalOpen(true);
                                }}
                                className={`p-1 rounded hover:bg-neutral-800 transition-all flex items-center justify-center shrink-0 cursor-pointer border-none bg-transparent ${
                                  fileObj 
                                    ? 'text-[#18A0FB]' 
                                    : 'text-neutral-500 hover:text-neutral-400'
                                }`}
                                title={fileObj ? `Specs: ${fileObj.name} (Click to edit link)` : "No specs file linked. Click to link a Figma file"}
                              >
                                <Link2 className="w-3.5 h-3.5" />
                              </button>
                              <span 
                                className="truncate text-[11px] font-medium grow"
                                onDoubleClick={(e) => {
                                  e.stopPropagation();
                                  setEditingCombinationId(comb.id);
                                  setEditingCombinationName(comb.name);
                                }}
                                title="Double-click to rename"
                              >
                                {comb.name}
                              </span>
                            </>
                          )}
                        </div>

                        {/* Quick Rename / Delete button bar */}
                        <div className="flex items-center gap-1 opacity-0 group-hover/combo:opacity-100 transition-opacity shrink-0">
                          {!isNameEditing && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingCombinationId(comb.id);
                                setEditingCombinationName(comb.name);
                              }}
                              className="p-1 rounded bg-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-700 cursor-pointer border-none flex items-center justify-center"
                              title="Rename combination"
                            >
                              <Pencil className="w-3 h-3" />
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleShareCombination(comb, e);
                            }}
                            className="p-1 rounded bg-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-700 cursor-pointer border-none flex items-center justify-center"
                            title="Copy Share Web View URL"
                          >
                            <Share2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteCombination(comb.id, e);
                            }}
                            className="p-1 rounded bg-neutral-800 text-rose-450 hover:text-rose-350 hover:bg-neutral-700 cursor-pointer border-none flex items-center justify-center"
                            title="Delete combination"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Section 1: Specimen Kit */}
          <div className="p-4 border-b border-[#1C1C1C] flex flex-col gap-2.5 shrink-0">
            <div className="flex items-center justify-between text-[10px] font-sans uppercase text-neutral-450 font-bold tracking-wider">
              <span>M3 Components</span>
            </div>
            
            <div className="grid grid-cols-2 gap-1.5">
              <button 
                onClick={() => handleAddNewComponent('card')}
                className="flex items-center gap-1.5 px-2 py-1.5 rounded bg-[#1E1E1E] hover:bg-[#18A0FB] hover:text-white text-[11px] font-semibold tracking-wide text-neutral-300 transition-colors shadow-sm outline-none border-none cursor-pointer"
              >
                <Plus className="w-3 h-3 text-[#18A0FB] group-hover:text-white" />
                <span>Card</span>
              </button>
              <button 
                onClick={() => handleAddNewComponent('button')}
                className="flex items-center gap-1.5 px-2 py-1.5 rounded bg-[#1E1E1E] hover:bg-[#18A0FB] hover:text-white text-[11px] font-semibold tracking-wide text-neutral-300 transition-colors shadow-sm outline-none border-none cursor-pointer"
              >
                <Plus className="w-3 h-3 text-[#18A0FB] group-hover:text-white" />
                <span>Button</span>
              </button>
              <button 
                onClick={() => handleAddNewComponent('chip')}
                className="flex items-center gap-1.5 px-2 py-1.5 rounded bg-[#1E1E1E] hover:bg-[#18A0FB] hover:text-white text-[11px] font-semibold tracking-wide text-neutral-300 transition-colors shadow-sm outline-none border-none cursor-pointer"
              >
                <Plus className="w-3 h-3 text-[#18A0FB] group-hover:text-white" />
                <span>Chip</span>
              </button>
              <button 
                onClick={() => handleAddNewComponent('fab')}
                className="flex items-center gap-1.5 px-2 py-1.5 rounded bg-[#1E1E1E] hover:bg-[#18A0FB] hover:text-white text-[11px] font-semibold tracking-wide text-neutral-300 transition-colors shadow-sm outline-none border-none cursor-pointer"
              >
                <Plus className="w-3 h-3 text-[#18A0FB] group-hover:text-white" />
                <span>FAB</span>
              </button>
              <button 
                onClick={() => handleAddNewComponent('dialog')}
                className="flex items-center gap-1.5 px-2 py-1.5 rounded bg-[#1E1E1E] hover:bg-[#18A0FB] hover:text-white text-[11px] font-semibold tracking-wide text-neutral-300 transition-colors shadow-sm outline-none border-none cursor-pointer"
              >
                <Plus className="w-3 h-3 text-[#18A0FB] group-hover:text-white" />
                <span>Dialog</span>
              </button>
              <button 
                onClick={() => handleAddNewComponent('sheets')}
                className="flex items-center gap-1.5 px-2 py-1.5 rounded bg-[#1E1E1E] hover:bg-[#18A0FB] hover:text-white text-[11px] font-semibold tracking-wide text-neutral-300 transition-colors shadow-sm outline-none border-none cursor-pointer"
              >
                <Plus className="w-3 h-3 text-[#18A0FB] group-hover:text-white" />
                <span>Page Sheets</span>
              </button>
              <button 
                onClick={() => handleAddNewComponent('avatar')}
                className="flex items-center gap-1.5 px-2 py-1.5 rounded bg-[#1E1E1E] hover:bg-[#18A0FB] hover:text-white text-[11px] font-semibold tracking-wide text-neutral-300 transition-colors shadow-sm outline-none border-none cursor-pointer"
              >
                <Plus className="w-3 h-3 text-[#18A0FB] group-hover:text-white" />
                <span>Avatar</span>
              </button>
              <button 
                onClick={() => handleAddNewComponent('progress')}
                className="flex items-center gap-1.5 px-2 py-1.5 rounded bg-[#1E1E1E] hover:bg-[#18A0FB] hover:text-white text-[11px] font-semibold tracking-wide text-neutral-300 transition-colors shadow-sm outline-none border-none cursor-pointer"
              >
                <Plus className="w-3 h-3 text-[#18A0FB] group-hover:text-white" />
                <span>Progress</span>
              </button>
            </div>
          </div>

          {/* Section 2: Active Canvas Layers */}
          <div className="p-4 border-b border-[#1C1C1C] flex flex-col gap-2 shrink-0">
            <div className="flex items-center justify-between text-[10px] font-sans uppercase text-neutral-450 font-bold tracking-wider">
              <span>Layers</span>
            </div>
            
            <div className="space-y-1 max-h-[160px] overflow-y-auto pr-1">
              {canvasComponents.length === 0 ? (
                <div className="text-[10px] text-neutral-500 italic p-1.5 text-center">No layers active</div>
              ) : (
                canvasComponents.map((c, idx) => {
                  const isSelected = selectedComponentId === c.id;
                  return (
                    <div 
                      key={c.id}
                      onClick={() => setSelectedComponentId(c.id)}
                      className={`group/layer flex items-center justify-between p-1.5 px-2 rounded text-xs transition-colors cursor-pointer select-none border ${
                        isSelected 
                          ? 'bg-[#18A0FB]/10 border-[#18A0FB]/40 text-white font-semibold' 
                          : 'bg-[#1E1E1E] hover:bg-neutral-800 border-neutral-800/40 text-neutral-300'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 truncate flex-1">
                        <Layers className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                        <span className="font-semibold truncate text-[11px] text-[#E6E6E6]">{c.name}</span>
                      </div>
                      
                      {/* Layer management speed bar */}
                      <div className="opacity-0 pointer-events-none group-hover/layer:opacity-100 group-hover/layer:pointer-events-auto flex items-center gap-1 transition-opacity shrink-0">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMoveLayer(c.id, 'down');
                          }}
                          disabled={idx === 0}
                          className={`p-1 rounded bg-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-700 border-none outline-none cursor-pointer flex items-center justify-center ${
                            idx === 0 ? 'opacity-30 cursor-not-allowed' : ''
                          }`}
                          title="Move backward"
                        >
                          <ChevronDown className="w-3 h-3" />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMoveLayer(c.id, 'up');
                          }}
                          disabled={idx === canvasComponents.length - 1}
                          className={`p-1 rounded bg-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-700 border-none outline-none cursor-pointer flex items-center justify-center ${
                            idx === canvasComponents.length - 1 ? 'opacity-30 cursor-not-allowed' : ''
                          }`}
                          title="Bring forward"
                        >
                          <ChevronUp className="w-3 h-3" />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDuplicateComponent(c.id);
                          }}
                          className="p-1 rounded bg-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-700 border-none outline-none cursor-pointer flex items-center justify-center"
                          title="Duplicate layer"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteComponent(c.id);
                          }}
                          className="p-1 rounded bg-neutral-800 text-rose-450 hover:text-rose-350 hover:bg-neutral-700 border-none outline-none cursor-pointer flex items-center justify-center"
                          title="Delete layer"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Section 4: Canvas Mode & Frame Backdrop preferences */}
          <div className="p-4 flex flex-col gap-3 shrink-0" id="figma-viewer-frame-preferences">
            <div className="flex flex-col gap-1.5 text-[10px] font-sans uppercase text-neutral-350 font-bold tracking-wider">
              <span>Canvas</span>
              <div className="flex bg-[#1E1E1E] p-0.5 rounded border border-neutral-700/30 items-center justify-center h-8 self-start">
                <button
                  onClick={() => {
                    setCanvasBgMode('dark');
                    showToast("Canvas Dark Mode Active.");
                  }}
                  className={`px-3 h-full rounded text-[9.5px] font-sans font-bold flex items-center gap-1.5 transition-all cursor-pointer border-none outline-none ${
                    canvasBgMode === 'dark' ? 'bg-[#18A0FB] text-white shadow' : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                  title="Dark view mode spec"
                >
                  <Moon className="w-3 h-3" />
                  <span>Dark</span>
                </button>
                <button
                  onClick={() => {
                    setCanvasBgMode('light');
                    showToast("Canvas Light Mode Active.");
                  }}
                  className={`px-3 h-full rounded text-[9.5px] font-sans font-bold flex items-center gap-1.5 transition-all cursor-pointer border-none outline-none ${
                    canvasBgMode === 'light' ? 'bg-[#18A0FB] text-white shadow' : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                  title="Light view mode spec"
                >
                  <Sun className="w-3 h-3" />
                  <span>Light</span>
                </button>
              </div>
            </div>

            {/* Design Backdrop Controls Integration */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[10px] font-sans uppercase text-neutral-450 font-bold tracking-wider leading-none">
                <span>Backdrop</span>
              </div>

              {/* Backdrop type selectors with h-8 height matching the format ones */}
              <div className="h-8 grid grid-cols-3 gap-0.5 bg-[#1E1E1E] p-0.5 rounded-md border border-neutral-800 text-center items-center">
                {[
                  { mode: 'solid', label: 'Solid' },
                  { mode: 'uploaded', label: 'PNG' },
                  { mode: 'live', label: 'Live' }
                ].map((btn) => {
                  const isSelected = activeBackdrop === btn.mode;
                  return (
                    <button
                      key={btn.mode}
                      onClick={() => {
                        setActiveBackdrop(btn.mode);
                        setIsBackdropVisible(true);
                        showToast(`Backdrop state swapped: ${btn.label}`);
                      }}
                      className={`text-[9.5px] h-full flex items-center justify-center font-bold rounded-sm transition-all cursor-pointer border-none ${
                        isSelected 
                          ? 'bg-[#18A0FB] text-white shadow' 
                          : 'text-neutral-400 hover:text-neutral-200'
                      }`}
                    >
                      {btn.label}
                    </button>
                  );
                })}
              </div>

              {/* Solid color backdrop panel with swatch list and custom color picker */}
              {activeBackdrop === 'solid' && (
                <div className="space-y-3 pt-1">
                  <div className="space-y-1 bg-[#1E1E1E] p-2 rounded border border-neutral-800/80">
                    <span className="text-[9.5px] font-sans font-bold text-neutral-450 uppercase tracking-wider block mb-1.5">Colors</span>
                    <div className="flex items-center justify-between gap-1.5 w-full">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {/* Predefined Dynamic Colors and Custom Swatch together */}
                        {(() => {
                          const libKey = activeComp ? (activeComp.colorLibrary || globalColorLibrary) : globalColorLibrary;
                          const lib = M3_COLOR_LIBRARIES[libKey] || M3_COLOR_LIBRARIES['baseline-blue'];
                          const swatches = [
                            { hex: lib.colors.light.surface.bg, label: 'Theme Surface (Light)' },
                            { hex: lib.colors.dark.surface.bg, label: 'Theme Surface (Dark)' }
                          ];
                          return swatches.map((swatch) => (
                            <button
                              key={swatch.hex}
                              onClick={() => {
                                setBackdropSolidColor(swatch.hex);
                                showToast(`Backdrop color set to ${swatch.label}`);
                              }}
                              className={`w-5 h-5 rounded-full border cursor-pointer relative ${
                                backdropSolidColor.toLowerCase() === swatch.hex.toLowerCase() 
                                  ? 'border-[#18A0FB] scale-105 shadow shadow-[#18A0FB]/10' 
                                  : 'border-neutral-700 hover:border-neutral-500'
                              }`}
                              style={{ backgroundColor: swatch.hex }}
                              title={`${swatch.label} (${swatch.hex})`}
                            >
                              {backdropSolidColor.toLowerCase() === swatch.hex.toLowerCase() && (
                                <span className="absolute inset-0 flex items-center justify-center text-[7px] text-white mix-blend-difference font-bold font-sans">✓</span>
                              )}
                            </button>
                          ));
                        })()}
                      </div>

                      {/* Custom color picker swatch with rainbow background prior to selection, solid + checkmark when active */}
                      {(() => {
                        const libKey = activeComp ? (activeComp.colorLibrary || globalColorLibrary) : globalColorLibrary;
                        const lib = (customLibraries[libKey] || M3_COLOR_LIBRARIES[libKey]) || M3_COLOR_LIBRARIES['baseline-blue'];
                        const darkHex = lib.colors.dark.surface.bg;
                        const lightHex = lib.colors.light.surface.bg;
                        
                        const isPresetSelected = backdropSolidColor.toLowerCase() === darkHex.toLowerCase() ||
                                                 backdropSolidColor.toLowerCase() === lightHex.toLowerCase();
                        const isCustomActive = !isPresetSelected;

                        return (
                          <div 
                            className={`relative w-5 h-5 rounded-full overflow-hidden border flex items-center justify-center cursor-pointer transition-all duration-200 shrink-0 ${
                              isCustomActive 
                                ? 'border-[#18A0FB] scale-110 shadow shadow-[#18A0FB]/20 z-10' 
                                : 'border-neutral-750 hover:border-neutral-550'
                            }`}
                            style={isCustomActive ? { backgroundColor: backdropSolidColor } : { backgroundImage: 'linear-gradient(135deg, #ff0055, #ffdd00, #00ffaa, #00a2ff, #bb00ff)' }}
                            title="Choose custom background color"
                          >
                            <input 
                              type="color" 
                              value={isCustomActive ? backdropSolidColor : '#333333'} 
                              onChange={(e) => {
                                setBackdropSolidColor(e.target.value);
                                showToast(`Backdrop color customized to: ${e.target.value}`);
                              }}
                              className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
                            />
                            {isCustomActive && (
                              <span className="absolute inset-0 flex items-center justify-center text-[7.5px] text-white mix-blend-difference font-bold font-sans z-0 pointer-events-none">✓</span>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              )}

              {/* Upload input for PNG backdrop nested nicely here */}
              {activeBackdrop === 'uploaded' && (
                <div className="space-y-1 leading-normal pt-1">
                  <label className="flex items-center justify-center gap-1.5 h-8 p-1 px-3 rounded border border-dashed border-neutral-800 hover:border-[#18A0FB] bg-[#1E1E1E]/40 cursor-pointer text-center hover:bg-neutral-800 transition-colors">
                    <Upload className="w-3.5 h-3.5 text-[#18A0FB] shrink-0" />
                    <span className="text-[9.5px] font-sans font-bold uppercase tracking-wider text-neutral-300 truncate">
                      {uploadedFrameName ? uploadedFrameName : 'Choose PNG Spec'}
                    </span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleFileSelect} 
                      className="hidden" 
                    />
                  </label>
                </div>
              )}

              {/* Live URL address input nested nicely here */}
              {activeBackdrop === 'live' && (
                <div className="space-y-1.5 pt-1">
                  <input
                    type="url"
                    value={liveFrameUrl}
                    onChange={(e) => setLiveFrameUrl(e.target.value)}
                    className="w-full bg-[#2C2C2C] text-neutral-200 border border-neutral-700/30 rounded px-2.5 py-1 text-xs focus:border-[#18A0FB] focus:outline-none font-sans"
                    placeholder="https://preview-url.com"
                  />
                </div>
              )}

              {/* Custom Sliders: Opacity & scale */}
              {activeBackdrop !== 'none' && isBackdropVisible && (
                <div className="space-y-3 pt-2">
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[9.5px] font-sans uppercase text-neutral-450 font-bold tracking-wider leading-none select-none">
                      <span>Opacity</span>
                      <span className="font-mono text-[10px] font-bold text-[#18A0FB] leading-none">{Math.round(backdropOpacity * 100)}%</span>
                    </div>
                    <div className="h-8 bg-[#1E1E1E] px-2.5 rounded-md flex items-center border border-neutral-800/80">
                      <input 
                        type="range"
                        min="0.1"
                        max="1.0"
                        step="0.05"
                        value={backdropOpacity}
                        onChange={(e) => setBackdropOpacity(Number(e.target.value))}
                        className="w-full h-1 bg-neutral-800 rounded cursor-pointer accent-[#18A0FB]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[9.5px] font-sans uppercase text-neutral-450 font-bold tracking-wider leading-none select-none">
                      <span>Scale</span>
                      <span className="font-mono text-[10px] font-bold text-[#18A0FB] leading-none">{backdropScale}%</span>
                    </div>
                    <div className="h-8 bg-[#1E1E1E] px-2.5 rounded-md flex items-center border border-neutral-800/80">
                      <input 
                        type="range"
                        min="35"
                        max="180"
                        step="5"
                        value={backdropScale}
                        onChange={(e) => setBackdropScale(Number(e.target.value))}
                        className="w-full h-1 bg-neutral-800 rounded cursor-pointer accent-[#18A0FB]"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section 4: Aurora API Reference & Sizing Specs */}
          <div className="p-4 border-t border-[#1C1C1C] flex flex-col gap-2.5 shrink-0 bg-[#242424]/40 text-[#E6E6E6]" id="m3-api-link-module">
            <div className="flex items-center justify-between text-[10px] font-sans uppercase text-neutral-450 font-bold tracking-wider">
              <span>Aurora API</span>
            </div>

            <div className="bg-[#1E1E1E] p-2.5 rounded-lg border border-neutral-800 space-y-2.5">
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[9px] font-sans">
                  <span className="text-neutral-500 font-bold uppercase tracking-wider">Endpoint API URL</span>
                  <button 
                    onClick={() => setIsEditingApiUrl(!isEditingApiUrl)}
                    className="text-[#18A0FB] hover:text-[#18A0FB]/80 transition-colors cursor-pointer flex items-center gap-0.5 font-bold border-none bg-transparent outline-none p-0"
                    title={isEditingApiUrl ? 'Cancel edit' : 'Edit API URL'}
                  >
                    {isEditingApiUrl ? <X className="w-3 h-3 text-red-100" /> : <Pencil className="w-2.5 h-2.5" />}
                  </button>
                </div>

                {isEditingApiUrl ? (
                  <div className="flex items-center gap-1.5 mt-1">
                    <input
                      type="text"
                      value={apiUrl}
                      onChange={(e) => {
                        setApiUrl(e.target.value);
                      }}
                      className="flex-1 bg-[#2C2C2C] text-neutral-200 border border-neutral-700/40 rounded px-2 py-1 text-[10.5px] focus:border-[#18A0FB] focus:outline-none font-mono tracking-wide"
                      placeholder="Enter API URL"
                    />
                    <button
                      onClick={() => {
                        localStorage.setItem('m3_api_url', apiUrl);
                        setIsEditingApiUrl(false);
                        showToast("Saved customized Aurora API Link!");
                      }}
                      className="p-1 rounded bg-[#18A0FB] hover:bg-[#18A0FB]/80 text-white flex items-center justify-center border-none cursor-pointer shadow-sm transition-all"
                      title="Save custom API link"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between bg-[#2C2C2C] border border-neutral-800 rounded px-2 py-1 gap-1.5 text-[10.5px] group/apilink overflow-hidden">
                    <a
                      href={apiUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#18A0FB] hover:underline font-mono truncate text-[10px] select-all flex-1"
                    >
                      {apiUrl}
                    </a>
                    <ExternalLink className="w-3 h-3 text-neutral-500 shrink-0 group-hover/apilink:text-[#18A0FB] transition-colors" />
                  </div>
                )}
              </div>
            </div>
          </div>

        </aside>

         {/* CENTER CAMERA VIEWPORT: FIGMA EDITOR CANVAS */}
        <main 
          className={`flex-1 flex flex-col items-center justify-center relative p-8 transition-colors duration-300 overflow-hidden ${
            canvasBgMode === 'dark' ? 'bg-[#1E1E1E]' : 'bg-[#F4F4F6]'
          }`} 
          id="figma-editor-canvas"
          data-theme={canvasBgMode}
          style={{
            ...(isBackdropVisible && activeBackdrop === 'solid' ? { backgroundColor: backdropSolidColor } : {}),
            // Inject theme tokens so all md- components pick up the active color library
            '--md-sys-color-primary': (() => { const k = globalColorLibrary||'baseline-blue'; const lib=(customLibraries[k]||M3_COLOR_LIBRARIES[k]||M3_COLOR_LIBRARIES['baseline-blue']); return lib.colors[canvasBgMode].primary.bg; })(),
            '--md-sys-color-on-primary': (() => { const k = globalColorLibrary||'baseline-blue'; const lib=(customLibraries[k]||M3_COLOR_LIBRARIES[k]||M3_COLOR_LIBRARIES['baseline-blue']); return lib.colors[canvasBgMode].primary.text; })(),
            '--md-sys-color-primary-container': (() => { const k = globalColorLibrary||'baseline-blue'; const lib=(customLibraries[k]||M3_COLOR_LIBRARIES[k]||M3_COLOR_LIBRARIES['baseline-blue']); return lib.colors[canvasBgMode].secondary.bg; })(),
            '--md-sys-color-on-primary-container': (() => { const k = globalColorLibrary||'baseline-blue'; const lib=(customLibraries[k]||M3_COLOR_LIBRARIES[k]||M3_COLOR_LIBRARIES['baseline-blue']); return lib.colors[canvasBgMode].secondary.text; })(),
            '--md-sys-color-secondary-container': (() => { const k = globalColorLibrary||'baseline-blue'; const lib=(customLibraries[k]||M3_COLOR_LIBRARIES[k]||M3_COLOR_LIBRARIES['baseline-blue']); return lib.colors[canvasBgMode].secondary.bg; })(),
            '--md-sys-color-on-secondary-container': (() => { const k = globalColorLibrary||'baseline-blue'; const lib=(customLibraries[k]||M3_COLOR_LIBRARIES[k]||M3_COLOR_LIBRARIES['baseline-blue']); return lib.colors[canvasBgMode].secondary.text; })(),
            '--md-sys-color-surface': (() => { const k = globalColorLibrary||'baseline-blue'; const lib=(customLibraries[k]||M3_COLOR_LIBRARIES[k]||M3_COLOR_LIBRARIES['baseline-blue']); return lib.colors[canvasBgMode].surface.bg; })(),
            '--md-sys-color-surface-container-low': (() => { const k = globalColorLibrary||'baseline-blue'; const lib=(customLibraries[k]||M3_COLOR_LIBRARIES[k]||M3_COLOR_LIBRARIES['baseline-blue']); return lib.colors[canvasBgMode].surface.bg; })(),
            '--md-sys-color-on-surface': (() => { const k = globalColorLibrary||'baseline-blue'; const lib=(customLibraries[k]||M3_COLOR_LIBRARIES[k]||M3_COLOR_LIBRARIES['baseline-blue']); return lib.colors[canvasBgMode].surface.text; })(),
            '--md-sys-color-on-surface-variant': (() => { const k = globalColorLibrary||'baseline-blue'; const lib=(customLibraries[k]||M3_COLOR_LIBRARIES[k]||M3_COLOR_LIBRARIES['baseline-blue']); return lib.colors[canvasBgMode].surface.subtext; })(),
          } as React.CSSProperties}
          onMouseDown={(e) => {
            window.focus();
            if (e.target === e.currentTarget) {
              setSelectedComponentId('');
            }
            // Capturing click anywhere on/off components on the canvas
            const rect = e.currentTarget.getBoundingClientRect();
            const x = Math.round(e.clientX - rect.left);
            const y = Math.round(e.clientY - rect.top);
            const clickId = Math.random().toString(36).substring(2, 9);
            const newClick: InteractiveClick = {
              id: clickId,
              x,
              y,
              timestamp: Date.now(),
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
            };
            setRecordedClicks(prev => [...prev.slice(-9), newClick]);
            setTimeout(() => {
              setRecordedClicks(prev => prev.filter(c => c.id !== clickId));
            }, 1200);
          }}
        >
          
          {/* Subpixel Dotted Grid Background */}
          {gridVisible && (
            <div 
              className="absolute inset-0 pointer-events-none opacity-30"
              style={{
                backgroundImage: canvasBgMode === 'dark'
                  ? 'radial-gradient(rgba(255, 255, 255, 0.05) 0.75px, transparent 0.75px)'
                  : 'radial-gradient(rgba(0, 0, 0, 0.075) 0.75px, transparent 0.75px)',
                backgroundSize: '16px 16px',
                zIndex: 0
              }}
            />
          )}

          {/* =========================================================================================
              DESIGN CONTEXT BACKDROP SYSTEM
              ========================================================================================= */}
          {isBackdropVisible && (
            <div className="absolute inset-0 z-1 pointer-events-none flex items-center justify-center overflow-hidden animate-fade-in">
              {/* PNG Uploaded Frame Backdrop */}
              {activeBackdrop === 'uploaded' && uploadedFrameUrl && (
                <div 
                  className="absolute transition-all duration-300"
                  style={{
                    backgroundImage: `url(${uploadedFrameUrl})`,
                    backgroundSize: 'contain',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    width: '90%',
                    height: '90%',
                    opacity: backdropOpacity,
                    transform: `scale(${backdropScale / 100})`
                  }}
                />
              )}

              {/* Live Webpage / Prototype Frame Backdrop */}
              {activeBackdrop === 'live' && liveFrameUrl && (
                <div 
                  className="absolute inset-0 z-0 overflow-hidden bg-white"
                  style={{
                    opacity: backdropOpacity,
                  }}
                >
                  {/* Render Live Frame inside isolated sandbox space, filling full viewport area */}
                  <iframe 
                    src={liveFrameUrl} 
                    title="Live Frame Preview" 
                    scrolling="no"
                    style={{ overflow: 'hidden' }}
                    className="w-full h-full border-none bg-white select-none pointer-events-none"
                  />
                </div>
              )}

            </div>
          )}

          {/* =========================================================================================
              SELECTABLE, MOVABLE & RESIZABLE MATERIAL 3 SPECIMEN
              ========================================================================================= */}
          {/* =========================================================================================
              SELECTABLE, MOVABLE & RESIZABLE MULTIPLE MATERIAL 3 SPECIMENS
              ========================================================================================= */}
          <div className="absolute inset-0 pb-20 z-10 pointer-events-none flex items-center justify-center">
            {canvasComponents.length === 0 ? (
              <div 
                className={`pointer-events-auto text-center font-sans max-w-xs p-8 rounded-2xl border border-dashed transition-all duration-300 flex flex-col items-center gap-2 shadow-xs ${
                  canvasBgMode === 'light'
                    ? 'bg-[#FDFDFE] border-neutral-300 shadow-sm'
                    : 'bg-[#121214]/60 border-neutral-800 shadow-lg'
                }`}
              >
                <div 
                  className={`w-12 h-12 rounded-full border border-dashed flex items-center justify-center mb-1 ${
                    canvasBgMode === 'light' ? 'border-neutral-300 bg-neutral-200/35' : 'border-neutral-800 bg-neutral-900/30'
                  }`}
                >
                  <span 
                    className={`material-symbols-outlined text-[20px] select-none ${
                      canvasBgMode === 'light' ? 'text-neutral-500' : 'text-neutral-600'
                    }`}
                  >
                    space_dashboard
                  </span>
                </div>
                <span 
                  className={`text-[11.5px] select-none block font-bold uppercase tracking-wider ${
                    canvasBgMode === 'light' ? 'text-neutral-700' : 'text-neutral-300'
                  }`}
                >
                  Canvas is empty
                </span>
                <span 
                  className={`text-[9.5px] select-none leading-relaxed mt-0.5 ${
                    canvasBgMode === 'light' ? 'text-neutral-500' : 'text-neutral-500'
                  }`}
                >
                  Click on any specimen from the specimen kit sidebar to add it.
                </span>
              </div>
            ) : (
              <div className="absolute inset-0 z-10 pointer-events-none">
                {canvasComponents.map((comp) => {
                  const isSelected = selectedComponentId === comp.id;
                  // Resolve spec colors
                  const themeColors = getM3SpecificStyles(comp, canvasBgMode);
                  const compBgColor = themeColors.bg;
                  const compTextColor = themeColors.text;
                  const compSubtextColor = themeColors.subtext;
                  const compBorderColor = themeColors.borderColor;
                  const compShadow = themeColors.shadow;
                  const hasBaseShaderBg = themeColors.hasBaseShaderBg;

                  const libKey = comp.colorLibrary || globalColorLibrary || 'baseline-blue';
                  const lib = (customLibraries[libKey] || M3_COLOR_LIBRARIES[libKey]) || M3_COLOR_LIBRARIES['baseline-blue'];
                  const libColors = lib.colors[canvasBgMode];

                  const compState = comp.activeState !== undefined ? comp.activeState : 0;
                  const compPreviousState = comp.previousState !== undefined ? comp.previousState : 0;
                  const compTransitionVal = comp.transitionVal !== undefined ? comp.transitionVal : 1.0;

                  // Resolve dynamic, pristine fluid/energy colors directly from official Material 3 Energy API state tokens
                  const getEnergyColorsForState = (stateId: number) => {
                    const stateObj = OFFICIAL_STATES.find(s => s.id === stateId);
                    if (stateObj) {
                      return {
                        mid: stateObj.defaultMid,
                        end: stateObj.defaultEnd
                      };
                    }
                    return {
                      mid: compBgColor,
                      end: compBgColor
                    };
                  };

                  const prevStateColors = getEnergyColorsForState(compPreviousState);
                  const currStateColors = getEnergyColorsForState(compState);

                  const compMidColor = interpolateHexColors(prevStateColors.mid, currStateColors.mid, compTransitionVal);
                  const compEndColor = interpolateHexColors(prevStateColors.end, currStateColors.end, compTransitionVal);

                  // Define whether active state has blurred/bloomed boundaries defined by the M3 fluid / energy API
                  // "I believe when the variant is named outline, no blurring takes place outside of the component container"
                  const isStateBlurred = (compState === 2 || compState === 3 || compState === 4 || compState === 5) &&
                                         comp.variant !== 'outlined' &&
                                         comp.variant !== 'outline' &&
                                         comp.variant !== 'text' &&
                                         comp.variant !== 'assist';

                  // Boundary warping/deforming only happens in states 2, 3, and 4 (excluding 5)
                  const isBoundaryWarped = (compState === 2 || compState === 3 || compState === 4) &&
                                           comp.variant !== 'outlined' &&
                                           comp.variant !== 'outline' &&
                                           comp.variant !== 'text' &&
                                           comp.variant !== 'assist';

                  // Convert hex to rgb for fallback border bloom
                  const hexToRgbStr = (hex: string, alpha: number) => {
                    try {
                      const r = parseInt(hex.slice(1, 3), 16);
                      const g = parseInt(hex.slice(3, 5), 16);
                      const b = parseInt(hex.slice(5, 7), 16);
                      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
                    } catch (e) {
                      return `rgba(66, 133, 244, ${alpha})`;
                    }
                  };

                  // Get active state color for border bloom directly from dynamic primary/secondary colors
                  const statusGlowColor = hexToRgbStr(currStateColors.mid, 0.55);

                  // Compute dynamic layered glow shadow following the speed/intensity
                  const dynamicGlow = comp.type === 'progress' || isStateBlurred 
                    ? 'none'
                    : (canvasBgMode === 'dark' ? '0 16px 40px rgba(0,0,0,0.5)' : '0 10px 24px rgba(0,0,0,0.08)');

                  // Compute physical card container blur (melts edges as per the API)
                  const containerFilter = 'none';

                  // Compute inner WebGL simulation canvas blur for fluid liquid bloom (shader itself computes localized edge blurs, so keep canvas sharp & details visible)
                  const innerCanvasFilter = isStateBlurred 
                    ? `blur(${intensity * 1.5}px) saturate(1.15)` 
                    : 'none';

                  // Material symbol icons
                  const rawIcon = comp.activeIcon || 'volume_up';
                  const localIcon = (rawIcon === 'sparkles' || rawIcon === 'sparkle' || rawIcon === 'auto_awesome') ? 'auto_awesome' : rawIcon;

                  // Sizing classes/styles
                  const sizeMetrics = M3_SIZE_PRESETS[comp.type]?.[comp.sizePreset] || { width: comp.width, height: comp.height, borderRadius: comp.borderRadius };

                  // Font styles
                  const titleFont = M3_FONT_STYLES[comp.fontStyleTitle] || (comp.type === 'card' ? M3_FONT_STYLES.titleMedium : M3_FONT_STYLES.titleLarge);
                  const descFont = M3_FONT_STYLES[comp.fontStyleText] || M3_FONT_STYLES.bodyMedium;
                  const isElementSpecimen = ['button', 'chip', 'fab', 'badge', 'avatar', 'progress'].includes(comp.type);

                  return (
                    <div 
                      key={comp.id}
                      id={`specimen-wrapper-${comp.id}`}
                      className={`absolute pointer-events-auto cursor-grab active:cursor-grabbing group/comp transition-[filter,box-shadow] duration-300 overflow-hidden ${
                        (isSelected && !isRecording && recordingCountdown === null) ? 'ring-2 ring-[#18A0FB] ring-offset-2 ring-offset-[#1E1E1E] z-30' : (isRecording || recordingCountdown !== null ? 'z-20' : 'hover:ring-1 hover:ring-[#18A0FB]/50 z-20')
                      }`}
                      style={{
                        left: `calc(50% + ${comp.x}px)`,
                        top: `calc(50% + ${comp.y}px)`,
                        transform: 'translate(-50%, -50%)',
                        width: comp.sizeMode === 'auto' ? 'auto' : `${comp.width}px`,
                        height: comp.heightMode === 'auto' ? 'auto' : `${comp.height}px`,
                        minWidth: comp.sizeMode === 'auto' ? (comp.type === 'card' || comp.type === 'dialog' || comp.type === 'sheets' ? '220px' : (['avatar', 'fab', 'badge', 'progress'].includes(comp.type) ? 'auto' : '72px')) : undefined,
                        minHeight: comp.heightMode === 'auto' ? (comp.type === 'card' || comp.type === 'dialog' || comp.type === 'sheets' ? '110px' : (['avatar', 'fab', 'badge', 'progress'].includes(comp.type) ? 'auto' : '20px')) : undefined,
                        borderRadius: comp.type === 'avatar' ? '50%' : comp.type === 'chip' ? '8px' : `${comp.borderRadius}px`,
                        boxShadow: isElementSpecimen ? 'none' : dynamicGlow,
                        filter: containerFilter
                      }}
                      onMouseDown={(e) => handleMoveStart(e, comp.id)}
                      onMouseMove={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const x = Math.round(e.clientX - rect.left);
                        const y = Math.round(e.clientY - rect.top);
                        setRecMousePos({ x, y });
                      }}
                      onMouseLeave={() => {
                        setRecMousePos({ x: -100, y: -100 });
                      }}
                    >
                  {/* Select badge overlay hidden during recording so it does not clutter */}
                  {isSelected && !isRecording && recordingCountdown === null && (
                    <div className="absolute -top-7 left-0 whitespace-nowrap flex-nowrap min-w-max w-max bg-[#18A0FB] text-white text-[10px] font-sans font-bold uppercase tracking-wide px-2 py-0.5 rounded shadow flex items-center gap-1.5 select-none z-40">
                      <span>{comp.type}</span>
                      <span className="opacity-60">|</span>
                      <span>{comp.width} X {comp.height} px</span>
                    </div>
                  )}

                  {/* Energy applied directly to component container */}
                  {/* DYNAMIC SHADER SURFACE CONTAINER - 100% PRISTINE */}
                  <div
                    className={`relative overflow-visible flex flex-col justify-between w-full ${comp.heightMode === 'auto' ? '' : 'h-full'}`}
                    style={{
                      borderRadius: comp.type === 'avatar' ? '50%' : `${comp.borderRadius}px`,
                      isolation: 'isolate',
                    }}
                  >
                    {/* Morphing background layer representing the active kinetic/liquid Container */}
                    <div
                      className={`absolute inset-0 z-0 transition-[border-color,background-color] duration-300 ${
                        isBoundaryWarped && isAnimationActive 
                          ? (compState === 2 ? 'energy-edge-listening' :
                             compState === 3 ? 'energy-edge-responding' :
                             compState === 4 ? 'energy-edge-processing' : 'energy-edge-listening')
                          : ''
                      }`}
                      style={{
                        borderRadius: (isBoundaryWarped && isAnimationActive) ? undefined : (comp.type === 'avatar' ? '50%' : `${comp.borderRadius}px`),
                        ['--edge-br' as any]: `${comp.borderRadius}px`,
                        ['--intensity' as any]: intensity,
                        ['--intensity-multiplier' as any]: intensity,
                        backgroundColor: (isElementSpecimen || compState !== 0) ? 'transparent' : compBgColor,
                        filter: (isBoundaryWarped && isAnimationActive) ? 'url(#m3-energy-warp-filter)' : 'none',
                        boxShadow: isElementSpecimen
                          ? 'none'
                          : isStateBlurred && isAnimationActive
                          ? `0 0 ${intensity * 12 + 6}px ${statusGlowColor}, inset 0 0 ${intensity * 6 + 2}px ${statusGlowColor}`
                          : compShadow,
                        border: isElementSpecimen
                          ? 'none'
                          : compBorderColor !== 'transparent'
                          ? `1.5px solid ${compBorderColor}`
                          : 'none',
                        overflow: isBoundaryWarped ? 'visible' : 'hidden'
                      }}
                    >
                      {/* GLSL dynamic webgl fluid wave rendering canvas wrapper with dynamic bleed and blur inside the active background container */}
                      {hasBaseShaderBg && compState !== 0 && (
                        <div 
                          className="absolute pointer-events-none transition-all duration-300"
                          style={{
                            left: isBoundaryWarped ? '-80px' : '0px',
                            top: isBoundaryWarped ? '-80px' : '0px',
                            width: isBoundaryWarped ? 'calc(100% + 160px)' : '100%',
                            height: isBoundaryWarped ? 'calc(100% + 160px)' : '100%',
                            maxWidth: 'none',
                            filter: innerCanvasFilter,
                            zIndex: 0,
                            opacity: 1.0,
                          }}
                        >
                          <ShaderRenderer
                            canvasId={`canvas-for-${comp.id}`}
                            state={compState}
                            previousState={compPreviousState}
                            transition={compTransitionVal}
                            width={comp.width}
                            height={comp.height}
                            borderRadius={comp.borderRadius}
                            baseColorHex={compBgColor}
                            midColorHex={compMidColor}
                            endColorHex={compEndColor}
                            hoverActive={isHovered && isSelected}
                            renderMode={0}
                            intensity={intensity}
                            isActive={isAnimationActive}
                          />
                        </div>
                      )}
                    </div>

                    {/* Inline custom css style block for high-accuracy hardware click ripple rendering */}
                     <style>{`
                       @keyframes clickRippleAnimation {
                         0% { transform: scale(0.4); opacity: 1; }
                         100% { transform: scale(2.4); opacity: 0; }
                       }
                       .click-ripple-animate {
                         animation: clickRippleAnimation 0.9s cubic-bezier(0.1, 0.8, 0.25, 1) forwards;
                       }
                       ${!isElementSpecimen && compState !== 0 ? `
                         #specimen-wrapper-${comp.id} .md-card,
                         #specimen-wrapper-${comp.id} .md-card--elevated,
                         #specimen-wrapper-${comp.id} .md-card--filled,
                         #specimen-wrapper-${comp.id} .md-card--outlined,
                         #specimen-wrapper-${comp.id} .md-dialog,
                         #specimen-wrapper-${comp.id} .md-bottom-sheet,
                         #specimen-wrapper-${comp.id} .md-side-sheet {
                           background-color: transparent !important;
                           box-shadow: none !important;
                         }
                       ` : ''}
                     `}</style>


                    {/* =========================================================
                        PRECISE CLEAN MATERIAL 3 COMPONENT SPECIMEN
                        ========================================================= */}
                    <div 
                      className="relative w-full h-full z-10 flex flex-col pointer-events-auto shrink-0 grow justify-center"
                      onMouseDown={(e) => handleSpecimenClick(e, comp.id)}
                    >
                      {/* SPECIMEN: BUTTON */}
                      {/* SPECIMEN: BUTTON */}
                      {comp.type === 'button' && (
                        <M3Button
                          variant={(comp.variant as any) || 'filled'}
                          size={comp.sizePreset === 'xsmall' ? 'xs' : comp.sizePreset === 'small' ? 's' : comp.sizePreset === 'medium' ? 'm' : comp.sizePreset === 'large' ? 'l' : 'xl'}
                          onClick={handleButtonClick}
                          icon={comp.configShowIcon ? localIcon : undefined}
                          className="pointer-events-auto"
                        >
                          <span
                            contentEditable suppressContentEditableWarning
                            onMouseDown={(e) => e.stopPropagation()}
                            onBlur={(e) => updateComponentField(comp.id, 'text', e.currentTarget.innerText)}
                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); } }}
                            className="cursor-text outline-none inline-block"
                          >{comp.text}</span>
                        </M3Button>
                      )}

                      {/* SPECIMEN: CARD */}
                      {comp.type === 'card' && (
                        <M3Card
                          variant={(comp.variant as any) || 'elevated'}
                          layout={comp.layout || 'vertical'}
                          className="w-full h-full"
                          style={{ borderRadius: `${comp.borderRadius}px` } as React.CSSProperties}
                        >
                          {(comp.layout || 'vertical') === 'vertical' ? (
                            <>
                              {(comp.configShowIcon || comp.configShowTitle || comp.configShowSubtitle) && (
                                <M3CardHeader
                                  avatar={comp.configShowIcon ? (
                                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>{localIcon}</span>
                                  ) : undefined}
                                  header={comp.configShowTitle ? (
                                    <span contentEditable suppressContentEditableWarning
                                      onMouseDown={(e) => e.stopPropagation()}
                                      onBlur={(e) => updateComponentField(comp.id, 'title', e.currentTarget.innerText)}
                                      onKeyDown={(e) => { if (e.key==='Enter'){e.preventDefault();(e.target as HTMLElement).blur();} }}
                                      style={{ outline: 'none', cursor: 'text', display: 'block' }}>
                                      {comp.title}
                                    </span>
                                  ) : undefined}
                                  subhead={comp.configShowSubtitle ? (
                                    <span contentEditable suppressContentEditableWarning
                                      onMouseDown={(e) => e.stopPropagation()}
                                      onBlur={(e) => updateComponentField(comp.id, 'subtitle', e.currentTarget.innerText)}
                                      onKeyDown={(e) => { if (e.key==='Enter'){e.preventDefault();(e.target as HTMLElement).blur();} }}
                                      style={{ outline: 'none', cursor: 'text', display: 'block' }}>
                                      {comp.subtitle}
                                    </span>
                                  ) : undefined}
                                  action={<span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--md-sys-color-on-surface-variant)', cursor: 'pointer' }}>more_vert</span>}
                                />
                              )}
                              <M3CardMedia aspectRatio="16/9">
                                <span className="material-symbols-outlined" style={{ fontSize: '32px', color: 'var(--md-sys-color-outline)', opacity: 0.4 }}>image</span>
                              </M3CardMedia>
                              {comp.configShowDescription && (
                                <M3CardContent
                                  title={`${comp.variant ? comp.variant.charAt(0).toUpperCase()+comp.variant.slice(1) : 'Elevated'} Card`}
                                  subtitle="Material 3 • Today"
                                >
                                  <span contentEditable suppressContentEditableWarning
                                    onMouseDown={(e) => e.stopPropagation()}
                                    onBlur={(e) => updateComponentField(comp.id, 'text', e.currentTarget.innerText)}
                                    onKeyDown={(e) => { if (e.key==='Enter'){e.preventDefault();(e.target as HTMLElement).blur();} }}
                                    style={{ outline: 'none', cursor: 'text' }}>
                                    {comp.text}
                                  </span>
                                </M3CardContent>
                              )}
                              {comp.configShowActions && (
                                <M3CardActions>
                                  <M3Button variant="outlined" size="s">Secondary</M3Button>
                                  <M3Button variant="filled" size="s">Action</M3Button>
                                </M3CardActions>
                              )}
                            </>
                          ) : (
                            <>
                              <M3CardHeader
                                avatar={comp.configShowIcon ? (
                                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>{localIcon}</span>
                                ) : undefined}
                                header={comp.configShowTitle ? comp.title : undefined}
                                subhead={comp.configShowSubtitle ? comp.subtitle : undefined}
                              />
                              {comp.configShowDescription && (
                                <M3CardContent>{comp.text}</M3CardContent>
                              )}
                              <M3CardMedia aspectRatio="custom" style={{ width: '120px', flexShrink: 0, minHeight: '80px' } as React.CSSProperties}>
                                <span className="material-symbols-outlined" style={{ fontSize: '24px', color: 'var(--md-sys-color-outline)', opacity: 0.4 }}>image</span>
                              </M3CardMedia>
                            </>
                          )}
                        </M3Card>
                      )}

                      {/* SPECIMEN: CHIP */}
                      {comp.type === 'chip' && (
                        <M3Chip
                          label={comp.text || 'Interactive'}
                          variant={(comp.variant as any) || 'assist'}
                          icon={comp.configShowIcon ? localIcon : undefined}
                          selected={comp.selectedState || compState === 2}
                          onRemove={comp.variant === 'input' ? (() => {}) : undefined}
                          onClick={handleButtonClick}
                          className="pointer-events-auto"
                        />
                      )}

                      {/* SPECIMEN: FAB  */}
                      {comp.type === 'fab' && (
                        <M3FAB
                          icon={localIcon}
                          label={comp.sizePreset === 'xlarge' ? (comp.text || 'Extended FAB') : undefined}
                          variant={(comp.variant as any) || 'primary'}
                          size={comp.sizePreset === 'xlarge' ? 'extended' : comp.sizePreset === 'small' || comp.sizePreset === 'xsmall' ? 'small' : comp.sizePreset === 'large' ? 'large' : 'medium'}
                          onClick={handleButtonClick}
                          className="pointer-events-auto"
                        />
                      )}

                      {/* SPECIMEN: DIALOG */}
                      {comp.type === 'dialog' && (
                        <M3Dialog 
                          isOpen={true} 
                          onClose={() => {}} 
                          static={true}
                          className="w-full h-full"
                          style={{
                            width: '100%',
                            height: '100%',
                            maxWidth: 'none',
                            maxHeight: 'none',
                            borderRadius: 'inherit',
                            margin: 0
                          }}
                          icon={comp.variant === 'icon' ? (
                            <div className="flex items-center justify-center mx-auto mb-1">
                              <span className="material-symbols-outlined text-[32px]" style={{ color: libColors.primary.bg }}>
                                {localIcon || 'notifications'}
                              </span>
                            </div>
                          ) : (comp.configShowIcon && comp.variant !== 'scrollable') ? (
                            <div className="flex items-center justify-center mx-auto mb-1">
                              {((comp.avatarType || (comp.iconImage ? 'image' : 'icon')) === 'image' && comp.iconImage) ? (
                                <div className="rounded-full w-[40px] h-[40px] border border-white/10 shadow-sm relative overflow-hidden">
                                  <img referrerPolicy="no-referrer" src={comp.iconImage} className="w-full h-full object-cover" alt="Avatar" />
                                </div>
                              ) : (comp.avatarType || 'icon') === 'initials' ? (
                                <div className="rounded-full w-[40px] h-[40px] border border-white/10 shadow-sm flex items-center justify-center text-[12px] font-sans font-bold uppercase select-none leading-none tracking-wide text-white" style={{ backgroundColor: comp.iconBgColor || 'rgba(147, 51, 234, 0.2)' }}>
                                  {comp.avatarInitials || (comp.title ? comp.title.slice(0, 2).toUpperCase() : 'AV')}
                                </div>
                              ) : (
                                <M3Icon 
                                  name={localIcon} 
                                  size={24} 
                                  className="leading-none text-center" 
                                  style={{ color: compTextColor }}
                                />
                              )}
                            </div>
                          ) : undefined}
                          title={comp.configShowTitle ? (
                            <span 
                              contentEditable
                              suppressContentEditableWarning
                              onMouseDown={(e) => e.stopPropagation()}
                              onBlur={(e) => updateComponentField(comp.id, 'title', e.currentTarget.innerText)}
                              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); } }}
                              className={`${titleFont.class} block truncate hover:bg-white/5 cursor-text px-1 rounded outline-none transition-colors font-sans tracking-tight`} 
                              style={{ 
                                color: compTextColor,
                                textAlign: (comp.variant === 'icon' || comp.variant === 'standard') ? 'center' : 'left'
                              }}
                            >
                              {comp.title}
                            </span>
                          ) : undefined}
                          actions={comp.configShowActions ? (
                            <div className="flex items-center justify-end gap-3 pt-3 select-none shrink-0 w-full">
                              <M3Button 
                                variant="text"
                                size="s"
                                style={{ color: libColors.primary.bg }}
                              >
                                Cancel
                              </M3Button>
                              <M3Button 
                                variant="text"
                                size="s"
                                style={{ color: libColors.primary.bg, fontWeight: 'bold' }}
                              >
                                {comp.variant === 'scrollable' ? 'Ok' : 'Action'}
                              </M3Button>
                            </div>
                          ) : undefined}
                        >
                          {comp.variant === 'scrollable' ? (
                            /* Scrollable Account Selection List per Dialogue 3 spec */
                            <div className="flex flex-col gap-1.5 py-2.5 max-h-[160px] overflow-y-auto w-full text-left" id="dialog-scrollable-accounts">
                              <div className="flex items-center gap-4.5 px-1 py-1.5 rounded-lg hover:bg-neutral-800/10 dark:hover:bg-white/5 transition-colors cursor-pointer w-full">
                                <div className="rounded-full w-[36px] h-[36px] flex items-center justify-center text-[13px] font-sans font-bold uppercase select-none mr-2.5 text-[#001C38] bg-[#D3E4FF] dark:bg-sky-900/40 dark:text-sky-100">
                                  A
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-[13px] font-sans font-medium text-neutral-800 dark:text-neutral-200">List item 1</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-4.5 px-1 py-1.5 rounded-lg hover:bg-neutral-800/10 dark:hover:bg-white/5 transition-colors cursor-pointer w-full">
                                <div className="rounded-full w-[36px] h-[36px] flex items-center justify-center text-[13px] font-sans font-bold uppercase select-none mr-2.5 text-[#1D1B20] bg-[#E8DDFF] dark:bg-[#4F378B]/40 dark:text-[#E8DDFF]">
                                  B
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-[13px] font-sans font-medium text-neutral-800 dark:text-neutral-200">List item 2</span>
                                </div>
                              </div>
                            </div>
                          ) : (
                            comp.configShowDescription && (
                              <p 
                                contentEditable
                                suppressContentEditableWarning
                                onMouseDown={(e) => e.stopPropagation()}
                                onBlur={(e) => updateComponentField(comp.id, 'text', e.currentTarget.innerText)}
                                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); } }}
                                className={`${descFont.class} ${comp.heightMode === 'auto' ? '' : 'line-clamp-3'} leading-relaxed opacity-90 hover:bg-white/5 cursor-text px-1 rounded outline-none transition-colors`} 
                                style={{ 
                                  color: compTextColor,
                                  textAlign: (comp.variant === 'icon' || comp.variant === 'standard') ? 'center' : 'left'
                                }}
                              >
                                {comp.text}
                              </p>
                            )
                          )}
                        </M3Dialog>
                      )}

                      {/* SPECIMEN: BADGE */}
                      {comp.type === 'badge' && (
                        <div className="w-full h-full flex items-center justify-center" style={{ borderRadius: 'inherit' }}>
                          <M3Badge 
                            variant={comp.variant === 'dot' ? 'small' : 'large'} 
                            label={comp.variant === 'dot' ? undefined : (
                              <span 
                                contentEditable
                                suppressContentEditableWarning
                                onMouseDown={(e) => e.stopPropagation()}
                                onBlur={(e) => updateComponentField(comp.id, 'text', e.currentTarget.innerText)}
                                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); } }}
                                className="text-[9.5px] leading-none tracking-wide font-extrabold uppercase hover:bg-white/5 cursor-text px-1 rounded outline-none transition-colors inline-block select-text"
                                style={{ maxWidth: '100%', wordBreak: 'break-all', color: compTextColor }}
                              >
                                {comp.text}
                              </span>
                            )}
                          />
                        </div>
                      )}

                      {/* SPECIMEN: SHEETS */}
                      {comp.type === 'sheets' && (
                        <div className="w-full h-full relative overflow-hidden flex flex-col justify-between select-text" style={{ color: compTextColor }}>
                          {comp.variant === 'side' ? (
                            <M3SideSheet 
                              isOpen={true}
                              onClose={() => {}}
                              title={(
                                <span 
                                  contentEditable
                                  suppressContentEditableWarning
                                  onMouseDown={(e) => e.stopPropagation()}
                                  onBlur={(e) => updateComponentField(comp.id, 'title', e.currentTarget.innerText)}
                                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); } }}
                                  className={`${titleFont.class} block truncate hover:bg-slate-300/10 dark:hover:bg-white/5 cursor-text px-1 rounded outline-none transition-colors font-sans tracking-tight font-medium text-left`} 
                                  style={{ color: compTextColor }}
                                >
                                  {comp.title || 'Side Sheet'}
                                </span>
                              )}
                              static={true}
                              position="right"
                              className="w-full h-full"
                              style={{
                                width: '100%',
                                height: '100%',
                                maxWidth: 'none',
                                maxHeight: 'none',
                                backgroundColor: 'transparent',
                                border: 'none',
                                boxShadow: 'none',
                                borderRadius: 'inherit'
                              }}
                            >
                              <p 
                                contentEditable
                                suppressContentEditableWarning
                                onMouseDown={(e) => e.stopPropagation()}
                                onBlur={(e) => updateComponentField(comp.id, 'text', e.currentTarget.innerText)}
                                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); } }}
                                className={`${descFont.class} hover:bg-slate-300/10 dark:hover:bg-white/5 cursor-text outline-none select-text leading-relaxed w-full min-h-[30px] block`}
                                style={{ color: compTextColor }}
                              >
                                {comp.text}
                              </p>
                            </M3SideSheet>
                          ) : (
                            <M3BottomSheet 
                              isOpen={true}
                              onClose={() => {}}
                              title={(
                                <span 
                                  contentEditable
                                  suppressContentEditableWarning
                                  onMouseDown={(e) => e.stopPropagation()}
                                  onBlur={(e) => updateComponentField(comp.id, 'title', e.currentTarget.innerText)}
                                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); } }}
                                  className={`${titleFont.class} block truncate hover:bg-slate-300/10 dark:hover:bg-white/5 cursor-text px-1 rounded outline-none transition-colors font-sans tracking-tight font-medium text-left`} 
                                  style={{ color: compTextColor }}
                                >
                                  {comp.title || 'Bottom Sheet'}
                                </span>
                              )}
                              static={true}
                              className="w-full h-full"
                              style={{
                                width: '100%',
                                height: '100%',
                                maxWidth: 'none',
                                maxHeight: 'none',
                                backgroundColor: 'transparent',
                                border: 'none',
                                boxShadow: 'none',
                                borderRadius: 'inherit'
                              }}
                            >
                              <p 
                                contentEditable
                                suppressContentEditableWarning
                                onMouseDown={(e) => e.stopPropagation()}
                                onBlur={(e) => updateComponentField(comp.id, 'text', e.currentTarget.innerText)}
                                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); } }}
                                className={`${descFont.class} hover:bg-slate-300/10 dark:hover:bg-white/5 cursor-text outline-none select-text leading-relaxed w-full min-h-[30px] block`}
                                style={{ color: compTextColor }}
                              >
                                {comp.text}
                              </p>
                            </M3BottomSheet>
                          )}
                        </div>
                      )}

                      {/* SPECIMEN: AVATAR */}
                      {comp.type === 'avatar' && (() => {
                        const avatarSize = comp.sizePreset === 'xsmall' || comp.sizePreset === 'small' ? 'small' : comp.sizePreset === 'large' || comp.sizePreset === 'xlarge' ? 'large' : 'medium';
                        const avatarType = comp.avatarType || (comp.iconImage ? 'image' : 'icon');
                        if (avatarType === 'image' && comp.iconImage) {
                          return <M3Avatar src={comp.iconImage} size={avatarSize} />;
                        } else if (avatarType === 'initials') {
                          return <M3Avatar initials={comp.avatarInitials || comp.text?.slice(0,2)?.toUpperCase() || 'AV'} size={avatarSize} />;
                        } else {
                          const px = avatarSize === 'small' ? 32 : avatarSize === 'large' ? 56 : 40;
                          const iconPx = avatarSize === 'small' ? 16 : avatarSize === 'large' ? 28 : 20;
                          return (
                            <div className="md-avatar" style={{ width: px, height: px, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--md-sys-color-primary-container)', color: 'var(--md-sys-color-on-primary-container)', flexShrink: 0 }}>
                              <span className="material-symbols-outlined" style={{ fontSize: iconPx }}>{localIcon}</span>
                            </div>
                          );
                        }
                      })()}

                      {/* SPECIMEN: PROGRESS */}
                      {comp.type === 'progress' && (
                        <div className="w-full flex flex-col items-center justify-center gap-4 p-4">
                          {comp.variant === 'circular' ? (
                            <M3CircularProgress
                              indeterminate={true}
                              variant={comp.sizePreset === 'large' || comp.sizePreset === 'xlarge' ? 'thick' : 'standard'}
                            />
                          ) : (
                            <M3LinearProgress
                              indeterminate={true}
                              variant={comp.sizePreset === 'large' || comp.sizePreset === 'xlarge' ? 'thick' : 'standard'}
                            />
                          )}
                        </div>
                      )}

                    </div>
                  </div>

                  {/* HIGH-ACCURACY DESIGNER RESIZE HANDLE ANCHORS */}
                  {isSelected && (
                    <>
                      {/* Eastern resize edge */}
                      <div 
                        className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-8 bg-neutral-900 border border-[#18A0FB] rounded-full cursor-e-resize shadow-md hover:bg-[#18A0FB] hover:scale-110 z-50 transition-all"
                        onMouseDown={(e) => handleResizeStart(e, comp.id, 'e')}
                      />
                      {/* Southern resize edge */}
                      <div 
                        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-2 bg-neutral-900 border border-[#18A0FB] rounded-full cursor-s-resize shadow-md hover:bg-[#18A0FB] hover:scale-110 z-50 transition-all"
                        onMouseDown={(e) => handleResizeStart(e, comp.id, 's')}
                      />
                      {/* South-East resize corner */}
                      <div 
                        className="absolute bottom-1 right-1 w-3 h-3 bg-neutral-900 border-2 border-[#18A0FB] rounded-sm cursor-se-resize shadow-lg hover:bg-[#18A0FB] hover:scale-125 z-50 transition-all"
                        onMouseDown={(e) => handleResizeStart(e, comp.id, 'se')}
                      />
                    </>
                  )}
                </div>
              );
            })}
              </div>
            )}
          </div>

          {/* GLOBAL CROP/MARQUEE OVERLAY */}
          {((isCropActive && isAreaSelectionMode) || recordingCountdown !== null || isRecording) && (
            <div 
              className={`absolute inset-0 z-40 overflow-hidden select-none ${
                (isRecording || recordingCountdown !== null) ? 'pointer-events-none' : 'bg-black/40 cursor-crosshair pointer-events-auto'
              }`}
              onMouseDown={(isRecording || recordingCountdown !== null) ? undefined : handleMarqueeStart}
              id="global-crop-marquee-sensor"
            >
              {/* Drag area crop display - border-none for seamless flow to edge */}
              <div 
                className="absolute border-none bg-transparent shadow-[0_0_0_9999px_rgba(0,0,0,0.55)] cursor-move"
                style={{
                  left: `${cropRect.x}px`,
                  top: `${cropRect.y}px`,
                  width: `${cropRect.width}px`,
                  height: `${cropRect.height}px`,
                }}
                onMouseDown={(isRecording || recordingCountdown !== null) ? undefined : (e) => handleCropResizeStart(e, 'move')}
              >
                {/* Only render HUD bounds and adjustment handles when NOT counting down or active recording */}
                {recordingCountdown === null && !isRecording && (
                  <>
                    {/* HUD pixels overlay */}
                    <div className="absolute -top-6 left-0 bg-[#18A0FB] text-white text-[10px] font-sans uppercase font-bold tracking-wide px-1.5 py-0.5 rounded shadow flex items-center gap-1 whitespace-nowrap flex-nowrap min-w-max">
                      <span>REC AREA:</span>
                      <strong>{cropRect.width} X {cropRect.height}</strong>
                      <span className="opacity-70 text-[8.5px] pl-0.5">Drag corners to resize</span>
                    </div>

                    {/* Drag resize elements */}
                    {/* nw corner */}
                    <div 
                      className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border border-[#18A0FB] rounded-sm cursor-nwse-resize hover:bg-[#18A0FB] z-50 animate-pulse"
                      onMouseDown={(e) => handleCropResizeStart(e, 'nw')}
                    />
                    {/* ne corner */}
                    <div 
                      className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border border-[#18A0FB] rounded-sm cursor-nesw-resize hover:bg-[#18A0FB] z-50 animate-pulse"
                      onMouseDown={(e) => handleCropResizeStart(e, 'ne')}
                    />
                    {/* se corner */}
                    <div 
                      className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border border-[#18A0FB] rounded-sm cursor-nwse-resize hover:bg-[#18A0FB] z-50 animate-pulse"
                      onMouseDown={(e) => handleCropResizeStart(e, 'se')}
                    />
                    {/* sw corner */}
                    <div 
                      className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border border-[#18A0FB] rounded-sm cursor-nesw-resize hover:bg-[#18A0FB] z-50 animate-pulse"
                      onMouseDown={(e) => handleCropResizeStart(e, 'sw')}
                    />
                    
                    {/* Edges */}
                    {/* north edge */}
                    <div 
                      className="absolute top-0 left-2 right-2 h-1 cursor-ns-resize z-50 hover:bg-[#18A0FB]/30 transition-all"
                      onMouseDown={(e) => handleCropResizeStart(e, 'n')}
                    />
                    {/* south edge */}
                    <div 
                      className="absolute bottom-0 left-2 right-2 h-1 cursor-ns-resize z-50 hover:bg-[#18A0FB]/30 transition-all"
                      onMouseDown={(e) => handleCropResizeStart(e, 's')}
                    />
                    {/* east edge */}
                    <div 
                      className="absolute right-0 top-2 bottom-2 w-1 cursor-ew-resize z-50 hover:bg-[#18A0FB]/30 transition-all"
                      onMouseDown={(e) => handleCropResizeStart(e, 'e')}
                    />
                    {/* west edge */}
                    <div 
                      className="absolute left-0 top-2 bottom-2 w-1 cursor-ew-resize z-50 hover:bg-[#18A0FB]/30 transition-all"
                      onMouseDown={(e) => handleCropResizeStart(e, 'w')}
                    />
                  </>
                )}
              </div>
            </div>
          )}

            {/* =========================================================================================
                FLOATING BOTTOM CONSOLE: MOTION TIMELINE CONTROLS AND EXPORTER PIPELINE
                ========================================================================================= */}
            <div className="absolute bottom-0 left-0 right-0 h-20 z-40 bg-[#222222] border-t border-[#1C1C1C] px-8 flex items-center justify-between w-full text-neutral-100 select-none pointer-events-auto shadow-2xl">
              <div className="flex items-end justify-between w-full max-w-[1400px] mx-auto gap-3 overflow-x-auto">

                {/* 1. Motion — Pause/Play */}
                <div className="flex flex-col justify-between h-12 items-start shrink-0">
                  <span className="text-[9.5px] font-sans uppercase text-neutral-450 font-bold tracking-wider leading-none">Motion</span>
                  <button
                    onClick={() => { setIsAnimationActive(!isAnimationActive); showToast(isAnimationActive ? "Motion paused." : "Motion resumed."); }}
                    className={`h-8 px-3 rounded-md text-[9.5px] font-sans font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer border select-none transition-all whitespace-nowrap ${isAnimationActive ? 'bg-rose-500/15 text-rose-400 border-rose-500/20 hover:bg-rose-500/25' : 'bg-[#18A0FB]/15 text-[#18A0FB] border-[#18A0FB]/20 hover:bg-[#18A0FB]/25'}`}
                  >
                    {isAnimationActive ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                    <span>{isAnimationActive ? 'Pause' : 'Play'}</span>
                  </button>
                </div>

                {/* 2. Speed slider */}
                <div className="flex flex-col justify-between h-12 items-start shrink-0 min-w-[100px] max-w-[160px] flex-1">
                  <div className="flex items-center justify-between w-full gap-1">
                    <span className="text-[9.5px] font-sans uppercase text-neutral-450 font-bold tracking-wider leading-none hidden lg:block">Speed</span>
                    <span className="font-mono text-[9.5px] font-bold text-[#18A0FB] leading-none">{intensity.toFixed(2)}×</span>
                  </div>
                  <div className="h-8 flex bg-[#1E1E1E] px-2 rounded-md border border-neutral-800 items-center w-full gap-2 select-none">
                    <input type="range" min="0.10" max="1.50" step="0.05" value={intensity}
                      onChange={(e) => setIntensity(Number(e.target.value))}
                      className="flex-1 h-1 bg-neutral-800 rounded cursor-pointer accent-[#18A0FB] min-w-0" />
                  </div>
                </div>

                {/* 3. Loop */}
                <div className={`flex flex-col justify-between h-12 items-start shrink-0 transition-all duration-300 ${exportFormat === 'png' ? 'opacity-0 pointer-events-none' : ''}`}>
                  <span className="text-[9.5px] font-sans uppercase text-neutral-450 font-bold tracking-wider leading-none select-none">Loop</span>
                  <div className="h-8 flex items-center">
                    <button onClick={() => { setPerfectLoop(!perfectLoop); }}
                      className="h-8 w-11 bg-[#1E1E1E] rounded-md flex items-center justify-center cursor-pointer select-none border border-neutral-800">
                      <div className={`w-7 h-4 rounded-full p-0.5 transition-colors ${perfectLoop ? 'bg-[#18A0FB]' : 'bg-neutral-700'}`}>
                        <div className={`w-3 h-3 bg-white rounded-full shadow-md transform transition-transform ${perfectLoop ? 'translate-x-3' : 'translate-x-0'}`} />
                      </div>
                    </button>
                  </div>
                </div>

                {/* 4. Pointer */}
                <div className={`flex flex-col justify-between h-12 items-start shrink-0 transition-all duration-300 ${exportFormat === 'png' ? 'opacity-0 pointer-events-none' : ''}`}>
                  <span className="text-[9.5px] font-sans uppercase text-neutral-450 font-bold tracking-wider leading-none">Pointer</span>
                  <div className="h-8 flex bg-[#1E1E1E] p-0.5 rounded-md border border-neutral-800 items-center gap-[2px]">
                    <button onClick={() => setRecordShowCursor(!recordShowCursor)}
                      className={`text-[9.5px] font-sans px-3 h-full flex items-center justify-center font-bold rounded-sm transition-all cursor-pointer border-none whitespace-nowrap ${recordShowCursor ? 'bg-[#18A0FB] text-white shadow' : 'text-neutral-400 hover:text-neutral-200'}`}>
                      Cursor
                    </button>
                    <button onClick={() => setRecordShowClicks(!recordShowClicks)}
                      className={`text-[9.5px] font-sans px-3 h-full flex items-center justify-center font-bold rounded-sm transition-all cursor-pointer border-none whitespace-nowrap ${recordShowClicks ? 'bg-[#18A0FB] text-white shadow' : 'text-neutral-400 hover:text-neutral-200'}`}>
                      Clicks
                    </button>
                  </div>
                </div>

                {/* 5. Format */}
                <div className="flex flex-col justify-between h-12 items-start shrink-0">
                  <span className="text-[9.5px] font-sans uppercase text-neutral-450 font-bold tracking-wider leading-none">Format</span>
                  <div className="h-8 flex bg-[#1E1E1E] p-0.5 rounded-md border border-neutral-800 items-center">
                    {(['mp4', 'png', 'gif'] as const).map((fmt) => (
                      <button key={fmt} onClick={() => { if (!isRecording) setExportFormat(fmt); }}
                        className={`text-[9.5px] font-sans px-3 h-full flex items-center justify-center font-bold rounded-sm transition-all cursor-pointer whitespace-nowrap ${exportFormat === fmt ? 'bg-[#18A0FB] text-white shadow' : 'text-neutral-400 hover:text-neutral-200'}`}
                        disabled={isRecording}>
                        {fmt.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 6. Duration slider */}
                <div className={`flex flex-col justify-between h-12 items-start shrink-0 min-w-[100px] max-w-[160px] flex-1 transition-all duration-300 ${exportFormat === 'png' ? 'opacity-0 pointer-events-none' : ''}`}>
                  <div className="flex items-center justify-between w-full gap-1">
                    <span className="text-[9.5px] font-sans uppercase text-neutral-450 font-bold tracking-wider leading-none hidden lg:block">Duration</span>
                    <span className="font-mono text-[9.5px] font-bold text-[#18A0FB] leading-none">{exportDuration}s</span>
                  </div>
                  <div className="h-8 flex bg-[#1E1E1E] px-2 rounded-md border border-neutral-800 items-center w-full gap-2 select-none">
                    <input type="range" min="1" max="20" step="1" value={exportDuration}
                      onChange={(e) => setExportDuration(Number(e.target.value))}
                      className="flex-1 h-1 bg-neutral-800 rounded cursor-pointer accent-[#18A0FB] min-w-0"
                      disabled={isRecording} />
                  </div>
                </div>

                {/* 7. Action bundle: Capture Spec & Recording active sub-controllers */}
                <div className="flex flex-col justify-between h-12 items-start shrink-0">
                  <span className="text-[9.5px] font-sans uppercase text-neutral-450 font-bold tracking-wider leading-none select-none">
                    {isRecording ? 'Rec Controls' : 'Record'}
                  </span>
                  {isRecording ? (
                    <div className="h-[28px] flex items-center gap-2">
                      {/* Pause/Resume Button */}
                      <button
                        onClick={isRecordingPaused ? handleResumeVideoRecording : handlePauseVideoRecording}
                        className={`h-[28px] px-3 rounded-md text-[9.5px] font-sans uppercase font-bold tracking-wider flex items-center gap-1.5 cursor-pointer border transition-all ${
                          isRecordingPaused 
                            ? 'bg-[#0ACF83]/15 text-[#0ACF83] border-[#0ACF83]/20 hover:bg-[#0ACF83]/25' 
                            : 'bg-rose-500/15 text-rose-550 border-rose-500/20 hover:bg-rose-500/25'
                        }`}
                        title={isRecordingPaused ? "Resume capture" : "Pause capture"}
                      >
                        {isRecordingPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
                        <span>{isRecordingPaused ? 'Resume' : 'Pause'}</span>
                      </button>
                      {/* Stop Recording Button */}
                      <button
                        onClick={handleStopVideoRecordingEarly}
                        className="h-[28px] px-3 rounded-md text-[9.5px] font-sans uppercase font-bold tracking-wider flex items-center gap-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700/60 cursor-pointer transition-all"
                        title="Stop capture and compile now"
                      >
                        <Square className="w-3 h-3 text-neutral-450" />
                        <span>Stop</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={handleDirectExport}
                      className={`h-[28px] w-24 px-4 rounded-md font-sans text-[9.5px] font-bold uppercase tracking-wider shrink-0 flex items-center justify-center gap-1.5 cursor-pointer transition-all select-none border ${
                        isAreaSelectionMode 
                          ? 'bg-[#18A0FB]/15 border-[#18A0FB]/35 text-[#18A0FB] animate-pulse' 
                          : 'bg-[#0ACF83]/15 hover:bg-[#0ACF83]/25 text-[#0ACF83] border-[#0ACF83]/20 shadow-xs'
                      }`}
                    >
                      <span>{isAreaSelectionMode ? 'Selecting' : 'Capture'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

          {/* STEP 1: Area Selection Mode Panel */}
          {isAreaSelectionMode && recordingCountdown === null && !isRecording && (
            <div className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-[#222222] border-none shadow-2xl p-1.5 px-2.5 rounded-lg flex items-center gap-1.5 z-[90] text-neutral-100 font-sans">
              <button
                onClick={() => {
                  setIsCropActive(false);
                  setIsAreaSelectionMode(false);
                }}
                className="h-[28px] px-3.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[9.5px] font-bold uppercase transition select-none cursor-pointer border border-neutral-750/70"
              >
                Cancel
              </button>
              <button
                onClick={startRecordingAfterCountdown}
                className="h-[28px] px-4 rounded bg-[#18A0FB] hover:bg-[#158CDD] text-white text-[9.5px] font-bold uppercase tracking-wide transition flex items-center justify-center select-none cursor-pointer border-none shadow-md shadow-[#18A0FB]/10 font-sans"
              >
                Confirm
              </button>
            </div>
          )}

          {/* STEP 2: Timer Countdown toast instead of full screen takeover */}
          {recordingCountdown !== null && (
            <div className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-[#2C2C2C] text-white border border-neutral-700/50 px-4 py-2.5 rounded-lg text-xs font-sans shadow-2xl flex items-center gap-3 z-50 whitespace-nowrap">
              <span className="w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center font-normal font-mono text-xs shrink-0 animate-pulse">{recordingCountdown}</span>
              <span className="font-semibold text-[11px] uppercase tracking-wide text-white animate-pulse">Recording</span>
            </div>
          )}

          {/* Active Toast notifications */}
          {toastMessage && (
            <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-[#222222] text-white border-none px-4 py-2.5 rounded-lg text-xs font-sans shadow-2xl flex items-center gap-2 animate-fade-in z-[100] whitespace-nowrap">
              <CheckCircle2 className="w-4 h-4 text-[#18A0FB] shrink-0" />
              <span className="font-medium tracking-wide">{toastMessage}</span>
            </div>
          )}

          {/* COMPILED FILE SAVE & DOWNLOAD OR TRY AGAIN MODAL */}
          {compiledFile && (
            <div className="absolute inset-0 z-[100] bg-black/60 flex items-center justify-center pointer-events-auto">
              <div className="bg-white border border-neutral-200/90 shadow-2xl p-7 rounded-xl flex flex-col max-w-sm w-full animate-fade-in text-neutral-800 font-sans text-center gap-5">
                <div className="flex flex-col items-center">
                  <span className="text-sm font-bold tracking-tight text-neutral-900 mt-1">Specimen Capture Complete!</span>
                  <p className="text-[10px] text-neutral-500 mt-1 font-sans leading-relaxed">
                    Your capture is ready in <strong>{compiledFile.extension}</strong> format.
                  </p>
                </div>
                
                {/* Embedded preview card */}
                <div className="bg-neutral-50 rounded-lg border border-neutral-200 p-3 h-36 flex flex-col items-center justify-center relative overflow-hidden">
                  {compiledFile.extension === 'GIF' ? (
                    <img referrerPolicy="no-referrer" src={compiledFile.url} className="max-h-full max-w-full rounded h-auto object-contain" />
                  ) : (
                    <div className="flex flex-col items-center gap-1">
                      <Play className="w-8 h-8 text-[#18A0FB] animate-pulse" />
                    </div>
                  )}
                </div>

                {/* Visual filename label strictly placed under the preview card container */}
                <div className="text-[10px] text-neutral-450 font-mono truncate max-w-[280px] mx-auto opacity-75" title={compiledFile.filename}>
                  {compiledFile.filename}
                </div>

                <div className="flex gap-2.5 w-full mt-1">
                  <button
                    onClick={() => {
                      if (compiledFile.url.startsWith('blob:')) {
                        URL.revokeObjectURL(compiledFile.url);
                      }
                      setCompiledFile(null);
                      showToast("Capture discarded. Ready to record again!");
                    }}
                    className="flex-1 h-[32px] rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold text-[9.5px] uppercase cursor-pointer select-none transition-all border-none font-sans"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = compiledFile.url;
                      link.download = compiledFile.filename;
                      link.click();
                      setCompiledFile(null);
                      showToast("Download started!");
                    }}
                    className="flex-1 h-[32px] rounded-lg bg-[#18A0FB] hover:bg-[#158CDD] text-white font-bold text-[9.5px] uppercase cursor-pointer select-none transition-all border-none shadow-md shadow-[#18A0FB]/10 font-sans"
                  >
                    Download
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Global Interaction Clicks Layer */}
          {recordShowClicks && (
            <div className="absolute inset-0 z-[35] pointer-events-none overflow-hidden select-none">
              {recordedClicks.map((click) => {
                const clickAge = Date.now() - click.timestamp;
                if (clickAge >= 1200) return null;
                return (
                  <div 
                    key={click.id}
                    className="absolute flex flex-col items-center justify-center -translate-x-1/2 -translate-y-1/2 select-none"
                    style={{
                      left: `${click.x}px`,
                      top: `${click.y}px`
                    }}
                  >
                    <div className="w-8 h-8 rounded-full border border-[#18A0FB]/40 bg-[#18A0FB]/5 click-ripple-animate flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-white shadow-md ring-1 ring-[#18A0FB]/35" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </main>

        {/* RIGHT PANEL: FIGMA UNIFIED PROPERTY INSPECTOR (Pure Figma Properties & Plugin controls) */}
        <aside className="w-[340px] bg-[#2C2C2C] border-l border-[#1A1A1A] flex flex-col h-full shrink-0 z-40 justify-between select-none font-sans" id="figma-right-inspector">

          {/* Scrollable inspector body */}
          <div className="flex-1 p-4 space-y-4 overflow-y-auto" id="inspector-body-content" style={{ maxHeight: 'calc(100vh - 40px)' }}>
            
            {!activeComp ? null : (
              <div className="flex flex-col gap-5">
                {/* 1. FIGMA COLOR LIBRARY SELECTOR (Defaults to Material Baseline) */}
                <div className="space-y-1.5 pb-2 border-b border-[#333333]">
                  <div className="flex justify-between items-center text-[10px] font-sans tracking-wider uppercase text-neutral-450 font-bold">
                    <span>Figma Color Library (Material)</span>
                  </div>
                  <div className="relative">
                    <select
                      value={activeComp.colorLibrary || globalColorLibrary}
                      onChange={(e) => {
                        updateActiveComponentField('colorLibrary', e.target.value);
                        showToast(`Figma theme updated to: ${(customLibraries[e.target.value] || M3_COLOR_LIBRARIES[e.target.value])?.name || e.target.value}`);
                      }}
                      className="w-full bg-[#1E1E1E] text-neutral-200 border border-neutral-700/30 rounded px-2.5 py-1.5 text-xs focus:border-[#18A0FB] focus:outline-none appearance-none cursor-pointer font-sans h-8"
                    >
                      {Object.entries({ ...M3_COLOR_LIBRARIES, ...customLibraries }).map(([key, lib]) => (
                        <option key={key} value={key}>{(lib as any).name}</option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-1 flex items-center px-1.5 text-neutral-400">
                      <ChevronDown className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  {/* Attach Custom Library Button & Form */}
                  <div className="pt-1.5">
                    <button
                      onClick={() => setShowAddLibraryForm(!showAddLibraryForm)}
                      className="text-[10px] text-[#18A0FB] hover:text-[#158CDD] font-bold font-sans uppercase flex items-center gap-1 cursor-pointer transition p-0 bg-transparent border-none"
                    >
                      {showAddLibraryForm ? '✕ Close Custom Creator' : '+ Attach Custom Library'}
                    </button>
                    
                    {showAddLibraryForm && (
                      <div className="mt-2.5 p-2 bg-[#1E1E1E] rounded border border-neutral-800 space-y-2.5 text-left text-xs text-neutral-300 animate-slide-down">
                        <div className="space-y-1">
                          <label className="text-[9px] text-neutral-450 uppercase font-sans font-bold block">Library Name</label>
                          <input
                            type="text"
                            value={newLibName}
                            onChange={(e) => setNewLibName(e.target.value)}
                            placeholder="e.g. My Retro Brand"
                            className="w-full bg-[#2C2C2C] border border-neutral-800 text-neutral-200 px-2 py-1 rounded text-xs focus:border-[#18A0FB] focus:outline-none"
                          />
                        </div>

                        {/* Choice tabs: Visual Pickers or JSON Paste */}
                        <div className="grid grid-cols-2 gap-1 bg-[#2C2C2C] p-0.5 rounded border border-neutral-800">
                          <button
                            onClick={() => setPastedJson('')}
                            className={`py-0.5 text-[9px] font-sans font-bold uppercase rounded text-center transition ${!pastedJson ? 'bg-[#1E1E1E] text-[#18A0FB]' : 'text-neutral-400 hover:text-neutral-200'}`}
                          >
                            Visual Picker
                          </button>
                          <button
                            onClick={() => setPastedJson('{\n  "name": "My Theme",\n  "colors": {\n    "light": {\n      "primary": { "bg": "#6750A4", "text": "#ffffff", "subtext": "#eaddff", "label": "Primary" },\n      "secondary": { "bg": "#e8def8", "text": "#1d192b", "subtext": "#49454f", "label": "Secondary" },\n      "surface": { "bg": "#fef7ff", "text": "#1d1b20", "subtext": "#49454f", "label": "Surface" }\n    },\n    "dark": {\n      "primary": { "bg": "#d0bcff", "text": "#381e72", "subtext": "#381e72", "label": "Primary Dark" },\n      "secondary": { "bg": "#332d41", "text": "#e8def8", "subtext": "#ccc2dc", "label": "Secondary Dark" },\n      "surface": { "bg": "#141218", "text": "#e6e1e5", "subtext": "#938f99", "label": "Surface Dark" }\n    }\n  }\n}')}
                            className={`py-0.5 text-[9px] font-sans font-bold uppercase rounded text-center transition ${pastedJson ? 'bg-[#1E1E1E] text-[#18A0FB]' : 'text-neutral-400 hover:text-neutral-200'}`}
                          >
                            Paste JSON
                          </button>
                        </div>

                        {!pastedJson ? (
                          <div className="space-y-2">
                            {/* Light Mode Settings */}
                            <div className="p-1 px-1.5 bg-[#2C2C2C] rounded border border-neutral-800/60 font-sans">
                              <span className="text-[8.5px] uppercase font-bold text-[#18A0FB] block mb-1">Light Theme Swatches</span>
                              <div className="grid grid-cols-3 gap-1.5">
                                <div className="space-y-0.5">
                                  <label className="text-[8px] text-neutral-450 block">Primary</label>
                                  <div className="flex items-center gap-1 bg-[#1E1E1E] p-0.5 rounded leading-none">
                                    <input type="color" value={newLibPrimaryLight} onChange={(e) => setNewLibPrimaryLight(e.target.value)} className="w-3.5 h-3.5 border-none p-0 bg-transparent cursor-pointer rounded-sm" />
                                    <span className="text-[8px] font-mono uppercase">{newLibPrimaryLight}</span>
                                  </div>
                                </div>
                                <div className="space-y-0.5">
                                  <label className="text-[8px] text-neutral-450 block">Secondary</label>
                                  <div className="flex items-center gap-1 bg-[#1E1E1E] p-0.5 rounded leading-none">
                                    <input type="color" value={newLibSecondaryLight} onChange={(e) => setNewLibSecondaryLight(e.target.value)} className="w-3.5 h-3.5 border-none p-0 bg-transparent cursor-pointer rounded-sm" />
                                    <span className="text-[8px] font-mono uppercase">{newLibSecondaryLight}</span>
                                  </div>
                                </div>
                                <div className="space-y-0.5">
                                  <label className="text-[8px] text-neutral-450 block">Surface</label>
                                  <div className="flex items-center gap-1 bg-[#1E1E1E] p-0.5 rounded leading-none">
                                    <input type="color" value={newLibSurfaceLight} onChange={(e) => setNewLibSurfaceLight(e.target.value)} className="w-3.5 h-3.5 border-none p-0 bg-transparent cursor-pointer rounded-sm" />
                                    <span className="text-[8px] font-mono uppercase">{newLibSurfaceLight}</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Dark Mode Settings */}
                            <div className="p-1 px-1.5 bg-[#2C2C2C] rounded border border-neutral-800/60 font-sans">
                              <span className="text-[8.5px] uppercase font-bold text-amber-500 block mb-1 font-sans">Dark Theme Swatches</span>
                              <div className="grid grid-cols-3 gap-1.5 font-sans">
                                <div className="space-y-0.5">
                                  <label className="text-[8px] text-neutral-450 block">Primary</label>
                                  <div className="flex items-center gap-1 bg-[#1E1E1E] p-0.5 rounded leading-none">
                                    <input type="color" value={newLibPrimaryDark} onChange={(e) => setNewLibPrimaryDark(e.target.value)} className="w-3.5 h-3.5 border-none p-0 bg-transparent cursor-pointer rounded-sm" />
                                    <span className="text-[8px] font-mono uppercase">{newLibPrimaryDark}</span>
                                  </div>
                                </div>
                                <div className="space-y-0.5">
                                  <label className="text-[8px] text-neutral-450 block">Secondary</label>
                                  <div className="flex items-center gap-1 bg-[#1E1E1E] p-0.5 rounded leading-none">
                                    <input type="color" value={newLibSecondaryDark} onChange={(e) => setNewLibSecondaryDark(e.target.value)} className="w-3.5 h-3.5 border-none p-0 bg-transparent cursor-pointer rounded-sm" />
                                    <span className="text-[8px] font-mono uppercase">{newLibSecondaryDark}</span>
                                  </div>
                                </div>
                                <div className="space-y-0.5">
                                  <label className="text-[8px] text-neutral-450 block">Surface</label>
                                  <div className="flex items-center gap-1 bg-[#1E1E1E] p-0.5 rounded leading-none">
                                    <input type="color" value={newLibSurfaceDark} onChange={(e) => setNewLibSurfaceDark(e.target.value)} className="w-3.5 h-3.5 border-none p-0 bg-transparent cursor-pointer rounded-sm" />
                                    <span className="text-[8px] font-mono uppercase">{newLibSurfaceDark}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <label className="text-[8px] text-neutral-450 uppercase font-sans font-bold block">JSON Code</label>
                            <textarea
                              rows={5}
                              value={pastedJson}
                              onChange={(e) => setPastedJson(e.target.value)}
                              className="w-full bg-[#2C2C2C] border border-neutral-800 text-neutral-200 px-2 py-1.5 rounded text-[10px] font-mono focus:border-[#18A0FB] focus:outline-none resize-y"
                            />
                          </div>
                        )}

                        <button
                          onClick={handleAddCustomLibrary}
                          className="w-full h-7 bg-[#18A0FB] hover:bg-[#158CDD] text-white text-[9.5px] font-bold uppercase rounded border-none cursor-pointer transition flex items-center justify-center shadow-sm font-sans"
                        >
                          Attach Colors
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* 3. WAVE PRESETS SECTOR */}
                <div className="space-y-1.5 pt-2 border-t border-[#333333]">
                  <div className="text-[10px] font-sans tracking-wider uppercase text-neutral-450 font-bold block">
                    STATES
                  </div>

                  <div className="grid grid-cols-2 gap-1.5" id="figma-state-triggers">
                    {OFFICIAL_STATES.map((state) => {
                      const compState = (selectedComponentId && activeComp)
                        ? (activeComp.activeState !== undefined ? activeComp.activeState : 0)
                        : activeState;
                      const isSelected = compState === state.id;
                      const IconComponent = state.icon;

                      return (
                        <button
                          key={state.id}
                          onClick={() => handleStateClick(state.id)}
                          className={`px-2.5 py-1.5 rounded-lg border text-left transition-all relative flex flex-col justify-between cursor-pointer ${
                            isSelected
                              ? 'bg-[#18A0FB]/10 border-[#18A0FB] text-white shadow-xs'
                              : 'bg-[#1E1E1E] border-neutral-800 hover:bg-[#252528] text-neutral-400 hover:text-neutral-200'
                          }`}
                        >
                          <div className="flex items-center gap-1.5">
                            <IconComponent className={`w-3.5 h-3.5 ${isSelected ? 'text-[#18A0FB]' : 'text-neutral-500'}`} />
                            <span className="text-[9.5px] font-sans font-bold truncate block uppercase">{state.label}</span>
                          </div>
                          <span className="text-[7.5px] text-neutral-300 font-semibold font-sans mt-1 block select-none uppercase tracking-wide">
                            {state.badgeText}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 5. FIGMA TRANSFORMER DIMENSIONAL MATRIX */}
                <div className="space-y-2 pt-2 border-t border-[#333333]">
                  <span className="text-[10.5px] font-sans tracking-wider uppercase text-neutral-300 font-bold block">
                    Figma Selection Properties
                  </span>

                  <div className="bg-[#1E1E1E] p-3 rounded-lg border border-neutral-800 space-y-3">
                    
                    {/* Size Preset Toggles with Automatic M3 Typography Spec Sync */}
                    {activeComp.type !== 'card' && activeComp.type !== 'chip' && activeComp.type !== 'fab' && activeComp.type !== 'avatar' && (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-[9.5px] font-sans">
                          <span className="text-neutral-450 font-sans font-bold uppercase tracking-wide">Size Class</span>
                          <span className="text-[#18A0FB] font-bold font-sans uppercase text-[9.5px]">{activeComp.sizePreset || 'medium'}</span>
                        </div>
                        <div className="grid grid-cols-5 gap-1 p-0.5 bg-[#141414] rounded border border-neutral-800/60" id="m3-size-presets-row">
                          {[
                            { key: 'xsmall', label: 'XS' },
                            { key: 'small', label: 'S' },
                            { key: 'medium', label: 'M' },
                            { key: 'large', label: 'L' },
                            { key: 'xlarge', label: 'XL' }
                          ].map((sizeOpt) => {
                            const isCurrent = (activeComp.sizePreset || 'medium') === sizeOpt.key;
                            return (
                              <button
                                key={sizeOpt.key}
                                onClick={() => {
                                  const preset = sizeOpt.key as any;
                                  const defaultMetrics = M3_SIZE_PRESETS[activeComp.type]?.[preset];
                                  
                                  // Auto-calibrate typography based on component type and size preset specification
                                  let titleStyle = activeComp.fontStyleTitle || 'titleLarge';
                                  let textStyle = activeComp.fontStyleText || 'bodyMedium';
                                  
                                  if (activeComp.type === 'button') {
                                    if (preset === 'xsmall') textStyle = 'subtextMicro';
                                    else if (preset === 'small') textStyle = 'labelMedium';
                                    else if (preset === 'medium') textStyle = 'labelLarge';
                                    else if (preset === 'large') textStyle = 'labelLarge';
                                    else if (preset === 'xlarge') textStyle = 'bodyLarge';
                                  } else if (activeComp.type === 'chip') {
                                    if (preset === 'xsmall') textStyle = 'subtextMicro';
                                    else if (preset === 'small') textStyle = 'labelMedium';
                                    else if (preset === 'medium') textStyle = 'labelLarge';
                                    else if (preset === 'large') textStyle = 'bodyLarge';
                                    else if (preset === 'xlarge') textStyle = 'titleSmall';
                                  } else if (activeComp.type === 'badge') {
                                    if (preset === 'xsmall') textStyle = 'subtextMicro';
                                    else if (preset === 'small') textStyle = 'subtextMicro';
                                    else if (preset === 'medium') textStyle = 'labelMedium';
                                    else if (preset === 'large') textStyle = 'labelLarge';
                                    else if (preset === 'xlarge') textStyle = 'bodyMedium';
                                  } else if (activeComp.type === 'card' || activeComp.type === 'dialog') {
                                    if (preset === 'xsmall') { titleStyle = 'titleSmall'; textStyle = 'subtextMicro'; }
                                    else if (preset === 'small') { titleStyle = 'titleSmall'; textStyle = 'bodyMedium'; }
                                    else if (preset === 'medium') { titleStyle = 'titleLarge'; textStyle = 'bodyMedium'; }
                                    else if (preset === 'large') { titleStyle = 'headlineMedium'; textStyle = 'bodyLarge'; }
                                    else if (preset === 'xlarge') { titleStyle = 'displayLarge'; textStyle = 'bodyLarge'; }
                                  } else if (activeComp.type === 'fab') {
                                    if (preset === 'xsmall' || preset === 'small') textStyle = 'labelMedium';
                                    else if (preset === 'medium') textStyle = 'labelLarge';
                                    else if (preset === 'large' || preset === 'xlarge') textStyle = 'titleSmall';
                                  }
                                  
                                  updateActiveComponentField('sizePreset', preset);
                                  updateActiveComponentField('fontStyleTitle', titleStyle);
                                  updateActiveComponentField('fontStyleText', textStyle);
                                  
                                  if (defaultMetrics) {
                                    // Update raw width and height as standard fallbacks if switched off auto responsive mode
                                    updateActiveComponentField('width', defaultMetrics.width);
                                    updateActiveComponentField('height', defaultMetrics.height);
                                    updateActiveComponentField('borderRadius', defaultMetrics.borderRadius);
                                  }
                                  showToast(`Applied ${sizeOpt.label} Spec Sizing & Font Synced!`);
                                }}
                                className={`text-[8.5px] font-sans py-1 rounded transition-all cursor-pointer font-bold ${
                                  isCurrent 
                                    ? 'bg-[#18A0FB]/15 text-[#18A0FB] shadow-sm' 
                                    : 'text-neutral-400 hover:text-neutral-200 bg-transparent hover:bg-neutral-800/40'
                                }`}
                                title={`Switch to M3 Size Preset: ${sizeOpt.label}`}
                              >
                                {sizeOpt.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* M3 Style Variant Dropdown */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[9.5px] font-sans">
                        <span className="text-neutral-450 font-sans font-bold uppercase tracking-wide">Variant Style</span>
                        <span className="text-[#18A0FB] font-bold font-sans uppercase text-[9.5px]">{activeComp.variant || 'filled'}</span>
                      </div>
                      <div className="relative">
                        <select
                          value={activeComp.variant || 'filled'}
                          onChange={(e) => {
                            const variantVal = e.target.value;
                            updateActiveComponentField('variant', variantVal);
                            
                            // Let's also adjust height/width slightly for standard mini dot badge
                            if (activeComp.type === 'badge' && variantVal === 'dot') {
                              updateActiveComponentField('width', 10);
                              updateActiveComponentField('height', 10);
                              updateActiveComponentField('borderRadius', 9999);
                              showToast("Set Badge variant to NOTIFICATION MINI DOT (Auto-sized to 10x10 Circle)");
                            } else if (activeComp.type === 'badge' && activeComp.variant === 'dot' && variantVal === 'standard') {
                              updateActiveComponentField('width', 48);
                              updateActiveComponentField('height', 20);
                              updateActiveComponentField('borderRadius', 10);
                              showToast("Restored Standard Pill Badge dimensions");
                            } else {
                              showToast(`Updated style variant to M3 ${variantVal.toUpperCase()}`);
                            }
                          }}
                          className="w-full bg-[#2C2C2C] text-neutral-200 border border-neutral-700/30 rounded px-1.5 py-1 text-[10.5px] focus:border-[#18A0FB] focus:outline-none appearance-none cursor-pointer font-sans capitalize"
                        >
                          {activeComp.type === 'button' && (
                            <>
                              <option value="filled">Filled (High Emphasis)</option>
                              <option value="tonal">Filled Tonal (Medium Emphasis)</option>
                              <option value="elevated">Elevated (Surface Shadow)</option>
                              <option value="outlined">Outlined (Transparent Glass)</option>
                              <option value="text">Text Button (Flat Minimal)</option>
                            </>
                          )}
                          {activeComp.type === 'card' && (
                            <>
                              <option value="elevated">Elevated (Material Shadow)</option>
                              <option value="filled">Filled Flat (Secondary Base)</option>
                              <option value="outlined">Outlined (Clean Thin Edge)</option>
                            </>
                          )}
                          {activeComp.type === 'chip' && (
                            <>
                              <option value="assist">Assist (Outlined Action)</option>
                              <option value="filled">Filled (Tonal Base Shape)</option>
                              <option value="elevated">Elevated (Subtle Shadowed)</option>
                            </>
                          )}
                          {activeComp.type === 'fab' && (
                            <>
                              <option value="primary">Primary FAB (Accent filled)</option>
                              <option value="secondary">Secondary FAB (Tonal filled)</option>
                              <option value="surface">Surface FAB (Elevated Neutral)</option>
                              <option value="tertiary">Tertiary FAB (Tonal Tertiary)</option>
                            </>
                          )}
                          {activeComp.type === 'dialog' && (
                            <>
                              <option value="standard">Basic Dialog (Standard Layout)</option>
                              <option value="icon">Icon Dialog (Centered Hero Header)</option>
                              <option value="scrollable">Scrollable Account Selection Dialog</option>
                              <option value="alert">Alert Dialog (Warning Accented)</option>
                            </>
                          )}
                          {activeComp.type === 'badge' && (
                            <>
                              <option value="standard">Standard Pill Count</option>
                              <option value="dot">Notification Mini Dot (10x10 circle)</option>
                            </>
                          )}
                          {activeComp.type === 'sheets' && (
                            <>
                              <option value="side">Standard Side Sheet</option>
                              <option value="bottom">Modal Bottom Sheet</option>
                            </>
                          )}
                          {activeComp.type === 'avatar' && (
                            <>
                              <option value="initials">Title Initials (Text)</option>
                              <option value="image">Static Avatar (Photo Image)</option>
                            </>
                          )}
                          {activeComp.type === 'progress' && (
                            <>
                              <option value="linear">Linear Progress Bar</option>
                              <option value="circular">Circular Spinner</option>
                            </>
                          )}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-1 flex items-center px-1.5 text-neutral-400">
                          <ChevronDown className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </div>


                    {/* Dimensions Width, Height and Radius sliders */}
                    <div className="space-y-2 font-sans text-[10px]">
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-[9.5px] font-sans uppercase text-neutral-450 font-bold tracking-wide">W (Width)</span>
                          <span className="text-[#18A0FB] font-bold font-mono text-[10px]">{activeComp.width}px</span>
                        </div>
                        <input 
                          type="range"
                          min="80"
                          max="480"
                          step="1"
                          value={activeComp.width}
                          onChange={(e) => updateActiveComponentField('width', Number(e.target.value))}
                          className="w-full h-1 bg-neutral-800 rounded cursor-pointer accent-[#18A0FB]"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-[9.5px] font-sans uppercase text-neutral-450 font-bold tracking-wide">H (Height)</span>
                          <span className="text-[#18A0FB] font-bold font-mono text-[10px]">{activeComp.height}px</span>
                        </div>
                        <input 
                          type="range"
                          min="30"
                          max="420"
                          step="1"
                          value={activeComp.height}
                          onChange={(e) => updateActiveComponentField('height', Number(e.target.value))}
                          className="w-full h-1 bg-neutral-800 rounded cursor-pointer accent-[#18A0FB]"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[9.5px] font-sans uppercase text-neutral-450 font-bold tracking-wide">R (Corner Radius)</span>
                          <span className="text-[#18A0FB] font-bold font-mono text-[10px]">{activeComp.borderRadius === 9999 ? 'Pill' : `${activeComp.borderRadius}px`}</span>
                        </div>
                        {(() => {
                          const snapRadii = [0, 4, 8, 12, 16, 28, 9999];
                          const closestIndex = snapRadii.reduce((closest, current, idx) => {
                            const currentDiff = Math.abs(current - activeComp.borderRadius);
                            const closestDiff = Math.abs(snapRadii[closest] - activeComp.borderRadius);
                            return currentDiff < closestDiff ? idx : closest;
                          }, 0);

                          return (
                            <input 
                              type="range"
                              min="0"
                              max="6"
                              step="1"
                              value={closestIndex}
                              onChange={(e) => {
                                const idx = Number(e.target.value);
                                const val = snapRadii[idx];
                                updateActiveComponentField('borderRadius', val);
                                showToast(`Switched step to M3 Radius: ${val === 9999 ? 'Pill' : val + 'px'}`);
                              }}
                              className="w-full h-1 bg-neutral-800 rounded cursor-pointer accent-[#18A0FB]"
                            />
                          );
                        })()}
                        <div className="flex justify-between gap-1 pt-0.5" id="m3-shape-tokens-snaps">
                          {[
                            { name: 'None', val: 0, label: '0' },
                            { name: 'XS', val: 4, label: '4' },
                            { name: 'S', val: 8, label: '8' },
                            { name: 'M', val: 12, label: '12' },
                            { name: 'L', val: 16, label: '16' },
                            { name: 'XL', val: 28, label: '28' },
                            { name: 'Pill', val: 9999, label: 'Pill' },
                          ].map((shape) => {
                            const isCurrent = activeComp.borderRadius === shape.val;
                            return (
                              <button
                                key={shape.name}
                                onClick={() => {
                                  updateActiveComponentField('borderRadius', shape.val);
                                  showToast(`Snapped to M3 ${shape.name} Shape Class (${shape.val === 9999 ? 'Pill' : shape.val + 'px'})`);
                                }}
                                className={`text-[8px] font-sans px-1.5 py-0.5 rounded border border-transparent transition-all cursor-pointer font-bold ${
                                  isCurrent 
                                    ? 'bg-[#18A0FB]/15 text-[#18A0FB]' 
                                    : 'bg-[#1E1E1E] text-neutral-450 hover:text-neutral-350'
                                }`}
                                title={`M3 ${shape.name} shape`}
                              >
                                {shape.name}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-neutral-800/60 pt-2 flex justify-center">
                      <button 
                        onClick={handleResetAlignment}
                        className="hover:text-white flex items-center justify-center gap-1 text-[9px] uppercase font-bold text-neutral-400 hover:bg-neutral-800 px-3 py-1 rounded transition-colors cursor-pointer w-full text-center"
                        title="Recenter frame"
                      >
                        <RotateCcw className="w-2.5 h-2.5" />
                        <span>Recenter Element (Align Center)</span>
                      </button>
                    </div>

                  </div>
                </div>

                {/* 4. COMPONENT CONTENT EDITORS */}
                <div className="space-y-2 pt-2 border-t border-[#333333]">
                  <div className="flex justify-between items-center text-[10px] font-sans tracking-wider uppercase text-neutral-450 font-bold">
                    <span>Content Editor</span>
                  </div>
                  <div className="bg-[#1E1E1E] p-3 rounded-lg border border-neutral-800 space-y-3">
                    {/* Component Specimen Layer Name Field */}
                    <div className="space-y-1">
                      <span className="text-[9.5px] font-sans uppercase text-neutral-450 font-bold tracking-wide block">Layer</span>
                      <input
                        type="text"
                        value={activeComp.name}
                        onChange={(e) => updateActiveComponentField('name', e.target.value)}
                        className="w-full bg-[#2C2C2C] text-neutral-205 border border-neutral-700/30 rounded px-2.5 py-1 text-xs focus:border-[#18A0FB] focus:outline-none font-sans"
                        placeholder="e.g. Primary Fab Layer"
                      />
                    </div>

                    {/* Visual Icon Custom Dropdown Select */}
                    <div className="space-y-1">
                      <span className="text-[9.5px] font-sans uppercase text-neutral-450 font-bold tracking-wide block">icon</span>
                      <div className="relative">
                        <select
                          value={activeComp.activeIcon || 'volume_up'}
                          onChange={(e) => {
                            updateActiveComponentField('activeIcon', e.target.value);
                            showToast(`Updated element vector icon to "${e.target.value}"`);
                          }}
                          className="w-full bg-[#2C2C2C] text-neutral-200 border border-neutral-700/30 rounded px-2.5 py-1.5 text-xs focus:border-[#18A0FB] focus:outline-none appearance-none cursor-pointer font-sans"
                        >
                          <option value="sparkle">Sparkles (sparkle)</option>
                          <option value="favorite">Favorite (favorite)</option>
                          <option value="settings">Settings (settings)</option>
                          <option value="info">Info (info)</option>
                          <option value="shopping_cart">Shopping Cart (shopping_cart)</option>
                          <option value="search">Search (search)</option>
                          <option value="person">Person (person)</option>
                          <option value="home">Home (home)</option>
                          <option value="notifications">Notifications (notifications)</option>
                          <option value="star">Star (star)</option>
                          <option value="share">Share (share)</option>
                          <option value="play_arrow">Play Arrow (play_arrow)</option>
                          <option value="volume_up">Volume Up (volume_up)</option>
                          <option value="mic">Voice Mic (mic)</option>
                          <option value="fingerprint">Fingerprint (fingerprint)</option>
                          <option value="lightbulb">Lightbulb (lightbulb)</option>
                          <option value="extension">Extension (extension)</option>
                          <option value="bolt">Bolt (bolt)</option>
                          <option value="warning">Warning (warning)</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-1 flex items-center px-1.5 text-neutral-400">
                          <ChevronDown className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </div>

                    {/* Main text component label */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-[9.5px] font-sans uppercase text-neutral-450 font-bold tracking-wide block font-semibold">Body</span>
                        <div className="flex items-center gap-1">
                          <span className="text-[8px] text-neutral-500 font-mono">Format:</span>
                          <span className="relative inline-block">
                            <select
                              value={activeComp.fontStyleText || 'bodyMedium'}
                              onChange={(e) => {
                                updateActiveComponentField('fontStyleText', e.target.value);
                                showToast(`Text format updated to: ${e.target.value}`);
                              }}
                              className="bg-[#1E1E1E] text-neutral-305 border border-neutral-700/30 rounded px-1.5 py-0.5 text-[9px] focus:border-[#18A0FB] focus:outline-none cursor-pointer outline-none font-semibold leading-none appearance-none pr-3"
                            >
                              {Object.entries(M3_FONT_STYLES).map(([key, item]) => (
                                <option key={key} value={key}>{item.name.replace(/\s*\(.*\)/, '')}</option>
                              ))}
                            </select>
                            <span className="absolute right-0.5 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-500 text-[6px]">▼</span>
                          </span>
                        </div>
                      </div>
                      <input
                        type="text"
                        value={activeComp.text}
                        onChange={(e) => updateActiveComponentField('text', e.target.value)}
                        className="w-full bg-[#2C2C2C] text-neutral-200 border border-neutral-700/30 rounded px-2.5 py-1 text-xs focus:border-[#18A0FB] focus:outline-none"
                        placeholder="Main text..."
                      />
                    </div>

                    {/* Optional heading / subheading inputs, shown only if switches allow them */}
                    {(activeComp.type === 'card' || activeComp.type === 'dialog') && (
                      <>
                        {activeComp.configShowTitle && (
                          <div className="space-y-1">
                            <div className="flex justify-between items-center">
                              <span className="text-[9.5px] font-sans uppercase text-neutral-450 font-bold tracking-wide block">title</span>
                              <div className="flex items-center gap-1">
                                <span className="text-[8px] text-neutral-500 font-mono">Format:</span>
                                <span className="relative inline-block">
                                  <select
                                    value={activeComp.fontStyleTitle || 'titleLarge'}
                                    onChange={(e) => {
                                      updateActiveComponentField('fontStyleTitle', e.target.value);
                                      showToast(`Title format updated to: ${e.target.value}`);
                                    }}
                                    className="bg-[#1E1E1E] text-neutral-300 border border-neutral-700/30 rounded px-1.5 py-0.5 text-[9px] focus:border-[#18A0FB] focus:outline-none cursor-pointer outline-none font-semibold leading-none appearance-none pr-3"
                                  >
                                    {Object.entries(M3_FONT_STYLES).map(([key, item]) => (
                                      <option key={key} value={key}>{item.name.replace(/\s*\(.*\)/, '')}</option>
                                    ))}
                                  </select>
                                  <span className="absolute right-0.5 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-500 text-[6px]">▼</span>
                                </span>
                              </div>
                            </div>
                            <input
                              type="text"
                              value={activeComp.title}
                              onChange={(e) => updateActiveComponentField('title', e.target.value)}
                              className="w-full bg-[#2C2C2C] text-neutral-200 border border-neutral-700/30 rounded px-2.5 py-1 text-xs focus:border-[#18A0FB] focus:outline-none"
                              placeholder="Title text..."
                            />
                          </div>
                        )}
                        {activeComp.configShowSubtitle && activeComp.type === 'card' && (
                          <div className="space-y-1">
                            <span className="text-[9.5px] font-sans uppercase text-neutral-450 font-bold tracking-wide block">subtitle</span>
                            <input
                              type="text"
                              value={activeComp.subtitle}
                              onChange={(e) => updateActiveComponentField('subtitle', e.target.value)}
                              className="w-full bg-[#2C2C2C] text-neutral-200 border border-neutral-700/30 rounded px-2.5 py-1 text-xs focus:border-[#18A0FB] focus:outline-none"
                              placeholder="Subtitle text..."
                            />
                          </div>
                        )}
                      </>
                    )}

                    {/* Component Layout Feature Switches block */}
                    <div className="space-y-1.5 pt-2 border-t border-neutral-800/80">
                      <span className="text-[9.5px] font-sans uppercase text-neutral-450 font-bold tracking-wide block">
                        Component Layout Toggles
                      </span>
                      <div className="space-y-1.5">
                        {/* Toggle Icon */}
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-neutral-400 font-sans">Leading icon</span>
                          <button
                            onClick={() => {
                              const nextVal = !activeComp.configShowIcon;
                              updateActiveComponentField('configShowIcon', nextVal);
                              showToast(`${nextVal ? 'Enabled' : 'Disabled'} specimen vector icon.`);
                            }}
                            className={`relative inline-flex h-4 w-7.5 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                              activeComp.configShowIcon ? 'bg-[#18A0FB]' : 'bg-[#1A1A1A]'
                            }`}
                          >
                            <span className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out mt-[1.5px] ${
                              activeComp.configShowIcon ? 'translate-x-[15px]' : 'translate-x-0.5'
                            }`} />
                          </button>
                        </div>

                        {/* Toggle Title */}
                        {(activeComp.type === 'card' || activeComp.type === 'dialog') && (
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-neutral-400 font-sans">Title</span>
                            <button
                              onClick={() => {
                                const nextVal = !activeComp.configShowTitle;
                                updateActiveComponentField('configShowTitle', nextVal);
                                showToast(`${nextVal ? 'Enabled' : 'Disabled'} specimen title field.`);
                              }}
                              className={`relative inline-flex h-4 w-7.5 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                activeComp.configShowTitle ? 'bg-[#18A0FB]' : 'bg-[#1A1A1A]'
                              }`}
                            >
                              <span className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out mt-[1.5px] ${
                                activeComp.configShowTitle ? 'translate-x-[15px]' : 'translate-x-[0.5px]'
                              }`} />
                            </button>
                          </div>
                        )}

                        {/* Toggle Subtitle */}
                        {activeComp.type === 'card' && (
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-neutral-400 font-sans">Subtitle</span>
                            <button
                              onClick={() => {
                                const nextVal = !activeComp.configShowSubtitle;
                                updateActiveComponentField('configShowSubtitle', nextVal);
                                showToast(`${nextVal ? 'Enabled' : 'Disabled'} specimen subtitle field.`);
                              }}
                              className={`relative inline-flex h-4 w-7.5 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                activeComp.configShowSubtitle ? 'bg-[#18A0FB]' : 'bg-[#1A1A1A]'
                              }`}
                            >
                              <span className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out mt-[1.5px] ${
                                activeComp.configShowSubtitle ? 'translate-x-[15px]' : 'translate-x-0.5'
                              }`} />
                            </button>
                          </div>
                        )}

                        {/* Toggle Description */}
                        {(activeComp.type === 'card' || activeComp.type === 'dialog') && (
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-neutral-400 font-sans">Body</span>
                            <button
                              onClick={() => {
                                const nextVal = !activeComp.configShowDescription;
                                updateActiveComponentField('configShowDescription', nextVal);
                                showToast(`${nextVal ? 'Enabled' : 'Disabled'} description textarea.`);
                              }}
                              className={`relative inline-flex h-4 w-7.5 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                activeComp.configShowDescription ? 'bg-[#18A0FB]' : 'bg-[#1A1A1A]'
                              }`}
                            >
                              <span className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out mt-[1.5px] ${
                                activeComp.configShowDescription ? 'translate-x-[15px]' : 'translate-x-[0.5px]'
                              }`} />
                            </button>
                          </div>
                        )}

                        {/* Toggle Action Buttons */}
                        {(activeComp.type === 'card' || activeComp.type === 'dialog') && (
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-neutral-400 font-sans">Action Buttons</span>
                            <button
                              onClick={() => {
                                const nextVal = !activeComp.configShowActions;
                                updateActiveComponentField('configShowActions', nextVal);
                                showToast(`${nextVal ? 'Enabled' : 'Disabled'} card action buttons footer.`);
                              }}
                              className={`relative inline-flex h-4 w-7.5 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                activeComp.configShowActions ? 'bg-[#18A0FB]' : 'bg-[#1A1A1A]'
                              }`}
                            >
                              <span className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out mt-[1.5px] ${
                                activeComp.configShowActions ? 'translate-x-[15px]' : 'translate-x-0.5'
                              }`} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* INTERACTIVE SPEC SIZING MODE (AUTO CONTENT vs FIXED DIMENSIONAL) */}
                    {(activeComp.type === 'button' || activeComp.type === 'chip' || activeComp.type === 'badge') && (
                      <div className="space-y-1.5 pt-2.5 border-t border-neutral-800/80">
                        <div className="flex justify-between items-center text-[9.5px] font-sans uppercase text-neutral-450 font-bold tracking-wide">
                          <span>Sizing Spec Mode</span>
                          <span className="text-[#18A0FB] capitalize text-[9px]">{activeComp.sizeMode || 'fixed'}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-1 bg-[#1A1A1A] p-0.5 rounded border border-neutral-800/40">
                          <button
                            onClick={() => {
                              updateActiveComponentField('sizeMode', 'fixed');
                              showToast("Set specimen width option to FIXED manual mode");
                            }}
                            className={`py-1 text-[8.5px] font-bold rounded cursor-pointer uppercase ${
                              (activeComp.sizeMode !== 'auto') 
                                ? 'bg-[#18A0FB]/15 text-[#18A0FB]' 
                                : 'text-neutral-400 hover:text-neutral-200 bg-transparent'
                            }`}
                          >
                            Fixed Width
                          </button>
                          <button
                            onClick={() => {
                              updateActiveComponentField('sizeMode', 'auto');
                              showToast("Set specimen width option to AUTO responsive mode (M3 Spec)");
                            }}
                            className={`py-1 text-[8.5px] font-bold rounded cursor-pointer uppercase ${
                              (activeComp.sizeMode === 'auto')
                                ? 'bg-[#18A0FB]/15 text-[#18A0FB]' 
                                : 'text-neutral-400 hover:text-neutral-200 bg-transparent'
                            }`}
                          >
                            Responsive (Auto)
                          </button>
                        </div>
                      </div>
                    )}

                    {(activeComp.type === 'card' || activeComp.type === 'dialog') && (
                      <div className="space-y-1.5 pt-2.5 border-t border-neutral-800/80">
                        <div className="flex justify-between items-center text-[9.5px] font-sans uppercase text-neutral-450 font-bold tracking-wide">
                          <span>Height Spec Mode</span>
                          <span className="text-[#18A0FB] capitalize text-[9px]">{activeComp.heightMode || 'fixed'}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-1 bg-[#1A1A1A] p-0.5 rounded border border-neutral-800/40">
                          <button
                            onClick={() => {
                              updateActiveComponentField('heightMode', 'fixed');
                              showToast("Set specimen height to FIXED manual mode");
                            }}
                            className={`py-1 text-[8.5px] font-bold rounded cursor-pointer uppercase ${
                              (activeComp.heightMode !== 'auto') 
                                ? 'bg-[#18A0FB]/15 text-[#18A0FB]' 
                                : 'text-neutral-400 hover:text-neutral-200 bg-transparent'
                            }`}
                          >
                            Fixed Height
                          </button>
                          <button
                            onClick={() => {
                              updateActiveComponentField('heightMode', 'auto');
                              showToast("Set specimen height to AUTO responsive content mode");
                            }}
                            className={`py-1 text-[8.5px] font-bold rounded cursor-pointer uppercase ${
                              (activeComp.heightMode === 'auto')
                                ? 'bg-[#18A0FB]/15 text-[#18A0FB]' 
                                : 'text-neutral-400 hover:text-neutral-200 bg-transparent'
                            }`}
                          >
                            Responsive Height
                          </button>
                        </div>
                      </div>
                    )}

                    {/* AVATAR SYSTEM CUSTOMIZATION & MULTI-TYPE SELECTION */}
                    {activeComp.configShowIcon && (activeComp.type === 'card' || activeComp.type === 'dialog') && (
                      <div className="space-y-3 pt-2.5 border-t border-neutral-800/80">
                        <span className="text-[9.5px] font-sans uppercase text-neutral-450 font-bold tracking-wide block">
                          Avatar System
                        </span>
                        
                        {/* 1. Type Selection Buttons */}
                        <div className="space-y-1">
                          <span className="text-[9px] text-neutral-450 font-sans block">Select Avatar Source Type</span>
                          <div className="grid grid-cols-3 gap-1 bg-[#1A1A1A] p-0.5 rounded border border-neutral-800/40">
                            {(['icon', 'initials', 'image'] as const).map((t) => {
                              const currentType = activeComp.avatarType || (activeComp.iconImage ? 'image' : 'icon');
                              const isSel = currentType === t;
                              return (
                                <button
                                  key={t}
                                  onClick={() => {
                                    updateActiveComponentField('avatarType', t);
                                    showToast(`Switched avatar frame source to: ${t.toUpperCase()}`);
                                  }}
                                  className={`py-1 text-[8px] font-bold rounded cursor-pointer uppercase transition-all duration-150 ${
                                    isSel
                                      ? 'bg-[#18A0FB]/15 text-[#18A0FB]'
                                      : 'text-neutral-400 hover:text-neutral-200 bg-transparent'
                                  }`}
                                >
                                  {t}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* 2. Style & Type Specific Fields */}
                        <div className="space-y-2">
                          {/* 2a. Initials Entry (Only when initials is selected) */}
                          {(activeComp.avatarType === 'initials') && (
                            <div className="space-y-1">
                              <span className="text-[9px] text-neutral-450 font-sans block">Avatar Initials (Max 3 chars)</span>
                              <input
                                type="text"
                                maxLength={3}
                                value={activeComp.avatarInitials !== undefined ? activeComp.avatarInitials : ''}
                                placeholder={activeComp.title ? activeComp.title.slice(0, 2).toUpperCase() : 'AV'}
                                onChange={(e) => {
                                  updateActiveComponentField('avatarInitials', e.target.value.toUpperCase());
                                }}
                                className="w-full bg-[#1A1A1A] border border-neutral-800 rounded px-2 py-1 text-[9.5px] font-mono text-neutral-100 placeholder-neutral-600 focus:border-[#18A0FB] outline-none"
                              />
                            </div>
                          )}

                          {/* 2b. Static Image File Upload (Only when image is selected) */}
                          {((activeComp.avatarType || (activeComp.iconImage ? 'image' : 'icon')) === 'image') && (
                            <div className="space-y-1">
                              <span className="text-[9px] text-neutral-450 font-sans block">Static Avatar Target Image</span>
                              <div className="flex gap-1.5">
                                <label 
                                  htmlFor="card-avatar-image-upload" 
                                  className="flex-1 py-1.5 px-2 bg-[#2C2C2C] hover:bg-[#333333] selection:bg-transparent text-neutral-300 rounded text-[9px] font-bold uppercase cursor-pointer text-center truncate border border-neutral-700/50 transition-colors"
                                >
                                  {activeComp.iconImage ? 'Replace Image' : 'Upload Image'}
                                </label>
                                <input
                                  type="file"
                                  accept="image/*"
                                  id="card-avatar-image-upload"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      const reader = new FileReader();
                                      reader.onload = (event) => {
                                        const base64 = event.target?.result as string;
                                        updateActiveComponentField('iconImage', base64);
                                        updateActiveComponentField('avatarType', 'image');
                                        showToast("Avatar custom static image attached!");
                                      };
                                      reader.readAsDataURL(file);
                                    }
                                  }}
                                />
                                {activeComp.iconImage && (
                                  <button
                                    onClick={() => {
                                      updateActiveComponentField('iconImage', undefined);
                                      updateActiveComponentField('avatarType', 'icon');
                                      showToast("Removed custom image avatar. Reverted to Icon.");
                                    }}
                                    className="py-1.5 px-2.5 bg-red-950/25 hover:bg-red-900/30 text-red-400 rounded text-[9px] font-bold uppercase cursor-pointer border-none transition-all"
                                  >
                                    Reset
                                  </button>
                                )}
                              </div>
                            </div>
                          )}

                          {/* 2c. Custom Frame Background Color */}
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] text-neutral-400 font-sans">Avatar Frame Background</span>
                            <div className="flex items-center gap-1.5 bg-[#1E1E1E] p-1 rounded font-sans leading-none border border-neutral-800">
                              <input 
                                type="color" 
                                value={activeComp.iconBgColor || '#222222'} 
                                onChange={(e) => {
                                  updateActiveComponentField('iconBgColor', e.target.value);
                                }} 
                                className="w-4 h-4 border-none p-0 bg-transparent cursor-pointer rounded-sm" 
                              />
                              <span className="text-[8.5px] font-mono text-neutral-300 uppercase">{activeComp.iconBgColor || 'Default'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}


          </div>



        </aside>

      </div>

      {/* FIGMA NATIVE PLUGIN PACKAGING INSTALLER GUIDE */}
      {isPluginModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#2C2C2C] w-full max-w-2xl border border-neutral-700/80 rounded-xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden select-text text-neutral-100 font-sans">
            
            {/* Header */}
            <div className="p-4 border-b border-[#333] flex justify-between items-center bg-[#222]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#A259FF] text-2xl">extension</span>
                <div>
                  <h3 className="text-sm font-bold tracking-wide">Figma Plugin Integrator</h3>
                  <p className="text-[10px] text-neutral-400">Step-by-step developer manifest config</p>
                </div>
              </div>
              <button 
                onClick={() => setIsPluginModalOpen(false)}
                className="p-1 rounded hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer border-none outline-none"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Instruction Body */}
            <div className="flex-1 p-5 overflow-y-auto space-y-4 text-xs leading-relaxed max-h-[70vh]">
              
              <div className="bg-[#18A0FB]/10 border border-[#18A0FB]/30 p-3 rounded text-[11px] text-[#18A0FB] flex items-start gap-2.5">
                <Sparkles className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <strong>How local Figma components connect:</strong> Figma plugins are written using standard HTML frame wraps that embed web interfaces. You can load this exact reactive waveform spec manager into Figma with simple files!
                </div>
              </div>

              {/* Step 1 */}
              <div className="space-y-1.5 pb-2 border-b border-white/5">
                <div className="font-bold text-neutral-200 flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-[#18A0FB] text-white text-[9px] font-mono flex items-center justify-center font-bold">1</span>
                  <span>Create the manifest.json file</span>
                </div>
                <p className="text-neutral-400 text-[10.5px]">
                  Create a new folder on your computer named <code className="bg-[#1E1E1E] text-neutral-300 px-1 py-0.5 rounded font-mono text-[9.5px]">m3-motion-tracker</code>, create a new file named <code className="bg-[#1E1E1E] text-neutral-300 px-1 py-0.5 rounded font-mono text-[9.5px]">manifest.json</code> inside, and paste this manifest descriptor:
                </p>
                <pre className="bg-[#1E1E1E] p-3 rounded font-mono text-[10px] text-emerald-400 overflow-x-auto border border-neutral-800">
{`{
  "name": "M3 Shape Spec Motion Simulator",
  "id": "m3-shape-spec-motion",
  "api": "1.0.0",
  "main": "code.js",
  "ui": "ui.html",
  "editorType": ["figma"]
}`}
                </pre>
              </div>

              {/* Step 2 */}
              <div className="space-y-1.5 pb-2 border-b border-white/5">
                <div className="font-bold text-neutral-200 flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-[#18A0FB] text-white text-[9px] font-mono flex items-center justify-center font-bold">2</span>
                  <span>Write background proxy code.js</span>
                </div>
                <p className="text-neutral-400 text-[10.5px]">
                  Create a file named <code className="bg-[#1E1E1E] text-neutral-300 px-1 py-0.5 rounded font-mono text-[9.5px]">code.js</code> in the folder to spawn the frame setup when launched:
                </p>
                <pre className="bg-[#1E1E1E] p-3 rounded font-mono text-[10px] text-amber-400 overflow-x-auto border border-neutral-800">
{`figma.showUI(__html__, { width: 980, height: 750 });

figma.ui.onmessage = (msg) => {
  if (msg.type === "close") {
    figma.closePlugin();
  }
};`}
                </pre>
              </div>

              {/* Step 3 */}
              <div className="space-y-1.5 pb-2 border-b border-white/5">
                <div className="font-bold text-neutral-200 flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-[#18A0FB] text-white text-[9px] font-mono flex items-center justify-center font-bold">3</span>
                  <span>Create ui.html pointing to this app</span>
                </div>
                <p className="text-neutral-400 text-[10.5px]">
                  Lastly, create a file named <code className="bg-[#1E1E1E] text-neutral-300 px-1 py-0.5 rounded font-mono text-[9.5px]">ui.html</code> that links directly to this workspace viewport dynamically:
                </p>
                <pre className="bg-[#1E1E1E] p-3 rounded font-mono text-[10px] text-cyan-400 overflow-x-auto border border-neutral-800">
{`<iframe 
  src="${window.location.origin}" 
  style="width: 100%; height: 100%; border: 0; outline: none; margin: 0; padding: 0; position: absolute; inset: 0;"
></iframe>`}
                </pre>
              </div>

              {/* Step 4 */}
              <div className="space-y-1.5">
                <div className="font-bold text-neutral-200 flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-[#18A0FB] text-white text-[9px] font-mono flex items-center justify-center font-bold">4</span>
                  <span>Load Manifest in Figma Desktop</span>
                </div>
                <p className="text-neutral-400 text-[10.5px]">
                  Open <strong>Figma Desktop app</strong>, click menu icon, go to <span className="text-neutral-200 font-bold">Plugins → Development → Import plugin from manifest...</span>, then choose your <code className="bg-[#1E1E1E] px-1 text-white font-mono">manifest.json</code>. Launch whenever you need to adjust interactive M3 dimensions or record motion waveforms directly as clean assets!
                </p>
              </div>

            </div>

            {/* Footer */}
            <div className="p-3 bg-[#1A1A1A] border-t border-[#333] flex justify-end gap-2 shrink-0">
              <button
                onClick={() => {
                  showToast("Figma files packaging structure cloned to clipboard!");
                }}
                className="px-3.5 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-[10px] uppercase font-bold text-neutral-200 transition-colors cursor-pointer border-none outline-none"
              >
                Copy manifest details
              </button>
              <button
                onClick={() => setIsPluginModalOpen(false)}
                className="px-3.5 py-1.5 rounded bg-[#18A0FB] hover:bg-[#18A0FB]/90 text-[10.5px] uppercase font-bold text-white transition-colors cursor-pointer border-none_outline-none"
              >
                Done / Got it
              </button>
            </div>

          </div>
        </div>
      )}

      {/* --- MODAL 1: SAVE WORKSPACE COMBINATION VIEW --- */}
      {isSaveComboModalOpen && (
        <div className="fixed inset-0 bg-black/75 z-[99] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in font-sans">
          <div className="bg-[#2C2C2C] border border-neutral-700/60 rounded-xl w-full max-w-md shadow-2xl flex flex-col overflow-hidden text-[#E6E6E6]">
            
            <div className="p-4 bg-[#222222] border-b border-[#1A1A1A] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FolderHeart className="w-4 h-4 text-[#18A0FB]" />
                <span className="font-bold text-xs uppercase tracking-wider text-neutral-200">Save Combination Spec</span>
              </div>
              <button 
                onClick={() => setIsSaveComboModalOpen(false)}
                className="text-neutral-500 hover:text-white transition-colors cursor-pointer border-none bg-transparent"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-mono tracking-wider font-bold text-neutral-450 block">Name of Combination view/layout</label>
                <input 
                  type="text"
                  value={newComboName}
                  onChange={(e) => setNewComboName(e.target.value)}
                  placeholder="e.g. ❖ Electric Neon HUD Grid"
                  className="w-full bg-[#1A1A1A] text-white border border-neutral-700 rounded-md p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#18A0FB]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-mono tracking-wider font-bold text-neutral-450 block">Link to Figma File Context</label>
                <select
                  value={newComboFileId}
                  onChange={(e) => setNewComboFileId(e.target.value)}
                  className="w-full bg-[#1A1A1A] text-white border border-neutral-700 rounded-md p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#18A0FB] cursor-pointer"
                >
                  {linkedFigmaFiles.map(file => (
                    <option key={file.id} value={file.id}>{file.name}</option>
                  ))}
                </select>
                <span className="text-[9.5px] text-neutral-500 block leading-normal pt-1">
                  Saving a combination captures: Active components, WebGL wave statuses, color libraries, and active backdrops in relation to the linked file.
                </span>
              </div>
            </div>

            <div className="p-3 bg-[#1E1E1E] border-t border-neutral-800 flex justify-end gap-2 text-xs">
              <button
                onClick={() => setIsSaveComboModalOpen(false)}
                className="px-3.5 py-2 rounded-md bg-neutral-800 hover:bg-neutral-700 font-bold transition-all cursor-pointer border-none text-[#E6E6E6]"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleSaveCurrentCombination(newComboName, newComboFileId);
                  setNewComboName('');
                }}
                className="px-4 py-2 rounded-md bg-[#18A0FB] hover:bg-[#158CDD] text-white font-bold transition-all cursor-pointer border-none"
              >
                Save layout combo
              </button>
            </div>

          </div>
        </div>
      )}

      {/* --- MODAL 4: START A NEW VIEW FROM SCRATCH WITH LINKED FILE CHOICE --- */}
      {isNewFromScratchModalOpen && (
        <div className="fixed inset-0 bg-black/75 z-[99] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in font-sans">
          <div className="bg-[#2C2C2C] border border-neutral-700/60 rounded-xl w-full max-w-md shadow-2xl flex flex-col overflow-hidden text-[#E6E6E6]">
            
            <div className="p-4 bg-[#222222] border-b border-[#1A1A1A] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-purple-400" />
                <span className="font-bold text-xs uppercase tracking-wider text-neutral-200">Start Project From Scratch</span>
              </div>
              <button 
                onClick={() => setIsNewFromScratchModalOpen(false)}
                className="text-neutral-500 hover:text-white transition-colors cursor-pointer border-none bg-transparent"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-mono tracking-wider font-bold text-neutral-450 block">Project Name</label>
                <input 
                  type="text"
                  value={newScratchName}
                  onChange={(e) => setNewScratchName(e.target.value)}
                  placeholder="e.g. My Workspace Spec"
                  className="w-full bg-[#1A1A1A] text-white border border-neutral-700 rounded-md p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#18A0FB]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-mono tracking-wider font-bold text-neutral-450 block">Optionally Link a Figma Design File</label>
                <select
                  value={newScratchFileId}
                  onChange={(e) => setNewScratchFileId(e.target.value)}
                  className="w-full bg-[#1A1A1A] text-white border border-neutral-700 rounded-md p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#18A0FB] cursor-pointer"
                >
                  <option value="none">-- Don't link a file (Independent Blank Specimen) --</option>
                  {linkedFigmaFiles.map(file => (
                    <option key={file.id} value={file.id}>{file.name}</option>
                  ))}
                </select>
                <span className="text-[9.5px] text-neutral-500 block leading-normal pt-1">
                  Linking a design file establishes the context for exporting and importing layout properties in the Figma plugin ecosystem. You can still link or change files later.
                </span>
              </div>
            </div>

            <div className="p-3 bg-[#1E1E1E] border-t border-neutral-800 flex justify-end gap-2 text-xs">
              <button
                onClick={() => setIsNewFromScratchModalOpen(false)}
                className="px-3.5 py-2 rounded-md bg-neutral-800 hover:bg-neutral-700 font-bold transition-all cursor-pointer border-none text-[#E6E6E6]"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCustomScratch}
                className="px-5 py-2 rounded-md bg-purple-600 hover:bg-purple-500 text-white font-bold transition-all cursor-pointer border-none"
              >
                Create Project
              </button>
            </div>

          </div>
        </div>
      )}

      {/* --- MODAL 5: CUSTOM LAYER-SPECIFIC FIGMA LINK CONFIGURATION DIALOG --- */}
      {isLayerLinkModalOpen && activeLinkCombination && (
        <div className="fixed inset-0 bg-black/75 z-[99] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in font-sans">
          <div className="bg-[#2C2C2C] border border-neutral-700/60 rounded-xl w-full max-w-sm shadow-2xl flex flex-col overflow-hidden text-[#E6E6E6]">
            
            <div className="p-4 bg-[#222222] border-b border-[#1A1A1A] flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-sans">
                <Link2 className="w-4 h-4 text-[#18A0FB]" />
                <span className="font-bold text-xs uppercase tracking-wider text-neutral-200">Figma Link Configuration</span>
              </div>
              <button 
                onClick={() => {
                  setIsLayerLinkModalOpen(false);
                  setActiveLinkCombination(null);
                }}
                className="text-neutral-500 hover:text-white transition-colors cursor-pointer border-none bg-transparent"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-neutral-400 block">Active Layer Preset</span>
                <span className="text-xs font-bold text-white mt-1 block">
                  {activeLinkCombination.name}
                </span>
              </div>

              {/* Linked File Status */}
              <div className="space-y-1.5 pt-2 border-t border-neutral-800">
                <label className="text-[10px] uppercase font-mono tracking-wider font-bold text-neutral-400 block">Currently Linked File</label>
                {activeLinkCombination.figmaFileId && activeLinkCombination.figmaFileId !== 'none' && linkedFigmaFiles.some(f => f.id === activeLinkCombination.figmaFileId) ? (
                  (() => {
                    const matchedFile = linkedFigmaFiles.find(f => f.id === activeLinkCombination.figmaFileId)!;
                    return (
                      <div className="p-3 rounded-lg bg-[#1A1A1A] border border-neutral-800/85 space-y-2">
                        <div className="flex items-center gap-2">
                          <FolderHeart className="w-4 h-4 text-[#18A0FB]" />
                          <span className="text-xs font-bold text-white truncate">{matchedFile.name}</span>
                        </div>
                        <a 
                          href={matchedFile.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] text-[#18A0FB] hover:underline flex items-center gap-1 font-bold"
                        >
                          <span>Open design file specs</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    );
                  })()
                ) : (
                  <div className="text-[11px] text-neutral-500 italic">
                    No Figma file currently linked to this layer.
                  </div>
                )}
              </div>

              {/* Link an Existing Figma File Selection */}
              <div className="space-y-1.5 pt-1">
                <label className="text-[10px] uppercase font-mono tracking-wider font-bold text-neutral-400 block">Change Link / Select Figma File</label>
                <select
                  value={activeLinkCombination.figmaFileId || 'none'}
                  onChange={(e) => {
                    const newFigmaId = e.target.value;
                    // Update copy
                    setActiveLinkCombination(prev => prev ? { ...prev, figmaFileId: newFigmaId } : null);
                    // Commit to save state
                    setSavedCombinations(prev => prev.map(c => {
                      if (c.id === activeLinkCombination.id) {
                        return { ...c, figmaFileId: newFigmaId };
                      }
                      return c;
                    }));
                    // Also update active file ID context
                    setSelectedFigmaFileId(newFigmaId);
                    showToast(`Linked combination to: ${newFigmaId === 'none' ? 'Independent Spec space' : (linkedFigmaFiles.find(f => f.id === newFigmaId)?.name || 'Specs File')}`);
                  }}
                  className="w-full bg-[#1A1A1A] text-white border border-neutral-700/80 rounded-md p-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#18A0FB] cursor-pointer"
                >
                  <option value="none">-- Unlink / No Figma File --</option>
                  {linkedFigmaFiles.map(file => (
                    <option key={file.id} value={file.id}>{file.name}</option>
                  ))}
                </select>
              </div>

              {/* Edit Selected Linked File Metadata Inline or Create a New Connection */}
              <div className="space-y-2 pt-3 border-t border-neutral-800">
                <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-neutral-400 block">
                  {activeLinkCombination.figmaFileId !== 'none' ? 'Edit Selected File Metadata' : 'Or Create & Link New Figma File'}
                </span>

                <div className="space-y-1">
                  <label className="text-[9px] font-sans font-semibold text-neutral-400">File Name</label>
                  <input
                    type="text"
                    placeholder="e.g. material_3_fluid_energy_spec.fig"
                    value={modalFigmaName}
                    onChange={(e) => setModalFigmaName(e.target.value)}
                    className="w-full bg-[#1A1A1A] text-white border border-neutral-700 p-2 text-xs rounded focus:outline-none focus:ring-1 focus:ring-[#18A0FB]"
                  />
                </div>

                <div className="space-y-1 pt-1">
                  <label className="text-[9px] font-sans font-semibold text-neutral-400">Figma URL</label>
                  <input
                    type="text"
                    placeholder="e.g. https://figma.com/file/..."
                    value={modalFigmaUrl}
                    onChange={(e) => setModalFigmaUrl(e.target.value)}
                    className="w-full bg-[#1A1A1A] text-white border border-neutral-700 p-2 text-xs rounded focus:outline-none focus:ring-1 focus:ring-[#18A0FB]"
                  />
                </div>

                <div className="flex gap-2 pt-1.5">
                  {activeLinkCombination.figmaFileId && activeLinkCombination.figmaFileId !== 'none' ? (
                    <button
                      type="button"
                      onClick={() => {
                        if (!modalFigmaName.trim()) {
                          showToast("Please enter a valid file name.");
                          return;
                        }
                        const targetId = activeLinkCombination.figmaFileId;
                        setLinkedFigmaFiles(prev => prev.map(f => {
                          if (f.id === targetId) {
                            return { ...f, name: modalFigmaName.trim(), url: modalFigmaUrl.trim() };
                          }
                          return f;
                        }));
                        showToast(`Updated details for linked file!`);
                      }}
                      className="flex-1 h-8 rounded bg-[#18A0FB] hover:bg-[#158CDD] text-white text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer border-none"
                    >
                      Save File Details
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        if (!modalFigmaName.trim()) {
                          showToast("Please enter a file name first.");
                          return;
                        }
                        const newId = `fig-${Math.random().toString(36).substring(2, 9)}`;
                        const newFile = {
                          id: newId,
                          name: modalFigmaName.trim(),
                          url: modalFigmaUrl.trim() || 'https://figma.com'
                        };
                        setLinkedFigmaFiles(prev => [...prev, newFile]);
                        // Set this combo to the newly created file context
                        setActiveLinkCombination(prev => prev ? { ...prev, figmaFileId: newId } : null);
                        setSavedCombinations(prev => prev.map(c => {
                          if (c.id === activeLinkCombination.id) {
                            return { ...c, figmaFileId: newId };
                          }
                          return c;
                        }));
                        setModalFigmaName('');
                        setModalFigmaUrl('');
                        showToast(`Connected & linked new file: ${newFile.name}`);
                      }}
                      className="flex-1 h-8 rounded bg-[#18A0FB] hover:bg-[#158CDD] text-white text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer border-none"
                    >
                      Create & Link File
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="p-3 bg-[#1E1E1E] border-t border-neutral-800 flex justify-end text-xs">
              <button
                onClick={() => {
                  setIsLayerLinkModalOpen(false);
                  setActiveLinkCombination(null);
                }}
                className="px-4 py-2 rounded-md bg-neutral-800 hover:bg-neutral-700 font-bold transition-all cursor-pointer border-none text-white text-xs"
              >
                Close / Done
              </button>
            </div>

          </div>
        </div>
      )}

      {/* --- MODAL 2: LINKED FIGMA DESIGN FILES MANAGER --- */}
      {isSettingFigmaModalOpen && (
        <div className="fixed inset-0 bg-black/75 z-[99] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in font-sans">
          <div className="bg-[#2C2C2C] border border-neutral-700/60 rounded-xl w-full max-w-lg shadow-2xl flex flex-col overflow-hidden text-[#E6E6E6]">
            
            <div className="p-4 bg-[#222222] border-b border-[#1A1A1A] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Link2 className="w-4 h-4 text-[#18A0FB]" />
                <span className="font-bold text-xs uppercase tracking-wider text-neutral-200">Linked Figma Specs Manager</span>
              </div>
              <button 
                onClick={() => setIsSettingFigmaModalOpen(false)}
                className="text-neutral-500 hover:text-white transition-colors cursor-pointer border-none bg-transparent"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 flex flex-col md:flex-row gap-5">
              
              {/* Left Column: Link files list */}
              <div className="flex-1 space-y-3">
                <span className="text-[10px] uppercase font-sans tracking-wider font-bold text-neutral-450 block">Linked System Assets</span>
                <div className="space-y-2 max-h-[190px] overflow-y-auto pr-1">
                  {linkedFigmaFiles.map(file => {
                    const isSelected = selectedFigmaFileId === file.id;
                    return (
                      <div 
                        key={file.id} 
                        onClick={() => {
                          setSelectedFigmaFileId(file.id);
                          showToast(`Switched Frame context: ${file.name}`);
                        }}
                        className={`p-2.5 rounded-lg border flex items-center justify-between group transition-all cursor-pointer ${
                          isSelected 
                            ? 'bg-[#18A0FB]/10 border-[#18A0FB]/40 shadow-sm' 
                            : 'bg-[#1A1A1A] border-neutral-800 hover:border-neutral-700/50 hover:bg-[#1E1E1E]'
                        }`}
                      >
                        <div className="truncate flex-1 pr-2">
                          <div className="flex items-center gap-1.5">
                            {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#18A0FB]" />}
                            <span className={`text-xs font-bold block truncate ${isSelected ? 'text-[#18A0FB]' : 'text-neutral-200'}`}>{file.name}</span>
                          </div>
                          <a 
                            href={file.url}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-[9px] font-sans font-bold text-neutral-500 hover:text-[#18A0FB] flex items-center gap-0.5 truncate uppercase tracking-wider mt-1"
                          >
                            <span>Open File Web View</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        </div>
                        {file.id !== 'fig-1' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteFigmaFile(file.id, e);
                            }}
                            className="p-1 rounded bg-neutral-800 text-rose-450 hover:bg-neutral-700 cursor-pointer border-none transition-colors"
                            title="Unlink and remote figma reference"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Add new Figma file context form */}
              <div className="flex-1 space-y-3 border-t md:border-t-0 md:border-l border-neutral-700/60 pt-3 md:pt-0 md:pl-4">
                <span className="text-[10px] uppercase font-sans tracking-wider font-bold text-[#18A0FB] block">Link another file context</span>
                
                <div className="space-y-1.5">
                  <label className="text-[9.5px] font-bold text-neutral-450 font-sans tracking-wide uppercase">Name of Spec File</label>
                  <input 
                    type="text"
                    value={newFigmaName}
                    onChange={(e) => setNewFigmaName(e.target.value)}
                    placeholder="e.g. material_components_custom.fig"
                    className="w-full bg-[#1A1A1A] text-white border border-neutral-700 p-2 text-xs rounded focus:outline-none focus:ring-1 focus:ring-[#18A0FB]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9.5px] font-bold text-neutral-450 font-sans tracking-wide uppercase">Figma File Access URL</label>
                  <input 
                    type="text"
                    value={newFigmaUrl}
                    onChange={(e) => setNewFigmaUrl(e.target.value)}
                    placeholder="e.g. https://figma.com/file/..."
                    className="w-full bg-[#1A1A1A] text-white border border-neutral-700 p-2 text-xs rounded focus:outline-none focus:ring-1 focus:ring-[#18A0FB]"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (!newFigmaName.trim()) {
                      showToast("Please provide a name for the Figma file spec.");
                      return;
                    }
                    handleAddFigmaFile(newFigmaName, newFigmaUrl);
                  }}
                  className="w-full h-8 rounded bg-[#18A0FB] hover:bg-[#158CDD] text-white text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer border-none flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Connect design system file</span>
                </button>
              </div>

            </div>

            <div className="p-3 bg-[#1E1E1E] border-t border-neutral-800 flex justify-end text-xs">
              <button
                onClick={() => setIsSettingFigmaModalOpen(false)}
                className="h-8 px-4 rounded bg-[#18A0FB] hover:bg-[#158CDD] text-white font-sans text-[10px] uppercase font-bold tracking-wider transition-all cursor-pointer border-none flex items-center"
              >
                Close and return to workspace
              </button>
            </div>

          </div>
        </div>
      )}

      {/* --- MODAL 3: SHARED VIEW COMBINATION IMPORT NOTIFICATION --- */}
      {isImportModalOpen && sharedImportCombination && (
        <div className="fixed inset-0 bg-black/80 z-[999] flex items-center justify-center p-4 backdrop-blur-md animate-fade-in font-sans">
          <div className="bg-[#2C2C2C] border-2 border-[#18A0FB]/40 rounded-xl w-full max-w-md shadow-2xl flex flex-col overflow-hidden text-[#E6E6E6]">
            
            <div className="p-4 bg-[#1E1E1E] border-b border-[#2C2C2C] flex items-center gap-2">
              <Sparkle className="w-5 h-5 text-[#18A0FB] animate-spin-slow" />
              <span className="font-bold text-xs uppercase tracking-wider text-white">Import Shared Layout Blueprint</span>
            </div>

            <div className="p-5 space-y-3.5">
              <p className="text-xs text-neutral-300 leading-relaxed">
                You have been shared a custom design preview combination layout! Importing this blueprint will update your active canvas components and settings options:
              </p>
              
              <div className="bg-[#1A1A1A] border border-neutral-800/80 rounded-lg p-3 space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-neutral-500">Layout Name:</span>
                  <strong className="text-white">{sharedImportCombination.name}</strong>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-neutral-500 font-sans">Material Specimens Count:</span>
                  <strong className="text-[#18A0FB] font-mono">{sharedImportCombination.components?.length || 0} items</strong>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-neutral-500">Assigned Theme:</span>
                  <strong className="text-neutral-300 capitalize">{sharedImportCombination.canvasBgMode || 'dark'} Theme</strong>
                </div>
              </div>

              <div className="text-[10px] text-neutral-450 bg-rose-950/15 p-2 rounded text-rose-350 border border-rose-950/30">
                Warning: Importing will overwrite any unsaved changes on your active designer workspace board.
              </div>
            </div>

            <div className="p-3 bg-[#1A1A1A] border-t border-neutral-800 flex justify-end gap-2 text-xs">
              <button
                onClick={() => {
                  setIsImportModalOpen(false);
                  setSharedImportCombination(null);
                  window.history.replaceState({}, document.title, window.location.pathname);
                }}
                className="px-3.5 py-2 rounded bg-neutral-800 hover:bg-neutral-700 font-bold transition-all cursor-pointer border-none"
              >
                Reject & Discard
              </button>
              <button
                onClick={() => {
                  handleLoadCombination(sharedImportCombination);
                  setIsImportModalOpen(false);
                  setSharedImportCombination(null);
                  // Clean URL query param beautiful state transition
                  window.history.replaceState({}, document.title, window.location.pathname);
                }}
                className="px-4 py-2 rounded bg-green-650 hover:bg-green-600 text-white font-bold transition-all cursor-pointer border-none shadow-md shadow-green-950/20"
              >
                Accept and load layout
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Dynamic SVG Organic Warp Displacement Filter */}
      <svg className="absolute pointer-events-none" style={{ width: 0, height: 0, position: 'absolute', overflow: 'hidden' }}>
        <defs>
          <filter id="m3-energy-warp-filter" x="-50%" y="-50%" width="200%" height="200%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.005 0.004"
              numOctaves="1"
              result="noise"
              seed="5"
            >
              <animate
                attributeName="baseFrequency"
                dur="18s"
                values="0.005 0.004;0.009 0.008;0.005 0.004"
                repeatCount="indefinite"
              />
            </feTurbulence>
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale={isAnimationActive ? intensity * 7 + 1.5 : 0}
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>

    </div>
  );
}

function WaveLoopVisualizer({ intensity, isPlaying }: { intensity: number; isPlaying: boolean }) {
  const [phase, setPhase] = React.useState(0);

  React.useEffect(() => {
    if (!isPlaying) return;
    let animId: number;
    const tick = () => {
      setPhase((prev) => (prev + 0.04 * intensity) % (Math.PI * 2));
      animId = requestAnimationFrame(tick);
    };
    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, intensity]);

  const width = 180;
  const height = 30;
  
  const points1 = [];
  for (let x = 0; x <= width; x += 5) {
    const y = height / 2 + Math.sin(x * 0.04 + phase) * 6 * Math.min(1.5, intensity);
    points1.push(`${x},${y}`);
  }
  const d1 = `M ${points1.join(' L ')}`;

  const points2 = [];
  for (let x = 0; x <= width; x += 5) {
    const y = height / 2 + Math.sin(x * 0.06 - phase * 1.2) * 4 * Math.min(1.5, intensity);
    points2.push(`${x},${y}`);
  }
  const d2 = `M ${points2.join(' L ')}`;

  return (
    <svg className="w-full h-full" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <path
        d={d1}
        fill="none"
        stroke="url(#energyGradient1)"
        strokeWidth="1.5"
        className="opacity-80"
      />
      <path
        d={d2}
        fill="none"
        stroke="url(#energyGradient2)"
        strokeWidth="1"
        className="opacity-55"
      />
      <defs>
        <linearGradient id="energyGradient1" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#18A0FB" />
          <stop offset="100%" stopColor="#0ACF83" />
        </linearGradient>
        <linearGradient id="energyGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#0ACF83" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#18A0FB" stopOpacity="0.4" />
        </linearGradient>
      </defs>
    </svg>
  );
}
