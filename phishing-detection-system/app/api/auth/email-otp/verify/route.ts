import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { consumeEmailOTP } from '@/lib/mfa'

export async function POST(request: NextRequest) {
  try {
    const { otp } = await request.json()
    
    if (!otp) {
      return NextResponse.json({ error: 'OTP is required' }, { status: 400 })
    }
    
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const isValid = consumeEmailOTP(user.id, otp)
    
    // Log OTP verification attempt
    await supabase.from('activity_logs').insert({
      user_id: user.id,
      action: 'email_otp_verified',
      details: { success: isValid },
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
      user_agent: request.headers.get('user-agent'),
    })
    
    return NextResponse.json({ valid: isValid })
  } catch (error) {
    console.error('Email OTP verification error:', error)
    return NextResponse.json(
      { error: 'Failed to verify OTP' },
      { status: 500 }
    )
  }
}
