import { useEffect, useState } from 'react';
import { Check, Copy, X } from 'lucide-react';
import { ProjectItem } from '../data/portfolioData';
import { ResilientImage } from './ResilientImage';
import { Tilt3DCard } from './Tilt3DCard';

interface ProjectModalProps {
  project: ProjectItem | null;
  onClose: () => void;
}

export function ProjectModal({ project, onClose }: ProjectModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'code'>('overview');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setActiveTab('overview');
    setCopied(false);
  }, [project]);

  useEffect(() => {
    if (!project) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [project, onClose]);

  if (!project) return null;

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(project.codeSnippet);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 md:p-8 overflow-y-auto"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="project-modal-title"
    >
      <div
        className="bg-[#13111A] border border-[#2B253A] rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Modal Header */}
        <div className="px-6 md:px-8 py-5 border-b border-[#2B253A] flex items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#A8A0BA] mb-1.5">
              <span className="text-[#A78BFA]">{project.categoryLabel}</span>
              <span aria-hidden="true">·</span>
              <span>{project.client}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">{project.year}</span>
            </div>
            <h3
              id="project-modal-title"
              className="font-display text-2xl md:text-3xl font-bold tracking-tight text-[#F5F2EB]"
            >
              {project.title}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close project case study"
            className="w-10 h-10 inline-flex items-center justify-center rounded-lg bg-[#1B1726] hover:bg-[#2B253A] text-[#F5F2EB] transition-colors cursor-pointer shrink-0 focus-visible:outline-2 focus-visible:outline-[#D4AF37]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Visual Showcase with 3D Interactive Depth Tilt */}
        <div className="bg-[#09080D] border-b border-[#2B253A] p-3 md:p-5">
          <Tilt3DCard maxTilt={5} className="rounded-xl overflow-hidden bg-[#0E071B]">
            <ResilientImage
              src={project.imageSrc}
              alt={project.imageAlt}
              title={project.title}
              className="w-full max-h-[440px] object-contain mx-auto rounded-xl block"
            />
          </Tilt3DCard>
        </div>

        {/* Modal Body */}
        <div className="p-6 md:p-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#2B253A] pb-4">
            <div className="inline-flex items-center p-1 bg-[#1B1726] rounded-lg">
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'overview'
                    ? 'bg-[#D4AF37] text-[#09080D] font-semibold'
                    : 'text-[#A8A0BA] hover:text-[#F5F2EB]'
                }`}
              >
                Design Case Study
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('code')}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'code'
                    ? 'bg-[#D4AF37] text-[#09080D] font-semibold'
                    : 'text-[#A8A0BA] hover:text-[#F5F2EB]'
                }`}
              >
                Engineering Snippet
              </button>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-xs font-medium text-[#A8A0BA]">
                Role: <strong className="font-semibold text-[#F5F2EB]">{project.role}</strong>
              </span>
              <a
                href={project.driveUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-medium text-[#D4AF37] hover:text-[#E5C158] underline underline-offset-4 whitespace-nowrap"
              >
                View Drive Folder
              </a>
            </div>
          </div>

          {activeTab === 'overview' ? (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              <div className="md:col-span-8 space-y-4">
                <p className="text-[15px] leading-relaxed text-[#D8D3E3] tracking-[0.01em]">
                  {project.summary}
                </p>
                <div className="pt-2">
                  <p className="text-xs font-medium text-[#A78BFA] mb-1">Measured Outcome</p>
                  <p className="font-display text-lg font-semibold text-[#D4AF37] tabular-nums">
                    {project.outcomeMetric}
                  </p>
                </div>
              </div>

              <div className="md:col-span-4">
                <p className="text-xs font-medium text-[#A8A0BA] mb-3">Deliverables</p>
                <ul className="space-y-2 text-sm text-[#F5F2EB]">
                  {project.deliverables.map((item) => (
                    <li
                      key={item}
                      className="pb-2 border-b border-[#2B253A] last:border-b-0 last:pb-0"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="bg-[#09080D] text-[#F5F2EB] rounded-xl overflow-hidden border border-[#2B253A]">
              <div className="px-5 py-3 border-b border-[#2B253A] flex items-center justify-between gap-4">
                <span className="font-mono text-xs text-[#A8A0BA]">{project.codeSnippetTitle}</span>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium bg-[#1B1726] hover:bg-[#2B253A] text-[#D4AF37] rounded-md transition-colors cursor-pointer whitespace-nowrap"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
              <pre className="p-5 text-xs md:text-sm font-mono leading-relaxed overflow-x-auto text-[#E6E0F2]">
                <code>{project.codeSnippet}</code>
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
