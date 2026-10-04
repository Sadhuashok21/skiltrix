export interface AuthUser {
  user_id: string
  email: string
  name: string
  lastname?: string
  username?: string
  profile?: string
  phone_number?: string
  bio?: string
  user_type?: string
  status?: string
}

export interface ClientAuthConfig {
  clientId: string
  accountsPortalUrl: string
  apiBaseUrl: string
  redirectUri: string
}

export interface AuthContextType {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  accessToken: string | null
  login: (returnTo?: string) => Promise<void>
  logout: (global?: boolean) => Promise<void>
  refreshSession: () => Promise<AuthUser | null>
  getCurrentUser: () => AuthUser | null
}
