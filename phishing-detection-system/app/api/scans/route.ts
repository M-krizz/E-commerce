import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkPhishingURL, checkPhishingEmail } from '@/lib/phishing-detection'
import { encrypt, decrypt, generateEncryptionKey } from '@/lib/encryption'
import { signData, verifySignedData, sha256 } from '@/lib/hashing'
import { encodeBase64, decodeBase64 } from '@/lib/encoding'

async function checkPhishingUrlWithMl(url: string) {
  const mlBaseUrl = process.env.PHISHING_ML_URL
  if (!mlBaseUrl) return null

  const endpoint = `${mlBaseUrl.replace(/\/$/, '')}/predict?feature=${encodeURIComponent(url)}`
  const res = await fetch(endpoint, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  })

  if (!res.ok) return null

  const data = (await res.json()) as { result?: unknown }
  const textResult = typeof data?.result === 'string' ? data.result : ''
  const looksPhishing = /phishing/i.test(textResult)

  return {
    isPhishing: looksPhishing,
    score: looksPhishing ? 80 : 10,
    reasons: [
      `ML model verdict: ${textResult || 'Unknown'}`,
      `ML endpoint: ${mlBaseUrl}`,
    ],
    timestamp: new Date().toISOString(),
    model: 'ml' as const,
  }
}

async function runScan(type: 'url' | 'email', content: string) {
  if (type === 'email') {
    return { ...checkPhishingEmail(content), model: 'heuristic' as const }
  }

  try {
    const mlResult = await checkPhishingUrlWithMl(content)
    if (mlResult) return mlResult
  } catch {
    // ignore and fallback
  }

  return { ...checkPhishingURL(content), model: 'heuristic' as const }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { type, content } = await request.json()

    if (!type || !content) {
      return NextResponse.json(
        { error: 'Type and content are required' },
        { status: 400 }
      )
    }

    if (type !== 'url' && type !== 'email') {
      return NextResponse.json(
        { error: 'Type must be either "url" or "email"' },
        { status: 400 }
      )
    }

    // Perform the scan
    const result = await runScan(type, content)

    // Encrypt sensitive scan data
    const encryptionKey = generateEncryptionKey()
    const encryptedContent = encrypt(content, encryptionKey)
    
    // Create digital signature of the scan result
    const signatureData = signData({
      type,
      content: content.substring(0, 100), // Only sign first 100 chars for demo
      result: result,
      timestamp: new Date().toISOString()
    }, process.env.JWT_SECRET || 'default-secret')
    
    // Store scan with encrypted content and signature
    const { data: scan, error: scanError } = await supabase
      .from('scans')
      .insert({
        user_id: user.id,
        type,
        content: encodeBase64(JSON.stringify(encryptedContent)), // Store encrypted content as base64
        is_phishing: result.isPhishing,
        score: result.score,
        reasons: result.reasons,
        signature: JSON.stringify(signatureData),
        encryption_key: encryptionKey, // In production, encrypt this key with user's public key
      })
      .select()
      .single()

    if (scanError) {
      console.error('Database error:', scanError)
      return NextResponse.json(
        { error: 'Failed to save scan result' },
        { status: 500 }
      )
    }

    // Log the activity
    await supabase.from('activity_logs').insert({
      user_id: user.id,
      action: 'scan_performed',
      details: {
        type,
        is_phishing: result.isPhishing,
        score: result.score,
        model: result.model,
      },
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
      user_agent: request.headers.get('user-agent'),
    })

    return NextResponse.json({
      ...result,
      id: scan.id,
    })
  } catch (error) {
    console.error('Scan error:', error)
    return NextResponse.json(
      { error: 'An error occurred during scanning' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get('type')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    let query = supabase
      .from('scans')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (type && (type === 'url' || type === 'email')) {
      query = query.eq('type', type)
    }

    const { data: scans, error, count } = await query

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch scans' },
        { status: 500 }
      )
    }

    // Generate QR code for scan report
    const reportData = {
      id: scans[0].id,
      type: scans[0].type,
      result: scans[0].is_phishing ? 'PHISHING' : 'SAFE',
      score: scans[0].score,
      timestamp: scans[0].created_at
    }
    const qrCode = encodeBase64(JSON.stringify(reportData))
    
    return NextResponse.json({
      scans,
      total: count,
      limit,
      offset,
      qrCode,
      encrypted: true,
      signed: true,
      message: 'Scan report fetched successfully with security features'
    })
  } catch (error) {
    console.error('Fetch scans error:', error)
    return NextResponse.json(
      { error: 'An error occurred while fetching scans' },
      { status: 500 }
    )
  }
}
