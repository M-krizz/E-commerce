import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateEmailOTP } from '@/lib/mfa'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    console.log('DEBUG: /api/auth/login called', { email })

    if (!email || !password) {
      console.log('DEBUG: Missing email or password')
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // First verify credentials
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    console.log('DEBUG: signInWithPassword', { data, error })

    if (error) {
      console.log('DEBUG: Auth error', error)
      return NextResponse.json({ error: error.message }, { status: 401 })
    }

    // Get user profile to check MFA settings
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single()
    console.log('DEBUG: profile fetch', { profile, profileError })

    // Check if user has MFA enabled
    const mfaEnabled = profile?.email_otp_enabled || profile?.totp_enabled || false
    
    if (mfaEnabled) {
      // Generate and send email OTP
      const otp = generateEmailOTP()
      
      // Store OTP in database (in production, use Redis with TTL)
      await supabase.from('email_otps').insert({
        user_id: data.user.id,
        otp,
        expires_at: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      })

      // Log the MFA challenge
      await supabase.from('activity_logs').insert({
        user_id: data.user.id,
        action: 'mfa_challenge_sent',
        details: { email, method: 'email_otp' },
        ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
        user_agent: request.headers.get('user-agent'),
      })

      // Return MFA required response
      return NextResponse.json({
        mfaRequired: true,
        user: {
          id: data.user.id,
          email: data.user.email,
          role: profile?.role || 'user',
        },
        message: 'MFA verification required. Check your email for OTP.',
      })
    }

    // If no MFA, complete login normally
    await supabase.from('activity_logs').insert({
      user_id: data.user.id,
      action: 'user_login',
      details: { email },
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
      user_agent: request.headers.get('user-agent'),
    })

    return NextResponse.json({
      user: {
        ...data.user,
        role: profile?.role || 'user',
      },
      session: data.session,
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    )
  }
}
