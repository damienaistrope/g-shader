import React from 'react';
import { motion } from 'motion/react';
import { Ripple } from '../Ripple/Ripple';
import './Card.css';

interface CardProps {
  variant?: 'elevated' | 'filled' | 'outlined';
  layout?: 'vertical' | 'horizontal';
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ 
  variant = 'elevated', 
  layout = 'vertical',
  children, 
  onClick,
  className = ''
}) => {
  return (
    <motion.div 
      className={`md-card md-card--${variant} md-card--${layout} ${onClick ? 'md-card--interactive' : ''} ${className}`}
      onClick={onClick}
      whileHover={onClick ? { 
        y: -4, 
        boxShadow: variant === 'outlined' ? 'var(--md-sys-elevation-2)' : 'var(--md-sys-elevation-3)' 
      } : {}}
      whileTap={onClick ? { scale: 0.98 } : {}}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      {onClick && <div className="md-card__state-layer" />}
      {onClick && <Ripple />}
      {children}
    </motion.div>
  );
};

export const CardHeader: React.FC<{ 
  header?: string; 
  subhead?: string; 
  avatar?: React.ReactNode; 
  action?: React.ReactNode;
}> = ({ header, subhead, avatar, action }) => (
  <div className="md-card__header">
    {avatar && <div className="md-card__avatar">{avatar}</div>}
    <div className="md-card__header-text">
       <div className="md-card__header-title">{header}</div>
       {subhead && <div className="md-card__header-subhead">{subhead}</div>}
    </div>
    {action && <div className="md-card__header-action">{action}</div>}
  </div>
);

export const CardMedia: React.FC<{ 
  children?: React.ReactNode; 
  src?: string; 
  className?: string;
  aspectRatio?: '16/9' | '4/3' | '1/1' | 'custom';
}> = ({ children, src, className = '', aspectRatio = '16/9' }) => (
  <div 
    className={`md-card__media md-card__media--${aspectRatio.replace('/', '-')} ${className}`} 
    style={src ? { backgroundImage: `url(${src})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
  >
    {children}
  </div>
);

export const CardContent: React.FC<{ 
  children?: React.ReactNode;
  title?: string;
  subtitle?: string;
  headline?: string;
  className?: string;
}> = ({ children, title, subtitle, headline, className = '' }) => (
  <div className={`md-card__content ${className}`}>
    {(title || subtitle || headline) && (
      <div className="md-card__content-header">
        {headline && <div className="md-card__content-headline">{headline}</div>}
        {title && <div className="md-card__content-title">{title}</div>}
        {subtitle && <div className="md-card__content-subtitle">{subtitle}</div>}
      </div>
    )}
    {children && <div className="md-card__content-body">{children}</div>}
  </div>
);

export const CardActions: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="md-card__actions">{children}</div>
);
