import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import * as speakeasy from 'speakeasy'

export async function POST() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Generate a secret
    const secret = speakeasy.generateSecret({
      name: `Phishing Detection System (${user.email})`,
    })

    // Store the secret in the database (temporarily, until verified)
    await supabase
      .from('profiles')
      .update({ two_factor_secret: secret.base32 })
      .eq('id', user.id)

    return NextResponse.json({
      secret: secret.base32,
      qrCode: secret.otpauth_url,
    })
  } catch (error) {
    console.error('2FA setup error:', error)
    return NextResponse.json(
      { error: 'An error occurred during 2FA setup' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { token } = await request.json()
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the secret from database
    const { data: profile } = await supabase
      .from('profiles')
      .select('two_factor_secret')
      .eq('id', user.id)
      .single()

    if (!profile?.two_factor_secret) {
      return NextResponse.json(
        { error: '2FA not initiated' },
        { status: 400 }
      )
    }

    // Verify the token
    const verified = speakeasy.totp.verify({
      secret: profile.two_factor_secret,
      encoding: 'base32',
      token,
    })

    if (!verified) {
      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 400 }
      )
    }

    // Enable 2FA
    await supabase
      .from('profiles')
      .update({ two_factor_enabled: true })
      .eq('id', user.id)

    // Log the activity
    await supabase.from('activity_logs').insert({
      user_id: user.id,
      action: '2fa_enabled',
      details: {},
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
      user_agent: request.headers.get('user-agent'),
    })

    return NextResponse.json({ message: '2FA enabled successfully' })
  } catch (error) {
    console.error('2FA verification error:', error)
    return NextResponse.json(
      { error: 'An error occurred during 2FA verification' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Disable 2FA
    await supabase
      .from('profiles')
      .update({
        two_factor_enabled: false,
        two_factor_secret: null,
      })
      .eq('id', user.id)

    // Log the activity
    await supabase.from('activity_logs').insert({
      user_id: user.id,
      action: '2fa_disabled',
      details: {},
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
      user_agent: request.headers.get('user-agent'),
    })

    return NextResponse.json({ message: '2FA disabled successfully' })
  } catch (error) {
    console.error('2FA disable error:', error)
    return NextResponse.json(
      { error: 'An error occurred while disabling 2FA' },
      { status: 500 }
    )
  }
}
