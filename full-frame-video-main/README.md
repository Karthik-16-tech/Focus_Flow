# FocusFlow Waveform Carousel Replica

An interactive, borderless editorial carousel featuring organic wave geometry, continuous loop dragging with inertia, GSAP entrance animations, and full accessibility controls.

## Prerequisites & Dependencies

Install GSAP in your target project:

```bash
npm install gsap
# or
bun add gsap
# or
pnpm add gsap
```

## Typography & Fonts

Add these Google Fonts to your HTML `<head>` or root layout:
- **Barlow Condensed** (700 / 800 / 900 for bold editorial headings)
- **IBM Plex Mono** (400 / 500 for technical labels and metadata)
- **Roboto** (300 / 400 for captions)
- **Michroma** (futuristic geometric branding)

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,700;0,800;0,900;1,800&family=IBM+Plex+Mono:wght@400;500;600&family=Michroma&family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet">
```

## Project Structure

```text
src/
├── components/
│   ├── focusflow-hero.tsx       # Core waveform carousel component
│   └── focusflow-showcase.tsx   # Seamless page section carousel
├── lib/
│   ├── flow-frame.ts           # Dynamic wave contour path generator
│   └── flow-motion.ts          # Pointer physics & wrapping math
└── assets/
    └── drag/                   # High-resolution artwork images
```

## How It Works

1. **Waveform Geometry (`flow-frame.ts`)**: Creates smooth cubic Bézier SVG paths that dynamically respond to drag displacement, giving the carousel its flowing liquid edges.
2. **Infinite Strip Math (`flow-motion.ts`)**: Duplicates panel sequences across 3 virtual strips so dragging left or right wraps smoothly with zero edge clipping or empty states.
3. **Pointer Capture (`focusflow-hero.tsx`)**: Directly binds pointer events with inertia physics and momentum damping.
4. **Accessible Reduced Motion**: Automatically falls back to steady positioning when `prefers-reduced-motion` is detected.
