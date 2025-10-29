/**
 * UI Theme for Neural Collapse
 * Modern design system with glass-morphism and vibrant colors
 */

import { Color4 } from '@dcl/sdk/math'

export const UITheme = {
  colors: {
    // Primary palette - Modern dark theme with vibrant accents
    primary: Color4.create(0.08, 0.08, 0.12, 0.85), // Dark glass
    primaryLight: Color4.create(0.12, 0.12, 0.18, 0.9),
    primaryDark: Color4.create(0.05, 0.05, 0.08, 0.95),

    // Accent colors
    accent: Color4.create(0.4, 0.6, 1.0, 1), // Bright blue
    accentGlow: Color4.create(0.4, 0.6, 1.0, 0.3),

    // Text colors
    text: Color4.create(1, 1, 1, 1),
    textSecondary: Color4.create(0.75, 0.75, 0.8, 1),
    textMuted: Color4.create(0.5, 0.5, 0.55, 1),

    // Semantic colors - Modern vibrant palette
    success: Color4.create(0.2, 0.95, 0.5, 1), // Bright green
    successGlow: Color4.create(0.2, 0.95, 0.5, 0.2),
    warning: Color4.create(1.0, 0.75, 0.1, 1), // Bright yellow
    warningGlow: Color4.create(1.0, 0.75, 0.1, 0.2),
    danger: Color4.create(1.0, 0.25, 0.35, 1), // Bright red
    dangerGlow: Color4.create(1.0, 0.25, 0.35, 0.2),

    // Game-specific colors
    purple: Color4.create(0.8, 0.4, 1.0, 1), // Vibrant purple
    purpleGlow: Color4.create(0.8, 0.4, 1.0, 0.2),
    gold: Color4.create(1.0, 0.88, 0.2, 1), // Bright gold
    goldGlow: Color4.create(1.0, 0.88, 0.2, 0.2),
    green: Color4.create(0.3, 1.0, 0.5, 1), // Neon green
    cyan: Color4.create(0.2, 0.9, 1.0, 1), // Bright cyan

    // Glass-morphism backgrounds
    glass: Color4.create(0.1, 0.1, 0.15, 0.7),
    glassDark: Color4.create(0.05, 0.05, 0.1, 0.8),
    glassLight: Color4.create(0.15, 0.15, 0.2, 0.6),

    // Overlays
    overlay: Color4.create(0, 0, 0, 0.75),
    overlayLight: Color4.create(0, 0, 0, 0.5),
    overlayDark: Color4.create(0, 0, 0, 0.9),

    // Borders and dividers
    border: Color4.create(0.3, 0.3, 0.35, 0.5),
    borderLight: Color4.create(0.4, 0.4, 0.45, 0.3),
    divider: Color4.create(0.25, 0.25, 0.3, 0.4)
  },

  fontSize: {
    tiny: 12,
    small: 14,
    base: 16,
    medium: 18,
    large: 24,
    xlarge: 32,
    xxlarge: 40,
    title: 48,
    hero: 64
  },

  spacing: {
    xs: 4,
    small: 8,
    medium: 16,
    large: 24,
    xl: 32,
    xxl: 48
  },

  dimensions: {
    button: {
      small: { width: 120, height: 40 },
      medium: { width: 180, height: 50 },
      large: { width: 240, height: 60 }
    },
    panel: {
      small: 250,
      medium: 320,
      large: 400,
      xlarge: 500
    },
    border: {
      thin: 1,
      medium: 2,
      thick: 3
    },
    radius: {
      small: 4,
      medium: 8,
      large: 12,
      xlarge: 16
    }
  },

  // Animation durations (for reference in documentation)
  animation: {
    fast: 150,
    normal: 300,
    slow: 500
  },

  // Shadow/glow effects (simulated with overlays)
  effects: {
    shadow: Color4.create(0, 0, 0, 0.3),
    glow: Color4.create(1, 1, 1, 0.1)
  }
}
