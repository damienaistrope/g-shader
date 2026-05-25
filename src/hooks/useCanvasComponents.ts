import { useState, useCallback } from 'react';
import type { ComponentInstance } from '../types';
import { M3_SIZE_PRESETS, M3_FONT_STYLES } from '../constants';

function makeId() {
  return `comp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

const DEFAULT_COMPONENT: Omit<ComponentInstance, 'id' | 'type' | 'name'> = {
  width: 160, height: 40, borderRadius: 20,
  containerType: 'primary', title: 'Title', subtitle: 'Subtitle',
  text: 'Label', x: 0, y: 0, activeIcon: 'star',
  sizePreset: 'medium', fontStyleTitle: 'titleLarge', fontStyleText: 'bodyMedium',
  colorLibrary: 'default-purple', configShowIcon: true, configShowTitle: true,
  configShowSubtitle: true, configShowDescription: true, configShowActions: true,
  blurredEdges: false, variant: 'filled', activeState: 2, previousState: 2,
  transitionVal: 1.0, sizeMode: 'fixed', heightMode: 'fixed',
};

const TYPE_CONFIGS: Partial<Record<ComponentInstance['type'], Partial<ComponentInstance>>> = {
  button:   { width: 160, height: 40, borderRadius: 20, text: 'Confirm Action', variant: 'filled' },
  card:     { width: 300, height: 180, borderRadius: 12, title: 'Card Title', subtitle: 'Supporting body', text: 'This is a Material Design card with shader-animated background.' },
  chip:     { width: 120, height: 32, borderRadius: 8, text: 'Assist Chip', variant: 'assist' },
  fab:      { width: 56, height: 56, borderRadius: 16, activeIcon: 'add', variant: 'primary' },
  dialog:   { width: 320, height: 200, borderRadius: 28, title: 'Dialog Title', text: 'Confirming this action will apply changes to the selected component.' },
  badge:    { width: 32, height: 16, borderRadius: 8, text: '3', variant: 'standard' },
  sheets:   { width: 300, height: 240, borderRadius: 16, title: 'Action Sheet', variant: 'bottom' },
  avatar:   { width: 44, height: 44, borderRadius: 22, avatarType: 'initials', avatarInitials: 'GS' },
  progress: { width: 200, height: 8, borderRadius: 4, variant: 'linear' },
};

export function useCanvasComponents() {
  const [canvasComponents, setCanvasComponents] = useState<ComponentInstance[]>([]);
  const [selectedComponentId, setSelectedComponentId] = useState<string>('');

  const activeComp = canvasComponents.find(c => c.id === selectedComponentId);

  const addComponent = useCallback((type: ComponentInstance['type']) => {
    const id = makeId();
    const typeDefaults = TYPE_CONFIGS[type] || {};
    const base: ComponentInstance = {
      ...DEFAULT_COMPONENT,
      ...typeDefaults,
      id,
      type,
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} Layer`,
      x: (Math.random() - 0.5) * 200,
      y: (Math.random() - 0.5) * 160,
    };
    setCanvasComponents(prev => [...prev, base]);
    setSelectedComponentId(id);
    return id;
  }, []);

  const deleteComponent = useCallback((id: string) => {
    setCanvasComponents(prev => {
      const remaining = prev.filter(c => c.id !== id);
      return remaining;
    });
    setSelectedComponentId(prev => (prev === id ? '' : prev));
  }, []);

  const duplicateComponent = useCallback((id: string) => {
    const orig = canvasComponents.find(c => c.id === id);
    if (!orig) return;
    const newId = makeId();
    const copy: ComponentInstance = { ...orig, id: newId, name: `${orig.name} Copy`, x: orig.x + 24, y: orig.y + 24 };
    setCanvasComponents(prev => [...prev, copy]);
    setSelectedComponentId(newId);
  }, [canvasComponents]);

  const updateComponent = useCallback(<K extends keyof ComponentInstance>(
    id: string, field: K, value: ComponentInstance[K]
  ) => {
    setCanvasComponents(prev =>
      prev.map(c => c.id === id ? { ...c, [field]: value } : c)
    );
  }, []);

  const updateActiveComponentField = useCallback(<K extends keyof ComponentInstance>(
    field: K, value: ComponentInstance[K]
  ) => {
    if (!selectedComponentId) return;
    updateComponent(selectedComponentId, field, value);
  }, [selectedComponentId, updateComponent]);

  const moveLayer = useCallback((id: string, direction: 'up' | 'down') => {
    setCanvasComponents(prev => {
      const idx = prev.findIndex(c => c.id === id);
      if (idx < 0) return prev;
      const next = [...prev];
      if (direction === 'up' && idx > 0) {
        [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
      } else if (direction === 'down' && idx < next.length - 1) {
        [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
      }
      return next;
    });
  }, []);

  const setSizePreset = useCallback((id: string, preset: ComponentInstance['sizePreset']) => {
    const comp = canvasComponents.find(c => c.id === id);
    if (!comp) return;
    const metrics = M3_SIZE_PRESETS[comp.type]?.[preset];
    if (!metrics) return;

    let titleStyle = comp.fontStyleTitle;
    let textStyle = comp.fontStyleText;

    if (comp.type === 'card') {
      if (preset === 'xsmall') { titleStyle = 'titleSmall'; textStyle = 'subtextMicro'; }
      else if (preset === 'small') { titleStyle = 'titleSmall'; textStyle = 'bodyMedium'; }
      else if (preset === 'medium') { titleStyle = 'titleLarge'; textStyle = 'bodyMedium'; }
      else if (preset === 'large') { titleStyle = 'headlineMedium'; textStyle = 'bodyLarge'; }
      else { titleStyle = 'displayLarge'; textStyle = 'bodyLarge'; }
    } else {
      if (preset === 'xsmall') textStyle = 'subtextMicro';
      else if (preset === 'small') textStyle = 'labelMedium';
      else textStyle = 'labelLarge';
    }

    setCanvasComponents(prev =>
      prev.map(c =>
        c.id === id
          ? { ...c, sizePreset: preset, ...metrics, fontStyleTitle: titleStyle, fontStyleText: textStyle }
          : c
      )
    );
  }, [canvasComponents]);

  const triggerStateOnComponent = useCallback((id: string, newState: number) => {
    setCanvasComponents(prev =>
      prev.map(c => {
        if (c.id !== id) return c;
        const prev_state = c.activeState ?? 2;
        if (prev_state === newState) return c;
        return { ...c, previousState: prev_state, activeState: newState, transitionVal: 0 };
      })
    );
    // Animate transition
    let t = 0;
    const iv = setInterval(() => {
      t += 0.05;
      const clamped = Math.min(t, 1.0);
      setCanvasComponents(prev =>
        prev.map(c => c.id === id ? { ...c, transitionVal: clamped } : c)
      );
      if (t >= 1.0) clearInterval(iv);
    }, 16);
  }, []);

  const clearCanvas = useCallback(() => {
    setCanvasComponents([]);
    setSelectedComponentId('');
  }, []);

  const loadComponents = useCallback((components: ComponentInstance[]) => {
    setCanvasComponents(components);
    setSelectedComponentId('');
  }, []);

  return {
    canvasComponents, setCanvasComponents,
    selectedComponentId, setSelectedComponentId,
    activeComp,
    addComponent, deleteComponent, duplicateComponent,
    updateComponent, updateActiveComponentField,
    moveLayer, setSizePreset, triggerStateOnComponent,
    clearCanvas, loadComponents,
  };
}
