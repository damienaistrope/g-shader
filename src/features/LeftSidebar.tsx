import React from 'react';
import type { ComponentInstance, LinkedFigmaFile, SavedCombination } from '../types';
import { Plus, Save, Share2, Trash2, Copy, ExternalLink, Link2, Pencil, Check, X, FolderHeart, ChevronDown, ChevronUp, Sun, Moon, Grid, RotateCcw, Upload, Image as ImageIcon, Layers, Move, Download, SlidersHorizontal, Sparkle, Brain, MessageSquare, Volume2, Sparkles, Activity } from 'lucide-react';

// ─── Props ───────────────────────────────────────────────────────────────────

export interface LeftSidebarProps {
  // Combinations
  savedCombinations: SavedCombination[];
  activeCombinationId: string | null;
  editingCombinationId: string | null;
  editingCombinationName: string;
  onSaveComboOpen: () => void;
  onLoadCombination: (c: SavedCombination) => void;
  onDeleteCombination: (id: string, e?: React.MouseEvent) => void;
  onShareCombination: (c: SavedCombination, e?: React.MouseEvent) => void;
  onStartRenaming: (c: SavedCombination) => void;
  onRenameChange: (name: string) => void;
  onRenameCommit: () => void;
  onRenameCancel: () => void;
  onNewCanvas: () => void;
  onOpenLayerLink: (c: SavedCombination) => void;

  // Figma files
  linkedFigmaFiles: LinkedFigmaFile[];
  selectedFigmaFileId: string;
  onSetFigmaFileId: (id: string) => void;
  onOpenFigmaFileModal: () => void;
  onDeleteFigmaFile: (id: string) => void;

  // Canvas / layers
  canvasComponents: ComponentInstance[];
  selectedComponentId: string;
  onSelectComponent: (id: string) => void;
  onDeleteComponent: (id: string) => void;
  onDuplicateComponent: (id: string) => void;
  onMoveLayer: (id: string, dir: 'up' | 'down') => void;
  onAddComponent: (type: ComponentInstance['type']) => void;

  // Backdrop controls
  canvasBgMode: 'dark' | 'light';
  gridVisible: boolean;
  isBackdropVisible: boolean;
  activeBackdrop: string;
  uploadedFrameName: string | null;
  liveFrameUrl: string;
  backdropOpacity: number;
  backdropScale: number;
  backdropSolidColor: string;
  onToggleBgMode: () => void;
  onToggleGrid: () => void;
  onToggleBackdrop: () => void;
  onSetBackdrop: (type: string) => void;
  onUploadFrame: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSetLiveFrameUrl: (url: string) => void;
  onSetBackdropOpacity: (v: number) => void;
  onSetBackdropScale: (v: number) => void;
  onSetBackdropSolidColor: (color: string) => void;

  // Preset scenes
  onApplyPresetScene: (scene: 'assistant' | 'dialog' | 'dashboard') => void;

  // Plugin
  onOpenPluginModal: () => void;

  // API ref
  apiUrl: string;
  isEditingApiUrl: boolean;
  onSetApiUrl: (url: string) => void;
  onSetIsEditingApiUrl: (v: boolean) => void;

  showToast: (msg: string) => void;
}

// ─── Component ───────────────────────────────────────────────────────────────

const LAYER_ICONS: Record<string, string> = {
  card: 'crop_landscape', button: 'smart_button', chip: 'label',
  fab: 'add_circle', dialog: 'chat_bubble', badge: 'circle_notifications',
  sheets: 'bottom_panel_open', avatar: 'account_circle', progress: 'linear_progress',
};

const SPECIMEN_TYPES: Array<{ type: ComponentInstance['type']; label: string; icon: string }> = [
  { type: 'card',     label: 'Card',     icon: 'crop_landscape' },
  { type: 'button',   label: 'Button',   icon: 'smart_button' },
  { type: 'chip',     label: 'Chip',     icon: 'label' },
  { type: 'fab',      label: 'FAB',      icon: 'add_circle' },
  { type: 'dialog',   label: 'Dialog',   icon: 'chat_bubble' },
  { type: 'badge',    label: 'Badge',    icon: 'circle_notifications' },
  { type: 'sheets',   label: 'Sheet',    icon: 'bottom_panel_open' },
  { type: 'avatar',   label: 'Avatar',   icon: 'account_circle' },
  { type: 'progress', label: 'Progress', icon: 'linear_progress' },
];

const PRESET_SCENES = [
  { id: 'assistant' as const, label: 'Voice Assistant', icon: 'smart_toy' },
  { id: 'dialog'    as const, label: 'Dialog Prompt',   icon: 'chat_bubble' },
  { id: 'dashboard' as const, label: 'Dashboard',       icon: 'dashboard' },
];

export default function LeftSidebar({
  savedCombinations, activeCombinationId, editingCombinationId,
  editingCombinationName, onSaveComboOpen, onLoadCombination,
  onDeleteCombination, onShareCombination, onStartRenaming,
  onRenameChange, onRenameCommit, onRenameCancel, onNewCanvas, onOpenLayerLink,
  linkedFigmaFiles, selectedFigmaFileId, onSetFigmaFileId, onOpenFigmaFileModal, onDeleteFigmaFile,
  canvasComponents, selectedComponentId, onSelectComponent, onDeleteComponent,
  onDuplicateComponent, onMoveLayer, onAddComponent,
  canvasBgMode, gridVisible, isBackdropVisible, activeBackdrop,
  uploadedFrameName, liveFrameUrl, backdropOpacity, backdropScale, backdropSolidColor,
  onToggleBgMode, onToggleGrid, onToggleBackdrop, onSetBackdrop,
  onUploadFrame, onSetLiveFrameUrl, onSetBackdropOpacity, onSetBackdropScale, onSetBackdropSolidColor,
  onApplyPresetScene, onOpenPluginModal,
  apiUrl, isEditingApiUrl, onSetApiUrl, onSetIsEditingApiUrl,
  showToast,
}: LeftSidebarProps) {
  return (

const SPECIMEN_TYPES = [
  { type: 'card'     as const, label: 'Card',     icon: 'crop_landscape' },
  { type: 'button'   as const, label: 'Button',   icon: 'smart_button' },
  { type: 'chip'     as const, label: 'Chip',     icon: 'label' },
  { type: 'fab'      as const, label: 'FAB',      icon: 'add_circle' },
  { type: 'dialog'   as const, label: 'Dialog',   icon: 'chat_bubble' },
  { type: 'badge'    as const, label: 'Badge',    icon: 'circle_notifications' },
  { type: 'sheets'   as const, label: 'Sheet',    icon: 'bottom_panel_open' },
  { type: 'avatar'   as const, label: 'Avatar',   icon: 'account_circle' },
  { type: 'progress' as const, label: 'Progress', icon: 'linear_progress' },
];

export default function LeftSidebar(props: LeftSidebarProps) {
  const {
    savedCombinations, activeCombinationId, editingCombinationId, editingCombinationName,
    onSaveComboOpen, onLoadCombination, onDeleteCombination, onShareCombination,
    onStartRenaming, onRenameChange, onRenameCommit, onRenameCancel, onNewCanvas, onOpenLayerLink,
    linkedFigmaFiles, selectedFigmaFileId, onSetFigmaFileId, onOpenFigmaFileModal, onDeleteFigmaFile,
    canvasComponents, selectedComponentId, onSelectComponent, onDeleteComponent,
    onDuplicateComponent, onMoveLayer, onAddComponent,
    canvasBgMode, gridVisible, isBackdropVisible, activeBackdrop, uploadedFrameName, liveFrameUrl,
    backdropOpacity, backdropScale, backdropSolidColor,
    onToggleBgMode, onToggleGrid, onToggleBackdrop, onSetBackdrop,
    onUploadFrame, onSetLiveFrameUrl, onSetBackdropOpacity, onSetBackdropScale, onSetBackdropSolidColor,
    onApplyPresetScene, onOpenPluginModal,
    apiUrl, isEditingApiUrl, onSetApiUrl, onSetIsEditingApiUrl,
    showToast,
  } = props;

  return (
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
                          const lib = M3_COLOR_LIBRARIES[libKey] || M3_COLOR_LIBRARIES['default-purple'];
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
                        const lib = (customLibraries[libKey] || M3_COLOR_LIBRARIES[libKey]) || M3_COLOR_LIBRARIES['default-purple'];
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

  );
}
