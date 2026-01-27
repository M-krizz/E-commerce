import crypto from 'crypto'

// AES-256-GCM for symmetric encryption
const ALGORITHM = 'aes-256-gcm'
const KEY_LENGTH = 32 // 256 bits
const IV_LENGTH = 16 // 128 bits
const TAG_LENGTH = 16 // 128 bits

// Generate a secure random key
export function generateEncryptionKey(): string {
  return crypto.randomBytes(KEY_LENGTH).toString('hex')
}

// Encrypt data with AES-256-GCM
export function encrypt(data: string, keyHex: string): { encrypted: string; iv: string; tag: string } {
  const key = Buffer.from(keyHex, 'hex')
  const iv = crypto.randomBytes(IV_LENGTH)
  
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
  cipher.setAAD(Buffer.from('phishing-detection'))
  
  let encrypted = cipher.update(data, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  
  const tag = cipher.getAuthTag()
  
  return {
    encrypted,
    iv: iv.toString('hex'),
    tag: tag.toString('hex')
  }
}

// Decrypt data with AES-256-GCM
export function decrypt(encryptedData: string, keyHex: string, ivHex: string, tagHex: string): string {
  const key = Buffer.from(keyHex, 'hex')
  const iv = Buffer.from(ivHex, 'hex')
  const tag = Buffer.from(tagHex, 'hex')
  
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
  decipher.setAAD(Buffer.from('phishing-detection'))
  decipher.setAuthTag(tag)
  
  let decrypted = decipher.update(encryptedData, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  
  return decrypted
}

// RSA for asymmetric encryption (key exchange simulation)
export function generateRSAKeyPair(): { publicKey: string; privateKey: string } {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
  })
  return { publicKey, privateKey }
}

// Encrypt with RSA public key
export function rsaEncrypt(data: string, publicKey: string): string {
  const encrypted = crypto.publicEncrypt(publicKey, Buffer.from(data))
  return encrypted.toString('base64')
}

// Decrypt with RSA private key
export function rsaDecrypt(encryptedData: string, privateKey: string): string {
  const decrypted = crypto.privateDecrypt(privateKey, Buffer.from(encryptedData, 'base64'))
  return decrypted.toString('utf8')
}

// Hybrid encryption: RSA + AES for large data
export function hybridEncrypt(data: string, rsaPublicKey: string): {
  encryptedKey: string
  encryptedData: { encrypted: string; iv: string; tag: string }
} {
  const aesKey = generateEncryptionKey()
  const encryptedData = encrypt(data, aesKey)
  const encryptedKey = rsaEncrypt(aesKey, rsaPublicKey)
  
  return { encryptedKey, encryptedData }
}

// Hybrid decryption
export function hybridDecrypt(
  encryptedKey: string,
  encryptedData: { encrypted: string; iv: string; tag: string },
  rsaPrivateKey: string
): string {
  const aesKey = rsaDecrypt(encryptedKey, rsaPrivateKey)
  return decrypt(encryptedData.encrypted, aesKey, encryptedData.iv, encryptedData.tag)
}
