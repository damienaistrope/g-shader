import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './Carousel.css';

interface CarouselItemProps {
  image: string;
  title: string;
  className?: string;
  subtitle?: string;
}

export const CarouselItem: React.FC<CarouselItemProps> = ({ image, title, subtitle, className = '' }) => (
  <div className={`md-carousel-item snap-start flex-shrink-0 ${className}`}>
    <div className="md-carousel-item__container">
      <img src={image} alt={title} className="md-carousel-item__image" referrerPolicy="no-referrer" />
      <div className="md-carousel-item__overlay">
        <span className="md-carousel-item__title">{title}</span>
        {subtitle && <span className="md-carousel-item__subtitle">{subtitle}</span>}
      </div>
    </div>
  </div>
);

interface CarouselProps {
  children: React.ReactNode;
  variant?: 'multi-browse' | 'hero' | 'uncontained';
  title?: string;
}

export const Carousel: React.FC<CarouselProps> = ({ children, variant = 'multi-browse', title }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(true);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeft(scrollLeft > 10);
      setShowRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    const current = scrollRef.current;
    current?.addEventListener('scroll', checkScroll);
    return () => current?.removeEventListener('scroll', checkScroll);
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { clientWidth } = scrollRef.current;
      const scrollAmount = direction === 'left' ? -clientWidth * 0.8 : clientWidth * 0.8;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className={`md-carousel md-carousel--${variant}`}>
      {title && <h3 className="md-carousel__title">{title}</h3>}
      <div className="md-carousel__outer">
        {showLeft && (
          <button 
            className="md-carousel__nav md-carousel__nav--left" 
            onClick={() => scroll('left')}
            aria-label="Previous items"
          >
            <ChevronLeft size={24} />
          </button>
        )}
        
        <div className="md-carousel__track" ref={scrollRef}>
          {children}
        </div>

        {showRight && (
          <button 
            className="md-carousel__nav md-carousel__nav--right" 
            onClick={() => scroll('right')}
            aria-label="Next items"
          >
            <ChevronRight size={24} />
          </button>
        )}
      </div>
    </div>
  );
};
