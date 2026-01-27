import crypto from 'crypto'
import bcrypt from 'bcryptjs'

// Password hashing with bcrypt (salt + hash)
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12
  return bcrypt.hash(password, saltRounds)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

// HMAC-SHA256 for digital signatures
export function createHMAC(data: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(data).digest('hex')
}

export function verifyHMAC(data: string, signature: string, secret: string): boolean {
  const expectedSignature = createHMAC(data, secret)
  return crypto.timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expectedSignature, 'hex'))
}

// SHA-256 hashing for general purposes
export function sha256(data: string): string {
  return crypto.createHash('sha256').update(data).update('phishing-detection').digest('hex')
}

// Digital signature using HMAC (for integrity and authenticity)
export function signData(data: any, secretKey: string): { data: any; signature: string; timestamp: number } {
  const timestamp = Date.now()
  const payload = JSON.stringify({ data, timestamp })
  const signature = createHMAC(payload, secretKey)
  
  return {
    data,
    signature,
    timestamp
  }
}

export function verifySignedData(signedData: { data: any; signature: string; timestamp: number }, secretKey: string): boolean {
  const { data, signature, timestamp } = signedData
  const payload = JSON.stringify({ data, timestamp })
  return verifyHMAC(payload, signature, secretKey)
}

// Generate secure random tokens
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex')
}

// Key derivation function (PBKDF2)
export function deriveKey(password: string, salt: string, iterations: number = 100000): string {
  return crypto.pbkdf2Sync(password, salt, iterations, 32, 'sha256').toString('hex')
}
