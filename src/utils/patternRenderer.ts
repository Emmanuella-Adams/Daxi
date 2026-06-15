import { CSSProperties } from 'react';
import { BgPatternType } from '../types';

/**
 * Returns the CSS style object for the editor live preview.
 */
export function getPatternCSS(pattern: BgPatternType, color: string): CSSProperties {
  if (pattern === 'none') return {};

  const cleanColor = encodeURIComponent(color);
  
  switch (pattern) {
    case 'dots':
      return {
        backgroundImage: `radial-gradient(circle, ${color} 10%, transparent 11%)`,
        backgroundSize: '20px 20px',
      };
    case 'stripes':
      return {
        backgroundImage: `linear-gradient(45deg, ${color} 12.5%, transparent 12.5%, transparent 50%, ${color} 50%, ${color} 62.5%, transparent 62.5%, transparent)`,
        backgroundSize: '24px 24px',
      };
    case 'zigzag':
      // A clean zigzag pattern using SVG data URL for crisp rendering in React CSS
      const zigzagSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="20" viewBox="0 0 40 20"><path d="M0 20 L20 0 L40 20" fill="none" stroke="${cleanColor}" stroke-width="1.5"/></svg>`;
      return {
        backgroundImage: `url("data:image/svg+xml,${zigzagSVG}")`,
        backgroundSize: '40px 20px',
      };
    case 'waves':
      // Wavy patterns using standard light curves in React CSS
      const wavesSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="20" viewBox="0 0 40 20"><path d="M0 10 Q 10 5, 20 10 T 40 10" fill="none" stroke="${cleanColor}" stroke-width="1.5"/></svg>`;
      return {
        backgroundImage: `url("data:image/svg+xml,${wavesSVG}")`,
        backgroundSize: '40px 20px',
      };
    default:
      return {};
  }
}

/**
 * Draws the background pattern on a canvas context for pixel-perfect high-res PNG export.
 */
export function drawPatternOnCanvas(
  ctx: CanvasRenderingContext2D,
  pattern: BgPatternType,
  color: string,
  width: number,
  height: number
): void {
  if (pattern === 'none') return;

  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;

  switch (pattern) {
    case 'dots': {
      const step = 24;
      const radius = 2;
      for (let x = 0; x < width; x += step) {
        for (let y = 0; y < height; y += step) {
          ctx.beginPath();
          ctx.arc(x + step / 2, y + step / 2, radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      break;
    }
    
    case 'stripes': {
      const step = 28;
      ctx.lineWidth = 3;
      // Draw standard diagonal stripe lines across the whole canvas space
      for (let offset = -height; offset < width; offset += step) {
        ctx.beginPath();
        ctx.moveTo(offset, 0);
        ctx.lineTo(offset + height, height);
        ctx.stroke();
      }
      break;
    }

    case 'zigzag': {
      const tileWidth = 40;
      const tileHeight = 20;
      ctx.lineWidth = 1.5;
      for (let y = 0; y < height + tileHeight; y += tileHeight) {
        for (let x = 0; x < width + tileWidth; x += tileWidth) {
          ctx.beginPath();
          ctx.moveTo(x, y + tileHeight);
          ctx.lineTo(x + tileWidth / 2, y);
          ctx.lineTo(x + tileWidth, y + tileHeight);
          ctx.stroke();
        }
      }
      break;
    }

    case 'waves': {
      const tileWidth = 40;
      const tileHeight = 20;
      ctx.lineWidth = 1.5;
      for (let y = 0; y < height + tileHeight; y += tileHeight) {
        ctx.beginPath();
        for (let x = 0; x < width + tileWidth; x += 10) {
          const waveY = y + 10 + Math.sin((x / tileWidth) * Math.PI * 2) * 5;
          if (x === 0) {
            ctx.moveTo(x, waveY);
          } else {
            ctx.lineTo(x, waveY);
          }
        }
        ctx.stroke();
      }
      break;
    }
  }

  ctx.restore();
}
