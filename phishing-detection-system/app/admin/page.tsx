'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, Users, BarChart3, Shield, Activity, TrendingUp } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'

export default function Page() {
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login')
      } else if (user.role !== 'admin') {
        router.push('/')
      }
    }
  }, [user, loading, router])

  if (loading || !user || user.role !== 'admin') {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar isLoggedIn={true} userRole={user.role} />

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Administrator Panel</h1>
          <p className="text-muted-foreground">System overview and administrative controls</p>
        </div>

        {/* Access Control Alert */}
        <Card className="border-danger bg-danger/10 mb-8">
          <CardContent className="p-6 flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-danger flex-shrink-0" />
            <div>
              <p className="font-semibold text-foreground mb-1">Authorization Required</p>
              <p className="text-sm text-muted-foreground">
                This panel is restricted to administrators only. Regular users cannot access this content due to
                role-based access control (RBAC) policies.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* System Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                <Users className="w-4 h-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-foreground">128</p>
              <p className="text-xs text-muted-foreground mt-1">+5 this week</p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Total Scans</CardTitle>
                <BarChart3 className="w-4 h-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-foreground">2,341</p>
              <p className="text-xs text-muted-foreground mt-1">+328 this week</p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Threats Detected</CardTitle>
                <AlertCircle className="w-4 h-4 text-danger" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-foreground">287</p>
              <p className="text-xs text-muted-foreground mt-1">12.3% of all scans</p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">System Health</CardTitle>
                <Shield className="w-4 h-4 text-success" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-foreground">99.8%</p>
              <p className="text-xs text-muted-foreground mt-1">Uptime this month</p>
            </CardContent>
          </Card>
        </div>

        {/* Management Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* User Management */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Monitor and manage system users</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-card border border-border rounded">
                  <div>
                    <p className="font-medium text-foreground">admin@example.com</p>
                    <p className="text-xs text-muted-foreground">Administrator - Active</p>
                  </div>
                  <span className="px-2 py-1 bg-success/10 text-success text-xs rounded">Active</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-card border border-border rounded">
                  <div>
                    <p className="font-medium text-foreground">user@example.com</p>
                    <p className="text-xs text-muted-foreground">User - Active</p>
                  </div>
                  <span className="px-2 py-1 bg-success/10 text-success text-xs rounded">Active</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-card border border-border rounded">
                  <div>
                    <p className="font-medium text-foreground">student01@university.edu</p>
                    <p className="text-xs text-muted-foreground">User - Last seen 2 days ago</p>
                  </div>
                  <span className="px-2 py-1 bg-muted/50 text-muted-foreground text-xs rounded">Inactive</span>
                </div>
              </div>

              <div className="text-sm text-muted-foreground pt-4 border-t border-border">
                Total users: 128 • Active today: 45 • Pending approval: 3
              </div>
            </CardContent>
          </Card>

          {/* Security Monitoring */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Security Monitoring</CardTitle>
              <CardDescription>System security metrics and alerts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Shield className="w-4 h-4 text-success" />
                    <p className="text-sm text-foreground">SSL/TLS Encryption</p>
                  </div>
                  <span className="text-xs text-success font-medium">Enabled</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Shield className="w-4 h-4 text-success" />
                    <p className="text-sm text-foreground">Two-Factor Authentication</p>
                  </div>
                  <span className="text-xs text-success font-medium">Active</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Shield className="w-4 h-4 text-success" />
                    <p className="text-sm text-foreground">DDoS Protection</p>
                  </div>
                  <span className="text-xs text-success font-medium">Active</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-4 h-4 text-warning" />
                    <p className="text-sm text-foreground">Firewall Rules</p>
                  </div>
                  <span className="text-xs text-warning font-medium">Review Needed</span>
                </div>
              </div>

              <div className="text-sm text-muted-foreground pt-4 border-t border-border">
                Last security audit: 24 hours ago
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Activity Logs */}
        <Card className="border-border mb-8">
          <CardHeader>
            <CardTitle>System Activity Log</CardTitle>
            <CardDescription>Recent administrative actions and system events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-4 py-3 border-b border-border last:border-0">
                <Activity className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">User authentication successful</p>
                  <p className="text-xs text-muted-foreground">admin@example.com • 2024-01-25 14:32:45</p>
                </div>
              </div>

              <div className="flex items-start gap-4 py-3 border-b border-border last:border-0">
                <AlertCircle className="w-4 h-4 text-warning mt-1 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">Phishing detected in user scan</p>
                  <p className="text-xs text-muted-foreground">Risk score: 85 • 2024-01-25 14:28:12</p>
                </div>
              </div>

              <div className="flex items-start gap-4 py-3 border-b border-border last:border-0">
                <Activity className="w-4 h-4 text-success mt-1 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">OTP verification completed</p>
                  <p className="text-xs text-muted-foreground">user@example.com • 2024-01-25 14:15:33</p>
                </div>
              </div>

              <div className="flex items-start gap-4 py-3 border-b border-border last:border-0">
                <TrendingUp className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">System performance report generated</p>
                  <p className="text-xs text-muted-foreground">2024-01-25 13:00:00</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Compliance & Reporting */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Compliance Status</CardTitle>
              <CardDescription>Security standards and compliance checks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm text-foreground">OWASP Top 10 Compliance</p>
                <span className="text-xs font-medium text-success">Compliant</span>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-foreground">Password Policy</p>
                <span className="text-xs font-medium text-success">Enforced</span>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-foreground">Data Protection</p>
                <span className="text-xs font-medium text-success">Compliant</span>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-foreground">Audit Logging</p>
                <span className="text-xs font-medium text-success">Active</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-primary/5">
            <CardHeader>
              <CardTitle>Report Generation</CardTitle>
              <CardDescription>Generate security and activity reports</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <button className="w-full p-3 bg-primary/20 hover:bg-primary/30 border border-primary rounded text-primary text-sm font-medium transition">
                Generate Weekly Report
              </button>
              <button className="w-full p-3 bg-primary/20 hover:bg-primary/30 border border-primary rounded text-primary text-sm font-medium transition">
                Export User Activity
              </button>
              <button className="w-full p-3 bg-primary/20 hover:bg-primary/30 border border-primary rounded text-primary text-sm font-medium transition">
                Security Audit Report
              </button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
