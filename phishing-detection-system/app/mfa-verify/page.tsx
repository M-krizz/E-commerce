'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, Key, Mail, Fingerprint, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/lib/auth-context'
import LayoutWrapper from '@/components/layout-wrapper'

export default function MFAVerifyPage() {
  const router = useRouter()
  const { user, tempUser, completeMFA } = useAuth()
  const [totpCode, setTotpCode] = useState('')
  const [emailOtp, setEmailOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleTOTPVerify = async () => {
    if (!totpCode || totpCode.length !== 6) {
      setError('Please enter a valid 6-digit code')
      return
    }

    setLoading(true)
    setError('')
    try {
      const isValid = await completeMFA(totpCode, 'totp')
      if (isValid) {
        setSuccess('TOTP verified successfully!')
        setTimeout(() => {
          router.push('/')
        }, 1000)
      } else {
        setError('Invalid TOTP code')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleEmailOTPVerify = async () => {
    if (!emailOtp || emailOtp.length !== 6) {
      setError('Please enter a valid 6-digit OTP')
      return
    }

    setLoading(true)
    setError('')
    try {
      const isValid = await completeMFA(emailOtp, 'email_otp')
      if (isValid) {
        setSuccess('Email OTP verified successfully!')
        setTimeout(() => {
          router.push('/')
        }, 1000)
      } else {
        setError('Invalid email OTP')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleBiometricVerify = async () => {
    setLoading(true)
    setError('')
    try {
      // For biometric, we'll use a mock OTP since it's a simulation
      const isValid = await completeMFA('biometric_verified', 'biometric')
      if (isValid) {
        setSuccess('Biometric verification successful!')
        setTimeout(() => {
          router.push('/')
        }, 1000)
      } else {
        setError('Biometric verification failed')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <LayoutWrapper>
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
            <CardTitle>Multi-Factor Authentication</CardTitle>
            <CardDescription>
              Verify your identity to continue
              {tempUser && (
                <span className="block text-sm text-muted-foreground mt-1">
                  Logging in as: {tempUser.email}
                </span>
              )}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded text-red-600 text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 bg-green-500/10 border border-green-500/30 rounded text-green-600 text-sm">
                {success}
              </div>
            )}

            {/* TOTP Verification */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-primary" />
                <h3 className="font-medium">Authenticator App Code</h3>
              </div>
              <Input
                type="text"
                placeholder="Enter 6-digit code"
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
                className="text-center text-lg tracking-widest"
              />
              <Button
                onClick={handleTOTPVerify}
                disabled={loading || totpCode.length !== 6}
                className="w-full"
              >
                {loading ? 'Verifying...' : 'Verify TOTP'}
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">OR</span>
              </div>
            </div>

            {/* Email OTP Verification */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary" />
                <h3 className="font-medium">Email OTP</h3>
              </div>
              <Input
                type="text"
                placeholder="Enter 6-digit email OTP"
                value={emailOtp}
                onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
                className="text-center text-lg tracking-widest"
              />
              <Button
                onClick={handleEmailOTPVerify}
                disabled={loading || emailOtp.length !== 6}
                variant="outline"
                className="w-full"
              >
                {loading ? 'Verifying...' : 'Verify Email OTP'}
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">OR</span>
              </div>
            </div>

            {/* Biometric Verification */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Fingerprint className="w-5 h-5 text-primary" />
                <h3 className="font-medium">Biometric Authentication</h3>
              </div>
              <Button
                onClick={handleBiometricVerify}
                disabled={loading}
                variant="outline"
                className="w-full"
              >
                {loading ? 'Verifying...' : 'Use Biometric'}
              </Button>
            </div>

            <Button
              variant="ghost"
              onClick={() => router.push('/login')}
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    </LayoutWrapper>
  )
}
