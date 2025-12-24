import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import type { Database } from '@/types/database'

type Profile = Database['public']['Tables']['profiles']['Row']
type ProjectSection = Database['public']['Tables']['project_sections']['Row']
type ProjectSectionInsert = Database['public']['Tables']['project_sections']['Insert']
type ProjectSectionUpdate = Database['public']['Tables']['project_sections']['Update']

/**
 * GET /api/sections
 * Fetch sections for a specific project
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

    // Fetch sections for the project
    const { data: sections, error } = await supabase
      .from('project_sections')
      .select('*')
      .eq('project_id', projectId)
      .order('sort_order', { ascending: true })

    if (error) {
      console.error('Error fetching sections:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ sections })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Failed to fetch sections' }, { status: 500 })
  }
}

/**
 * POST /api/sections
 * Create a new section within a project
 * Body: { projectId, name, description?, code?, colorHex? }
 */
export async function POST(request: Request) {
  const supabase = await createClient()
  
  try {
    const body = await request.json()
    
    // Get the user
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!body.projectId || !body.name) {
      return NextResponse.json(
        { error: 'projectId and name are required' }, 
        { status: 400 }
      )
    }

    // Verify the project belongs to the user's organization
    const { data: project } = await supabase
      .from('projects')
      .select('id, organization_id')
      .eq('id', body.projectId)
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

    // Get the max sort_order for this project's sections
    const { data: maxOrder } = await supabase
      .from('project_sections')
      .select('sort_order')
      .eq('project_id', body.projectId)
      .order('sort_order', { ascending: false })
      .limit(1)
      .maybeSingle()

    const nextSortOrder = ((maxOrder as any)?.sort_order || 0) + 1

    // Validate section_type (removed 'summary' as it's calculated automatically)
    const validSectionTypes = ['preliminary', 'pre_work', 'demolition', 'main_work', 'after_care']
    const sectionType = body.sectionType || 'main_work'
    
    if (!validSectionTypes.includes(sectionType)) {
      return NextResponse.json(
        { 
          error: `Invalid section type: "${sectionType}". Valid types are: ${validSectionTypes.join(', ')}` 
        },
        { status: 400 }
      )
    }

    // Create the section - include organization_id
    const sectionData = {
      project_id: body.projectId,
      organization_id: (project as any).organization_id, // Add this!
      name: body.name,
      description: body.description || null,
      code: body.code || null,
      color_hex: body.colorHex || '#3B82F6',
      section_type: sectionType,
      sort_order: nextSortOrder,
    }

    console.log('Inserting section data:', sectionData) // Debug

    const { data: section, error } = await supabase
      .from('project_sections')
      .insert(sectionData as any)
      .select()
      .single()

    if (error) {
      console.error('Error creating section:', error)
      
      // Handle enum value errors
      if (error.message?.includes('invalid input value for enum')) {
        return NextResponse.json(
          { 
            error: `Invalid section type "${sectionType}". The database enum may be missing this value. Please run migration 019_ensure_all_section_type_enums.sql in Supabase SQL Editor to add missing enum values.`,
            details: error.message 
          },
          { status: 500 }
        )
      }
      
      // Handle duplicate key errors (unique constraint violations)
      // Note: Section names can now be reused, but codes may still be unique
      if (error.code === '23505' || error.message?.includes('duplicate key') || error.message?.includes('unique constraint')) {
        // Only check for code constraint (names can be duplicated)
        if (error.message?.includes('unique_section_code_per_project')) {
          return NextResponse.json(
            { 
              error: `A section with the code "${body.code}" already exists in this project. Please choose a different code or leave it blank.`
            },
            { status: 409 }
          )
        }
        return NextResponse.json(
          { 
            error: `A section with this code already exists in this project. Please choose a different code.`
          },
          { status: 409 }
        )
      }
      
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ section }, { status: 201 })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Failed to create section' }, { status: 500 })
  }
}

/**
 * PATCH /api/sections
 * Update an existing section
 * Body: { sectionId, name?, description?, code?, colorHex?, sortOrder? }
 */
export async function PATCH(request: Request) {
  const supabase = await createClient()
  
  try {
    const body = await request.json()
    
    // Get the user
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!body.sectionId) {
      return NextResponse.json({ error: 'sectionId is required' }, { status: 400 })
    }

    // Get the section and verify ownership
    const { data: section } = await supabase
      .from('project_sections')
      .select('*, projects!inner(organization_id)')
      .eq('id', body.sectionId)
      .single()

    if (!section) {
      return NextResponse.json({ error: 'Section not found' }, { status: 404 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('user_id', user.id)
      .maybeSingle() as { data: Profile | null }

    if (profile?.organization_id !== (section as any).projects.organization_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Build update object with only provided fields
    const updateData: any = {}
    if (body.name !== undefined) updateData.name = body.name
    if (body.description !== undefined) updateData.description = body.description
    if (body.code !== undefined) updateData.code = body.code
    if (body.colorHex !== undefined) updateData.color_hex = body.colorHex
    if (body.sectionType !== undefined) updateData.section_type = body.sectionType
    if (body.sortOrder !== undefined) updateData.sort_order = body.sortOrder

    // Update the section
    const { data: updatedSection, error } = await supabase
      .from('project_sections')
      // @ts-ignore - section_type may not be in generated types yet
      .update(updateData)
      .eq('id', body.sectionId)
      .select()
      .single()

    if (error) {
      console.error('Error updating section:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ section: updatedSection })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Failed to update section' }, { status: 500 })
  }
}

/**
 * DELETE /api/sections
 * Delete a section
 * Query params: sectionId (required)
 */
export async function DELETE(request: Request) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const sectionId = searchParams.get('sectionId')

  try {
    // Get the user
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!sectionId) {
      return NextResponse.json({ error: 'sectionId is required' }, { status: 400 })
    }

    // Get the section and verify ownership
    const { data: section } = await supabase
      .from('project_sections')
      .select('*, projects!inner(organization_id)')
      .eq('id', sectionId)
      .single()

    if (!section) {
      return NextResponse.json({ error: 'Section not found' }, { status: 404 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('user_id', user.id)
      .maybeSingle() as { data: Profile | null }

    if (profile?.organization_id !== (section as any).projects.organization_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Delete the section (BQ items will have section_id set to NULL via ON DELETE SET NULL)
    const { error } = await supabase
      .from('project_sections')
      .delete()
      .eq('id', sectionId)

    if (error) {
      console.error('Error deleting section:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Failed to delete section' }, { status: 500 })
  }
}

