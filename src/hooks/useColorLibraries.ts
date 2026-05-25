import { useState, useCallback } from 'react';
import { M3_COLOR_LIBRARIES } from '../constants';

export function useColorLibraries() {
  const [customLibraries, setCustomLibraries] = useState<Record<string, any>>(() => {
    try {
      const saved = localStorage.getItem('m3_custom_color_libraries');
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });

  const allLibraries = { ...M3_COLOR_LIBRARIES, ...customLibraries };

  const addLibrary = useCallback((id: string, lib: any) => {
    setCustomLibraries(prev => {
      const next = { ...prev, [id]: lib };
      localStorage.setItem('m3_custom_color_libraries', JSON.stringify(next));
      return next;
    });
  }, []);

  const removeLibrary = useCallback((id: string) => {
    setCustomLibraries(prev => {
      const next = { ...prev };
      delete next[id];
      localStorage.setItem('m3_custom_color_libraries', JSON.stringify(next));
      return next;
    });
  }, []);

  return { customLibraries, allLibraries, addLibrary, removeLibrary };
}
