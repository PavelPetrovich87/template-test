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
}

export type AuthStore = IAuthState & IAuthActions
