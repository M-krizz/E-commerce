import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyTOTPToken } from '@/lib/mfa'

export async function POST(request: NextRequest) {
  try {
    const { otp, method, userId } = await request.json()
    console.log('DEBUG: /api/auth/mfa-complete called', { method, userId })

    if (!otp || !method || !userId) {
      return NextResponse.json(
        { error: 'OTP, method, and userId are required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    let isValid = false

    if (method === 'email_otp') {
      // Get the latest OTP for this user
      const { data: otpRecord, error: otpError } = await supabase
        .from('email_otps')
        .select('*')
        .eq('user_id', userId)
        .eq('used', false)
        .gte('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (otpError || !otpRecord) {
        return NextResponse.json(
          { error: 'Invalid or expired OTP' },
          { status: 401 }
        )
      }

      // Verify the OTP
      isValid = otpRecord.otp === otp

      if (isValid) {
        // Mark OTP as used
        await supabase
          .from('email_otps')
          .update({ used: true })
          .eq('id', otpRecord.id)
      }
    } else if (method === 'totp') {
      // Get user's TOTP secret
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('totp_secret')
        .eq('id', userId)
        .single()

      if (profileError || !profile?.totp_secret) {
        return NextResponse.json(
          { error: 'TOTP not set up' },
          { status: 400 }
        )
      }

      // Verify TOTP token
      isValid = verifyTOTPToken(otp, profile.totp_secret)
    } else if (method === 'biometric') {
      // Simulate biometric verification
      isValid = otp === 'biometric_verified'
    }

    if (!isValid) {
      // Log failed MFA attempt
      await supabase.from('activity_logs').insert({
        user_id: userId,
        action: 'mfa_verification_failed',
        details: { method },
        ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
        user_agent: request.headers.get('user-agent'),
      })

      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 401 }
      )
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    // Log successful MFA verification
    await supabase.from('activity_logs').insert({
      user_id: userId,
      action: 'mfa_verification_success',
      details: { method },
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
      user_agent: request.headers.get('user-agent'),
    })

    // Get the user session
    const { data: { user } } = await supabase.auth.getUser()

    return NextResponse.json({
      success: true,
      user: {
        id: userId,
        email: user?.email || profile?.email,
        role: profile?.role || 'user',
        twoFactorEnabled: true,
      },
      message: 'MFA verification successful',
    })
  } catch (error) {
    console.error('MFA completion error:', error)
    return NextResponse.json(
      { error: 'An error occurred during MFA verification' },
      { status: 500 }
    )
  }
}
