import { create } from 'zustand'
import type { ThemeName } from '@/src/theme'
import { DEFAULT_THEME } from '@/src/theme'

export interface IThemeState {
  currentTheme: ThemeName
}

export interface IThemeActions {
  setTheme: (theme: ThemeName) => void
}

export type ThemeStore = IThemeState & IThemeActions

export const useThemeStore = create<ThemeStore>((set) => ({
  currentTheme: DEFAULT_THEME,
  setTheme: (theme: ThemeName) => set({ currentTheme: theme }),
}))
