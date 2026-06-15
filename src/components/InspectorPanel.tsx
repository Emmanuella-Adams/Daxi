import React, { useState } from 'react';
import { Project, Slide, CanvasElement, BgPatternType } from '../types';
import { ICONS_LIBRARY } from './IconsLibrary';
import { CURATED_COLOR_PALETTE, DEMO_IMAGES } from '../utils/defaultProject';
import {
  Sparkles,
  Type,
  Square,
  Image as ImageIcon,
  MousePointerClick,
  Palette,
  Settings,
  Layers,
  ChevronDown,
  Trash,
  Copy,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Sliders,
  Type as FontIcon,
  Video,
  UploadCloud
} from 'lucide-react';

interface InspectorPanelProps {
  project: Project;
  activeSlide: Slide;
  selectedElementId: string | null;
  setSelectedElementId: (id: string | null) => void;
  onUpdateProject: (updates: Partial<Project>) => void;
  onUpdateSlide: (slideId: string, updates: Partial<Slide>) => void;
  onUpdateElement: (elementId: string, updates: Partial<CanvasElement>) => void;
  onAddElement: (type: CanvasElement['type'], extra?: Partial<CanvasElement>) => void;
  onDeleteElement: (id: string) => void;
  onDuplicateElement: (id: string) => void;
  onApplyToAllSlides: () => void;
}

export default function InspectorPanel({
  project,
  activeSlide,
  selectedElementId,
  setSelectedElementId,
  onUpdateProject,
  onUpdateSlide,
  onUpdateElement,
  onAddElement,
  onDeleteElement,
  onDuplicateElement,
  onApplyToAllSlides,
}: InspectorPanelProps) {
  const [activeTab, setActiveTab] = useState<'canvas' | 'elements' | 'inspector'>('canvas');
  const [iconSearch, setIconSearch] = useState('');

  // Active element selector
  const selectedElement = activeSlide.elements.find((el) => el.id === selectedElementId);

  // Set active tab to inspector automatically when an element is clicked/selected
  React.useEffect(() => {
    if (selectedElementId) {
      setActiveTab('inspector');
    } else {
      setActiveTab('canvas');
    }
  }, [selectedElementId]);

  // Offline base64 image loader
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'bg' | 'element') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1.5 * 1024 * 1024) {
      alert('To maintain offline performance, image size is capped at 1.5MB.');
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        if (field === 'bg') {
          onUpdateSlide(activeSlide.id, { bgImage: reader.result });
        } else if (field === 'element' && selectedElementId) {
          onUpdateElement(selectedElementId, { imageSrc: reader.result });
        }
      }
    };
    reader.readAsDataURL(file);
  };

  // Reorder Elements (Bring to front / Send to back)
  const handleElementReorder = (direction: 'front' | 'back') => {
    if (!selectedElementId) return;
    const elementsCopy = [...activeSlide.elements];
    const idx = elementsCopy.findIndex((el) => el.id === selectedElementId);
    if (idx === -1) return;

    const [target] = elementsCopy.splice(idx, 1);
    if (direction === 'front') {
      elementsCopy.push(target); // push to end (renders last / top)
    } else {
      elementsCopy.unshift(target); // unshift to front (renders first / bottom)
    }

    onUpdateSlide(activeSlide.id, { elements: elementsCopy });
  };

  // Safe color picker handler to guarantee solid values
  const textFonts = ['Space Grotesk', 'Orbitron', 'Inter', 'Roboto', 'Poppins'];

  return (
    <div className="w-full lg:w-80 shrink-0 bg-[#121214] border-[#222226] text-[#e0e0e0] flex flex-col h-full overflow-hidden">
      {/* Tab Selectors */}
      <div className="flex border-b border-[#222226] bg-[#09090b] shrink-0 p-1.5 gap-1.5">
        <button
          onClick={() => setActiveTab('canvas')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-1 text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
            activeTab === 'canvas'
              ? 'bg-[#1e1e22]/90 text-[#f4f4f7] border border-[#2d2d34] shadow-md shadow-black/25'
              : 'text-[#88888f] hover:text-[#f4f4f7] hover:bg-[#151518]'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          Format
        </button>
        <button
          onClick={() => setActiveTab('elements')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-1 text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
            activeTab === 'elements'
              ? 'bg-[#1e1e22]/90 text-[#f4f4f7] border border-[#2d2d34] shadow-md shadow-black/25'
              : 'text-[#88888f] hover:text-[#f4f4f7] hover:bg-[#151518]'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          Add Layer
        </button>
        <button
          onClick={() => {
            if (selectedElementId) {
              setActiveTab('inspector');
            } else {
              alert('Please select an element on the canvas to inspect its settings.');
            }
          }}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-1 text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
            activeTab === 'inspector'
              ? 'bg-[#1e1e22]/90 text-[#f4f4f7] border border-[#2d2d34] shadow-md shadow-black/25'
              : 'text-[#88888f] hover:text-[#f4f4f7] hover:bg-[#151518]'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          Edit Layer
        </button>
      </div>

      {/* Tab Panels */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 no-scrollbar">
        {/* TAB 1: CANVAS LAYOUT & BACKGROUND SETTINGS */}
        {activeTab === 'canvas' && (
          <div className="space-y-6">
            {/* Project Details section */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase">Project Canvas Format</h3>
              
              {/* Presets Grid */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'linkedin', name: 'LinkedIn', dim: '1:1 square' },
                  { id: 'instagram', name: 'IG Post', dim: '1:1 square' },
                  { id: 'story', name: 'IG Story', dim: '9:16 portrait' },
                  { id: 'custom', name: 'Custom size', dim: 'Bespoke' }
                ].map((preset) => {
                  const isSel = project.platform === preset.id;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => {
                        let w = 1080;
                        let h = 1080;
                        if (preset.id === 'story') {
                          w = 1080;
                          h = 1080 * 16 / 9; // 1080x1920
                        } else if (preset.id === 'custom') {
                          w = 1200;
                          h = 630;
                        }
                        onUpdateProject({ platform: preset.id as any, width: w, height: h });
                      }}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        isSel
                          ? 'border-indigo-500 bg-indigo-950/20 text-white'
                          : 'border-slate-800 bg-slate-900 hover:bg-slate-800/60 text-slate-300'
                      }`}
                    >
                      <p className="font-semibold text-xs leading-tight">{preset.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono font-medium mt-0.5">{preset.dim}</p>
                    </button>
                  );
                })}
              </div>

              {/* Custom Sizes Inputs */}
              {project.platform === 'custom' && (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold block mb-1">C_WIDTH (PX)</label>
                    <input
                      type="number"
                      value={project.width}
                      min={300}
                      max={2000}
                      onChange={(e) => onUpdateProject({ width: parseInt(e.target.value) || 1080 })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 font-mono text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold block mb-1">C_HEIGHT (PX)</label>
                    <input
                      type="number"
                      value={project.height}
                      min={300}
                      max={2000}
                      onChange={(e) => onUpdateProject({ height: parseInt(e.target.value) || 1080 })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 font-mono text-xs text-white"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Slide background controls */}
            <div className="space-y-4 pt-4 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase">Slide Backdrop</h3>
                <button
                  onClick={onApplyToAllSlides}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold px-2 py-1 rounded transition-colors"
                  title="Make all slides in project match this background, pattern, and style"
                >
                  Apply to All
                </button>
              </div>

              {/* Solid Color Backdrop */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-300 block">Solid Color / Transparent</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={activeSlide.bgColor === 'transparent' ? '#000000' : activeSlide.bgColor}
                    onChange={(e) => onUpdateSlide(activeSlide.id, { bgColor: e.target.value })}
                    disabled={activeSlide.bgColor === 'transparent'}
                    className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent shrink-0"
                  />
                  <input
                    type="text"
                    value={activeSlide.bgColor}
                    onChange={(e) => onUpdateSlide(activeSlide.id, { bgColor: e.target.value })}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2 text-xs font-mono text-white h-8"
                  />
                  <button
                    onClick={() => onUpdateSlide(activeSlide.id, { bgColor: activeSlide.bgColor === 'transparent' ? '#0F172A' : 'transparent' })}
                    className={`px-2 py-1 rounded text-[10px] border font-bold transition-all ${
                      activeSlide.bgColor === 'transparent'
                        ? 'border-emerald-500 bg-emerald-950/20 text-emerald-400'
                        : 'border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Transparent
                  </button>
                </div>
              </div>

              {/* Curated Swatches Picker */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 font-bold block">VIBRANT & PASTEL PALETTE</label>
                <div className="grid grid-cols-8 gap-1.5">
                  {CURATED_COLOR_PALETTE.map((c) => (
                    <button
                      key={c}
                      onClick={() => onUpdateSlide(activeSlide.id, { bgColor: c })}
                      className="w-full aspect-square rounded-md border border-slate-950 transition-transform active:scale-90"
                      style={{ backgroundColor: c }}
                      title={c}
                    />
                  ))}
                </div>
              </div>

              {/* Gradients Stop section */}
              <div className="space-y-3 pt-3 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-slate-300">Gradient Backdrop</label>
                  {activeSlide.bgGradient ? (
                    <button
                      onClick={() => onUpdateSlide(activeSlide.id, { bgGradient: null })}
                      className="text-rose-400 hover:text-rose-300 text-[10px] font-bold"
                    >
                      Clear Gradient
                    </button>
                  ) : (
                    <button
                      onClick={() =>
                        onUpdateSlide(activeSlide.id, {
                          bgGradient: {
                            type: 'linear',
                            angle: 135,
                            stops: [
                              { offset: 0, color: '#4F46E5' },
                              { offset: 100, color: '#06B6D4' }
                            ]
                          }
                        })
                      }
                      className="text-indigo-400 hover:text-indigo-300 text-[10px] font-bold"
                    >
                      Create Gradient
                    </button>
                  )}
                </div>

                {activeSlide.bgGradient && (
                  <div className="space-y-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                    <div className="flex items-center gap-4">
                      <label className="text-[10px] text-slate-400 font-bold">TYPE</label>
                      <div className="flex bg-slate-900 rounded p-0.5 gap-1 shrink-0">
                        <button
                          onClick={() => {
                            if (activeSlide.bgGradient) {
                              onUpdateSlide(activeSlide.id, {
                                bgGradient: { ...activeSlide.bgGradient, type: 'linear' }
                              });
                            }
                          }}
                          className={`px-2 py-0.5 text-[10px] rounded ${
                            activeSlide.bgGradient.type === 'linear' ? 'bg-indigo-600 text-white' : 'text-slate-400'
                          }`}
                        >
                          Linear
                        </button>
                        <button
                          onClick={() => {
                            if (activeSlide.bgGradient) {
                              onUpdateSlide(activeSlide.id, {
                                bgGradient: { ...activeSlide.bgGradient, type: 'radial' }
                              });
                            }
                          }}
                          className={`px-2 py-0.5 text-[10px] rounded ${
                            activeSlide.bgGradient.type === 'radial' ? 'bg-indigo-600 text-white' : 'text-slate-400'
                          }`}
                        >
                          Radial
                        </button>
                      </div>
                    </div>

                    {activeSlide.bgGradient.type === 'linear' && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-mono text-slate-400">
                          <span>ANGLE ({activeSlide.bgGradient.angle}°)</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="360"
                          value={activeSlide.bgGradient.angle}
                          onChange={(e) => {
                            if (activeSlide.bgGradient) {
                              onUpdateSlide(activeSlide.id, {
                                bgGradient: { ...activeSlide.bgGradient, angle: parseInt(e.target.value) }
                              });
                            }
                          }}
                          className="w-full accent-indigo-500"
                        />
                      </div>
                    )}

                    {/* Simple Graduate Stops edit */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Stops Stops</span>
                      </div>
                      {activeSlide.bgGradient.stops.map((stop, sIdx) => (
                        <div key={sIdx} className="flex items-center gap-2">
                          <input
                            type="color"
                            value={stop.color}
                            onChange={(e) => {
                              if (activeSlide.bgGradient) {
                                const newStops = [...activeSlide.bgGradient.stops];
                                newStops[sIdx] = { ...newStops[sIdx], color: e.target.value };
                                onUpdateSlide(activeSlide.id, {
                                  bgGradient: { ...activeSlide.bgGradient, stops: newStops }
                                });
                              }
                            }}
                            className="w-6 h-6 rounded border-0 bg-transparent cursor-pointer"
                          />
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={stop.offset}
                            onChange={(e) => {
                              if (activeSlide.bgGradient) {
                                const newStops = [...activeSlide.bgGradient.stops];
                                newStops[sIdx] = { ...newStops[sIdx], offset: parseInt(e.target.value) };
                                onUpdateSlide(activeSlide.id, {
                                  bgGradient: { ...activeSlide.bgGradient, stops: newStops }
                                });
                              }
                            }}
                            className="flex-1 accent-indigo-500"
                          />
                          <span className="font-mono text-[10px] text-slate-400 w-8 text-right">{stop.offset}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Background pattern triggers */}
              <div className="space-y-3 pt-3 border-t border-slate-800">
                <label className="text-xs font-medium text-slate-300 block">Geometric Patterns</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['none', 'dots', 'stripes', 'zigzag', 'waves'] as BgPatternType[]).map((pat) => (
                    <button
                      key={pat}
                      onClick={() => onUpdateSlide(activeSlide.id, { bgPattern: pat })}
                      className={`text-[11px] font-sans px-3 py-1.5 rounded-lg border text-center font-medium capitalize transition-all ${
                        activeSlide.bgPattern === pat
                          ? 'border-indigo-500 bg-indigo-950/20 text-indigo-300'
                          : 'border-slate-800 bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {pat === 'none' ? 'No pattern' : pat}
                    </button>
                  ))}
                </div>

                {activeSlide.bgPattern !== 'none' && (
                  <div className="flex items-center justify-between gap-4 mt-2">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Pattern Color Color</span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={activeSlide.bgPatternColor.startsWith('rgba') ? '#ffffff' : activeSlide.bgPatternColor}
                        onChange={(e) => onUpdateSlide(activeSlide.id, { bgPatternColor: e.target.value })}
                        className="w-5 h-5 rounded border-0 bg-transparent cursor-pointer"
                      />
                      <input
                        type="text"
                        value={activeSlide.bgPatternColor}
                        onChange={(e) => onUpdateSlide(activeSlide.id, { bgPatternColor: e.target.value })}
                        className="w-24 bg-slate-950 border border-slate-850 rounded text-[10px] px-1 py-0.5 font-mono text-slate-300"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Background Image Upload */}
              <div className="space-y-3 pt-3 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-slate-300">Backdrop Picture</label>
                  {activeSlide.bgImage && (
                    <button
                      onClick={() => onUpdateSlide(activeSlide.id, { bgImage: null })}
                      className="text-rose-400 hover:text-rose-300 text-[10px] font-bold"
                    >
                      Remove Picture
                    </button>
                  )}
                </div>

                {/* Upload wrapper */}
                <div className="flex gap-2">
                  <label className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 border border-dashed border-slate-700 hover:border-slate-500 bg-slate-950 hover:bg-slate-950/80 rounded-lg cursor-pointer text-[11px] font-medium text-slate-300 transition-colors">
                    <ImageIcon className="w-3.5 h-3.5" />
                    Upload from computer
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'bg')}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Ambient Demopictures stock list */}
                <div className="space-y-1.5">
                  <span className="text-[10px] text-slate-500 font-bold block uppercase">Gradient Mesh presets</span>
                  <div className="grid grid-cols-4 gap-1.5">
                    {DEMO_IMAGES.map((url, idx) => (
                      <button
                        key={idx}
                        onClick={() => onUpdateSlide(activeSlide.id, { bgImage: url, bgOpacity: 0.8 })}
                        className="aspect-square rounded-lg border border-slate-800 hover:border-indigo-400 overflow-hidden relative"
                      >
                        <img src={url} alt="" className="absolute inset-0 w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>

                {activeSlide.bgImage && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-mono text-slate-400">
                      <span>PICTURE OPACITY ({Math.round(activeSlide.bgOpacity * 100)}%)</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={activeSlide.bgOpacity * 100}
                      onChange={(e) => onUpdateSlide(activeSlide.id, { bgOpacity: parseInt(e.target.value) / 100 })}
                      className="w-full accent-indigo-500"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ELEMENTS INJECT DRAWER */}
        {activeTab === 'elements' && (
          <div className="space-y-6">
            <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase">Add Slide Element</h3>

            {/* Quick add drawers */}
            <div className="space-y-4">
              {/* Add Text Presets */}
              <div className="space-y-2 bg-slate-950/40 p-3 rounded-lg border border-slate-850">
                <span className="text-[10px] text-indigo-400 font-bold block uppercase">Typography elements</span>
                <div className="flex flex-col gap-1.5">
                  <button
                    onClick={() =>
                      onAddElement('text', {
                        textContent: 'CATCHY TITLE HERE',
                        fontSize: 60,
                        fontFamily: 'Orbitron',
                        fontWeight: 800,
                        textColor: '#FFFFFF',
                        width: 900,
                        height: 150
                      })
                    }
                    className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded text-xs text-left"
                  >
                    <Type className="w-3.5 h-3.5 text-indigo-400" />
                    <strong>Add Display Header</strong> (large)
                  </button>
                  <button
                    onClick={() =>
                      onAddElement('text', {
                        textContent: 'Enter captivating subtitle supporting your main hook paragraph here.',
                        fontSize: 28,
                        fontFamily: 'Space Grotesk',
                        fontWeight: 400,
                        textColor: '#94A3B8',
                        width: 900,
                        height: 120
                      })
                    }
                    className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded text-xs text-left"
                  >
                    <Type className="w-3.5 h-3.5 text-indigo-400/80" />
                    <span>Add Body Statement</span> (medium)
                  </button>
                </div>
              </div>

              {/* Add Vector Shapes */}
              <div className="space-y-2 bg-slate-950/40 p-3 rounded-lg border border-slate-850">
                <span className="text-[10px] text-emerald-400 font-bold block uppercase">Visual Vector Shapes</span>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { id: 'rect', label: 'Box / Card' },
                    { id: 'circle', label: 'Circle' },
                    { id: 'triangle', label: 'Triangle' },
                    { id: 'star', label: 'Vector Star' },
                    { id: 'heart', label: 'Heart shape' },
                    { id: 'arrow', label: 'Pointer arrow' },
                    { id: 'speechBubble', label: '💬 Talk Bubble' },
                    { id: 'blob', label: '🧬 Organic Blob' },
                    { id: 'badge', label: '🎖️ Star Seal' },
                    { id: 'zigzag', label: '〰️ Zigzag' }
                  ].map((sh) => (
                    <button
                      key={sh.id}
                      onClick={() =>
                        onAddElement('shape', {
                          shapeType: sh.id as any,
                          width: sh.id === 'zigzag' ? 300 : sh.id === 'speechBubble' ? 220 : 200,
                          height: sh.id === 'zigzag' ? 100 : sh.id === 'speechBubble' ? 180 : 200,
                          fillColor: sh.id === 'star' || sh.id === 'badge' ? '#F59E0B' : sh.id === 'heart' ? '#EF4444' : sh.id === 'speechBubble' ? '#EC4899' : sh.id === 'blob' ? '#8B5CF6' : '#4F46E5',
                          strokeColor: '#FFFFFF',
                          strokeWidth: 0,
                          borderRadius: sh.id === 'rect' ? 16 : 0
                        })
                      }
                      className="flex items-center gap-1.5 justify-center py-1.5 px-1 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded text-[11px] font-medium cursor-pointer transition-colors"
                    >
                      <Square className="w-3 h-3 text-emerald-400 shrink-0" />
                      {sh.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Add Button CTA */}
              <div className="space-y-2 bg-slate-950/40 p-3 rounded-lg border border-slate-850">
                <span className="text-[10px] text-pink-400 font-bold block uppercase">Call to Action buttons</span>
                <button
                  onClick={() =>
                    onAddElement('cta', {
                      ctaText: 'START SWIPING NOW',
                      ctaStyle: 'solid',
                      ctaBg: '#EF4444',
                      ctaTextColor: '#FFFFFF',
                      ctaBorderRadius: 30,
                      width: 450,
                      height: 90,
                      fontSize: 22,
                      fontFamily: 'Orbitron',
                      fontWeight: 700
                    })
                  }
                  className="w-full flex items-center gap-2 justify-center py-2 px-3 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded font-bold text-xs"
                >
                  <MousePointerClick className="w-4 h-4 text-pink-400" />
                  Add Clickable CTA Button
                </button>
              </div>

              {/* Add Picture elements */}
              <div className="space-y-2.5 bg-slate-950/40 p-3 rounded-lg border border-slate-850">
                <span className="text-[10px] text-amber-400 font-bold block uppercase">Picture frame layer</span>
                <button
                  onClick={() =>
                    onAddElement('image', {
                      width: 350,
                      height: 350,
                      imageBorderRadius: 24,
                      imageBorderWidth: 4,
                      imageBorderColor: '#FFFFFF',
                      cropX: 0,
                      cropY: 0,
                      cropW: 100,
                      cropH: 100
                    })
                  }
                  className="w-full flex items-center gap-2 justify-center py-2 px-3 bg-slate-900 border border-slate-800 hover:bg-slate-850 rounded font-sans text-xs font-semibold cursor-pointer transition-colors"
                >
                  <ImageIcon className="w-4 h-4 text-amber-400" />
                  Add Empty Image Frame
                </button>

                <div className="relative border border-dashed border-[#2d2d34] hover:border-amber-400/50 rounded-lg p-3 text-center bg-[#09090b]/40 hover:bg-[#09090b]/80 transition-all cursor-pointer group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      if (file.size > 2 * 1024 * 1024) {
                        alert('To maintain app performance, image size is capped at 2MB.');
                      }
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        if (typeof reader.result === 'string') {
                          onAddElement('image', {
                            imageSrc: reader.result,
                            width: 350,
                            height: 350,
                            imageBorderRadius: 16,
                            imageBorderWidth: 0,
                            imageBorderColor: '#FFFFFF',
                            cropX: 0,
                            cropY: 0,
                            cropW: 100,
                            cropH: 100
                          });
                        }
                      };
                      reader.readAsDataURL(file);
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                  />
                  <div className="flex flex-col items-center justify-center gap-1.5 p-1">
                    <UploadCloud className="w-6 h-6 text-slate-500 group-hover:text-amber-400 transition-colors" />
                    <span className="text-[11px] font-semibold text-slate-300">Upload custom image...</span>
                    <span className="text-[9px] text-[#88888f]">Click to browse JPG, PNG, GIF</span>
                  </div>
                </div>
              </div>

              {/* Vector Icons search & inject */}
              <div className="space-y-2 pt-2">
                <span className="text-[10px] text-cyan-400 font-semibold block uppercase">Search 50+ Custom Icons</span>
                <input
                  type="text"
                  placeholder="Seach (e.g. check, arrow, social...)"
                  value={iconSearch}
                  onChange={(e) => setIconSearch(e.target.value.toLowerCase())}
                  className="w-full bg-slate-950 border border-slate-850 rounded p-1.5 text-xs text-white placeholder-slate-500"
                />

                <div className="grid grid-cols-4 gap-1.5 max-h-48 overflow-y-auto p-1 bg-slate-950/20 border border-slate-850 rounded no-scrollbar">
                  {Object.entries(ICONS_LIBRARY)
                    .filter(([key, value]) => key.includes(iconSearch) || value.name.toLowerCase().includes(iconSearch))
                    .map(([key, value]) => (
                      <button
                        key={key}
                        onClick={() =>
                          onAddElement('icon', {
                            iconName: key,
                            width: 120,
                            height: 120,
                            iconColor: value.category === 'social' ? '#3B82F6' : '#F59E0B'
                          })
                        }
                        className="p-2 bg-slate-900 hover:bg-indigo-950 border border-slate-800 hover:border-indigo-500 rounded flex flex-col items-center justify-center text-slate-300 hover:text-white transition-all group scale-active active:scale-95"
                        title={value.name}
                      >
                        <svg className="w-6 h-6 shrink-0 text-slate-300 group-hover:text-indigo-400" viewBox={value.viewBox} fill="currentColor">
                          {value.paths.map((p, idx) => (
                            <path key={idx} d={p} />
                          ))}
                        </svg>
                      </button>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: ELEMENT PROPERTIES INSPECTOR */}
        {activeTab === 'inspector' && (
          <div className="space-y-6">
            {!selectedElement ? (
              <div className="text-center py-12 text-slate-500">
                <MousePointerClick className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-xs">No canvas layer is selected.</p>
                <p className="text-[10px] mt-1 text-slate-400">Click on any title, visual shape, button, or icon to reveal its settings here.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Visual Type indicator and layer removal actions */}
                <div className="flex items-center justify-between p-2 bg-slate-950/40 border border-slate-850 rounded-xl shrink-0">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Selected Selected Layer</span>
                    <p className="text-xs capitalize font-bold text-indigo-400">{selectedElement.type} Element</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onDuplicateElement(selectedElement.id)}
                      className="p-1 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded"
                      title="Duplicate Layer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteElement(selectedElement.id)}
                      className="p-1 hover:bg-slate-800 text-rose-400 hover:text-rose-300 rounded"
                      title="Delete Layer"
                    >
                      <Trash className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Layer Arrangement Depth */}
                <div className="space-y-1.5">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Visual Arrangement Index</span>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      onClick={() => handleElementReorder('front')}
                      className="flex items-center justify-center gap-1 py-1 px-2 border border-slate-800 bg-slate-900 text-[10px] font-bold rounded"
                    >
                      Bring to Front (First Row)
                    </button>
                    <button
                      onClick={() => handleElementReorder('back')}
                      className="flex items-center justify-center gap-1 py-1 px-2 border border-slate-800 bg-slate-900 text-[10px] font-bold rounded"
                    >
                      Send to Back (Bottom backdrop)
                    </button>
                  </div>
                </div>

                {/* Common parameters: size, position, rotate, opacity */}
                <div className="space-y-3 bg-slate-950/20 p-3 rounded-xl border border-slate-850">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Coordinates & Scales</span>
                  
                  {/* Position coordinates row */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 block mb-1 font-bold">X HORIZONTAL</span>
                      <input
                        type="number"
                        value={selectedElement.x}
                        onChange={(e) => onUpdateElement(selectedElement.id, { x: parseInt(e.target.value) || 0 })}
                        className="w-full bg-slate-955 border border-slate-850 rounded p-1 font-mono text-center"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block mb-1 font-bold">Y VERTICAL</span>
                      <input
                        type="number"
                        value={selectedElement.y}
                        onChange={(e) => onUpdateElement(selectedElement.id, { y: parseInt(e.target.value) || 0 })}
                        className="w-full bg-slate-955 border border-slate-850 rounded p-1 font-mono text-center"
                      />
                    </div>
                  </div>

                  {/* Size coordinates row */}
                  <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                    <div>
                      <span className="text-[10px] text-slate-500 block mb-1 font-bold">SIZE WIDTH (PX)</span>
                      <input
                        type="number"
                        value={selectedElement.width}
                        onChange={(e) => onUpdateElement(selectedElement.id, { width: parseInt(e.target.value) || 10 })}
                        className="w-full bg-slate-955 border border-slate-850 rounded p-1 font-mono text-center"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block mb-1 font-bold">SIZE HEIGHT (PX)</span>
                      <input
                        type="number"
                        value={selectedElement.height}
                        onChange={(e) => onUpdateElement(selectedElement.id, { height: parseInt(e.target.value) || 10 })}
                        className="w-full bg-slate-955 border border-slate-850 rounded p-1 font-mono text-center"
                      />
                    </div>
                  </div>

                  {/* Opacity slider control */}
                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between text-[10px] font-mono text-slate-400">
                      <span>LAYER OPACITY</span>
                      <span>{Math.round((selectedElement.opacity ?? 1) * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={(selectedElement.opacity ?? 1) * 100}
                      onChange={(e) => onUpdateElement(selectedElement.id, { opacity: parseInt(e.target.value) / 100 })}
                      className="w-full accent-indigo-500"
                    />
                  </div>

                  {/* Rotation Slider Control */}
                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between text-[10px] font-mono text-slate-400">
                      <span>ROTATE ({selectedElement.rotation ?? 0}°)</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      value={selectedElement.rotation ?? 0}
                      onChange={(e) => onUpdateElement(selectedElement.id, { rotation: parseInt(e.target.value) })}
                      className="w-full accent-indigo-500"
                    />
                  </div>
                </div>

                {/* TEXT SPECIFIC CONTROLS */}
                {selectedElement.type === 'text' && (
                  <div className="space-y-4 pt-3 border-t border-slate-800">
                    <h4 className="text-[10px] text-indigo-400 font-bold block uppercase tracking-wider">Typography Settings</h4>

                    {/* Text Area */}
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 font-bold block">EDIT TEXT CONTENT</label>
                      <textarea
                        value={selectedElement.textContent}
                        onChange={(e) => onUpdateElement(selectedElement.id, { textContent: e.target.value })}
                        rows={3}
                        className="w-full bg-slate-950 border border-slate-850 rounded p-2 text-xs text-white line-height-tight"
                        placeholder="Double-click to write text..."
                      />
                    </div>

                    {/* Font Family selector */}
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 font-bold block">FONT FAMILY</label>
                      <select
                        value={selectedElement.fontFamily || 'Inter'}
                        onChange={(e) => onUpdateElement(selectedElement.id, { fontFamily: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-850 rounded p-2 text-xs text-white"
                      >
                        {textFonts.map((f) => (
                          <option key={f} value={f}>
                            {f}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Font Weight and Size Row */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block mb-1 font-bold">FONT WEIGHT</span>
                        <select
                          value={selectedElement.fontWeight || 400}
                          onChange={(e) => onUpdateElement(selectedElement.id, { fontWeight: parseInt(e.target.value) })}
                          className="w-full bg-slate-950 border border-slate-850 rounded p-1.5 text-xs text-white"
                        >
                          {[300, 400, 500, 600, 700, 800].map((w) => (
                            <option key={w} value={w}>
                              {w} (Weight)
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-400 block mb-1 font-bold">FONT SIZE (PX)</span>
                        <input
                          type="number"
                          value={selectedElement.fontSize || 32}
                          min={12}
                          max={150}
                          onChange={(e) => onUpdateElement(selectedElement.id, { fontSize: parseInt(e.target.value) || 32 })}
                          className="w-full bg-slate-950 border border-slate-850 rounded p-1.5 text-xs font-mono text-center text-white"
                        />
                      </div>
                    </div>

                    {/* Color picker */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-slate-400 font-bold block">TEXT COLOR</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={selectedElement.textColor || selectedElement.color || '#ffffff'}
                          onChange={(e) => onUpdateElement(selectedElement.id, { textColor: e.target.value, color: e.target.value })}
                          className="w-8 h-8 rounded border-0 bg-transparent cursor-pointer shrink-0"
                        />
                        <input
                          type="text"
                          value={selectedElement.textColor || selectedElement.color || '#ffffff'}
                          onChange={(e) => onUpdateElement(selectedElement.id, { textColor: e.target.value, color: e.target.value })}
                          className="flex-1 bg-slate-950 border border-slate-800 rounded px-2 text-xs font-mono text-white h-8"
                        />
                      </div>
                    </div>

                    {/* Left/Center/Right alignments */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-slate-400 font-bold block">ALIGNMENT</label>
                      <div className="flex bg-slate-950 rounded p-0.5 gap-1 border border-slate-850">
                        {['left', 'center', 'right'].map((align) => (
                          <button
                            key={align}
                            onClick={() => onUpdateElement(selectedElement.id, { align: align as any })}
                            className={`flex-1 py-1 text-xs rounded capitalize font-medium ${
                              selectedElement.align === align || (!selectedElement.align && align === 'left')
                                ? 'bg-indigo-600 text-white'
                                : 'text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            {align}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Letter Spacing and Line height multipliers */}
                    <div className="space-y-3 pt-2 bg-slate-950/20 p-2.5 rounded-lg border border-slate-850">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">Advanced Spacing</span>
                      
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-mono text-slate-400">
                          <span>LETTER SPACING</span>
                          <span>{selectedElement.letterSpacing ?? 0}px</span>
                        </div>
                        <input
                          type="range"
                          min="-2"
                          max="20"
                          value={selectedElement.letterSpacing ?? 0}
                          onChange={(e) => onUpdateElement(selectedElement.id, { letterSpacing: parseInt(e.target.value) })}
                          className="w-full accent-indigo-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-mono text-slate-400">
                          <span>LINE HEIGHT MULTIPLIER</span>
                          <span>{selectedElement.lineHeight ?? 1.2}x</span>
                        </div>
                        <input
                          type="range"
                          min="0.8"
                          max="2.5"
                          step="0.05"
                          value={selectedElement.lineHeight ?? 1.2}
                          onChange={(e) => onUpdateElement(selectedElement.id, { lineHeight: parseFloat(e.target.value) })}
                          className="w-full accent-indigo-500"
                        />
                      </div>
                    </div>

                    {/* TEXT EFFECTS: DROP SHADOW */}
                    <div className="space-y-2 pt-3 border-t border-slate-850 bg-slate-950/20 p-2.5 rounded-lg border">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-slate-300 font-bold">Drop Shadow Effect</span>
                        <input
                          type="checkbox"
                          checked={selectedElement.shadowEnabled || false}
                          onChange={(e) => onUpdateElement(selectedElement.id, { shadowEnabled: e.target.checked })}
                          className="accent-indigo-500 rounded"
                        />
                      </div>

                      {selectedElement.shadowEnabled && (
                        <div className="space-y-2 pt-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-slate-400 w-16 shrink-0">Color Color</span>
                            <input
                              type="color"
                              value={selectedElement.shadowColor || '#000000'}
                              onChange={(e) => onUpdateElement(selectedElement.id, { shadowColor: e.target.value })}
                              className="w-5 h-5 bg-transparent border-0 cursor-pointer"
                            />
                            <input
                              type="text"
                              value={selectedElement.shadowColor || '#000000'}
                              onChange={(e) => onUpdateElement(selectedElement.id, { shadowColor: e.target.value })}
                              className="flex-1 bg-slate-950 border border-slate-850 rounded text-[10px] px-1.5 py-0.5 font-mono text-slate-300"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-[10px]">
                            <div>
                              <span>Offset X: {selectedElement.shadowOffsetX ?? 2}px</span>
                              <input
                                type="range"
                                min="-15"
                                max="15"
                                value={selectedElement.shadowOffsetX ?? 2}
                                onChange={(e) => onUpdateElement(selectedElement.id, { shadowOffsetX: parseInt(e.target.value) })}
                                className="w-full accent-indigo-500"
                              />
                            </div>
                            <div>
                              <span>Offset Y: {selectedElement.shadowOffsetY ?? 2}px</span>
                              <input
                                type="range"
                                min="-15"
                                max="15"
                                value={selectedElement.shadowOffsetY ?? 2}
                                onChange={(e) => onUpdateElement(selectedElement.id, { shadowOffsetY: parseInt(e.target.value) })}
                                className="w-full accent-indigo-500"
                              />
                            </div>
                          </div>

                          <div className="space-y-1 text-[10px]">
                            <span>Blur radius: {selectedElement.shadowBlur ?? 4}px</span>
                            <input
                              type="range"
                              min="0"
                              max="30"
                              value={selectedElement.shadowBlur ?? 4}
                              onChange={(e) => onUpdateElement(selectedElement.id, { shadowBlur: parseInt(e.target.value) })}
                              className="w-full accent-indigo-500"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* TEXT EFFECTS: GLOW EFFECT */}
                    <div className="space-y-2 pt-3 border-t border-slate-850 bg-slate-950/20 p-2.5 rounded-lg border">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-slate-300 font-bold">Outer Glow Effect</span>
                        <input
                          type="checkbox"
                          checked={selectedElement.glowEnabled || false}
                          onChange={(e) => onUpdateElement(selectedElement.id, { glowEnabled: e.target.checked })}
                          className="accent-indigo-500 rounded"
                        />
                      </div>

                      {selectedElement.glowEnabled && (
                        <div className="space-y-2 pt-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-slate-400 w-16 shrink-0">Glow Color</span>
                            <input
                              type="color"
                              value={selectedElement.glowColor || '#FFFFFF'}
                              onChange={(e) => onUpdateElement(selectedElement.id, { glowColor: e.target.value })}
                              className="w-5 h-5 bg-transparent border-0 cursor-pointer"
                            />
                            <input
                              type="text"
                              value={selectedElement.glowColor || '#FFFFFF'}
                              onChange={(e) => onUpdateElement(selectedElement.id, { glowColor: e.target.value })}
                              className="flex-1 bg-slate-950 border border-slate-850 rounded text-[10px] px-1.5 py-0.5 font-mono text-slate-300"
                            />
                          </div>

                          <div className="space-y-1 text-[10px]">
                            <span>Glow blur: {selectedElement.glowBlur ?? 10}px</span>
                            <input
                              type="range"
                              min="2"
                              max="40"
                              value={selectedElement.glowBlur ?? 10}
                              onChange={(e) => onUpdateElement(selectedElement.id, { glowBlur: parseInt(e.target.value) })}
                              className="w-full accent-indigo-500"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* TEXT EFFECTS: OUTLINE STROKE */}
                    <div className="space-y-2 pt-3 border-t border-slate-850 bg-slate-950/20 p-2.5 rounded-lg border">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-slate-300 font-bold">Text Outline (Stroke)</span>
                        <input
                          type="checkbox"
                          checked={selectedElement.strokeEnabled || false}
                          onChange={(e) => onUpdateElement(selectedElement.id, { strokeEnabled: e.target.checked })}
                          className="accent-indigo-500 rounded"
                        />
                      </div>

                      {selectedElement.strokeEnabled && (
                        <div className="space-y-2 pt-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-slate-400 w-16 shrink-0">Stroke Color</span>
                            <input
                              type="color"
                              value={selectedElement.strokeColor || '#000000'}
                              onChange={(e) => onUpdateElement(selectedElement.id, { strokeColor: e.target.value })}
                              className="w-5 h-5 bg-transparent border-0 cursor-pointer"
                            />
                            <input
                              type="text"
                              value={selectedElement.strokeColor || '#000000'}
                              onChange={(e) => onUpdateElement(selectedElement.id, { strokeColor: e.target.value })}
                              className="flex-1 bg-slate-950 border border-slate-850 rounded text-[10px] px-1.5 py-0.5 font-mono text-slate-300"
                            />
                          </div>

                          <div className="space-y-1 text-[10px]">
                            <span>Thickness: {selectedElement.strokeWidth ?? 2}px</span>
                            <input
                              type="range"
                              min="1"
                              max="10"
                              value={selectedElement.strokeWidth ?? 2}
                              onChange={(e) => onUpdateElement(selectedElement.id, { strokeWidth: parseInt(e.target.value) })}
                              className="w-full accent-indigo-500"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* SHAPE SPECIFIC CONTROLS */}
                {selectedElement.type === 'shape' && (
                  <div className="space-y-4 pt-3 border-t border-slate-800">
                    <h4 className="text-[10px] text-emerald-400 font-bold block uppercase tracking-wider">Shape parameters</h4>

                    {/* Shape Type toggle selector */}
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 font-bold block">SHAPE TYPE</label>
                      <select
                        value={selectedElement.shapeType || 'rect'}
                        onChange={(e) => onUpdateElement(selectedElement.id, { shapeType: e.target.value as any })}
                        className="w-full bg-slate-950 border border-slate-850 rounded p-2 text-xs text-white"
                      >
                        <option value="rect">Rectangle / Square</option>
                        <option value="circle">Circle / Oval</option>
                        <option value="triangle">Triangle</option>
                        <option value="star">Star Vector</option>
                        <option value="heart">Heart Shape</option>
                        <option value="arrow">Pointer Arrow</option>
                        <option value="speechBubble">Talk / Speech Bubble</option>
                        <option value="blob">Organic Blob Shape</option>
                        <option value="badge">Star Seal Badge</option>
                        <option value="zigzag">Zigzag Scribble Line</option>
                      </select>
                    </div>

                    {/* Fill Color */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-slate-400 font-bold block">FILL COLOR</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={selectedElement.fillColor === 'transparent' ? '#000000' : selectedElement.fillColor || '#4f46e5'}
                          onChange={(e) => onUpdateElement(selectedElement.id, { fillColor: e.target.value })}
                          disabled={selectedElement.fillColor === 'transparent'}
                          className="w-8 h-8 rounded border-0 bg-transparent cursor-pointer shrink-0"
                        />
                        <input
                          type="text"
                          value={selectedElement.fillColor || '#4f46e5'}
                          onChange={(e) => onUpdateElement(selectedElement.id, { fillColor: e.target.value })}
                          className="flex-1 bg-slate-950 border border-slate-800 rounded px-2 text-xs font-mono text-white h-8"
                        />
                      </div>
                    </div>

                    {/* Custom Corner border radius (Rectangle only) */}
                    {selectedElement.shapeType === 'rect' && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-mono text-slate-400">
                          <span>ROUNDED CORNERS (BORDER RADIUS)</span>
                          <span>{selectedElement.borderRadius ?? 0}px</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="150"
                          value={selectedElement.borderRadius ?? 0}
                          onChange={(e) => onUpdateElement(selectedElement.id, { borderRadius: parseInt(e.target.value) })}
                          className="w-full accent-indigo-500"
                        />
                      </div>
                    )}

                    {/* Shape Outline border stroke */}
                    <div className="space-y-3 pt-3 bg-slate-950/25 p-2.5 rounded-lg border border-slate-850">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">Custom Outline Shape Border</span>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-500 w-16 shrink-0">Border Color</span>
                        <input
                          type="color"
                          value={selectedElement.strokeColor || '#FFFFFF'}
                          onChange={(e) => onUpdateElement(selectedElement.id, { strokeColor: e.target.value })}
                          className="w-5 h-5 bg-transparent border-0 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={selectedElement.strokeColor || '#FFFFFF'}
                          onChange={(e) => onUpdateElement(selectedElement.id, { strokeColor: e.target.value })}
                          className="flex-1 bg-slate-950 border border-slate-850 rounded text-[10px] px-1.5 py-0.5 font-mono text-slate-300"
                        />
                      </div>

                      <div className="space-y-1 text-[10px]">
                        <span>Border thickness: {selectedElement.strokeWidth ?? 0}px</span>
                        <input
                          type="range"
                          min="0"
                          max="20"
                          value={selectedElement.strokeWidth ?? 0}
                          onChange={(e) => onUpdateElement(selectedElement.id, { strokeWidth: parseInt(e.target.value) })}
                          className="w-full accent-indigo-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* IMAGE FRAME SPECIFIC CONTROLS WITH SLIDER CROP */}
                {selectedElement.type === 'image' && (
                  <div className="space-y-4 pt-3 border-t border-slate-800">
                    <h4 className="text-[10px] text-amber-500 font-bold block uppercase tracking-wider">Photo Frame settings</h4>

                    {/* Upload Replace Image */}
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 font-bold block">REPLACE / CHOOSE FILE</label>
                      <label className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-950 border border-dashed border-slate-800 hover:border-slate-500 rounded-lg cursor-pointer text-xs font-semibold hover:bg-slate-950/70 transition-colors">
                        <ImageIcon className="w-4.5 h-4.5 text-amber-500" />
                        Upload new image file
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, 'element')}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {/* Stock gradients option */}
                    <div className="space-y-1 text-[10px]">
                      <span className="text-slate-500 font-bold block uppercase">Select Mesh Backdrop</span>
                      <div className="grid grid-cols-4 gap-1">
                        {DEMO_IMAGES.map((url, index) => (
                          <button
                            key={index}
                            onClick={() => onUpdateElement(selectedElement.id, { imageSrc: url })}
                            className="aspect-square border border-slate-850 hover:border-amber-400 rounded-md overflow-hidden relative"
                          >
                            <img src={url} alt="" className="absolute inset-0 w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* IMAGE SHAPE ROUNDING CORNERS & STYLE */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-mono text-slate-400">
                        <span>CORNER ROUNDING (RADIUS)</span>
                        <span>{selectedElement.imageBorderRadius ?? 0}px</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="180"
                        value={selectedElement.imageBorderRadius ?? 0}
                        onChange={(e) => onUpdateElement(selectedElement.id, { imageBorderRadius: parseInt(e.target.value) })}
                        className="w-full accent-indigo-500"
                      />
                    </div>

                    {/* image custom outline */}
                    <div className="space-y-3 pt-3 bg-slate-950/25 p-2.5 rounded-lg border border-slate-850">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase font-mono">Custom Outer Border Frame</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-500 w-16 shrink-0">Border Color</span>
                        <input
                          type="color"
                          value={selectedElement.imageBorderColor || '#FFFFFF'}
                          onChange={(e) => onUpdateElement(selectedElement.id, { imageBorderColor: e.target.value })}
                          className="w-5 h-5 bg-transparent border-0 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={selectedElement.imageBorderColor || '#FFFFFF'}
                          onChange={(e) => onUpdateElement(selectedElement.id, { imageBorderColor: e.target.value })}
                          className="flex-1 bg-slate-950 border border-slate-850 rounded text-[10px] px-1.5 py-0.5 font-mono text-slate-300"
                        />
                      </div>

                      <div className="space-y-1 text-[10px]">
                        <span>Border thickness: {selectedElement.imageBorderWidth ?? 0}px</span>
                        <input
                          type="range"
                          min="0"
                          max="20"
                          value={selectedElement.imageBorderWidth ?? 0}
                          onChange={(e) => onUpdateElement(selectedElement.id, { imageBorderWidth: parseInt(e.target.value) })}
                          className="w-full accent-indigo-500"
                        />
                      </div>
                    </div>

                    {/* CROP ADVANCED SLIDERS */}
                    <div className="space-y-3 pt-3 bg-slate-950/40 p-3 rounded-lg border border-slate-850">
                      <span className="text-[10px] text-amber-500 font-bold block uppercase tracking-wider">Crop & Resize Controls (Sliders)</span>
                      
                      <div className="space-y-1 text-[10px]">
                        <div className="flex justify-between font-mono">
                          <span>HORIZONTAL CROP START</span>
                          <span>{selectedElement.cropX ?? 0}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="90"
                          value={selectedElement.cropX ?? 0}
                          onChange={(e) => onUpdateElement(selectedElement.id, { cropX: parseInt(e.target.value) })}
                          className="w-full accent-amber-500"
                        />
                      </div>

                      <div className="space-y-1 text-[10px]">
                        <div className="flex justify-between font-mono">
                          <span>VERTICAL CROP START</span>
                          <span>{selectedElement.cropY ?? 0}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="90"
                          value={selectedElement.cropY ?? 0}
                          onChange={(e) => onUpdateElement(selectedElement.id, { cropY: parseInt(e.target.value) })}
                          className="w-full accent-amber-500"
                        />
                      </div>

                      <div className="space-y-1 text-[10px]">
                        <div className="flex justify-between font-mono">
                          <span>CROP SPAN WIDTH</span>
                          <span>{selectedElement.cropW ?? 100}%</span>
                        </div>
                        <input
                          type="range"
                          min="10"
                          max="100"
                          value={selectedElement.cropW ?? 100}
                          onChange={(e) => onUpdateElement(selectedElement.id, { cropW: parseInt(e.target.value) })}
                          className="w-full accent-amber-500"
                        />
                      </div>

                      <div className="space-y-1 text-[10px]">
                        <div className="flex justify-between font-mono">
                          <span>CROP SPAN HEIGHT</span>
                          <span>{selectedElement.cropH ?? 100}%</span>
                        </div>
                        <input
                          type="range"
                          min="10"
                          max="100"
                          value={selectedElement.cropH ?? 100}
                          onChange={(e) => onUpdateElement(selectedElement.id, { cropH: parseInt(e.target.value) })}
                          className="w-full accent-amber-500"
                        />
                      </div>

                      {/* Reset Crops button */}
                      <button
                        onClick={() => onUpdateElement(selectedElement.id, { cropX: 0, cropY: 0, cropW: 100, cropH: 100 })}
                        className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded font-bold text-[10px] text-slate-300"
                      >
                        <RefreshCw className="w-3 h-3" />
                        Reset Crop Sliders
                      </button>
                    </div>
                  </div>
                )}

                {/* SVG VECTOR ICONS SPECIFIC CONTROLS */}
                {selectedElement.type === 'icon' && (
                  <div className="space-y-4 pt-3 border-t border-slate-800">
                    <h4 className="text-[10px] text-cyan-400 font-bold block uppercase tracking-wider">Vector Icon parameters</h4>

                    {/* Vector Color */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-slate-400 font-bold block">ICON COLOR</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={selectedElement.iconColor || '#F59E0B'}
                          onChange={(e) => onUpdateElement(selectedElement.id, { iconColor: e.target.value })}
                          className="w-8 h-8 rounded border-0 bg-transparent cursor-pointer shrink-0"
                        />
                        <input
                          type="text"
                          value={selectedElement.iconColor || '#F59E0B'}
                          onChange={(e) => onUpdateElement(selectedElement.id, { iconColor: e.target.value })}
                          className="flex-1 bg-slate-950 border border-slate-800 rounded px-2 text-xs font-mono text-white h-8"
                        />
                      </div>
                    </div>

                    {/* Mini Switch Grid to replace Icon */}
                    <div className="space-y-2">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase font-mono">Switch Icon Graphic</span>
                      <div className="grid grid-cols-6 gap-1 h-28 overflow-y-auto bg-slate-950/20 p-1 border border-slate-850 rounded no-scrollbar">
                        {Object.entries(ICONS_LIBRARY).map(([key, value]) => (
                          <button
                            key={key}
                            onClick={() => onUpdateElement(selectedElement.id, { iconName: key })}
                            className={`p-1.5 rounded transition-all flex items-center justify-center ${
                              selectedElement.iconName === key
                                ? 'bg-indigo-600 border border-indigo-400 text-white'
                                : 'bg-slate-900 hover:bg-slate-850 border border-slate-850 text-slate-400 hover:text-slate-200'
                            }`}
                            title={value.name}
                          >
                            <svg className="w-4 h-4 shrink-0" viewBox={value.viewBox} fill="currentColor">
                              {value.paths.map((p, idx) => (
                                <path key={idx} d={p} />
                              ))}
                            </svg>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* CALL TO ACTION BUTTON CONTROL SPECIFIC */}
                {selectedElement.type === 'cta' && (
                  <div className="space-y-4 pt-3 border-t border-slate-800">
                    <h4 className="text-[10px] text-pink-400 font-bold block uppercase tracking-wider">CTA Button Settings</h4>

                    {/* Button Text Area */}
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 font-bold block">BUTTON TEXT LABEL</label>
                      <input
                        type="text"
                        value={selectedElement.ctaText || 'Click Here'}
                        onChange={(e) => onUpdateElement(selectedElement.id, { ctaText: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-850 rounded p-2 text-xs text-white"
                      />
                    </div>

                    {/* CTA Style (solid or outline) */}
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 font-bold block">BUTTON STYLE THEME</label>
                      <div className="flex bg-slate-950 border border-slate-850 rounded p-0.5 gap-1">
                        {['solid', 'outline'].map((s) => (
                          <button
                            key={s}
                            onClick={() => onUpdateElement(selectedElement.id, { ctaStyle: s as any })}
                            className={`flex-1 py-1 text-xs rounded capitalize font-medium ${
                              selectedElement.ctaStyle === s || (!selectedElement.ctaStyle && s === 'solid')
                                ? 'bg-indigo-600 text-white'
                                : 'text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Button Background Color */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-slate-400 font-bold block">BUTTON MAIN COLOR (BACKGROUND / BORDER)</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={selectedElement.ctaBg || '#000000'}
                          onChange={(e) => onUpdateElement(selectedElement.id, { ctaBg: e.target.value })}
                          className="w-8 h-8 rounded border-0 bg-transparent cursor-pointer shrink-0"
                        />
                        <input
                          type="text"
                          value={selectedElement.ctaBg || '#000000'}
                          onChange={(e) => onUpdateElement(selectedElement.id, { ctaBg: e.target.value })}
                          className="flex-1 bg-slate-950 border border-slate-800 rounded px-2 text-xs font-mono text-white h-8"
                        />
                      </div>
                    </div>

                    {/* Button Text Color (solid only) */}
                    {selectedElement.ctaStyle !== 'outline' && (
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-slate-400 font-bold block">BUTTON TEXT COLOR</label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={selectedElement.ctaTextColor || '#FFFFFF'}
                            onChange={(e) => onUpdateElement(selectedElement.id, { ctaTextColor: e.target.value })}
                            className="w-8 h-8 rounded border-0 bg-transparent cursor-pointer shrink-0"
                          />
                          <input
                            type="text"
                            value={selectedElement.ctaTextColor || '#FFFFFF'}
                            onChange={(e) => onUpdateElement(selectedElement.id, { ctaTextColor: e.target.value })}
                            className="flex-1 bg-slate-950 border border-slate-800 rounded px-2 text-xs font-mono text-white h-8"
                          />
                        </div>
                      </div>
                    )}

                    {/* Custom Corner border radius */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-mono text-slate-400">
                        <span>BUTTON CORNER ROUNDING</span>
                        <span>{selectedElement.ctaBorderRadius ?? 8}px</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="80"
                        value={selectedElement.ctaBorderRadius ?? 8}
                        onChange={(e) => onUpdateElement(selectedElement.id, { ctaBorderRadius: parseInt(e.target.value) })}
                        className="w-full accent-indigo-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
