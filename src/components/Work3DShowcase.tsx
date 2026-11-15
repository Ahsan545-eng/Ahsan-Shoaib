import { useEffect, useRef, useState } from 'react';
import {
  ArrowUpRight,
  Box,
  ChevronDown,
  ChevronUp,
  Orbit,
  RotateCcw,
  SlidersHorizontal,
} from 'lucide-react';
import archInteriorImg from '../assets/images/work/arch_interior_living.jpg';
import archReceptionImg from '../assets/images/work/arch_office_reception.jpg';
import floorPlanImg from '../assets/images/work/floor_plan_3d.jpg';
import deskImg from '../assets/images/work/furniture_computer_table_3d.jpg';
import wardrobeImg from '../assets/images/work/furniture_wardrobe_3d.jpg';
import {
  createWorkShowcaseScene,
  ShowcaseFinish,
  ShowcaseWorkId,
  WorkShowcaseController,
} from '../three/createWorkShowcaseScene';
import { ResilientImage } from './ResilientImage';

interface ShowcaseEntry {
  id: ShowcaseWorkId;
  title: string;
  category: string;
  description: string;
  imageSrc: string;
  driveUrl: string;
}

const SHOWCASE_WORKS: ShowcaseEntry[] = [
  {
    id: 'livingroom',
    title: 'Contemporary Living Room Interior',
    category: '3D Interior Visualization',
    description:
      'Recessed cove false ceiling with 3-ring spiral chandelier, fluted TV media wall, walnut-and-marble console, charcoal L-sofa, and nesting brass tables.',
    imageSrc: archInteriorImg,
    driveUrl: 'https://drive.google.com/drive/folders/1GrkSYd3IYy_x2IgaPFIgL7h4rogd8MNt',
  },
  {
    id: 'kitchen',
    title: 'Modern Walnut & Marble Kitchen',
    category: '3D Interior Visualization',
    description:
      'Polished marble flooring, double-door brushed steel refrigerator, built-in oven tower, walnut cabinetry, charcoal overhead units, and venetian window.',
    imageSrc: archInteriorImg,
    driveUrl: 'https://drive.google.com/drive/folders/1GrkSYd3IYy_x2IgaPFIgL7h4rogd8MNt',
  },
  {
    id: 'bedroom',
    title: 'Master Garden Bedroom Suite',
    category: '3D Interior Visualization',
    description:
      'Hardwood floor suite with birch platform bed, sage-green bedding, twin glowing lamps, triptych art wall, birch foot bench, ceiling fan, and garden glass.',
    imageSrc: archInteriorImg,
    driveUrl: 'https://drive.google.com/drive/folders/1GrkSYd3IYy_x2IgaPFIgL7h4rogd8MNt',
  },
  {
    id: 'booth',
    title: 'Corporate Exhibition & Reception Lounge',
    category: '3D Spatial & Booth Design',
    description:
      'Timber pergola canopy with hanging pendant lights, white lounge seating, illuminated display screens, and front glass reception counter.',
    imageSrc: archReceptionImg,
    driveUrl: 'https://drive.google.com/drive/folders/1GrkSYd3IYy_x2IgaPFIgL7h4rogd8MNt',
  },
  {
    id: 'floorplan',
    title: '3D Commercial Office Floor Plan',
    category: '3D CAD & Spatial Planning',
    description:
      'Full-floor cutaway spanning the U-shaped walnut boardroom, executive office, open workstations, library archive, tiled reception lobby, and dining hall.',
    imageSrc: floorPlanImg,
    driveUrl: 'https://drive.google.com/drive/folders/1lBZ2QSCwxSLyKsCaaaSzA5vTELznRzlt',
  },
  {
    id: 'desk',
    title: '3-Drawer Birch Storage Credenza',
    category: '3D Furniture Modeling',
    description:
      'Natural birch cabinet featuring three left-hand drawers with curved chrome handles, open center shelving bay, and a tall right cupboard door.',
    imageSrc: deskImg,
    driveUrl: 'https://drive.google.com/drive/folders/1Tg63rGgdTQ1fVhsRPPTT_wr46upVVQRC',
  },
  {
    id: 'wardrobe',
    title: 'Tall Timber 6-Tier Open Bookcase',
    category: '3D Furniture Modeling',
    description:
      'Vertical cherry-oak joinery shelving unit with five evenly spaced shelves, chamfered upright sides, crown cap, and recessed plinth base.',
    imageSrc: wardrobeImg,
    driveUrl: 'https://drive.google.com/drive/folders/1Tg63rGgdTQ1fVhsRPPTT_wr46upVVQRC',
  },
];

const FINISH_OPTIONS: { id: ShowcaseFinish; label: string; swatch: string }[] = [
  { id: 'natural', label: 'Natural', swatch: '#D6B68B' },
  { id: 'obsidian', label: 'Obsidian Gold', swatch: '#D4AF37' },
  { id: 'clay', label: 'Clay Model', swatch: '#E8E3DA' },
];

export function Work3DShowcase() {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const controllerRef = useRef<WorkShowcaseController | null>(null);

  const [selectedId, setSelectedId] = useState<ShowcaseWorkId>('livingroom');
  const [finish, setFinish] = useState<ShowcaseFinish>('natural');
  const [wireframe, setWireframe] = useState(false);
  const [explode, setExplode] = useState(0);
  const [autoRotate, setAutoRotate] = useState(true);
  const [dockExpanded, setDockExpanded] = useState(true);
  const [webglFailed, setWebglFailed] = useState(false);

  const activeWork =
    SHOWCASE_WORKS.find((item) => item.id === selectedId) ?? SHOWCASE_WORKS[0];

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const reducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    if (reducedMotion) setAutoRotate(false);

    let controller: WorkShowcaseController | null = null;
    try {
      controller = createWorkShowcaseScene({
        container,
        initialWork: selectedId,
        reducedMotion,
        onContextLost: () => setWebglFailed(true),
        onContextRestored: () => setWebglFailed(false),
      });
      controllerRef.current = controller;
    } catch {
      setWebglFailed(true);
    }

    return () => {
      controllerRef.current = null;
      controller?.dispose();
    };
  }, []);

  useEffect(() => {
    controllerRef.current?.setWork(selectedId);
  }, [selectedId]);

  useEffect(() => {
    controllerRef.current?.setFinish(finish);
  }, [finish]);

  useEffect(() => {
    controllerRef.current?.setWireframe(wireframe);
  }, [wireframe]);

  useEffect(() => {
    controllerRef.current?.setExplode(explode);
  }, [explode]);

  useEffect(() => {
    controllerRef.current?.setAutoRotate(autoRotate);
  }, [autoRotate]);

  const handleReset = () => {
    setFinish('natural');
    setWireframe(false);
    setExplode(0);
    setAutoRotate(true);
    controllerRef.current?.resetCamera();
  };

  return (
    <section id="lab" className="py-20 md:py-24 border-t border-[#3F2D63]/70">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="max-w-xl mb-12">
          <p className="text-xs font-medium tracking-wide text-[#E5C158] mb-2">
            Interactive 3D Portfolio Stage
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight text-[#F7F3EA] text-balance">
            Inspect interior rooms &amp; furniture in full 3D
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-[#DCD2EE] tracking-[0.01em]">
            Choose any room interior, spatial plan, or 3D furniture piece below to orbit around it and slide the Explode bar to inspect every wall, ceiling, drawer, and shelf.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Scrollable Model Selector & Render Reference */}
          <div className="lg:col-span-5 bg-[#140B26]/92 border border-[#3F2D63]/80 rounded-2xl p-6 md:p-7 flex flex-col justify-between gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[#A8A0BA]">
                  Select Room or Model
                </span>
                <span className="text-[11px] font-mono text-[#E5C158]">
                  {SHOWCASE_WORKS.length} Models
                </span>
              </div>

              <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1.5 custom-scrollbar">
                {SHOWCASE_WORKS.map((item) => {
                  const isActive = item.id === selectedId;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedId(item.id)}
                      className={`w-full text-left px-3.5 py-2.5 rounded-xl border transition-colors cursor-pointer flex items-center justify-between gap-3 ${
                        isActive
                          ? 'bg-[#29184B] border-[#D4AF37] text-[#F7F3EA]'
                          : 'bg-[#0E071B] border-[#2B253A] text-[#C6BAE0] hover:border-[#4D3778] hover:text-[#F7F3EA]'
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate">{item.title}</p>
                        <p className="text-[11px] text-[#A8A0BA] truncate">{item.category}</p>
                      </div>
                      <span
                        className={`text-[11px] font-mono shrink-0 ${
                          isActive ? 'text-[#E5C158]' : 'text-[#6C549E]'
                        }`}
                      >
                        3D
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Work Summary + Drive Reference */}
            <div className="p-4 rounded-xl bg-[#0E071B] border border-[#2B253A] flex items-center gap-4">
              <div className="w-24 h-20 rounded-lg bg-[#140B26] border border-[#3F2D63]/60 p-1 shrink-0 flex items-center justify-center overflow-hidden">
                <ResilientImage
                  src={activeWork.imageSrc}
                  alt={activeWork.title}
                  title={activeWork.title}
                  className="w-full h-full object-contain block"
                />
              </div>
              <div className="min-w-0 space-y-1.5">
                <p className="text-xs leading-relaxed text-[#D6CCE8] line-clamp-3">
                  {activeWork.description}
                </p>
                <a
                  href={activeWork.driveUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-medium text-[#E5C158] hover:text-[#F3D87D]"
                >
                  Open Folder on Drive
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>

          {/* Right Dedicated 3D Viewport with Matching Explode & Material Dock */}
          <div className="lg:col-span-7 relative min-h-[480px] lg:min-h-[580px] bg-[#140B26]/92 border border-[#3F2D63]/80 rounded-2xl overflow-hidden shadow-2xl">
            {webglFailed ? (
              <div className="w-full h-full min-h-[480px] bg-[#0E071B] p-6 flex items-center justify-center">
                <ResilientImage
                  src={activeWork.imageSrc}
                  alt={activeWork.title}
                  title={activeWork.title}
                  className="w-full max-h-[460px] object-contain block"
                />
              </div>
            ) : (
              <>
                <div
                  ref={mountRef}
                  aria-label={`Interactive 3D view of ${activeWork.title}`}
                  className="w-full h-full min-h-[480px] lg:min-h-[580px] cursor-grab active:cursor-grabbing select-none"
                />

                {/* Matching Collapsible Bottom 3D Control Dock with Explode Slider Bar */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-[540px] z-10">
                  {dockExpanded ? (
                    <div className="bg-[#140B26]/95 border border-[#4D3778] rounded-xl p-3 shadow-xl space-y-2.5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5" role="group" aria-label="Material finish">
                          {FINISH_OPTIONS.map((opt) => {
                            const active = finish === opt.id;
                            return (
                              <button
                                key={opt.id}
                                type="button"
                                onClick={() => setFinish(opt.id)}
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded-md border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                                  active
                                    ? 'bg-[#D4AF37] text-[#130A24] border-[#D4AF37] font-semibold'
                                    : 'bg-[#1C1133] text-[#DCD2EE] border-[#3F2D63] hover:text-[#F7F3EA]'
                                }`}
                              >
                                <span
                                  className="w-2 h-2 rounded-full shrink-0"
                                  style={{ backgroundColor: opt.swatch }}
                                />
                                {opt.label}
                              </button>
                            );
                          })}
                        </div>

                        <button
                          type="button"
                          onClick={() => setDockExpanded(false)}
                          aria-label="Hide controls"
                          className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-[#C6BAE0] hover:text-[#F7F3EA] bg-[#1C1133] border border-[#3F2D63] rounded-md cursor-pointer whitespace-nowrap shrink-0"
                        >
                          Hide
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-3 pt-1.5 border-t border-[#3F2D63]/70">
                        <label className="flex items-center gap-2.5 text-[11px] font-mono text-[#D6CCE8] flex-1 min-w-[160px]">
                          <span className="whitespace-nowrap">Explode</span>
                          <input
                            type="range"
                            min={0}
                            max={1}
                            step={0.02}
                            value={explode}
                            onChange={(e) => setExplode(Number(e.target.value))}
                            aria-label="Explode 3D components"
                            className="w-full accent-[#D4AF37] cursor-pointer"
                          />
                          <span className="tabular-nums text-[#E5C158] w-8 text-right">
                            {Math.round(explode * 100)}%
                          </span>
                        </label>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setWireframe((prev) => !prev)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded-md border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                              wireframe
                                ? 'bg-[#7C5CFA] text-white border-[#7C5CFA]'
                                : 'bg-[#1C1133] text-[#D6CCE8] border-[#3F2D63] hover:text-[#F7F3EA]'
                            }`}
                          >
                            <Box className="w-3 h-3" />
                            Wireframe
                          </button>

                          <button
                            type="button"
                            onClick={() => setAutoRotate((prev) => !prev)}
                            aria-pressed={autoRotate}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded-md border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                              autoRotate
                                ? 'bg-[#29184B] text-[#E5C158] border-[#D4AF37]/60'
                                : 'bg-[#1C1133] text-[#D6CCE8] border-[#3F2D63] hover:text-[#F7F3EA]'
                            }`}
                          >
                            <Orbit className="w-3 h-3" />
                            Spin
                          </button>

                          <button
                            type="button"
                            onClick={handleReset}
                            title="Reset view"
                            aria-label="Reset view"
                            className="inline-flex items-center justify-center p-1.5 text-[#D6CCE8] hover:text-[#E5C158] bg-[#1C1133] border border-[#3F2D63] rounded-md cursor-pointer shrink-0"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-center">
                      <button
                        type="button"
                        onClick={() => setDockExpanded(true)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-[#E5C158] bg-[#140B26]/95 border border-[#4D3778] hover:border-[#D4AF37] rounded-lg shadow-lg cursor-pointer whitespace-nowrap"
                      >
                        <SlidersHorizontal className="w-3.5 h-3.5" />
                        Model Controls
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
