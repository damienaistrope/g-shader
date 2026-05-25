import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import './Snackbar.css';
import { Button } from '../Button/Button';
import { Icon } from '../Icon/Icon';
import { Ripple } from '../Ripple/Ripple';

interface SnackbarProps {
  label: string;
  actionLabel?: string;
  onAction?: () => void;
  showCloseIcon?: boolean;
  onClose?: () => void;
  isOpen: boolean;
  duration?: number;
  static?: boolean;
  stacked?: boolean; // For longer action labels that wrap to a new line
}

export const Snackbar: React.FC<SnackbarProps> = ({
  label,
  actionLabel,
  onAction,
  showCloseIcon,
  onClose,
  isOpen,
  duration = 5000,
  static: isStatic = false,
  stacked = false,
}) => {
  useEffect(() => {
    if (isOpen && duration > 0 && !isStatic) {
      const timer = setTimeout(() => {
        if (onClose) onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, duration, onClose, isStatic]);

  const snackbarContent = (
    <motion.div 
      className={`md-snackbar ${isStatic ? 'md-snackbar--static' : ''} ${stacked ? 'md-snackbar--stacked' : ''}`} 
      role="status"
      initial={isStatic ? false : { opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.1 } }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
    >
      <div className="md-snackbar__container">
        <div className="md-snackbar__content">
          <span className="md-snackbar__label">{label}</span>
        </div>
        <div className="md-snackbar__actions">
          {actionLabel && (
            <Button variant="text" onClick={onAction} className="md-snackbar__action-button">
              {actionLabel}
            </Button>
          )}
          {showCloseIcon && (
            <button className="md-snackbar__close-button relative overflow-hidden" onClick={onClose} aria-label="Close">
              <Ripple />
              <Icon name="close" size={20} />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );

  if (isStatic) return snackbarContent;

  return (
    <AnimatePresence>
      {isOpen && snackbarContent}
    </AnimatePresence>
  );
};
