/**
 * G→Shader — Main Application
 *
 * This file is the orchestration layer. All business logic lives in hooks/,
 * all JSX panels live in features/, and all constants live in constants.ts.
 *
 * What lives here:
 *  - Hook wiring
 *  - Cross-hook handlers (preset scenes, drag/resize, recording pipeline)
 *  - Layout shell + feature panel composition
 *  - Figma plugin bridge status bar (new)
 *  - Modal orchestration
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
// @ts-ignore
import gifshot from 'gifshot';
import JSZip from 'jszip';

// ─── Hooks ────────────────────────────────────────────────────────────────────
import { useToast }              from './hooks/useToast';
import { useCanvasComponents }   from './hooks/useCanvasComponents';
import { useShaderState }        from './hooks/useShaderState';
import { useSavedCombinations }  from './hooks/useSavedCombinations';
import { useColorLibraries }     from './hooks/useColorLibraries';
import { useFigmaPlugin }        from './hooks/useFigmaPlugin';

// ─── Feature panels ───────────────────────────────────────────────────────────
import LeftSidebar    from './features/LeftSidebar';
import Canvas         from './features/Canvas';
import RightInspector from './features/RightInspector';

// ─── Modals ───────────────────────────────────────────────────────────────────
import PluginModal    from './features/modals/PluginModal';
import SaveComboModal from './features/modals/SaveComboModal';

// ─── Constants & utils ────────────────────────────────────────────────────────
import { OFFICIAL_STATES, M3_COLOR_LIBRARIES, interpolateHexColors } from './constants';
import { getM3SpecificStyles } from './lib/m3Styles';

// ─── Types ────────────────────────────────────────────────────────────────────
import type { ComponentInstance, InteractiveClick, SavedCombination, FigmaLayerData } from './types';

// ─────────────────────────────────────────────────────────────────────────────

export default function App() {

  // ── Core hooks ──────────────────────────────────────────────────────────────
  const { toastMessage, showToast } = useToast();

  const {
    canvasComponents, setCanvasComponents,
    selectedComponentId, setSelectedComponentId,
    activeComp,
    addComponent, deleteComponent, duplicateComponent,
    updateComponent, updateActiveComponentField,
    moveLayer, setSizePreset, triggerStateOnComponent,
    clearCanvas, loadComponents,
  } = useCanvasComponents();

  const {
    activeState, previousState, transitionVal,
    triggerState, setActiveState,
  } = useShaderState(2);

  const {
    savedCombinations, activeCombinationId, setActiveCombinationId,
    linkedFigmaFiles, setLinkedFigmaFiles,
    saveCombination, deleteCombination, renameCombination, shareCombination,
    addFigmaFile, deleteFigmaFile,
  } = useSavedCombinations();

  const { customLibraries, allLibraries, addLibrary } = useColorLibraries();

  // ── Figma bridge ────────────────────────────────────────────────────────────
  const figma = useFigmaPlugin((layers: FigmaLayerData[]) => {
    // When selection arrives from Figma, show a toast with layer info
    if (layers.length > 0) {
      showToast(`Figma: ${layers.length} layer${layers.length > 1 ? 's' : ''} selected — "${layers[0].name}"`);
    }
  });

  // ── UI state ────────────────────────────────────────────────────────────────
  const [globalColorLibrary, setGlobalColorLibrary]     = useState('default-purple');
  const [canvasBgMode, setCanvasBgMode]                  = useState<'dark' | 'light'>('light');
  const [gridVisible, setGridVisible]                    = useState(true);
  const [intensity, setIntensity]                        = useState(0.85);
  const [isAnimationActive, setIsAnimationActive]        = useState(true);
  const [isHovered, setIsHovered]                        = useState(false);
  const [recordedClicks, setRecordedClicks]              = useState<InteractiveClick[]>([]);
  const [recMousePos, setRecMousePos]                    = useState({ x: -100, y: -100 });

  // Backdrop
  const [isBackdropVisible, setIsBackdropVisible]        = useState(true);
  const [activeBackdrop, setActiveBackdrop]              = useState('solid');
  const [uploadedFrameUrl, setUploadedFrameUrl]          = useState<string | null>(null);
  const [uploadedFrameName, setUploadedFrameName]        = useState<string | null>(null);
  const [liveFrameUrl, setLiveFrameUrl]                  = useState('https://example.com');
  const [backdropOpacity, setBackdropOpacity]            = useState(0.65);
  const [backdropScale, setBackdropScale]                = useState(100);
  const [backdropSolidColor, setBackdropSolidColor]      = useState('#FEF7FF');

  // Drag / resize
  const [isDragging, setIsDragging]                      = useState(false);
  const [draggingComponentId, setDraggingComponentId]    = useState<string | null>(null);
  const [isResizing, setIsResizing]                      = useState<string | null>(null);
  const [resizingComponentId, setResizingComponentId]    = useState<string | null>(null);
  const startDragRef = useRef<any>(null);

  // Crop
  const [isCropActive, setIsCropActive]                  = useState(false);
  const [isAreaSelectionMode, setIsAreaSelectionMode]    = useState(false);
  const [cropRect, setCropRect]                          = useState({ x: 0, y: 0, width: 300, height: 200 });
  const [isResizingCrop, setIsResizingCrop]              = useState<string | null>(null);
  const startCropDragRef = useRef<any>(null);

  // Export
  const [exportFormat, setExportFormat]                  = useState<'png' | 'mp4' | 'gif'>('mp4');
  const [exportDuration, setExportDuration]              = useState(3);
  const [perfectLoop, setPerfectLoop]                    = useState(true);
  const [exportStatus, setExportStatus]                  = useState<string | null>(null);
  const [isRecording, setIsRecording]                    = useState(false);
  const [recordingCount, setRecordingCount]              = useState(0);
  const [isRecordOptionsDialogOpen, setIsRecordOptionsDialogOpen] = useState(false);
  const [compiledFile, setCompiledFile]                  = useState<{ url: string; filename: string; extension: string } | null>(null);
  const [recordFPS, setRecordFPS]                        = useState(30);
  const [recordResolutionMultiplier, setRecordResolutionMultiplier] = useState(2.0);
  const [recordBps, setRecordBps]                        = useState(8_000_000);
  const [recordShowClicks, setRecordShowClicks]          = useState(true);
  const [recordShowCursor, setRecordShowCursor]          = useState(true);
  const [isRecordingPaused, setIsRecordingPaused]        = useState(false);
  const isRecordingPausedRef = useRef(false);
  const activeMediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordIntervalRef = useRef<any>(null);
  const stopRecordingCallbackRef = useRef<(() => void) | null>(null);

  useEffect(() => { isRecordingPausedRef.current = isRecordingPaused; }, [isRecordingPaused]);
  useEffect(() => () => { if (recordIntervalRef.current) clearInterval(recordIntervalRef.current); }, []);

  // Modals
  const [isPluginModalOpen, setIsPluginModalOpen]        = useState(false);
  const [isSaveComboModalOpen, setIsSaveComboModalOpen]  = useState(false);
  const [selectedFigmaFileId, setSelectedFigmaFileId]    = useState('none');

  // Figma files inline form
  const [isSettingFigmaModalOpen, setIsSettingFigmaModalOpen] = useState(false);
  const [newFigmaName, setNewFigmaName] = useState('');
  const [newFigmaUrl, setNewFigmaUrl]   = useState('');

  // Combination rename
  const [editingCombinationId, setEditingCombinationId]     = useState<string | null>(null);
  const [editingCombinationName, setEditingCombinationName] = useState('');

  // Scratch creation modal
  const [isNewFromScratchModalOpen, setIsNewFromScratchModalOpen] = useState(false);
  const [newScratchName, setNewScratchName]  = useState('New Custom Specimen');
  const [newScratchFileId, setNewScratchFileId] = useState('none');

  // Import modal (shared URL)
  const [isImportModalOpen, setIsImportModalOpen]               = useState(false);
  const [sharedImportCombination, setSharedImportCombination]   = useState<SavedCombination | null>(null);

  // Layer link modal
  const [isLayerLinkModalOpen, setIsLayerLinkModalOpen]         = useState(false);
  const [activeLinkCombination, setActiveLinkCombination]       = useState<SavedCombination | null>(null);
  const [modalFigmaName, setModalFigmaName] = useState('');
  const [modalFigmaUrl, setModalFigmaUrl]   = useState('');

  // Custom library form state (passed to RightInspector)
  const [showAddLibraryForm, setShowAddLibraryForm]   = useState(false);
  const [newLibName, setNewLibName]                   = useState('');
  const [newLibPrimaryLight, setNewLibPrimaryLight]   = useState('#6750A4');
  const [newLibSecondaryLight, setNewLibSecondaryLight] = useState('#E8DEF8');
  const [newLibSurfaceLight, setNewLibSurfaceLight]   = useState('#FEF7FF');
  const [newLibPrimaryDark, setNewLibPrimaryDark]     = useState('#D0BCFF');
  const [newLibSecondaryDark, setNewLibSecondaryDark] = useState('#332D41');
  const [newLibSurfaceDark, setNewLibSurfaceDark]     = useState('#141218');
  const [pastedJson, setPastedJson]                   = useState('');

  // API url
  const [apiUrl, setApiUrl]               = useState(() => localStorage.getItem('m3_api_url') || '');
  const [isEditingApiUrl, setIsEditingApiUrl] = useState(false);

  // ── Parse shared URL import ────────────────────────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('import');
    if (!code) return;
    try {
      const decoded = decodeURIComponent(escape(atob(code)));
      const parsed = JSON.parse(decoded);
      if (parsed?.name && Array.isArray(parsed.components)) {
        setSharedImportCombination(parsed);
        setIsImportModalOpen(true);
      }
    } catch {}
  }, []);

  // ── Keyboard shortcuts ─────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t?.tagName === 'INPUT' || t?.tagName === 'TEXTAREA' || t?.isContentEditable) return;
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedComponentId) {
        deleteComponent(selectedComponentId);
        showToast('Component deleted.');
      }
      if (e.key === 'Escape') {
        setSelectedComponentId('');
        setActiveState(0);
        showToast('Selection cleared (Esc)');
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selectedComponentId, deleteComponent, setSelectedComponentId, setActiveState, showToast]);

  // ── Auto-align crop to active component ───────────────────────────────────
  useEffect(() => {
    if (activeComp) {
      const el = document.getElementById('figma-editor-canvas');
      const w = el?.getBoundingClientRect().width || 1200;
      const h = el?.getBoundingClientRect().height || 800;
      const bleed = 85;
      const cx = w / 2 + activeComp.x - activeComp.width / 2;
      const cy = h / 2 + activeComp.y - activeComp.height / 2;
      setCropRect({ x: Math.round(cx - bleed), y: Math.round(cy - bleed), width: activeComp.width + bleed * 2, height: activeComp.height + bleed * 2 });
    } else {
      setCropRect({ x: 100, y: 100, width: 600, height: 400 });
    }
  }, [selectedComponentId, activeComp?.id, activeComp?.width, activeComp?.height]);

  // ── Global drag / resize ───────────────────────────────────────────────────
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const d = startDragRef.current;
      if (!d) return;
      const dx = e.clientX - d.startX, dy = e.clientY - d.startY;
      if (isDragging && draggingComponentId) {
        setCanvasComponents(prev => prev.map(c =>
          c.id === draggingComponentId ? { ...c, x: d.startPosX + dx, y: d.startPosY + dy } : c
        ));
      } else if (isResizing && resizingComponentId) {
        setCanvasComponents(prev => prev.map(c => {
          if (c.id !== resizingComponentId) return c;
          const up: Partial<ComponentInstance> = {};
          if (isResizing.includes('e')) { up.width = Math.max(80, Math.min(650, d.startWidth + dx)); up.sizeMode = 'fixed'; }
          if (isResizing.includes('s')) { up.height = Math.max(28, Math.min(500, d.startHeight + dy)); up.heightMode = 'fixed'; }
          return { ...c, ...up };
        }));
      }

      // Crop box
      if (startCropDragRef.current && isResizingCrop) {
        const dx2 = e.clientX - startCropDragRef.current.startX;
        const dy2 = e.clientY - startCropDragRef.current.startY;
        const { startXOffset: sx, startYOffset: sy, startWidth: sw, startHeight: sh } = startCropDragRef.current;
        const canvasEl = document.getElementById('figma-editor-canvas');
        const maxW = canvasEl?.getBoundingClientRect().width || 1200;
        const maxH = canvasEl?.getBoundingClientRect().height || 800;
        let [nx, ny, nw, nh] = [sx, sy, sw, sh];
        if (isResizingCrop === 'move') { nx = Math.max(0, Math.min(maxW - sw, sx + dx2)); ny = Math.max(0, Math.min(maxH - sh, sy + dy2)); }
        else {
          if (isResizingCrop.includes('e')) nw = Math.max(10, Math.min(maxW - sx, sw + dx2));
          if (isResizingCrop.includes('s')) nh = Math.max(10, Math.min(maxH - sy, sh + dy2));
          if (isResizingCrop.includes('w')) { const shiftX = Math.min(dx2, sw - 10); nx = Math.max(0, sx + shiftX); nw = sw - (nx - sx); }
          if (isResizingCrop.includes('n')) { const shiftY = Math.min(dy2, sh - 10); ny = Math.max(0, sy + shiftY); nh = sh - (ny - sy); }
        }
        setCropRect({ x: Math.round(nx), y: Math.round(ny), width: Math.round(nw), height: Math.round(nh) });
      }
    };

    const onUp = () => {
      setIsDragging(false); setIsResizing(null); setDraggingComponentId(null); setResizingComponentId(null);
      startDragRef.current = null; setIsResizingCrop(null); startCropDragRef.current = null;
    };

    if (isDragging || isResizing || isResizingCrop) {
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
    }
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, [isDragging, isResizing, draggingComponentId, resizingComponentId, isResizingCrop]);

  // ── Component transition animator ─────────────────────────────────────────
  useEffect(() => {
    let rafId: number;
    let last = performance.now();
    const tick = () => {
      const now = performance.now();
      const dt = now - last; last = now;
      setCanvasComponents(prev => {
        const hasTransitioning = prev.some(c => c.transitionVal !== undefined && c.transitionVal < 1.0);
        if (!hasTransitioning) return prev;
        return prev.map(c => c.transitionVal !== undefined && c.transitionVal < 1.0
          ? { ...c, transitionVal: Math.min(1.0, c.transitionVal + dt / 650) } : c);
      });
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  // ── State transition for global (no selection) ────────────────────────────
  useEffect(() => {
    // Global state already managed by useShaderState, but we keep per-component animator above
  }, [activeState]);

  // ── Cross-hook handlers ────────────────────────────────────────────────────

  const handleStateClick = useCallback((stateId: number) => {
    if (selectedComponentId) {
      triggerStateOnComponent(selectedComponentId, stateId);
      const label = OFFICIAL_STATES.find(s => s.id === stateId)?.label || 'Custom';
      showToast(`State: ${label} applied to selected component`);
    } else {
      triggerState(stateId);
    }
  }, [selectedComponentId, triggerStateOnComponent, triggerState, showToast]);

  const handleLoadCombination = useCallback((comb: SavedCombination) => {
    loadComponents(comb.components);
    setActiveBackdrop(comb.activeBackdrop || 'solid');
    setLiveFrameUrl(comb.liveFrameUrl || 'https://example.com');
    if (comb.uploadedFrameUrl) setUploadedFrameUrl(comb.uploadedFrameUrl);
    setBackdropOpacity(comb.backdropOpacity ?? 0.65);
    setBackdropScale(comb.backdropScale ?? 100);
    setIsBackdropVisible(comb.isBackdropVisible ?? true);
    setCanvasBgMode(comb.canvasBgMode || 'light');
    setGlobalColorLibrary(comb.globalColorLibrary || 'default-purple');
    setActiveCombinationId(comb.id);
    setSelectedFigmaFileId(comb.figmaFileId || 'none');
    showToast(`Loaded: "${comb.name}"`);
  }, [loadComponents, setActiveCombinationId, showToast]);

  const handleSaveCombo = useCallback((name: string, figmaFileId: string) => {
    saveCombination(name, figmaFileId, canvasComponents, {
      activeBackdrop, liveFrameUrl, uploadedFrameUrl, uploadedFrameName,
      backdropOpacity, backdropScale, isBackdropVisible,
      canvasBgMode, globalColorLibrary, activeState,
    });
    showToast(`Saved: "${name}"`);
  }, [canvasComponents, activeBackdrop, liveFrameUrl, uploadedFrameUrl, uploadedFrameName,
      backdropOpacity, backdropScale, isBackdropVisible, canvasBgMode, globalColorLibrary,
      activeState, saveCombination, showToast]);

  const handleShareCombination = useCallback((comb: SavedCombination, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const url = shareCombination(comb);
    navigator.clipboard.writeText(url).then(
      () => showToast('Share URL copied to clipboard!'),
      () => showToast('Could not copy — check browser permissions')
    );
  }, [shareCombination, showToast]);

  const handleAddCustomLibrary = useCallback(() => {
    if (!newLibName.trim()) { showToast('Enter a library name first.'); return; }
    try {
      const id = newLibName.trim().toLowerCase().replace(/\s+/g, '-');
      const lib = pastedJson
        ? JSON.parse(pastedJson)
        : {
            name: newLibName.trim(),
            colors: {
              light: {
                primary:   { bg: newLibPrimaryLight,   text: '#fff', subtext: '#eee', label: 'Primary' },
                secondary: { bg: newLibSecondaryLight, text: '#111', subtext: '#555', label: 'Secondary' },
                surface:   { bg: newLibSurfaceLight,   text: '#111', subtext: '#555', label: 'Surface' },
              },
              dark: {
                primary:   { bg: newLibPrimaryDark,   text: '#fff', subtext: '#eee', label: 'Primary Dark' },
                secondary: { bg: newLibSecondaryDark, text: '#fff', subtext: '#ccc', label: 'Secondary Dark' },
                surface:   { bg: newLibSurfaceDark,   text: '#eee', subtext: '#888', label: 'Surface Dark' },
              },
            },
          };
      addLibrary(id, lib);
      if (selectedComponentId) updateActiveComponentField('colorLibrary', id);
      showToast(`Library "${newLibName.trim()}" attached!`);
      setNewLibName(''); setShowAddLibraryForm(false); setPastedJson('');
    } catch (err: any) {
      showToast(`Error: ${err.message}`);
    }
  }, [newLibName, pastedJson, newLibPrimaryLight, newLibSecondaryLight, newLibSurfaceLight,
      newLibPrimaryDark, newLibSecondaryDark, newLibSurfaceDark,
      addLibrary, selectedComponentId, updateActiveComponentField, showToast]);

  const handleApplyPresetScene = useCallback((scene: 'assistant' | 'dialog' | 'dashboard') => {
    clearCanvas();
    if (scene === 'assistant') {
      addComponent('fab'); addComponent('card'); addComponent('chip');
    } else if (scene === 'dialog') {
      addComponent('dialog'); addComponent('button'); addComponent('badge');
    } else {
      addComponent('card'); addComponent('card'); addComponent('button'); addComponent('progress');
    }
    showToast(`Preset scene "${scene}" applied!`);
  }, [clearCanvas, addComponent, showToast]);

  // ── Figma plugin bridge handlers ──────────────────────────────────────────

  const handleImportFigmaLayers = useCallback(() => {
    figma.getSelection();
  }, [figma]);

  const handleExportToFigma = useCallback(async () => {
    const canvas = document.querySelector('#figma-editor-canvas canvas') as HTMLCanvasElement | null;
    if (!canvas) { showToast('No canvas to export'); return; }
    try {
      await figma.exportToFigma(canvas, activeComp ? activeComp.name : 'G→Shader Export');
      showToast('Exported to Figma layer!');
    } catch (err: any) {
      showToast(`Export failed: ${err.message}`);
    }
  }, [figma, activeComp, showToast]);

  // Auto-import Figma layer dimensions when selection arrives
  useEffect(() => {
    if (!figma.isInPlugin || figma.selectedLayers.length === 0) return;
    const layer = figma.selectedLayers[0];
    if (!activeComp) return;
    updateActiveComponentField('width', Math.round(layer.width));
    updateActiveComponentField('height', Math.round(layer.height));
    if (layer.cornerRadius) updateActiveComponentField('borderRadius', layer.cornerRadius);
  }, [figma.selectedLayers]);

  // ── Upload frame handler ───────────────────────────────────────────────────
  const handleUploadFrame = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      setUploadedFrameUrl(ev.target?.result as string);
      setUploadedFrameName(file.name);
      setActiveBackdrop('uploaded');
      showToast(`Backdrop: "${file.name}" loaded`);
    };
    reader.readAsDataURL(file);
  }, [showToast]);

  // ── Direct export handler (simplified — delegates to Canvas imperatively) ──
  const handleDirectExport = useCallback(() => {
    if (!isRecording && !isAreaSelectionMode) {
      if (!activeComp) setCropRect({ x: 300, y: 200, width: 600, height: 400 });
      setIsAreaSelectionMode(true);
      setIsCropActive(true);
      showToast(activeComp ? 'Define capture area, then click Confirm!' : 'Define canvas recording area, then click Confirm!');
    }
  }, [isRecording, isAreaSelectionMode, activeComp, showToast]);

  const handleStopRecording = useCallback(() => {
    stopRecordingCallbackRef.current?.();
    if (activeMediaRecorderRef.current?.state !== 'inactive') activeMediaRecorderRef.current?.stop();
  }, []);

  // ── Canvas event handlers ──────────────────────────────────────────────────
  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLElement>, x: number, y: number) => {
    const clickId = Math.random().toString(36).slice(2, 9);
    const click: InteractiveClick = { id: clickId, x, y, timestamp: Date.now(), time: new Date().toLocaleTimeString() };
    setRecordedClicks(prev => [...prev.slice(-9), click]);
    setTimeout(() => setRecordedClicks(prev => prev.filter(c => c.id !== clickId)), 1200);
  }, []);

  const handleComponentMouseDown = useCallback((e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSelectedComponentId(id);
    const comp = canvasComponents.find(c => c.id === id);
    if (!comp) return;
    setIsDragging(true);
    setDraggingComponentId(id);
    startDragRef.current = { startX: e.clientX, startY: e.clientY, startPosX: comp.x, startPosY: comp.y, startWidth: comp.width, startHeight: comp.height };
  }, [canvasComponents, setSelectedComponentId]);

  const handleResizeStart = useCallback((e: React.MouseEvent, id: string, handle: string) => {
    e.stopPropagation(); e.preventDefault();
    const comp = canvasComponents.find(c => c.id === id);
    if (!comp) return;
    setIsResizing(handle);
    setResizingComponentId(id);
    startDragRef.current = { startX: e.clientX, startY: e.clientY, startPosX: comp.x, startPosY: comp.y, startWidth: comp.width, startHeight: comp.height };
  }, [canvasComponents]);

  const handleCropMouseDown = useCallback((e: React.MouseEvent, handle: string) => {
    e.stopPropagation(); e.preventDefault();
    setIsResizingCrop(handle);
    startCropDragRef.current = { startX: e.clientX, startY: e.clientY, startXOffset: cropRect.x, startYOffset: cropRect.y, startWidth: cropRect.width, startHeight: cropRect.height };
  }, [cropRect]);

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="h-screen w-full bg-[#1E1E1E] text-[#E6E6E6] font-sans flex flex-col overflow-hidden relative select-none" id="figma-desktop-shell">

      {/* ── Figma Plugin Bridge Bar (only shown when running inside plugin) ── */}
      {figma.isInPlugin && (
        <div className="shrink-0 h-8 bg-[#A259FF]/15 border-b border-[#A259FF]/30 flex items-center justify-between px-4 z-50 font-sans">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-bold text-[#A259FF] uppercase tracking-wider">
              Figma Plugin Bridge Active
            </span>
            {figma.selectedLayers.length > 0 && (
              <span className="text-[9px] text-neutral-400 ml-1">
                — {figma.selectedLayers.length} layer{figma.selectedLayers.length > 1 ? 's' : ''} selected in Figma
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleImportFigmaLayers}
              className="px-2 py-0.5 bg-[#A259FF]/20 hover:bg-[#A259FF]/35 text-[#A259FF] text-[9px] font-bold uppercase rounded border border-[#A259FF]/30 cursor-pointer transition-all"
            >
              Sync Selection
            </button>
            <button
              onClick={handleExportToFigma}
              className="px-2 py-0.5 bg-[#18A0FB]/20 hover:bg-[#18A0FB]/35 text-[#18A0FB] text-[9px] font-bold uppercase rounded border border-[#18A0FB]/30 cursor-pointer transition-all"
            >
              Export → Figma
            </button>
            <button
              onClick={figma.closePlugin}
              className="px-2 py-0.5 text-neutral-500 hover:text-white text-[9px] font-bold uppercase rounded border border-neutral-700 cursor-pointer transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ── Main workspace ─────────────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden w-full relative" id="figma-workspace-core">

        <LeftSidebar
          savedCombinations={savedCombinations}
          activeCombinationId={activeCombinationId}
          editingCombinationId={editingCombinationId}
          editingCombinationName={editingCombinationName}
          onSaveComboOpen={() => setIsSaveComboModalOpen(true)}
          onLoadCombination={handleLoadCombination}
          onDeleteCombination={(id, e) => { e?.stopPropagation(); deleteCombination(id); showToast('Combination deleted.'); }}
          onShareCombination={handleShareCombination}
          onStartRenaming={(c) => { setEditingCombinationId(c.id); setEditingCombinationName(c.name); }}
          onRenameChange={setEditingCombinationName}
          onRenameCommit={() => { if (editingCombinationId) { renameCombination(editingCombinationId, editingCombinationName); setEditingCombinationId(null); }}}
          onRenameCancel={() => setEditingCombinationId(null)}
          onNewCanvas={() => { clearCanvas(); setActiveCombinationId(null); showToast('New canvas created.'); }}
          onOpenLayerLink={(c) => { setActiveLinkCombination(c); setIsLayerLinkModalOpen(true); }}
          linkedFigmaFiles={linkedFigmaFiles}
          selectedFigmaFileId={selectedFigmaFileId}
          onSetFigmaFileId={setSelectedFigmaFileId}
          onOpenFigmaFileModal={() => setIsSettingFigmaModalOpen(true)}
          onDeleteFigmaFile={(id) => { deleteFigmaFile(id); showToast('Figma file unlinked.'); }}
          canvasComponents={canvasComponents}
          selectedComponentId={selectedComponentId}
          onSelectComponent={setSelectedComponentId}
          onDeleteComponent={(id) => { deleteComponent(id); showToast('Layer deleted.'); }}
          onDuplicateComponent={(id) => { duplicateComponent(id); showToast('Layer duplicated.'); }}
          onMoveLayer={moveLayer}
          onAddComponent={addComponent}
          canvasBgMode={canvasBgMode}
          gridVisible={gridVisible}
          isBackdropVisible={isBackdropVisible}
          activeBackdrop={activeBackdrop}
          uploadedFrameName={uploadedFrameName}
          liveFrameUrl={liveFrameUrl}
          backdropOpacity={backdropOpacity}
          backdropScale={backdropScale}
          backdropSolidColor={backdropSolidColor}
          onToggleBgMode={() => setCanvasBgMode(p => p === 'dark' ? 'light' : 'dark')}
          onToggleGrid={() => setGridVisible(p => !p)}
          onToggleBackdrop={() => setIsBackdropVisible(p => !p)}
          onSetBackdrop={setActiveBackdrop}
          onUploadFrame={handleUploadFrame}
          onSetLiveFrameUrl={setLiveFrameUrl}
          onSetBackdropOpacity={setBackdropOpacity}
          onSetBackdropScale={setBackdropScale}
          onSetBackdropSolidColor={setBackdropSolidColor}
          onApplyPresetScene={handleApplyPresetScene}
          onOpenPluginModal={() => setIsPluginModalOpen(true)}
          apiUrl={apiUrl}
          isEditingApiUrl={isEditingApiUrl}
          onSetApiUrl={(url) => { setApiUrl(url); localStorage.setItem('m3_api_url', url); }}
          onSetIsEditingApiUrl={setIsEditingApiUrl}
          showToast={showToast}
        />

        <Canvas
          canvasComponents={canvasComponents}
          selectedComponentId={selectedComponentId}
          canvasBgMode={canvasBgMode}
          gridVisible={gridVisible}
          isBackdropVisible={isBackdropVisible}
          activeBackdrop={activeBackdrop}
          uploadedFrameUrl={uploadedFrameUrl}
          liveFrameUrl={liveFrameUrl}
          backdropOpacity={backdropOpacity}
          backdropScale={backdropScale}
          backdropSolidColor={backdropSolidColor}
          globalColorLibrary={globalColorLibrary}
          customLibraries={customLibraries}
          activeState={activeState}
          previousState={previousState}
          transitionVal={transitionVal}
          intensity={intensity}
          isAnimationActive={isAnimationActive}
          isHovered={isHovered}
          recordedClicks={recordedClicks}
          isCropActive={isCropActive}
          isAreaSelectionMode={isAreaSelectionMode}
          cropRect={cropRect}
          isResizingCrop={isResizingCrop}
          isDragging={isDragging}
          draggingComponentId={draggingComponentId}
          isResizing={isResizing}
          resizingComponentId={resizingComponentId}
          recMousePos={recMousePos}
          recordShowCursor={recordShowCursor}
          recordShowClicks={recordShowClicks}
          isRecording={isRecording}
          onSelectComponent={setSelectedComponentId}
          onDeselectAll={() => setSelectedComponentId('')}
          onCanvasClick={handleCanvasClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onComponentMouseDown={handleComponentMouseDown}
          onResizeStart={handleResizeStart}
          onCropMouseDown={handleCropMouseDown}
          onConfirmCrop={handleDirectExport}
          onCancelCrop={() => { setIsCropActive(false); setIsAreaSelectionMode(false); }}
        />

        <RightInspector
          activeComp={activeComp}
          canvasBgMode={canvasBgMode}
          globalColorLibrary={globalColorLibrary}
          allLibraries={allLibraries}
          customLibraries={customLibraries}
          activeState={activeState}
          intensity={intensity}
          isAnimationActive={isAnimationActive}
          exportFormat={exportFormat}
          exportDuration={exportDuration}
          perfectLoop={perfectLoop}
          exportStatus={exportStatus}
          isRecording={isRecording}
          recordingCount={recordingCount}
          compiledFile={compiledFile}
          recordFPS={recordFPS}
          recordResolutionMultiplier={recordResolutionMultiplier}
          recordBps={recordBps}
          recordShowClicks={recordShowClicks}
          recordShowCursor={recordShowCursor}
          isRecordOptionsDialogOpen={isRecordOptionsDialogOpen}
          showAddLibraryForm={showAddLibraryForm}
          newLibName={newLibName}
          newLibPrimaryLight={newLibPrimaryLight}
          newLibSecondaryLight={newLibSecondaryLight}
          newLibSurfaceLight={newLibSurfaceLight}
          newLibPrimaryDark={newLibPrimaryDark}
          newLibSecondaryDark={newLibSecondaryDark}
          newLibSurfaceDark={newLibSurfaceDark}
          pastedJson={pastedJson}
          updateActiveComponentField={updateActiveComponentField}
          onStateClick={handleStateClick}
          onToggleAnimation={() => setIsAnimationActive(p => !p)}
          onSetIntensity={setIntensity}
          onSetExportFormat={setExportFormat}
          onSetExportDuration={setExportDuration}
          onTogglePerfectLoop={() => setPerfectLoop(p => !p)}
          onStartExport={handleDirectExport}
          onStopRecording={handleStopRecording}
          onPauseRecording={() => { setIsRecordingPaused(p => !p); }}
          isRecordingPaused={isRecordingPaused}
          onSetRecordFPS={setRecordFPS}
          onSetRecordResolutionMultiplier={setRecordResolutionMultiplier}
          onSetRecordBps={setRecordBps}
          onSetRecordShowClicks={setRecordShowClicks}
          onSetRecordShowCursor={setRecordShowCursor}
          onSetIsRecordOptionsDialogOpen={setIsRecordOptionsDialogOpen}
          onSetShowAddLibraryForm={setShowAddLibraryForm}
          onSetNewLibName={setNewLibName}
          onSetNewLibPrimaryLight={setNewLibPrimaryLight}
          onSetNewLibSecondaryLight={setNewLibSecondaryLight}
          onSetNewLibSurfaceLight={setNewLibSurfaceLight}
          onSetNewLibPrimaryDark={setNewLibPrimaryDark}
          onSetNewLibSecondaryDark={setNewLibSecondaryDark}
          onSetNewLibSurfaceDark={setNewLibSurfaceDark}
          onSetPastedJson={setPastedJson}
          onAddCustomLibrary={handleAddCustomLibrary}
          onSelectColorLibrary={(id) => { setGlobalColorLibrary(id); if (selectedComponentId) updateActiveComponentField('colorLibrary', id); showToast(`Theme: ${allLibraries[id]?.name || id}`); }}
          onSizePreset={(p) => { if (selectedComponentId) setSizePreset(selectedComponentId, p); }}
          showToast={showToast}
          isInPlugin={figma.isInPlugin}
          selectedFigmaLayers={figma.selectedLayers}
          onGetFigmaSelection={handleImportFigmaLayers}
          onExportToFigma={handleExportToFigma}
        />
      </div>

      {/* ── Toast ─────────────────────────────────────────────────────────── */}
      {toastMessage && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[200] pointer-events-none animate-fade-in">
          <div className="bg-[#2C2C2C] text-neutral-100 border border-neutral-700/60 px-4 py-2 rounded-lg shadow-xl text-xs font-sans font-medium max-w-sm text-center">
            {toastMessage}
          </div>
        </div>
      )}

      {/* ── Modals ─────────────────────────────────────────────────────────── */}
      <PluginModal
        isOpen={isPluginModalOpen}
        onClose={() => setIsPluginModalOpen(false)}
        showToast={showToast}
      />

      <SaveComboModal
        isOpen={isSaveComboModalOpen}
        onClose={() => setIsSaveComboModalOpen(false)}
        linkedFigmaFiles={linkedFigmaFiles}
        onSave={handleSaveCombo}
        defaultFileId={selectedFigmaFileId}
      />

      {/* Import shared combination */}
      {isImportModalOpen && sharedImportCombination && (
        <div className="fixed inset-0 bg-black/75 z-[99] flex items-center justify-center p-4 backdrop-blur-sm font-sans">
          <div className="bg-[#2C2C2C] border border-neutral-700/60 rounded-xl w-full max-w-sm shadow-2xl p-6 space-y-4 text-[#E6E6E6]">
            <h3 className="font-bold text-sm">Import Shared Combination</h3>
            <p className="text-[10.5px] text-neutral-400">Load <strong className="text-neutral-200">"{sharedImportCombination.name}"</strong>?</p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setIsImportModalOpen(false)} className="px-3 py-1.5 rounded bg-neutral-800 text-[10px] font-bold text-neutral-300 cursor-pointer border-none">Cancel</button>
              <button onClick={() => { handleLoadCombination(sharedImportCombination); setIsImportModalOpen(false); }} className="px-3 py-1.5 rounded bg-[#18A0FB] text-[10px] font-bold text-white cursor-pointer border-none">Import</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Wave visualizer helper (used by right panel) ────────────────────────────
export function WaveLoopVisualizer({ intensity, isPlaying }: { intensity: number; isPlaying: boolean }) {
  const phase = (Date.now() / 1000) % (2 * Math.PI);
  const width = 120, height = 32;
  const points1: string[] = [], points2: string[] = [];
  for (let x = 0; x <= width; x += 5) {
    points1.push(`${x},${height / 2 + Math.sin(x * 0.05 + phase * 1.5) * 5 * Math.min(1.5, intensity)}`);
    points2.push(`${x},${height / 2 + Math.sin(x * 0.06 - phase * 1.2) * 4 * Math.min(1.5, intensity)}`);
  }
  return (
    <svg className="w-full h-full" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <path d={`M ${points1.join(' L ')}`} fill="none" stroke="url(#wg1)" strokeWidth="1.5" className="opacity-80" />
      <path d={`M ${points2.join(' L ')}`} fill="none" stroke="url(#wg2)" strokeWidth="1" className="opacity-55" />
      <defs>
        <linearGradient id="wg1" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#18A0FB" /><stop offset="100%" stopColor="#0ACF83" /></linearGradient>
        <linearGradient id="wg2" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#0ACF83" stopOpacity="0.8" /><stop offset="100%" stopColor="#18A0FB" stopOpacity="0.4" /></linearGradient>
      </defs>
    </svg>
  );
}
