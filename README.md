# Daxi

An offline-first, high-fidelity social media carousel builder for LinkedIn, Instagram, and custom platforms. Crafted to build stunning, visually balanced image sequences and slides right in your browser.

Created by **Emmanuella Adams**.

---

## 🎨 Design Concept

Daxi empowers creators, designers, and marketers to arrange beautiful graphic carousels with pixel-perfect control. It features standard social dimension presets, interactive canvas adjustments, custom styling layers, and real-time canvas visual output rendering. 

---

## 🚀 Key Features and Capabilities

- **Fluid Single-Screen Workspace**: Multi-view layout featuring a slide deck timeline slider, zoomed live canvas workspace, and design inspectors.
- **Durable Offline-First Architecture**: Stores and maintains your active states locally inside the browser.
- **Advanced Layout Canvas Sandbox**: Drag, drop, scale, rotate, and style individual canvas elements dynamically.
- **Interactive Multi-layer System**:
  - **Text Layers**: Customizable font family choices (*Space Grotesk*, *Orbitron*, *Inter*, *Poppins*), font weight, color, alignments, letter-spacing, text stroke, and glow/neon effects.
  - **Quirky Geometric & Vector Shapes**: Traditional boxes, circles, triangles, stars, hearts, arrows, and newly refined quirky vector layers like **Talk & Speech Bubbles**, organic **Blobs**, **Star Seal Badges**, and **Zigzag Scribbles**.
  - **High-fidelity Custom SVG Icons**: Search and place modern visual brand vectors including LinkedIn, Instagram, Facebook, X/Twitter, YouTube, and our new additions: **GitHub**, **Threads**, **Spotify**, **Medium**, **WhatsApp**, **Web Globe**, **Waving Hand**, and **Bookmark Ribbon**.
  - **CTA Action Buttons**: Dynamic button overlays with solid/outline color customizations and rounded borders.
- **Dynamic Background Generators**: Solid background colors, linear/radial gradients, and adjustable patterns (waves, dots, zigzag, stripes).
- **Instant Live Previews**: Direct canvas captures mapping each slide state to real-time high-fidelity outputs.

---

## 🛠️ Tech Stack & Architecture

- **Frontend Framework**: React 18+ powered by Vite.
- **Language**: TypeScript (`strict` type-safety).
- **Styling**: Tailwind CSS for responsive desktop-first layout styling.
- **Icons**: Lucide React for UI elements and custom tailored SVGs for the library assets.
- **Visual Captures**: Integrated canvas rendering matrices with seamless element bounding box geometry.

---

## 🏃 Getting Started & Development

To spin up the development workspace, follow the instructions below:

### 1. Install Dependencies
```bash
npm install
```

### 2. Launch Development Server
Starts the high-speed local dev server:
```bash
npm run dev
```

### 3. Production Build
Compiles the client-side single page application assets directly into `dist/`:
```bash
npm run build
```

### 4. Running Lints
Executes strict TypeScript check and lint rules:
```bash
npm run lint
```
