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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <style>{`
        .pdp-zoom-container {
          position: relative;
          background-color: #FFFFFF;
          border-radius: var(--radius-lg);
          padding: 2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid var(--border-light);
          min-height: 440px;
          height: 440px;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
          user-select: none;
        }
        .pdp-zoom-img {
          width: 100%;
          max-width: 480px;
          max-height: 380px;
          object-fit: contain;
          pointer-events: none;
        }
        .pdp-zoom-badge {
          position: absolute;
          bottom: 14px;
          right: 14px;
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background-color: rgba(255, 255, 255, 0.92);
          backdrop-filter: blur(4px);
          padding: 0.35rem 0.75rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-secondary);
          border: 1px solid var(--border-medium);
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          pointer-events: none;
        }
        @media (max-width: 768px) {
          .pdp-zoom-container {
            min-height: 260px !important;
            height: 280px !important;
            padding: 1rem !important;
          }
          .pdp-zoom-img {
            max-height: 240px !important;
          }
          .pdp-zoom-badge {
            display: none !important;
          }
        }
      `}</style>
      {/* Main Image Container with Magnifier */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="pdp-zoom-container"
        style={{
          cursor: isZoomed ? 'crosshair' : 'zoom-in',
        }}
      >
        {/* Zoomed Image */}
        <img
          src={activeImage}
          alt={altText}
          className="pdp-zoom-img"
          style={{
            transformOrigin: `${mousePos.x}% ${mousePos.y}%`,
            transform: isZoomed ? 'scale(2.4)' : 'scale(1)',
            transition: isZoomed ? 'transform 0.08s ease-out' : 'transform 0.3s ease-out, transform-origin 0.3s ease-out',
          }}
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/images/product-placeholder.png';
          }}
        />

        {/* Floating "Ampliar" Badge (visible on desktop) */}
        {!isZoomed && (
          <div className="pdp-zoom-badge">
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
