import { useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';

interface ResilientImageProps {
  src: string;
  alt: string;
  title?: string;
  className?: string;
}

export function ResilientImage({ src, alt, title, className = '' }: ResilientImageProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError || !src) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-[#181422] text-[#A8A0BA] p-6 select-none ${className}`}
        role="img"
        aria-label={alt}
      >
        <ImageIcon className="w-6 h-6 mb-2 text-[#D4AF37]" strokeWidth={1.5} />
        <span className="text-xs font-medium tracking-tight text-center max-w-[22ch]">
          {title || alt}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={className}
    />
  );
}
