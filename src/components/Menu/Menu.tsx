import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Icon } from '../Icon/Icon';
import './Menu.css';

interface MenuItemProps {
  label: string;
  secondaryLabel?: string;
  icon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  shortcut?: string;
  badge?: string;
  selected?: boolean;
  disabled?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  hasSubmenu?: boolean;
  className?: string;
  forceSubmenuOpen?: boolean;
}

const TriangleIcon = ({ size = 20 }: { size?: number }) => (
  <Icon name="arrow_right" size={size} />
);

export const MenuItem: React.FC<MenuItemProps & { children?: React.ReactNode }> = ({ 
  label, 
  secondaryLabel,
  icon, 
  trailingIcon,
  shortcut,
  badge,
  selected,
  disabled, 
  onClick,
  hasSubmenu,
  className = '',
  forceSubmenuOpen,
  children
}) => {
  const [isSubmenuOpen, setIsSubmenuOpen] = useState(forceSubmenuOpen || false);
  const itemRef = useRef<HTMLButtonElement>(null);

  const handleMouseEnter = () => {
    if (hasSubmenu) setIsSubmenuOpen(true);
  };

  const handleMouseLeave = () => {
    if (hasSubmenu && !forceSubmenuOpen) setIsSubmenuOpen(false);
  };

  return (
    <div 
      className="md-menu-item-wrapper"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button 
        ref={itemRef}
        className={`md-menu-item ${selected ? 'md-menu-item--selected' : ''} ${disabled ? 'md-menu-item--disabled' : ''} ${className}`} 
        onClick={(e) => {
          if (hasSubmenu) {
            e.stopPropagation();
            setIsSubmenuOpen(!isSubmenuOpen);
          } else {
            onClick?.(e);
          }
        }}
        disabled={disabled}
        role="menuitem"
        aria-selected={selected}
        aria-haspopup={hasSubmenu}
        aria-expanded={isSubmenuOpen}
      >
        <div className="md-menu-item__state-layer" />
        <div className="md-menu-item__content">
          { (icon || selected) && (
            <div className="md-menu-item__leading">
              {icon ? icon : (selected ? <Icon name="check" size={20} className="md-menu-item__check" /> : null)}
            </div>
          )}
          <div className="md-menu-item__labels">
            <span className="md-menu-item__label">{label}</span>
            {secondaryLabel && <span className="md-menu-item__secondary-label">{secondaryLabel}</span>}
          </div>
          <div className="md-menu-item__trailing">
            {!selected && (
              <>
                {badge && <span className="md-menu-item__badge">{badge}</span>}
                {shortcut && <span className="md-menu-item__shortcut">{shortcut}</span>}
                {trailingIcon}
              </>
            )}
            {selected && icon && <Icon name="check" size={20} className="md-menu-item__check" />}
            {hasSubmenu && <TriangleIcon size={20} />}
          </div>
        </div>
      </button>
      
      {hasSubmenu && children && (
        <AnimatePresence>
          {isSubmenuOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="md-menu-submenu"
            >
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
};

interface MenuSectionProps {
  title?: string;
  children: React.ReactNode;
  showDivider?: boolean;
}

export const MenuSection: React.FC<MenuSectionProps> = ({ children, showDivider }) => (
  <div className={`md-menu-section ${showDivider ? 'md-menu-section--with-divider' : ''}`} role="group">
    <div className="md-menu-section__items">
      {children}
    </div>
    {showDivider && <div className="md-menu-divider" />}
  </div>
);

interface MenuProps {
  isOpen: boolean;
  onClose?: (event?: MouseEvent) => void;
  children: React.ReactNode;
  static?: boolean;
  className?: string;
  variant?: 'standard' | 'brand';
  elevation?: 1 | 2 | 3;
}

export const Menu: React.FC<MenuProps> = ({ 
  isOpen, 
  onClose, 
  children, 
  static: isStatic, 
  className = '',
  variant = 'standard',
  elevation = 2
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isStatic && isOpen) {
      const handleClickOutside = (event: MouseEvent) => {
        if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
          onClose?.(event);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose, isStatic]);

  if (!isOpen && !isStatic) return null;

  const content = (
    <div 
      ref={menuRef}
      className={`md-menu md-menu--elevation-${elevation} md-menu--${variant} ${className}`}
      role="menu"
    >
      {children}
    </div>
  );

  if (isStatic) return content;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          style={{ position: 'absolute', zIndex: 100 }}
        >
          {content}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
