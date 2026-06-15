import React from 'react';
import { Slide, Project } from '../types';
import { Plus, Trash, Copy, ArrowUp, ArrowDown, LayoutTemplate } from 'lucide-react';
import { getPatternCSS } from '../utils/patternRenderer';

interface SlidesListProps {
  project: Project;
  activeSlideId: string;
  setActiveSlideId: (id: string) => void;
  onAddSlide: () => void;
  onDuplicateSlide: (slideId: string) => void;
  onDeleteSlide: (slideId: string) => void;
  onMoveSlide: (index: number, direction: 'up' | 'down') => void;
  slidePreviews?: Record<string, string>;
}

export default function SlidesList({
  project,
  activeSlideId,
  setActiveSlideId,
  onAddSlide,
  onDuplicateSlide,
  onDeleteSlide,
  onMoveSlide,
  slidePreviews,
}: SlidesListProps) {
  return (
    <div className="flex flex-col h-full bg-[#121214] border-[#222226] text-[#e0e0e0] w-full lg:w-64 shrink-0 overflow-hidden">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-[#222226] flex items-center justify-between shrink-0 bg-[#121214]">
        <div className="flex items-center gap-2.5">
          <LayoutTemplate className="w-4.5 h-4.5 text-indigo-400" />
          <h2 className="font-bold text-xs tracking-wider uppercase text-[#f4f4f7]">Slides Deck</h2>
        </div>
        <span className="text-[10px] bg-[#1a1a1c] text-[#88888f] border border-[#2d2d34] px-2 py-0.5 rounded-full font-mono font-bold">
          {project.slides.length} slides
        </span>
      </div>

      {/* Main Slide Carousel List Scrollable container */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4 no-scrollbar">
        {project.slides.map((slide, index) => {
          const isActive = slide.id === activeSlideId;
          
          // Generate thumbnail style
          const bgStyle: React.CSSProperties = {
            backgroundColor: slide.bgColor === 'transparent' ? '#000000' : slide.bgColor,
            opacity: slide.bgOpacity,
          };
          
          // Apply gradient thumbnail style 
          if (slide.bgGradient) {
            const { type, angle, stops } = slide.bgGradient;
            const stopStr = stops.map(s => `${s.color} ${s.offset}%`).join(', ');
            bgStyle.backgroundImage = type === 'linear' 
              ? `linear-gradient(${angle}deg, ${stopStr})`
              : `radial-gradient(circle, ${stopStr})`;
          }

          // Apply pattern thumbnail style
          const patternStyle = getPatternCSS(slide.bgPattern, slide.bgPatternColor);

          return (
            <div
              key={slide.id}
              onClick={() => setActiveSlideId(slide.id)}
              className={`group relative flex flex-col rounded-xl border p-2.5 transition-all duration-250 cursor-pointer ${
                isActive
                  ? 'border-indigo-500 bg-[#1e1e22]/90 shadow-lg shadow-black/30 ring-1 ring-indigo-500/20'
                  : 'border-[#222226] bg-[#0d0d0f] hover:bg-[#151518] hover:border-[#323238]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold text-[#88888f]">
                  #{String(index + 1).padStart(2, '0')}
                </span>
                
                {/* Rearrange buttons */}
                <div className="flex items-center gap-0.5 opacity-60 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onMoveSlide(index, 'up');
                    }}
                    disabled={index === 0}
                    className="p-1 hover:bg-[#222226] disabled:opacity-30 rounded text-[#88888f] hover:text-[#f4f4f7] transition-colors"
                    title="Move Slide Up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onMoveSlide(index, 'down');
                    }}
                    disabled={index === project.slides.length - 1}
                    className="p-1 hover:bg-[#222226] disabled:opacity-30 rounded text-[#88888f] hover:text-[#f4f4f7] transition-colors"
                    title="Move Slide Down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

               {/* Thumbnail Container */}
              <div className="relative w-full aspect-square rounded-lg overflow-hidden border border-[#222226] bg-[#09090b] flex items-center justify-center">
                
                {/* Background Representation */}
                <div className="absolute inset-0 transition-opacity" style={bgStyle} />
                {slide.bgPattern !== 'none' && (
                  <div className="absolute inset-0 mix-blend-overlay" style={patternStyle} />
                )}
                {slide.bgImage && (
                  <img
                    src={slide.bgImage}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{ opacity: slide.bgOpacity }}
                  />
                )}

                {/* Highly polished real-time master PNG previews */}
                {slidePreviews && slidePreviews[slide.id] ? (
                  <img
                    src={slidePreviews[slide.id]}
                    alt=""
                    className="absolute inset-0 w-full h-full object-contain pointer-events-none p-1 bg-black/30"
                  />
                ) : (
                  /* Micro Elements Display Fallback */
                  <div className="absolute inset-0 p-1 pointer-events-none overflow-hidden scale-30 origin-center flex flex-col justify-center items-center">
                    <div className="w-[333%] h-[333%] relative shrink-0">
                      {slide.elements.slice(0, 5).map((el) => {
                        // Mini dots representing content to show some style distribution logic
                        if (el.type === 'text') {
                          return (
                            <div
                              key={el.id}
                              className="bg-slate-100/75 rounded h-3 mb-1"
                              style={{
                                position: 'absolute',
                                left: `${(el.x / 1080) * 100}%`,
                                top: `${(el.y / 1080) * 100}%`,
                                width: `${(el.width / 1080) * 100}%`,
                                opacity: el.opacity,
                                backgroundColor: el.textColor || el.color || '#ffffff'
                              }}
                            />
                          );
                        }
                        if (el.type === 'shape') {
                          return (
                            <div
                              key={el.id}
                              className="rounded-sm opacity-50"
                              style={{
                                position: 'absolute',
                                left: `${(el.x / 1080) * 100}%`,
                                top: `${(el.y / 1080) * 100}%`,
                                width: `${(el.width / 1080) * 100}%`,
                                height: `${(el.height / 1080) * 100}%`,
                                backgroundColor: el.fillColor || '#4F46E5',
                                border: el.strokeWidth ? '1px solid white' : 'none'
                              }}
                            />
                          );
                        }
                        return null;
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Inline Action Controls */}
              <div className="absolute bottom-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-[#121214]/95 py-1 px-1.5 rounded-lg border border-[#2d2d34] backdrop-blur-md">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDuplicateSlide(slide.id);
                  }}
                  className="p-1 hover:bg-[#222226] text-indigo-400 hover:text-indigo-300 rounded transition-colors"
                  title="Duplicate Slide"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  disabled={project.slides.length <= 1}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteSlide(slide.id);
                  }}
                  className="p-1 hover:bg-[#222226] text-rose-400 hover:text-rose-300 disabled:opacity-40 rounded transition-colors"
                  title="Delete Slide"
                >
                  <Trash className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Slide Add Button Panel */}
      <div className="p-3.5 border-t border-[#222226] bg-[#0d0d0f] shrink-0">
        <button
          onClick={onAddSlide}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-[#f4f4f7] rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-200 shadow-md shadow-indigo-950/40 font-sans cursor-pointer hover:shadow-indigo-500/10 active:scale-98"
        >
          <Plus className="w-4 h-4" />
          Add New Slide
        </button>
      </div>
    </div>
  );
}
