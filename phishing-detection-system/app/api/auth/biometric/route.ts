import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { simulateBiometric } from '@/lib/mfa'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Simulate biometric verification
    const success = await simulateBiometric(user.id)
    
    // Log biometric attempt
    await supabase.from('activity_logs').insert({
      user_id: user.id,
      action: 'biometric_verification',
      details: { success },
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
      user_agent: request.headers.get('user-agent'),
    })
    
    return NextResponse.json({ success })
  } catch (error) {
    console.error('Biometric verification error:', error)
    return NextResponse.json(
      { error: 'Failed to verify biometric' },
      { status: 500 }
    )
  }
}
