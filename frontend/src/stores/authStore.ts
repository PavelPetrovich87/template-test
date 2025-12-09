import type { User } from '@supabase/supabase-js'
import { create } from 'zustand'
import { supabase } from '@/src/config/supabase'

export interface IUser {
  id: string
  email: string
  username: string
}

export interface IAuthState {
  isAuthenticated: boolean
  isLoading: boolean
  user: IUser | null
}

export interface IAuthActions {
  setAuthenticated: (value: boolean) => void
  setLoading: (value: boolean) => void
  setUser: (user: IUser | null) => void
  logout: () => void
  login: (email: string, password: string) => Promise<IUser>
  register: (email: string, password: string) => Promise<IUser>
}

export type AuthStore = IAuthState & IAuthActions

const mapSupabaseUser = (user: User): IUser => {
  if (!user.email) {
    throw new Error('Supabase user is missing an email')
  }

  const username =
    typeof user.user_metadata?.username === 'string' && user.user_metadata.username.trim().length > 0
      ? user.user_metadata.username
      : user.email

  return {
    id: user.id,
    email: user.email,
    username,
  }
}

export const useAuthStore = create<AuthStore>((set) => ({
  isAuthenticated: false,
  isLoading: false,
  user: null,
  setAuthenticated: (value) => set({ isAuthenticated: value }),
  setLoading: (value) => set({ isLoading: value }),
  setUser: (user) => set({ user }),
  logout: () => set({ isAuthenticated: false, user: null }),
  login: async (email, password) => {
    set({ isLoading: true })
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })

      if (error) {
        throw error
      }

      if (!data.user) {
        throw new Error('Authentication failed: user was not returned')
      }

      const authenticatedUser = mapSupabaseUser(data.user)
      set({ user: authenticatedUser, isAuthenticated: true })

      return authenticatedUser
    } finally {
      set({ isLoading: false })
    }
  },
  register: async (email, password) => {
    set({ isLoading: true })
    try {
      const { data, error } = await supabase.auth.signUp({ email, password })

      if (error) {
        throw error
      }

      if (!data.user) {
        throw new Error('Registration failed: user was not returned')
      }

      const registeredUser = mapSupabaseUser(data.user)
      set({ user: registeredUser, isAuthenticated: true })

      return registeredUser
    } finally {
      set({ isLoading: false })
    }
  },
}))
