'use client'

import { createContext, useContext, useEffect, useState } from 'react'

export type UserRole = 'user' | 'admin' | 'analyst'

export interface AppUser {
  id: string
  email: string
  role: UserRole
  twoFactorEnabled?: boolean
}

interface AuthContextType {
  user: AppUser | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, fullName?: string) => Promise<void>
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
  // MFA methods
  setupTOTP: () => Promise<{ secret: string; qrCode: string; backupCodes: string[] }>
  enableTOTP: (secret: string, token: string) => Promise<void>
  disableTOTP: (password: string) => Promise<void>
  verifyTOTP: (token: string) => Promise<boolean>
  sendEmailOTP: () => Promise<void>
  verifyEmailOTP: (otp: string) => Promise<boolean>
  simulateBiometric: () => Promise<boolean>
  completeMFA: (otp: string, method: string) => Promise<boolean>
  mfaRequired: boolean
  tempUser: AppUser | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [mfaRequired, setMfaRequired] = useState(false)
  const [tempUser, setTempUser] = useState<AppUser | null>(null)

  useEffect(() => {
    let cancelled = false
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 2000)

    const getUser = async () => {
      try {
        const response = await fetch('/api/auth/user', {
          signal: controller.signal,
        })

        if (!response.ok) {
          if (!cancelled) setUser(null)
          return
        }

        const data = await response.json()
        const apiUser = data?.user

        if (!cancelled && apiUser) {
          setUser({
            id: apiUser.id,
            email: apiUser.email,
            role: apiUser.role,
            twoFactorEnabled: apiUser.twoFactorEnabled,
          })
        } else if (!cancelled) {
          setUser(null)
        }
      } catch {
        if (!cancelled) setUser(null)
      } finally {
        clearTimeout(timeoutId)
        if (!cancelled) setLoading(false)
      }
    }

    getUser()

    return () => {
      cancelled = true
      clearTimeout(timeoutId)
      controller.abort()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    console.log('DEBUG: signIn called', email)
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    console.log('DEBUG: /api/auth/login response status', response.status)
    if (!response.ok) {
      const error = await response.json()
      console.log('DEBUG: /api/auth/login error', error)
      throw new Error(error.error || 'Login failed')
    }
    const data = await response.json()
    
    // If MFA is required, set temp user and let the component handle redirect
    if (data.mfaRequired) {
      setMfaRequired(true)
      setTempUser(data.user)
      return // Don't set the main user yet
    }
    
    // Otherwise, complete login normally
    const apiUser = data?.user
    if (apiUser) {
      setUser({
        id: apiUser.id,
        email: apiUser.email,
        role: apiUser.role,
        twoFactorEnabled: apiUser.twoFactorEnabled,
      })
      setMfaRequired(false)
      setTempUser(null)
    }
  }

  const signUp = async (email: string, password: string, fullName?: string) => {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, fullName }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Registration failed')
    }
  }

  const signOut = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
  }

  const refreshUser = async () => {
    const response = await fetch('/api/auth/user')
    if (!response.ok) {
      setUser(null)
      return
    }
    const data = await response.json()
    const apiUser = data?.user
    if (apiUser) {
      setUser({
        id: apiUser.id,
        email: apiUser.email,
        role: apiUser.role,
        twoFactorEnabled: apiUser.twoFactorEnabled,
      })
    } else {
      setUser(null)
    }
  }

  // MFA methods
  const setupTOTP = async () => {
    const response = await fetch('/api/auth/2fa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })
    if (!response.ok) throw new Error('Failed to setup TOTP')
    return response.json()
  }

  const enableTOTP = async (secret: string, token: string) => {
    const response = await fetch('/api/auth/2fa', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret, token }),
    })
    if (!response.ok) throw new Error('Failed to enable TOTP')
    await refreshUser()
  }

  const disableTOTP = async (password: string) => {
    const response = await fetch('/api/auth/2fa', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    if (!response.ok) throw new Error('Failed to disable TOTP')
    await refreshUser()
  }

  const verifyTOTP = async (token: string): Promise<boolean> => {
    const response = await fetch('/api/auth/2fa/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
    if (!response.ok) return false
    const data = await response.json()
    return data.valid
  }

  const sendEmailOTP = async () => {
    const response = await fetch('/api/auth/email-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })
    if (!response.ok) throw new Error('Failed to send email OTP')
  }

  const verifyEmailOTP = async (otp: string): Promise<boolean> => {
    const response = await fetch('/api/auth/email-otp/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ otp }),
    })
    if (!response.ok) return false
    const data = await response.json()
    return data.valid
  }

  const simulateBiometric = async (): Promise<boolean> => {
    const response = await fetch('/api/auth/biometric', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })
    if (!response.ok) return false
    const data = await response.json()
    return data.success
  }

  const completeMFA = async (otp: string, method: string): Promise<boolean> => {
    if (!tempUser) throw new Error('No pending MFA verification')
    
    const response = await fetch('/api/auth/mfa-complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ otp, method, userId: tempUser.id }),
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'MFA verification failed')
    }
    
    const data = await response.json()
    if (data.success) {
      setUser(data.user)
      setMfaRequired(false)
      setTempUser(null)
      return true
    }
    return false
  }

  const value: AuthContextType = { 
    user, 
    loading, 
    signIn, 
    signUp, 
    signOut, 
    refreshUser,
    // MFA
    setupTOTP,
    enableTOTP,
    disableTOTP,
    verifyTOTP,
    sendEmailOTP,
    verifyEmailOTP,
    simulateBiometric,
    completeMFA,
    mfaRequired,
    tempUser
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
