import type { ComponentInstance } from '../types';
import { M3_COLOR_LIBRARIES } from '../constants';

export function getM3SpecificStyles(
  comp: ComponentInstance,
  mode: 'light' | 'dark',
  customLibraries: Record<string, any> = {},
  globalColorLibrary = 'default-purple',
) {
  const libKey = comp.colorLibrary || globalColorLibrary || 'default-purple';
  const lib = (customLibraries[libKey] || M3_COLOR_LIBRARIES[libKey]) || M3_COLOR_LIBRARIES['default-purple'];
  const lc = lib.colors[mode];

  let bg = lc[comp.containerType]?.bg || '#ffffff';
  let text = lc[comp.containerType]?.text || '#121212';
  let subtext = lc[comp.containerType]?.subtext || '#666666';
  let borderColor = 'transparent';
  let shadow = 'none';
  let hasBaseShaderBg = true;

  const v = comp.variant || 'filled';

  if (comp.type === 'button') {
    if      (v === 'filled')   { bg = lc.primary.bg;   text = lc.primary.text; hasBaseShaderBg = true; }
    else if (v === 'tonal')    { bg = lc.secondary.bg; text = lc.secondary.text; hasBaseShaderBg = true; }
    else if (v === 'elevated') { bg = mode === 'dark' ? '#211F26' : '#F7F2FA'; text = lc.primary.bg; shadow = '0px 1px 3px rgba(0,0,0,0.12)'; hasBaseShaderBg = true; }
    else if (v === 'outlined') { bg = 'transparent'; text = lc.primary.bg; borderColor = mode === 'dark' ? 'rgba(255,255,255,0.24)' : 'rgba(0,0,0,0.24)'; hasBaseShaderBg = false; }
    else if (v === 'text')     { bg = 'transparent'; text = lc.primary.bg; hasBaseShaderBg = false; }
  }
  else if (comp.type === 'card') {
    if      (v === 'elevated') { bg = lc.surface.bg; text = lc.surface.text; subtext = lc.surface.subtext; shadow = '0px 1px 5px rgba(0,0,0,0.15)'; }
    else if (v === 'filled')   { bg = lc.secondary.bg; text = lc.secondary.text; subtext = lc.secondary.subtext; }
    else if (v === 'outlined') { bg = lc.surface.bg; text = lc.surface.text; subtext = lc.surface.subtext; borderColor = mode === 'dark' ? 'rgba(255,255,255,0.24)' : 'rgba(0,0,0,0.24)'; hasBaseShaderBg = false; }
  }
  else if (comp.type === 'chip') {
    if      (v === 'assist')   { bg = 'transparent'; text = lc.primary.bg; borderColor = mode === 'dark' ? 'rgba(255,255,255,0.24)' : 'rgba(0,0,0,0.24)'; hasBaseShaderBg = false; }
    else if (v === 'filled')   { bg = lc.secondary.bg; text = lc.secondary.text; }
    else if (v === 'elevated') { bg = lc.surface.bg; text = lc.surface.text; shadow = '0px 1px 2px rgba(0,0,0,0.1)'; }
  }
  else if (comp.type === 'fab') {
    if      (v === 'primary')   { bg = lc.primary.bg;   text = lc.primary.text;   shadow = '0px 3px 6px rgba(0,0,0,0.15)'; }
    else if (v === 'secondary') { bg = lc.secondary.bg; text = lc.secondary.text; shadow = '0px 3px 6px rgba(0,0,0,0.15)'; }
    else if (v === 'surface')   { bg = lc.surface.bg;   text = lc.primary.bg;     shadow = '0px 3px 6px rgba(0,0,0,0.15)'; }
  }
  else if (comp.type === 'dialog') {
    bg = lc.surface.bg; text = lc.surface.text; subtext = lc.surface.subtext;
    shadow = '0px 24px 38px rgba(0,0,0,0.3)';
    borderColor = v === 'alert' ? (mode === 'dark' ? 'rgba(244,67,54,0.3)' : 'rgba(244,67,54,0.5)') : 'transparent';
  }
  else if (comp.type === 'badge') {
    if (v === 'dot') { bg = mode === 'dark' ? '#F44336' : '#D11D12'; text = '#FFFFFF'; hasBaseShaderBg = false; }
    else { bg = lc.secondary.bg; text = lc.secondary.text; }
  }
  else if (comp.type === 'sheets') {
    bg = lc.surface.bg; text = lc.surface.text; subtext = lc.surface.subtext;
    shadow = '0px 16px 24px rgba(0,0,0,0.2)';
  }
  else if (comp.type === 'avatar') {
    bg = lc.primary.bg; text = lc.primary.text; shadow = '0px 2px 6px rgba(0,0,0,0.15)';
  }
  else if (comp.type === 'progress') {
    bg = 'transparent'; text = lc.primary.bg; hasBaseShaderBg = true;
  }

  return { bg, text, subtext, borderColor, shadow, hasBaseShaderBg };
}
