import { useEffect } from 'react';
import { ArrowUpRight, X } from 'lucide-react';
import { VideoWorkItem } from '../data/portfolioData';

interface VideoModalProps {
  video: VideoWorkItem | null;
  onClose: () => void;
}

export function VideoModal({ video, onClose }: VideoModalProps) {
  useEffect(() => {
    if (!video) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [video, onClose]);

  if (!video) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 md:p-8 overflow-y-auto"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="video-modal-title"
    >
      <div
        className="bg-[#130A24] border border-[#3F2D63] rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 md:px-8 py-5 border-b border-[#3F2D63] flex items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#C6BAE0] mb-1.5">
              <span className="text-[#E5C158]">{video.category}</span>
              <span aria-hidden="true">·</span>
              <span>{video.durationNote}</span>
              <span aria-hidden="true">·</span>
              <span>{video.tools}</span>
            </div>
            <h3
              id="video-modal-title"
              className="font-display text-2xl md:text-3xl font-bold tracking-tight text-[#F7F3EA]"
            >
              {video.title}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close video player"
            className="w-10 h-10 inline-flex items-center justify-center rounded-lg bg-[#1B1032] hover:bg-[#2B194D] text-[#F7F3EA] transition-colors cursor-pointer shrink-0 focus-visible:outline-2 focus-visible:outline-[#D4AF37]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="aspect-video w-full bg-[#090512] border-b border-[#3F2D63]">
          <iframe
            src={video.previewUrl}
            title={video.title}
            className="w-full h-full border-0"
            allow="autoplay; fullscreen"
            allowFullScreen
          />
        </div>

        <div className="px-6 md:px-8 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <p className="text-sm text-[#DCD2EE] leading-relaxed max-w-2xl">
            {video.description}
          </p>
          <a
            href={video.driveUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-[#130A24] bg-[#D4AF37] hover:bg-[#E5C158] rounded-lg transition-colors whitespace-nowrap shrink-0 self-start sm:self-auto"
          >
            Open in Drive
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
