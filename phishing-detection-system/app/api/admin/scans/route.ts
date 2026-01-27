import { NextRequest, NextResponse } from 'next/server'
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

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { isAdmin } = await checkAdmin(supabase)

    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get('type')
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')

    let query = supabase
      .from('scans')
      .select('*, profiles(email)', { count: 'exact' })
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

    return NextResponse.json({
      scans,
      total: count,
      limit,
      offset,
    })
  } catch (error) {
    console.error('Fetch scans error:', error)
    return NextResponse.json(
      { error: 'An error occurred while fetching scans' },
      { status: 500 }
    )
  }
}
