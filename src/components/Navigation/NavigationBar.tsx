import React from 'react';
import { motion } from 'motion/react';
import { Ripple } from '../Ripple/Ripple';
import './NavigationBar.css';

interface NavigationBarItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

export const NavigationBarItem: React.FC<NavigationBarItemProps> = ({ icon, label, active, onClick }) => {
  return (
    <button className={`md-navigation-bar__item ${active ? 'md-navigation-bar__item--active' : ''}`} onClick={onClick}>
      <Ripple />
      <div className="md-navigation-bar__icon-container">
        {active && (
          <motion.div 
            layoutId="nav-indicator"
            className="md-navigation-bar__active-indicator"
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
        )}
        <div className="md-navigation-bar__icon">
          {typeof icon === 'string' ? <span className="material-symbols-outlined">{icon}</span> : icon}
        </div>
      </div>
      <span className="md-navigation-bar__label">{label}</span>
    </button>
  );
};

export const NavigationBar: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="md-navigation-bar">
      {children}
    </div>
  );
};
