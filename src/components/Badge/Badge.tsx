import React from 'react';
import './Badge.css';

interface BadgeProps {
  label?: string | number;
  variant?: 'large' | 'small';
  color?: 'error' | 'primary' | 'secondary';
  children?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({ 
  label, 
  variant = 'large', 
  color = 'error',
  children 
}) => {
  const isSmall = variant === 'small' || !label;

  return (
    <div className="md-badge-wrapper">
      {children}
      <span className={`md-badge md-badge--${variant} md-badge--${color} ${isSmall ? 'md-badge--small' : ''}`}>
        {!isSmall && label}
      </span>
    </div>
  );
};
