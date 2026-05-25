import React from 'react';

interface IconProps {
  name: string;
  size?: number;
  className?: string;
  fill?: boolean;
}

export const Icon: React.FC<IconProps> = ({ 
  name, 
  size = 24, 
  className = '',
  fill = false
}) => {
  return (
    <span 
      className={`material-symbols-outlined ${className}`}
      style={{ 
        fontSize: size,
        width: size,
        height: size,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        lineHeight: 1,
        fontVariationSettings: `'FILL' ${fill ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' ${size}`
      }}
    >
      {name}
    </span>
  );
};
