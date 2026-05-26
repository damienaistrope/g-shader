import React from 'react';
import type { ComponentInstance, InteractiveClick } from '../types';
import ShaderRenderer from '../components/ShaderRenderer';
import { Button as M3Button } from '../components/Button/Button';
import { Card as M3Card, CardHeader as M3CardHeader, CardContent as M3CardContent, CardActions as M3CardActions } from '../components/Card/Card';
import { Chip as M3Chip } from '../components/Chips/Chip';
import { FAB as M3FAB } from '../components/Button/FAB';
import { Dialog as M3Dialog } from '../components/Dialog/Dialog';
import { Badge as M3Badge } from '../components/Badge/Badge';
import { BottomSheet as M3BottomSheet } from '../components/Sheets/Sheet';
import { Avatar as M3Avatar } from '../components/Avatar/Avatar';
import { LinearProgress as M3LinearProgress, CircularProgress as M3CircularProgress } from '../components/Progress/Progress';
import { OFFICIAL_STATES, M3_COLOR_LIBRARIES, M3_SIZE_PRESETS, M3_FONT_STYLES, interpolateHexColors } from '../constants';
import { getM3SpecificStyles } from '../lib/m3Styles';
import { MousePointer2, Focus, Move } from 'lucide-react';

export interface CanvasProps {
  canvasComponents: ComponentInstance[];
  selectedComponentId: string;
  canvasBgMode: 'dark' | 'light';
  gridVisible: boolean;
  isBackdropVisible: boolean;
  activeBackdrop: string;
  uploadedFrameUrl: string | null;
  liveFrameUrl: string;
  backdropOpacity: number;
  backdropScale: number;
  backdropSolidColor: string;
  globalColorLibrary: string;
  customLibraries: Record<string, any>;
  activeState: number;
  previousState: number;
  transitionVal: number;
  intensity: number;
  isAnimationActive: boolean;
  isHovered: boolean;
  recordedClicks: InteractiveClick[];
  isCropActive: boolean;
  isAreaSelectionMode: boolean;
  cropRect: { x: number; y: number; width: number; height: number };
  isResizingCrop: string | null;
  isDragging: boolean;
  draggingComponentId: string | null;
  isResizing: string | null;
  resizingComponentId: string | null;
  recMousePos: { x: number; y: number };
  recordShowCursor: boolean;
  recordShowClicks: boolean;
  isRecording: boolean;
  // Handlers
  onSelectComponent: (id: string) => void;
  onDeselectAll: () => void;
  onCanvasClick: (e: React.MouseEvent<HTMLElement>, x: number, y: number) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onComponentMouseDown: (e: React.MouseEvent, id: string) => void;
  onResizeStart: (e: React.MouseEvent, id: string, handle: string) => void;
  onCropMouseDown: (e: React.MouseEvent, handle: string) => void;
  onConfirmCrop: () => void;
  onCancelCrop: () => void;
}

export default function Canvas({
  canvasComponents, selectedComponentId, canvasBgMode, gridVisible,
  isBackdropVisible, activeBackdrop, uploadedFrameUrl, liveFrameUrl,
  backdropOpacity, backdropScale, backdropSolidColor,
  globalColorLibrary, customLibraries,
  activeState, previousState, transitionVal, intensity, isAnimationActive,
  isHovered, recordedClicks, isCropActive, isAreaSelectionMode, cropRect,
  isResizingCrop, isDragging, draggingComponentId, isResizing, resizingComponentId,
  recMousePos, recordShowCursor, recordShowClicks, isRecording,
  onSelectComponent, onDeselectAll, onCanvasClick,
  onMouseEnter, onMouseLeave, onComponentMouseDown, onResizeStart,
  onCropMouseDown, onConfirmCrop, onCancelCrop,
}: CanvasProps) {
  return (
    <>
         {/* CENTER CAMERA VIEWPORT: FIGMA EDITOR CANVAS */}
        <main 
          className={`flex-1 flex flex-col items-center justify-center relative p-8 transition-colors duration-300 overflow-hidden ${
            canvasBgMode === 'dark' ? 'bg-[#1E1E1E]' : 'bg-[#F4F4F6]'
          }`} 
          id="figma-editor-canvas"
          style={isBackdropVisible && activeBackdrop === 'solid' ? { backgroundColor: backdropSolidColor } : undefined}
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

                  const libKey = comp.colorLibrary || globalColorLibrary || 'default-purple';
                  const lib = (customLibraries[libKey] || M3_COLOR_LIBRARIES[libKey]) || M3_COLOR_LIBRARIES['default-purple'];
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
                      className={`absolute pointer-events-auto cursor-grab active:cursor-grabbing group/comp transition-[filter,box-shadow] duration-300 ${
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
                        borderRadius: comp.type === 'avatar' ? '50%' : `${comp.borderRadius}px`,
                        boxShadow: dynamicGlow,
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

                  {/* Dynamic organic ambient backdrop representing energy-derived motion blur, custom-modulated */}
                  {isStateBlurred && (
                    <div 
                      className="absolute pointer-events-none transition-all duration-300"
                      style={{
                        left: '-100px',
                        top: '-100px',
                        width: 'calc(100% + 200px)',
                        height: 'calc(100% + 200px)',
                        maxWidth: 'none',
                        filter: `blur(${intensity * 32 + 18}px) saturate(1.8) opacity(0.85)`,
                        zIndex: -1
                      }}
                    >
                      <ShaderRenderer
                        canvasId={`canvas-bg-for-${comp.id}`}
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
                        renderMode={1}
                        intensity={intensity}
                        isActive={isAnimationActive}
                      />
                    </div>
                  )}

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
                        backgroundColor: (isElementSpecimen && compState === 0) ? 'transparent' : compBgColor,
                        filter: (isBoundaryWarped && isAnimationActive) ? 'url(#m3-energy-warp-filter)' : 'none',
                        boxShadow: (isElementSpecimen && compState === 0)
                          ? 'none'
                          : isStateBlurred && isAnimationActive
                          ? `0 0 ${intensity * 12 + 6}px ${statusGlowColor}, inset 0 0 ${intensity * 6 + 2}px ${statusGlowColor}`
                          : compShadow,
                        border: (isElementSpecimen && compState === 0)
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
                            zIndex: 0
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
                        0% {
                          transform: scale(0.4);
                          opacity: 1;
                        }
                        100% {
                          transform: scale(2.4);
                          opacity: 0;
                        }
                      }
                      .click-ripple-animate {
                        animation: clickRippleAnimation 0.9s cubic-bezier(0.1, 0.8, 0.25, 1) forwards;
                      }
                    `}</style>



                    {/* =========================================================
                        PRECISE CLEAN MATERIAL 3 COMPONENT SPECIMEN
                        ========================================================= */}
                    <div 
                      className="relative w-full h-full z-10 flex flex-col pointer-events-auto shrink-0 grow justify-center"
                      onMouseDown={(e) => handleSpecimenClick(e, comp.id)}
                    >
                      {/* SPECIMEN: BUTTON */}
                      {comp.type === 'button' && (
                        <div className="w-full h-full flex items-center justify-center" style={{ borderRadius: 'inherit' }}>
                          <M3Button 
                            variant={(comp.variant as any) || 'filled'}
                            size={comp.sizePreset === 'xsmall' ? 'xs' : comp.sizePreset === 'small' ? 's' : comp.sizePreset === 'medium' ? 'm' : comp.sizePreset === 'large' ? 'l' : 'xl'}
                            onClick={handleButtonClick}
                            icon={comp.configShowIcon ? <span className="material-symbols-outlined select-none" style={{ fontSize: 'inherit' }}>{localIcon}</span> : undefined}
                            className="pointer-events-auto w-full h-full justify-center items-center"
                            style={{ 
                              color: compTextColor,
                              width: '100%',
                              height: '100%',
                              backgroundColor: compState !== 0 ? 'transparent' : compBgColor,
                              border: compState !== 0 ? 'none' : compBorderColor !== 'transparent' ? `1px solid ${compBorderColor}` : undefined,
                              boxShadow: compState !== 0 ? 'none' : compShadow,
                              borderRadius: 'inherit'
                            }}
                          >
                            <span 
                              contentEditable
                              suppressContentEditableWarning
                              onMouseDown={(e) => e.stopPropagation()}
                              onBlur={(e) => updateComponentField(comp.id, 'text', e.currentTarget.innerText)}
                              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); } }}
                              className="cursor-text hover:bg-white/5 px-1 rounded outline-none transition-colors inline-block"
                            >
                              {comp.text}
                            </span>
                          </M3Button>
                        </div>
                      )}

                      {/* SPECIMEN: CARD */}
                      {comp.type === 'card' && (
                        <M3Card 
                          variant={(comp.variant as any) || 'elevated'}
                          layout={comp.layout || 'vertical'}
                          className="w-full h-full bg-transparent! shadow-none! border-none! flex"
                          style={{
                            flexDirection: (comp.layout || 'vertical') === 'horizontal' ? 'row' : 'column',
                            justifyContent: 'space-between'
                          }}
                        >
                          {(comp.layout || 'vertical') === 'vertical' ? (
                            <>
                              {/* Vertical Card Structure */}
                              <div className="flex flex-col">
                                {(comp.configShowIcon || comp.configShowTitle || comp.configShowSubtitle) && (
                                  <M3CardHeader
                                    avatar={comp.configShowIcon ? (
                                      <div 
                                        className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 border border-white/10 shadow-sm select-none relative overflow-hidden"
                                        style={{ backgroundColor: comp.iconBgColor || 'rgba(0,0,0,0.15)' }}
                                      >
                                        {((comp.avatarType || (comp.iconImage ? 'image' : 'icon')) === 'image' && comp.iconImage) ? (
                                          <img referrerPolicy="no-referrer" src={comp.iconImage} className="w-full h-full object-cover" alt="Avatar" />
                                        ) : (comp.avatarType || 'icon') === 'initials' ? (
                                          <span className="text-[12px] font-sans font-bold text-white uppercase select-none leading-none tracking-wide">
                                            {comp.avatarInitials || (comp.title ? comp.title.slice(0, 2).toUpperCase() : 'AV')}
                                          </span>
                                        ) : (
                                          <span className="material-symbols-outlined text-[20px] leading-none text-white opacity-90">{localIcon}</span>
                                        )}
                                      </div>
                                    ) : undefined}
                                    header={comp.configShowTitle ? (
                                      <span 
                                        contentEditable
                                        suppressContentEditableWarning
                                        onMouseDown={(e) => e.stopPropagation()}
                                        onBlur={(e) => updateComponentField(comp.id, 'title', e.currentTarget.innerText)}
                                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); } }}
                                        className={`${titleFont.class} truncate hover:bg-white/5 cursor-text px-1 rounded outline-none transition-colors inline-block`} 
                                        style={{ color: compTextColor }}
                                      >
                                        {comp.title}
                                      </span>
                                    ) : undefined}
                                    subhead={comp.configShowSubtitle ? (
                                      <span 
                                        contentEditable
                                        suppressContentEditableWarning
                                        onMouseDown={(e) => e.stopPropagation()}
                                        onBlur={(e) => updateComponentField(comp.id, 'subtitle', e.currentTarget.innerText)}
                                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); } }}
                                        className={`${M3_FONT_STYLES.bodySmall.class} truncate hover:bg-white/5 cursor-text px-1 rounded outline-none transition-colors inline-block`} 
                                        style={{ color: compSubtextColor }}
                                      >
                                        {comp.subtitle}
                                      </span>
                                    ) : undefined}
                                    action={
                                      <div className="text-neutral-400 hover:text-neutral-250 p-1 cursor-pointer hover:bg-white/5 rounded-full">
                                        <span className="material-symbols-outlined select-none" style={{ fontSize: '18px' }}>more_vert</span>
                                      </div>
                                    }
                                  />
                                )}
                                
                                {/* Large Media Block in Vertical card */}
                                <M3CardMedia className="h-32 bg-neutral-200/5 dark:bg-neutral-800/40 relative overflow-hidden flex items-center justify-center border-y border-neutral-800/10 dark:border-white/5">
                                  <span className="material-symbols-outlined text-[28px] opacity-25 text-neutral-400">image</span>
                                </M3CardMedia>
 
                                {comp.configShowDescription && (
                                  <M3CardContent className="flex-1 min-h-0 py-3.5 px-4 select-text">
                                    <div className="text-[14px] font-bold font-sans mb-1" style={{ color: compTextColor }}>
                                      {comp.variant ? comp.variant.charAt(0).toUpperCase() + comp.variant.slice(1) : 'Outlined'} Card
                                    </div>
                                    <div className="text-[11px] font-sans mb-2.5" style={{ color: compSubtextColor }}>Material 3 • Today</div>
                                    <p 
                                      contentEditable
                                      suppressContentEditableWarning
                                      onMouseDown={(e) => e.stopPropagation()}
                                      onBlur={(e) => updateComponentField(comp.id, 'text', e.currentTarget.innerText)}
                                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); } }}
                                      className={`${descFont.class} ${comp.heightMode === 'auto' ? '' : 'line-clamp-3'} leading-relaxed hover:bg-white/5 cursor-text px-1 rounded outline-none transition-colors`} 
                                      style={{ color: compTextColor }}
                                    >
                                      {comp.text}
                                    </p>
                                  </M3CardContent>
                                )}
                              </div>

                              {comp.configShowActions && (
                                <M3CardActions>
                                  <div className="flex justify-end items-center gap-2 shrink-0 pt-2 border-t border-white/5 select-none w-full px-4 pb-4">
                                    <M3Button 
                                      variant="outlined" 
                                      size="s"
                                      className="rounded-full"
                                      style={{ color: libColors.primary.bg, borderColor: libColors.primary.bg }}
                                    >
                                      Secondary
                                    </M3Button>
                                    <M3Button 
                                      variant="filled" 
                                      size="s"
                                      className="rounded-full"
                                      style={{ backgroundColor: libColors.primary.bg, color: libColors.primary.text }}
                                    >
                                      Action
                                    </M3Button>
                                  </div>
                                </M3CardActions>
                              )}
                            </>
                          ) : (
                            <>
                              {/* Horizontal Card Structure per HORIZONTAL CARD SPECS */}
                              <div className="flex flex-row w-full h-full items-stretch justify-between">
                                <div className="flex-1 flex flex-col justify-between p-4 min-h-0 text-left">
                                  {(comp.configShowIcon || comp.configShowTitle || comp.configShowSubtitle) && (
                                    <div className="flex gap-3 items-center">
                                      {comp.configShowIcon && (
                                        <div 
                                          className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 border border-white/10 shadow-sm select-none relative overflow-hidden mb-1"
                                          style={{ backgroundColor: comp.iconBgColor || 'rgba(0,0,0,0.15)' }}
                                        >
                                          {((comp.avatarType || (comp.iconImage ? 'image' : 'icon')) === 'image' && comp.iconImage) ? (
                                            <img referrerPolicy="no-referrer" src={comp.iconImage} className="w-full h-full object-cover" alt="Avatar" />
                                          ) : (comp.avatarType || 'icon') === 'initials' ? (
                                            <span className="text-[12px] font-sans font-bold text-white uppercase select-none leading-none tracking-wide">
                                              {comp.avatarInitials || (comp.title ? comp.title.slice(0, 2).toUpperCase() : 'AV')}
                                            </span>
                                          ) : (
                                            <span className="material-symbols-outlined text-[20px] leading-none text-white opacity-90">{localIcon}</span>
                                          )}
                                        </div>
                                      )}
                                      <div className="flex flex-col">
                                        {comp.configShowTitle && (
                                          <span 
                                            contentEditable
                                            suppressContentEditableWarning
                                            onMouseDown={(e) => e.stopPropagation()}
                                            onBlur={(e) => updateComponentField(comp.id, 'title', e.currentTarget.innerText)}
                                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); } }}
                                            className={`${titleFont.class} truncate hover:bg-white/5 cursor-text px-1 rounded outline-none transition-colors inline-block`} 
                                            style={{ color: compTextColor }}
                                          >
                                            {comp.title}
                                          </span>
                                        )}
                                        {comp.configShowSubtitle && (
                                          <span 
                                            contentEditable
                                            suppressContentEditableWarning
                                            onMouseDown={(e) => e.stopPropagation()}
                                            onBlur={(e) => updateComponentField(comp.id, 'subtitle', e.currentTarget.innerText)}
                                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); } }}
                                            className={`${M3_FONT_STYLES.bodySmall.class} truncate hover:bg-white/5 cursor-text px-1 rounded outline-none transition-colors inline-block`} 
                                            style={{ color: compSubtextColor }}
                                          >
                                            {comp.subtitle}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  )}

                                  {comp.configShowDescription && (
                                    <div className="my-2 select-text">
                                      <p 
                                        contentEditable
                                        suppressContentEditableWarning
                                        onMouseDown={(e) => e.stopPropagation()}
                                        onBlur={(e) => updateComponentField(comp.id, 'text', e.currentTarget.innerText)}
                                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); } }}
                                        className="text-[11.5px] leading-relaxed text-neutral-500 dark:text-neutral-400 line-clamp-2 hover:bg-white/5 cursor-text px-1 rounded outline-none transition-colors"
                                        style={{ color: compTextColor }}
                                      >
                                        {comp.text}
                                      </p>
                                    </div>
                                  )}

                                  {comp.configShowActions && (
                                    <div className="flex justify-start items-center gap-2 select-none w-full mt-1">
                                      <M3Button variant="outlined" size="xs" style={{ color: libColors.primary.bg, borderColor: libColors.primary.bg }}>Secondary</M3Button>
                                      <M3Button variant="filled" size="xs" style={{ backgroundColor: libColors.primary.bg, color: libColors.primary.text }}>Action</M3Button>
                                    </div>
                                  )}
                                </div>

                                {/* Right Side Media Content aligned per Horizontal card spec */}
                                <M3CardMedia className="w-[110px] bg-neutral-250/20 dark:bg-neutral-800/60 flex shrink-0 items-center justify-center border-l border-neutral-800/10 dark:border-white/5">
                                  <span className="material-symbols-outlined text-[24px] opacity-25 text-neutral-400">image</span>
                                </M3CardMedia>
                              </div>
                            </>
                          )}
                        </M3Card>
                      )}

                      {/* SPECIMEN: CHIP */}
                      {comp.type === 'chip' && (
                        <div className="w-full h-full flex items-center justify-center" style={{ borderRadius: 'inherit' }}>
                          <M3Chip 
                            label=""
                            variant={(comp.variant as any) || 'assist'}
                            icon={comp.configShowIcon ? localIcon : undefined}
                            selected={comp.selectedState || compState === 2}
                            onRemove={comp.variant === 'input' ? (() => {}) : undefined}
                            className="pointer-events-auto w-full h-full justify-center items-center"
                            style={{
                              width: '100%',
                              height: '100%',
                              backgroundColor: compState !== 0 ? 'transparent' : compBgColor,
                              border: compState !== 0 ? 'none' : compBorderColor !== 'transparent' ? `1px solid ${compBorderColor}` : undefined,
                              boxShadow: compState !== 0 ? 'none' : undefined,
                              borderRadius: 'inherit',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: compTextColor
                            }}
                          >
                            <span 
                              contentEditable
                              suppressContentEditableWarning
                              onMouseDown={(e) => e.stopPropagation()}
                              onBlur={(e) => updateComponentField(comp.id, 'text', e.currentTarget.innerText)}
                              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); } }}
                              className="text-[12px] font-sans font-medium tracking-[0.0125em] hover:bg-white/5 cursor-text px-1 rounded outline-none transition-colors flex items-center justify-center text-center select-text leading-none"
                              style={{ color: compTextColor }}
                            >
                              {comp.text}
                            </span>
                          </M3Chip>
                        </div>
                      )}

                      {/* SPECIMEN: FAB  */}
                      {comp.type === 'fab' && (
                        <div className="w-full h-full flex items-center justify-center" style={{ borderRadius: 'inherit' }}>
                          <M3FAB 
                            icon={localIcon}
                            label={comp.sizePreset === 'xlarge' ? (comp.text || 'Extended FAB') : undefined}
                            variant={(comp.variant as any) || 'primary'}
                            size={comp.sizePreset === 'xlarge' ? 'extended' : comp.sizePreset === 'small' || comp.sizePreset === 'xsmall' ? 'small' : comp.sizePreset === 'large' ? 'large' : 'medium'}
                            onClick={handleButtonClick}
                            className="pointer-events-auto w-full h-full justify-center items-center"
                            style={{
                              width: '100%',
                              height: '100%',
                              backgroundColor: compState !== 0 ? 'transparent' : compBgColor,
                              color: compTextColor,
                              border: compState !== 0 ? 'none' : undefined,
                              boxShadow: compState !== 0 ? 'none' : undefined,
                              borderRadius: 'inherit',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          />
                        </div>
                      )}

                      {/* SPECIMEN: DIALOG */}
                      {comp.type === 'dialog' && (
                        <M3Dialog 
                          isOpen={true} 
                          onClose={() => {}} 
                          static={true}
                          className="w-full h-full bg-transparent! border-none! shadow-none!"
                          style={{
                            width: '100%',
                            height: '100%',
                            maxWidth: 'none',
                            maxHeight: 'none',
                            backgroundColor: 'transparent',
                            border: 'none',
                            boxShadow: 'none',
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
                              className="w-full h-full bg-transparent! border-none! shadow-none!"
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
                              className="w-full h-full bg-transparent! border-none! shadow-none!"
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
                      {comp.type === 'avatar' && (
                        <div className="w-full h-full flex items-center justify-center" style={{ borderRadius: 'inherit' }}>
                          <M3Avatar 
                            src={(comp.variant === 'image') ? (comp.iconImage || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop") : undefined}
                            initials={(comp.variant === 'initials' || !comp.variant) ? comp.text : undefined}
                            size={comp.sizePreset === 'xsmall' ? 'small' : comp.sizePreset === 'small' ? 'small' : comp.sizePreset === 'medium' ? 'medium' : 'large'}
                            className="w-full h-full rounded-full"
                            style={{
                              width: '100%',
                              height: '100%',
                              backgroundColor: 'transparent',
                              border: 'none',
                              boxShadow: 'none',
                              borderRadius: '50%'
                            }}
                          />
                        </div>
                      )}

                      {/* SPECIMEN: PROGRESS */}
                      {comp.type === 'progress' && (
                        <div className="w-full h-full flex flex-col items-center justify-center p-3" style={{ borderRadius: 'inherit' }}>
                          {comp.variant === 'circular' ? (
                            <M3CircularProgress 
                              indeterminate={true} 
                              variant={comp.sizePreset === 'large' || comp.sizePreset === 'xlarge' ? 'thick' : 'standard'} 
                              energyColorStart={compMidColor}
                              energyColorEnd={compEndColor}
                            />
                          ) : (
                            <div className="w-full">
                              <M3LinearProgress 
                                indeterminate={true} 
                                variant={comp.sizePreset === 'large' || comp.sizePreset === 'xlarge' ? 'thick' : 'standard'} 
                                energyColorStart={compMidColor}
                                energyColorEnd={compEndColor}
                              />
                            </div>
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
              <div className="flex items-center justify-between w-full max-w-[1400px] mx-auto gap-4">
                
                {/* 1. Motion */}
                <div className="flex flex-col justify-between h-12 items-start shrink-0">
                  <span className="text-[9.5px] font-sans uppercase text-neutral-450 font-bold tracking-wider leading-none">
                    Motion
                  </span>
                  <button
                    onClick={() => {
                      setIsAnimationActive(!isAnimationActive);
                      showToast(isAnimationActive ? "Motion paused." : "Motion resumed.");
                    }}
                    className={`h-[28px] w-24 px-3 rounded-md text-[9.5px] font-sans font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer border select-none transition-all ${
                      isAnimationActive 
                        ? 'bg-rose-500/15 text-rose-400 border-rose-500/20 hover:bg-rose-500/25' 
                        : 'bg-[#18A0FB]/15 text-[#18A0FB] border-[#18A0FB]/20 hover:bg-[#18A0FB]/25'
                    }`}
                  >
                    {isAnimationActive ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                    <span>{isAnimationActive ? 'Pause' : 'Play'}</span>
                  </button>
                </div>
  
                {/* 2. Speed */}
                <div className="flex flex-col justify-end h-12 items-start shrink-0 w-[190px]">
                  <div className="h-8 flex bg-[#1E1E1E] px-2.5 rounded-md border border-neutral-800 shrink-0 items-center w-full gap-2.5 select-none animate-fade-in">
                    <span className="text-[9.5px] font-sans uppercase text-neutral-450 font-bold tracking-wider leading-none shrink-0">
                      Speed
                    </span>
                    <input
                      type="range"
                      min="0.10"
                      max="1.50"
                      step="0.05"
                      value={intensity}
                      onChange={(e) => setIntensity(Number(e.target.value))}
                      className="flex-1 h-1 bg-neutral-800 rounded cursor-pointer accent-[#18A0FB]"
                      title="Adjust animation speed"
                    />
                    <span className="font-mono text-[9.5px] font-bold text-[#18A0FB] leading-none text-right shrink-0 min-w-[32px]">
                      {intensity.toFixed(2)}X
                    </span>
                  </div>
                </div>
  
                {/* 3. Loop */}
                <div className={`flex flex-col justify-between h-12 items-start transition-all duration-300 shrink-0 ${exportFormat === 'png' ? 'opacity-0 pointer-events-none' : ''}`}>
                  <span className="text-[9.5px] font-sans uppercase text-neutral-450 font-bold tracking-wider leading-none select-none">
                    Loop
                  </span>
                  <div className="h-8 flex items-center justify-start">
                    <button
                      onClick={() => {
                        setPerfectLoop(!perfectLoop);
                        showToast(!perfectLoop ? "Perfect loop export enabled!" : "Standard loop output.");
                      }}
                      className="h-8 w-11 bg-[#1E1E1E] rounded-md flex items-center justify-center cursor-pointer select-none transition-all font-sans border border-neutral-800"
                      title="Toggle perfect looping mode"
                    >
                      <div className={`w-7 h-4 rounded-full p-0.5 transition-colors ${perfectLoop ? 'bg-[#18A0FB]' : 'bg-neutral-700'}`}>
                        <div className={`w-3 h-3 bg-white rounded-full shadow-md transform transition-transform ${perfectLoop ? 'translate-x-3' : 'translate-x-0'}`} />
                      </div>
                    </button>
                  </div>
                </div>
  
                {/* 4. Pointer */}
                <div className={`flex flex-col justify-between h-12 items-start transition-all duration-300 shrink-0 ${exportFormat === 'png' ? 'opacity-0 pointer-events-none' : ''}`}>
                  <span className="text-[9.5px] font-sans uppercase text-neutral-450 font-bold tracking-wider leading-none">
                    Pointer
                  </span>
                  <div className="h-8 flex bg-[#1E1E1E] p-0.5 rounded-md border border-neutral-800 shrink-0 items-center justify-center gap-[2px]">
                    <button
                      onClick={() => {
                        setRecordShowCursor(!recordShowCursor);
                        showToast(recordShowCursor ? "Pointer hidden in export." : "Pointer visible in export.");
                      }}
                      className={`text-[9.5px] font-sans px-3 h-full flex items-center justify-center font-bold rounded-sm transition-all cursor-pointer border-none ${
                        recordShowCursor 
                           ? 'bg-[#18A0FB] text-white shadow' 
                          : 'text-neutral-400 hover:text-neutral-200'
                      }`}
                      title="Toggle cursor visibility"
                    >
                      Cursor
                    </button>
                    <button
                      onClick={() => {
                        setRecordShowClicks(!recordShowClicks);
                        showToast(recordShowClicks ? "Tap highlights hidden." : "Tap highlights included.");
                      }}
                      className={`text-[9.5px] font-sans px-3 h-full flex items-center justify-center font-bold rounded-sm transition-all cursor-pointer border-none ${
                        recordShowClicks 
                          ? 'bg-[#18A0FB] text-white shadow' 
                          : 'text-neutral-400 hover:text-neutral-200'
                      }`}
                      title="Toggle click wave ripples"
                    >
                      Clicks
                    </button>
                  </div>
                </div>
   
                {/* 5. Format */}
                <div className="flex flex-col justify-between h-12 items-start shrink-0">
                  <span className="text-[9.5px] font-sans uppercase text-neutral-450 font-bold tracking-wider leading-none">
                    Format
                  </span>
                  <div className="h-8 flex bg-[#1E1E1E] p-0.5 rounded-md border border-neutral-800 shrink-0 items-center justify-center">
                    {(['mp4', 'png', 'gif'] as const).map((fmt) => (
                      <button
                        key={fmt}
                        onClick={() => {
                          if (!isRecording) setExportFormat(fmt);
                        }}
                        className={`text-[9.5px] font-sans px-3 h-full flex items-center justify-center font-bold rounded-sm transition-all cursor-pointer ${
                          exportFormat === fmt 
                            ? 'bg-[#18A0FB] text-white shadow' 
                            : 'text-neutral-400 hover:text-neutral-200'
                        }`}
                        disabled={isRecording}
                      >
                        {fmt.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
   
                {/* 6. Duration */}
                <div className={`flex flex-col justify-end h-12 items-start transition-all duration-300 shrink-0 w-[190px] ${exportFormat === 'png' ? 'opacity-0 pointer-events-none' : ''}`}>
                  <div className="h-8 flex bg-[#1E1E1E] px-2.5 rounded-md border border-neutral-800 shrink-0 items-center w-full gap-2.5 select-none">
                    <span className="text-[9.5px] font-sans uppercase text-neutral-450 font-bold tracking-wider leading-none shrink-0">
                      Duration
                    </span>
                    <input
                      type="range"
                      min="1"
                      max="20"
                      step="1"
                      value={exportDuration}
                      onChange={(e) => setExportDuration(Number(e.target.value))}
                      className="flex-1 h-1 bg-neutral-800 rounded cursor-pointer accent-[#18A0FB]"
                      disabled={isRecording}
                      title="Adjust clip duration"
                     />
                    <span className="font-mono text-[9.5px] font-bold text-[#18A0FB] leading-none text-right shrink-0 min-w-[20px]">
                      {exportDuration}S
                    </span>
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

    </>
  );
}
