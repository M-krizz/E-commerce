import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateEmailOTP, storeEmailOTP } from '@/lib/mfa'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Generate and store OTP
    const otp = generateEmailOTP()
    storeEmailOTP(user.id, otp)
    
    // Log OTP generation
    await supabase.from('activity_logs').insert({
      user_id: user.id,
      action: 'email_otp_generated',
      details: { method: 'email' },
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
      user_agent: request.headers.get('user-agent'),
    })
    
    // In production, send email via service like SendGrid
    console.log(`Email OTP for ${user.email}: ${otp}`)
    
    return NextResponse.json({ 
      message: 'OTP sent to your email',
      // For demo only: include OTP in response
      otp: process.env.NODE_ENV === 'development' ? otp : undefined
    })
  } catch (error) {
    console.error('Email OTP error:', error)
    return NextResponse.json(
      { error: 'Failed to generate OTP' },
      { status: 500 }
    )
  }
}
