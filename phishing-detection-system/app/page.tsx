'use client'

import React from 'react'
import { Shield, CheckCircle, AlertTriangle, Lock, Key, Fingerprint, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/lib/auth-context'
import LayoutWrapper from '@/components/layout-wrapper'
import Link from 'next/link'

export default function HomePage() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <LayoutWrapper>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </LayoutWrapper>
    )
  }

  if (!user) {
    return (
      <LayoutWrapper>
        <div className="min-h-screen flex items-center justify-center px-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
              <CardTitle>Phishing Detection System</CardTitle>
              <CardDescription>Cybersecurity Lab Project</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/login">
                <Button className="w-full">Login to Continue</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </LayoutWrapper>
    )
  }

  return (
    <LayoutWrapper>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-3">
            <Shield className="w-10 h-10 text-primary" />
            Phishing Detection System
          </h1>
          <p className="text-xl text-muted-foreground">
            Advanced Cybersecurity Protection with Multi-Layered Security
          </p>
        </div>

        {/* Security Status Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Authentication</CardTitle>
              <Lock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">Active</div>
              <p className="text-xs text-muted-foreground">
                MFA Available
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Role</CardTitle>
              <Key className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold capitalize">{user.role}</div>
              <p className="text-xs text-muted-foreground">
                Access Level
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Encryption</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">AES-256</div>
              <p className="text-xs text-muted-foreground">
                End-to-End
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Security</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">Enabled</div>
              <p className="text-xs text-muted-foreground">
                All Features
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Security Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-primary" />
                Multi-Factor Authentication
              </CardTitle>
              <CardDescription>
                NIST-compliant authentication with TOTP, Email OTP, and Biometric options
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Time-based OTP (TOTP)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Email Verification
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Biometric Simulation
                </li>
              </ul>
              <Link href="/security-settings">
                <Button className="w-full mt-4" variant="outline">
                  Configure MFA
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5 text-primary" />
                Role-Based Access Control
              </CardTitle>
              <CardDescription>
                Granular access control with three distinct roles and permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Admin: Full Access
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Analyst: Logs & Scans
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  User: Basic Scanning
                </li>
              </ul>
              <Link href="/security-info">
                <Button className="w-full mt-4" variant="outline">
                  View Permissions
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-primary" />
                Advanced Encryption
              </CardTitle>
              <CardDescription>
                Military-grade encryption for data protection and integrity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  AES-256-GCM Encryption
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  RSA-2048 Key Exchange
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  HMAC-SHA256 Signatures
                </li>
              </ul>
              <Link href="/scan">
                <Button className="w-full mt-4" variant="outline">
                  Try Secure Scan
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks and security operations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link href="/scan">
                <Button className="w-full h-16 flex flex-col gap-1">
                  <Shield className="w-6 h-6" />
                  Scan URL
                </Button>
              </Link>
              {(user.role === 'admin' || user.role === 'analyst') && (
                <Link href="/logs">
                  <Button className="w-full h-16 flex flex-col gap-1" variant="outline">
                    <Eye className="w-6 h-6" />
                    View Logs
                  </Button>
                </Link>
              )}
              <Link href="/security-settings">
                <Button className="w-full h-16 flex flex-col gap-1" variant="outline">
                  <Lock className="w-6 h-6" />
                  Security Settings
                </Button>
              </Link>
              {user.role === 'admin' && (
                <Link href="/admin">
                  <Button className="w-full h-16 flex flex-col gap-1" variant="outline">
                    <Key className="w-6 h-6" />
                    Admin Panel
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </LayoutWrapper>
  )
}
