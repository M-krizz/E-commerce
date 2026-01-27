import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyTOTPToken } from '@/lib/mfa'

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()
    
    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 })
    }
    
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Get user's TOTP secret
    const { data: profile } = await supabase
      .from('profiles')
      .select('totp_secret')
      .eq('id', user.id)
      .single()
    
    if (!profile?.totp_secret) {
      return NextResponse.json({ error: 'TOTP not set up' }, { status: 400 })
    }
    
    // Verify the token
    const isValid = verifyTOTPToken(token, profile.totp_secret)
    
    // Log verification attempt
    await supabase.from('activity_logs').insert({
      user_id: user.id,
      action: 'totp_verified',
      details: { success: isValid },
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
      user_agent: request.headers.get('user-agent'),
    })
    
    return NextResponse.json({ valid: isValid })
  } catch (error) {
    console.error('TOTP verification error:', error)
    return NextResponse.json(
      { error: 'Failed to verify TOTP' },
      { status: 500 }
    )
  }
}
