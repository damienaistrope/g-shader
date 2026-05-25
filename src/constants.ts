import { Volume2, Brain, MessageSquare, Sparkles, Moon } from 'lucide-react';
import type { M3StateMeta } from './types';

// ─── Shader interaction states ────────────────────────────────────────────────

export const OFFICIAL_STATES: M3StateMeta[] = [
  { id: 0, label: 'Neutral Default', icon: Moon,         defaultMid: '#121212', defaultEnd: '#1A1A1A', badgeText: 'Sleeping Mode',     description: 'Pristine resting energy state' },
  { id: 2, label: 'Listening',       icon: Volume2,      defaultMid: '#4285F4', defaultEnd: '#24D6FF', badgeText: 'Live Audio Stream',  description: 'Dynamic reactive fluid listening state' },
  { id: 3, label: 'Responding',      icon: MessageSquare,defaultMid: '#FF1F7E', defaultEnd: '#4285F4', badgeText: 'Modulating Feedback',description: 'Vocal production waveforms & synthetic voice loops' },
  { id: 4, label: 'Processing',      icon: Brain,        defaultMid: '#9C27B0', defaultEnd: '#24D6FF', badgeText: 'Thinking Mode',      description: 'Active core compute thread simulation' },
  { id: 5, label: 'Anticipating',    icon: Sparkles,     defaultMid: '#3F51B5', defaultEnd: '#FF1F7E', badgeText: 'Heuristic Model',    description: 'Predictive neural model anticipating queries' },
];

// ─── Material 3 color libraries ───────────────────────────────────────────────

export const M3_COLOR_LIBRARIES: Record<string, {
  name: string;
  colors: Record<'light' | 'dark', Record<'primary' | 'secondary' | 'surface', { bg: string; text: string; subtext: string; label: string }>>;
}> = {
  'default-purple': {
    name: 'Material Baseline Purple',
    colors: {
      light: {
        primary:   { bg: '#6750A4', text: '#FFFFFF', subtext: '#EADDFF', label: 'Primary filled purple' },
        secondary: { bg: '#E8DEF8', text: '#1D192B', subtext: '#49454F', label: 'Secondary container' },
        surface:   { bg: '#FEF7FF', text: '#1D1B20', subtext: '#49454F', label: 'Surface container' },
      },
      dark: {
        primary:   { bg: '#D0BCFF', text: '#381E72', subtext: '#381E72', label: 'Primary dark purple' },
        secondary: { bg: '#332D41', text: '#E8DEF8', subtext: '#CCC2DC', label: 'Secondary dark container' },
        surface:   { bg: '#141218', text: '#E6E1E5', subtext: '#938F99', label: 'Surface dark container' },
      },
    },
  },
  'terra-cotta': {
    name: 'Material Terracotta Rose',
    colors: {
      light: {
        primary:   { bg: '#9C423B', text: '#FFFFFF', subtext: '#FFDAD6', label: 'Primary Warm Red' },
        secondary: { bg: '#FFDAD6', text: '#410002', subtext: '#5D1110', label: 'Secondary Clay' },
        surface:   { bg: '#FFF8F7', text: '#231A19', subtext: '#534341', label: 'Warm Earth Surface' },
      },
      dark: {
        primary:   { bg: '#FFB4AB', text: '#5D1110', subtext: '#80100D', label: 'Dark Clay Red' },
        secondary: { bg: '#5D1110', text: '#FFDAD6', subtext: '#FFB4AB', label: 'Dark Clay Container' },
        surface:   { bg: '#1D1514', text: '#EDE0DE', subtext: '#A08C8A', label: 'Dark Earth Surface' },
      },
    },
  },
  'forest-jade': {
    name: 'Material Emerald Forest',
    colors: {
      light: {
        primary:   { bg: '#386A20', text: '#FFFFFF', subtext: '#DFE8D8', label: 'Primary Jade' },
        secondary: { bg: '#E8F5E9', text: '#0C140E', subtext: '#1B5E20', label: 'Secondary Lime' },
        surface:   { bg: '#F1FBF0', text: '#191E19', subtext: '#434943', label: 'Forest Mint Surface' },
      },
      dark: {
        primary:   { bg: '#B2D0AC', text: '#1A330E', subtext: '#1A330E', label: 'Dark Basil Green' },
        secondary: { bg: '#334D2E', text: '#E8F5E9', subtext: '#B2D0AC', label: 'Dark Eco Container' },
        surface:   { bg: '#0C140E', text: '#E2E3DD', subtext: '#8E928C', label: 'Dark Moss Surface' },
      },
    },
  },
  'ocean-azure': {
    name: 'Material Ocean Azure',
    colors: {
      light: {
        primary:   { bg: '#00658B', text: '#FFFFFF', subtext: '#C9E6FF', label: 'Primary Blue' },
        secondary: { bg: '#C9E6FF', text: '#001E2E', subtext: '#004C6A', label: 'Secondary Lagoon' },
        surface:   { bg: '#F7FAFC', text: '#191C1E', subtext: '#41484D', label: 'Soft Slate Surface' },
      },
      dark: {
        primary:   { bg: '#80CFFF', text: '#00344A', subtext: '#004C6A', label: 'Dark Ocean Blue' },
        secondary: { bg: '#00354C', text: '#C9E6FF', subtext: '#80CFFF', label: 'Dark Lagoon Container' },
        surface:   { bg: '#0A1318', text: '#E2E2E5', subtext: '#8B9197', label: 'Dark Abyssal Surface' },
      },
    },
  },
  'golden-amber': {
    name: 'Material Golden Amber',
    colors: {
      light: {
        primary:   { bg: '#765B00', text: '#FFFFFF', subtext: '#FFE082', label: 'Primary Golden Yellow' },
        secondary: { bg: '#FFE082', text: '#241A00', subtext: '#523E00', label: 'Secondary Maize' },
        surface:   { bg: '#FFFDF6', text: '#1D1B16', subtext: '#4B473E', label: 'Soft Alabaster Surface' },
      },
      dark: {
        primary:   { bg: '#E9C400', text: '#3E3000', subtext: '#523E00', label: 'Dark Marigold' },
        secondary: { bg: '#3D2F00', text: '#FFE082', subtext: '#E9C400', label: 'Dark Maize Container' },
        surface:   { bg: '#1C1B12', text: '#E6E2D8', subtext: '#969185', label: 'Dark Amber Surface' },
      },
    },
  },
  'electric-neon': {
    name: 'Material Cyber Violet',
    colors: {
      light: {
        primary:   { bg: '#A00078', text: '#FFFFFF', subtext: '#FFD8EC', label: 'Primary Cyber Magenta' },
        secondary: { bg: '#FFD8EC', text: '#3B002A', subtext: '#700053', label: 'Secondary Lavender Rose' },
        surface:   { bg: '#FFF8F9', text: '#201A1D', subtext: '#4F4349', label: 'Neon Orchid Surface' },
      },
      dark: {
        primary:   { bg: '#FFADE3', text: '#5E0045', subtext: '#7A005B', label: 'Dark Laser Pink' },
        secondary: { bg: '#40002F', text: '#FFD8EC', subtext: '#FFADE3', label: 'Dark Orchid Container' },
        surface:   { bg: '#181216', text: '#EBE0E4', subtext: '#9B8E93', label: 'Dark Synthwave Surface' },
      },
    },
  },
  'stormy-graphite': {
    name: 'Material Monochrome Slate',
    colors: {
      light: {
        primary:   { bg: '#1A1A1A', text: '#FFFFFF', subtext: '#EBEBEB', label: 'Primary Obsidian Jet' },
        secondary: { bg: '#E5E5E5', text: '#111111', subtext: '#555555', label: 'Secondary Platinum' },
        surface:   { bg: '#FAFAFA', text: '#222222', subtext: '#666666', label: 'Minimalist Frost White' },
      },
      dark: {
        primary:   { bg: '#FFFFFF', text: '#111111', subtext: '#CDCDCD', label: 'Dark Silver Solid' },
        secondary: { bg: '#2D2D2D', text: '#FFFFFF', subtext: '#8E8E8E', label: 'Dark Platinum Container' },
        surface:   { bg: '#121212', text: '#E5E5E5', subtext: '#9A9A9A', label: 'Dark Obsidian Surface' },
      },
    },
  },
};

// ─── Typography scale ─────────────────────────────────────────────────────────

export const M3_FONT_STYLES: Record<string, { name: string; class: string }> = {
  displayLarge:    { name: 'Display Large (57px)',      class: 'text-3xl md:text-[38px] lg:text-[44px] font-normal tracking-[-0.04em] leading-none font-sans' },
  headlineMedium:  { name: 'Headline Medium (28px)',    class: 'text-xl md:text-[24px] lg:text-[28px] font-semibold tracking-normal leading-tight font-sans' },
  headlineSmall:   { name: 'Headline Small (24px)',     class: 'text-[24px] font-semibold tracking-normal leading-tight font-sans' },
  titleLarge:      { name: 'Title Large (22px)',        class: 'text-lg md:text-[20px] font-bold tracking-normal leading-snug font-sans' },
  titleMedium:     { name: 'Title Medium (16px)',       class: 'text-[16px] font-medium tracking-[0.15px] leading-snug font-sans' },
  titleSmall:      { name: 'Title Small (14px)',        class: 'text-[14px] font-bold tracking-[0.01em] leading-normal font-sans' },
  bodyLarge:       { name: 'Body Large (16px)',         class: 'text-[15px] font-normal tracking-[0.02em] leading-relaxed font-sans opacity-95' },
  bodyMedium:      { name: 'Body Medium (14px)',        class: 'text-[13px] font-normal tracking-[0.01em] leading-relaxed font-sans opacity-85' },
  bodySmall:       { name: 'Body Small (12px)',         class: 'text-[12px] font-normal tracking-[0.4px] leading-normal font-sans opacity-80' },
  labelLarge:      { name: 'Label Large Button (14px)', class: 'text-[13px] font-bold uppercase tracking-wider font-sans' },
  labelMedium:     { name: 'Label Medium (12px)',       class: 'text-[11.5px] font-medium tracking-[0.02em] font-sans' },
  subtextMicro:    { name: 'Subtext Micro (10px)',      class: 'text-[9.5px] font-sans tracking-wider opacity-80' },
};

// ─── Component size presets ───────────────────────────────────────────────────

export const M3_SIZE_PRESETS: Record<string, Record<string, { width: number; height: number; borderRadius: number }>> = {
  button:   { xsmall: { width: 90,  height: 26,  borderRadius: 13 }, small: { width: 120, height: 32,  borderRadius: 16 }, medium: { width: 160, height: 40,  borderRadius: 20 }, large: { width: 220, height: 56,  borderRadius: 28 }, xlarge: { width: 260, height: 64,  borderRadius: 32 } },
  chip:     { xsmall: { width: 80,  height: 24,  borderRadius: 6  }, small: { width: 100, height: 28,  borderRadius: 8  }, medium: { width: 120, height: 32,  borderRadius: 8  }, large: { width: 140, height: 36,  borderRadius: 8  }, xlarge: { width: 160, height: 44,  borderRadius: 10 } },
  fab:      { xsmall: { width: 32,  height: 32,  borderRadius: 10 }, small: { width: 40,  height: 40,  borderRadius: 12 }, medium: { width: 56,  height: 56,  borderRadius: 16 }, large: { width: 96,  height: 96,  borderRadius: 28 }, xlarge: { width: 120, height: 120, borderRadius: 36 } },
  badge:    { xsmall: { width: 10,  height: 10,  borderRadius: 5  }, small: { width: 16,  height: 16,  borderRadius: 8  }, medium: { width: 32,  height: 16,  borderRadius: 8  }, large: { width: 56,  height: 16,  borderRadius: 8  }, xlarge: { width: 72,  height: 22,  borderRadius: 11 } },
  sheets:   { xsmall: { width: 180, height: 120, borderRadius: 12 }, small: { width: 240, height: 180, borderRadius: 16 }, medium: { width: 300, height: 240, borderRadius: 16 }, large: { width: 360, height: 300, borderRadius: 20 }, xlarge: { width: 420, height: 360, borderRadius: 24 } },
  avatar:   { xsmall: { width: 24,  height: 24,  borderRadius: 12 }, small: { width: 32,  height: 32,  borderRadius: 16 }, medium: { width: 44,  height: 44,  borderRadius: 22 }, large: { width: 64,  height: 64,  borderRadius: 32 }, xlarge: { width: 96,  height: 96,  borderRadius: 48 } },
  progress: { xsmall: { width: 120, height: 4,   borderRadius: 2  }, small: { width: 160, height: 4,   borderRadius: 2  }, medium: { width: 200, height: 8,   borderRadius: 4  }, large: { width: 240, height: 8,   borderRadius: 4  }, xlarge: { width: 280, height: 12,  borderRadius: 6  } },
  card:     { xsmall: { width: 180, height: 100, borderRadius: 8  }, small: { width: 240, height: 140, borderRadius: 12 }, medium: { width: 300, height: 180, borderRadius: 12 }, large: { width: 360, height: 220, borderRadius: 12 }, xlarge: { width: 420, height: 260, borderRadius: 16 } },
  dialog:   { xsmall: { width: 240, height: 120, borderRadius: 20 }, small: { width: 280, height: 160, borderRadius: 28 }, medium: { width: 320, height: 200, borderRadius: 28 }, large: { width: 400, height: 260, borderRadius: 28 }, xlarge: { width: 480, height: 320, borderRadius: 32 } },
};

// ─── Utility ──────────────────────────────────────────────────────────────────

export const interpolateHexColors = (colorA: string, colorB: string, fraction: number): string => {
  if (!colorA || !colorB) return colorA || colorB || '#121212';
  try {
    const rA = parseInt(colorA.slice(1, 3), 16), gA = parseInt(colorA.slice(3, 5), 16), bA = parseInt(colorA.slice(5, 7), 16);
    const rB = parseInt(colorB.slice(1, 3), 16), gB = parseInt(colorB.slice(3, 5), 16), bB = parseInt(colorB.slice(5, 7), 16);
    const r = Math.round(rA + (rB - rA) * fraction);
    const g = Math.round(gA + (gB - gA) * fraction);
    const b = Math.round(bA + (bB - bA) * fraction);
    return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
  } catch { return colorB; }
};

export const getContrastColor = (hex: string): string => {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.slice(0, 2), 16);
  const g = parseInt(cleanHex.slice(2, 4), 16);
  const b = parseInt(cleanHex.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#111111' : '#FFFFFF';
};
