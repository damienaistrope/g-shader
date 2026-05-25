import React, { useRef, useEffect } from 'react';
import './Selection.css';

interface SelectionProps {
  label?: string;
  checked?: boolean;
  disabled?: boolean;
  error?: boolean;
  onChange?: (checked: boolean) => void;
  className?: string;
}

export const Checkbox: React.FC<SelectionProps & { indeterminate?: boolean }> = ({ 
  label, 
  checked = false, 
  indeterminate = false,
  disabled = false, 
  error = false,
  onChange,
  className = ''
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  return (
    <label className={`md-selection md-selection--checkbox ${disabled ? 'md-selection--disabled' : ''} ${error ? 'md-selection--error' : ''} ${className}`}>
      <div className="md-selection__container">
        <input 
          ref={inputRef}
          type="checkbox" 
          className="md-selection__input"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange?.(e.target.checked)}
        />
        <div className="md-selection__control">
          <div className="md-selection__halo" />
          <svg className="md-selection__icon" viewBox="0 0 18 18" width="18" height="18" fill="none">
            {indeterminate ? (
              <path d="M4 9h10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            ) : (
              <path d="M4 9 L7.5 12 L14 5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            )}
          </svg>
        </div>
      </div>
      {label && <span className="md-selection__label">{label}</span>}
    </label>
  );
};

export const RadioButton: React.FC<SelectionProps & { name?: string }> = ({ 
  label, 
  checked = false, 
  disabled = false, 
  error = false,
  name,
  onChange,
  className = ''
}) => {
  return (
    <label className={`md-selection md-selection--radio ${disabled ? 'md-selection--disabled' : ''} ${error ? 'md-selection--error' : ''} ${className}`}>
      <div className="md-selection__container">
        <input 
          type="radio" 
          name={name}
          className="md-selection__input"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange?.(e.target.checked)}
        />
        <div className="md-selection__control">
          <div className="md-selection__halo" />
          <div className="md-selection__dot" />
        </div>
      </div>
      {label && <span className="md-selection__label">{label}</span>}
    </label>
  );
};
