import React from 'react';
import { motion } from 'motion/react';
import { Ripple } from '../Ripple/Ripple';
import './FAB.css';

interface FABProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: string;
  label?: string;
  onClick?: () => void;
  variant?: 'surface' | 'primary' | 'secondary' | 'tertiary';
  size?: 'small' | 'medium' | 'large' | 'extended';
}

export const FAB: React.FC<FABProps> = ({ 
  icon, 
  label, 
  onClick, 
  variant = 'primary', 
  size = 'medium',
  className = '',
  style,
  ...props
}) => {
  return (
    <motion.button 
      className={`md-fab md-fab--${variant} md-fab--${size} ${className}`}
      onClick={onClick}
      style={style}
      whileTap={{ scale: 0.96 }}
      whileHover={{ y: -2, boxShadow: 'var(--md-sys-elevation-4)' }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      {...props}
    >
      <div className="md-fab__state-layer" />
      <Ripple />
      <span className="material-symbols-outlined md-fab__icon">{icon}</span>
      {size === 'extended' && label && <span className="md-fab__label">{label}</span>}
    </motion.button>
  );
};
