import React from 'react';
import './ImageGrid.css';

interface ImageGridItemProps {
  src: string;
  alt: string;
  span?: 'none' | 'large' | 'tall' | 'wide';
}

export const ImageGridItem: React.FC<ImageGridItemProps> = ({ src, alt, span = 'none' }) => {
  return (
    <div className={`md-image-grid-item md-image-grid-item--span-${span}`}>
      <img src={src} alt={alt} className="md-image-grid-item__image" referrerPolicy="no-referrer" />
    </div>
  );
};

interface FileGridItemProps {
  name: string;
  type: 'image' | 'video' | 'pdf' | 'folder';
  onDelete?: () => void;
}

export const FileGridItem: React.FC<FileGridItemProps> = ({ name, type }) => {
  const getIcon = () => {
    switch (type) {
      case 'image': return 'image';
      case 'video': return 'videocam';
      case 'pdf': return 'description';
      case 'folder': return 'folder';
      default: return 'insert_drive_file';
    }
  };

  return (
    <div className="md-file-grid-item">
      <div className="md-file-grid-item__preview">
        <span className="material-symbols-outlined">{getIcon()}</span>
      </div>
      <div className="md-file-grid-item__info">
        <span className="md-file-grid-item__name text-xs truncate w-full">{name}</span>
      </div>
    </div>
  );
};

interface ImageGridProps {
  children: React.ReactNode;
  columns?: number;
}

export const ImageGrid: React.FC<ImageGridProps> = ({ children, columns = 3 }) => {
  return (
    <div className="md-image-grid" style={{ '--md-image-grid-cols': columns } as React.CSSProperties}>
      {children}
    </div>
  );
};
