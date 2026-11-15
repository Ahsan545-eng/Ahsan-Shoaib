import { MouseEvent, ReactNode, useRef, useState } from 'react';

interface Tilt3DCardProps {
  children: ReactNode;
  className?: string;
  maxTilt?: number;
}

export function Tilt3DCard({
  children,
  className = '',
  maxTilt = 7,
}: Tilt3DCardProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [transform, setTransform] = useState(
    'perspective(1100px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)'
  );
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;

    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const rotateY = (px - 0.5) * maxTilt * 2;
    const rotateX = -(py - 0.5) * maxTilt * 2;

    setTransform(
      `perspective(1100px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.015, 1.015, 1.015)`
    );
    setGlare({ x: px * 100, y: py * 100, opacity: 1 });
  };

  const handleMouseLeave = () => {
    setTransform(
      'perspective(1100px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)'
    );
    setGlare((prev) => ({ ...prev, opacity: 0 }));
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform,
        transformStyle: 'preserve-3d',
        transition: glare.opacity
          ? 'transform 90ms ease-out'
          : 'transform 380ms cubic-bezier(0.22, 1, 0.36, 1)',
      }}
      className={`relative will-change-transform ${className}`}
    >
      {children}

      {/* Dynamic Specular Gold-Violet 3D Sheen Overlay */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-2xl transition-opacity duration-300"
        style={{
          opacity: glare.opacity,
          background: `radial-gradient(circle 280px at ${glare.x}% ${glare.y}%, rgba(229, 193, 88, 0.16), rgba(124, 92, 250, 0.08) 45%, transparent 75%)`,
        }}
      />
    </div>
  );
}
