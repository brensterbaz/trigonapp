import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import type { Database } from '@/types/database'

type Profile = Database['public']['Tables']['profiles']['Row']
type BQItemInsert = Database['public']['Tables']['bill_of_quantities']['Insert']

/**
 * GET /api/bq-items
 * Fetch BQ items for a project, optionally filtered by section
 * Query params: projectId (required), sectionId (optional)
 */
export async function GET(request: Request) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const projectId = searchParams.get('projectId')
  const sectionId = searchParams.get('sectionId')

  try {
    // Get the user
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!projectId) {
      return NextResponse.json({ error: 'projectId is required' }, { status: 400 })
    }

    // Verify the project belongs to the user's organization
    const { data: project } = await supabase
      .from('projects')
      .select('id, organization_id')
      .eq('id', projectId)
      .single()

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('user_id', user.id)
      .maybeSingle() as { data: Profile | null }

    if (profile?.organization_id !== (project as any).organization_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Build query
    let query = supabase
      .from('bill_of_quantities')
      .select('*, nrm_rules(*), project_sections(*)')
      .eq('project_id', projectId)
      .order('sort_order', { ascending: true })

    // Filter by section if provided
    if (sectionId) {
      query = query.eq('section_id', sectionId)
    }

    const { data: bqItems, error } = await query

    if (error) {
      console.error('Error fetching BQ items:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ bqItems })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Failed to fetch BQ items' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const supabase = await createClient()
  
  try {
    const body = await request.json()
    
    // Get the user
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify the project belongs to the user's organization
    const { data: project } = await supabase
      .from('projects')
      .select('id, organization_id')
      .eq('id', body.project_id)
      .single()

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('user_id', user.id)
      .maybeSingle() as { data: Profile | null }

    if (profile?.organization_id !== (project as any).organization_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // If section_id is provided, verify it belongs to this project
    if (body.section_id) {
      const { data: section } = await supabase
        .from('project_sections')
        .select('id')
        .eq('id', body.section_id)
        .eq('project_id', body.project_id)
        .maybeSingle()

      if (!section) {
        return NextResponse.json({ error: 'Section not found or does not belong to this project' }, { status: 400 })
      }
    }

    // Get the max sort_order for this project
    const { data: maxOrder } = await supabase
      .from('bill_of_quantities')
      .select('sort_order')
      .eq('project_id', body.project_id)
      .order('sort_order', { ascending: false })
      .limit(1)
      .maybeSingle()

    const nextSortOrder = ((maxOrder as any)?.sort_order || 0) + 1

    // Validate required fields
    if (!body.unit || body.unit.trim() === '') {
      return NextResponse.json(
        { error: 'Unit is required. Please ensure the selected NRM2 rule has a unit, or contact support.' },
        { status: 400 }
      )
    }

    // Create the BQ item
    const bqData = {
      project_id: body.project_id,
      nrm_rule_id: body.nrm_rule_id,
      quantity: body.quantity,
      unit: body.unit.trim(), // Ensure unit is not empty
      rate: body.rate || null,
      description_custom: body.description_custom || null,
      notes: body.notes || null,
      section_id: body.section_id || null,
      sort_order: nextSortOrder,
    }
    const { data: bqItem, error } = await supabase
      .from('bill_of_quantities')
      .insert(bqData as any)
      .select()
      .single()

    if (error) {
      console.error('Error creating BQ item:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ bqItem }, { status: 201 })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Failed to create BQ item' }, { status: 500 })
  }
}

