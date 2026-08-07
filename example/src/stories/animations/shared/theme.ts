export const theme = {
  color: {
    bg: '#0a0a0d',
    surface: '#131317',
    surfaceRaised: '#1a1a20',
    border: 'rgba(255,255,255,0.08)',
    borderStrong: 'rgba(255,255,255,0.16)',
    text: '#f4f4f6',
    textMuted: '#9a9aa4',
    textFaint: '#6c6c76',
    accent: '#7c6cff',
    accentSoft: 'rgba(124,108,255,0.14)',
  },
  radius: {
    sm: 8,
    md: 12,
    lg: 20,
  },
  font: {
    sans: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Inter', Roboto, Helvetica, Arial, sans-serif",
    mono: "'SF Mono', 'Fira Code', Menlo, Consolas, monospace",
  },
} as const;
