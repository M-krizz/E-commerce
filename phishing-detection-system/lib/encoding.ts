import crypto from 'crypto'

// Base64 encoding/decoding
export function encodeBase64(data: string): string {
  return Buffer.from(data, 'utf8').toString('base64')
}

export function decodeBase64(encoded: string): string {
  return Buffer.from(encoded, 'base64').toString('utf8')
}

// URL-safe Base64 for use in URLs
export function encodeBase64URL(data: string): string {
  return Buffer.from(data, 'utf8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}

export function decodeBase64URL(encoded: string): string {
  encoded += '='.repeat((4 - encoded.length % 4) % 4)
  return Buffer.from(encoded.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8')
}

// QR Code generation (using a simple text-based representation)
// In production, you'd use a library like 'qrcode'
export function generateQRCode(text: string): string {
  // This is a simplified QR code representation
  // In a real implementation, use a proper QR code library
  const data = encodeBase64URL(text)
  return `QR:${data}`
}

export function parseQRCode(qrCode: string): string {
  if (!qrCode.startsWith('QR:')) {
    throw new Error('Invalid QR code format')
  }
  const data = qrCode.substring(3)
  return decodeBase64URL(data)
}

// Barcode generation (Code 128 simulation)
export function generateBarcode(data: string): string {
  // Simplified barcode representation
  const checksum = crypto.createHash('md5').update(data).digest('hex').substring(0, 4)
  return `BAR:${data}:${checksum}`
}

export function parseBarcode(barcode: string): string {
  if (!barcode.startsWith('BAR:')) {
    throw new Error('Invalid barcode format')
  }
  const parts = barcode.substring(4).split(':')
  const data = parts[0]
  const checksum = parts[1]
  
  // Verify checksum
  const expectedChecksum = crypto.createHash('md5').update(data).digest('hex').substring(0, 4)
  if (checksum !== expectedChecksum) {
    throw new Error('Invalid barcode checksum')
  }
  
  return data
}

// Hex encoding
export function encodeHex(data: string): string {
  return Buffer.from(data, 'utf8').toString('hex')
}

export function decodeHex(encoded: string): string {
  return Buffer.from(encoded, 'hex').toString('utf8')
}

// Binary encoding
export function encodeBinary(data: string): string {
  return Buffer.from(data, 'utf8').reduce((acc, byte) => 
    acc + byte.toString(2).padStart(8, '0'), ''
  )
}

export function decodeBinary(binary: string): string {
  const bytes = binary.match(/.{1,8}/g) || []
  return Buffer.from(bytes.map(b => parseInt(b, 2))).toString('utf8')
}
