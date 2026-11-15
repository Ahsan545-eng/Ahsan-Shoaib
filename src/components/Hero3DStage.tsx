import { useEffect, useRef, useState } from 'react';
import {
  Box,
  ChevronDown,
  ChevronUp,
  Orbit,
  RotateCcw,
  SlidersHorizontal,
} from 'lucide-react';
import { HERO_IMAGE } from '../data/portfolioData';
import {
  createHeroSculptureScene,
  HeroSceneController,
  SculptureFinish,
} from '../three/createHeroSculptureScene';
import { ResilientImage } from './ResilientImage';

const FINISH_OPTIONS: { id: SculptureFinish; label: string; swatch: string }[] = [
  { id: 'natural', label: 'Natural', swatch: '#D6B68B' },
  { id: 'obsidian', label: 'Obsidian Gold', swatch: '#D4AF37' },
  { id: 'clay', label: 'Clay Model', swatch: '#E8E3DA' },
];

export function Hero3DStage() {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const controllerRef = useRef<HeroSceneController | null>(null);

  const [webglFailed, setWebglFailed] = useState(false);
  const [finish, setFinish] = useState<SculptureFinish>('natural');
  const [wireframe, setWireframe] = useState(false);
  const [explode, setExplode] = useState(0);
  const [autoRotate, setAutoRotate] = useState(true);
  const [dockExpanded, setDockExpanded] = useState(true);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const reducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    if (reducedMotion) {
      setAutoRotate(false);
    }

    let sceneController: HeroSceneController | null = null;
    try {
      sceneController = createHeroSculptureScene({
        container,
        reducedMotion,
        onContextLost: () => setWebglFailed(true),
        onContextRestored: () => setWebglFailed(false),
      });
      controllerRef.current = sceneController;
    } catch {
      setWebglFailed(true);
    }

    return () => {
      controllerRef.current = null;
      sceneController?.dispose();
    };
  }, []);

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

  if (webglFailed) {
    return (
      <div className="relative w-full h-full min-h-[420px] lg:min-h-[540px] rounded-2xl overflow-hidden border border-[#4D3778] bg-[#140B26]">
        <ResilientImage
          src={HERO_IMAGE.src}
          alt={HERO_IMAGE.alt}
          title="Ahsan Shoaib Studio"
          className="w-full h-full min-h-[420px] object-cover block"
        />
      </div>
    );
  }

  return (
    <div className="relative w-full h-full min-h-[440px] lg:min-h-[560px] rounded-2xl overflow-hidden border border-[#4D3778]/85 bg-[#120922]/75 shadow-2xl">
      {/* Dedicated Three.js Canvas Mount */}
      <div
        ref={mountRef}
        aria-label="Interactive 3D architectural model"
        className="w-full h-full min-h-[440px] lg:min-h-[560px] cursor-grab active:cursor-grabbing select-none"
      />

      {/* Collapsible Bottom 3D Control Dock */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-[540px] z-10">
        {dockExpanded ? (
          <div className="bg-[#140B26]/95 border border-[#4D3778] rounded-xl p-3 shadow-xl space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5" role="group" aria-label="Material study">
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
                  aria-label="Explode architectural layers"
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
    </div>
  );
}
