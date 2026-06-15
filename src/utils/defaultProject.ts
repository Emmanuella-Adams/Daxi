import { Project, Slide, CanvasElement } from '../types';

// Large high-quality royalty-free image URLs for demo templates (supported fully in browser)
export const DEMO_IMAGES = [
  'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=640', // Gradient mesh
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=640', // Abstract art
  'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=640', // Pastel gradient
  'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?q=80&w=640'  // 3D glassmorphism shapes
];

export const CURATED_COLOR_PALETTE = [
  // Vibrant Primary Colors
  '#4F46E5', '#6366F1', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#8B5CF6',
  // Trendy Deep Colors
  '#1E1B4B', '#0F172A', '#111827', '#022C22', '#1E293B', '#311042', '#3B0764', '#053150',
  // Elegant Pastel / Light Colors
  '#F3F4F6', '#EEF2F6', '#E0E7FF', '#FDF2F8', '#F5F3FF', '#ECFDF5', '#FFFBEB', '#FEF2F2',
  // Extra options
  '#000000', '#FFFFFF'
];

export const DEFAULT_SLIDES: Slide[] = [
  // Slide 1: Main Hook (Visual Title)
  {
    id: 'slide-1',
    bgColor: '#1E1B4B',
    bgGradient: {
      type: 'linear',
      angle: 135,
      stops: [
        { offset: 0, color: '#1E1B4B' },
        { offset: 100, color: '#311042' }
      ]
    },
    bgPattern: 'dots',
    bgPatternColor: 'rgba(255, 255, 255, 0.08)',
    bgImage: null,
    bgOpacity: 0.2,
    elements: [
      {
        id: 's1-el-sparkle',
        type: 'icon',
        x: 90,
        y: 100,
        width: 100,
        height: 100,
        rotation: -10,
        opacity: 0.9,
        iconName: 'sparkles',
        iconColor: '#F59E0B'
      },
      {
        id: 's1-el-tag',
        type: 'text',
        x: 210,
        y: 130,
        width: 600,
        height: 50,
        rotation: 0,
        opacity: 1,
        textContent: 'OFFLINE CAROUSEL CREATOR',
        fontSize: 22,
        fontFamily: 'Orbitron',
        fontWeight: 700,
        textColor: '#C7D2FE',
        align: 'left',
        letterSpacing: 2
      },
      {
        id: 's1-el-title',
        type: 'text',
        x: 90,
        y: 250,
        width: 900,
        height: 380,
        rotation: 0,
        opacity: 1,
        textContent: 'CREATE HIGH-CONVERTING\nCAROUSELS FOR SOCIALS\nWITHOUT EFFORT.',
        fontSize: 52,
        fontFamily: 'Orbitron',
        fontWeight: 800,
        textColor: '#FFFFFF',
        align: 'left',
        lineHeight: 1.25,
        shadowEnabled: true,
        shadowColor: 'rgba(0, 0, 0, 0.5)',
        shadowOffsetX: 4,
        shadowOffsetY: 4,
        shadowBlur: 8,
        strokeEnabled: true,
        strokeColor: '#4F46E5',
        strokeWidth: 2
      },
      {
        id: 's1-el-sub',
        type: 'text',
        x: 90,
        y: 650,
        width: 900,
        height: 120,
        rotation: 0,
        opacity: 1,
        textContent: 'Fully customizable, 100% client-side, export individual PNGs or a consolidated ZIP package in seconds.',
        fontSize: 26,
        fontFamily: 'Space Grotesk',
        fontWeight: 400,
        textColor: '#94A3B8',
        align: 'left',
        lineHeight: 1.4
      },
      {
        id: 's1-el-cta',
        type: 'cta',
        x: 340,
        y: 840,
        width: 400,
        height: 100,
        rotation: 0,
        opacity: 1,
        ctaText: 'SWIPE TO LEARN MORE 🚀',
        ctaStyle: 'solid',
        ctaBg: '#4F46E5',
        ctaTextColor: '#FFFFFF',
        ctaBorderRadius: 50,
        fontSize: 22,
        fontFamily: 'Space Grotesk',
        fontWeight: 700
      }
    ]
  },
  // Slide 2: Multi-Platform (Interactive Presets)
  {
    id: 'slide-2',
    bgColor: '#0F172A',
    bgGradient: null,
    bgPattern: 'stripes',
    bgPatternColor: 'rgba(255, 255, 255, 0.04)',
    bgImage: null,
    bgOpacity: 1,
    elements: [
      {
        id: 's2-el-badge',
        type: 'shape',
        x: 90,
        y: 100,
        width: 200,
        height: 50,
        rotation: 0,
        opacity: 1,
        shapeType: 'rect',
        fillColor: 'rgba(245, 158, 11, 0.1)',
        strokeColor: '#F59E0B',
        strokeWidth: 1.5,
        borderRadius: 20
      },
      {
        id: 's2-el-badge-text',
        type: 'text',
        x: 110,
        y: 113,
        width: 160,
        height: 30,
        rotation: 0,
        opacity: 1,
        textContent: '01. MULTI-FORMAT',
        fontSize: 16,
        fontFamily: 'Orbitron',
        fontWeight: 700,
        textColor: '#F59E0B',
        align: 'center'
      },
      {
        id: 's2-el-title',
        type: 'text',
        x: 90,
        y: 190,
        width: 900,
        height: 180,
        rotation: 0,
        opacity: 1,
        textContent: 'Tailored for Every Platform',
        fontSize: 48,
        fontFamily: 'Space Grotesk',
        fontWeight: 700,
        textColor: '#FFFFFF',
        align: 'left'
      },
      // Left box: LinkedIn
      {
        id: 's2-el-box1',
        type: 'shape',
        x: 90,
        y: 330,
        width: 420,
        height: 380,
        rotation: 0,
        opacity: 1,
        shapeType: 'rect',
        fillColor: '#1E293B',
        strokeColor: '#334155',
        strokeWidth: 2,
        borderRadius: 24
      },
      {
        id: 's2-el-ic-li',
        type: 'icon',
        x: 140,
        y: 380,
        width: 80,
        height: 80,
        rotation: 0,
        opacity: 1,
        iconName: 'linkedin',
        iconColor: '#3B82F6'
      },
      {
        id: 's2-el-li-title',
        type: 'text',
        x: 140,
        y: 490,
        width: 320,
        height: 50,
        rotation: 0,
        opacity: 1,
        textContent: 'LinkedIn Documents',
        fontSize: 26,
        fontFamily: 'Space Grotesk',
        fontWeight: 700,
        textColor: '#FFFFFF',
        align: 'left'
      },
      {
        id: 's2-el-li-desc',
        type: 'text',
        x: 140,
        y: 550,
        width: 320,
        height: 120,
        rotation: 0,
        opacity: 1,
        textContent: 'Perfect 1:1 post ratio (1080x1080px) to slide through PDFs smoothly.',
        fontSize: 18,
        fontFamily: 'Inter',
        fontWeight: 400,
        textColor: '#94A3B8',
        align: 'left',
        lineHeight: 1.4
      },
      // Right box: Instagram
      {
        id: 's2-el-box2',
        type: 'shape',
        x: 570,
        y: 330,
        width: 420,
        height: 380,
        rotation: 0,
        opacity: 1,
        shapeType: 'rect',
        fillColor: '#1E293B',
        strokeColor: '#334155',
        strokeWidth: 2,
        borderRadius: 24
      },
      {
        id: 's2-el-ic-ig',
        type: 'icon',
        x: 620,
        y: 380,
        width: 80,
        height: 80,
        rotation: 0,
        opacity: 1,
        iconName: 'instagram',
        iconColor: '#EC4899'
      },
      {
        id: 's2-el-ig-title',
        type: 'text',
        x: 620,
        y: 490,
        width: 320,
        height: 50,
        rotation: 0,
        opacity: 1,
        textContent: 'Instagram Posts & Stories',
        fontSize: 26,
        fontFamily: 'Space Grotesk',
        fontWeight: 700,
        textColor: '#FFFFFF',
        align: 'left'
      },
      {
        id: 's2-el-ig-desc',
        type: 'text',
        x: 620,
        y: 550,
        width: 320,
        height: 120,
        rotation: 0,
        opacity: 1,
        textContent: 'Cover either square posts or full-screen immersive stories (1080x1920px).',
        fontSize: 18,
        fontFamily: 'Inter',
        fontWeight: 400,
        textColor: '#94A3B8',
        align: 'left',
        lineHeight: 1.4
      },
      // Footer text indicator on slide
      {
        id: 's2-el-foot',
        type: 'text',
        x: 90,
        y: 780,
        width: 900,
        height: 120,
        rotation: 0,
        opacity: 1,
        textContent: '👉 Plus a customizable canvas dimension to unlock bespoke branding designs!',
        fontSize: 24,
        fontFamily: 'Space Grotesk',
        fontWeight: 500,
        textColor: '#C7D2FE',
        align: 'center'
      }
    ]
  },
  // Slide 3: Interactive Visual Canvas (Shapes library)
  {
    id: 'slide-3',
    bgColor: '#1E293B',
    bgGradient: null,
    bgPattern: 'zigzag',
    bgPatternColor: 'rgba(255, 255, 255, 0.03)',
    bgImage: null,
    bgOpacity: 1,
    elements: [
      {
        id: 's3-el-badge',
        type: 'shape',
        x: 90,
        y: 100,
        width: 200,
        height: 50,
        rotation: 0,
        opacity: 1,
        shapeType: 'rect',
        fillColor: 'rgba(16, 185, 129, 0.1)',
        strokeColor: '#10B981',
        strokeWidth: 1.5,
        borderRadius: 20
      },
      {
        id: 's3-el-badge-text',
        type: 'text',
        x: 110,
        y: 113,
        width: 160,
        height: 30,
        rotation: 0,
        opacity: 1,
        textContent: '02. VECTORS & ART',
        fontSize: 16,
        fontFamily: 'Orbitron',
        fontWeight: 700,
        textColor: '#10B981',
        align: 'center'
      },
      {
        id: 's3-el-title',
        type: 'text',
        x: 90,
        y: 190,
        width: 900,
        height: 150,
        rotation: 0,
        opacity: 1,
        textContent: 'Rich Vector & Shape Canvas',
        fontSize: 48,
        fontFamily: 'Space Grotesk',
        fontWeight: 700,
        textColor: '#FFFFFF',
        align: 'left'
      },
      // Beautiful abstract graphic rendering
      {
        id: 's3-el-sh1',
        type: 'shape',
        x: 150,
        y: 350,
        width: 220,
        height: 220,
        rotation: 15,
        opacity: 0.9,
        shapeType: 'circle',
        fillColor: '#EC4899',
        strokeColor: '#FDF2F8',
        strokeWidth: 4
      },
      {
        id: 's3-el-sh2',
        type: 'shape',
        x: 270,
        y: 430,
        width: 250,
        height: 250,
        rotation: -25,
        opacity: 0.8,
        shapeType: 'star',
        fillColor: '#F59E0B'
      },
      {
        id: 's3-el-sh3',
        type: 'shape',
        x: 480,
        y: 310,
        width: 450,
        height: 380,
        rotation: 5,
        opacity: 1,
        shapeType: 'rect',
        fillColor: '#4F46E5',
        strokeColor: '#E0E7FF',
        strokeWidth: 6,
        borderRadius: 40
      },
      {
        id: 's3-el-sh3-title',
        type: 'text',
        x: 520,
        y: 370,
        width: 370,
        height: 50,
        rotation: 5,
        opacity: 1,
        textContent: 'FLEXIBLE CONTAINER',
        fontSize: 24,
        fontFamily: 'Orbitron',
        fontWeight: 800,
        textColor: '#FFFFFF',
        align: 'left'
      },
      {
        id: 's3-el-sh3-desc',
        type: 'text',
        x: 520,
        y: 440,
        width: 370,
        height: 200,
        rotation: 5,
        opacity: 1,
        textContent: 'Drag and expand shapes, customize border radius on the fly, upload image clips with outline stroke adjustments instantly.',
        fontSize: 22,
        fontFamily: 'Space Grotesk',
        fontWeight: 400,
        textColor: '#E0E7FF',
        align: 'left',
        lineHeight: 1.4
      }
    ]
  },
  // Slide 4: Final call-to-action
  {
    id: 'slide-4',
    bgColor: '#311042',
    bgGradient: {
      type: 'radial',
      angle: 0,
      stops: [
        { offset: 0, color: '#311042' },
        { offset: 100, color: '#111827' }
      ]
    },
    bgPattern: 'waves',
    bgPatternColor: 'rgba(255, 255, 255, 0.04)',
    bgImage: null,
    bgOpacity: 1,
    elements: [
      {
        id: 's4-el-badge',
        type: 'shape',
        x: 390,
        y: 150,
        width: 300,
        height: 60,
        rotation: 0,
        opacity: 1,
        shapeType: 'rect',
        fillColor: 'rgba(236, 72, 153, 0.1)',
        strokeColor: '#EC4899',
        strokeWidth: 2,
        borderRadius: 30
      },
      {
        id: 's4-el-badge-text',
        type: 'text',
        x: 410,
        y: 167,
        width: 260,
        height: 30,
        rotation: 0,
        opacity: 1,
        textContent: 'LET’S GET STARTED',
        fontSize: 18,
        fontFamily: 'Orbitron',
        fontWeight: 800,
        textColor: '#EC4899',
        align: 'center'
      },
      {
        id: 's4-el-title',
        type: 'text',
        x: 90,
        y: 280,
        width: 900,
        height: 250,
        rotation: 0,
        opacity: 1,
        textContent: 'Make Your Brand Unforgettable!',
        fontSize: 54,
        fontFamily: 'Space Grotesk',
        fontWeight: 700,
        textColor: '#FFFFFF',
        align: 'center',
        shadowEnabled: true,
        shadowColor: 'rgba(236, 72, 153, 0.3)',
        shadowBlur: 20
      },
      {
        id: 's4-el-sub',
        type: 'text',
        x: 90,
        y: 440,
        width: 900,
        height: 120,
        rotation: 0,
        opacity: 1,
        textContent: 'Duplicate pages, apply settings uniformly with the "Apply to All" controller, download individual slides, or export the whole bundle as a ZIP. Everything is stored persistently in your local sandbox.',
        fontSize: 24,
        fontFamily: 'Inter',
        fontWeight: 400,
        textColor: '#94A3B8',
        align: 'center',
        lineHeight: 1.5
      },
      {
        id: 's4-el-cta1',
        type: 'cta',
        x: 290,
        y: 620,
        width: 500,
        height: 110,
        rotation: 0,
        opacity: 1,
        ctaText: 'START EXPORTING NOW ⚡',
        ctaStyle: 'solid',
        ctaBg: '#EC4899',
        ctaTextColor: '#FFFFFF',
        ctaBorderRadius: 16,
        fontSize: 24,
        fontFamily: 'Orbitron',
        fontWeight: 700
      },
      {
        id: 's4-el-cred',
        type: 'text',
        x: 90,
        y: 800,
        width: 900,
        height: 50,
        rotation: 0,
        opacity: 1,
        textContent: 'Designed with Daxi • Fully Offline Capable',
        fontSize: 18,
        fontFamily: 'Space Grotesk',
        fontWeight: 500,
        textColor: '#64748B',
        align: 'center'
      }
    ]
  }
];

export const INITIAL_PROJECT: Project = {
  id: 'daxi-default-project',
  name: 'First Daxi Social Grid',
  platform: 'linkedin',
  width: 1080,
  height: 1080,
  slides: DEFAULT_SLIDES,
  createdAt: Date.now(),
  updatedAt: Date.now()
};
