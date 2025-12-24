import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import type { Database } from '@/types/database'

type Profile = Database['public']['Tables']['profiles']['Row']

export async function GET(request: Request) {
  const supabase = await createClient()
  
  try {
    // Get the user's organization
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('user_id', user.id)
      .maybeSingle() as { data: Profile | null }

    const orgId = profile?.organization_id

    if (!orgId) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Fetch all projects for this organization
    const { data: projects, error } = await supabase
      .from('projects')
      .select('*')
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching projects:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ projects })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 })
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

    // Get the user's organization
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('user_id', user.id)
      .maybeSingle() as { data: Profile | null }

    const orgId = profile?.organization_id

    if (!orgId) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Create the project
    const { data: project, error } = await supabase
      .from('projects')
      .insert({
        organization_id: orgId,
        created_by: user.id,
        name: body.name,
        code: body.code || null,
        description: body.description || null,
        breakdown_structure: body.breakdown_structure || 'work_sectional',
        client_name: body.client_name || null,
        location: body.location || null,
        contract_value: body.contract_value || null,
        tender_deadline: body.tender_deadline || null,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating project:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ project }, { status: 201 })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 })
  }
}

