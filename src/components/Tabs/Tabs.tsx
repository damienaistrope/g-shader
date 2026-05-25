import React from 'react';
import { motion } from 'motion/react';
import { Ripple } from '../Ripple/Ripple';
import './Tabs.css';

interface TabProps {
  label: string;
  icon?: string;
  active?: boolean;
  onClick?: () => void;
}

interface TabsProps {
  children: React.ReactNode;
  activeIndex?: number;
  onChange?: (index: number) => void;
  variant?: 'primary' | 'secondary';
  className?: string;
}

export const Tab: React.FC<TabProps> = ({ label, icon, active, onClick }) => (
  <button 
    className={`md-tab ${active ? 'md-tab--active' : ''}`}
    onClick={onClick}
  >
    <div className="md-tab__state-layer" />
    <Ripple />
    <div className="md-tab__content">
      {icon && <span className="material-symbols-outlined md-tab__icon">{icon}</span>}
      <span className="md-tab__label">{label}</span>
      {active && (
        <motion.div 
          layoutId="tab-indicator"
          className="md-tabs__indicator"
          style={{ left: 0, right: 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      )}
    </div>
  </button>
);

export const Tabs: React.FC<TabsProps> = ({ 
  children, 
  activeIndex, 
  onChange,
  variant = 'primary',
  className = ''
}) => {
  return (
    <div className={`md-tabs md-tabs--${variant} ${className}`}>
      {React.Children.map(children, (child, index) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, {
            active: activeIndex !== undefined ? activeIndex === index : child.props.active,
            onClick: () => {
              onChange?.(index);
              child.props.onClick?.();
            }
          });
        }
        return child;
      })}
    </div>
  );
};
