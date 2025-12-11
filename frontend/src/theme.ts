export type ThemeName = 'dark' | 'light'

export type ThemeDefinition = {
  background: string
  foreground: string
  foregroundDim: string
  primary: string
  accent: string
}

export const THEMES: Record<ThemeName, ThemeDefinition> = {
  dark: {
    background: '#0a0a0a',
    foreground: '#e4ffe6',
    foregroundDim: '#6fd687',
    primary: '#00ff41',
    accent: '#00d4ff',
  },
  light: {
    background: '#1a1a1a',
    foreground: '#e8fff1',
    foregroundDim: '#7be0ae',
    primary: '#00d4aa',
    accent: '#00d4aa',
  },
}

export const DEFAULT_THEME: ThemeName = 'dark'
