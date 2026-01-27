'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, CheckCircle, Calendar, Globe } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'

interface ScanLog {
  id: string
  type: 'url' | 'email'
  input: string
  result: 'safe' | 'phishing'
  score: number
  timestamp: string
  userRole: 'user' | 'admin'
}

export default function Page() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const userRole = user ? user.role : 'user'
  const [filter, setFilter] = useState<'all' | 'safe' | 'phishing'>('all')
  const [typeFilter, setTypeFilter] = useState<'all' | 'url' | 'email'>('all')

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  if (loading || !user) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  // Mock scan logs
  const mockLogs: ScanLog[] = [
    {
      id: '1',
        type: 'url',
        input: 'https://suspicious-paypal-verify.ru/confirm',
        result: 'phishing',
        score: 85,
        timestamp: '2024-01-25 14:32:45',
        userRole: 'user',
      },
      {
        id: '2',
        type: 'email',
        input: 'Dear customer, please verify your account immediately...',
        result: 'phishing',
        score: 72,
        timestamp: '2024-01-25 14:28:12',
        userRole: 'user',
      },
      {
        id: '3',
        type: 'url',
        input: 'https://github.com/torvalds/linux',
        result: 'safe',
        score: 12,
        timestamp: '2024-01-25 14:15:33',
        userRole: 'admin',
      },
      {
        id: '4',
        type: 'email',
        input: 'Welcome to GitHub! Your account is ready.',
        result: 'safe',
        score: 8,
        timestamp: '2024-01-25 13:45:22',
        userRole: 'user',
      },
      {
        id: '5',
        type: 'url',
        input: 'https://amazon-securityverify.com/update-payment',
        result: 'phishing',
        score: 88,
        timestamp: '2024-01-25 13:20:11',
        userRole: 'admin',
      },
      {
        id: '6',
        type: 'email',
        input: 'We noticed unusual activity on your account...',
        result: 'phishing',
        score: 65,
        timestamp: '2024-01-25 12:55:44',
        userRole: 'user',
      },
      {
        id: '7',
        type: 'url',
        input: 'https://www.google.com',
        result: 'safe',
        score: 5,
        timestamp: '2024-01-25 12:30:15',
        userRole: 'user',
      },
      {
        id: '8',
        type: 'email',
        input: 'Your password reset request has been processed.',
        result: 'safe',
        score: 15,
        timestamp: '2024-01-25 11:45:33',
        userRole: 'admin',
      },
    ]

  // Filter logs based on user role and filters
  const filteredLogs = mockLogs.filter(log => {
    if (userRole === 'user' && log.userRole === 'admin') {
      return false
    }
    if (filter !== 'all' && log.result !== filter) {
      return false
    }
    if (typeFilter !== 'all' && log.type !== typeFilter) {
      return false
    }
    return true
  })

  // Statistics
  const stats = {
    total: filteredLogs.length,
    phishing: filteredLogs.filter(l => l.result === 'phishing').length,
    safe: filteredLogs.filter(l => l.result === 'safe').length,
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar isLoggedIn={true} userRole={userRole} />

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Phishing Detection Logs</h1>
          <p className="text-muted-foreground">
            {userRole === 'admin'
              ? 'View all phishing detection records in the system'
              : 'View your phishing scan history'}
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-border">
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground mb-2">Total Scans</p>
              <p className="text-3xl font-bold text-foreground">{stats.total}</p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground mb-2">Phishing Detected</p>
              <p className="text-3xl font-bold text-danger">{stats.phishing}</p>
              <p className="text-xs text-muted-foreground mt-2">
                {stats.total > 0 ? Math.round((stats.phishing / stats.total) * 100) : 0}% of scans
              </p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground mb-2">Legitimate Items</p>
              <p className="text-3xl font-bold text-success">{stats.safe}</p>
              <p className="text-xs text-muted-foreground mt-2">
                {stats.total > 0 ? Math.round((stats.safe / stats.total) * 100) : 0}% of scans
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-primary/5">
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground mb-2">Security Status</p>
              <p className="text-sm font-semibold text-primary">All Systems Active</p>
              <div className="mt-3 flex gap-1">
                <div className="w-2 h-2 bg-success rounded-full" />
                <p className="text-xs text-muted-foreground">System operational</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border-border mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Filter Logs</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Result Type</p>
              <div className="flex gap-2">
                {['all', 'safe', 'phishing'].map(f => (
                  <button
                    key={f}
                    onClick={() => setFilter(f as typeof filter)}
                    className={`px-3 py-2 rounded text-sm transition ${
                      filter === f
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-card border border-border text-foreground hover:border-primary'
                    }`}
                  >
                    {f === 'all' ? 'All Results' : f === 'safe' ? 'Safe Only' : 'Phishing Only'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-2">Scan Type</p>
              <div className="flex gap-2">
                {['all', 'url', 'email'].map(t => (
                  <button
                    key={t}
                    onClick={() => setTypeFilter(t as typeof typeFilter)}
                    className={`px-3 py-2 rounded text-sm transition ${
                      typeFilter === t
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-card border border-border text-foreground hover:border-primary'
                    }`}
                  >
                    {t === 'all' ? 'All Types' : t === 'url' ? 'URLs' : 'Emails'}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Logs Table */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Detection History</CardTitle>
            <CardDescription>Detailed records of all phishing detection scans</CardDescription>
          </CardHeader>
          <CardContent>
            {filteredLogs.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-muted-foreground">No logs match the selected filters</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-muted-foreground">Time</th>
                      <th className="text-left py-3 px-4 text-muted-foreground">Type</th>
                      <th className="text-left py-3 px-4 text-muted-foreground">Content</th>
                      <th className="text-left py-3 px-4 text-muted-foreground">Result</th>
                      <th className="text-left py-3 px-4 text-muted-foreground">Score</th>
                      {userRole === 'admin' && (
                        <th className="text-left py-3 px-4 text-muted-foreground">Role</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLogs.map(log => (
                      <tr key={log.id} className="border-b border-border last:border-0 hover:bg-card/50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span className="text-foreground text-xs">{log.timestamp}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Globe className="w-4 h-4 text-muted-foreground" />
                            <span className="capitalize text-foreground">{log.type}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-muted-foreground truncate max-w-xs" title={log.input}>
                            {log.input.substring(0, 40)}...
                          </p>
                        </td>
                        <td className="py-3 px-4">
                          {log.result === 'phishing' ? (
                            <div className="flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4 text-danger" />
                              <span className="text-danger font-medium">Phishing</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-success" />
                              <span className="text-success font-medium">Safe</span>
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 bg-border rounded-full overflow-hidden">
                              <div
                                className={`h-full transition ${
                                  log.score >= 70
                                    ? 'bg-danger'
                                    : log.score >= 40
                                      ? 'bg-warning'
                                      : 'bg-success'
                                }`}
                                style={{ width: `${log.score}%` }}
                              />
                            </div>
                            <span className="text-foreground text-xs font-mono w-6">{log.score}</span>
                          </div>
                        </td>
                        {userRole === 'admin' && (
                          <td className="py-3 px-4">
                            <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded capitalize">
                              {log.userRole}
                            </span>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
