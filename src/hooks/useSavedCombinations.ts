import { useState, useCallback, useEffect } from 'react';
import type { SavedCombination, LinkedFigmaFile, ComponentInstance } from '../types';

export function useSavedCombinations() {
  const [savedCombinations, setSavedCombinations] = useState<SavedCombination[]>(() => {
    try {
      const stored = localStorage.getItem('m3_saved_combinations');
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });

  const [activeCombinationId, setActiveCombinationId] = useState<string | null>(null);

  const [linkedFigmaFiles, setLinkedFigmaFiles] = useState<LinkedFigmaFile[]>(() => {
    try {
      const stored = localStorage.getItem('m3_linked_figma_files');
      return stored ? JSON.parse(stored) : [
        { id: 'fig-1', name: 'material_3_fluid_energy_spec.fig', url: 'https://figma.com/file/material_3_fluid_energy_spec' },
        { id: 'fig-2', name: 'm3_cyberpunk_mobile_layouts.fig',  url: 'https://figma.com/file/cyberpunk_m3_frames' },
      ];
    } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem('m3_saved_combinations', JSON.stringify(savedCombinations));
  }, [savedCombinations]);

  useEffect(() => {
    localStorage.setItem('m3_linked_figma_files', JSON.stringify(linkedFigmaFiles));
  }, [linkedFigmaFiles]);

  const saveCombination = useCallback((
    name: string,
    figmaFileId: string,
    components: ComponentInstance[],
    extras: Omit<SavedCombination, 'id' | 'name' | 'figmaFileId' | 'components'>
  ) => {
    const id = `comb-${Date.now()}`;
    const newComb: SavedCombination = { id, name: name.trim(), figmaFileId, components, ...extras };
    setSavedCombinations(prev => {
      const filtered = prev.filter(c => c.name.toLowerCase() !== name.trim().toLowerCase());
      return [...filtered, newComb];
    });
    setActiveCombinationId(id);
    return newComb;
  }, []);

  const deleteCombination = useCallback((id: string) => {
    setSavedCombinations(prev => prev.filter(c => c.id !== id));
    setActiveCombinationId(prev => (prev === id ? null : prev));
  }, []);

  const renameCombination = useCallback((id: string, newName: string) => {
    if (!newName.trim()) return;
    setSavedCombinations(prev =>
      prev.map(c => c.id === id ? { ...c, name: newName.trim() } : c)
    );
  }, []);

  const shareCombination = useCallback((comb: SavedCombination): string => {
    const json = JSON.stringify(comb);
    const encoded = btoa(unescape(encodeURIComponent(json)));
    return `${window.location.origin}${window.location.pathname}?import=${encoded}`;
  }, []);

  const addFigmaFile = useCallback((name: string, url: string) => {
    const id = `fig-${Date.now()}`;
    setLinkedFigmaFiles(prev => [...prev, { id, name: name.trim(), url: url.trim() || 'https://figma.com/file/unnamed' }]);
    return id;
  }, []);

  const deleteFigmaFile = useCallback((id: string) => {
    setLinkedFigmaFiles(prev => prev.filter(f => f.id !== id));
  }, []);

  return {
    savedCombinations, setSavedCombinations,
    activeCombinationId, setActiveCombinationId,
    linkedFigmaFiles, setLinkedFigmaFiles,
    saveCombination, deleteCombination, renameCombination, shareCombination,
    addFigmaFile, deleteFigmaFile,
  };
}
