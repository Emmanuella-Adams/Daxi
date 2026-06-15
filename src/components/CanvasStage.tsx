import React, { useState, useEffect, useRef } from 'react';
import { Slide, CanvasElement, Project } from '../types';
import { ICONS_LIBRARY } from './IconsLibrary';
import { getPatternCSS } from '../utils/patternRenderer';
import { Move, GripHorizontal, RotateCw, ZoomIn, ZoomOut, Maximize } from 'lucide-react';

interface CanvasStageProps {
  project: Project;
  activeSlide: Slide;
  selectedElementId: string | null;
  setSelectedElementId: (id: string | null) => void;
  onUpdateElement: (id: string, updates: Partial<CanvasElement>) => void;
  zoomScale: number;
  setZoomScale: React.Dispatch<React.SetStateAction<number>>;
}

export default function CanvasStage({
  project,
  activeSlide,
  selectedElementId,
  setSelectedElementId,
  onUpdateElement,
  zoomScale,
  setZoomScale,
}: CanvasStageProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [initialElPos, setInitialElPos] = useState({ x: 0, y: 0 });
  const [initialElSize, setInitialElSize] = useState({ width: 0, height: 0 });
  const [initialElRotation, setInitialElRotation] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const workspaceRef = useRef<HTMLDivElement>(null);

  // Default Auto-Fit calculation
  useEffect(() => {
    if (containerRef.current) {
      const containerW = containerRef.current.clientWidth - 48; // padding
      const containerH = containerRef.current.clientHeight - 48;
      
      const fitScaleW = containerW / project.width;
      const fitScaleH = containerH / project.height;
      const autoFit = Math.min(fitScaleW, fitScaleH, 1);
      
      // Default to 1 decimal place to look clean
      setZoomScale(Math.round(autoFit * 100) / 100);
    }
  }, [project.width, project.height, setZoomScale]);

  const handleAutoFit = () => {
    if (containerRef.current) {
      const containerW = containerRef.current.clientWidth - 48;
      const containerH = containerRef.current.clientHeight - 48;
      const fitScaleW = containerW / project.width;
      const fitScaleH = containerH / project.height;
      setZoomScale(Math.round(Math.min(fitScaleW, fitScaleH) * 100) / 100);
    }
  };

  // Drag handles (works on Client Coordinate Math)
  const startDrag = (e: React.MouseEvent | React.TouchEvent, elementId: string) => {
    e.stopPropagation();
    const isTouch = 'touches' in e;
    const clientX = isTouch ? e.touches[0].clientX : e.clientX;
    const clientY = isTouch ? e.touches[0].clientY : e.clientY;

    setSelectedElementId(elementId);
    setIsDragging(true);
    setDragStart({ x: clientX, y: clientY });

    const el = activeSlide.elements.find((item) => item.id === elementId);
    if (el) {
      setInitialElPos({ x: el.x, y: el.y });
    }
  };

  // Resize boundaries handle start
  const startResize = (e: React.MouseEvent | React.TouchEvent, elementId: string) => {
    e.stopPropagation();
    e.preventDefault();
    const isTouch = 'touches' in e;
    const clientX = isTouch ? e.touches[0].clientX : e.clientX;
    const clientY = isTouch ? e.touches[0].clientY : e.clientY;

    setSelectedElementId(elementId);
    setIsResizing(true);
    setDragStart({ x: clientX, y: clientY });

    const el = activeSlide.elements.find((item) => item.id === elementId);
    if (el) {
      setInitialElSize({ width: el.width, height: el.height });
    }
  };

  // Rotation start handle
  const startRotate = (e: React.MouseEvent | React.TouchEvent, elementId: string) => {
    e.stopPropagation();
    e.preventDefault();
    const isTouch = 'touches' in e;
    const clientX = isTouch ? e.touches[0].clientX : e.clientX;
    const clientY = isTouch ? e.touches[0].clientY : e.clientY;

    setSelectedElementId(elementId);
    setIsRotating(true);
    setDragStart({ x: clientX, y: clientY });

    const el = activeSlide.elements.find((item) => item.id === elementId);
    if (el) {
      setInitialElRotation(el.rotation || 0);
    }
  };

  // Global mouse move and up tracking to prevent pointer slip outside boundaries
  useEffect(() => {
    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!selectedElementId) return;

      const isTouch = 'touches' in e;
      const clientX = isTouch ? (e as TouchEvent).touches[0].clientX : (e as MouseEvent).clientX;
      const clientY = isTouch ? (e as TouchEvent).touches[0].clientY : (e as MouseEvent).clientY;

      if (isDragging) {
        const dx = (clientX - dragStart.x) / zoomScale;
        const dy = (clientY - dragStart.y) / zoomScale;

        // Snappable helper: align near boundaries with margins of 10px if wanted, or direct floats
        onUpdateElement(selectedElementId, {
          x: Math.round(initialElPos.x + dx),
          y: Math.round(initialElPos.y + dy),
        });
      } else if (isResizing) {
        const dw = (clientX - dragStart.x) / zoomScale;
        const dh = (clientY - dragStart.y) / zoomScale;

        onUpdateElement(selectedElementId, {
          width: Math.max(20, Math.round(initialElSize.width + dw)),
          height: Math.max(20, Math.round(initialElSize.height + dh)),
        });
      } else if (isRotating) {
        // Calculate mid angles
        const dragDY = clientY - dragStart.y;
        // Basic angle slider mapping
        const rDelta = Math.round(dragDY / 2);
        onUpdateElement(selectedElementId, {
          rotation: (initialElRotation + rDelta) % 360,
        });
      }
    };

    const handleStop = () => {
      setIsDragging(false);
      setIsResizing(false);
      setIsRotating(false);
    };

    if (isDragging || isResizing || isRotating) {
      window.addEventListener('mousemove', handleMove);
      window.addEventListener('mouseup', handleStop);
      window.addEventListener('touchmove', handleMove, { passive: false });
      window.addEventListener('touchend', handleStop);
    }

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleStop);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleStop);
    };
  }, [
    isDragging,
    isResizing,
    isRotating,
    dragStart,
    selectedElementId,
    zoomScale,
    initialElPos,
    initialElSize,
    initialElRotation,
    onUpdateElement,
  ]);

  // Stage viewport background layout compilation
  const bgStyle: React.CSSProperties = {
    width: `${project.width}px`,
    height: `${project.height}px`,
    backgroundColor: activeSlide.bgColor === 'transparent' ? 'transparent' : activeSlide.bgColor,
    position: 'absolute',
    top: 0,
    left: 0,
    overflow: 'hidden',
    transform: `scale(${zoomScale})`,
    transformOrigin: 'top left',
  };

  if (activeSlide.bgGradient) {
    const { type, angle, stops } = activeSlide.bgGradient;
    const stopStr = stops.map((s) => `${s.color} ${s.offset}%`).join(', ');
    bgStyle.backgroundImage =
      type === 'linear'
        ? `linear-gradient(${angle}deg, ${stopStr})`
        : `radial-gradient(circle, ${stopStr})`;
  }

  const patternStyle = getPatternCSS(activeSlide.bgPattern, activeSlide.bgPatternColor);

  return (
    <div className="flex-1 flex flex-col bg-[#09090b] text-[#e0e0e0] overflow-hidden relative" ref={containerRef}>
      {/* Zoom and Workspace Status Header */}
      <div className="bg-[#121214] border-b border-[#222226] px-6 py-2 flex items-center justify-between shrink-0 text-xs">
        <div className="flex items-center gap-3">
          <span className="text-[#88888f] font-sans">Platform Presenter:</span>
          <span className="bg-[#1a1a1c] text-[#e0e0e0] border border-[#2d2d34] px-2.5 py-1 rounded-md font-mono uppercase font-bold tracking-wider text-[10px]">
            {project.platform === 'linkedin'
              ? 'LinkedIn (1080x1080)'
              : project.platform === 'instagram'
              ? 'Instagram Post (1080x1080)'
              : project.platform === 'story'
              ? 'Instagram Story (1080x1920)'
              : `Custom (${project.width}x${project.height})`}
          </span>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoomScale((prev) => Math.max(0.2, prev - 0.05))}
            className="p-1.5 hover:bg-[#222226] text-[#88888f] hover:text-[#f4f4f7] rounded transition-colors cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          
          <span className="font-mono text-[#e0e0e0] w-12 text-center font-bold">
            {Math.round(zoomScale * 100)}%
          </span>
          
          <button
            onClick={() => setZoomScale((prev) => Math.min(2, prev + 0.05))}
            className="p-1.5 hover:bg-[#222226] text-[#88888f] hover:text-[#f4f4f7] rounded transition-colors cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <button
            onClick={handleAutoFit}
            className="flex items-center gap-1.5 ml-2 px-2.5 py-1 bg-[#222226] hover:bg-[#2d2d34] border border-[#2d2d34] hover:border-[#3a3a42] hover:text-[#f4f4f7] text-[#c0c0c5] rounded font-bold uppercase text-[9px] tracking-wider transition-colors cursor-pointer"
            title="Fit Workspace Workspace"
          >
            <Maximize className="w-3.5 h-3.5" />
            Fit
          </button>
        </div>
      </div>

      {/* Main Canvas Scroll Area backdrop */}
      <div
        className="flex-1 overflow-auto flex items-center justify-center p-8 no-scrollbar bg-[#09090b]"
        onClick={() => setSelectedElementId(null)}
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.015) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      >
        <div
          ref={workspaceRef}
          className="relative shadow-2xl shadow-black/80 border border-[#222226] rounded-lg flex items-center justify-center transition-all bg-[#121214] overflow-visible shrink-0"
          style={{
            width: `${project.width * zoomScale}px`,
            height: `${project.height * zoomScale}px`,
          }}
        >
          {/* Virtual Canvas with CSS scales */}
          <div style={bgStyle} id="daxi-visual-sandbox-screen">
            {/* Background Pattern layer */}
            {activeSlide.bgPattern !== 'none' && (
              <div className="absolute inset-0 mix-blend-overlay pointer-events-none" style={patternStyle} />
            )}

            {/* Background Image layer */}
            {activeSlide.bgImage && (
              <div className="absolute inset-0 pointer-events-none">
                <img
                  src={activeSlide.bgImage}
                  alt=""
                  className="w-full h-full object-cover select-none"
                  style={{ opacity: activeSlide.bgOpacity }}
                />
              </div>
            )}

            {/* Elements rendering */}
            {activeSlide.elements.map((el) => {
              const isSelected = el.id === selectedElementId;
              
              const elementStyle: React.CSSProperties = {
                position: 'absolute',
                left: `${el.x}px`,
                top: `${el.y}px`,
                width: `${el.width}px`,
                height: `${el.height}px`,
                opacity: el.opacity ?? 1,
                transform: el.rotation ? `rotate(${el.rotation}deg)` : 'none',
                cursor: isDragging ? 'grabbing' : 'grab',
                userSelect: 'none',
              };

              // Crop Style for images (using our bullet-proof math!)
              let imageCropStyle: React.CSSProperties = {};
              if (el.type === 'image' && el.imageSrc) {
                const cx = el.cropX ?? 0;
                const cy = el.cropY ?? 0;
                const cw = el.cropW ?? 100;
                const ch = el.cropH ?? 100;

                imageCropStyle = {
                  position: 'absolute',
                  width: `${(100 / cw) * 100}%`,
                  height: `${(100 / ch) * 100}%`,
                  left: `${-(cx / cw) * 100}%`,
                  top: `${-(cy / ch) * 100}%`,
                  objectFit: 'cover',
                  borderRadius: el.imageBorderRadius ? `${el.imageBorderRadius}px` : undefined,
                };
              }

              return (
                <div
                  key={el.id}
                  style={elementStyle}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedElementId(el.id);
                  }}
                  onMouseDown={(e) => {
                    if (editingTextId !== el.id) {
                      startDrag(e, el.id);
                    }
                  }}
                  onTouchStart={(e) => {
                    if (editingTextId !== el.id) {
                      startDrag(e, el.id);
                    }
                  }}
                  className={`group relative ${
                    isSelected ? 'ring-2 ring-indigo-500 rounded-sm' : 'hover:ring-1 hover:ring-indigo-400/50 rounded-sm'
                  }`}
                >
                  {/* Element Contents */}
                  {el.type === 'text' && (
                    editingTextId === el.id ? (
                      <textarea
                        value={el.textContent || ''}
                        onChange={(e) => onUpdateElement(el.id, { textContent: e.target.value })}
                        onBlur={() => setEditingTextId(null)}
                        onKeyDown={(e) => {
                          if (e.key === 'Escape' || (e.key === 'Enter' && !e.shiftKey)) {
                            setEditingTextId(null);
                          }
                        }}
                        autoFocus
                        className="w-full h-full bg-transparent border-none outline-none resize-none focus:ring-0 focus:outline-none p-0 overflow-hidden"
                        style={{
                          fontFamily: `"${el.fontFamily || 'Inter'}", sans-serif`,
                          fontSize: `${el.fontSize || 32}px`,
                          fontWeight: el.fontWeight || 500,
                          color: el.textColor || el.color || '#000000',
                          textAlign: el.align || 'left',
                          lineHeight: el.lineHeight || 1.2,
                          letterSpacing: el.letterSpacing ? `${el.letterSpacing}px` : undefined,
                        }}
                      />
                    ) : (
                      <div
                        onDoubleClick={(e) => {
                          e.stopPropagation();
                          setEditingTextId(el.id);
                        }}
                        style={{
                          width: '100%',
                          height: '100%',
                          fontFamily: `"${el.fontFamily || 'Inter'}", sans-serif`,
                          fontSize: `${el.fontSize || 32}px`,
                          fontWeight: el.fontWeight || 500,
                          color: el.textColor || el.color || '#000000',
                          textAlign: el.align || 'left',
                          whiteSpace: 'pre-wrap',
                          lineHeight: el.lineHeight || 1.2,
                          letterSpacing: el.letterSpacing ? `${el.letterSpacing}px` : undefined,
                          textShadow: el.shadowEnabled
                            ? `${el.shadowOffsetX || 2}px ${el.shadowOffsetY || 2}px ${el.shadowBlur || 4}px ${el.shadowColor || 'rgba(0,0,0,0.5)'}`
                            : el.glowEnabled
                            ? `0 0 ${el.glowBlur || 10}px ${el.glowColor || 'rgba(255,255,255,0.8)'}`
                            : undefined,
                          WebkitTextStroke: el.strokeEnabled && el.strokeWidth
                            ? `${el.strokeWidth}px ${el.strokeColor || '#000000'}`
                            : undefined,
                        }}
                        className="outline-none"
                      >
                        {el.textContent || 'Double click to edit'}
                      </div>
                    )
                  )}

                  {el.type === 'shape' && (
                    <div className="w-full h-full relative overflow-visible">
                      <svg
                        className="w-full h-full"
                        viewBox={`0 0 ${el.width} ${el.height}`}
                        preserveAspectRatio="none"
                      >
                        {el.shapeType === 'rect' && (
                          <rect
                            x={el.strokeWidth ? (el.strokeWidth / 2) : 0}
                            y={el.strokeWidth ? (el.strokeWidth / 2) : 0}
                            width={el.width - (el.strokeWidth || 0)}
                            height={el.height - (el.strokeWidth || 0)}
                            rx={el.borderRadius || 0}
                            ry={el.borderRadius || 0}
                            fill={el.fillColor || '#4F46E5'}
                            stroke={el.strokeWidth ? el.strokeColor : 'transparent'}
                            strokeWidth={el.strokeWidth || 0}
                          />
                        )}

                        {el.shapeType === 'circle' && (
                          <ellipse
                            cx={el.width / 2}
                            cy={el.height / 2}
                            rx={Math.max(0, el.width / 2 - (el.strokeWidth || 0) / 2)}
                            ry={Math.max(0, el.height / 2 - (el.strokeWidth || 0) / 2)}
                            fill={el.fillColor || '#4F46E5'}
                            stroke={el.strokeWidth ? el.strokeColor : 'transparent'}
                            strokeWidth={el.strokeWidth || 0}
                          />
                        )}

                        {el.shapeType === 'triangle' && (
                          <polygon
                            points={`${el.width / 2},${el.strokeWidth || 0} ${el.strokeWidth || 0},${el.height - (el.strokeWidth || 0)} ${el.width - (el.strokeWidth || 0)},${el.height - (el.strokeWidth || 0)}`}
                            fill={el.fillColor || '#4F46E5'}
                            stroke={el.strokeWidth ? el.strokeColor : 'transparent'}
                            strokeWidth={el.strokeWidth || 0}
                          />
                        )}

                        {el.shapeType === 'star' && (
                          <path
                            // Star path scaled inside bounding box
                            d={getStarPath(el.width, el.height)}
                            fill={el.fillColor || '#F59E0B'}
                            stroke={el.strokeWidth ? el.strokeColor : 'transparent'}
                            strokeWidth={el.strokeWidth || 0}
                          />
                        )}

                        {el.shapeType === 'heart' && (
                          <path
                            d={getHeartPath(el.width, el.height)}
                            fill={el.fillColor || '#EF4444'}
                            stroke={el.strokeWidth ? el.strokeColor : 'transparent'}
                            strokeWidth={el.strokeWidth || 0}
                          />
                        )}

                        {el.shapeType === 'arrow' && (
                          <path
                            d={getArrowPath(el.width, el.height)}
                            fill={el.fillColor || '#10B981'}
                            stroke={el.strokeWidth ? el.strokeColor : 'transparent'}
                            strokeWidth={el.strokeWidth || 0}
                          />
                        )}

                        {el.shapeType === 'speechBubble' && (
                          <path
                            d={getSpeechBubblePath(el.width, el.height)}
                            fill={el.fillColor || '#EC4899'}
                            stroke={el.strokeWidth ? el.strokeColor : 'transparent'}
                            strokeWidth={el.strokeWidth || 0}
                          />
                        )}

                        {el.shapeType === 'blob' && (
                          <path
                            d={getBlobPath(el.width, el.height)}
                            fill={el.fillColor || '#8B5CF6'}
                            stroke={el.strokeWidth ? el.strokeColor : 'transparent'}
                            strokeWidth={el.strokeWidth || 0}
                          />
                        )}

                        {el.shapeType === 'badge' && (
                          <path
                            d={getBadgePath(el.width, el.height)}
                            fill={el.fillColor || '#F59E0B'}
                            stroke={el.strokeWidth ? el.strokeColor : 'transparent'}
                            strokeWidth={el.strokeWidth || 0}
                          />
                        )}

                        {el.shapeType === 'zigzag' && (
                          <path
                            d={getZigzagPath(el.width, el.height)}
                            fill="none"
                            stroke={el.fillColor || '#10B981'}
                            strokeWidth={el.strokeWidth || 6}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        )}
                      </svg>
                    </div>
                  )}

                  {el.type === 'image' && (
                    <div
                      className="w-full h-full relative overflow-hidden"
                      style={{
                        borderRadius: el.imageBorderRadius ? `${el.imageBorderRadius}px` : undefined,
                        border: el.imageBorderWidth ? `${el.imageBorderWidth}px solid ${el.imageBorderColor || '#FFFFFF'}` : 'none',
                        backgroundColor: '#1E293B',
                      }}
                    >
                      {el.imageSrc ? (
                        <img
                          src={el.imageSrc}
                          alt=""
                          className="absolute pointer-events-none select-none max-w-none"
                          style={imageCropStyle}
                        />
                      ) : (
                        <div className="absolute inset-0 bg-slate-800 flex items-center justify-center text-slate-500 text-xs font-mono">
                          Image Frame
                        </div>
                      )}
                    </div>
                  )}

                  {el.type === 'icon' && (() => {
                    const iconDef = ICONS_LIBRARY[el.iconName || 'sparkles'];
                    if (!iconDef) return <span className="text-xs text-rose-500 font-mono">X</span>;
                    const isStrokeBase = iconDef.category === 'arrow';
                    return (
                      <svg
                        className="w-full h-full"
                        viewBox={iconDef.viewBox}
                        fill={isStrokeBase ? 'none' : (el.iconColor || '#F59E0B')}
                        stroke={isStrokeBase ? (el.iconColor || '#F59E0B') : undefined}
                        strokeWidth={isStrokeBase ? 2.5 : undefined}
                        strokeLinecap={isStrokeBase ? 'round' : undefined}
                        strokeLinejoin={isStrokeBase ? 'round' : undefined}
                      >
                        {iconDef.paths.map((p, idx) => (
                          <path key={idx} d={p} />
                        ))}
                      </svg>
                    );
                  })()}

                  {el.type === 'cta' && (
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        backgroundColor: el.ctaStyle === 'outline' ? 'transparent' : (el.ctaBg || '#000000'),
                        border: `2px solid ${el.ctaBg || '#000000'}`,
                        color: el.ctaStyle === 'outline' ? (el.ctaBg || '#000000') : (el.ctaTextColor || '#FFFFFF'),
                        borderRadius: `${el.ctaBorderRadius ?? 8}px`,
                        fontFamily: `"${el.fontFamily || 'Inter'}", sans-serif`,
                        fontSize: `${el.fontSize || 20}px`,
                        fontWeight: el.fontWeight || 600,
                      }}
                      className="flex items-center justify-center select-none font-sans overflow-hidden px-4 text-center"
                    >
                      {el.ctaText || 'Button CTA'}
                    </div>
                  )}

                  {/* Drag overlays when selected */}
                  {isSelected && (
                    <>
                      {/* Resize Handle at Bottom-Right */}
                      <div
                        onMouseDown={(e) => startResize(e, el.id)}
                        onTouchStart={(e) => startResize(e, el.id)}
                        className="absolute bottom-[-6px] right-[-6px] w-4.5 h-4.5 bg-indigo-500 hover:bg-indigo-400 border border-slate-900 rounded-full cursor-se-resize flex items-center justify-center shadow-md z-30 transition-transform hover:scale-125 select-none"
                        title="Resize"
                      >
                        <div className="w-1.5 h-1.5 bg-white rounded-full" />
                      </div>

                      {/* Rotate Handle at Top-Center */}
                      <div
                        onMouseDown={(e) => startRotate(e, el.id)}
                        onTouchStart={(e) => startRotate(e, el.id)}
                        className="absolute top-[-24px] left-1/2 translate-x-[-50%] w-6 h-6 bg-slate-800 hover:bg-indigo-500 text-slate-300 hover:text-white border border-slate-700 hover:border-indigo-400 rounded-full cursor-ns-resize flex items-center justify-center shadow-lg z-30 transition-all select-none"
                        title="Drag Up/Down to Rotate"
                      >
                        <RotateCw className="w-3 h-3" />
                      </div>

                      {/* Info coordinates overlay */}
                      <div className="absolute top-[102%] left-0 bg-slate-950/95 py-0.5 px-1.5 border border-slate-700/80 text-[10px] font-mono text-slate-300 rounded backdrop-blur z-20 pointer-events-none select-none">
                        x:{el.x} y:{el.y} | {el.width}x{el.height}
                      </div>

                      {/* Center move handle grip as alternative indicator */}
                      <div className="absolute top-2 right-2 bg-slate-900/80 p-0.5 rounded border border-slate-700 opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none">
                        <Move className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// Vector Generators for shapes in Workspace preview
function getStarPath(w: number, h: number): string {
  const spikes = 5;
  const outerRadius = Math.min(w, h) / 2;
  const innerRadius = outerRadius * 0.4;
  const cx = w / 2;
  const cy = h / 2;
  let rot = (Math.PI / 2) * 3;
  let x = cx;
  let y = cy;
  const step = Math.PI / spikes;
  let path = '';

  for (let i = 0; i < spikes; i++) {
    x = cx + Math.cos(rot) * outerRadius;
    y = cy + Math.sin(rot) * outerRadius;
    path += (i === 0 ? 'M' : 'L') + `${x},${y}`;
    rot += step;

    x = cx + Math.cos(rot) * innerRadius;
    y = cy + Math.sin(rot) * innerRadius;
    path += 'L' + `${x},${y}`;
    rot += step;
  }
  path += 'Z';
  return path;
}

function getHeartPath(w: number, h: number): string {
  const topCurveHeight = h * 0.3;
  return `M ${w / 2},${topCurveHeight}
          C ${w / 2},0 0,0 0,${topCurveHeight}
          C 0,${(h + topCurveHeight) / 2} ${w / 2},${h} ${w / 2},${h}
          C ${w / 2},${h} ${w},${(h + topCurveHeight) / 2} ${w},${topCurveHeight}
          C ${w},0 ${w / 2},0 ${w / 2},${topCurveHeight} Z`;
}

function getArrowPath(w: number, h: number): string {
  return `M 0,${h * 0.3}
          L ${w * 0.6},${h * 0.3}
          L ${w * 0.6},0
          L ${w},${h / 2}
          L ${w * 0.6},${h}
          L ${w * 0.6},${h * 0.7}
          L 0,${h * 0.7} Z`;
}

function getSpeechBubblePath(w: number, h: number): string {
  const r = Math.min(w, h) * 0.15;
  const bh = h * 0.82;
  return `M ${r},0
          L ${w - r},0
          A ${r},${r} 0 0 1 ${w},${r}
          L ${w},${bh - r}
          A ${r},${r} 0 0 1 ${w - r},${bh}
          L ${w * 0.35},${bh}
          L ${w * 0.2},${h}
          L ${w * 0.22},${bh}
          L ${r},${bh}
          A ${r},${r} 0 0 1 0,${bh - r}
          L 0,${r}
          A ${r},${r} 0 0 1 ${r},0 Z`;
}

function getBlobPath(w: number, h: number): string {
  return `M ${w * 0.25},${h * 0.15}
          C ${w * 0.55},${h * 0.02} ${w * 0.85},${h * 0.1} ${w * 0.95},${h * 0.35}
          C ${w * 1.05},${h * 0.6} ${w * 0.85},${h * 0.85} ${w * 0.65},${h * 0.95}
          C ${w * 0.35},${h * 1.05} ${w * 0.05},${h * 0.9} ${w * 0.02},${h * 0.65}
          C ${w * -0.02},${h * 0.4} ${w * 0.05},${h * 0.25} ${w * 0.25},${h * 0.15} Z`;
}

function getBadgePath(w: number, h: number): string {
  const points = 12;
  const cx = w / 2;
  const cy = h / 2;
  const rOuter = Math.min(w, h) / 2;
  const rInner = rOuter * 0.85;
  let path = '';
  for (let i = 0; i < points * 2; i++) {
    const angle = (i * Math.PI) / points;
    const r = i % 2 === 0 ? rOuter : rInner;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    path += (i === 0 ? 'M' : 'L') + ` ${x.toFixed(1)},${y.toFixed(1)}`;
  }
  path += ' Z';
  return path;
}

function getZigzagPath(w: number, h: number): string {
  const steps = 6;
  const stepW = w / steps;
  const amp = h / 2;
  const cy = h / 2;
  let path = `M 0,${cy}`;
  for (let i = 1; i <= steps; i++) {
    const x = i * stepW;
    const y = cy + (i % 2 === 1 ? -amp : amp);
    path += ` L ${x.toFixed(1)},${y.toFixed(1)}`;
  }
  return path;
}
