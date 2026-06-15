export interface GradientStop {
  offset: number; // 0 to 100
  color: string;
}

export interface BgGradient {
  type: 'linear' | 'radial';
  angle: number; // for linear gradients
  stops: GradientStop[];
}

export type BgPatternType = 'none' | 'dots' | 'stripes' | 'zigzag' | 'waves';

export interface CanvasElement {
  id: string;
  type: 'text' | 'shape' | 'image' | 'icon' | 'cta';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number; // in degrees
  opacity: number; // 0 to 1

  // Text specific
  textContent?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: number;
  color?: string; // HEX or RGB
  align?: 'left' | 'center' | 'right';
  letterSpacing?: number; // px
  lineHeight?: number; // multiplier e.g. 1.2
  textColor?: string;

  // Text Effects
  shadowEnabled?: boolean;
  shadowColor?: string;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  shadowBlur?: number;
  glowEnabled?: boolean;
  glowColor?: string;
  glowBlur?: number;
  strokeEnabled?: boolean;
  strokeColor?: string;
  strokeWidth?: number;

  // Shape specific
  shapeType?: 'rect' | 'circle' | 'triangle' | 'star' | 'heart' | 'arrow' | 'speechBubble' | 'blob' | 'badge' | 'zigzag';
  fillColor?: string;
  borderRadius?: number;

  // Image specific
  imageSrc?: string;
  imageBorderColor?: string;
  imageBorderWidth?: number;
  imageBorderRadius?: number;
  cropX?: number; // 0 to 100 scale showing crop start percentage
  cropY?: number;
  cropW?: number; // 0 to 100 scale showing crop dimensions
  cropH?: number;

  // Icon specific
  iconName?: string; // Key of custom SVG library
  iconColor?: string;

  // CTA Button specific
  ctaText?: string;
  ctaStyle?: 'solid' | 'outline';
  ctaBg?: string;
  ctaTextColor?: string;
  ctaBorderRadius?: number;
}

export interface Slide {
  id: string;
  bgColor: string; // fallback or solid color
  bgGradient: BgGradient | null;
  bgPattern: BgPatternType;
  bgPatternColor: string;
  bgImage: string | null; // DataURL or external link
  bgOpacity: number; // 0 to 1
  elements: CanvasElement[];
}

export type PlatformPreset = 'linkedin' | 'instagram' | 'story' | 'custom';

export interface Project {
  id: string;
  name: string;
  platform: PlatformPreset;
  width: number;
  height: number;
  slides: Slide[];
  createdAt: number;
  updatedAt: number;
}

export interface EditorHistoryState {
  slides: Slide[];
}
