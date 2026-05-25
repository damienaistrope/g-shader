import React, { useState, useRef } from 'react';
import './TextField.css';

interface TextFieldProps {
  label: string;
  value?: string;
  onChange?: (value: string) => void;
  variant?: 'filled' | 'outlined';
  type?: string;
  helperText?: string;
  error?: boolean;
  disabled?: boolean;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  className?: string;
}

export const TextField: React.FC<TextFieldProps> = ({
  label,
  value = '',
  onChange,
  variant = 'filled',
  type = 'text',
  helperText,
  error = false,
  disabled = false,
  leadingIcon,
  trailingIcon,
  className = ''
}) => {
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const containerClasses = [
    'md-text-field',
    `md-text-field--${variant}`,
    focused ? 'md-text-field--focused' : '',
    value ? 'md-text-field--has-value' : '',
    error ? 'md-text-field--error' : '',
    disabled ? 'md-text-field--disabled' : '',
    className
  ].filter(Boolean).join(' ');

  const handleContainerClick = () => {
    inputRef.current?.focus();
  };

  return (
    <div className={containerClasses} onClick={handleContainerClick}>
      <div className="md-text-field__container">
        {leadingIcon && (
          <div className="md-text-field__leading-icon">
            {leadingIcon}
          </div>
        )}
        
        <label className="md-text-field__label">{label}</label>
        
        <input
          ref={inputRef}
          type={type}
          className="md-text-field__input"
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          disabled={disabled}
        />

        {trailingIcon && (
          <div className="md-text-field__trailing-icon">
            {trailingIcon}
          </div>
        )}
      </div>
      {helperText && (
        <span className="md-text-field__helper">{helperText}</span>
      )}
    </div>
  );
};
