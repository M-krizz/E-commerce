import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { SupabaseClient } from '@supabase/supabase-js'

async function checkAdmin(supabase: SupabaseClient) {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { isAdmin: false, user: null }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  return {
    isAdmin: profile?.role === 'admin',
    user,
  }
}

export async function GET() {
  try {
    const supabase = await createClient()
    const { isAdmin } = await checkAdmin(supabase)

    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get total users count
    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })

    // Get total scans count
    const { count: totalScans } = await supabase
      .from('scans')
      .select('*', { count: 'exact', head: true })

    // Get phishing detections count
    const { count: phishingDetections } = await supabase
      .from('scans')
      .select('*', { count: 'exact', head: true })
      .eq('is_phishing', true)

    // Get recent scans
    const { data: recentScans } = await supabase
      .from('scans')
      .select('*, profiles(email)')
      .order('created_at', { ascending: false })
      .limit(10)

    // Get scans by type
    const { data: scansByType } = await supabase
      .from('scans')
      .select('type')

    const urlScans = scansByType?.filter(s => s.type === 'url').length || 0
    const emailScans = scansByType?.filter(s => s.type === 'email').length || 0

    return NextResponse.json({
      totalUsers: totalUsers || 0,
      totalScans: totalScans || 0,
      phishingDetections: phishingDetections || 0,
      urlScans,
      emailScans,
      recentScans: recentScans || [],
    })
  } catch (error) {
    console.error('Fetch stats error:', error)
    return NextResponse.json(
      { error: 'An error occurred while fetching statistics' },
      { status: 500 }
    )
  }
}
