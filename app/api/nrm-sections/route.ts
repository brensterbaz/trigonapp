import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('nrm_sections')
      .select('*')
      .order('sort_order')

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ sections: data })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch sections' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/nrm-sections
 * Create a new NRM2 section (admin only)
 */
export async function POST(request: Request) {
  const supabase = await createClient()

  try {
    const body = await request.json()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('user_id', user.id)
      .single()

    if (!(profile as any)?.is_admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Validate required fields
    if (!body.code || !body.title) {
      return NextResponse.json(
        { error: 'Code and title are required' },
        { status: 400 }
      )
    }

    // Get max sort_order to append new section at the end
    const { data: maxOrder } = await supabase
      .from('nrm_sections')
      .select('sort_order')
      .order('sort_order', { ascending: false })
      .limit(1)
      .maybeSingle()

    const nextSortOrder = ((maxOrder as any)?.sort_order || 0) + 1

    // Create the section
    const { data: section, error } = await supabase
      .from('nrm_sections')
      .insert({
        code: body.code.trim(),
        title: body.title.trim(),
        description: body.description?.trim() || null,
        sort_order: body.sort_order || nextSortOrder,
      } as any)
      .select()
      .single()

    if (error) {
      console.error('Database error creating section:', error)
      // Check for unique constraint violation
      if (error.code === '23505') {
        return NextResponse.json(
          { error: `A section with code "${body.code}" already exists` },
          { status: 409 }
        )
      }
      return NextResponse.json(
        { error: error.message, details: error },
        { status: 500 }
      )
    }

    console.log('Section created successfully:', section)
    return NextResponse.json({ section }, { status: 201 })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Failed to create section' }, { status: 500 })
  }
}

