import React, { useState, useRef, useEffect } from 'react';
import { Search, Menu, ArrowLeft, X, Mic, History } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import './Search.css';

interface SearchProps {
  placeholder?: string;
  onSearch?: (value: string) => void;
  showMenuIcon?: boolean;
  profileAvatar?: string;
  branded?: boolean;
  suggestions?: { label: string; secondary?: string; type: 'history' | 'suggestion' }[];
  staticResults?: boolean;
  active?: boolean;
  className?: string;
  style?: React.CSSProperties;
  variant?: 'docked' | 'full-screen' | 'floating';
  size?: 'standard' | 'compact';
}

export const SearchBar: React.FC<SearchProps> = ({ 
  placeholder = 'Search...', 
  onSearch,
  showMenuIcon = true,
  profileAvatar,
  branded = false,
  suggestions = [
    { label: 'Recent search 1', secondary: 'Supporting line text', type: 'history' },
    { label: 'Recent search 2', secondary: 'Supporting line text', type: 'history' },
  ],
  staticResults = false,
  active = false,
  className = "",
  style,
  variant = 'floating',
  size = 'standard'
}) => {
  const [isExpanded, setIsExpanded] = useState(active);
  const [value, setValue] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (active) setIsExpanded(true);
  }, [active]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (staticResults) return;
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
      }
    };

    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isExpanded, staticResults]);

  const handleExpand = () => {
    if (staticResults) return;
    setIsExpanded(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleClose = () => {
    if (staticResults) {
      setValue('');
      return;
    }
    setIsExpanded(false);
    setValue('');
    onSearch?.('');
  };

  const showResults = isExpanded || staticResults;

  return (
    <div 
      ref={containerRef}
      className={`md-search-container md-search-container--${variant} ${showResults ? 'md-search-container--expanded' : ''} ${staticResults ? 'md-search-container--static' : ''} ${size === 'compact' ? 'md-search-container--compact' : ''} ${className}`}
      style={style}
    >
      {/* Search Bar / Input Area */}
      <motion.div 
        layout
        className={`md-search-bar ${size === 'compact' ? 'md-search-bar--compact' : ''} ${branded ? 'md-search-bar--branded' : ''}`}
        onClick={(!isExpanded && !staticResults) ? handleExpand : undefined}
      >
        <div className="md-search-bar__leading">
          {showResults ? (
            <button className="md-search-bar__action-icon" onClick={(e) => { e.stopPropagation(); handleClose(); }}>
              <ArrowLeft size={20} />
            </button>
          ) : (
            <button className="md-search-bar__action-icon" onClick={handleExpand}>
              <Menu size={20} />
            </button>
          )}
        </div>

        <div className="md-search-bar__content">
          {branded && !showResults ? (
            <div className="md-search-bar__branding">
               <span className="font-bold">Google</span> <span className="font-normal opacity-70">Product</span>
            </div>
          ) : (
            <input
              ref={inputRef}
              className="md-search-bar__input"
              placeholder={placeholder}
              value={value}
              readOnly={!showResults && !staticResults}
              onFocus={handleExpand}
              onChange={(e) => {
                setValue(e.target.value);
                onSearch?.(e.target.value);
              }}
            />
          )}
        </div>

        <div className="md-search-bar__trailing">
          {showResults ? (
            <>
              {value && (
                <button className="md-search-bar__action-icon" onClick={() => setValue('')}>
                  <X size={20} />
                </button>
              )}
              <button className="md-search-bar__action-icon">
                <Mic size={20} />
              </button>
            </>
          ) : (
            <>
              <button className="md-search-bar__action-icon" onClick={handleExpand}>
                <Search size={20} />
              </button>
              {profileAvatar && (
                <button className="md-search-bar__avatar">
                  <img src={profileAvatar} alt="Profile" />
                </button>
              )}
            </>
          )}
        </div>
      </motion.div>

      {/* Results View */}
      <AnimatePresence>
        {showResults && (
          <motion.div 
            initial={staticResults ? { opacity: 1, y: 0 } : { opacity: 0 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="md-search-results"
          >
            {variant === 'docked' && <div className="md-search-results__divider" />}
            <div className="md-search-results__content">
              {suggestions.map((item, i) => (
                <div key={i} className="md-search-result">
                  <div className="md-search-result__icon-container">
                    {item.type === 'history' ? <History size={20} /> : <Search size={20} />}
                  </div>
                  <div className="md-search-result__labels">
                    <span className="md-search-result__label">{item.label}</span>
                    {item.secondary && <span className="md-search-result__secondary">{item.secondary}</span>}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
