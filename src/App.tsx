import { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, ArrowUpRight, Play } from 'lucide-react';
import { ArticleModal } from './components/ArticleModal';
import { ContactSection } from './components/ContactSection';
import { Header } from './components/Header';
import { Hero3DStage } from './components/Hero3DStage';
import { ProjectModal } from './components/ProjectModal';
import { ResilientImage } from './components/ResilientImage';
import { ScrollReveal } from './components/ScrollReveal';
import { Tilt3DCard } from './components/Tilt3DCard';
import { VideoModal } from './components/VideoModal';
import { Work3DShowcase } from './components/Work3DShowcase';
import bgPurpleGoldImg from './assets/images/bg_purple_gold_marble_1794743015292.jpg';
import {
  ARCHIVE_COLLECTIONS,
  CAPABILITIES,
  DRIVE_PORTFOLIO_URL,
  KPI_METRICS,
  PROJECTS,
  ProjectCategory,
  ProjectItem,
  RESUME_PDF_URL,
  VIDEO_WORKS,
  VideoWorkItem,
  WRITING_NOTES,
  WritingItem,
} from './data/portfolioData';

const FILTER_TABS: { id: ProjectCategory; label: string }[] = [
  { id: 'all', label: 'All Work' },
  { id: 'brand', label: 'Brand & Photo' },
  { id: 'architecture', label: '3D & Architecture' },
  { id: 'furniture', label: '3D Furniture' },
];

const MARQUEE_PHRASES = [
  'brand identity',
  '3d architectural renders',
  'print collateral',
  'video editing',
  'python & c++ engineering',
];

export default function App() {
  const [activeFilter, setActiveFilter] = useState<ProjectCategory>('all');
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<VideoWorkItem | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<WritingItem | null>(null);

  const filteredProjects = useMemo(() => {
    if (activeFilter === 'all') return PROJECTS;
    return PROJECTS.filter((project) => project.category === activeFilter);
  }, [activeFilter]);

  const scrollToSection = (selector: string) => {
    const el = document.querySelector(selector);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div id="top" className="relative min-h-screen bg-[#130A24] text-[#F7F3EA]">
      {/* Fixed Purple & Gold Marbled Background Layer with Measured Contrast Scrim */}
      <div
        aria-hidden="true"
        className="fixed inset-0 z-0 pointer-events-none"
      >
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${bgPurpleGoldImg})` }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(16, 8, 32, 0.56) 0%, rgba(18, 9, 34, 0.66) 55%, rgba(13, 6, 26, 0.78) 100%)',
          }}
        />
      </div>

      <div className="relative z-10">
        <Header onStartProject={() => scrollToSection('#contact')} />

        <main>
          {/* Split-Screen Hero */}
          <section className="pt-12 pb-12 md:pt-16 md:pb-16">
            <div className="max-w-[1200px] mx-auto px-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
                {/* Left Typographic Column */}
                <div className="lg:col-span-6 flex flex-col justify-between py-2">
                  <div className="space-y-6">
                    <p className="text-xs font-medium tracking-wide text-[#E5C158]">
                      Ahsan Shoaib · Graphic Designer, 3D Visualizer &amp; Coder
                    </p>
                    <h1 className="font-display text-[clamp(2.35rem,4.5vw,3.85rem)] font-bold leading-[1.06] tracking-tight text-[#F7F3EA] text-balance drop-shadow-sm">
                      Visual systems built in{' '}
                      <span className="italic text-[#E5C158]">brand, 3D,</span> and code.
                    </h1>
                    <p className="text-base md:text-[17px] leading-[1.65] text-[#E6DEF5] tracking-[0.01em] max-w-[54ch]">
                      I craft brand identities, print collateral, photorealistic 3D architectural renders, and interactive software—backed by certified engineering foundations in C++ and Python.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-5 pt-8">
                    <button
                      type="button"
                      onClick={() => scrollToSection('#work')}
                      className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-[#130A24] bg-[#D4AF37] hover:bg-[#E5C158] rounded-lg transition-colors duration-150 cursor-pointer whitespace-nowrap shadow-md"
                    >
                      Explore Selected Works
                      <ArrowDown className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => scrollToSection('#lab')}
                      className="inline-flex items-center gap-1.5 py-2 text-sm font-medium text-[#F7F3EA] hover:text-[#E5C158] border-b border-[#6C549E] hover:border-[#E5C158] transition-colors duration-150 cursor-pointer whitespace-nowrap"
                    >
                      Inspect Works in 3D
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Right Interactive 3D WebGL Spatial Studio */}
                <div className="lg:col-span-6 flex">
                  <Hero3DStage />
                </div>
              </div>

              {/* Full-Width 4-Column KPI Proof Row Below Hero Split */}
              <div className="mt-12 pt-8 border-t border-[#4D3778]/70 grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                {KPI_METRICS.map((metric) => (
                  <div key={metric.label} className="space-y-1">
                    <p className="font-display text-2xl md:text-3xl font-bold tracking-tight text-[#E5C158] tabular-nums">
                      {metric.value}
                    </p>
                    <p className="text-xs md:text-sm text-[#DCD2EE]">{metric.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Subtle Editorial Marquee Divider */}
          <div
            aria-hidden="true"
            className="border-y border-[#3F2D63]/75 bg-[#120922]/94 py-3.5 overflow-hidden select-none"
          >
            <div className="animate-marquee text-xs font-medium tracking-wide text-[#DCD2EE]">
              {[0, 1].map((dup) => (
                <div key={dup} className="flex items-center gap-6 pr-6">
                  {MARQUEE_PHRASES.map((phrase, idx) => (
                    <span key={`${dup}-${idx}`} className="flex items-center gap-6 whitespace-nowrap">
                      <span>{phrase}</span>
                      <span className="text-[#D4AF37]">·</span>
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Selected Works Bento Grid */}
          <section id="work" className="py-20 md:py-24">
            <div className="max-w-[1200px] mx-auto px-6">
              <ScrollReveal className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div className="max-w-xl">
                  <p className="text-xs font-medium tracking-wide text-[#E5C158] mb-2">
                    Selected Works
                  </p>
                  <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight text-[#F7F3EA] text-balance">
                    Identity, editorial print, and interactive engineering
                  </h2>
                </div>

                {/* Interactive Segmented Filter Bar */}
                <div
                  role="tablist"
                  aria-label="Filter projects by discipline"
                  className="inline-flex flex-wrap items-center gap-1 p-1 bg-[#180E2D]/90 backdrop-blur-sm border border-[#3F2D63]/80 rounded-lg self-start md:self-auto"
                >
                  {FILTER_TABS.map((tab) => {
                    const isActive = activeFilter === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        onClick={() => setActiveFilter(tab.id)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer ${
                          isActive
                            ? 'bg-[#D4AF37] text-[#130A24] font-semibold'
                            : 'text-[#D6CCE8] hover:text-[#F7F3EA]'
                        }`}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              </ScrollReveal>

              {/* Dynamic Bento Grid */}
              <div
                className={`grid gap-6 ${
                  activeFilter === 'all'
                    ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                    : 'grid-cols-1 md:grid-cols-2'
                }`}
              >
                {filteredProjects.map((project, index) => {
                  const isWide = activeFilter === 'all' && project.layoutSpan === 'wide';
                  return (
                    <ScrollReveal
                      key={`${activeFilter}-${project.id}`}
                      delayMs={(index % 3) * 85}
                      className={`h-full ${isWide ? 'lg:col-span-2' : 'lg:col-span-1'}`}
                    >
                      <Tilt3DCard
                        maxTilt={6}
                        className="h-full"
                      >
                        <button
                          type="button"
                          onClick={() => setSelectedProject(project)}
                          className="group w-full h-full text-left bg-[#140B26]/92 border border-[#3F2D63]/85 hover:border-[#D4AF37] rounded-2xl overflow-hidden transition-colors duration-150 flex flex-col cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4AF37] shadow-lg"
                        >
                          <div
                            className={`w-full ${
                              isWide ? 'aspect-[16/9]' : 'aspect-[4/3]'
                            } overflow-hidden bg-[#0B0616] border-b border-[#3F2D63]/70 p-2 flex items-center justify-center`}
                          >
                            <ResilientImage
                              src={project.imageSrc}
                              alt={project.imageAlt}
                              title={project.title}
                              className="w-full h-full object-contain rounded-lg block transition-transform duration-300 ease-out group-hover:scale-[1.03]"
                            />
                          </div>

                          <div className="p-6 flex-1 flex flex-col justify-between gap-4">
                            <div>
                              <div className="flex items-center gap-2 text-xs text-[#C6BAE0] mb-2">
                                <span className="text-[#C4B5FD]">{project.categoryLabel}</span>
                                <span aria-hidden="true">·</span>
                                <span>{project.client}</span>
                                <span aria-hidden="true">·</span>
                                <span className="font-mono tabular-nums">{project.year}</span>
                              </div>
                              <h3 className="font-display text-xl font-bold tracking-tight text-[#F7F3EA] group-hover:text-[#E5C158] transition-colors">
                                {project.title}
                              </h3>
                              <p className="mt-1.5 text-sm leading-relaxed text-[#D6CCE8] tracking-[0.01em]">
                                {project.subtitle}
                              </p>
                            </div>

                            <div className="pt-3 border-t border-[#3F2D63]/70 flex items-center justify-between text-xs font-medium text-[#F7F3EA]">
                              <span>Open Case Study &amp; Code Spec</span>
                              <ArrowUpRight className="w-4 h-4 text-[#D4AF37] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                            </div>
                          </div>
                        </button>
                      </Tilt3DCard>
                    </ScrollReveal>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Video Editing & Motion Reel */}
          <section id="motion" className="py-20 md:py-24 border-t border-[#3F2D63]/70">
            <div className="max-w-[1200px] mx-auto px-6">
              <ScrollReveal className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div className="max-w-xl">
                  <p className="text-xs font-medium tracking-wide text-[#E5C158] mb-2">
                    Video Editing &amp; Motion
                  </p>
                  <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight text-[#F7F3EA] text-balance">
                    Commercial cuts, culinary series &amp; velocity reels
                  </h2>
                </div>
                <a
                  href="https://drive.google.com/drive/folders/1PrCOuj6EOz0S0Y_xwDrC1eiWWItTljWg"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-[#E5C158] hover:text-[#F3D87D] whitespace-nowrap self-start md:self-auto"
                >
                  Open Video Folder
                  <ArrowUpRight className="w-4 h-4" />
                </a>
              </ScrollReveal>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {VIDEO_WORKS.map((video, index) => (
                  <ScrollReveal key={video.id} delayMs={(index % 2) * 100} className="h-full">
                    <Tilt3DCard maxTilt={6} className="h-full">
                      <button
                        type="button"
                        onClick={() => setSelectedVideo(video)}
                        className="group w-full h-full text-left bg-[#140B26]/92 border border-[#3F2D63]/85 hover:border-[#D4AF37] rounded-2xl p-6 md:p-7 flex flex-col justify-between gap-5 transition-colors duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4AF37] shadow-lg"
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2 text-xs text-[#C6BAE0]">
                              <span className="text-[#C4B5FD]">{video.category}</span>
                              <span aria-hidden="true">·</span>
                              <span className="font-mono">{video.durationNote}</span>
                            </div>
                            <span className="w-9 h-9 rounded-full bg-[#D4AF37] text-[#130A24] inline-flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                              <Play className="w-4 h-4 fill-current ml-0.5" />
                            </span>
                          </div>
                          <h3 className="font-display text-xl font-bold tracking-tight text-[#F7F3EA] group-hover:text-[#E5C158] transition-colors">
                            {video.title}
                          </h3>
                          <p className="text-sm leading-relaxed text-[#D6CCE8] tracking-[0.01em]">
                            {video.description}
                          </p>
                        </div>

                        <div className="pt-3 border-t border-[#3F2D63]/70 flex items-center justify-between text-xs">
                          <span className="text-[#A8A0BA]">{video.tools}</span>
                          <span className="font-medium text-[#E5C158] whitespace-nowrap">
                            Watch Edit
                          </span>
                        </div>
                      </button>
                    </Tilt3DCard>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </section>

          {/* Interactive 3D Work Showcase */}
          <ScrollReveal direction="scale">
            <Work3DShowcase />
          </ScrollReveal>

          {/* Practice, Capabilities & Client Proof */}
          <section id="practice" className="py-20 md:py-24 border-t border-[#3F2D63]/70">
            <div className="max-w-[1200px] mx-auto px-6 space-y-16">
              <ScrollReveal className="max-w-2xl">
                <p className="text-xs font-medium tracking-wide text-[#E5C158] mb-2">
                  Studio Practice
                </p>
                <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight text-[#F7F3EA] text-balance">
                  Bridging graphic craft and production software
                </h2>
                <p className="mt-3 text-[15px] leading-relaxed text-[#DCD2EE] tracking-[0.01em]">
                  Most studios separate visual direction from front-end engineering, losing precision during handoff. I work across both layers so typography, layout math, and browser performance reinforce one another.
                </p>
              </ScrollReveal>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {CAPABILITIES.map((cap, idx) => (
                  <ScrollReveal key={cap.number} delayMs={idx * 100} className="h-full">
                    <Tilt3DCard maxTilt={5} className="h-full">
                      <div className="h-full bg-[#140B26]/92 border border-[#3F2D63]/85 rounded-2xl p-6 md:p-8 flex flex-col justify-between gap-6 shadow-lg">
                        <div>
                          <h3 className="font-display text-xl md:text-2xl font-bold tracking-tight text-[#F7F3EA]">
                            <span className="font-mono text-[#E5C158] mr-2 tabular-nums">
                              {cap.number}
                            </span>
                            {cap.title}
                          </h3>
                          <p className="mt-3 text-[15px] leading-relaxed text-[#D6CCE8] tracking-[0.01em]">
                            {cap.description}
                          </p>
                        </div>

                        <ul className="border-t border-[#3F2D63]/70 pt-5 space-y-2.5 text-sm font-medium text-[#F1ECF9]">
                          {cap.items.map((item) => (
                            <li key={item} className="flex items-center justify-between">
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </Tilt3DCard>
                  </ScrollReveal>
                ))}
              </div>

              {/* Complete Drive Portfolio Archive & Credentials Strip */}
              <ScrollReveal className="bg-[#180F2E]/94 border border-[#4D3778]/85 rounded-2xl p-6 md:p-10 space-y-6 shadow-xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#3F2D63]/70 pb-6">
                  <div>
                    <p className="text-xs font-medium text-[#E5C158] mb-1">
                      Complete Portfolio Repository
                    </p>
                    <h3 className="font-display text-2xl font-bold tracking-tight text-[#F7F3EA]">
                      Explore every discipline &amp; credential on Google Drive
                    </h3>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <a
                      href={RESUME_PDF_URL}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-[#F7F3EA] bg-[#140B26] hover:bg-[#231540] border border-[#3F2D63] rounded-lg transition-colors whitespace-nowrap"
                    >
                      Resume (PDF)
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                    <a
                      href={DRIVE_PORTFOLIO_URL}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-[#130A24] bg-[#D4AF37] hover:bg-[#E5C158] rounded-lg transition-colors whitespace-nowrap"
                    >
                      Open Full Archive
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {ARCHIVE_COLLECTIONS.map((item, idx) => (
                    <ScrollReveal key={item.title} delayMs={idx * 75} className="h-full">
                      <Tilt3DCard maxTilt={6} className="h-full">
                        <a
                          href={item.href}
                          target="_blank"
                          rel="noreferrer"
                          className="group h-full p-4 rounded-xl bg-[#140B26]/90 border border-[#3F2D63]/75 hover:border-[#D4AF37] transition-colors flex flex-col justify-between gap-3"
                        >
                          <div>
                            <p className="font-display text-base font-bold text-[#F7F3EA] group-hover:text-[#E5C158] transition-colors">
                              {item.title}
                            </p>
                            <p className="mt-1 text-xs leading-relaxed text-[#D6CCE8]">
                              {item.detail}
                            </p>
                          </div>
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-[#E5C158]">
                            Browse Folder
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </span>
                        </a>
                      </Tilt3DCard>
                    </ScrollReveal>
                  ))}
                </div>
              </ScrollReveal>
            </div>
          </section>

          {/* Writing & Technical Notes */}
          <section id="writing" className="py-20 md:py-24 border-t border-[#3F2D63]/70">
            <div className="max-w-[1200px] mx-auto px-6">
              <ScrollReveal className="max-w-xl mb-10">
                <p className="text-xs font-medium tracking-wide text-[#E5C158] mb-2">
                  Writing &amp; Research
                </p>
                <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight text-[#F7F3EA] text-balance">
                  Notes on type systems and creative code
                </h2>
              </ScrollReveal>

              <ScrollReveal className="bg-[#140B26]/82 backdrop-blur-md border border-[#3F2D63]/80 rounded-2xl px-6 md:px-8 divide-y divide-[#3F2D63]/70">
                {WRITING_NOTES.map((note) => (
                  <button
                    key={note.id}
                    type="button"
                    onClick={() => setSelectedArticle(note)}
                    className="w-full text-left py-6 group flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors duration-150 cursor-pointer"
                  >
                    <div className="space-y-1.5 max-w-2xl">
                      <div className="flex items-center gap-2 text-xs text-[#C6BAE0]">
                        <span className="font-mono tabular-nums text-[#E5C158]">{note.year}</span>
                        <span aria-hidden="true">·</span>
                        <span className="text-[#C4B5FD]">{note.topic}</span>
                        <span aria-hidden="true">·</span>
                        <span>{note.readTime}</span>
                      </div>
                      <h3 className="font-display text-xl font-bold tracking-tight text-[#F7F3EA] group-hover:text-[#E5C158] transition-colors">
                        {note.title}
                      </h3>
                      <p className="text-sm text-[#D6CCE8] tracking-[0.01em]">{note.excerpt}</p>
                    </div>

                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#F7F3EA] group-hover:text-[#E5C158] whitespace-nowrap shrink-0">
                      Read Note
                      <ArrowUpRight className="w-4 h-4" />
                    </span>
                  </button>
                ))}
              </ScrollReveal>
            </div>
          </section>

          {/* Interactive Contact & Commission Form */}
          <ContactSection />
        </main>

        {/* Quiet Editorial Footer */}
        <footer className="border-t border-[#3F2D63]/70 bg-[#120922]/94 py-10">
          <div className="max-w-[1200px] mx-auto px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="text-xs text-[#D6CCE8] flex flex-wrap items-center gap-2">
              <span className="font-semibold text-[#E5C158]">Ahsan Shoaib</span>
              <span aria-hidden="true">·</span>
              <span>Graphic Designer &amp; Creative Coder</span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">© 2026</span>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-xs font-medium text-[#D6CCE8]">
              <a
                href="mailto:aa2993816@gmail.com"
                className="font-mono text-[#E5C158] hover:text-[#F3D87D] transition-colors"
              >
                aa2993816@gmail.com
              </a>
              <a
                href={DRIVE_PORTFOLIO_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 hover:text-[#E5C158] transition-colors"
              >
                Drive
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
              <a
                href={RESUME_PDF_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 hover:text-[#E5C158] transition-colors"
              >
                Resume
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
              <button
                type="button"
                onClick={() => scrollToSection('#top')}
                className="inline-flex items-center gap-1 text-[#E5C158] hover:text-[#F3D87D] transition-colors cursor-pointer"
              >
                Top
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </footer>
      </div>

      {/* Case Study, Video & Article Modals */}
      <ProjectModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />
      <VideoModal
        video={selectedVideo}
        onClose={() => setSelectedVideo(null)}
      />
      <ArticleModal
        article={selectedArticle}
        onClose={() => setSelectedArticle(null)}
      />
    </div>
  );
}
