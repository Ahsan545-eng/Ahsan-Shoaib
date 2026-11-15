import { useEffect } from 'react';
import { X } from 'lucide-react';
import { WritingItem } from '../data/portfolioData';

interface ArticleModalProps {
  article: WritingItem | null;
  onClose: () => void;
}

export function ArticleModal({ article, onClose }: ArticleModalProps) {
  useEffect(() => {
    if (!article) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [article, onClose]);

  if (!article) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 md:p-8 overflow-y-auto"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="article-modal-title"
    >
      <article
        className="bg-[#13111A] border border-[#2B253A] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 md:px-8 py-6 border-b border-[#2B253A] flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-[#A8A0BA] mb-2">
              <span className="font-mono tabular-nums text-[#D4AF37]">{article.year}</span>
              <span aria-hidden="true">·</span>
              <span className="text-[#A78BFA]">{article.topic}</span>
              <span aria-hidden="true">·</span>
              <span>{article.readTime}</span>
            </div>
            <h3
              id="article-modal-title"
              className="font-display text-2xl md:text-3xl font-bold tracking-tight text-[#F5F2EB]"
            >
              {article.title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close article"
            className="w-10 h-10 inline-flex items-center justify-center rounded-lg bg-[#1B1726] hover:bg-[#2B253A] text-[#F5F2EB] transition-colors cursor-pointer shrink-0 focus-visible:outline-2 focus-visible:outline-[#D4AF37]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 md:p-8 space-y-5">
          {article.paragraphs.map((para, idx) => (
            <p key={idx} className="text-[15px] leading-[1.7] text-[#D8D3E3] tracking-[0.01em]">
              {para}
            </p>
          ))}

          <div className="mt-6 bg-[#09080D] text-[#F5F2EB] rounded-xl overflow-hidden border border-[#2B253A]">
            <div className="px-4 py-2.5 border-b border-[#2B253A] text-xs font-mono text-[#A8A0BA]">
              {article.codeTitle}
            </div>
            <pre className="p-4 text-xs md:text-sm font-mono leading-relaxed overflow-x-auto text-[#E6E0F2]">
              <code>{article.codeBlock}</code>
            </pre>
          </div>
        </div>
      </article>
    </div>
  );
}
