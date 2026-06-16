# Destekly Homepage Redesign - Modern Design Patterns

This document outlines the design decisions, patterns, color systems, and layout structure for the Destekly homepage redesign.

---

## 1. Visual & Aesthetic Principles

Destekly is a platform for foster care and NGO support. The design should convey **warmth, trust, transparency, and hope**. We use a combination of modern high-premium aesthetics:
- **Glassmorphism**: Soft background blurs and border glows to create depth and structure.
- **Warm Earth Tones & Terracotta Accents**: Friendly, calm, and professional color palette.
- **Micro-interactions**: Hover effects, smooth transition delays, scale transitions, and gradient outlines.
- **Asymmetric & Grid Layouts**: Clean, structured grid layouts presenting the different modules of the application.

---

## 2. Palette & Typography

We extend the core palette with harmonious design system tokens:

```css
:root {
  /* Primary brand colors */
  --color-brand-primary: #a56131;    /* Cozy Terracotta */
  --color-brand-hover: #8e4f25;
  --color-brand-dark: #6f4629;       /* Earthy Brown */
  --color-brand-deep: #3f2c1d;       /* Onyx Cocoa (Text) */
  
  /* Accent & Highlight */
  --color-accent-amber: #f59e0b;
  --color-accent-cream: #fbf6f0;
  --color-accent-border: #e3d5c7;
  
  /* Backgrounds */
  --color-bg-base: #f6f1ea;          /* Warm linen */
  --color-bg-card: rgba(253, 250, 246, 0.85); /* Semi-transparent cream */
  --color-bg-hero-overlay: rgba(252, 247, 241, 0.4);
}
```

---

## 3. Structural Redesign of the Homepage

### A. The Hero Section
- **Background Image**: Embed `hero_background.png` with a `relative` container and `absolute inset-0`. Set the opacity to `0.15` to `0.25` so it remains a subtle watermark/texture.
- **Fading Masks**: A linear bottom gradient mask (`to-bottom, transparent, var(--color-bg-base)`) will blend the hero section into the rest of the homepage content.
- **Hero Card**: A centered, glassmorphic panel containing the logo, taglines, primary Call-To-Action (Contact / Apply as Organization), and safety verification labels.

### B. Core Modular Grid ("What We Do")
Directly below the Hero, we introduce a structured, visual showcase of the 5 core pillars of the platform, designed as premium interactive cards:

1. **About Us**
   - *Design*: Larger double-column card. Contains the mission summary.
   - *Directs to*: `/about`
2. **Donation Calls**
   - *Design*: Single-column card. Displays the latest active donation call with a tiny visual progress bar (e.g. 75% raised).
   - *Directs to*: `/campaigns`
3. **Clothing Support**
   - *Design*: Single-column card. Showcases seasonal clothing needs with an interactive icon badge.
   - *Directs to*: `/clothes-donation`
4. **Impact Updates**
   - *Design*: Single-column card. Shows a snippet of the latest verified impact update or success photo.
   - *Directs to*: `/updates`
5. **Top Supporters (Recognition)**
   - *Design*: Single-column card. Shows a mini-leaderboard or badge list of top contributors.
   - *Directs to*: `/recognition`

---

## 4. Key Design Patterns to Implement

- **Dynamic Interactive States**:
  Every grid module is an interactive link that uses Tailwind's hover states:
  ```html
  class="group relative overflow-hidden rounded-3xl border border-amber-900/10 bg-white/70 p-8 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-amber-900/20 hover:shadow-xl"
  ```
- **Progressive Disclosures**:
  Hovering over a card will reveal the arrow icon or transition the CTA button background, encouraging user interaction.
