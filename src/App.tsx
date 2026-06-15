import React, { useState, useEffect } from 'react';
import { Project, Slide, CanvasElement } from './types';
import SlidesList from './components/SlidesList';
import CanvasStage from './components/CanvasStage';
import InspectorPanel from './components/InspectorPanel';
import { INITIAL_PROJECT } from './utils/defaultProject';
import { renderSlideToCanvas, downloadSlideAsPNG, downloadAllSlidesAsZIP } from './utils/canvasExporter';
import {
  Undo2,
  Redo2,
  Download,
  FileJson,
  Upload,
  Sparkles,
  RefreshCw,
  FolderOpen,
  Plus,
  Play,
  RotateCcw,
  Check,
  Smartphone,
  Tablet,
  Laptop
} from 'lucide-react';

export default function App() {
  const [project, setProject] = useState<Project>(() => {
    const saved = localStorage.getItem('daxi-project');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved project, loading default', e);
      }
    }
    return INITIAL_PROJECT;
  });

  const [activeSlideId, setActiveSlideId] = useState<string>(() => {
    return project.slides[0]?.id || 'slide-1';
  });

  // Zoom control state (fits to container dynamically on start)
  const [zoomScale, setZoomScale] = useState<number>(0.45);

  // Undo/Redo tracking stacks
  const [historyPast, setHistoryPast] = useState<Slide[][]>([]);
  const [historyFuture, setHistoryFuture] = useState<Slide[][]>([]);

  // Selection state
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);

  // Active mobile view tab for responsiveness support
  const [activeMobileTab, setActiveMobileTab] = useState<'slides' | 'canvas' | 'inspector'>('canvas');

  // Auto transition to inspector panel on mobile when an element is selected
  useEffect(() => {
    if (selectedElementId) {
      setActiveMobileTab('inspector');
    }
  }, [selectedElementId]);

  // Previews mapping each slide.id to its latest generated master visual dataURL
  const [slidePreviews, setSlidePreviews] = useState<Record<string, string>>({});

  // Live render preview dataURL to show "Always-show export preview"
  const [liveExportPreviewUrl, setLiveExportPreviewUrl] = useState<string>('');
  const [isPreviewLoading, setIsPreviewLoading] = useState<boolean>(false);

  // Persist project changes and auto-trigger live PNG preview compilation
  useEffect(() => {
    localStorage.setItem('daxi-project', JSON.stringify(project));
    
    // Trigger real-time PNG preview generation (debounced slightly to prevent performance hits)
    const activeSlide = project.slides.find((s) => s.id === activeSlideId);
    if (activeSlide) {
      setIsPreviewLoading(true);
      const timer = setTimeout(() => {
        renderSlideToCanvas(activeSlide, project.width, project.height)
          .then((canvas) => {
            const dataUrl = canvas.toDataURL('image/png');
            setLiveExportPreviewUrl(dataUrl);
            setSlidePreviews((prev) => ({ ...prev, [activeSlideId]: dataUrl }));
          })
          .catch((err) => console.error('Preview render error', err))
          .finally(() => setIsPreviewLoading(false));
      }, 350);

      return () => clearTimeout(timer);
    }
  }, [project, activeSlideId]);

  // Sync previews of all slides dynamically in the background for high-fidelity thumbnails
  useEffect(() => {
    const timer = setTimeout(async () => {
      const nextPreviews = { ...slidePreviews };
      let hasUpdate = false;
      
      for (const s of project.slides) {
        try {
          const canvas = await renderSlideToCanvas(s, project.width, project.height);
          const dataUrl = canvas.toDataURL('image/png');
          if (nextPreviews[s.id] !== dataUrl) {
            nextPreviews[s.id] = dataUrl;
            hasUpdate = true;
          }
        } catch (err) {
          console.error('Error pre-rendering slide preview', err);
        }
      }
      
      if (hasUpdate) {
        setSlidePreviews(nextPreviews);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [project]);

  const activeSlide = project.slides.find((s) => s.id === activeSlideId) || project.slides[0];

  // Multi-history helper
  const commitToHistory = (slidesToSave: Slide[]) => {
    // Deep clone the array
    const clone = JSON.parse(JSON.stringify(slidesToSave));
    setHistoryPast((prev) => [...prev, clone]);
    setHistoryFuture([]); // clear redo
  };

  const handleUndo = () => {
    if (historyPast.length === 0) return;
    const previousSlides = historyPast[historyPast.length - 1];
    setHistoryPast((prev) => prev.slice(0, prev.length - 1));
    
    // Push current to future
    const currentClone = JSON.parse(JSON.stringify(project.slides));
    setHistoryFuture((prev) => [currentClone, ...prev]);

    setProject((prev) => ({
      ...prev,
      slides: previousSlides,
      updatedAt: Date.now()
    }));
  };

  const handleRedo = () => {
    if (historyFuture.length === 0) return;
    const nextSlides = historyFuture[0];
    setHistoryFuture((prev) => prev.slice(1));

    // Push current to past
    const currentClone = JSON.parse(JSON.stringify(project.slides));
    setHistoryPast((prev) => [...prev, currentClone]);

    setProject((prev) => ({
      ...prev,
      slides: nextSlides,
      updatedAt: Date.now()
    }));
  };

  // 1. Update project configurations (Dimensions, Name, platform)
  const handleUpdateProject = (updates: Partial<Project>) => {
    setProject((prev) => {
      const updated = { ...prev, ...updates, updatedAt: Date.now() };
      return updated;
    });
  };

  // 2. Update specific slide details
  const handleUpdateSlide = (slideId: string, updates: Partial<Slide>) => {
    commitToHistory(project.slides);

    setProject((prev) => {
      const updatedSlides = prev.slides.map((slide) => {
        if (slide.id === slideId) {
          return { ...slide, ...updates };
        }
        return slide;
      });
      return { ...prev, slides: updatedSlides, updatedAt: Date.now() };
    });
  };

  // 3. Update specific element properties inside active slide
  const handleUpdateElement = (elementId: string, updates: Partial<CanvasElement>) => {
    // Note: To avoid cluttering the history heap on every pixel shift during dragging,
    // we perform visual updates directly, although deep actions can call history if they're distinct.
    setProject((prev) => {
      const updatedSlides = prev.slides.map((s) => {
        if (s.id === activeSlideId) {
          const updatedElements = s.elements.map((el) => {
            if (el.id === elementId) {
              return { ...el, ...updates };
            }
            return el;
          });
          return { ...s, elements: updatedElements };
        }
        return s;
      });
      return { ...prev, slides: updatedSlides, updatedAt: Date.now() };
    });
  };

  // Helper mouse action triggers to push final drag properties to history
  const handleDragRelease = () => {
    commitToHistory(project.slides);
  };

  // Add a blank slide
  const handleAddSlide = () => {
    commitToHistory(project.slides);
    const newSlideId = `slide-${Date.now()}`;
    const newSlide: Slide = {
      id: newSlideId,
      bgColor: '#1E293B',
      bgGradient: null,
      bgPattern: 'none',
      bgPatternColor: 'rgba(255,255,255,0.05)',
      bgImage: null,
      bgOpacity: 1,
      elements: [
        {
          id: `el-text-${Date.now()}`,
          type: 'text',
          x: 90,
          y: 400,
          width: 900,
          height: 200,
          rotation: 0,
          opacity: 1,
          textContent: 'Double click to edit text',
          fontSize: 48,
          fontFamily: 'Space Grotesk',
          fontWeight: 600,
          textColor: '#FFFFFF',
          align: 'center'
        }
      ]
    };

    setProject((prev) => {
      const newSlides = [...prev.slides, newSlide];
      return { ...prev, slides: newSlides };
    });
    setActiveSlideId(newSlideId);
    setSelectedElementId(null);
  };

  const handleDuplicateSlide = (slideId: string) => {
    commitToHistory(project.slides);
    const slideToDup = project.slides.find((s) => s.id === slideId);
    if (!slideToDup) return;

    const clone: Slide = JSON.parse(JSON.stringify(slideToDup));
    clone.id = `slide-${Date.now()}`;
    
    // Refresh elements ids to avoid collision
    clone.elements = clone.elements.map((el) => ({
      ...el,
      id: `${el.type}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`
    }));

    const index = project.slides.findIndex((s) => s.id === slideId);
    setProject((prev) => {
      const nextSlides = [...prev.slides];
      nextSlides.splice(index + 1, 0, clone);
      return { ...prev, slides: nextSlides };
    });
    setActiveSlideId(clone.id);
  };

  const handleDeleteSlide = (slideId: string) => {
    if (project.slides.length <= 1) return;
    commitToHistory(project.slides);

    const index = project.slides.findIndex((s) => s.id === slideId);
    const updatedSlides = project.slides.filter((s) => s.id !== slideId);

    setProject((prev) => ({ ...prev, slides: updatedSlides }));
    
    // Change focus to surrounding slide
    const nextActiveIndex = Math.max(0, index - 1);
    setActiveSlideId(updatedSlides[nextActiveIndex].id);
    setSelectedElementId(null);
  };

  const handleMoveSlide = (index: number, direction: 'up' | 'down') => {
    commitToHistory(project.slides);
    const updatedSlides = [...project.slides];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIdx < 0 || targetIdx >= updatedSlides.length) return;

    const temp = updatedSlides[index];
    updatedSlides[index] = updatedSlides[targetIdx];
    updatedSlides[targetIdx] = temp;

    setProject((prev) => ({ ...prev, slides: updatedSlides }));
  };

  // Add canvas elements
  const handleAddElement = (type: CanvasElement['type'], extra?: Partial<CanvasElement>) => {
    commitToHistory(project.slides);
    const id = `el-${type}-${Date.now()}`;
    
    // Default placements centered
    const defaultEl: CanvasElement = {
      id,
      type,
      x: 340,
      y: 440,
      width: type === 'text' ? 600 : type === 'image' ? 300 : type === 'cta' ? 400 : 150,
      height: type === 'text' ? 120 : type === 'image' ? 300 : type === 'cta' ? 90 : 150,
      rotation: 0,
      opacity: 1,
      ...extra
    };

    setProject((prev) => {
      const nextSlides = prev.slides.map((s) => {
        if (s.id === activeSlideId) {
          return { ...s, elements: [...s.elements, defaultEl] };
        }
        return s;
      });
      return { ...prev, slides: nextSlides };
    });

    setSelectedElementId(id);
  };

  const handleDeleteElement = (id: string) => {
    commitToHistory(project.slides);
    setProject((prev) => {
      const nextSlides = prev.slides.map((s) => {
        if (s.id === activeSlideId) {
          return { ...s, elements: s.elements.filter((el) => el.id !== id) };
        }
        return s;
      });
      return { ...prev, slides: nextSlides };
    });
    setSelectedElementId(null);
  };

  const handleDuplicateElement = (id: string) => {
    commitToHistory(project.slides);
    const elToDup = activeSlide?.elements.find((el) => el.id === id);
    if (!elToDup) return;

    const clone: CanvasElement = JSON.parse(JSON.stringify(elToDup));
    clone.id = `${elToDup.type}-${Date.now()}`;
    clone.x += 40; // offset slightly
    clone.y += 40;

    setProject((prev) => {
      const nextSlides = prev.slides.map((s) => {
        if (s.id === activeSlideId) {
          return { ...s, elements: [...s.elements, clone] };
        }
        return s;
      });
      return { ...prev, slides: nextSlides };
    });

    setSelectedElementId(clone.id);
  };

  // "Apply to All": replicates background style, background image, gradient, and patterns,
  // plus basic header font configurations to keep styles visually synchronized.
  const handleApplyToAllSlides = () => {
    commitToHistory(project.slides);
    const sourceBgColor = activeSlide.bgColor;
    const sourceBgGradient = activeSlide.bgGradient;
    const sourceBgPattern = activeSlide.bgPattern;
    const sourceBgPatternColor = activeSlide.bgPatternColor;
    const sourceBgImage = activeSlide.bgImage;
    const sourceBgOpacity = activeSlide.bgOpacity;

    // Grab first text style for typography syncing
    const mainTextEl = activeSlide.elements.find((e) => e.type === 'text');
    const sourceFontFamily = mainTextEl?.fontFamily || 'Inter';

    const syncedSlides = project.slides.map((slide) => {
      // Create new elements mapping fonts
      const mutatedElements = slide.elements.map((el) => {
        if (el.type === 'text') {
          return { ...el, fontFamily: sourceFontFamily };
        }
        return el;
      });

      return {
        ...slide,
        bgColor: sourceBgColor,
        bgGradient: sourceBgGradient ? { ...sourceBgGradient } : null,
        bgPattern: sourceBgPattern,
        bgPatternColor: sourceBgPatternColor,
        bgImage: sourceBgImage,
        bgOpacity: sourceBgOpacity,
        elements: mutatedElements
      };
    });

    setProject((prev) => ({
      ...prev,
      slides: syncedSlides
    }));

    alert('Successfully applied background configurations and primary fonts uniformly to all slides! 🎨');
  };

  // JSON Import & Export Database Schemes fully offline
  const handleExportJSON = () => {
    const dataStr = JSON.stringify(project, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `${project.name.replace(/\s+/g, '_')}_workspace.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && typeof parsed === 'object' && parsed.slides) {
          commitToHistory(project.slides);
          setProject(parsed);
          setActiveSlideId(parsed.slides[0].id);
          setSelectedElementId(null);
          alert('Project loaded successfully! 📂');
        } else {
          alert('Invalid JSON file format. Could not load project.');
        }
      } catch (err) {
        alert('Error parsing workspace file: ' + err);
      }
    };
    reader.readAsText(file);
  };

  // Reset to default templates
  const handleResetToDefault = () => {
    if (confirm('Are you sure you want to reset and reload the First Daxi Social Grid? Undergoing edits will be overwritten.')) {
      commitToHistory(project.slides);
      setProject(INITIAL_PROJECT);
      setActiveSlideId(INITIAL_PROJECT.slides[0].id);
      setSelectedElementId(null);
    }
  };

  const activeIndex = project.slides.findIndex((s) => s.id === activeSlideId);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#09090b] font-sans antialiased text-[#e0e0e0]">
      
      {/* Top Main Menu Navbar */}
      <header className="h-16 shrink-0 bg-[#121214] border-b border-[#222226] px-6 flex items-center justify-between z-10 shadow-md shadow-black/30">
        
        {/* Logo and Name block */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center font-black text-white text-base shadow-lg shadow-indigo-500/20 tracking-wider">
              D
            </div>
            <span className="font-bold text-lg tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-[#dcdcf6]">
              Daxi
            </span>
          </div>
          
          <div className="h-4 w-px bg-[#222226]" />

          {/* Project Editable Name */}
          <div className="flex items-center gap-1">
            <input
              type="text"
              value={project.name}
              onChange={(e) => handleUpdateProject({ name: e.target.value })}
              className="bg-transparent border-b border-transparent hover:border-[#2d2d34] focus:border-indigo-500 focus:outline-none px-1.5 py-1 text-sm font-semibold text-[#f4f4f7] placeholder-[#52525b] transition-colors"
              placeholder="Unnamed Grid"
            />
          </div>
        </div>

        {/* Global Undo, Redo, JSON import/export and defaults */}
        <div className="flex items-center gap-3">
          
          {/* History control triggers */}
          <div className="flex items-center bg-[#09090b]/80 p-1 rounded-xl border border-[#222226]">
            <button
              onClick={handleUndo}
              disabled={historyPast.length === 0}
              className="p-1 px-2.5 rounded-lg hover:bg-[#222226] text-[#88888f] hover:text-[#f4f4f7] disabled:opacity-30 transition-all font-medium text-xs flex items-center gap-1 cursor-pointer"
              title="Undo Action"
            >
              <Undo2 className="w-3.5 h-3.5" />
              <span className="font-mono text-[10px] bg-[#1a1a1c] text-[#88888f] border border-[#2d2d34] px-1 py-0.5 rounded">
                {historyPast.length}
              </span>
            </button>
            <button
              onClick={handleRedo}
              disabled={historyFuture.length === 0}
              className="p-1 px-2.5 rounded-lg hover:bg-[#222226] text-[#88888f] hover:text-[#f4f4f7] disabled:opacity-30 transition-all font-medium text-xs flex items-center gap-1 cursor-pointer"
              title="Redo Action"
            >
              <Redo2 className="w-3.5 h-3.5" />
              <span className="font-mono text-[10px] bg-[#1a1a1c] text-[#88888f] border border-[#2d2d34] px-1 py-0.5 rounded">
                {historyFuture.length}
              </span>
            </button>
          </div>

          {/* JSON File Managers */}
          <div className="flex items-center bg-[#09090b]/80 p-1 rounded-xl border border-[#222226] gap-1">
            <button
              onClick={handleExportJSON}
              className="p-1.5 hover:bg-[#222226] text-slate-300 hover:text-indigo-400 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
              title="Backup Workspace Schema to local JSON file"
            >
              <FileJson className="w-3.5 h-3.5" />
              Backup
            </button>
            
            <label className="p-1.5 hover:bg-[#222226] text-slate-300 hover:text-emerald-400 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              Restore
              <input
                type="file"
                accept=".json"
                onChange={handleImportJSON}
                className="hidden"
              />
            </label>
          </div>

          {/* Reset button */}
          <button
            onClick={handleResetToDefault}
            className="p-2 bg-[#222226] hover:bg-[#2d2d34] border border-[#2d2d34] text-slate-300 hover:text-[#f4f4f7] rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Reload default professionally-styled presentation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Design
          </button>
        </div>

        {/* Action Downloads ZIP / individual PNGs */}
        <div className="flex items-center gap-2">
          
          {/* Individual Exporter trigger */}
          <button
            onClick={() =>
              downloadSlideAsPNG(
                activeSlide,
                project.width,
                project.height,
                `${project.name.replace(/\s+/g, '_')}_slide_${activeIndex + 1}.png`
              )
            }
            className="px-3.5 py-2 bg-[#222226] hover:bg-[#2d2d34] text-[#e0e0e0] hover:text-[#f4f4f7] rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md active:scale-95 border border-[#323238] cursor-pointer"
            title="Download active frame only"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" />
            Export Selected Slide
          </button>

          {/* Core ZIP Package trigger */}
          <button
            onClick={() =>
              downloadAllSlidesAsZIP(
                project.slides,
                project.width,
                project.height,
                `${project.name.replace(/\s+/g, '_')}_all_slides.zip`
              )
            }
            className="px-4.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-lg active:scale-95 cursor-pointer"
            title="Download the whole slide carousel deck as high-res zipped PNG pack"
          >
            <Download className="w-3.5 h-3.5" />
            Pack All as ZIP
          </button>
        </div>
      </header>

      {/* Mobile/Tablet View Control Switcher */}
      <div className="lg:hidden shrink-0 bg-[#121214] border-b border-[#222226] flex p-1.5 gap-1.5 z-10">
        <button
          onClick={() => setActiveMobileTab('slides')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-1 text-[11px] font-bold uppercase tracking-wider rounded-lg transition-all border cursor-pointer ${
            activeMobileTab === 'slides'
              ? 'bg-[#1a1a1c] text-[#f4f4f7] border-[#222226] shadow'
              : 'text-[#88888f] hover:text-[#f4f4f7] border-transparent'
          }`}
        >
          <span>📂</span>
          Slides ({project.slides.length})
        </button>
        <button
          onClick={() => setActiveMobileTab('canvas')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-1 text-[11px] font-bold uppercase tracking-wider rounded-lg transition-all border cursor-pointer ${
            activeMobileTab === 'canvas'
              ? 'bg-[#1a1a1c] text-[#f4f4f7] border-[#222226] shadow'
              : 'text-[#88888f] hover:text-[#f4f4f7] border-transparent'
          }`}
        >
          <span>📐</span>
          Canvas Sandbox
        </button>
        <button
          onClick={() => setActiveMobileTab('inspector')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-1 text-[11px] font-bold uppercase tracking-wider rounded-lg transition-all border cursor-pointer ${
            activeMobileTab === 'inspector'
              ? 'bg-[#1a1a1c] text-[#f4f4f7] border-[#222226] shadow'
              : 'text-[#88888f] hover:text-[#f4f4f7] border-transparent'
          }`}
        >
          <span>🎨</span>
          Format Design
        </button>
      </div>

      {/* Main Workspace Body divided into 3 responsive panel/column wrappers */}
      <div className="flex-1 flex overflow-hidden w-full relative">
        
        {/* Panel 1: Slides Deck Timeline Slider (Left option drawer, 256px wide) */}
        <div className={`h-full shrink-0 ${activeMobileTab === 'slides' ? 'flex flex-1 w-full' : 'hidden'} lg:flex lg:w-64 border-r border-[#222226]`}>
          <SlidesList
            project={project}
            activeSlideId={activeSlideId}
            setActiveSlideId={setActiveSlideId}
            onAddSlide={handleAddSlide}
            onDuplicateSlide={handleDuplicateSlide}
            onDeleteSlide={handleDeleteSlide}
            onMoveSlide={handleMoveSlide}
            slidePreviews={slidePreviews}
          />
        </div>

        {/* Panel 2: Scaled Live Canvas Visual Preview Workspace (Center block) */}
        <div className={`h-full min-w-0 flex-1 flex-col relative ${activeMobileTab === 'canvas' ? 'flex w-full' : 'hidden'} lg:flex`}>
          <div className="flex-1 flex flex-col min-h-0 relative">
            <CanvasStage
              project={project}
              activeSlide={activeSlide}
              selectedElementId={selectedElementId}
              setSelectedElementId={setSelectedElementId}
              onUpdateElement={handleUpdateElement}
              zoomScale={zoomScale}
              setZoomScale={setZoomScale}
            />
          </div>

          {/* Horizontal deck slider to provide always-show preview! */}
          <div className="h-44 bg-[#121214] border-t border-[#222226] p-4 flex gap-4 overflow-x-auto shrink-0 no-scrollbar relative items-center">
            
            {/* Always-show preview status node banner */}
            <div className="absolute top-2 left-6 text-[10px] font-bold text-[#88888f] tracking-wider uppercase flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
              Always-Show live export preview render
            </div>

            {/* Render mini PNG preview images for the slides deck stream side-be-side */}
            <div className="flex items-center gap-4 mt-2.5">
              {project.slides.map((s, index) => {
                const isSelected = s.id === activeSlideId;
                return (
                  <div
                    key={s.id}
                    onClick={() => {
                      setActiveSlideId(s.id);
                      setActiveMobileTab('canvas'); // jump to canvas on slide selection for immediate visual feedback
                    }}
                    className={`relative h-28 aspect-square rounded-lg overflow-hidden border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-indigo-500 ring-2 ring-indigo-500/20 scale-102 bg-[#09090b]'
                        : 'border-[#222226] hover:border-[#323238] bg-[#09090b]'
                    }`}
                  >
                    {/* Live preview visual image overlay */}
                    {s.id === activeSlideId && liveExportPreviewUrl ? (
                      <img src={liveExportPreviewUrl} alt="" className="w-full h-full object-contain col-span-full" />
                    ) : slidePreviews[s.id] ? (
                      <img src={slidePreviews[s.id]} alt="" className="w-full h-full object-contain col-span-full" />
                    ) : (
                      // Light indicator layout to showcase backgrounds while loading/inactive
                      <div className="absolute inset-0 flex items-center justify-center p-2 text-center select-none text-[10px] text-[#88888f] font-mono font-bold leading-tight">
                        Slide #{index + 1}
                        <br />
                        <span className="text-[8px] font-normal text-slate-600 block mt-1 uppercase">Rendering...</span>
                      </div>
                    )}
                    <span className="absolute bottom-1 right-1 bg-[#1a1a1c]/95 text-[9px] text-[#88888f] border border-[#2d2d34] font-mono px-1 py-0.5 rounded font-bold">
                      #{index + 1}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Panel 3: settings inspector dashboard (Right options panel, 320px wide) */}
        <div className={`h-full shrink-0 ${activeMobileTab === 'inspector' ? 'flex flex-1 w-full' : 'hidden'} lg:flex lg:w-80 border-l border-[#222226]`}>
          <InspectorPanel
            project={project}
            activeSlide={activeSlide}
            selectedElementId={selectedElementId}
            setSelectedElementId={setSelectedElementId}
            onUpdateProject={handleUpdateProject}
            onUpdateSlide={handleUpdateSlide}
            onUpdateElement={handleUpdateElement}
            onAddElement={handleAddElement}
            onDeleteElement={handleDeleteElement}
            onDuplicateElement={handleDuplicateElement}
            onApplyToAllSlides={handleApplyToAllSlides}
          />
        </div>
      </div>
    </div>
  );
}
