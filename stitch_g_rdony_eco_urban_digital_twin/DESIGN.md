---
name: Urban Intelligence System
colors:
  surface: '#0b1326'
  surface-dim: '#0b1326'
  surface-bright: '#31394d'
  surface-container-lowest: '#060e20'
  surface-container-low: '#131b2e'
  surface-container: '#171f33'
  surface-container-high: '#222a3d'
  surface-container-highest: '#2d3449'
  on-surface: '#dae2fd'
  on-surface-variant: '#b9cacb'
  inverse-surface: '#dae2fd'
  inverse-on-surface: '#283044'
  outline: '#849495'
  outline-variant: '#3b494b'
  surface-tint: '#00dbe9'
  primary: '#dbfcff'
  on-primary: '#00363a'
  primary-container: '#00f0ff'
  on-primary-container: '#006970'
  inverse-primary: '#006970'
  secondary: '#f5fff3'
  on-secondary: '#00391d'
  secondary-container: '#27ff97'
  on-secondary-container: '#00723f'
  tertiary: '#f8f4ff'
  on-tertiary: '#1000a9'
  tertiary-container: '#d7d6ff'
  on-tertiary-container: '#494bd7'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#7df4ff'
  primary-fixed-dim: '#00dbe9'
  on-primary-fixed: '#002022'
  on-primary-fixed-variant: '#004f54'
  secondary-fixed: '#5bffa1'
  secondary-fixed-dim: '#00e383'
  on-secondary-fixed: '#00210e'
  on-secondary-fixed-variant: '#00522c'
  tertiary-fixed: '#e1e0ff'
  tertiary-fixed-dim: '#c0c1ff'
  on-tertiary-fixed: '#07006c'
  on-tertiary-fixed-variant: '#2f2ebe'
  background: '#0b1326'
  on-background: '#dae2fd'
  surface-variant: '#2d3449'
typography:
  display-lg:
    fontFamily: Space Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Space Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Space Grotesk
    fontSize: 24px
    fontWeight: '500'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-md:
    fontFamily: Space Grotesk
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.2'
    letterSpacing: 0.05em
  code-sm:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '400'
    lineHeight: '1.4'
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 40px
  container-max: 1440px
---

## Brand & Style

This design system is built for an Urban Intelligence platform, targeting city planners, data scientists, and infrastructure engineers. The brand personality is **precise, authoritative, and visionary**, bridging the gap between raw data and actionable urban insights.

The design style is a hybrid of **Modern Minimalism** and **Refined Glassmorphism**. It prioritizes high information density through a "Data-First" lens, using expansive whitespace not just for aesthetics, but to delineate complex datasets. The aesthetic is "Technical Elegance"—utilizing ultra-thin lines, subtle transparency, and a sophisticated dark-mode-first approach to reduce eye strain during long periods of analytical work. The emotional response should be one of total control and crystalline clarity.

## Colors

The palette is optimized for high-contrast dark environments, ensuring data visualizations "pop" against deep structural backgrounds.

- **Primary (Electric Blue):** Used for primary actions, active states, and critical data paths. It represents connectivity and flow.
- **Secondary (Emerald Green):** Dedicated to positive trends, "Go" signals, and environmental data layers.
- **Tertiary (Indigo):** Used for auxiliary data categories and system-level accents to provide depth without competing with primary metrics.
- **Neutral/Background:** A progression from deep canvas (`#020617`) to elevated surfaces (`#0F172A`). 
- **Functional Grays:** Slate-based grays are used for secondary text and structural borders to maintain a cool, technical temperature throughout the UI.

## Typography

This design system utilizes **Space Grotesk** for headings and UI labels to provide a geometric, technical character that feels modern and approachable. For long-form data and body text, **Inter** is used for its superior legibility at small sizes and its neutral, systematic feel.

- **Scale:** Use a strict typographic scale to maintain hierarchy in data-heavy views.
- **Case:** Use Uppercase for `label-md` roles to distinguish metadata from content.
- **Data Display:** For coordinates, timestamps, and sensor readings, use a monospaced font (JetBrains Mono) to ensure tabular alignment and numerical clarity.

## Layout & Spacing

The layout philosophy follows a **Fluid Grid with Fixed Gutters**. The system is built on a 4px baseline shift to ensure all elements align to a technical rhythm.

- **Desktop:** 12-column grid. Sidebars for navigation and data filters are fixed-width (280px), while the central map or dashboard area is fluid.
- **Density:** High density is encouraged. Padding within cards should be a consistent 16px or 24px to maximize the visible data surface.
- **Breakpoints:** 
    - Mobile (< 768px): 4-column layout, reduced margins (16px).
    - Tablet (768px - 1024px): 8-column layout.
    - Desktop (> 1024px): 12-column layout.

## Elevation & Depth

Depth is conveyed through **Tonal Layering** and **Glassmorphism** rather than traditional heavy shadows.

- **Base Layer:** The darkest tone (`#020617`), representing the background or "ground" of the map.
- **Surface Layer:** Subtle 1px borders using `rgba(255, 255, 255, 0.08)` define card boundaries. 
- **Interactive Elevation:** Elements that hover use a `backdrop-filter: blur(12px)` and a slight increase in border brightness to simulate "lifting" off the data plane.
- **Shadows:** Use only one shadow type—a very subtle, large-radius ambient glow (0 10px 40px rgba(0,0,0,0.4)) for floating modals or context menus.

## Shapes

The shape language is **Soft (Level 1)**, leaning toward precision. 

- **Primary Elements:** 4px (0.25rem) corner radius for most cards and input fields to maintain a professional, architectural feel.
- **Interactive Elements:** Buttons and small chips use an 8px (0.5rem) radius to make them distinct and "touchable" within the rigid grid.
- **Visual Contrast:** Data visualization points and map markers remain sharp or circular to provide contrast against the rectangular UI containers.

## Components

- **Cards:** Ultra-minimal. No heavy shadows. Use a 1px solid border (`#ffffff14`) and a slight background tint. Headers inside cards should use `label-md` typography.
- **Buttons:** 
    - *Primary:* Solid Electric Blue with dark text for maximum contrast. 
    - *Ghost:* 1px border with Electric Blue text, no fill unless hovered.
- **Data Inputs:** Dark backgrounds with subtle bottom-borders. Focus states must trigger a 1px solid Electric Blue border and a very soft outer glow.
- **Chips/Status:** Small, pill-shaped labels. Use Secondary (Green) for 'Active', Primary (Blue) for 'Processing', and a muted slate for 'Inactive'.
- **Lists:** Use "Divideless" lists where whitespace and subtle hover-states (a slight lightening of the background) define the rows.
- **Icons:** High-fidelity, 1.5px stroke weight. Avoid filled icons; use "light" or "thin" variants to match the technical aesthetic of Space Grotesk.
- **Specialized Components:** Include a "Data HUD" component—a semi-transparent, floating panel used for real-time telemetry, utilizing the glassmorphism blur and monospaced numerical displays.