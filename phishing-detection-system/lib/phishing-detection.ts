export interface PhishingCheckResult {
  isPhishing: boolean
  score: number
  reasons: string[]
  timestamp: string
}

// Mock blacklist of known phishing domains
const blacklistedDomains = [
  'phishing-site.com',
  'fake-bank.net',
  'secure-verify.xyz',
  'paypal-confirm.co',
  'amazon-verify.ru',
]

// Suspicious keywords commonly found in phishing
const suspiciousKeywords = [
  'verify your account',
  'confirm your password',
  'update your payment',
  'urgent action required',
  'click here immediately',
  'validate your identity',
  'unauthorized access',
  'suspicious activity',
  'limited time offer',
]

export function checkPhishingURL(url: string): PhishingCheckResult {
  const reasons: string[] = []
  let score = 0

  const trimmedUrl = url.trim()
  const hasScheme = /^https?:\/\//i.test(trimmedUrl)
  const usesHttps = /^https:\/\//i.test(trimmedUrl)
  const urlForParsing = hasScheme ? trimmedUrl : `http://${trimmedUrl}`

  // Check if URL uses HTTPS
  if (!usesHttps) {
    reasons.push('URL does not use HTTPS encryption')
    score += 20
  }

  // Check URL length (overly long URLs are suspicious)
  if (trimmedUrl.length > 75) {
    reasons.push('Suspicious URL length (very long)')
    score += 15
  }

  // Check for blacklisted domains
  try {
    const urlObj = new URL(urlForParsing)
    const domain = urlObj.hostname

    if (blacklistedDomains.some(bl => domain.includes(bl))) {
      reasons.push('Domain found in phishing blacklist')
      score += 40
    }

    // Check for IP address instead of domain
    if (/^\d+\.\d+\.\d+\.\d+$/.test(domain)) {
      reasons.push('URL uses IP address instead of domain name')
      score += 35
    }

    // Check for suspicious subdomains
    const parts = domain.split('.')
    if (parts.length > 3) {
      reasons.push('Suspicious subdomain structure detected')
      score += 10
    }
  } catch {
    reasons.push('Invalid URL format')
    score += 50
  }

  return {
    isPhishing: score >= 50,
    score: Math.min(score, 100),
    reasons: reasons.length > 0 ? reasons : ['URL appears legitimate'],
    timestamp: new Date().toISOString(),
  }
}

export function checkPhishingEmail(content: string): PhishingCheckResult {
  const reasons: string[] = []
  let score = 0

  const lowerContent = content.toLowerCase()

  // Check for suspicious keywords
  suspiciousKeywords.forEach(keyword => {
    if (lowerContent.includes(keyword)) {
      reasons.push(`Contains suspicious phrase: "${keyword}"`)
      score += 15
    }
  })

  // Check for urgency language
  const urgencyIndicators = ['urgent', 'immediate', 'asap', 'now', 'immediately']
  if (urgencyIndicators.some(indicator => lowerContent.includes(indicator))) {
    reasons.push('Contains urgency language often used in phishing')
    score += 10
  }

  // Check for request to click links
  if (lowerContent.includes('click') || lowerContent.includes('link')) {
    reasons.push('Email requests user to click a link')
    score += 5
  }

  // Check for requests to update personal information
  if (
    lowerContent.includes('update') ||
    lowerContent.includes('confirm') ||
    lowerContent.includes('verify')
  ) {
    reasons.push('Email requests to update or verify personal information')
    score += 10
  }

  // Check for financial urgency
  if (
    lowerContent.includes('payment') ||
    lowerContent.includes('billing') ||
    lowerContent.includes('account suspended')
  ) {
    reasons.push('Contains financial or account urgency language')
    score += 15
  }

  // Check for generic greetings
  if (
    lowerContent.includes('dear user') ||
    lowerContent.includes('dear customer') ||
    lowerContent.includes('dear valued user')
  ) {
    reasons.push('Generic greeting (not personalized)')
    score += 10
  }

  return {
    isPhishing: score >= 40,
    score: Math.min(score, 100),
    reasons: reasons.length > 0 ? reasons : ['Email appears legitimate'],
    timestamp: new Date().toISOString(),
  }
}

export function base64Encode(text: string): string {
  return Buffer.from(text).toString('base64')
}

export function base64Decode(encoded: string): string {
  return Buffer.from(encoded, 'base64').toString('utf-8')
}
