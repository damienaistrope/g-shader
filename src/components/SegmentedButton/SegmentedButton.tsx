import React from 'react';
import './SegmentedButton.css';

interface SegmentProps {
  label: string;
  icon?: string;
  selected?: boolean;
  onClick?: () => void;
}

interface SegmentedButtonProps {
  children: React.ReactNode;
  selectedIndex?: number | number[];
  onChange?: (index: number) => void;
  className?: string;
}

export const SegmentedButton: React.FC<SegmentedButtonProps> = ({ 
  children, 
  selectedIndex, 
  onChange,
  className = ''
}) => {
  const isSelected = (index: number) => {
    if (Array.isArray(selectedIndex)) {
      return selectedIndex.includes(index);
    }
    return selectedIndex === index;
  };

  return (
    <div className={`md-segmented-button ${className}`}>
      {React.Children.map(children, (child, index) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, {
            selected: selectedIndex !== undefined ? isSelected(index) : child.props.selected,
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

export const Segment: React.FC<SegmentProps> = ({ label, icon, selected, onClick }) => (
  <button 
    className={`md-segment ${selected ? 'md-segment--selected' : ''}`}
    onClick={onClick}
  >
    <div className="md-segment__state-layer" />
    <div className="md-segment__content">
      {selected && <span className="material-symbols-outlined md-segment__icon">check</span>}
      {!selected && icon && <span className="material-symbols-outlined md-segment__icon">{icon}</span>}
      <span className="md-segment__label">{label}</span>
    </div>
  </button>
);
