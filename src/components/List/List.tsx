import React from 'react';
import { motion } from 'motion/react';
import { Ripple } from '../Ripple/Ripple';
import './List.css';

interface ListItemProps {
  headline: string;
  supportingText?: string;
  overline?: string;
  leadingContent?: React.ReactNode;
  trailingContent?: React.ReactNode;
  trailingSupportingText?: string;
  onClick?: () => void;
  className?: string;
  lines?: 1 | 2 | 3;
}

export const ListItem: React.FC<ListItemProps> = ({
  headline,
  supportingText,
  overline,
  leadingContent,
  trailingContent,
  trailingSupportingText,
  onClick,
  className = '',
  lines
}) => {
  const lineCount = lines || (overline ? (supportingText ? 3 : 2) : (supportingText ? 2 : 1));

  return (
    <motion.div 
      className={`md-list-item md-list-item--${lineCount}-line ${onClick ? 'md-list-item--interactive' : ''} ${className}`}
      onClick={onClick}
      whileTap={onClick ? { backgroundColor: 'var(--md-sys-color-surface-container-high)', scale: 0.995 } : {}}
      transition={{ duration: 0.1 }}
    >
      <div className="md-list-item__state-layer" />
      {onClick && <Ripple />}
      
      {leadingContent && (
        <div className="md-list-item__leading">
          {leadingContent}
        </div>
      )}
      
      <div className="md-list-item__content">
        {overline && <span className="md-list-item__overline">{overline}</span>}
        <span className="md-list-item__headline">{headline}</span>
        {supportingText && (
          <span className="md-list-item__supporting-text">{supportingText}</span>
        )}
      </div>

      {(trailingContent || trailingSupportingText) && (
        <div className="md-list-item__trailing">
          {trailingSupportingText && (
            <span className="md-list-item__trailing-supporting-text">{trailingSupportingText}</span>
          )}
          {trailingContent}
        </div>
      )}
    </motion.div>
  );
};

export const List: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children,
  className = '' 
}) => (
  <div className={`md-list ${className}`}>
    {children}
  </div>
);
