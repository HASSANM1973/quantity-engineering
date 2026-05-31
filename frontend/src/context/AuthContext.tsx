import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { authApi } from '../api/client'

interface User {
  id: number
  email: string
  name: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name?: string) => Promise<void>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const saved = sessionStorage.getItem('auth_token')
    if (saved) {
      setToken(saved)
      authApi.me().then((res) => setUser(res.data)).catch(() => {
        sessionStorage.removeItem('auth_token')
        setToken(null)
      }).finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email: string, password: string) => {
    const res = await authApi.login(email, password)
    const { token: t, user: u } = res.data
    sessionStorage.setItem('auth_token', t)
    setToken(t)
    setUser(u)
  }

  const register = async (email: string, password: string, name?: string) => {
    const res = await authApi.register(email, password, name)
    const { token: t, user: u } = res.data
    sessionStorage.setItem('auth_token', t)
    setToken(t)
    setUser(u)
  }

  const logout = () => {
    sessionStorage.removeItem('auth_token')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
