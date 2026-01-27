'use client'

import React from 'react'
import { Shield, Lock, Key, Eye, AlertTriangle, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/lib/auth-context'
import LayoutWrapper from '@/components/layout-wrapper'

export default function SecurityInfoPage() {
  const { user } = useAuth()

  return (
    <LayoutWrapper>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 flex items-center gap-3">
            <Shield className="w-10 h-10 text-primary" />
            Security Information Center
          </h1>
          <p className="text-xl text-muted-foreground">
            Comprehensive overview of implemented security features
          </p>
        </div>

        {/* Security Features Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-primary" />
                Authentication
              </CardTitle>
              <CardDescription>
                Multi-layered authentication system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Password Hashing</span>
                  <Badge variant="outline" className="text-green-600">bcrypt</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">MFA Support</span>
                  <Badge variant="outline" className="text-blue-600">TOTP/Email</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Session Security</span>
                  <Badge variant="outline" className="text-purple-600">HTTP-Only</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5 text-primary" />
                Authorization
              </CardTitle>
              <CardDescription>
                Role-based access control system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Admin Access</span>
                  <Badge variant="outline" className="text-red-600">Full</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Analyst Access</span>
                  <Badge variant="outline" className="text-orange-600">Partial</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">User Access</span>
                  <Badge variant="outline" className="text-green-600">Basic</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-primary" />
                Encryption
              </CardTitle>
              <CardDescription>
                Data protection mechanisms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Data at Rest</span>
                  <Badge variant="outline" className="text-green-600">AES-256</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Data in Transit</span>
                  <Badge variant="outline" className="text-blue-600">TLS 1.3</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Key Exchange</span>
                  <Badge variant="outline" className="text-purple-600">RSA-2048</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Security Features */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Implemented Security Controls</CardTitle>
              <CardDescription>
                Active security measures in the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Secure Password Storage</p>
                    <p className="text-sm text-muted-foreground">
                      Passwords hashed using bcrypt with 12 salt rounds
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Multi-Factor Authentication</p>
                    <p className="text-sm text-muted-foreground">
                      TOTP, Email OTP, and Biometric options available
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Role-Based Access Control</p>
                    <p className="text-sm text-muted-foreground">
                      Enforced at middleware level with 3 distinct roles
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium">End-to-End Encryption</p>
                    <p className="text-sm text-muted-foreground">
                      AES-256-GCM for data, RSA for key exchange
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Digital Signatures</p>
                    <p className="text-sm text-muted-foreground">
                      HMAC-SHA256 ensures data integrity
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Activity Logging</p>
                    <p className="text-sm text-muted-foreground">
                      Comprehensive audit trail with IP tracking
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Threat Protection</CardTitle>
              <CardDescription>
                Security measures against common attacks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5" />
                  <div>
                    <p className="font-medium">SQL Injection</p>
                    <p className="text-sm text-muted-foreground">
                      Prevented with Supabase ORM and parameterized queries
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Cross-Site Scripting (XSS)</p>
                    <p className="text-sm text-muted-foreground">
                      React's built-in XSS protection and CSP headers
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Cross-Site Request Forgery</p>
                    <p className="text-sm text-muted-foreground">
                      SameSite cookie attributes and CSRF tokens
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Man-in-the-Middle</p>
                    <p className="text-sm text-muted-foreground">
                      HTTPS enforcement and certificate validation
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Brute Force</p>
                    <p className="text-sm text-muted-foreground">
                      Rate limiting and bcrypt's computational cost
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Compliance Standards */}
        <Card>
          <CardHeader>
            <CardTitle>Compliance & Standards</CardTitle>
            <CardDescription>
              Security frameworks and standards implemented
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="text-center">
                <Shield className="w-12 h-12 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-2">NIST SP 800-63-2</h3>
                <p className="text-sm text-muted-foreground">
                  Digital identity guidelines compliance
                </p>
              </div>
              <div className="text-center">
                <Lock className="w-12 h-12 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-2">OWASP Top 10</h3>
                <p className="text-sm text-muted-foreground">
                  Protection against common vulnerabilities
                </p>
              </div>
              <div className="text-center">
                <Key className="w-12 h-12 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-2">ISO 27001</h3>
                <p className="text-sm text-muted-foreground">
                  Information security management
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </LayoutWrapper>
  )
}
