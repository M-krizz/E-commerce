import speakeasy from 'speakeasy'
import qrcode from 'qrcode'
import crypto from 'crypto'

// Generate TOTP secret for a user
export function generateTOTPSecret(userEmail: string): { secret: string; backupCodes: string[] } {
  const secret = speakeasy.generateSecret({
    name: `Phishing Detection (${userEmail})`,
    issuer: 'Phishing Detection System',
    length: 32
  })
  
  // Generate backup codes
  const backupCodes = Array.from({ length: 10 }, () => 
    crypto.randomBytes(4).toString('hex').toUpperCase()
  )
  
  return {
    secret: secret.base32!,
    backupCodes
  }
}

// Generate QR code for TOTP setup
export async function generateTOTPQRCode(secret: string, userEmail: string): Promise<string> {
  const otpauthUrl = speakeasy.otpauthURL({
    secret,
    label: `Phishing Detection (${userEmail})`,
    issuer: 'Phishing Detection System'
  })
  
  return qrcode.toDataURL(otpauthUrl)
}

// Verify TOTP token
export function verifyTOTPToken(token: string, secret: string): boolean {
  return speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token,
    window: 2 // Allow 2 steps before/after for clock drift
  })
}

// Generate email OTP (6-digit code)
export function generateEmailOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Hash OTP for storage
export function hashOTP(otp: string, userId: string): string {
  return crypto.createHmac('sha256', userId).update(otp).digest('hex')
}

// Verify email OTP
export function verifyEmailOTP(otp: string, hashedOTP: string, userId: string): boolean {
  const expectedHash = hashOTP(otp, userId)
  return crypto.timingSafeEqual(Buffer.from(hashedOTP, 'hex'), Buffer.from(expectedHash, 'hex'))
}

// Simulate biometric verification (in production, this would use device APIs)
export function simulateBiometric(userId: string): Promise<boolean> {
  return new Promise((resolve) => {
    // Simulate biometric scan delay
    setTimeout(() => {
      // In a real implementation, this would interface with device biometrics
      // For demo purposes, we'll simulate a 90% success rate
      const success = Math.random() > 0.1
      console.log(`Biometric simulation for ${userId}: ${success ? 'SUCCESS' : 'FAILED'}`)
      resolve(success)
    }, 1500)
  })
}

// Store OTP temporarily (in production, use Redis or database with TTL)
const otpStore = new Map<string, { hashedOTP: string; expires: number }>()

export function storeEmailOTP(userId: string, otp: string): void {
  const hashedOTP = hashOTP(otp, userId)
  const expires = Date.now() + 5 * 60 * 1000 // 5 minutes
  otpStore.set(userId, { hashedOTP, expires })
}

export function consumeEmailOTP(userId: string, otp: string): boolean {
  const stored = otpStore.get(userId)
  if (!stored || Date.now() > stored.expires) {
    otpStore.delete(userId)
    return false
  }
  
  const isValid = verifyEmailOTP(otp, stored.hashedOTP, userId)
  if (isValid) {
    otpStore.delete(userId)
  }
  return isValid
}

// Clean up expired OTPs
setInterval(() => {
  const now = Date.now()
  for (const [userId, data] of otpStore.entries()) {
    if (now > data.expires) {
      otpStore.delete(userId)
    }
  }
}, 60000) // Clean up every minute
