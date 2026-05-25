import React from 'react';
import type { ComponentInstance } from '../types';
import { ChevronDown, ChevronUp, Plus, X, Save, Trash2 } from 'lucide-react';
import { OFFICIAL_STATES, M3_COLOR_LIBRARIES, M3_FONT_STYLES, M3_SIZE_PRESETS } from '../constants';

export interface RightInspectorProps {
  activeComp: ComponentInstance | undefined;
  canvasBgMode: 'dark' | 'light';
  globalColorLibrary: string;
  allLibraries: Record<string, any>;
  customLibraries: Record<string, any>;
  activeState: number;
  intensity: number;
  isAnimationActive: boolean;
  // Export
  exportFormat: 'png' | 'mp4' | 'gif';
  exportDuration: number;
  perfectLoop: boolean;
  exportStatus: string | null;
  isRecording: boolean;
  recordingCount: number;
  compiledFile: { url: string; filename: string; extension: string } | null;
  recordFPS: number;
  recordResolutionMultiplier: number;
  recordBps: number;
  recordShowClicks: boolean;
  recordShowCursor: boolean;
  isRecordOptionsDialogOpen: boolean;
  // Add custom library form
  showAddLibraryForm: boolean;
  newLibName: string;
  newLibPrimaryLight: string;
  newLibSecondaryLight: string;
  newLibSurfaceLight: string;
  newLibPrimaryDark: string;
  newLibSecondaryDark: string;
  newLibSurfaceDark: string;
  pastedJson: string;
  // Handlers
  updateActiveComponentField: (field: keyof ComponentInstance, value: any) => void;
  onStateClick: (id: number) => void;
  onToggleAnimation: () => void;
  onSetIntensity: (v: number) => void;
  onSetExportFormat: (f: 'png' | 'mp4' | 'gif') => void;
  onSetExportDuration: (v: number) => void;
  onTogglePerfectLoop: () => void;
  onStartExport: () => void;
  onStopRecording: () => void;
  onPauseRecording: () => void;
  isRecordingPaused: boolean;
  onSetRecordFPS: (v: number) => void;
  onSetRecordResolutionMultiplier: (v: number) => void;
  onSetRecordBps: (v: number) => void;
  onSetRecordShowClicks: (v: boolean) => void;
  onSetRecordShowCursor: (v: boolean) => void;
  onSetIsRecordOptionsDialogOpen: (v: boolean) => void;
  onSetShowAddLibraryForm: (v: boolean) => void;
  onSetNewLibName: (v: string) => void;
  onSetNewLibPrimaryLight: (v: string) => void;
  onSetNewLibSecondaryLight: (v: string) => void;
  onSetNewLibSurfaceLight: (v: string) => void;
  onSetNewLibPrimaryDark: (v: string) => void;
  onSetNewLibSecondaryDark: (v: string) => void;
  onSetNewLibSurfaceDark: (v: string) => void;
  onSetPastedJson: (v: string) => void;
  onAddCustomLibrary: () => void;
  onSelectColorLibrary: (id: string) => void;
  onSizePreset: (preset: ComponentInstance['sizePreset']) => void;
  showToast: (msg: string) => void;
  // Figma plugin bridge
  isInPlugin?: boolean;
  selectedFigmaLayers?: Array<{ id: string; name: string; width: number; height: number; cornerRadius: number }>;
  onGetFigmaSelection?: () => void;
  onExportToFigma?: () => void;
}

export default function RightInspector(props: RightInspectorProps) {
  const {
    activeComp, canvasBgMode, globalColorLibrary, allLibraries, customLibraries,
    activeState, intensity, isAnimationActive,
    exportFormat, exportDuration, perfectLoop, exportStatus, isRecording,
    recordingCount, compiledFile, recordFPS, recordResolutionMultiplier, recordBps,
    recordShowClicks, recordShowCursor, isRecordOptionsDialogOpen,
    showAddLibraryForm, newLibName, newLibPrimaryLight, newLibSecondaryLight, newLibSurfaceLight,
    newLibPrimaryDark, newLibSecondaryDark, newLibSurfaceDark, pastedJson,
    updateActiveComponentField, onStateClick, onToggleAnimation, onSetIntensity,
    onSetExportFormat, onSetExportDuration, onTogglePerfectLoop,
    onStartExport, onStopRecording, onPauseRecording, isRecordingPaused,
    onSetRecordFPS, onSetRecordResolutionMultiplier, onSetRecordBps,
    onSetRecordShowClicks, onSetRecordShowCursor, onSetIsRecordOptionsDialogOpen,
    onSetShowAddLibraryForm, onSetNewLibName,
    onSetNewLibPrimaryLight, onSetNewLibSecondaryLight, onSetNewLibSurfaceLight,
    onSetNewLibPrimaryDark, onSetNewLibSecondaryDark, onSetNewLibSurfaceDark,
    onSetPastedJson, onAddCustomLibrary, onSelectColorLibrary, onSizePreset,
    showToast,
    isInPlugin, selectedFigmaLayers, onGetFigmaSelection, onExportToFigma,
  } = props;

  return (
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

  );
}
