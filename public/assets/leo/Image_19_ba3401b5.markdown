---
name: Luminous Nocturne
colors:
  surface: '#160f25'
  surface-dim: '#160f25'
  surface-bright: '#3d354d'
  surface-container-lowest: '#110a20'
  surface-container-low: '#1f182e'
  surface-container: '#231c32'
  surface-container-high: '#2e263d'
  surface-container-highest: '#393149'
  on-surface: '#eaddfc'
  on-surface-variant: '#d1c2d3'
  inverse-surface: '#eaddfc'
  inverse-on-surface: '#342c44'
  outline: '#9a8c9d'
  outline-variant: '#4e4351'
  surface-tint: '#e9b3ff'
  primary: '#e9b3ff'
  on-primary: '#510073'
  primary-container: '#842baf'
  on-primary-container: '#edbeff'
  inverse-primary: '#8b33b6'
  secondary: '#deb7ff'
  on-secondary: '#461273'
  secondary-container: '#5f2e8b'
  on-secondary-container: '#d2a0ff'
  tertiary: '#15e46f'
  on-tertiary: '#003916'
  tertiary-container: '#00662d'
  on-tertiary-container: '#29ec76'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#f7d8ff'
  primary-fixed-dim: '#e9b3ff'
  on-primary-fixed: '#310048'
  on-primary-fixed-variant: '#710f9c'
  secondary-fixed: '#f1dbff'
  secondary-fixed-dim: '#deb7ff'
  on-secondary-fixed: '#2d0050'
  on-secondary-fixed-variant: '#5f2e8b'
  tertiary-fixed: '#65ff91'
  tertiary-fixed-dim: '#15e46f'
  on-tertiary-fixed: '#00210a'
  on-tertiary-fixed-variant: '#005323'
  background: '#160f25'
  on-background: '#eaddfc'
  surface-variant: '#393149'
typography:
  display-hero:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '800'
    lineHeight: 48px
    letterSpacing: -0.03em
  display-hero-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '800'
    lineHeight: 38px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 10px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-tablet: 1.25rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-tablet: 2rem
  margin-desktop: 3rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
  space-2xl: 3rem
---

## Brand & Style

This design system expresses the identity of an intelligent, performance-driven AI fitness companion. It blends high-end athletic precision with atmospheric, bio-digital intelligence.

The visual direction marries **Glassmorphism** with deep **Tonal Layering** over an abyssal violet canvas:
- **Atmospheric & Immersive:** The base canvas breathes through rich dark hues, evoking focus, late-night grit, and sleek futuristic gym interfaces.
- **Cognitive Clarity:** The AI persona (LÉO) communicates through radiant ultraviolet glows and luminous lilacs, signifying high technological intuition, promptness, and proactive motivation.
- **Tactile Modernity:** Semi-translucent micro-surfaces, subtle specular borders, and high-contrast typographic tiers elevate the interface above typical flat fitness trackers.

## Colors

The palette is engineered for pure dark-mode immersion, maximizing OLED energy efficiency and visual depth.

### Core Architecture
- **Canvas Base:** Dominant `#0B0712`, stepping into `#160B25` and deep ambient gradients (`#271044`) across header highlights and hero cards.
- **Brand Primary:** `#842BAF` as the primary dynamic anchor, supported by `#681791` for press states and `#B784E6` as the high-visibility lilac accent for tags, icons, and AI markers.
- **Surfaces & Cards:** Layer 1 surfaces reside at `#171026`; elevated floating containers sit at `#1F1433`. Borders use structural hairline tints: `#311C50` or dynamic `rgba(255, 255, 255, 0.08)`.
- **Text & Content Hierarchy:**
  - Primary Text: `#FFFFFF` (High contrast, 100%)
  - Secondary Text: `#A59DB5` (Metadata, subtitles, descriptive copy)
  - Tertiary/Muted: `#8C849B` and `#555557` (Dividers, disabled states, placeholders)

### Functional & Metrics
- **Success / Goal Reached:** `#2BED77` (Energetic neon green for streaks, sets completed, target metrics).
- **Interactive / Focus / Water:** `#0270FF` (Precise electric blue for hydration, links, and system notifications).
- **Warning / Energy / Calorie Burn:** `#FFD729` (Solar yellow for warnings, peak zones, and active heart-rate notifications).

## Typography

The type system blends the energetic curves of **Plus Jakarta Sans** for titles, display metrics, and interactive controls with the utilitarian readability of **Inter** for dense workout telemetry and conversation streams.

- **Numbers & Metrics:** High-value training stats (BPM, reps, kilograms, calories) use `headline-lg` or `display-hero` with tabular figure settings (`font-variant-numeric: tabular-nums`) to prevent layout shift during active logging.
- **Accessibility:** Text on dark surfaces never falls below 4.5:1 for body copy. Primary labels feature increased tracking (`letter-spacing`) to preserve legibility in ambient gym lighting.

## Layout & Spacing

The interface operates on an 8pt spatial grid with a 4pt sub-grid for compact UI controls and micro-badges.

- **Mobile First Framework:** Designed primarily for 4-to-6 column fluid mobile viewports, expanding to a locked 12-column grid on desktop and tablet dashboard views.
- **Safe Area Insets:** The canvas enforces mandatory safe margin pads at the base to accommodate the 5-item curved bottom navigation bar and the elevated central FAB (`margin-bottom: calc(5rem + env(safe-area-inset-bottom))`).
- **Rhythm & Touch Targets:** Touch targets must maintain a minimum bounding box of 44x44px. Workouts and quick-log buttons scale with `space-md` inner padding for immediate one-handed thumb interaction.

## Elevation & Depth

Visual hierarchy uses luminous chromatic diffusion rather than standard drop shadows.

- **Elevation 0 (Canvas):** `#0B0712` with atmospheric radial gradients centered around actionable nodes: `radial-gradient(ellipse at top, #271044 0%, #0B0712 70%)`.
- **Elevation 1 (Cards, Modules, Bubble Inbound):** Flat `#171026`, bordered by a subtle 1px hairline `rgba(255, 255, 255, 0.08)`.
- **Elevation 2 (Floating Modals, Bubble Outbound, Nav Bar):** Glassmorphic base `#1F1433` with `backdrop-filter: blur(16px)` and an ambient shadow `0 8px 32px -4px rgba(11, 7, 18, 0.6)`.
- **Elevation 3 (LÉO AI Core & Central FAB):** Backed by an active ultraviolet aura: `box-shadow: 0 0 24px 2px rgba(132, 43, 175, 0.45), 0 4px 12px rgba(0, 0, 0, 0.5)`. Specular top border: `1px solid rgba(183, 132, 230, 0.4)`.

## Shapes

The form language is structural yet biometric, utilizing smooth squircle curves.

- **Components & Containers:** Base interactive items (inputs, list items, workout cards) use `rounded-md` (0.5rem / 8px) or `rounded-lg` (1rem / 16px).
- **Badges, Chips & Action Triggers:** Action buttons and contextual status chips leverage fully pill-shaped profiles (`9999px`) to communicate fluidity and athletic responsiveness.
- **LÉO FAB & Chat Interface:** The central floating AI trigger uses a dedicated circular geometry (`rounded-full`) nested within a curved organic dock cutout.

## Components

Standardized specifications for implementation within Angular and TypeScript component architectures:

### 1. Buttons (`leo-button`)
- **Primary:** Gradient from `#842BAF` to `#681791`. Text: `#FFFFFF`, weight 600. Hover: scale(1.02), glow `rgba(132, 43, 175, 0.5)`. Active: `#681791`.
- **Secondary / Ghost:** Transparent background with `#311C50` border, text `#B784E6`. Hover: `rgba(183, 132, 230, 0.08)`.
- **Icon Buttons:** Circular or rounded square (`44x44px`), background `#171026`, border `rgba(255, 255, 255, 0.08)`.

### 2. Input Fields (`leo-input`)
- Base surface `#171026`, border 1px solid `#311C50`, border-radius 12px, font-family `Inter`.
- Placeholder text in `#8C849B`.
- **Focus state:** Border color `#B784E6` with a soft box-shadow `0 0 0 3px rgba(183, 132, 230, 0.15)`.

### 3. Status Chips (`leo-chip`)
- Pill-shaped (`rounded-full`), height 28px, padding `0 12px`.
- **Success (Active streak/Target reached):** Background `rgba(43, 237, 119, 0.12)`, text `#2BED77`, border `1px solid rgba(43, 237, 119, 0.3)`.
- **Warning (Heart Rate Peak):** Background `rgba(255, 215, 41, 0.12)`, text `#FFD729`, border `1px solid rgba(255, 215, 41, 0.3)`.
- **Info (Hydration/Activity):** Background `rgba(2, 112, 255, 0.12)`, text `#0270FF`, border `1px solid rgba(2, 112, 255, 0.3)`.

### 4. Bottom Navigation Bar (`leo-bottom-nav`)
- Surface: `#171026` / `rgba(23, 16, 38, 0.85)` with `backdrop-filter: blur(20px)` and top border `1px solid rgba(255, 255, 255, 0.06)`.
- **Grid Structure:** 5 navigation slots: Home, Treinos, [LÉO Central], Métricas, Perfil.
- **Central FAB (LÉO):** Translates -20px upward, 56x56px dimension, radial gradient `#842BAF` to `#681791`. Constant ambient glow `rgba(132, 43, 175, 0.4)`. Unlocks modal speech/chat drawer on click.
- **Icon States:** Inactive `#8C849B`; Active `#B784E6` accompanied by a micro dot indicator underneath.

### 5. Modular Cards (`leo-card`)
- Background: `#171026` or elevated `#1F1433`.
- Border: 1px hairline `rgba(255, 255, 255, 0.08)`.
- Padding: `space-md` (16px) or `space-lg` (24px).
- Internal layout supports header slots (metric title + status chip), primary value slots (large tabular metrics), and interactive micro-charts.

### 6. Conversational Chat Bubbles (`leo-chat-bubble`)
- **LÉO (Assistant):** Background `#1F1433`, border `1px solid #311C50`, border-radius `16px 16px 16px 4px`. Accentuated by an AI avatar badge and lilac typography tags (`#B784E6`).
- **User:** Background `linear-gradient(135deg, #842BAF 0%, #681791 100%)`, border-radius `16px 16px 4px 16px`, text `#FFFFFF`.
- Typography: `Inter`, `body-md` (14px, 20px line-height).