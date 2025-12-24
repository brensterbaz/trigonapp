import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import type { Database } from '@/types/database'

type Profile = Database['public']['Tables']['profiles']['Row']

/**
 * GET /api/sections/summaries
 * Fetch section summaries with totals for a specific project
 * Query params: projectId (required)
 */
export async function GET(request: Request) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const projectId = searchParams.get('projectId')

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

    // Fetch section summaries from the view
    const { data: summaries, error } = await supabase
      .from('project_section_summaries')
      .select('*')
      .eq('project_id', projectId)
      .order('sort_order', { ascending: true })

    if (error) {
      console.error('Error fetching section summaries:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Also get unsectioned items total
    const { data: unsectionedData } = await supabase
      .from('bill_of_quantities')
      .select('amount')
      .eq('project_id', projectId)
      .is('section_id', null)

    const unsectionedTotal = unsectionedData?.reduce((sum, item) => {
      return sum + (Number(item.amount) || 0)
    }, 0) || 0

    const unsectionedCount = unsectionedData?.length || 0

    return NextResponse.json({ 
      summaries,
      unsectioned: {
        item_count: unsectionedCount,
        total: unsectionedTotal
      }
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Failed to fetch section summaries' }, { status: 500 })
  }
}

