import JSZip from 'jszip';
import { Slide, CanvasElement } from '../types';
import { ICONS_LIBRARY } from '../components/IconsLibrary';
import { drawPatternOnCanvas } from './patternRenderer';

// Helper to load image elements asynchronously (works offline with dataURLs)
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => {
      // Create a fallback empty canvas image so export doesn't freeze on broken links
      console.warn(`Failed to load image: ${src}, using fallback.`);
      const fallbackCanvas = document.createElement('canvas');
      fallbackCanvas.width = 100;
      fallbackCanvas.height = 100;
      const fCtx = fallbackCanvas.getContext('2d');
      if (fCtx) {
        fCtx.fillStyle = '#CCCCCC';
        fCtx.fillRect(0, 0, 100, 100);
        fCtx.fillStyle = '#333333';
        fCtx.font = '10px sans-serif';
        fCtx.fillText('Missing Image', 10, 50);
      }
      const fallbackImg = new Image();
      fallbackImg.onload = () => resolve(fallbackImg);
      fallbackImg.src = fallbackCanvas.toDataURL();
    };
    img.src = src;
  });
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  let radius = r;
  if (radius > w / 2) radius = w / 2;
  if (radius > h / 2) radius = h / 2;
  if (radius < 0) radius = 0;

  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function drawClassicStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  spikes: number,
  outerRadius: number,
  innerRadius: number
) {
  let rot = (Math.PI / 2) * 3;
  let x = cx;
  let y = cy;
  const step = Math.PI / spikes;

  ctx.beginPath();
  ctx.moveTo(cx, cy - outerRadius);
  for (let i = 0; i < spikes; i++) {
    x = cx + Math.cos(rot) * outerRadius;
    y = cy + Math.sin(rot) * outerRadius;
    ctx.lineTo(x, y);
    rot += step;

    x = cx + Math.cos(rot) * innerRadius;
    y = cy + Math.sin(rot) * innerRadius;
    ctx.lineTo(x, y);
    rot += step;
  }
  ctx.lineTo(cx, cy - outerRadius);
  ctx.closePath();
}

function drawClassicHeart(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number
) {
  ctx.beginPath();
  // Draw heart curve within bounding box
  const topCurveHeight = height * 0.3;
  ctx.moveTo(x + width / 2, y + topCurveHeight);
  // Left curve
  ctx.bezierCurveTo(
    x + width / 2, y,
    x, y,
    x, y + topCurveHeight
  );
  ctx.bezierCurveTo(
    x, y + (height + topCurveHeight) / 2,
    x + width / 2, y + height,
    x + width / 2, y + height
  );
  // Right curve
  ctx.bezierCurveTo(
    x + width / 2, y + height,
    x + width, y + (height + topCurveHeight) / 2,
    x + width, y + topCurveHeight
  );
  ctx.bezierCurveTo(
    x + width, y,
    x + width / 2, y,
    x + width / 2, y + topCurveHeight
  );
  ctx.closePath();
}

function drawClassicArrow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number
) {
  ctx.beginPath();
  // Block arrow pointing right
  ctx.moveTo(x, y + h * 0.3);
  ctx.lineTo(x + w * 0.6, y + h * 0.3);
  ctx.lineTo(x + w * 0.6, y);
  ctx.lineTo(x + w, y + h / 2);
  ctx.lineTo(x + w * 0.6, y + h);
  ctx.lineTo(x + w * 0.6, y + h * 0.7);
  ctx.lineTo(x, y + h * 0.7);
  ctx.closePath();
}

/**
 * Renders a single slide onto a fresh HTMLCanvasElement.
 */
export async function renderSlideToCanvas(
  slide: Slide,
  width: number,
  height: number
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Could not get 2D canvas context');
  }

  // Clear canvas
  ctx.clearRect(0,0, width, height);

  // 1. Draw Background Solid Color / Transparent
  if (slide.bgColor !== 'transparent') {
    ctx.fillStyle = slide.bgColor;
    ctx.fillRect(0, 0, width, height);
  }

  // 2. Draw Background Gradient
  if (slide.bgGradient) {
    const { type, angle, stops } = slide.bgGradient;
    let gradient: CanvasGradient;

    if (type === 'linear') {
      // Calculate start/end coordinates based on angle
      const radians = (angle * Math.PI) / 180;
      const x1 = width / 2 - (Math.cos(radians) * width) / 2;
      const y1 = height / 2 - (Math.sin(radians) * height) / 2;
      const x2 = width / 2 + (Math.cos(radians) * width) / 2;
      const y2 = height / 2 + (Math.sin(radians) * height) / 2;
      gradient = ctx.createLinearGradient(x1, y1, x2, y2);
    } else {
      // Radial gradient from center
      gradient = ctx.createRadialGradient(
        width / 2,
        height / 2,
        0,
        width / 2,
        height / 2,
        Math.max(width, height) / 2
      );
    }

    stops.forEach((stop) => {
      gradient.addColorStop(stop.offset / 100, stop.color);
    });

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  }

  // 3. Draw Background Image
  if (slide.bgImage) {
    try {
      const bgImg = await loadImage(slide.bgImage);
      ctx.save();
      ctx.globalAlpha = slide.bgOpacity;
      // Draw letterboxed or fitted or centered image
      // Simple cover draw:
      const imgRatio = bgImg.width / bgImg.height;
      const canvasRatio = width / height;
      let dx = 0, dy = 0, dPosW = width, dPosH = height;
      
      if (imgRatio > canvasRatio) {
        // Image is wider than canvas cover height
        dPosW = height * imgRatio;
        dx = (width - dPosW) / 2;
      } else {
        dPosH = width / imgRatio;
        dy = (height - dPosH) / 2;
      }
      ctx.drawImage(bgImg, dx, dy, dPosW, dPosH);
      ctx.restore();
    } catch (e) {
      console.error('Error drawing background image', e);
    }
  }

  // 4. Draw Background Pattern Overlay on Canvas
  if (slide.bgPattern !== 'none') {
    drawPatternOnCanvas(ctx, slide.bgPattern, slide.bgPatternColor, width, height);
  }

  // 5. Draw Slide Elements sequentially
  for (const element of slide.elements) {
    if (element.opacity === 0) continue;

    ctx.save();
    ctx.globalAlpha = element.opacity ?? 1;

    // Apply rotation
    if (element.rotation && element.rotation !== 0) {
      const cx = element.x + element.width / 2;
      const cy = element.y + element.height / 2;
      ctx.translate(cx, cy);
      ctx.rotate((element.rotation * Math.PI) / 180);
      ctx.translate(-cx, -cy);
    }

    switch (element.type) {
      case 'text': {
        const fontFam = element.fontFamily || 'sans-serif';
        const fontSize = element.fontSize || 32;
        const fontW = element.fontWeight || 500;
        ctx.font = `${fontW} ${fontSize}px "${fontFam}", sans-serif`;
        ctx.fillStyle = element.textColor || element.color || '#000000';
        ctx.textBaseline = 'top';

        // Apply text shadow if enabled
        if (element.shadowEnabled) {
          ctx.shadowColor = element.shadowColor || 'rgba(0,0,0,0.4)';
          ctx.shadowBlur = element.shadowBlur ?? 4;
          ctx.shadowOffsetX = element.shadowOffsetX ?? 2;
          ctx.shadowOffsetY = element.shadowOffsetY ?? 2;
        }

        // Apply glow if enabled (acts as strong local blur shadow)
        if (element.glowEnabled) {
          ctx.shadowColor = element.glowColor || '#FFFFFF';
          ctx.shadowBlur = element.glowBlur ?? 10;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;
        }

        // Apply letter spacing (supported natively in modern browsers, fallback handled below)
        if (element.letterSpacing !== undefined && 'letterSpacing' in ctx) {
          (ctx as any).letterSpacing = `${element.letterSpacing}px`;
        }

        // Wrap the multiline text
        const content = element.textContent || '';
        const wrappedLines = getWrappedLines(ctx, content, element.width);
        const lineH = element.lineHeight || 1.2;
        const totalHeight = wrappedLines.length * fontSize * lineH;

        wrappedLines.forEach((line, i) => {
          let lineX = element.x;
          if (element.align === 'center') {
            lineX = element.x + (element.width - ctx.measureText(line).width) / 2;
          } else if (element.align === 'right') {
            lineX = element.x + element.width - ctx.measureText(line).width;
          }

          const lineY = element.y + i * fontSize * lineH;

          // Draw stroke first if enabled so fill renders cleanly on top
          if (element.strokeEnabled && element.strokeWidth && element.strokeColor) {
            ctx.save();
            ctx.strokeStyle = element.strokeColor;
            ctx.lineWidth = element.strokeWidth;
            // Remove text scale shadow for outline to keep outline crisp
            ctx.strokeText(line, lineX, lineY);
            ctx.restore();
          }

          ctx.fillText(line, lineX, lineY);
        });
        break;
      }

      case 'shape': {
        ctx.fillStyle = element.fillColor || '#4F46E5';
        ctx.strokeStyle = element.strokeColor || 'transparent';
        ctx.lineWidth = element.strokeWidth || 0;

        const hasStroke = element.strokeWidth && element.strokeWidth > 0 && element.strokeColor !== 'transparent';
        const hasFill = element.fillColor && element.fillColor !== 'transparent';

        const rx = element.x;
        const ry = element.y;
        const rw = element.width;
        const rh = element.height;

        if (element.shapeType === 'rect') {
          drawRoundedRect(ctx, rx, ry, rw, rh, element.borderRadius || 0);
          if (hasFill) ctx.fill();
          if (hasStroke) ctx.stroke();
        } else if (element.shapeType === 'circle') {
          ctx.beginPath();
          ctx.arc(rx + rw / 2, ry + rh / 2, Math.min(rw, rh) / 2, 0, Math.PI * 2);
          ctx.closePath();
          if (hasFill) ctx.fill();
          if (hasStroke) ctx.stroke();
        } else if (element.shapeType === 'triangle') {
          ctx.beginPath();
          ctx.moveTo(rx + rw / 2, ry);
          ctx.lineTo(rx + rw, ry + rh);
          ctx.lineTo(rx, ry + rh);
          ctx.closePath();
          if (hasFill) ctx.fill();
          if (hasStroke) ctx.stroke();
        } else if (element.shapeType === 'star') {
          const cx = rx + rw / 2;
          const cy = ry + rh / 2;
          const outerR = Math.min(rw, rh) / 2;
          const innerR = outerR * 0.4;
          drawClassicStar(ctx, cx, cy, 5, outerR, innerR);
          if (hasFill) ctx.fill();
          if (hasStroke) ctx.stroke();
        } else if (element.shapeType === 'heart') {
          drawClassicHeart(ctx, rx, ry, rw, rh);
          if (hasFill) ctx.fill();
          if (hasStroke) ctx.stroke();
        } else if (element.shapeType === 'arrow') {
          drawClassicArrow(ctx, rx, ry, rw, rh);
          if (hasFill) ctx.fill();
          if (hasStroke) ctx.stroke();
        }
        break;
      }

      case 'image': {
        if (!element.imageSrc) {
          // Draw fallback shape so we see an indicator
          ctx.fillStyle = '#E5E7EB';
          ctx.fillRect(element.x, element.y, element.width, element.height);
          ctx.strokeStyle = '#9CA3AF';
          ctx.strokeRect(element.x, element.y, element.width, element.height);
          break;
        }

        try {
          const img = await loadImage(element.imageSrc);
          
          ctx.save();
          
          // Apply rounding clip if needed
          const br = element.imageBorderRadius || 0;
          if (br > 0) {
            drawRoundedRect(ctx, element.x, element.y, element.width, element.height, br);
            ctx.clip();
          }

          // Crop values are standard percents 0 - 100
          const cx = element.cropX !== undefined ? element.cropX : 0;
          const cy = element.cropY !== undefined ? element.cropY : 0;
          const cw = element.cropW !== undefined ? element.cropW : 100;
          const ch = element.cropH !== undefined ? element.cropH : 100;

          const sx = (cx / 100) * img.width;
          const sy = (cy / 100) * img.height;
          const sw = (cw / 100) * img.width;
          const sh = (ch / 100) * img.height;

          // Draw the cropped picture
          ctx.drawImage(img, sx, sy, sw, sh, element.x, element.y, element.width, element.height);
          ctx.restore();

          // Stroke Outline should be drawn outside the clip so borders are sharp
          const bw = element.imageBorderWidth || 0;
          if (bw > 0 && element.imageBorderColor) {
            ctx.save();
            ctx.strokeStyle = element.imageBorderColor;
            ctx.lineWidth = bw;
            drawRoundedRect(ctx, element.x, element.y, element.width, element.height, br);
            ctx.stroke();
            ctx.restore();
          }
        } catch (e) {
          console.error('Failed to draw image is canvas export', e);
        }
        break;
      }

      case 'icon': {
        const iconDef = ICONS_LIBRARY[element.iconName || 'sparkles'];
        if (iconDef) {
          const isStrokeBase = iconDef.category === 'arrow';
          
          // Render SVG Vector native path scaled within bounding box
          // ViewBox representation e.g. "0 0 24 24" -> width/height of path coordinate space is 24
          const parts = iconDef.viewBox.split(' ');
          const viewBoxWidth = parseFloat(parts[2]) || 24;
          const viewBoxHeight = parseFloat(parts[3]) || 24;

          ctx.save();
          ctx.translate(element.x, element.y);
          const scaleX = element.width / viewBoxWidth;
          const scaleY = element.height / viewBoxHeight;
          ctx.scale(scaleX, scaleY);
          
          if (isStrokeBase) {
            ctx.strokeStyle = element.iconColor || '#F59E0B';
            ctx.lineWidth = 2.5;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            for (const pathStr of iconDef.paths) {
              const path2d = new Path2D(pathStr);
              ctx.stroke(path2d);
            }
          } else {
            ctx.fillStyle = element.iconColor || '#F59E0B';
            for (const pathStr of iconDef.paths) {
              const path2d = new Path2D(pathStr);
              ctx.fill(path2d);
            }
          }
          ctx.restore();
        }
        break;
      }

      case 'cta': {
        // Draw Button Background
        const buttonBr = element.ctaBorderRadius ?? 8;
        const buttonBg = element.ctaBg || '#000000';
        const buttonTextCol = element.ctaTextColor || '#FFFFFF';
        
        ctx.strokeStyle = buttonBg;
        ctx.fillStyle = buttonBg;
        ctx.lineWidth = 2;

        const isOutline = element.ctaStyle === 'outline';

        // Draw background
        drawRoundedRect(ctx, element.x, element.y, element.width, element.height, buttonBr);
        if (!isOutline) {
          ctx.fill();
        } else {
          ctx.stroke();
        }

        // Draw Button Text (Centered inside box)
        const fontFam = element.fontFamily || 'sans-serif';
        const fontSize = element.fontSize || 20;
        const fontW = element.fontWeight || 600;
        ctx.font = `bold ${fontW} ${fontSize}px "${fontFam}", sans-serif`;
        ctx.fillStyle = isOutline ? buttonBg : buttonTextCol;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const textY = element.y + element.height / 2;
        const textX = element.x + element.width / 2;

        ctx.fillText(element.ctaText || 'Click Here', textX, textY);
        break;
      }
    }

    ctx.restore();
  }

  return canvas;
}

/**
 * Wraps text based on bounding width.
 */
function getWrappedLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const paragraphs = text.split('\n');
  const lines: string[] = [];

  for (const para of paragraphs) {
    if (!para) {
      lines.push('');
      continue;
    }
    const words = para.split(' ');
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine ? currentLine + ' ' + word : word;
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    lines.push(currentLine);
  }
  return lines;
}

/**
 * Exports single slide as PNG file.
 */
export async function downloadSlideAsPNG(
  slide: Slide,
  width: number,
  height: number,
  filename: string
): Promise<void> {
  const canvas = await renderSlideToCanvas(slide, width, height);
  const dataURL = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataURL;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Packs all slides into high-res PNGs inside a ZIP file and starts the download.
 */
export async function downloadAllSlidesAsZIP(
  slides: Slide[],
  width: number,
  height: number,
  zipFilename: string
): Promise<void> {
  const zip = new JSZip();

  for (let index = 0; index < slides.length; index++) {
    const slide = slides[index];
    const canvas = await renderSlideToCanvas(slide, width, height);
    const dataURL = canvas.toDataURL('image/png');
    // base64 payload sits after "data:image/png;base64,"
    const base64Data = dataURL.replace(/^data:image\/(png|jpg);base64,/, '');
    
    const slideNumber = String(index + 1).padStart(2, '0');
    zip.file(`slide_${slideNumber}.png`, base64Data, { base64: true });
  }

  const content = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(content);
  const link = document.createElement('a');
  link.download = zipFilename;
  link.href = url;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
