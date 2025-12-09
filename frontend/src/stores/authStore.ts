import type { Session, User } from '@supabase/supabase-js'
import { create } from 'zustand'
import { AuthService } from '@/src/services/AuthService'

export interface IUser {
  id: string
  email: string
  username: string
}

export interface IAuthState {
  isAuthenticated: boolean
  isLoading: boolean
  accessToken: string | null
  user: IUser | null
}

export interface IAuthActions {
  setAuthenticated: (value: boolean) => void
  setLoading: (value: boolean) => void
  setUser: (user: IUser | null) => void
  setSession: (session: Session | null) => void
  logout: () => Promise<void>
  login: (email: string, password: string) => Promise<IUser>
  register: (email: string, password: string) => Promise<IUser>
  initializeAuth: () => Promise<void>
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

const deriveAuthState = (
  session: Session | null
): Pick<IAuthState, 'accessToken' | 'isAuthenticated' | 'user'> => {
  if (!session || !session.user) {
    return {
      user: null,
      accessToken: null,
      isAuthenticated: false,
    }
  }

  const mappedUser = mapSupabaseUser(session.user)

  return {
    user: mappedUser,
    accessToken: session.access_token ?? null,
    isAuthenticated: true,
  }
}

export const useAuthStore = create<AuthStore>((set) => ({
  isAuthenticated: false,
  isLoading: false,
  accessToken: null,
  user: null,
  setAuthenticated: (value) => set({ isAuthenticated: value }),
  setLoading: (value) => set({ isLoading: value }),
  setUser: (user) => set({ user }),
  setSession: (session) => set(deriveAuthState(session)),
  logout: async () => {
    set({ isLoading: true })
    try {
      const { error } = await AuthService.signOut()

      if (error) {
        throw error
      }

      set({ isAuthenticated: false, user: null, accessToken: null })
    } finally {
      set({ isLoading: false })
    }
  },
  login: async (email, password) => {
    set({ isLoading: true })
    try {
      const { data, error } = await AuthService.signIn(email, password)

      if (error) {
        throw error
      }

      if (!data.session) {
        throw new Error('Authentication failed: session was not returned')
      }

      if (!data.session.user) {
        throw new Error('Authentication failed: user was not returned')
      }

      const authenticatedUser = mapSupabaseUser(data.session.user)
      set({
        user: authenticatedUser,
        isAuthenticated: true,
        accessToken: data.session.access_token ?? null,
      })

      return authenticatedUser
    } finally {
      set({ isLoading: false })
    }
  },
  register: async (email, password) => {
    set({ isLoading: true })
    try {
      const { data, error } = await AuthService.signUp(email, password)

      if (error) {
        throw error
      }

      if (!data.session) {
        throw new Error('Registration failed: session was not returned')
      }

      if (!data.session.user) {
        throw new Error('Registration failed: user was not returned')
      }

      const registeredUser = mapSupabaseUser(data.session.user)
      set({
        user: registeredUser,
        isAuthenticated: true,
        accessToken: data.session.access_token ?? null,
      })

      return registeredUser
    } finally {
      set({ isLoading: false })
    }
  },
  initializeAuth: async () => {
    set({ isLoading: true })
    try {
      const { data, error } = await AuthService.getSession()

      if (error) {
        throw error
      }

      const nextState = deriveAuthState(data.session ?? null)
      set(nextState)
    } finally {
      set({ isLoading: false })
    }
  },
}))
