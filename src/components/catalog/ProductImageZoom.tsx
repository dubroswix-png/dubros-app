'use client';

import React, { useState, useRef, MouseEvent } from 'react';
import { ZoomIn } from 'lucide-react';

interface ProductImageZoomProps {
  mainImage: string;
  altText: string;
  thumbnails?: string[];
}

export function ProductImageZoom({ mainImage, altText, thumbnails = [] }: ProductImageZoomProps) {
  const [activeImage, setActiveImage] = useState<string>(mainImage);
  const [isZoomed, setIsZoomed] = useState<boolean>(false);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Update active image if mainImage changes
  React.useEffect(() => {
    setActiveImage(mainImage);
  }, [mainImage]);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    
    // Calculate cursor percentage position (0% - 100%)
    const x = Math.max(0, Math.min(100, ((e.clientX - left) / width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - top) / height) * 100));

    setMousePos({ x, y });
  };

  const handleMouseEnter = () => setIsZoomed(true);
  const handleMouseLeave = () => {
    setIsZoomed(false);
    setMousePos({ x: 50, y: 50 });
  };

  const allImages = Array.from(new Set([mainImage, ...thumbnails].filter(Boolean)));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Main Image Container with Magnifier */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          position: 'relative',
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-lg)',
          padding: '2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid var(--border-light)',
          minHeight: '440px',
          height: '440px',
          overflow: 'hidden',
          cursor: isZoomed ? 'crosshair' : 'zoom-in',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
          userSelect: 'none',
        }}
      >
        {/* Zoomed Image */}
        <img
          src={activeImage}
          alt={altText}
          style={{
            width: '100%',
            maxWidth: '480px',
            maxHeight: '380px',
            objectFit: 'contain',
            transformOrigin: `${mousePos.x}% ${mousePos.y}%`,
            transform: isZoomed ? 'scale(2.4)' : 'scale(1)',
            transition: isZoomed ? 'transform 0.08s ease-out' : 'transform 0.3s ease-out, transform-origin 0.3s ease-out',
            pointerEvents: 'none',
          }}
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/images/product-placeholder.png';
          }}
        />

        {/* Floating "Ampliar" Badge */}
        {!isZoomed && (
          <div
            style={{
              position: 'absolute',
              bottom: '14px',
              right: '14px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              backgroundColor: 'rgba(255, 255, 255, 0.92)',
              backdropFilter: 'blur(4px)',
              padding: '0.35rem 0.75rem',
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontWeight: 600,
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-medium)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              pointerEvents: 'none',
            }}
          >
            <ZoomIn size={14} color="var(--blue)" />
            Pasa el cursor para ampliar
          </div>
        )}
      </div>

      {/* Thumbnails list */}
      {allImages.length > 1 && (
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(allImages.length, 5)}, 1fr)`, gap: '0.75rem' }}>
          {allImages.map((img, idx) => {
            const isSelected = activeImage === img;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveImage(img)}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.5rem',
                  cursor: 'pointer',
                  border: isSelected ? '2px solid var(--blue)' : '1px solid var(--border-light)',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '80px',
                  boxShadow: isSelected ? '0 0 0 3px rgba(15, 72, 150, 0.15)' : 'none',
                }}
              >
                <img
                  src={img}
                  alt={`${altText} - Vista ${idx + 1}`}
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/product-placeholder.png';
                  }}
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
