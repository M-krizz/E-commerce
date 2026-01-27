'use client'

import { useAuth } from '@/lib/auth-context'
import { Navbar } from '@/components/navbar'
import { Loader2 } from 'lucide-react'

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar isLoggedIn={!!user} userRole={user?.role as 'user' | 'admin' | 'analyst' || 'user'} />
      <main>{children}</main>
    </div>
  )
}
