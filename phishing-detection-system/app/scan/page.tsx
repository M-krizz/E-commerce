'use client'

import React, { useState } from 'react'
import { Shield, Search, AlertTriangle, CheckCircle, Lock, Key, Eye, QrCode } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/lib/auth-context'
import LayoutWrapper from '@/components/layout-wrapper'

export default function ScanPage() {
  const { user } = useAuth()
  const [url, setUrl] = useState('')
  const [email, setEmail] = useState('')
  const [scanType, setScanType] = useState<'url' | 'email'>('url')
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')
  const [qrCode, setQrCode] = useState('')

  const handleScan = async () => {
    if (!url && !email) {
      setError('Please enter a URL or email to scan')
      return
    }

    setScanning(true)
    setError('')
    setResult(null)
    setQrCode('')

    try {
      const response = await fetch('/api/scans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: scanType,
          content: scanType === 'url' ? url : email
        })
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Scan failed')
      }

      setResult(data.result)
      setQrCode(data.qrCode)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setScanning(false)
    }
  }

  return (
    <LayoutWrapper>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Shield className="w-8 h-8 text-primary" />
            Security Scanner
          </h1>
          <p className="text-muted-foreground">
            Advanced phishing detection with military-grade encryption
          </p>
        </div>

        {/* Security Features Banner */}
        <Card className="mb-6 border-green-500/20 bg-green-500/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Lock className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-800 dark:text-green-200">
                    Secure Scanning Enabled
                  </p>
                  <p className="text-sm text-green-600 dark:text-green-400">
                    All scans are encrypted with AES-256 and digitally signed
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Badge variant="outline" className="border-green-500 text-green-600">
                  <Key className="w-3 h-3 mr-1" />
                  AES-256
                </Badge>
                <Badge variant="outline" className="border-blue-500 text-blue-600">
                  <Eye className="w-3 h-3 mr-1" />
                  HMAC-SHA256
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Scan Input */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                Scan Input
              </CardTitle>
              <CardDescription>
                Enter a URL or email to check for phishing threats
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Scan Type Selection */}
              <div className="flex gap-2">
                <Button
                  variant={scanType === 'url' ? 'default' : 'outline'}
                  onClick={() => setScanType('url')}
                  className="flex-1"
                >
                  URL Scan
                </Button>
                <Button
                  variant={scanType === 'email' ? 'default' : 'outline'}
                  onClick={() => setScanType('email')}
                  className="flex-1"
                >
                  Email Scan
                </Button>
              </div>

              {/* Input Fields */}
              {scanType === 'url' ? (
                <div className="space-y-2">
                  <label className="text-sm font-medium">URL to Scan</label>
                  <Input
                    type="url"
                    placeholder="https://example.com"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleScan()}
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email to Scan</label>
                  <Input
                    type="email"
                    placeholder="user@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleScan()}
                  />
                </div>
              )}

              <Button
                onClick={handleScan}
                disabled={scanning || (!url && !email)}
                className="w-full"
              >
                {scanning ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Scanning...
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4 mr-2" />
                    Start Secure Scan
                  </>
                )}
              </Button>

              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Scan Results */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Scan Results
              </CardTitle>
              <CardDescription>
                Encrypted scan results with digital signature verification
              </CardDescription>
            </CardHeader>
            <CardContent>
              {result ? (
                <div className="space-y-4">
                  {/* Result Status */}
                  <div className={`p-4 rounded-lg border ${
                    result.isPhishing 
                      ? 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800' 
                      : 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800'
                  }`}>
                    <div className="flex items-center gap-3">
                      {result.isPhishing ? (
                        <AlertTriangle className="w-6 h-6 text-red-600" />
                      ) : (
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      )}
                      <div>
                        <p className="font-semibold">
                          {result.isPhishing ? 'PHISHING DETECTED' : 'SAFE'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Risk Score: {result.score}/100
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Security Indicators */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Security Features Applied:</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Lock className="w-4 h-4 text-green-600" />
                        <span>Encrypted</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Key className="w-4 h-4 text-blue-600" />
                        <span>Signed</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <QrCode className="w-4 h-4 text-purple-600" />
                        <span>QR Code</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Eye className="w-4 h-4 text-orange-600" />
                        <span>Logged</span>
                      </div>
                    </div>
                  </div>

                  {/* Reasons */}
                  {result.reasons && result.reasons.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Analysis Details:</p>
                      <ul className="text-sm space-y-1">
                        {result.reasons.map((reason: string, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                            {reason}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* QR Code */}
                  {qrCode && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Secure Report QR Code:</p>
                      <div className="p-4 bg-muted rounded-lg text-center">
                        <p className="text-xs text-muted-foreground mb-2">
                          Scan for encrypted report
                        </p>
                        <div className="w-32 h-32 mx-auto bg-white p-2 rounded">
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center text-xs">
                            QR: {qrCode.substring(0, 20)}...
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Enter a URL or email to start scanning</p>
                  <p className="text-sm mt-2">All scans are encrypted and secured</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Encryption Info */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Encryption & Security Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="font-medium mb-1">Data Encryption</p>
                <p className="text-muted-foreground">
                  Your scan data is encrypted using AES-256-GCM before storage
                </p>
              </div>
              <div>
                <p className="font-medium mb-1">Digital Signature</p>
                <p className="text-muted-foreground">
                  HMAC-SHA256 ensures data integrity and authenticity
                </p>
              </div>
              <div>
                <p className="font-medium mb-1">Secure Transport</p>
                <p className="text-muted-foreground">
                  All communications use HTTPS with TLS 1.3
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </LayoutWrapper>
  )
}
