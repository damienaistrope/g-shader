import { useState, useRef, useCallback } from 'react';

export function useShaderState(initialState = 2) {
  const [activeState, setActiveState] = useState<number>(initialState);
  const [previousState, setPreviousState] = useState<number>(initialState);
  const [transitionVal, setTransitionVal] = useState<number>(1.0);
  const transitionRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const triggerState = useCallback((newState: number) => {
    if (newState === activeState) return;
    setPreviousState(activeState);
    setActiveState(newState);
    setTransitionVal(0.0);

    if (transitionRef.current) clearInterval(transitionRef.current);
    let t = 0;
    transitionRef.current = setInterval(() => {
      t += 0.05;
      setTransitionVal(Math.min(t, 1.0));
      if (t >= 1.0 && transitionRef.current) {
        clearInterval(transitionRef.current);
        transitionRef.current = null;
      }
    }, 16);
  }, [activeState]);

  return { activeState, previousState, transitionVal, triggerState, setActiveState };
}
