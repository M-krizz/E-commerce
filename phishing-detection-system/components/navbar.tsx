'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Shield, LogOut } from 'lucide-react'

interface NavbarProps {
  isLoggedIn?: boolean
  userRole?: 'user' | 'admin' | 'analyst'
}

export function Navbar({ isLoggedIn = true, userRole = 'user' }: NavbarProps) {
  const router = useRouter()

  const handleLogout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('userRole')
    router.push('/login')
  }

  return (
    <nav className="border-b border-border bg-card">
      <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-primary" />
          <span className="font-bold text-lg text-foreground">Phishing Detection</span>
        </Link>

        {isLoggedIn ? (
          <div className="flex items-center gap-6">
            <ul className="flex gap-6">
              <li>
                <Link href="/" className="text-foreground hover:text-primary transition">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/scan" className="text-foreground hover:text-primary transition">
                  Scan
                </Link>
              </li>
              {(userRole === 'admin' || userRole === 'analyst') && (
                <li>
                  <Link href="/logs" className="text-foreground hover:text-primary transition">
                    Logs
                  </Link>
                </li>
              )}
              <li>
                <Link href="/security-info" className="text-foreground hover:text-primary transition">
                  Security Info
                </Link>
              </li>
              <li>
                <Link href="/security-settings" className="text-foreground hover:text-primary transition">
                  Security Settings
                </Link>
              </li>
              {userRole === 'admin' && (
                <li>
                  <Link href="/admin" className="text-foreground hover:text-primary transition">
                    Admin Panel
                  </Link>
                </li>
              )}
            </ul>
            <div className="flex items-center gap-2 pl-6 border-l border-border">
              <span className="text-sm text-muted-foreground">
                {userRole === 'admin' ? 'Admin' : userRole === 'analyst' ? 'Analyst' : 'User'}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-foreground hover:text-primary"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ) : (
          <Link href="/login">
            <Button>Login</Button>
          </Link>
        )}
      </div>
    </nav>
  )
}
