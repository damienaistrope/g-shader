import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import './Progress.css';

interface ProgressProps {
  value?: number; // 0 to 1
  indeterminate?: boolean;
  variant?: 'standard' | 'thick';
  energyColorStart?: string;
  energyColorEnd?: string;
}

export const LinearProgress: React.FC<ProgressProps> = ({ 
  value = 0, 
  indeterminate = false,
  variant = 'standard',
  energyColorStart,
  energyColorEnd
}) => {
  const isThick = variant === 'thick';
  
  const barStyle: React.CSSProperties = {};
  if (energyColorStart && energyColorEnd) {
    barStyle.background = `linear-gradient(270deg, ${energyColorStart}, ${energyColorEnd}, ${energyColorStart})`;
    barStyle.backgroundSize = '200% 200%';
    barStyle.animation = 'energy-gradient-flow 2.5s ease infinite';
  } else if (energyColorStart) {
    barStyle.backgroundColor = energyColorStart;
  }

  const trackStyle: React.CSSProperties = {};
  if (energyColorStart) {
    // We add a semi-transparent version (~15%) of the start color for progress tracks
    trackStyle.backgroundColor = `${energyColorStart}26`;
  }
  
  return (
    <div 
      className={`md-linear-progress md-linear-progress--${variant} ${indeterminate ? 'md-linear-progress--indeterminate' : ''} ${isThick ? 'md-linear-progress--thick' : ''}`}
      style={{ '--md-linear-progress-value': value } as React.CSSProperties}
    >
      <div className="md-linear-progress__track" style={trackStyle}></div>
      
      {!indeterminate && (
        <motion.div 
          className="md-linear-progress__bar" 
          initial={false}
          animate={{ width: `${value * 100}%` }}
          transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
          style={barStyle}
        />
      )}
      
      {indeterminate && (
        <>
          <motion.div 
            className="md-linear-progress__bar md-linear-progress__bar--1"
            animate={{ 
              left: ["-35%", "100%"],
              width: ["35%", "35%"]
            }}
            transition={{ repeat: Infinity, duration: 2, ease: [0.65, 0.815, 0.735, 0.395] }}
            style={barStyle}
          />
          <motion.div 
            className="md-linear-progress__bar md-linear-progress__bar--2"
            animate={{ 
              left: ["-100%", "100%"],
              width: ["100%", "100%"]
            }}
            transition={{ repeat: Infinity, duration: 2, ease: [0.165, 0.84, 0.44, 1], delay: 1.15 }}
            style={barStyle}
          />
        </>
      )}
    </div>
  );
};

export const CircularProgress: React.FC<ProgressProps> = ({ 
  value = 0, 
  indeterminate = false,
  variant = 'standard',
  energyColorStart,
  energyColorEnd
}) => {
  const [pathLength, setPathLength] = useState(0);
  const pathRef = useRef<SVGPathElement>(null);
  
  const size = 48;
  const isThick = variant === 'thick';
  const strokeWidth = isThick ? 8 : 4;
  const radius = 18;
  
  useEffect(() => {
    if (pathRef.current) {
      setPathLength(pathRef.current.getTotalLength());
    }
  }, [variant]);

  const pathData = `M 24 6 A 18 18 0 1 1 24 42 A 18 18 0 1 1 24 6`;
  const gradId = React.useId().replace(/:/g, ''); // unique ID safe for multi-instance SVG gradient targets

  return (
    <motion.div 
      className={`md-circular-progress md-circular-progress--${variant} ${indeterminate ? 'md-circular-progress--indeterminate' : ''} ${isThick ? 'md-circular-progress--thick' : ''}`}
      animate={indeterminate ? { rotate: 360 } : { rotate: 0 }}
      transition={indeterminate ? { repeat: Infinity, duration: 2, ease: "linear" } : { duration: 0 }}
    >
      <svg className="md-circular-progress__svg" viewBox="0 0 48 48">
        {energyColorStart && energyColorEnd && (
          <defs>
            <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={energyColorStart} />
              <stop offset="50%" stopColor={energyColorEnd} />
              <stop offset="100%" stopColor={energyColorStart} />
            </linearGradient>
          </defs>
        )}
        <path 
          className="md-circular-progress__track" 
          d={pathData}
          fill="none" 
          strokeWidth={strokeWidth} 
          strokeLinecap="round"
          style={{ stroke: energyColorStart ? `${energyColorStart}26` : undefined }}
        />
        <motion.path 
          ref={pathRef}
          className="md-circular-progress__bar" 
          d={pathData}
          fill="none" 
          strokeWidth={strokeWidth} 
          strokeLinecap="round"
          style={{ stroke: (energyColorStart && energyColorEnd) ? `url(#${gradId})` : energyColorStart }}
          initial={false}
          animate={indeterminate ? {
            strokeDasharray: [
              `1 ${pathLength}`,
              `${pathLength * 0.75} ${pathLength}`,
              `${pathLength * 0.75} ${pathLength}`
            ],
            strokeDashoffset: [0, -pathLength * 0.25, -pathLength]
          } : {
            strokeDasharray: `${pathLength} ${pathLength}`,
            strokeDashoffset: pathLength * (1 - value)
          }}
          transition={indeterminate ? {
            repeat: Infinity,
            duration: 1.5,
            ease: "easeInOut"
          } : {
            duration: 0.3
          }}
        />
      </svg>
    </motion.div>
  );
};
