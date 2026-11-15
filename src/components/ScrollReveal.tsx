import { ReactNode, useEffect, useRef, useState } from 'react';

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delayMs?: number;
  direction?: 'up' | 'left' | 'right' | 'scale';
}

export function ScrollReveal({
  children,
  className = '',
  delayMs = 0,
  direction = 'up',
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      setRevealed(true);
      return;
    }

    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setRevealed(true);
            observer.disconnect();
            break;
          }
        }
      },
      {
        threshold: 0.08,
        rootMargin: '0px 0px -36px 0px',
      }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  let hiddenTransform = 'translate3d(0, 32px, 0) scale(0.97) perspective(900px) rotateX(4deg)';
  if (direction === 'left') {
    hiddenTransform = 'translate3d(-32px, 12px, 0) scale(0.98)';
  } else if (direction === 'right') {
    hiddenTransform = 'translate3d(32px, 12px, 0) scale(0.98)';
  } else if (direction === 'scale') {
    hiddenTransform = 'translate3d(0, 20px, 0) scale(0.94)';
  }

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: revealed ? 1 : 0,
        transform: revealed ? 'translate3d(0, 0, 0) scale(1) perspective(900px) rotateX(0deg)' : hiddenTransform,
        transitionProperty: 'opacity, transform',
        transitionDuration: '680ms',
        transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
        transitionDelay: `${Math.min(delayMs, 420)}ms`,
        willChange: revealed ? 'auto' : 'opacity, transform',
      }}
    >
      {children}
    </div>
  );
}
