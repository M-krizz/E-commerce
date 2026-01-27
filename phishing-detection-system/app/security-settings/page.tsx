'use client'

import React, { useState } from 'react'
import { Shield, Key, Mail, Fingerprint, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/lib/auth-context'
import LayoutWrapper from '@/components/layout-wrapper'

export default function SecuritySettingsPage() {
  const { user, setupTOTP, enableTOTP, disableTOTP, sendEmailOTP, verifyEmailOTP, simulateBiometric } = useAuth()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  
  // TOTP states
  const [totpSecret, setTotpSecret] = useState('')
  const [totpQR, setTotpQR] = useState('')
  const [totpToken, setTotpToken] = useState('')
  const [totpEnabled, setTotpEnabled] = useState(false)
  
  // Email OTP states
  const [emailOtp, setEmailOtp] = useState('')
  const [emailOtpSent, setEmailOtpSent] = useState(false)
  
  const handleSetupTOTP = async () => {
    try {
      setLoading(true)
      const result = await setupTOTP()
      setTotpSecret(result.secret)
      setTotpQR(result.qrCode)
      setMessage('TOTP setup initiated. Scan the QR code with your authenticator app.')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  
  const handleEnableTOTP = async () => {
    try {
      setLoading(true)
      await enableTOTP(totpSecret, totpToken)
      setTotpEnabled(true)
      setMessage('TOTP enabled successfully!')
      setTotpSecret('')
      setTotpQR('')
      setTotpToken('')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  
  const handleSendEmailOTP = async () => {
    try {
      setLoading(true)
      await sendEmailOTP()
      setEmailOtpSent(true)
      setMessage('Email OTP sent to your registered email address.')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  
  const handleVerifyEmailOTP = async () => {
    try {
      setLoading(true)
      const isValid = await verifyEmailOTP(emailOtp)
      if (isValid) {
        setMessage('Email OTP verified successfully!')
        setEmailOtp('')
        setEmailOtpSent(false)
      } else {
        setError('Invalid OTP. Please try again.')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  
  const handleSimulateBiometric = async () => {
    try {
      setLoading(true)
      const success = await simulateBiometric()
      if (success) {
        setMessage('Biometric verification successful!')
      } else {
        setError('Biometric verification failed. Please try again.')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <LayoutWrapper>
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center gap-3 mb-8">
            <Shield className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">Security Settings</h1>
          </div>
          
          {message && (
            <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm">{message}</span>
            </div>
          )}
          
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <span className="text-sm">{error}</span>
            </div>
          )}
          
          {/* TOTP Setup */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5" />
                <CardTitle>Time-based One-Time Password (TOTP)</CardTitle>
              </div>
              <CardDescription>
                Set up TOTP using apps like Google Authenticator or Authy
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!totpSecret ? (
                <Button onClick={handleSetupTOTP} disabled={loading} className="w-full">
                  {loading ? 'Setting up...' : 'Setup TOTP'}
                </Button>
              ) : (
                <div className="space-y-4">
                  {totpQR && (
                    <div className="text-center">
                      <img src={totpQR} alt="TOTP QR Code" className="mx-auto" />
                      <p className="text-sm text-muted-foreground mt-2">
                        Scan this QR code with your authenticator app
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Secret key: {totpSecret}
                      </p>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter 6-digit code"
                      value={totpToken}
                      onChange={(e) => setTotpToken(e.target.value)}
                      maxLength={6}
                    />
                    <Button 
                      onClick={handleEnableTOTP} 
                      disabled={loading || totpToken.length !== 6}
                    >
                      {loading ? 'Enabling...' : 'Enable'}
                    </Button>
                  </div>
                </div>
              )}
              {totpEnabled && (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">TOTP is enabled</span>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Email OTP */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                <CardTitle>Email OTP Verification</CardTitle>
              </div>
              <CardDescription>
                Receive one-time passwords via email
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!emailOtpSent ? (
                <Button onClick={handleSendEmailOTP} disabled={loading} className="w-full">
                  {loading ? 'Sending...' : 'Send Email OTP'}
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter 6-digit OTP"
                    value={emailOtp}
                    onChange={(e) => setEmailOtp(e.target.value)}
                    maxLength={6}
                  />
                  <Button 
                    onClick={handleVerifyEmailOTP} 
                    disabled={loading || emailOtp.length !== 6}
                  >
                    {loading ? 'Verifying...' : 'Verify'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Biometric */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Fingerprint className="w-5 h-5" />
                <CardTitle>Biometric Authentication</CardTitle>
              </div>
              <CardDescription>
                Simulated biometric verification for demonstration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleSimulateBiometric} disabled={loading} className="w-full">
                {loading ? 'Verifying...' : 'Simulate Biometric'}
              </Button>
            </CardContent>
          </Card>
          
          {/* Security Info */}
          <Card>
            <CardHeader>
              <CardTitle>Security Features Enabled</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Password Hashing (bcrypt)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Encrypted Scan Data (AES-256)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Digital Signatures (HMAC-SHA256)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Role-Based Access Control</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Activity Logging</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </LayoutWrapper>
  )
}
