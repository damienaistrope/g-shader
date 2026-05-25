import React, { useState, useLayoutEffect } from 'react';
import './Ripple.css';

interface RippleProps {
  color?: string;
  duration?: number;
}

interface RippleCircle {
  x: number;
  y: number;
  size: number;
  id: number;
}

export const Ripple: React.FC<RippleProps> = ({ 
  color = 'currentColor', 
  duration = 600 
}) => {
  const [ripples, setRipples] = useState<RippleCircle[]>([]);

  const addRipple = (event: React.MouseEvent<HTMLDivElement>) => {
    const container = event.currentTarget.getBoundingClientRect();
    const size = Math.max(container.width, container.height) * 2;
    const x = event.clientX - container.left - size / 2;
    const y = event.clientY - container.top - size / 2;

    const newRipple = {
      x,
      y,
      size,
      id: Date.now(),
    };

    setRipples((prev) => [...prev, newRipple]);
  };

  useLayoutEffect(() => {
    if (ripples.length > 0) {
      const timer = setTimeout(() => {
        setRipples((prev) => prev.slice(1));
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [ripples, duration]);

  return (
    <div className="md-ripple" onMouseDown={addRipple}>
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="md-ripple__circle"
          style={{
            top: ripple.y,
            left: ripple.x,
            width: ripple.size,
            height: ripple.size,
            backgroundColor: color,
            animationDuration: `${duration}ms`,
          }}
        />
      ))}
    </div>
  );
};
